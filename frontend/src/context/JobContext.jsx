import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getSettings } from '../utils/settingsManager';
import { isJobExpired, getDefaultDeadlineDate } from '../utils/timeAgo';

export const INITIAL_JOBS = [];

export const INITIAL_APPLICATIONS = [];

const JobContext = createContext(null);

// Helper to deduplicate applications list by Candidate Email + Job ID / Job Title
const deduplicateApps = (appList) => {
  if (!Array.isArray(appList)) return [];
  const map = new Map();

  appList.forEach(app => {
    const emailKey = (app.candidateEmail || app.email || '').toLowerCase().trim();
    const jobKey = (app.jobId || app.jobTitle || '').toString().toLowerCase().trim();
    const key = `${emailKey}_${jobKey}`;

    if (!map.has(key)) {
      map.set(key, app);
    } else {
      const existing = map.get(key);
      const existingTime = existing.id || 0;
      const newTime = app.id || 0;
      if (newTime >= existingTime || app.statusUpdatedAt) {
        map.set(key, { ...existing, ...app, id: existing.id || app.id });
      }
    }
  });

  return Array.from(map.values());
};

export function JobProvider({ children }) {
  const [jobs, setJobs] = useState(() => {
    try {
      const saved = localStorage.getItem('careonix_posted_jobs');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Filter out all hardcoded/dummy initial jobs (id range 1724500001-1724500099)
        const realOnly = Array.isArray(parsed)
          ? parsed.filter(j => {
              const id = Number(j.id);
              return !(id >= 1724500001 && id <= 1724500099);
            })
          : [];
        if (realOnly.length !== parsed.length) {
          try { localStorage.setItem('careonix_posted_jobs', JSON.stringify(realOnly)); } catch (_) {}
        }
        return realOnly;
      }
      return [];
    } catch (e) {
      return [];
    }
  });


  const [applications, setApplications] = useState(() => {
    try {
      const saved = localStorage.getItem('careonix_candidate_applications');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // ─── Auto-Cleanup: Remove polluted / demo / hardcoded entries ───────
          const DEMO_EMAILS = [
            'aditya@gmail.com',
            'candidate@careonix.com',
            'demo@careonix.com',
            'test@careonix.com',
            ''  // no email = orphaned entry, useless
          ];
          const DUMMY_COMPANIES = ['Microsoft', 'Amazon', 'Google', 'Infosys'];

          const clean = parsed.filter(a => {
            const email = (a.candidateEmail || '').toLowerCase().trim();
            // Remove if email is a known demo/hardcoded fallback or blank
            if (DEMO_EMAILS.includes(email)) return false;
            // Remove if company is a hardcoded dummy company
            if (DUMMY_COMPANIES.includes(a.company)) return false;
            return true;
          });

          const deduped = deduplicateApps(clean);
          localStorage.setItem('careonix_candidate_applications', JSON.stringify(deduped));
          return deduped;
        }
      }
      return [];
    } catch (e) {
      return [];
    }
  });

  const { user } = useAuth();
  const currentEmail = (user?.email || '').toLowerCase().trim();

  // Saved jobs mapped strictly per user email: { "user@domain.com": [jobId1, jobId2] }
  const [savedJobsMap, setSavedJobsMap] = useState(() => {
    try {
      // Clear legacy global unassigned saved jobs so old data doesn't pollute any user
      localStorage.removeItem('careonix_saved_jobs');

      const saved = localStorage.getItem('careonix_user_saved_jobs');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          return parsed;
        }
      }
      return {};
    } catch (e) {
      return {};
    }
  });

  // Current logged in user's saved job IDs list
  const savedJobs = currentEmail && Array.isArray(savedJobsMap[currentEmail])
    ? savedJobsMap[currentEmail]
    : [];

  // ─── Real-Time Cross-Tab / Multi-Dashboard Synchronization ────────────────
  const broadcastSync = (type, payload) => {
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const bc = new BroadcastChannel('careonix_jobs_bus');
        bc.postMessage({ type, payload });
        bc.close();
      }
    } catch (e) {}
  };

  useEffect(() => {
    let bc = null;
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        bc = new BroadcastChannel('careonix_jobs_bus');
        bc.onmessage = (event) => {
          const data = event.data;
          if (!data) return;
          if (data.type === 'JOBS_UPDATED' && Array.isArray(data.payload)) {
            setJobs(data.payload);
          } else if (data.type === 'APPLICATIONS_UPDATED' && Array.isArray(data.payload)) {
            setApplications(data.payload);
          } else if (data.type === 'SAVED_JOBS_UPDATED' && data.payload) {
            setSavedJobsMap(data.payload);
          }
        };
      }
    } catch (e) {}

    // Storage Event Listener (Standard cross-tab listener)
    const handleStorage = (e) => {
      try {
        if (e.key === 'careonix_posted_jobs' && e.newValue) {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) setJobs(parsed);
        } else if (e.key === 'careonix_candidate_applications' && e.newValue) {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) setApplications(parsed);
        } else if (e.key === 'careonix_user_saved_jobs' && e.newValue) {
          const parsed = JSON.parse(e.newValue);
          if (parsed && typeof parsed === 'object') setSavedJobsMap(parsed);
        }
      } catch (err) {}
    };
    window.addEventListener('storage', handleStorage);

    // Focus Listener (Immediate refresh when user switches tabs)
    const handleFocus = () => {
      try {
        const jStr = localStorage.getItem('careonix_posted_jobs');
        if (jStr) {
          const parsed = JSON.parse(jStr);
          if (Array.isArray(parsed)) setJobs(parsed);
        }
        const aStr = localStorage.getItem('careonix_candidate_applications');
        if (aStr) {
          const parsed = JSON.parse(aStr);
          if (Array.isArray(parsed)) setApplications(parsed);
        }
        const sStr = localStorage.getItem('careonix_user_saved_jobs');
        if (sStr) {
          const parsed = JSON.parse(sStr);
          if (parsed && typeof parsed === 'object') setSavedJobsMap(parsed);
        }
      } catch (err) {}
    };
    window.addEventListener('focus', handleFocus);

    // Backend & Server Shared Job Sync (Multi-browser, Incognito & Multi-device sync)
    const syncJobsFromBackend = async () => {
      try {
        let incomingJobs = [];

        // 1. Fetch from Vite Central Server (/api/shared-jobs)
        try {
          const sRes = await fetch('/api/shared-jobs', {
            headers: { 'Accept': 'application/json' },
            signal: typeof AbortSignal !== 'undefined' && AbortSignal.timeout ? AbortSignal.timeout(2000) : undefined
          }).catch(() => null);
          if (sRes && sRes.ok) {
            const sData = await sRes.json();
            if (Array.isArray(sData) && sData.length > 0) {
              incomingJobs = [...incomingJobs, ...sData];
            }
          }
        } catch (e) {}

        // 2. Fetch from Java Spring Boot Job Service (port 8081)
        try {
          const res = await fetch('http://localhost:8081/jobs', {
            headers: { 'Accept': 'application/json' },
            signal: typeof AbortSignal !== 'undefined' && AbortSignal.timeout ? AbortSignal.timeout(2000) : undefined
          }).catch(() => null);

          if (res && res.ok) {
            const data = await res.json();
            const rawJobs = Array.isArray(data) ? data : (data.content || []);
            if (rawJobs.length > 0) {
              const backendFormatted = rawJobs.map(j => ({
                id: j.jobId || j.id,
                title: j.jobTitle || j.title,
                company: j.companyName || j.company || 'Careonix Partner',
                location: j.location || 'India',
                type: j.jobType || j.type || 'Full-time',
                salary: j.salaryRange || j.salary || 'Best in Industry',
                experience: j.experienceRequired != null ? `${j.experienceRequired} Yrs` : '0-2 Yrs',
                skills: j.skillsRequired || j.skills || 'General',
                postedBy: j.postedBy || (j.companyName ? `${j.companyName.toLowerCase().replace(/\s+/g, '')}@careonix.com` : 'admin@careonix.com'),
                status: j.status || 'ACTIVE',
                postedDate: 'Recently',
                applyMethod: j.applyMethod || 'careonix'
              }));
              incomingJobs = [...incomingJobs, ...backendFormatted];
            }
          }
        } catch (e) {}

        // Read current local jobs
        let localJobs = [];
        try {
          const saved = localStorage.getItem('careonix_posted_jobs');
          if (saved) localJobs = JSON.parse(saved);
        } catch (e) {}
        if (!Array.isArray(localJobs)) localJobs = [];

        // Filter out dummy/seeded jobs from local storage (id range 1724500001-1724500099)
        localJobs = localJobs.filter(j => {
          const id = Number(j.id);
          return !(id >= 1724500001 && id <= 1724500099);
        });

        // Merge: server/backend jobs first, then overlay local real jobs
        const mergedMap = new Map();
        incomingJobs.forEach(bj => {
          const id = Number(bj.id);
          // Skip dummy seeded jobs from server too
          if (id >= 1724500001 && id <= 1724500099) return;
          mergedMap.set(String(bj.id), bj);
        });
        localJobs.forEach(lj => mergedMap.set(String(lj.id), { ...(mergedMap.get(String(lj.id)) || {}), ...lj }));

        const finalMerged = Array.from(mergedMap.values());
        // Update state always (including when empty, so stale data is cleared)
        setJobs(finalMerged);
        try {
          localStorage.setItem('careonix_posted_jobs', JSON.stringify(finalMerged));
        } catch (e) {}

        // Push merged list to /api/shared-jobs so all browsers stay in sync
        try {
          fetch('/api/shared-jobs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(finalMerged)
          }).catch(() => {});
        } catch (e) {}
      } catch (e) {}
    };

    const syncApplicationsFromBackend = async () => {
      try {
        const res = await fetch('/api/shared-applications', {
          headers: { 'Accept': 'application/json' },
          signal: typeof AbortSignal !== 'undefined' && AbortSignal.timeout ? AbortSignal.timeout(2000) : undefined
        }).catch(() => null);

        if (res && res.ok) {
          const serverApps = await res.json();
          if (Array.isArray(serverApps)) {
            let localApps = [];
            try {
              const saved = localStorage.getItem('careonix_candidate_applications');
              if (saved) localApps = JSON.parse(saved);
            } catch (_) {}
            if (!Array.isArray(localApps)) localApps = [];

            const merged = deduplicateApps([...serverApps, ...localApps]);
            setApplications(prev => {
              if (JSON.stringify(prev) !== JSON.stringify(merged)) {
                try {
                  localStorage.setItem('careonix_candidate_applications', JSON.stringify(merged));
                } catch (_) {}
                return merged;
              }
              return prev;
            });
          }
        }
      } catch (e) {}
    };

    syncJobsFromBackend();
    syncApplicationsFromBackend();

    // Fast Poller (Every 1000ms) to ensure zero-lag instant updates across all browsers
    const timer = setInterval(() => {
      try {
        syncJobsFromBackend();
        syncApplicationsFromBackend();

        const aStr = localStorage.getItem('careonix_candidate_applications');
        if (aStr) {
          setApplications(prev => {
            const curStr = JSON.stringify(prev);
            if (curStr !== aStr) {
              const parsed = JSON.parse(aStr);
              if (Array.isArray(parsed)) return parsed;
            }
            return prev;
          });
        }
      } catch (err) {}
    }, 1200);

    return () => {
      if (bc) {
        try { bc.close(); } catch (e) {}
      }
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('focus', handleFocus);
      clearInterval(timer);
    };
  }, []);

  const updateApplicationStatus = (appId, newStatus) => {
    const todayStr = new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
    const timeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const nowFull = `${todayStr}, ${timeStr}`;

    const targetApp = applications.find(a => a.id === appId);

    const updated = applications.map(app => {
      const isTarget = app.id === appId || (
        targetApp &&
        (app.candidateEmail || '').toLowerCase().trim() === (targetApp.candidateEmail || '').toLowerCase().trim() &&
        (app.jobId || app.jobTitle || '').toString().toLowerCase().trim() === (targetApp.jobId || targetApp.jobTitle || '').toString().toLowerCase().trim()
      );

      if (isTarget) {
        let labelNote = `Updated by you on ${todayStr}`;
        if (newStatus === 'APPLIED') labelNote = 'Status on CAREONIX';
        if (newStatus === 'STATUS UNKNOWN') labelNote = 'Please update when you get any update';

        const newTimelineEvent = {
          title: `Status Updated: ${newStatus.toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}`,
          date: nowFull,
          note: '(Updated by you)'
        };

        const existingTimeline = app.timeline || [{ title: 'Application Submitted', date: app.appliedDateTime || app.appliedDate }];
        
        return {
          ...app,
          status: newStatus,
          statusUpdatedAt: nowFull,
          updatedBy: labelNote,
          timeline: [...existingTimeline, newTimelineEvent]
        };
      }
      return app;
    });

    const cleanApps = deduplicateApps(updated);
    setApplications(cleanApps);
    try {
      localStorage.setItem('careonix_candidate_applications', JSON.stringify(cleanApps));
      fetch('/api/shared-applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanApps)
      }).catch(() => {});
    } catch (e) {}
    broadcastSync('APPLICATIONS_UPDATED', cleanApps);
  };

  const toggleSaveJob = (jobId, userOverride) => {
    const targetEmail = (userOverride?.email || user?.email || '').toLowerCase().trim();
    if (!targetEmail) return;

    const userSaved = Array.isArray(savedJobsMap[targetEmail]) ? savedJobsMap[targetEmail] : [];
    let updatedUserSaved;
    if (userSaved.includes(jobId)) {
      updatedUserSaved = userSaved.filter(id => id !== jobId);
    } else {
      updatedUserSaved = [...userSaved, jobId];
    }

    const updatedMap = {
      ...savedJobsMap,
      [targetEmail]: updatedUserSaved
    };

    setSavedJobsMap(updatedMap);
    try {
      localStorage.setItem('careonix_user_saved_jobs', JSON.stringify(updatedMap));
    } catch (e) {}
    broadcastSync('SAVED_JOBS_UPDATED', updatedMap);
  };

  const updateApplicationStatusByRecruiter = (appId, newStatus, recruiterName = 'Recruiter') => {
    const todayStr = new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
    const timeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const nowFull = `${todayStr}, ${timeStr}`;

    const targetApp = applications.find(a => a.id === appId);

    const updated = applications.map(app => {
      const isTarget = app.id === appId || (
        targetApp &&
        (app.candidateEmail || '').toLowerCase().trim() === (targetApp.candidateEmail || '').toLowerCase().trim() &&
        (app.jobId || app.jobTitle || '').toString().toLowerCase().trim() === (targetApp.jobId || targetApp.jobTitle || '').toString().toLowerCase().trim()
      );

      if (isTarget) {
        const labelNote = `Updated by Recruiter (${recruiterName}) on ${todayStr}`;
        const newTimelineEvent = {
          title: `Status Updated: ${newStatus.toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}`,
          date: nowFull,
          note: `(Updated by Recruiter ${recruiterName})`
        };

        const existingTimeline = app.timeline || [{ title: 'Application Submitted', date: app.appliedDateTime || app.appliedDate }];

        return {
          ...app,
          status: newStatus,
          statusUpdatedAt: nowFull,
          updatedBy: labelNote,
          timeline: [...existingTimeline, newTimelineEvent]
        };
      }
      return app;
    });

    const cleanApps = deduplicateApps(updated);
    setApplications(cleanApps);
    try {
      localStorage.setItem('careonix_candidate_applications', JSON.stringify(cleanApps));
      fetch('/api/shared-applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanApps)
      }).catch(() => {});
    } catch (e) {}
    broadcastSync('APPLICATIONS_UPDATED', cleanApps);
  };

  const addJob = (jobData, publisherUser) => {
    const currencySymbol = jobData.currency === 'USD' ? '$' : '₹';
    let rawSalary = jobData.salary || '8,00,000 - 12,00,000';
    let formattedSalary = rawSalary;

    if (!rawSalary.includes('₹') && !rawSalary.includes('$')) {
      formattedSalary = `${currencySymbol}${rawSalary}`;
    }

    const appMethod = jobData.applicationMethod || (jobData.applyUrl ? 'external' : 'careonix');

    const newJob = {
      id: Date.now(),
      title: jobData.title,
      company: jobData.company || (publisherUser?.company || 'Careonix Partner'),
      location: jobData.location || 'Remote / India',
      currency: jobData.currency || 'INR',
      salary: formattedSalary,
      type: jobData.type || 'Full-time',
      experience: jobData.experience || '1-3 Years',
      lastDateToApply: jobData.lastDateToApply || getDefaultDeadlineDate(30),
      skills: Array.isArray(jobData.skills)
        ? jobData.skills
        : (jobData.skills ? jobData.skills.split(',').map(s => s.trim()).filter(Boolean) : ['Java', 'Spring Boot']),
      applicationMethod: appMethod,
      applyUrl: appMethod === 'external' ? (jobData.applyUrl || '') : '',
      source: appMethod === 'external' ? (jobData.applyUrl ? jobData.applyUrl.replace(/^https?:\/\//, '').split('/')[0] : 'external') : 'careonix.com',
      logoUrl: jobData.logoUrl || null,
      verified: true,
      status: (() => {
        if (isJobExpired(jobData.lastDateToApply)) {
          return 'CLOSED';
        }
        const isPublisherRecruiter = (publisherUser?.accountType || publisherUser?.role || '').toLowerCase() === 'recruiter' || Boolean(publisherUser?.company);
        const accessSettings = getSettings()?.access || {};
        if (isPublisherRecruiter && accessSettings.recruiterCanPostDirectly === false) {
          return 'PENDING';
        }
        return jobData.status || 'ACTIVE';
      })(),
      applications: 0,
      postedBy: publisherUser?.email || 'Admin',
      postedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };

    const updatedJobs = [newJob, ...jobs];
    setJobs(updatedJobs);
    try {
      localStorage.setItem('careonix_posted_jobs', JSON.stringify(updatedJobs));
      fetch('/api/shared-jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedJobs)
      }).catch(() => {});
    } catch (e) {}
    broadcastSync('JOBS_UPDATED', updatedJobs);

    return newJob;
  };

  const updateJob = (jobId, updatedData) => {
    const currencySymbol = updatedData.currency === 'USD' ? '$' : '₹';
    let rawSalary = updatedData.salary || '8,00,000 - 12,00,000';
    let formattedSalary = rawSalary;

    if (!rawSalary.includes('₹') && !rawSalary.includes('$')) {
      formattedSalary = `${currencySymbol}${rawSalary}`;
    }

    const appMethod = updatedData.applicationMethod || (updatedData.applyUrl ? 'external' : 'careonix');

    const updatedJobs = jobs.map(j => {
      if (String(j.id) === String(jobId)) {
        const nextDeadline = updatedData.lastDateToApply !== undefined ? updatedData.lastDateToApply : j.lastDateToApply;
        const isFutureDeadline = !isJobExpired(nextDeadline);
        const wasExpired = isJobExpired(j.lastDateToApply);
        const wasClosed = (j.status || '').toUpperCase() === 'CLOSED';

        // Status transition:
        let nextStatus;
        if (!isFutureDeadline) {
          // Past deadline automatically forces CLOSED status
          nextStatus = 'CLOSED';
        } else if (updatedData.status) {
          nextStatus = updatedData.status.toUpperCase();
        } else if (wasExpired || wasClosed) {
          // If recruiter extends deadline of an expired or closed job to a future date, auto-reopen to ACTIVE
          nextStatus = 'ACTIVE';
        } else {
          nextStatus = (j.status || 'ACTIVE').toUpperCase();
        }

        return {
          ...j,
          title: updatedData.title || j.title,
          company: updatedData.company || j.company,
          location: updatedData.location || j.location,
          currency: updatedData.currency || j.currency,
          salary: formattedSalary,
          type: updatedData.type || j.type,
          experience: updatedData.experience || j.experience,
          lastDateToApply: nextDeadline,
          skills: Array.isArray(updatedData.skills)
            ? updatedData.skills
            : (updatedData.skills ? updatedData.skills.split(',').map(s => s.trim()).filter(Boolean) : j.skills),
          applicationMethod: appMethod,
          applyUrl: appMethod === 'external' ? (updatedData.applyUrl !== undefined ? updatedData.applyUrl : j.applyUrl) : '',
          source: appMethod === 'external' ? (updatedData.applyUrl ? updatedData.applyUrl.replace(/^https?:\/\//, '').split('/')[0] : j.source) : 'careonix.com',
          logoUrl: updatedData.logoUrl !== undefined ? updatedData.logoUrl : j.logoUrl,
          status: nextStatus
        };
      }
      return j;
    });

    setJobs(updatedJobs);
    try {
      localStorage.setItem('careonix_posted_jobs', JSON.stringify(updatedJobs));
      fetch('/api/shared-jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedJobs)
      }).catch(() => {});
    } catch (e) {}
    broadcastSync('JOBS_UPDATED', updatedJobs);
  };

  const updateJobStatus = (jobId, newStatus) => {
    const statusUpper = (newStatus || 'ACTIVE').toUpperCase();
    const updatedJobs = jobs.map(j => {
      if (String(j.id) === String(jobId)) {
        return { ...j, status: statusUpper };
      }
      return j;
    });
    setJobs(updatedJobs);
    try {
      localStorage.setItem('careonix_posted_jobs', JSON.stringify(updatedJobs));
      fetch('/api/shared-jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedJobs)
      }).catch(() => {});
    } catch (e) {}
    broadcastSync('JOBS_UPDATED', updatedJobs);

    // Call backend API if running to ensure DB sync across microservices
    try {
      fetch(`/jobs/${jobId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: statusUpper })
      }).catch(() => {});
      fetch(`http://localhost:8081/jobs/${jobId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: statusUpper })
      }).catch(() => {});
    } catch (e) {}
  };

  const deleteJob = (jobId) => {
    const updatedJobs = jobs.filter(j => String(j.id) !== String(jobId));
    setJobs(updatedJobs);
    try {
      localStorage.setItem('careonix_posted_jobs', JSON.stringify(updatedJobs));
      fetch('/api/shared-jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedJobs)
      }).catch(() => {});
    } catch (e) {}

    const updatedMap = { ...savedJobsMap };
    Object.keys(updatedMap).forEach(key => {
      if (Array.isArray(updatedMap[key])) {
        updatedMap[key] = updatedMap[key].filter(id => String(id) !== String(jobId));
      }
    });
    setSavedJobsMap(updatedMap);

    try {
      localStorage.setItem('careonix_posted_jobs', JSON.stringify(updatedJobs));
      localStorage.setItem('careonix_user_saved_jobs', JSON.stringify(updatedMap));
    } catch (e) {}
    broadcastSync('JOBS_UPDATED', updatedJobs);
    broadcastSync('SAVED_JOBS_UPDATED', updatedMap);

    // Call backend API if running to ensure DB deletion
    try {
      fetch(`/jobs/${jobId}`, { method: 'DELETE' }).catch(() => {});
      fetch(`http://localhost:8081/jobs/${jobId}`, { method: 'DELETE' }).catch(() => {});
    } catch (e) {}
  };

  const applyToJob = (jobId, candidateUser, applicationDetails = {}) => {
    const targetJob = jobs.find(j => j.id === jobId);
    const nowStr = new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
    const nowTimeStr = `${nowStr}, ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;

    const appMethod = targetJob?.applicationMethod || (targetJob?.applyUrl ? 'external' : 'careonix');

    // Strictly use the actual logged-in user's email — never fall back to hardcoded demo values
    const candEmail = (applicationDetails.email || candidateUser?.email || '').toLowerCase().trim();
    const candName = applicationDetails.name || candidateUser?.name || '';

    // Guard: don't create application if we don't know who the user is
    if (!candEmail) return null;

    // Guard: don't allow applications if the job is closed by Recruiter/Admin or deadline has passed
    if (targetJob && ((targetJob.status || '').toUpperCase() === 'CLOSED' || isJobExpired(targetJob.lastDateToApply))) {
      return null;
    }

    const jobKey = (jobId || targetJob?.title || '').toString().toLowerCase().trim();

    const candKey = candEmail.toLowerCase().trim();
    const getScopedVal = (key, def = '') => {
      try { return localStorage.getItem(`careonix_prof_${candKey}_${key}`) || def; } catch (e) { return def; }
    };
    const getScopedJson = (key, def = null) => {
      try {
        const v = localStorage.getItem(`careonix_prof_${candKey}_${key}`);
        return v ? JSON.parse(v) : def;
      } catch (e) { return def; }
    };

    const candPhone = applicationDetails.phone || candidateUser?.phone || getScopedVal('phone', '');
    const candLocation = applicationDetails.location || candidateUser?.location || getScopedVal('location', '');
    const candAbout = applicationDetails.about || getScopedVal('about', '');
    const candSkills = (applicationDetails.skills && applicationDetails.skills.length > 0) ? applicationDetails.skills : getScopedJson('skills', []);
    const candEducation = applicationDetails.education || getScopedJson('education', []);
    const candExperience = applicationDetails.experience || getScopedJson('experience', []);
    const candPreferences = applicationDetails.preferences || getScopedJson('preferences', null);
    const candResumeName = applicationDetails.resumeFileName || candidateUser?.resumeFileName || getScopedVal('resume_name', '');
    const candResumeData = applicationDetails.resumeData || getScopedVal('resume_data', '');
    const candAvatar = applicationDetails.avatar || candidateUser?.avatar || candidateUser?.photoUrl || getScopedVal('avatar', '');

    // Check if application already exists for this candidate & job
    const existingApp = applications.find(a =>
      (a.candidateEmail || '').toLowerCase().trim() === candEmail &&
      (a.jobId || a.jobTitle || '').toString().toLowerCase().trim() === jobKey
    );

    if (existingApp) {
      // Update existing application instead of creating a duplicate entry!
      const updatedApps = applications.map(a => {
        if (a.id === existingApp.id) {
          return {
            ...a,
            applicationMethod: appMethod,
            candidatePhone: candPhone || a.candidatePhone,
            candidateLocation: candLocation || a.candidateLocation,
            candidateAbout: candAbout || a.candidateAbout,
            candidateSkills: (candSkills && candSkills.length > 0) ? candSkills : (a.candidateSkills || []),
            candidateEducation: candEducation || a.candidateEducation,
            candidateExperience: candExperience || a.candidateExperience,
            candidatePreferences: candPreferences || a.candidatePreferences,
            candidateResumeData: candResumeData || a.candidateResumeData,
            candidateAvatar: candAvatar || a.candidateAvatar,
            resumeFileName: candResumeName || a.resumeFileName,
            coverNote: applicationDetails.coverNote || a.coverNote
          };
        }
        return a;
      });
      const cleanApps = deduplicateApps(updatedApps);
      setApplications(cleanApps);
      try {
        localStorage.setItem('careonix_candidate_applications', JSON.stringify(cleanApps));
      } catch (e) {}
      return existingApp;
    }

    const updatedJobs = jobs.map(j => j.id === jobId ? { ...j, applications: (j.applications || 0) + 1 } : j);
    setJobs(updatedJobs);

    const newApp = {
      id: Date.now(),
      jobId,
      jobTitle: targetJob?.title || 'Position',
      company: targetJob?.company || 'Employer',
      location: targetJob?.location || 'India',
      type: targetJob?.type || 'Full-time',
      experience: targetJob?.experience || '1-3 Yrs',
      candidateName: candName,
      candidateEmail: candEmail,
      candidatePhone: candPhone,
      candidateLocation: candLocation,
      candidateAbout: candAbout,
      candidateSkills: candSkills,
      candidateEducation: candEducation,
      candidateExperience: candExperience,
      candidatePreferences: candPreferences,
      candidateResumeData: candResumeData,
      candidateAvatar: candAvatar,
      resumeFileName: candResumeName || 'resume.pdf',
      coverNote: applicationDetails.coverNote || '',
      applicationMethod: appMethod,
      postedBy: targetJob?.postedBy || '',
      recruiterEmail: targetJob?.postedBy || targetJob?.recruiterEmail || '',
      appliedDate: nowStr,
      appliedDateTime: nowTimeStr,
      status: 'APPLIED',
      statusUpdatedAt: null,
      updatedBy: appMethod === 'careonix' ? 'Managed by Recruiter on CAREONIX' : 'Status on CAREONIX',
      redirectUrl: appMethod === 'external' ? (targetJob?.applyUrl || '') : '',
      logoUrl: targetJob?.logoUrl || null,
      timeline: [
        { title: 'Application Submitted', date: nowTimeStr }
      ]
    };

    const updatedApps = deduplicateApps([newApp, ...applications]);
    setApplications(updatedApps);

    try {
      localStorage.setItem('careonix_posted_jobs', JSON.stringify(updatedJobs));
      localStorage.setItem('careonix_candidate_applications', JSON.stringify(updatedApps));
      fetch('/api/shared-applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedApps)
      }).catch(() => {});
    } catch (e) {}
    broadcastSync('JOBS_UPDATED', updatedJobs);
    broadcastSync('APPLICATIONS_UPDATED', updatedApps);

    return newApp;
  };

  const updateJobStatusByAdmin = (jobId, newStatus) => {
    updateJobStatus(jobId, newStatus);
  };

  return (
    <JobContext.Provider value={{
      jobs,
      applications,
      savedJobs,
      toggleSaveJob,
      addJob,
      updateJob,
      deleteJob,
      updateJobStatus,
      updateJobStatusByAdmin,
      applyToJob,
      updateApplicationStatus,
      updateApplicationStatusByRecruiter
    }}>
      {children}
    </JobContext.Provider>
  );
}

export function useJobs() {
  return useContext(JobContext);
}
