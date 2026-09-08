import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { useJobs } from './JobContext';
import { useNotifications } from './NotificationContext';

const ChatContext = createContext();

// Helper to deduplicate and merge two thread arrays by ID and message ID
const mergeThreads = (existingList = [], incomingList = []) => {
  const map = new Map();
  (existingList || []).forEach(t => {
    if (t && t.id) map.set(t.id, t);
  });

  (incomingList || []).forEach(inT => {
    if (!inT || !inT.id) return;
    if (!map.has(inT.id)) {
      map.set(inT.id, inT);
    } else {
      const exT = map.get(inT.id);
      // Merge messages by ID
      const msgMap = new Map();
      (exT.messages || []).forEach(m => { if (m?.id) msgMap.set(m.id, m); });
      (inT.messages || []).forEach(m => { if (m?.id) msgMap.set(m.id, m); });
      const mergedMsgs = Array.from(msgMap.values()).sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));

      map.set(inT.id, {
        ...exT,
        ...inT,
        messages: mergedMsgs,
        unreadCounts: {
          candidate: inT.unreadCounts?.candidate ?? exT.unreadCounts?.candidate ?? 0,
          recruiter: inT.unreadCounts?.recruiter ?? exT.unreadCounts?.recruiter ?? 0,
          admin: inT.unreadCounts?.admin ?? exT.unreadCounts?.admin ?? 0
        },
        updatedAt: Math.max(exT.updatedAt || 0, inT.updatedAt || 0)
      });
    }
  });

  return Array.from(map.values()).sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
};

