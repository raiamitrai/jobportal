import React, { useState, useEffect } from 'react';
import { useJobs } from '../context/JobContext';
import {
  Search, Filter, Download, Eye, ChevronDown, ChevronLeft, ChevronRight,
  CheckCircle2, Clock, X, Users, Briefcase, Calendar, MoreVertical,
  Star, UserCheck, XCircle, TrendingUp
} from 'lucide-react';

const STATUS_STYLES = {
  'Pending Review':        { bg: '#fff7ed', color: '#ea580c', border: '#fed7aa' },
  'Shortlisted':           { bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe' },
  'Interview Scheduled':   { bg: '#f5f3ff', color: '#7c3aed', border: '#ddd6fe' },
  'Hired':                 { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
  'Rejected':              { bg: '#fef2f2', color: '#dc2626', border: '#fca5a5' },
};

const AVATAR_COLORS = ['#6366f1','#10b981','#3b82f6','#f59e0b','#8b5cf6','#06b6d4','#ec4899','#14b8a6','#ef4444','#84cc16'];

export default function AdminApplicationsPage() {
  const { applications } = useJobs();
  const [activeTab, setActiveTab]             = useState('All Applications');
  const [searchQuery, setSearchQuery]         = useState('');
  const [jobFilter, setJobFilter]             = useState('All Jobs');
  const [companyFilter, setCompanyFilter]     = useState('All Companies');
  const [statusFilter, setStatusFilter]       = useState('All Status');
  const [activeDropdownId, setActiveDropdownId] = useState(null);

  // Close active action dropdowns on click anywhere outside on screen
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.action-menu-container')) {
        setActiveDropdownId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  const [selectedApp, setSelectedApp]         = useState(null);
  const [toastMsg, setToastMsg]               = useState('');

  const apps = React.useMemo(() => {
    if (!Array.isArray(applications) || applications.length === 0) return [];
    return applications.map((a, idx) => ({
      id: `APP-${String(idx + 1000).padStart(7, '0')}`,
      candidateName: a.candidateName || a.name || 'Candidate',
      candidateEmail: a.candidateEmail || a.email || '',
      initials: (a.candidateName || a.name || 'C').slice(0, 2).toUpperCase(),
      jobTitle: a.jobTitle || a.title || 'Position',
      jobType: a.jobType || 'Full Time',
      company: a.company || 'Company',
      companyVerified: true,
      appliedOn: a.appliedDate || a.appliedOn || 'Recently',
      status: a.status || 'Pending Review',
      source: 'CAREONIX',
      avatarIdx: idx % 8
    }));
  }, [applications]);

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const TAB_FILTERS = {
    'All Applications':  null,
    'Pending Review':    'Pending Review',
    'Shortlisted':       'Shortlisted',
    'Interviews':        'Interview Scheduled',
    'Hired':             'Hired',
    'Rejected':          'Rejected',
  };

  const TAB_COUNTS = {
    'All Applications': apps.length,
    'Pending Review':   apps.filter(a => a.status === 'Pending Review' || a.status === 'Pending').length,
    'Shortlisted':      apps.filter(a => a.status === 'Shortlisted').length,
    'Interviews':       apps.filter(a => a.status === 'Interview Scheduled' || a.status === 'INTERVIEW').length,
    'Hired':            apps.filter(a => a.status === 'Hired' || a.status === 'HIRED').length,
    'Rejected':         apps.filter(a => a.status === 'Rejected').length,
  };

  const filtered = apps.filter(a => {
    const tabStatus = TAB_FILTERS[activeTab];
    if (tabStatus && a.status !== tabStatus) return false;
    if (statusFilter !== 'All Status' && a.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!a.candidateName.toLowerCase().includes(q) && !a.candidateEmail.toLowerCase().includes(q) && !a.jobTitle.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const updateStatus = (appId, newStatus, label) => {
    setApps(prev => prev.map(a => a.id === appId ? { ...a, status: newStatus } : a));
    setActiveDropdownId(null);
    triggerToast(`✅ Application ${appId} → ${label}`);
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'1.5rem', background:'#f8fafc', minHeight:'92vh', fontFamily:'Inter, sans-serif' }}>

      {/* Toast */}
      {toastMsg && (
        <div style={{ position:'fixed', top:'24px', right:'24px', background:'#10b981', color:'#fff', padding:'0.9rem 1.4rem', borderRadius:'14px', boxShadow:'0 10px 25px rgba(16,185,129,0.3)', display:'flex', alignItems:'center', gap:'0.6rem', zIndex:300, fontWeight:'700', fontSize:'0.9rem' }}>
          <CheckCircle2 size={20}/><span>{toastMsg}</span>
        </div>
      )}

      {/* ── HEADER ───────────────────────────────────────────────────────────── */}
      <div>
        <div style={{ fontSize:'0.78rem', color:'#64748b', fontWeight:'600', marginBottom:'4px' }}>
          Dashboard &gt; Applications
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
          <h1 style={{ fontSize:'1.75rem', fontWeight:'800', color:'#0f172a', margin:0, letterSpacing:'-0.02em' }}>Applications</h1>
          <div style={{ display:'flex', gap:'0.75rem' }}>
            <button onClick={() => triggerToast('Exporting applications CSV...')}
              style={{ background:'#fff', color:'#334155', border:'1px solid #cbd5e1', borderRadius:'12px', padding:'0.65rem 1.25rem', fontWeight:'700', fontSize:'0.86rem', display:'flex', alignItems:'center', gap:'0.5rem', cursor:'pointer' }}>
              <Download size={16}/> Export
            </button>
            <button onClick={() => triggerToast('Advanced Filters opened')}
              style={{ background:'linear-gradient(135deg,#6366f1,#4f46e5)', color:'#fff', border:'none', borderRadius:'12px', padding:'0.65rem 1.25rem', fontWeight:'800', fontSize:'0.86rem', display:'flex', alignItems:'center', gap:'0.5rem', cursor:'pointer', boxShadow:'0 4px 14px rgba(79,70,229,0.25)' }}>
              <Filter size={16}/> Filter
            </button>
          </div>
        </div>
      </div>

      {/* ── KPI CARDS ─────────────────────────────────────────────────────────── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:'1rem' }}>
        {[
          { label:'Total Applications', val: apps.length, icon:<Users size={18}/>, iconBg:'#f3e8ff', iconColor:'#7c3aed' },
          { label:'Pending Review',     val: apps.filter(a => a.status === 'Pending Review' || a.status === 'Pending').length, icon:<Clock size={18}/>, iconBg:'#fff7ed', iconColor:'#ea580c' },
          { label:'Shortlisted',        val: apps.filter(a => a.status === 'Shortlisted').length, icon:<Star size={18}/>, iconBg:'#eff6ff', iconColor:'#2563eb' },
          { label:'Interviews',         val: apps.filter(a => a.status === 'Interview Scheduled' || a.status === 'INTERVIEW').length, icon:<Calendar size={18}/>, iconBg:'#f5f3ff', iconColor:'#7c3aed' },
          { label:'Hired',              val: apps.filter(a => a.status === 'Hired' || a.status === 'HIRED').length, icon:<UserCheck size={18}/>, iconBg:'#f0fdf4', iconColor:'#16a34a' },
        ].map((c, i) => (
          <div key={i} style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:'18px', padding:'1.25rem', boxShadow:'0 1px 4px rgba(15,23,42,0.02)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
              <div style={{ width:'38px', height:'38px', borderRadius:'12px', background:c.iconBg, color:c.iconColor, display:'flex', alignItems:'center', justifyContent:'center' }}>{c.icon}</div>
              <div>
                <span style={{ fontSize:'0.76rem', fontWeight:'700', color:'#64748b', display:'block' }}>{c.label}</span>
                <div style={{ fontSize:'1.5rem', fontWeight:'800', color:'#0f172a', lineHeight:1.1 }}>{c.val}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── SUB-TABS ──────────────────────────────────────────────────────────── */}
      <div style={{ display:'flex', gap:'0.5rem', borderBottom:'1px solid #e2e8f0', paddingBottom:'0', overflowX:'auto' }}>
        {Object.keys(TAB_FILTERS).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            style={{
              background:'none', border:'none', padding:'0.65rem 0.75rem', cursor:'pointer', whiteSpace:'nowrap',
              color: activeTab === tab ? '#6366f1' : '#64748b',
              fontWeight: activeTab === tab ? '800' : '600', fontSize:'0.86rem',
              borderBottom: activeTab === tab ? '2.5px solid #6366f1' : '2.5px solid transparent',
              transition:'all 0.15s ease', display:'flex', alignItems:'center', gap:'6px'
            }}>
            {tab}
            <span style={{ background: activeTab === tab ? '#6366f1' : '#f1f5f9', color: activeTab === tab ? '#fff' : '#64748b', padding:'1px 7px', borderRadius:'12px', fontSize:'0.72rem', fontWeight:'800' }}>
              {TAB_COUNTS[tab]}
            </span>
          </button>
        ))}
      </div>

      {/* ── SEARCH & FILTERS BAR ─────────────────────────────────────────────── */}
      <div style={{ display:'flex', flexWrap:'wrap', gap:'0.75rem', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ position:'relative', flex:'1', minWidth:'280px' }}>
          <Search size={15} style={{ position:'absolute', left:'12px', top:'50%', transform:'translateY(-50%)', color:'#94a3b8' }}/>
          <input type="text" placeholder="Search by candidate name, email or job title..."
            value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            style={{ width:'100%', padding:'0.65rem 1rem 0.65rem 2.25rem', borderRadius:'12px', border:'1px solid #cbd5e1', fontSize:'0.84rem', outline:'none', background:'#fff' }}/>
        </div>
        <div style={{ display:'flex', gap:'0.65rem', alignItems:'center', flexWrap:'wrap' }}>
          <select value={jobFilter} onChange={e => setJobFilter(e.target.value)}
            style={{ padding:'0.6rem 0.85rem', borderRadius:'10px', border:'1px solid #cbd5e1', fontSize:'0.82rem', background:'#fff', fontWeight:'700', color:'#0f172a' }}>
            <option>All Jobs</option>
            <option>Software Engineer</option>
            <option>Frontend Developer</option>
            <option>Product Manager</option>
          </select>
          <select value={companyFilter} onChange={e => setCompanyFilter(e.target.value)}
            style={{ padding:'0.6rem 0.85rem', borderRadius:'10px', border:'1px solid #cbd5e1', fontSize:'0.82rem', background:'#fff', fontWeight:'700', color:'#0f172a' }}>
            <option>All Companies</option>
            <option>TechNova Solutions</option>
            <option>InnovateX</option>
            <option>CloudNet</option>
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            style={{ padding:'0.6rem 0.85rem', borderRadius:'10px', border:'1px solid #cbd5e1', fontSize:'0.82rem', background:'#fff', fontWeight:'700', color:'#0f172a' }}>
            <option>All Status</option>
            <option>Pending Review</option>
            <option>Shortlisted</option>
            <option>Interview Scheduled</option>
            <option>Hired</option>
            <option>Rejected</option>
          </select>
          <div style={{ display:'flex', alignItems:'center', gap:'6px', padding:'0.6rem 0.9rem', borderRadius:'10px', border:'1px solid #cbd5e1', background:'#fff', fontSize:'0.82rem', fontWeight:'700', color:'#334155', cursor:'pointer' }}>
            <Calendar size={14} color="#64748b"/> 01 Aug 2026 - 10 Aug 2026 <ChevronDown size={13} color="#94a3b8"/>
          </div>
          <button onClick={() => { setSearchQuery(''); setJobFilter('All Jobs'); setCompanyFilter('All Companies'); setStatusFilter('All Status'); setActiveTab('All Applications'); }}
            style={{ background:'none', border:'none', color:'#6366f1', fontWeight:'700', fontSize:'0.82rem', cursor:'pointer' }}>
            Clear All
          </button>
        </div>
      </div>

      {/* ── DATA TABLE ───────────────────────────────────────────────────────── */}
      <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:'20px', padding:'1.25rem 1.5rem', boxShadow:'0 1px 4px rgba(15,23,42,0.02)' }}>
        <div className="table-responsive-wrapper">
          <table style={{ width:'100%', minWidth:'820px', borderCollapse:'collapse', fontSize:'0.84rem' }}>
            <thead>
              <tr style={{ borderBottom:'1px solid #e2e8f0', textAlign:'left' }}>
                {['Application ID','Candidate','Job Title','Company','Applied On','Status','Source','Actions'].map((h,i) => (
                  <th key={i} style={{ paddingBottom:'0.9rem', fontWeight:'700', fontSize:'0.75rem', color:'#64748b', textAlign: i===7 ? 'right' : 'left' }}>{h}</th>
                ))}
              </tr>
            </thead>
          <tbody>
            {filtered.map(app => {
              const st = STATUS_STYLES[app.status] || STATUS_STYLES['Pending Review'];
              return (
                <tr key={app.id} style={{ borderBottom:'1px solid #f8fafc' }}>

                  {/* Application ID */}
                  <td style={{ padding:'0.9rem 0', color:'#475569', fontSize:'0.78rem', fontWeight:'700', fontFamily:'monospace' }}>{app.id}</td>

                  {/* Candidate */}
                  <td>
                    <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                      <div style={{ width:'36px', height:'36px', borderRadius:'50%', background:AVATAR_COLORS[app.avatarIdx % AVATAR_COLORS.length], color:'#fff', fontWeight:'800', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.82rem', flexShrink:0 }}>
                        {app.initials}
                      </div>
                      <div>
                        <strong style={{ fontSize:'0.86rem', color:'#0f172a', display:'block' }}>{app.candidateName}</strong>
                        <span style={{ fontSize:'0.74rem', color:'#64748b' }}>{app.candidateEmail}</span>
                      </div>
                    </div>
                  </td>

                  {/* Job Title */}
                  <td>
                    <div style={{ fontSize:'0.86rem', fontWeight:'700', color:'#0f172a' }}>{app.jobTitle}</div>
                    <span style={{ fontSize:'0.73rem', color:'#64748b' }}>{app.jobType}</span>
                  </td>

                  {/* Company */}
                  <td>
                    <span style={{ fontSize:'0.84rem', fontWeight:'700', color:'#0f172a', display:'inline-flex', alignItems:'center', gap:'4px' }}>
                      {app.company}
                      {app.companyVerified && (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="#3b82f6">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                      )}
                    </span>
                  </td>

                  {/* Applied On */}
                  <td style={{ color:'#475569', fontSize:'0.8rem', fontWeight:'600' }}>{app.appliedOn}</td>

                  {/* Status */}
                  <td>
                    <span style={{ background:st.bg, color:st.color, border:`1px solid ${st.border}`, padding:'3px 10px', borderRadius:'8px', fontSize:'0.74rem', fontWeight:'800', whiteSpace:'nowrap' }}>
                      {app.status}
                    </span>
                  </td>

                  {/* Source */}
                  <td style={{ color:'#64748b', fontSize:'0.8rem', fontWeight:'600' }}>{app.source}</td>

                  {/* Actions */}
                  <td className="action-menu-container" style={{ textAlign:'right', position:'relative' }}>
                    <div style={{ display:'inline-flex', gap:'6px', alignItems:'center' }}>
                      <button onClick={() => setSelectedApp(app)}
                        style={{ background:'linear-gradient(135deg,#6366f1,#4f46e5)', color:'#fff', border:'none', borderRadius:'8px', padding:'0.4rem 0.85rem', fontWeight:'700', fontSize:'0.76rem', cursor:'pointer' }}>
                        View Details
                      </button>
                      <button onClick={() => setActiveDropdownId(activeDropdownId === app.id ? null : app.id)}
                        style={{ background:'#f8fafc', border:'1px solid #cbd5e1', borderRadius:'8px', width:'32px', height:'32px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <ChevronDown size={14} color="#64748b"/>
                      </button>
                    </div>

                    {activeDropdownId === app.id && (
                      <div style={{ position:'absolute', right:0, top:'100%', marginTop:'4px', background:'#fff', border:'1px solid #e2e8f0', borderRadius:'12px', boxShadow:'0 10px 30px rgba(0,0,0,0.12)', zIndex:60, padding:'4px', minWidth:'170px', textAlign:'left' }}>
                        {[
                          { label:'✅ Shortlist',           newStatus:'Shortlisted',         color:'#16a34a', bg:'#f0fdf4' },
                          { label:'📅 Schedule Interview',   newStatus:'Interview Scheduled', color:'#7c3aed', bg:'#f5f3ff' },
                          { label:'🎉 Mark as Hired',        newStatus:'Hired',               color:'#16a34a', bg:'#f0fdf4' },
                          { label:'❌ Reject Application',   newStatus:'Rejected',            color:'#dc2626', bg:'#fef2f2' },
                        ].map(action => (
                          <button key={action.label}
                            onClick={() => updateStatus(app.id, action.newStatus, action.newStatus)}
                            style={{ width:'100%', padding:'0.5rem 0.75rem', border:'none', background:action.bg, color:action.color, fontSize:'0.78rem', fontWeight:'700', cursor:'pointer', textAlign:'left', borderRadius:'6px', marginBottom:'2px', display:'block' }}>
                            {action.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </td>

                </tr>
              );
            })}
          </tbody>
        </table>
        </div>

        {/* ── PAGINATION FOOTER ──────────────────────────────────────────────── */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', paddingTop:'1rem', borderTop:'1px solid #f1f5f9', fontSize:'0.82rem', color:'#64748b', marginTop:'0.75rem' }}>
          <div>Showing {filtered.length} of {apps.length} applications</div>
        </div>
      </div>

      {/* ── VIEW DETAILS MODAL ───────────────────────────────────────────────── */}
      {selectedApp && (
        <div style={{ position:'fixed', inset:0, background:'rgba(15,23,42,0.65)', backdropFilter:'blur(6px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:300, padding:'1rem' }}>
          <div style={{ width:'520px', background:'#fff', borderRadius:'24px', padding:'2rem', boxShadow:'0 25px 60px rgba(15,23,42,0.2)', border:'1px solid #e2e8f0' }}>

            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.25rem' }}>
              <h3 style={{ fontSize:'1.1rem', fontWeight:'800', color:'#0f172a', margin:0 }}>Application Details</h3>
              <button onClick={() => setSelectedApp(null)} style={{ background:'#f1f5f9', border:'none', borderRadius:'50%', width:'32px', height:'32px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <X size={16} color="#64748b"/>
              </button>
            </div>

            {/* Candidate Info Card */}
            <div style={{ display:'flex', alignItems:'center', gap:'1rem', background:'#f8fafc', padding:'1rem', borderRadius:'16px', marginBottom:'1rem' }}>
              <div style={{ width:'48px', height:'48px', borderRadius:'50%', background:AVATAR_COLORS[selectedApp.avatarIdx % AVATAR_COLORS.length], color:'#fff', fontWeight:'800', fontSize:'1.1rem', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                {selectedApp.initials}
              </div>
              <div>
                <strong style={{ fontSize:'1rem', color:'#0f172a', display:'block' }}>{selectedApp.candidateName}</strong>
                <span style={{ fontSize:'0.82rem', color:'#6366f1', fontWeight:'600' }}>📧 {selectedApp.candidateEmail}</span>
              </div>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.85rem', fontSize:'0.84rem', marginBottom:'1.25rem' }}>
              <div><span style={{ color:'#64748b' }}>Application ID</span><strong style={{ display:'block', color:'#0f172a', fontFamily:'monospace' }}>{selectedApp.id}</strong></div>
              <div><span style={{ color:'#64748b' }}>Status</span>
                <span style={{ display:'block', ...STATUS_STYLES[selectedApp.status], background:STATUS_STYLES[selectedApp.status]?.bg, padding:'2px 8px', borderRadius:'6px', fontSize:'0.76rem', fontWeight:'800', width:'fit-content', marginTop:'2px', border:`1px solid ${STATUS_STYLES[selectedApp.status]?.border}` }}>
                  {selectedApp.status}
                </span>
              </div>
              <div><span style={{ color:'#64748b' }}>Job Title</span><strong style={{ display:'block', color:'#0f172a' }}>{selectedApp.jobTitle} ({selectedApp.jobType})</strong></div>
              <div><span style={{ color:'#64748b' }}>Company</span><strong style={{ display:'block', color:'#0f172a' }}>{selectedApp.company}</strong></div>
              <div><span style={{ color:'#64748b' }}>Applied On</span><span style={{ display:'block', color:'#334155' }}>{selectedApp.appliedOn}</span></div>
              <div><span style={{ color:'#64748b' }}>Source</span><span style={{ display:'block', color:'#334155' }}>{selectedApp.source}</span></div>
            </div>

            {/* Quick Status Update */}
            <div style={{ borderTop:'1px solid #f1f5f9', paddingTop:'1rem' }}>
              <p style={{ fontSize:'0.78rem', fontWeight:'700', color:'#64748b', marginBottom:'0.65rem' }}>QUICK STATUS UPDATE</p>
              <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap' }}>
                {['Shortlisted','Interview Scheduled','Hired','Rejected'].map(s => {
                  const st = STATUS_STYLES[s];
                  return (
                    <button key={s} onClick={() => { updateStatus(selectedApp.id, s, s); setSelectedApp(prev => ({ ...prev, status: s })); }}
                      style={{ background:st.bg, color:st.color, border:`1px solid ${st.border}`, borderRadius:'8px', padding:'0.4rem 0.75rem', fontSize:'0.76rem', fontWeight:'700', cursor:'pointer' }}>
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ display:'flex', justifyContent:'flex-end', marginTop:'1.25rem' }}>
              <button onClick={() => setSelectedApp(null)} style={{ padding:'0.65rem 1.4rem', borderRadius:'10px', background:'#6366f1', color:'#fff', border:'none', fontWeight:'800', cursor:'pointer' }}>Close</button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
