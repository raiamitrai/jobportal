import React, { useState } from 'react';
import {
  Users,
  UserCheck,
  CheckCircle2,
  FileText,
  Mail,
  Phone,
  Calendar,
  Briefcase,
  Search,
  Filter,
  ExternalLink,
  ChevronRight,
  User,
  Clock,
  Sparkles,
  X,
  Star,
  MessageSquare
} from 'lucide-react';
import { useJobs } from '../context/JobContext';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { useChat } from '../context/ChatContext';
import { getSettings } from '../utils/settingsManager';

export default function RecruiterApplicationsPage({ setActiveTab }) {
  const { jobs, applications, updateApplicationStatusByRecruiter } = useJobs();
  const { user } = useAuth();
  const { notifyApplicationStatusChange } = useNotifications();
  const { openConversation } = useChat();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedCandidateApp, setSelectedCandidateApp] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  const [appRatings, setAppRatings] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('careonix_app_ratings') || '{}');
    } catch (e) {
      return {};
    }
  });

  const [appNotes, setAppNotes] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('careonix_app_notes') || '{}');
    } catch (e) {
      return {};
    }
  });

  const handleRateCandidate = (appId, rating) => {
    const updated = { ...appRatings, [appId]: rating };
    setAppRatings(updated);
    localStorage.setItem('careonix_app_ratings', JSON.stringify(updated));
    triggerToast(`⭐ Candidate rated ${rating}/5 stars!`);
  };

  const handleSaveNote = (appId, note) => {
    const updated = { ...appNotes, [appId]: note };
    setAppNotes(updated);
    localStorage.setItem('careonix_app_notes', JSON.stringify(updated));
  };

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleStatusChange = (appId, newStatus) => {
    updateApplicationStatusByRecruiter(appId, newStatus, user?.name || 'TechNova Recruiter');

    const matchedApp = (applications || []).find(a => a.id === appId);
    if (matchedApp && notifyApplicationStatusChange) {
      notifyApplicationStatusChange({
        candidateEmail: matchedApp.candidateEmail || 'candidate@careonix.com',
        candidateName: matchedApp.candidateName || 'Candidate',
        jobTitle: matchedApp.jobTitle || 'Position',
        company: matchedApp.company || user?.company || 'Careonix Partner',
        newStatus,
        recruiterEmail: user?.email || 'recruiter@careonix.com',
        isPositive: ['SHORTLISTED', 'INTERVIEW', 'HIRED', 'ACCEPTED', 'OFFER'].includes((newStatus || '').toUpperCase()),
        applyType: 'internal'
      });
    }

    triggerToast(`Updated application status to "${newStatus}". Candidate notified via Bell 🔔 & Email 📧!`);
  };

  const handleOpenChatWithCandidate = (app) => {
    if (!app) return;
    const cleanRec = (user?.email || user?.identifier || '').toLowerCase().trim();
    const cleanCand = (app.candidateEmail || '').toLowerCase().trim();
    if (openConversation) {
      openConversation({
        candidateEmail: cleanCand,
        candidateName: app.candidateName || cleanCand.split('@')[0],
        recruiterEmail: cleanRec,
        recruiterName: user?.name || cleanRec.split('@')[0],
        companyName: user?.company || app.company || 'CAREONIX Partner',
        jobId: app.jobId,
        jobTitle: app.jobTitle
      });
    }
    if (setActiveTab) setActiveTab('messages');
  };

  // Deduplicate applications by candidate Email + Job Title / ID
  const uniqueApps = (() => {
    const map = new Map();
    (applications || []).forEach(app => {
      const emailKey = (app.candidateEmail || '').toLowerCase().trim();
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
  })();

  const recruiterEmail = (user?.email || '').toLowerCase().trim();
  const recruiterIdentifier = (user?.identifier || '').toLowerCase().trim();
  const recruiterCompany = (user?.company || '').toLowerCase().trim();

  // Find recruiter's posted job IDs & Titles
  const recruiterJobIds = new Set(
    (jobs || [])
      .filter(j => {
        const p = (j.postedBy || '').toLowerCase().trim();
        const jComp = (j.company || '').toLowerCase().trim();
        if (p && (p === recruiterEmail || p === recruiterIdentifier)) return true;
        if (recruiterCompany && jComp && jComp === recruiterCompany) return true;
        return false;
      })
      .map(j => String(j.id))
  );

  // Applications strictly for THIS recruiter's posted jobs
  const myRecruiterApps = uniqueApps.filter(app => {
    const appJobId = String(app.jobId || '');
    const appPostedBy = (app.postedBy || app.recruiterEmail || '').toLowerCase().trim();
    const appCompany = (app.company || '').toLowerCase().trim();

    if (recruiterJobIds.has(appJobId)) return true;
    if (appPostedBy && (appPostedBy === recruiterEmail || appPostedBy === recruiterIdentifier)) return true;
    if (recruiterCompany && appCompany && appCompany === recruiterCompany) return true;
    return false;
  });

  const filteredApps = myRecruiterApps.filter(app => {
    const q = searchTerm.toLowerCase().trim();
    const matchSearch = (app.candidateName || '').toLowerCase().includes(q) ||
                        (app.jobTitle || '').toLowerCase().includes(q) ||
                        (app.candidateEmail || '').toLowerCase().includes(q);
    const matchStatus = statusFilter === 'ALL' || app.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', background: '#f8fafc', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed', top: '20px', right: '20px', background: '#10b981', color: '#ffffff',
          padding: '0.9rem 1.4rem', borderRadius: '14px', boxShadow: '0 10px 25px rgba(16,185,129,0.3)',
          display: 'flex', alignItems: 'center', gap: '0.6rem', zIndex: 300, fontWeight: '700', fontSize: '0.9rem'
        }}>
          <CheckCircle2 size={20} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
            Candidate Applicants Pipeline 🧑‍💼
          </h1>
          <p style={{ color: '#64748b', marginTop: '4px', fontSize: '0.9rem' }}>
            Review candidate resumes, evaluate applications, and manage hiring stages. Statuses sync automatically with candidate portal.
          </p>
        </div>

        <span style={{ background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0', padding: '6px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <CheckCircle2 size={15} /> Real-Time Sync Active
        </span>
      </div>

      {/* Filters Bar */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', boxShadow: '0 1px 4px rgba(15,23,42,0.02)' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
          <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Search candidate name, job title, email..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '0.65rem 1rem 0.65rem 2.6rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.86rem', outline: 'none', fontFamily: 'Inter, sans-serif' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748b' }}>Status Stage:</span>
          {['ALL', 'APPLIED', 'SHORTLISTED', 'INTERVIEW', 'OFFER', 'REJECTED'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              style={{
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                border: `1px solid ${statusFilter === st ? '#7c3aed' : '#cbd5e1'}`,
                background: statusFilter === st ? '#f3e8ff' : '#ffffff',
                color: statusFilter === st ? '#7c3aed' : '#475569',
                fontSize: '0.78rem',
                fontWeight: statusFilter === st ? '800' : '600',
                cursor: 'pointer'
              }}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Applications Table */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.25rem 1.5rem', boxShadow: '0 1px 6px rgba(15,23,42,0.03)' }}>
        <div className="table-responsive-wrapper">
          <table style={{ width: '100%', minWidth: '720px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.76rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                <th style={{ padding: '0.75rem 0', fontWeight: '700' }}>Candidate Name</th>
                <th style={{ padding: '0.75rem 0', fontWeight: '700' }}>Applied Job</th>
                <th style={{ padding: '0.75rem 0', fontWeight: '700' }}>Applied Date</th>
                <th style={{ padding: '0.75rem 0', fontWeight: '700' }}>Method</th>
                <th style={{ padding: '0.75rem 0', fontWeight: '700' }}>Manage Hiring Stage</th>
                <th style={{ padding: '0.75rem 0', fontWeight: '700', textAlign: 'right' }}>Resume & Details</th>
              </tr>
            </thead>
          <tbody>
            {filteredApps.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                  No candidate applications found matching filter.
                </td>
              </tr>
            ) : (
              filteredApps.map((app, idx) => {
                const cleanEmail = (app.candidateEmail || '').toLowerCase().trim();
                const candidateAvatar = cleanEmail ? localStorage.getItem(`careonix_prof_${cleanEmail}_avatar`) : (app.candidateAvatar || app.avatar);

                return (
                  <tr key={app.id || idx} style={{ borderBottom: idx === filteredApps.length - 1 ? 'none' : '1px solid #f1f5f9' }}>
                    
                    {/* Candidate Name & Contact */}
                    <td style={{ padding: '1rem 0' }}>
                      <div style={{ fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: '#f3e8ff', color: '#7c3aed', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', overflow: 'hidden', border: '1px solid #e2e8f0', flexShrink: 0 }}>
                          {candidateAvatar ? (
                            <img src={candidateAvatar} alt={app.candidateName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            (app.candidateName || 'A').charAt(0).toUpperCase()
                          )}
                        </div>
                        <div>
                          <div>{app.candidateName || 'Candidate'}</div>
                          <div style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: '500' }}>{app.candidateEmail}</div>
                        </div>
                      </div>
                    </td>

                  {/* Applied Job */}
                  <td style={{ padding: '1rem 0' }}>
                    <div style={{ fontWeight: '700', color: '#4f46e5' }}>{app.jobTitle}</div>
                    <div style={{ fontSize: '0.76rem', color: '#64748b' }}>{app.company} &bull; {app.location}</div>
                  </td>

                  {/* Applied Date */}
                  <td style={{ padding: '1rem 0', color: '#475569', fontSize: '0.82rem' }}>
                    {app.appliedDate || app.appliedDateTime || 'Today'}
                  </td>

                  {/* Method */}
                  <td style={{ padding: '1rem 0' }}>
                    <span style={{
                      background: app.applicationMethod === 'careonix' ? '#f3e8ff' : '#f1f5f9',
                      color: app.applicationMethod === 'careonix' ? '#7c3aed' : '#475569',
                      border: `1px solid ${app.applicationMethod === 'careonix' ? '#ddd6fe' : '#e2e8f0'}`,
                      padding: '3px 10px',
                      borderRadius: '10px',
                      fontSize: '0.74rem',
                      fontWeight: '700'
                    }}>
                      {app.applicationMethod === 'careonix' ? '🟣 CAREONIX Direct' : '🌐 External Site'}
                    </span>
                  </td>

                  {/* Manage Stage Dropdown */}
                  <td style={{ padding: '1rem 0' }}>
                    <select
                      value={app.status || 'APPLIED'}
                      onChange={e => handleStatusChange(app.id, e.target.value)}
                      style={{
                        padding: '0.45rem 0.8rem',
                        borderRadius: '10px',
                        border: '1.5px solid #cbd5e1',
                        fontSize: '0.82rem',
                        fontWeight: '800',
                        color: app.status === 'HIRED' || app.status === 'SHORTLISTED' ? '#16a34a' : (app.status === 'REJECTED' ? '#dc2626' : '#7c3aed'),
                        background: '#ffffff',
                        cursor: 'pointer',
                        outline: 'none',
                        fontFamily: 'Inter, sans-serif'
                      }}
                    >
                      <option value="APPLIED">Applied / Under Review</option>
                      <option value="SHORTLISTED">Shortlisted</option>
                      <option value="INTERVIEW">Interview Scheduled</option>
                      <option value="OFFER">Offer Extended</option>
                      <option value="HIRED">Hired</option>
                      <option value="REJECTED">Rejected</option>
                    </select>
                  </td>

                  {/* Actions (Message & Profile) */}
                  <td style={{ padding: '1rem 0', textAlign: 'right' }}>
                    <button
                      onClick={() => handleOpenChatWithCandidate(app)}
                      style={{
                        padding: '0.45rem 0.85rem',
                        borderRadius: '8px',
                        background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                        border: 'none',
                        color: '#ffffff',
                        fontSize: '0.8rem',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        marginRight: '6px',
                        boxShadow: '0 2px 6px rgba(124,58,237,0.2)'
                      }}
                    >
                      <MessageSquare size={13} /> Message
                    </button>
                    <button
                      onClick={() => setSelectedCandidateApp(app)}
                      style={{
                        padding: '0.45rem 0.9rem',
                        borderRadius: '8px',
                        background: '#ffffff',
                        border: '1.5px solid #c7d2fe',
                        color: '#4f46e5',
                        fontSize: '0.8rem',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <FileText size={14} /> Candidate Profile
                    </button>
                  </td>

                </tr>
              );
            })
          )}
          </tbody>
        </table>
        </div>
      </div>

      {/* Candidate Resume & Application Modal */}
      {selectedCandidateApp && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: '1rem' }}>
          <div style={{ width: '520px', background: '#ffffff', borderRadius: '24px', padding: '2rem', boxShadow: '0 25px 60px rgba(15,23,42,0.2)', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#f3e8ff', color: '#7c3aed', fontSize: '1.3rem', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {(selectedCandidateApp.candidateName || 'A').charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                    {selectedCandidateApp.candidateName || 'Candidate'}
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '2px 0 0 0' }}>
                    Applied for <strong style={{ color: '#4f46e5' }}>{selectedCandidateApp.jobTitle}</strong>
                  </p>
                </div>
              </div>
              <button onClick={() => setSelectedCandidateApp(null)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={18} color="#64748b" />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', background: '#f8fafc', padding: '1.1rem', borderRadius: '16px', border: '1px solid #f1f5f9', marginBottom: '1.5rem', fontSize: '0.86rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#334155' }}>
                <Mail size={16} color="#64748b" />
                <span>Email: <strong>{selectedCandidateApp.candidateEmail || 'N/A'}</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#334155' }}>
                <Phone size={16} color="#64748b" />
                <span>Phone: <strong>{selectedCandidateApp.candidatePhone || 'N/A'}</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#334155' }}>
                <FileText size={16} color="#7c3aed" />
                <span>Resume: <strong style={{ color: '#7c3aed' }}>{selectedCandidateApp.resumeFileName || 'resume.pdf'}</strong></span>
              </div>
            </div>

            {/* Candidate Star Rating (Controlled by Platform Settings) */}
            {getSettings()?.platform?.enableCandidateRatings !== false && (
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                  Candidate Star Rating
                </label>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  {[1, 2, 3, 4, 5].map(star => {
                    const currentRating = appRatings[selectedCandidateApp.id] || 0;
                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleRateCandidate(selectedCandidateApp.id, star)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', display: 'inline-flex' }}
                      >
                        <Star
                          size={22}
                          fill={star <= currentRating ? '#f59e0b' : 'none'}
                          color={star <= currentRating ? '#f59e0b' : '#cbd5e1'}
                        />
                      </button>
                    );
                  })}
                  <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: '700', marginLeft: '6px' }}>
                    {appRatings[selectedCandidateApp.id] ? `${appRatings[selectedCandidateApp.id]}/5 Stars` : 'Not Rated'}
                  </span>
                </div>
              </div>
            )}

            {/* Internal Recruiter Notes (Controlled by Platform Settings) */}
            {getSettings()?.platform?.enableApplicationNotes !== false && (
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                  Internal Recruiter Evaluation Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Add private evaluation notes visible only to your team..."
                  value={appNotes[selectedCandidateApp.id] || ''}
                  onChange={e => handleSaveNote(selectedCandidateApp.id, e.target.value)}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.84rem', fontFamily: 'Inter, sans-serif', resize: 'vertical' }}
                />
              </div>
            )}

            {selectedCandidateApp.coverNote && (
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                  Candidate Cover Note
                </label>
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '0.85rem', fontSize: '0.85rem', color: '#334155', lineHeight: '1.5' }}>
                  {selectedCandidateApp.coverNote}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => triggerToast(`📥 Downloading ${selectedCandidateApp.resumeFileName || 'resume.pdf'}...`)}
                style={{ padding: '0.65rem 1.1rem', borderRadius: '10px', background: '#f3e8ff', border: '1px solid #ddd6fe', color: '#7c3aed', fontWeight: '700', fontSize: '0.84rem', cursor: 'pointer' }}
              >
                📥 Download Resume
              </button>
              <div style={{ display: 'flex', gap: '0.65rem' }}>
                <button
                  onClick={() => {
                    handleOpenChatWithCandidate(selectedCandidateApp);
                    setSelectedCandidateApp(null);
                  }}
                  style={{ padding: '0.65rem 1.2rem', borderRadius: '10px', background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', border: 'none', color: '#ffffff', fontWeight: '800', fontSize: '0.84rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <MessageSquare size={15} /> Message Candidate
                </button>
                <button onClick={() => setSelectedCandidateApp(null)} style={{ padding: '0.65rem 1.4rem', borderRadius: '10px', background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#334155', fontWeight: '800', fontSize: '0.86rem', cursor: 'pointer' }}>
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
