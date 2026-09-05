import React, { useState } from 'react';
import {
  Briefcase,
  CheckCircle2,
  Clock,
  Users,
  XCircle,
  Info,
  Search,
  ChevronDown,
  MoreVertical,
  ExternalLink,
  Lightbulb,
  ArrowRight
} from 'lucide-react';
import { useJobs } from '../context/JobContext';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { useChat } from '../context/ChatContext';
import CompanyLogo from '../components/CompanyLogo';

export default function MyApplicationsPage({ setActiveTab }) {
  const { applications, updateApplicationStatus } = useJobs();
  const { user } = useAuth();
  const { notifyExternalJobStatusChange } = useNotifications();
  const { openConversation } = useChat();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('');
  const [timeFilter, setTimeFilter] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [activeDropdownAppId, setActiveDropdownAppId] = useState(null);
  const [selectedTimelineAppId, setSelectedTimelineAppId] = useState(null);

  // Status option definitions with colors and icons
  const STATUS_OPTIONS = [
    { label: 'Status Unknown', value: 'STATUS UNKNOWN', color: '#d97706', dotBg: '#f59e0b' },
    { label: 'Under Review', value: 'UNDER REVIEW', color: '#c2410c', dotBg: '#f97316' },
    { label: 'Shortlisted', value: 'SHORTLISTED', color: '#0f766e', dotBg: '#14b8a6' },
    { label: 'Interview', value: 'INTERVIEW', color: '#4f46e5', dotBg: '#3b82f6' },
    { label: 'Offer', value: 'OFFER', color: '#047857', dotBg: '#10b981' },
    { label: 'Rejected', value: 'REJECTED', color: '#dc2626', dotBg: '#ef4444' }
  ];

  // Helper for status badge styling
  const getStatusBadgeStyle = (status) => {
    const s = (status || 'APPLIED').toUpperCase();
    if (s === 'APPLIED') return { bg: '#dcfce7', color: '#15803d', border: '#bbf7d0', label: 'APPLIED', sub: 'Status on CAREONIX' };
    if (s === 'STATUS UNKNOWN') return { bg: '#fef3c7', color: '#d97706', border: '#fde68a', label: 'STATUS UNKNOWN', sub: 'Please update when you get any update' };
    if (s === 'UNDER REVIEW') return { bg: '#ffedd5', color: '#c2410c', border: '#fed7aa', label: 'UNDER REVIEW', sub: 'Updated by you' };
    if (s === 'SHORTLISTED') return { bg: '#ccfbf1', color: '#0f766e', border: '#99f6e4', label: 'SHORTLISTED', sub: 'Updated by you' };
    if (s === 'INTERVIEW') return { bg: '#e0e7ff', color: '#4f46e5', border: '#c7d2fe', label: 'INTERVIEW', sub: 'Updated by you' };
    if (s === 'OFFER') return { bg: '#d1fae5', color: '#047857', border: '#a7f3d0', label: 'OFFER', sub: 'Updated by you' };
    if (s === 'REJECTED') return { bg: '#fee2e2', color: '#dc2626', border: '#fecaca', label: 'REJECTED', sub: 'Updated by you' };
    return { bg: '#e2e8f0', color: '#475569', border: '#cbd5e1', label: s, sub: 'Updated by you' };
  };

  // ─── Filter to current logged-in candidate's applications ONLY ─────────────
  const myEmail = (user?.email || '').toLowerCase().trim();
  const myApplications = myEmail
    ? applications.filter(a => (a.candidateEmail || '').toLowerCase().trim() === myEmail)
    : [];

  // Stat Counters — only for this user's applications
  const countAll = myApplications.length;
  const countApplied = myApplications.filter(a => (a.status || 'APPLIED').toUpperCase() === 'APPLIED').length;
  const countUnknown = myApplications.filter(a => (a.status || '').toUpperCase() === 'STATUS UNKNOWN').length;
  const countInterview = myApplications.filter(a => (a.status || '').toUpperCase() === 'INTERVIEW').length;
  const countRejected = myApplications.filter(a => (a.status || '').toUpperCase() === 'REJECTED').length;

  // Filter & Sort Logic
  const filteredApps = myApplications.filter(app => {
    const q = searchTerm.toLowerCase().trim();
    const matchQ = !q || (app.jobTitle || '').toLowerCase().includes(q) || (app.company || '').toLowerCase().includes(q);
    const matchStatus = !selectedStatusFilter || (app.status || '').toUpperCase() === selectedStatusFilter.toUpperCase();
    return matchQ && matchStatus;
  }).sort((a, b) => {
    if (sortBy === 'oldest') return a.id - b.id;
    return b.id - a.id;
  });

  // Selected Application for Timeline
  const activeTimelineApp = myApplications.find(a => a.id === selectedTimelineAppId) || filteredApps[0] || myApplications[0];

  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
      
      {/* ── Main Outer 2-Column Grid (Left: Main Content, Right: Timeline Sidebar) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem', alignItems: 'start' }}>

        {/* ── LEFT MAIN COLUMN ───────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Page Header */}
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>My Applications</h1>
            <p style={{ color: '#64748b', marginTop: '4px', fontSize: '0.9rem' }}>Track all your job applications in one place.</p>
          </div>

          {/* 5 Stat Summary Cards Grid (Exact matching subtexts & styles) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.85rem' }}>
            
            {/* Card 1: All Applications */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1rem', boxShadow: '0 1px 4px rgba(15,23,42,0.03)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: '#f3e8ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9333ea', flexShrink: 0 }}>
                  <Briefcase size={18} />
                </div>
                <div>
                  <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: '700', textTransform: 'none', display: 'block' }}>All Applications</span>
                  <div style={{ fontSize: '1.35rem', fontWeight: '800', color: '#0f172a', lineHeight: '1.1', marginTop: '2px' }}>{countAll}</div>
                </div>
              </div>
              <p style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: '500', margin: '6px 0 0 0' }}>Total</p>
            </div>

            {/* Card 2: Applied */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1rem', boxShadow: '0 1px 4px rgba(15,23,42,0.03)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a', flexShrink: 0 }}>
                  <CheckCircle2 size={18} />
                </div>
                <div>
                  <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: '700', textTransform: 'none', display: 'block' }}>Applied</span>
                  <div style={{ fontSize: '1.35rem', fontWeight: '800', color: '#0f172a', lineHeight: '1.1', marginTop: '2px' }}>{countApplied}</div>
                </div>
              </div>
              <p style={{ fontSize: '0.68rem', color: '#16a34a', fontWeight: '600', margin: '6px 0 0 0', whiteSpace: 'nowrap' }}>Redirected to company site</p>
            </div>

            {/* Card 3: Status Unknown */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1rem', boxShadow: '0 1px 4px rgba(15,23,42,0.03)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706', flexShrink: 0 }}>
                  <Clock size={18} />
                </div>
                <div>
                  <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: '700', textTransform: 'none', display: 'block' }}>Status Unknown</span>
                  <div style={{ fontSize: '1.35rem', fontWeight: '800', color: '#0f172a', lineHeight: '1.1', marginTop: '2px' }}>{countUnknown}</div>
                </div>
              </div>
              <p style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: '500', margin: '6px 0 0 0', whiteSpace: 'nowrap' }}>Need your update</p>
            </div>

            {/* Card 4: Interview */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1rem', boxShadow: '0 1px 4px rgba(15,23,42,0.03)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4f46e5', flexShrink: 0 }}>
                  <Users size={18} />
                </div>
                <div>
                  <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: '700', textTransform: 'none', display: 'block' }}>Interview</span>
                  <div style={{ fontSize: '1.35rem', fontWeight: '800', color: '#0f172a', lineHeight: '1.1', marginTop: '2px' }}>{countInterview}</div>
                </div>
              </div>
              <p style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: '500', margin: '6px 0 0 0', whiteSpace: 'nowrap' }}>Updated by you</p>
            </div>

            {/* Card 5: Rejected */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1rem', boxShadow: '0 1px 4px rgba(15,23,42,0.03)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626', flexShrink: 0 }}>
                  <XCircle size={18} />
                </div>
                <div>
                  <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: '700', textTransform: 'none', display: 'block' }}>Rejected</span>
                  <div style={{ fontSize: '1.35rem', fontWeight: '800', color: '#0f172a', lineHeight: '1.1', marginTop: '2px' }}>{countRejected}</div>
                </div>
              </div>
              <p style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: '500', margin: '6px 0 0 0', whiteSpace: 'nowrap' }}>Updated by you</p>
            </div>

          </div>

          {/* Banner Notice ("Why can't we track status automatically?") */}
          <div style={{ background: '#f5f3ff', border: '1px solid #e0e7ff', borderRadius: '16px', padding: '1.2rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#e0e7ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Info size={18} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.92rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Why can't we track status automatically?</h4>
                <p style={{ fontSize: '0.82rem', color: '#475569', margin: '3px 0 0 0', lineHeight: '1.4' }}>
                  We only redirect you to the company's official career page. We don't have access to their application system, so status updates must be added manually.
                </p>
              </div>
            </div>
            <button
              onClick={() => alert("CAREONIX redirects candidates to company career portals. You can manually update your application status anytime using the dropdown menu on each application card!")}
              style={{ background: '#ffffff', border: '1.5px solid #c7d2fe', color: '#4f46e5', padding: '0.45rem 1.1rem', borderRadius: '10px', fontWeight: '700', fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}
            >
              Learn More <ArrowRight size={14} />
            </button>
          </div>

          {/* Search & Filter Toolbar */}
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Search Input */}
            <div style={{ flex: 1, minWidth: '220px', display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '0.6rem 1rem', boxShadow: '0 1px 3px rgba(15,23,42,0.02)' }}>
              <Search size={16} color="#94a3b8" />
              <input
                placeholder="Search by job title or company..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', fontSize: '0.86rem', color: '#0f172a' }}
              />
            </div>

            {/* Status Filter Dropdown */}
            <select
              value={selectedStatusFilter}
              onChange={e => setSelectedStatusFilter(e.target.value)}
              style={{ padding: '0.6rem 0.9rem', borderRadius: '12px', background: '#ffffff', border: '1px solid #e2e8f0', fontSize: '0.84rem', color: '#0f172a', fontWeight: '600', cursor: 'pointer', outline: 'none' }}
            >
              <option value="">All Status</option>
              <option value="APPLIED">Applied</option>
              <option value="STATUS UNKNOWN">Status Unknown</option>
              <option value="UNDER REVIEW">Under Review</option>
              <option value="SHORTLISTED">Shortlisted</option>
              <option value="INTERVIEW">Interview</option>
              <option value="OFFER">Offer</option>
              <option value="REJECTED">Rejected</option>
            </select>

            {/* Time Filter Dropdown */}
            <select
              value={timeFilter}
              onChange={e => setTimeFilter(e.target.value)}
              style={{ padding: '0.6rem 0.9rem', borderRadius: '12px', background: '#ffffff', border: '1px solid #e2e8f0', fontSize: '0.84rem', color: '#0f172a', fontWeight: '600', cursor: 'pointer', outline: 'none' }}
            >
              <option value="">All Time</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
            </select>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              style={{ padding: '0.6rem 0.9rem', borderRadius: '12px', background: '#ffffff', border: '1px solid #e2e8f0', fontSize: '0.84rem', color: '#0f172a', fontWeight: '600', cursor: 'pointer', outline: 'none' }}
            >
              <option value="newest">Sort: Newest</option>
              <option value="oldest">Sort: Oldest</option>
            </select>
          </div>

          {/* Application Cards List */}
          {filteredApps.length === 0 ? (
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '3.5rem 2rem', textAlign: 'center', boxShadow: '0 1px 4px rgba(15,23,42,0.03)' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#f1f5f9', margin: '0 auto 1rem auto', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                <Briefcase size={26} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>No applications found</h3>
              <p style={{ color: '#64748b', fontSize: '0.86rem', marginTop: '4px' }}>Try clearing your search or status filters.</p>
            </div>
          ) : (
            filteredApps.map(app => {
              const badge = getStatusBadgeStyle(app.status);
              const isSelectedForTimeline = activeTimelineApp?.id === app.id;

              return (
                <div
                  key={app.id}
                  onClick={() => setSelectedTimelineAppId(app.id)}
                  style={{
                    background: '#ffffff',
                    border: `1.5px solid ${isSelectedForTimeline ? '#c7d2fe' : '#e2e8f0'}`,
                    borderRadius: '16px',
                    padding: '1.25rem 1.5rem',
                    display: 'grid',
                    gridTemplateColumns: '1fr auto auto',
                    alignItems: 'center',
                    gap: '1.5rem',
                    boxShadow: isSelectedForTimeline ? '0 4px 14px rgba(79,70,229,0.08)' : '0 1px 4px rgba(15,23,42,0.03)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    position: 'relative'
                  }}
                >
                  {/* COL 1: Company Logo + Job Info */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', minWidth: 0 }}>
                    <div style={{ flexShrink: 0, marginTop: '2px' }}>
                      <CompanyLogo company={app.company} logoUrl={app.logoUrl} size={48} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <h3 style={{ fontSize: '1.02rem', fontWeight: '800', color: '#0f172a', margin: '0 0 2px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {app.jobTitle}
                      </h3>
                      <span style={{ fontSize: '0.85rem', color: '#334155', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        {app.company}
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="#3b82f6" style={{ flexShrink: 0 }}>
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                      </span>
                      <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '4px 0 6px 0' }}>
                        📍 {app.location || 'India'} &bull; {app.type || 'Full-time'} &bull; ~ {app.experience || '1-3 Yrs'}
                      </p>
                      <p style={{ fontSize: '0.76rem', color: '#64748b', margin: 0 }}>
                        Applied on: <strong>{app.appliedDate}</strong> &bull;{' '}
                        <a
                          href={app.redirectUrl || '#'}
                          target="_blank"
                          rel="noreferrer"
                          onClick={e => e.stopPropagation()}
                          style={{ color: '#475569', textDecoration: 'none', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '2px' }}
                        >
                          Redirected to company site <ExternalLink size={11} />
                        </a>
                      </p>
                    </div>
                  </div>

                  {/* COL 2: Status Badge (Center Column) */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', minWidth: '170px' }}>
                    <span style={{
                      background: badge.bg,
                      color: badge.color,
                      border: `1px solid ${badge.border}`,
                      padding: '4px 14px',
                      borderRadius: '8px',
                      fontSize: '0.75rem',
                      fontWeight: '800',
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      {badge.label}
                    </span>
                    <span style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '5px', textAlign: 'center', fontWeight: '500' }}>
                      {app.updatedBy || 'Status on CAREONIX'}
                    </span>
                  </div>

                  {/* COL 3: Interactive Update Status Dropdown Button */}
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const cleanCandEmail = (user?.email || user?.identifier || app.candidateEmail || '').toLowerCase().trim();
                        const cleanRecEmail = (app.recruiterEmail || app.postedBy || '').toLowerCase().trim();
                        if (openConversation) {
                          openConversation({
                            candidateEmail: cleanCandEmail,
                            candidateName: user?.name || app.candidateName || cleanCandEmail.split('@')[0],
                            recruiterEmail: cleanRecEmail,
                            recruiterName: cleanRecEmail ? cleanRecEmail.split('@')[0] : 'Recruiter',
                            companyName: app.company,
                            jobId: app.jobId,
                            jobTitle: app.jobTitle
                          });
                        }
                        if (setActiveTab) setActiveTab('messages');
                      }}
                      style={{
                        padding: '0.5rem 0.95rem',
                        background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                        border: 'none',
                        borderRadius: '10px',
                        color: '#ffffff',
                        fontWeight: '800',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        whiteSpace: 'nowrap',
                        boxShadow: '0 2px 8px rgba(124,58,237,0.2)'
                      }}
                    >
                      💬 Message Recruiter
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveDropdownAppId(activeDropdownAppId === app.id ? null : app.id);
                      }}
                      style={{
                        padding: '0.5rem 0.95rem',
                        background: '#ffffff',
                        border: '1.5px solid #c7d2fe',
                        borderRadius: '10px',
                        color: '#4f46e5',
                        fontWeight: '700',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      Update Status <ChevronDown size={14} />
                    </button>

                    <button
                      onClick={e => e.stopPropagation()}
                      style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
                    >
                      <MoreVertical size={18} />
                    </button>

                    {/* Status Options Menu */}
                    {activeDropdownAppId === app.id && (
                      <div
                        onClick={e => e.stopPropagation()}
                        style={{
                          position: 'absolute',
                          top: '110%',
                          right: 0,
                          width: '180px',
                          background: '#ffffff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '14px',
                          boxShadow: '0 10px 30px rgba(15,23,42,0.15)',
                          zIndex: 100,
                          padding: '0.4rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '2px'
                        }}
                      >
                        {STATUS_OPTIONS.map(opt => (
                          <button
                            key={opt.value}
                            onClick={() => {
                              updateApplicationStatus(app.id, opt.value);
                              if (notifyExternalJobStatusChange) {
                                notifyExternalJobStatusChange({
                                  recruiterEmail: app.postedBy || app.recruiterEmail || 'recruiter@careonix.com',
                                  candidateName: user?.name || 'Candidate User',
                                  jobTitle: app.jobTitle || 'External Job',
                                  newStatus: opt.value
                                });
                              }
                              setActiveDropdownAppId(null);
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              padding: '0.45rem 0.75rem',
                              border: 'none',
                              background: 'transparent',
                              borderRadius: '8px',
                              fontSize: '0.78rem',
                              fontWeight: '600',
                              color: '#334155',
                              cursor: 'pointer',
                              textAlign: 'left'
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                          >
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: opt.dotBg }}></span>
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}

        </div>

        {/* ── RIGHT MAIN COLUMN: TIMELINE SIDEBAR (FIXED / STICKY ON SCROLL) ────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', position: 'sticky', top: '1.5rem', alignSelf: 'start' }}>

          {/* Your Application Timeline Card (Starts at top, right beside Rejected card!) */}
          {activeTimelineApp && (
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.35rem', boxShadow: '0 1px 4px rgba(15,23,42,0.03)' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0f172a', margin: '0 0 1.25rem 0' }}>
                Your Application Timeline
              </h4>

              {/* Steps timeline */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.35rem', position: 'relative', paddingLeft: '1.25rem' }}>
                {/* Vertical Line */}
                <div style={{ position: 'absolute', left: '4px', top: '8px', bottom: '8px', width: '2px', background: '#e2e8f0' }}></div>

                {/* Event 1: Application Submitted */}
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '-1.25rem', top: '4px', width: '10px', height: '10px', borderRadius: '50%', background: '#16a34a', boxShadow: '0 0 0 3px #ffffff' }}></span>
                  <div style={{ fontSize: '0.84rem', fontWeight: '800', color: '#0f172a' }}>Application Submitted</div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>{activeTimelineApp.appliedDateTime || activeTimelineApp.appliedDate}</div>
                  <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '2px' }}>Redirected to company site</div>
                </div>

                {/* Additional Timeline Events */}
                {activeTimelineApp.timeline?.filter(t => t.title !== 'Application Submitted').map((ev, idx) => (
                  <div key={idx} style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '-1.25rem', top: '4px', width: '10px', height: '10px', borderRadius: '50%', background: '#3b82f6', boxShadow: '0 0 0 3px #ffffff' }}></span>
                    <div style={{ fontSize: '0.84rem', fontWeight: '800', color: '#0f172a' }}>{ev.title}</div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                      {ev.date}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '2px' }}>
                      {ev.note}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tip Card */}
          <div style={{ background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: '16px', padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#7c3aed', fontWeight: '800', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
              <Lightbulb size={16} /> Tip
            </div>
            <p style={{ fontSize: '0.8rem', color: '#5b21b6', margin: 0, lineHeight: '1.5', fontWeight: '500' }}>
              Keep checking your email (including spam) and the company career portal for updates.
            </p>
          </div>

          {/* Important Note Card */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.25rem', boxShadow: '0 1px 4px rgba(15,23,42,0.03)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#4f46e5', fontWeight: '800', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
              <Info size={16} /> Important Note
            </div>
            <p style={{ fontSize: '0.8rem', color: '#334155', margin: '0 0 0.5rem 0', lineHeight: '1.5', fontWeight: '600' }}>
              Applications on CAREONIX are redirected to company career pages.
            </p>
            <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0, lineHeight: '1.45' }}>
              We cannot track your application status. Please check updates directly on the company's career portal.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