export function ChatProvider({ children }) {
  const { user } = useAuth();
  const { jobs, applications } = useJobs();

  const [activeThreadId, setActiveThreadId] = useState(() => {
    try {
      return sessionStorage.getItem('careonix_active_chat_thread') || null;
    } catch (_) {
      return null;
    }
  });

  const [threads, setThreads] = useState(() => {
    try {
      const saved = localStorage.getItem('careonix_chat_threads');
      if (saved) {
        const parsed = JSON.parse(saved);
        const realOnly = Array.isArray(parsed)
          ? parsed.filter(t => t.id !== 'thread-demo-1' && t.id !== 'thread-admin-recruiter-1')
          : [];
        return realOnly;
      }
    } catch (e) {}
    return [];
  });

  const [blockedCandidates, setBlockedCandidates] = useState(() => {
    try {
      const saved = localStorage.getItem('careonix_blocked_candidates');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  const blockCandidate = (emailOrId) => {
    if (!emailOrId) return;
    const clean = String(emailOrId).toLowerCase().trim();
    if (!blockedCandidates.includes(clean)) {
      const updated = [...blockedCandidates, clean];
      setBlockedCandidates(updated);
      try {
        localStorage.setItem('careonix_blocked_candidates', JSON.stringify(updated));
        window.dispatchEvent(new Event('careonix_chat_update'));
      } catch (e) {}
    }
  };

  const unblockCandidate = (emailOrId) => {
    if (!emailOrId) return;
    const clean = String(emailOrId).toLowerCase().trim();
    const updated = blockedCandidates.filter(c => c !== clean);
    setBlockedCandidates(updated);
    try {
      localStorage.setItem('careonix_blocked_candidates', JSON.stringify(updated));
      window.dispatchEvent(new Event('careonix_chat_update'));
    } catch (e) {}
  };

  const isCandidateBlocked = (emailOrId) => {
    if (!emailOrId) return false;
    const clean = String(emailOrId).toLowerCase().trim();
    return blockedCandidates.includes(clean);
  };

  // Cross-Tab Broadcast Channel
  const broadcastSync = (payload) => {
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const bc = new BroadcastChannel('careonix_chat_bus');
        bc.postMessage({ type: 'CHAT_UPDATED', payload });
        bc.close();
      }
    } catch (e) {}
  };

  // Save to LocalStorage, BroadcastChannel, and Vite Shared Server API
  const saveThreads = (newThreads) => {
    setThreads(newThreads);
    try {
      localStorage.setItem('careonix_chat_threads', JSON.stringify(newThreads));
      window.dispatchEvent(new Event('careonix_chat_update'));
    } catch (e) {}
    broadcastSync(newThreads);

    // Push to server so any other browser/session immediately receives it
    try {
      fetch('/api/shared-messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newThreads)
      }).catch(() => {});
    } catch (e) {}
  };

  // Server Sync: Pull from /api/shared-messages to enable multi-browser / incognito sync
  const syncMessagesFromBackend = async () => {
    try {
      const res = await fetch('/api/shared-messages', {
        headers: { 'Accept': 'application/json' },
        signal: typeof AbortSignal !== 'undefined' && AbortSignal.timeout ? AbortSignal.timeout(2000) : undefined
      }).catch(() => null);

      if (res && res.ok) {
        const serverThreads = await res.json();
        if (Array.isArray(serverThreads)) {
          setThreads(prev => {
            const merged = mergeThreads(prev, serverThreads);
            const prevStr = JSON.stringify(prev);
            const mergedStr = JSON.stringify(merged);
            if (prevStr !== mergedStr) {
              try {
                localStorage.setItem('careonix_chat_threads', mergedStr);
              } catch (_) {}
              return merged;
            }
            return prev;
          });
        }
      }
    } catch (e) {}
  };

  useEffect(() => {
    let bc = null;
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        bc = new BroadcastChannel('careonix_chat_bus');
        bc.onmessage = (event) => {
          if (event.data?.type === 'CHAT_UPDATED' && Array.isArray(event.data.payload)) {
            setThreads(prev => mergeThreads(prev, event.data.payload));
          }
        };
      }
    } catch (e) {}

    const handleSync = () => {
      try {
        const saved = localStorage.getItem('careonix_chat_threads');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) setThreads(prev => mergeThreads(prev, parsed));
        }
        const savedBlocked = localStorage.getItem('careonix_blocked_candidates');
        if (savedBlocked) setBlockedCandidates(JSON.parse(savedBlocked));
      } catch (e) {}
    };

    window.addEventListener('careonix_chat_update', handleSync);
    window.addEventListener('storage', handleSync);

    // Initial server fetch
    syncMessagesFromBackend();

    // Fast polling loop (every 1000ms) so other browsers / incognito windows receive real-time messages
    const timer = setInterval(() => {
      syncMessagesFromBackend();
    }, 1000);

    return () => {
      if (bc) {
        try { bc.close(); } catch (_) {}
      }
      window.removeEventListener('careonix_chat_update', handleSync);
      window.removeEventListener('storage', handleSync);
      clearInterval(timer);
    };
  }, []);

  // Mark thread as read for a specific role
  const markThreadAsRead = (threadId, role) => {
    if (!threadId || !role) return;

    let modified = false;
    const updated = threads.map(t => {
      if (t.id === threadId) {
        const currentUnread = t.unreadCounts?.[role] || 0;
        if (currentUnread > 0) {
          modified = true;
          return {
            ...t,
            unreadCounts: {
              ...(t.unreadCounts || {}),
              [role]: 0
            }
          };
        }
      }
      return t;
    });

    if (modified) {
      saveThreads(updated);
    }
  };

  // Calculate total unread count for a given role / email
  const getTotalUnreadCount = (role, email) => {
    const cleanEmail = (email || user?.email || user?.identifier || '').toLowerCase().trim();

    return (threads || []).reduce((acc, t) => {
      if (role === 'admin') {
        const unread = t.unreadCounts?.admin || 0;
        return acc + unread;
      } else if (role === 'recruiter') {
        const isRecThread =
          (t.recruiterEmail || '').toLowerCase().trim() === cleanEmail ||
          cleanEmail.includes((t.recruiterEmail || '').toLowerCase().trim()) ||
          (user?.company && (t.companyName || '').toLowerCase().trim() === user.company.toLowerCase().trim());
        if (isRecThread) {
          const unread = t.unreadCounts?.recruiter || 0;
          return acc + unread;
        }
      } else if (role === 'candidate') {
        const isCandThread =
          (t.candidateEmail || '').toLowerCase().trim() === cleanEmail ||
          (user?.identifier && (t.candidateEmail || '').toLowerCase().trim() === user.identifier.toLowerCase().trim());
        if (isCandThread) {
          const unread = t.unreadCounts?.candidate || 0;
          return acc + unread;
        }
      }
      return acc;
    }, 0);
  };

  // Helper: Get candidate's eligible recruiters (ALL applied jobs, regardless of applicationMethod)
  const getEligibleRecruitersForCandidate = (candEmail) => {
    const cleanCand = (candEmail || user?.email || user?.identifier || '').toLowerCase().trim();
    if (!cleanCand) return [];

    const candApps = (applications || []).filter(a => {
      const appEmail = (a.candidateEmail || a.email || '').toLowerCase().trim();
      return appEmail === cleanCand;
    });

    const recruiterList = [];
    candApps.forEach(app => {
      const matchedJob = (jobs || []).find(j =>
        String(j.id) === String(app.jobId) ||
        (j.title && app.jobTitle && j.title.toLowerCase().trim() === app.jobTitle.toLowerCase().trim())
      );

      let recruiterEmail = (app.recruiterEmail || app.postedBy || matchedJob?.postedBy || matchedJob?.recruiterEmail || '').toLowerCase().trim();
      const recruiterCompany = matchedJob?.company || app.company || 'Careonix Partner';

      if (!recruiterEmail || !recruiterEmail.includes('@')) {
        if (recruiterEmail) {
          recruiterEmail = `${recruiterEmail.replace(/[^a-z0-9]/gi, '')}@careonix.com`;
        } else if (recruiterCompany) {
          recruiterEmail = `${recruiterCompany.toLowerCase().replace(/[^a-z0-9]/gi, '')}@careonix.com`;
        } else {
          recruiterEmail = 'recruiter@careonix.com';
        }
      }

      const jobId = String(app.jobId || matchedJob?.id || '1');
      if (!recruiterList.some(r => r.recruiterEmail === recruiterEmail && String(r.jobId) === jobId)) {
        recruiterList.push({
          jobId: jobId,
          jobTitle: app.jobTitle || matchedJob?.title || 'Job Application',
          companyName: recruiterCompany,
          recruiterEmail: recruiterEmail,
          recruiterName: recruiterEmail.split('@')[0]
        });
      }
    });

    return recruiterList;
  };

  // Helper: Get recruiter's eligible candidates (Applicants who applied for this recruiter's jobs or company)
  const getEligibleCandidatesForRecruiter = (recEmail) => {
    const cleanRec = (recEmail || user?.email || user?.identifier || '').toLowerCase().trim();
    if (!cleanRec) return [];

    const recCompany = (user?.company || user?.companyName || '').toLowerCase().trim();

    // Find all jobs belonging to this recruiter (by postedBy or company)
    const recruiterJobs = (jobs || []).filter(j => {
      const p = (j.postedBy || '').toLowerCase().trim();
      if (p && (p === cleanRec || cleanRec.includes(p) || p.includes(cleanRec))) return true;
      if (recCompany && (j.company || '').toLowerCase().trim() === recCompany) return true;
      return false;
    });

    const recruiterJobIds = new Set(recruiterJobs.map(j => String(j.id)));
    const recruiterJobTitles = new Set(recruiterJobs.map(j => (j.title || '').toLowerCase().trim()));

    // Eligible applications: applied to recruiter's jobs, matched company, or matched recruiter email
    const eligibleApps = (applications || []).filter(a => {
      const appRecEmail = (a.recruiterEmail || a.postedBy || '').toLowerCase().trim();
      if (appRecEmail && (appRecEmail === cleanRec || cleanRec.includes(appRecEmail) || appRecEmail.includes(cleanRec))) return true;
      if (recCompany && (a.company || '').toLowerCase().trim() === recCompany) return true;
      if (recruiterJobIds.has(String(a.jobId))) return true;
      if (a.jobTitle && recruiterJobTitles.has(a.jobTitle.toLowerCase().trim())) return true;
      return false;
    });

    const seen = new Set();
    const candidateList = [];

    eligibleApps.forEach(a => {
      const candEmail = (a.candidateEmail || a.email || '').toLowerCase().trim();
      const jId = String(a.jobId || '1');
      const dedupeKey = `${candEmail}_${jId}`;
      if (!seen.has(dedupeKey) && candEmail) {
        seen.add(dedupeKey);
        candidateList.push({
          candidateEmail: candEmail,
          candidateName: a.candidateName || a.name || candEmail.split('@')[0] || 'Candidate Applicant',
          jobId: jId,
          jobTitle: a.jobTitle || 'Position',
          companyName: a.company || user?.company || 'CAREONIX Partner'
        });
      }
    });

    return candidateList;
  };

  // Helper: Deterministic Thread ID generator so candidate & recruiter always join the EXACT same thread
  const generateThreadId = (candEmail, recEmail, jobId) => {
    const c = (candEmail || '').toLowerCase().replace(/[^a-z0-9]/gi, '_');
    const r = (recEmail || '').toLowerCase().replace(/[^a-z0-9]/gi, '_');
    const j = String(jobId || 'general').replace(/[^a-z0-9]/gi, '_');
    return `thread_${c}_${r}_${j}`;
  };

  // Initiate or Get Thread for Candidate ↔ Recruiter
  const getOrCreateCandidateRecruiterThread = ({ candidateEmail, candidateName, recruiterEmail, recruiterName, companyName, jobId, jobTitle }) => {
    const cleanCand = (candidateEmail || '').toLowerCase().trim();
    let cleanRec = (recruiterEmail || '').toLowerCase().trim();
    if (!cleanRec || !cleanRec.includes('@')) {
      if (companyName) {
        cleanRec = `${companyName.toLowerCase().replace(/[^a-z0-9]/gi, '')}@careonix.com`;
      } else {
        cleanRec = 'recruiter@careonix.com';
      }
    }
    const cleanJobId = String(jobId || '1');
    const deterministicId = generateThreadId(cleanCand, cleanRec, cleanJobId);

    // Look for existing thread
    let existing = threads.find(t =>
      t.id === deterministicId ||
      (t.type === 'candidate_recruiter' &&
       (t.candidateEmail || '').toLowerCase().trim() === cleanCand &&
       (
         (t.recruiterEmail || '').toLowerCase().trim() === cleanRec ||
         (t.companyName || '').toLowerCase().trim() === (companyName || '').toLowerCase().trim()
       ) &&
       String(t.jobId) === cleanJobId)
    );

    if (existing) return existing;

    const newThread = {
      id: deterministicId,
      type: 'candidate_recruiter',
      candidateEmail: cleanCand,
      candidateName: candidateName || cleanCand.split('@')[0],
      candidateAvatar: '',
      recruiterEmail: cleanRec,
      recruiterName: recruiterName || cleanRec.split('@')[0],
      companyName: companyName || 'Company',
      jobId: cleanJobId,
      jobTitle: jobTitle || 'Job Vacancy',
      messages: [
        {
          id: `m-init-${Date.now()}`,
          sender: 'system',
          senderEmail: 'system',
          text: `🎉 Chat initialized for application "${jobTitle || 'Job Vacancy'}" at ${companyName || 'Company'}.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          timestamp: Date.now()
        }
      ],
      unreadCounts: { candidate: 0, recruiter: 0, admin: 0 },
      updatedAt: Date.now()
    };

    const updated = [newThread, ...threads.filter(t => t.id !== deterministicId)];
    saveThreads(updated);
    return newThread;
  };

  // Initiate or Get Thread for Recruiter ↔ Admin
  const getOrCreateRecruiterAdminThread = (recruiterEmail, recruiterName, companyName) => {
    const cleanRec = (recruiterEmail || user?.email || user?.identifier || '').toLowerCase().trim();
    const threadId = `thread-admin-${cleanRec.replace(/[^a-z0-9]/gi, '_')}`;

    let existing = threads.find(t =>
      t.id === threadId ||
      (t.type === 'recruiter_admin' && (t.recruiterEmail || '').toLowerCase().trim() === cleanRec)
    );

    if (existing) return existing;

    const newThread = {
      id: threadId,
      type: 'recruiter_admin',
      recruiterEmail: cleanRec,
      recruiterName: recruiterName || user?.name || cleanRec.split('@')[0],
      companyName: companyName || user?.company || 'Recruiter Partner',
      adminEmail: 'admin@careonix.com',
      adminName: 'CAREONIX System Admin',
      messages: [
        {
          id: `ma-init-${Date.now()}`,
          sender: 'admin',
          senderEmail: 'admin@careonix.com',
          text: `👋 Welcome to CAREONIX Support Channel! How can System Admin assist your recruitment team today?`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          timestamp: Date.now()
        }
      ],
      unreadCounts: { candidate: 0, recruiter: 0, admin: 0 },
      updatedAt: Date.now()
    };

    const updated = [newThread, ...threads.filter(t => t.id !== threadId)];
    saveThreads(updated);
    return newThread;
  };

  // Helper to open conversation directly from buttons on other pages
  const openConversation = (params) => {
    let thread;
    if (params.type === 'recruiter_admin') {
      thread = getOrCreateRecruiterAdminThread(params.recruiterEmail, params.recruiterName, params.companyName);
    } else {
      thread = getOrCreateCandidateRecruiterThread(params);
    }
    if (thread) {
      setActiveThreadId(thread.id);
      try {
        sessionStorage.setItem('careonix_active_chat_thread', thread.id);
      } catch (_) {}
    }
    return thread;
  };

  // Send Message inside a thread
  const sendMessage = (threadId, text, senderRole, senderEmail, mediaAttachment = null) => {
    if (!threadId || (!text?.trim() && !mediaAttachment)) return;

    const formattedTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const cleanSenderEmail = (senderEmail || user?.email || user?.identifier || '').toLowerCase().trim();
    const cleanText = text ? text.trim() : '';

    const newMsg = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      sender: senderRole, // 'candidate' | 'recruiter' | 'admin'
      senderEmail: cleanSenderEmail,
      text: cleanText,
      time: formattedTime,
      timestamp: Date.now(),
      ...(mediaAttachment || {})
    };

    let targetThread = null;

    const updatedThreads = threads.map(t => {
      if (t.id === threadId) {
        targetThread = t;
        const curUnread = { ...(t.unreadCounts || { candidate: 0, recruiter: 0, admin: 0 }) };

        // Increment unread count for recipients
        if (senderRole === 'recruiter') {
          curUnread.candidate = (curUnread.candidate || 0) + 1;
          curUnread.admin = (curUnread.admin || 0) + 1;
        } else if (senderRole === 'candidate') {
          curUnread.recruiter = (curUnread.recruiter || 0) + 1;
          curUnread.admin = (curUnread.admin || 0) + 1;
        } else if (senderRole === 'admin') {
          curUnread.recruiter = (curUnread.recruiter || 0) + 1;
          curUnread.candidate = (curUnread.candidate || 0) + 1;
        }

        return {
          ...t,
          messages: [...(t.messages || []), newMsg],
          unreadCounts: curUnread,
          updatedAt: Date.now()
        };
      }
      return t;
    });

    saveThreads(updatedThreads);
  };

  return (
    <ChatContext.Provider value={{
      threads,
      activeThreadId,
      setActiveThreadId,
      sendMessage,
      markThreadAsRead,
      getTotalUnreadCount,
      getEligibleRecruitersForCandidate,
      getEligibleCandidatesForRecruiter,
      getOrCreateCandidateRecruiterThread,
      getOrCreateRecruiterAdminThread,
      openConversation,
      blockedCandidates,
      blockCandidate,
      unblockCandidate,
      isCandidateBlocked
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
