import React, { useState } from 'react';
import {
  Search, Filter, Download, ChevronDown, ChevronLeft, ChevronRight,
  CheckCircle2, Clock, X, FileText, Eye, AlertTriangle, ShieldAlert,
  RefreshCw, XCircle, ShieldCheck, Flag, MoreVertical
} from 'lucide-react';

const STATUS_STYLES = {
  'Pending':      { bg: '#fff7ed', color: '#ea580c', border: '#fed7aa' },
  'Under Review': { bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe' },
  'Resolved':     { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
  'Rejected':     { bg: '#fef2f2', color: '#dc2626', border: '#fca5a5' },
  'Reopened':     { bg: '#f5f3ff', color: '#7c3aed', border: '#ddd6fe' },
};

const TYPE_STYLES = {
  'User':    { bg: '#f3e8ff', color: '#7c3aed' },
  'Job':     { bg: '#eff6ff', color: '#2563eb' },
  'Company': { bg: '#f0fdf4', color: '#16a34a' },
};

const PRIORITY_STYLES = {
  'High':   { color: '#dc2626', bg: '#fef2f2' },
  'Medium': { color: '#d97706', bg: '#fffbeb' },
  'Low':    { color: '#16a34a', bg: '#f0fdf4' },
};

const AVATAR_COLORS = ['#6366f1', '#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899', '#14b8a6', '#ef4444', '#84cc16'];

const DEFAULT_REPORTS = [];

export default function AdminReportsPage() {
  const [activeTab, setActiveTab]             = useState('All');
  const [searchQuery, setSearchQuery]         = useState('');
  const [typeFilter, setTypeFilter]           = useState('All');
  const [targetFilter, setTargetFilter]       = useState('All');
  const [statusFilter, setStatusFilter]       = useState('All');
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  const [selectedReport, setSelectedReport]   = useState(null);
  const [toastMsg, setToastMsg]               = useState('');
  const [reports, setReports]                 = useState(DEFAULT_REPORTS);

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const TAB_STATUS = {
    'All':          null,
    'Pending':      'Pending',
    'Under Review': 'Under Review',
    'Resolved':     'Resolved',
    'Rejected':     'Rejected',
    'Reopened':     'Reopened',
  };

  const TAB_COUNTS = {
    'All':          reports.length,
    'Pending':      reports.filter(r => r.status === 'Pending').length,
    'Under Review': reports.filter(r => r.status === 'Under Review').length,
    'Resolved':     reports.filter(r => r.status === 'Resolved').length,
    'Rejected':     reports.filter(r => r.status === 'Rejected').length,
    'Reopened':     reports.filter(r => r.status === 'Reopened').length,
  };

  const filtered = reports.filter(r => {
    const tabStatus = TAB_STATUS[activeTab];
    if (tabStatus && r.status !== tabStatus) return false;
    if (statusFilter !== 'All' && r.status !== statusFilter) return false;
    if (typeFilter !== 'All' && r.type !== typeFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (
        !r.reporterName.toLowerCase().includes(q) &&
        !r.reporterEmail.toLowerCase().includes(q) &&
        !r.reportedAgainst.toLowerCase().includes(q) &&
        !r.reason.toLowerCase().includes(q) &&
        !r.id.toLowerCase().includes(q)
      ) return false;
    }
    return true;
  });

  const updateStatus = (rptId, newStatus) => {
    setReports(prev => prev.map(r => r.id === rptId ? { ...r, status: newStatus } : r));
    setActiveDropdownId(null);
    setSelectedReport(prev => prev && prev.id === rptId ? { ...prev, status: newStatus } : prev);
    triggerToast(`✅ ${rptId} status updated to "${newStatus}"`);
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'1.5rem', background:'#f8fafc', minHeight:'92vh', fontFamily:'Inter, sans-serif' }}>

      {/* Toast Notification */}
      {toastMsg && (
        <div style={{ position:'fixed', top:'24px', right:'24px', background:'#10b981', color:'#fff', padding:'0.9rem 1.4rem', borderRadius:'14px', boxShadow:'0 10px 25px rgba(16,185,129,0.3)', display:'flex', alignItems:'center', gap:'0.6rem', zIndex:300, fontWeight:'700', fontSize:'0.9rem' }}>
          <CheckCircle2 size={20}/><span>{toastMsg}</span>
        </div>
      )}

      {/* ── HEADER ───────────────────────────────────────────────────────────── */}
      <div>
        <div style={{ fontSize:'0.78rem', color:'#64748b', fontWeight:'600', marginBottom:'4px' }}>
          Dashboard &gt; Reports &amp; Complaints
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
          <h1 style={{ fontSize:'1.75rem', fontWeight:'800', color:'#0f172a', margin:0, letterSpacing:'-0.02em' }}>Reports &amp; Complaints</h1>
          <div style={{ display:'flex', gap:'0.75rem' }}>
            <button onClick={() => triggerToast('Exporting reports CSV...')}
              style={{ background:'#fff', color:'#334155', border:'1px solid #cbd5e1', borderRadius:'12px', padding:'0.65rem 1.25rem', fontWeight:'700', fontSize:'0.86rem', display:'flex', alignItems:'center', gap:'0.5rem', cursor:'pointer' }}>
              <Download size={16}/> Export
            </button>
            <button onClick={() => triggerToast('Filters panel opened')}
              style={{ background:'linear-gradient(135deg,#6366f1,#4f46e5)', color:'#fff', border:'none', borderRadius:'12px', padding:'0.65rem 1.25rem', fontWeight:'800', fontSize:'0.86rem', display:'flex', alignItems:'center', gap:'0.5rem', cursor:'pointer', boxShadow:'0 4px 14px rgba(79,70,229,0.25)' }}>
              <Filter size={16}/> Filters
            </button>
          </div>
        </div>
      </div>

      {/* ── KPI CARDS ────────────────────────────────────────────────────────── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:'1rem' }}>
        {[
          { label:'Total Reports',  val: reports.length, icon:<ShieldAlert size={18}/>, iconBg:'#f3e8ff', iconColor:'#7c3aed' },
          { label:'Pending Review', val: reports.filter(r => r.status === 'Pending').length, icon:<Clock size={18}/>, iconBg:'#fff7ed', iconColor:'#ea580c' },
          { label:'Resolved',       val: reports.filter(r => r.status === 'Resolved').length, icon:<CheckCircle2 size={18}/>, iconBg:'#f0fdf4', iconColor:'#16a34a' },
          { label:'Rejected',       val: reports.filter(r => r.status === 'Rejected').length, icon:<XCircle size={18}/>, iconBg:'#fef2f2', iconColor:'#dc2626' },
          { label:'Reopened',       val: reports.filter(r => r.status === 'Reopened').length, icon:<RefreshCw size={18}/>, iconBg:'#eff6ff', iconColor:'#2563eb' },
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

      {/* ── SUB-TABS ─────────────────────────────────────────────────────────── */}
      <div style={{ display:'flex', gap:'0.25rem', borderBottom:'1px solid #e2e8f0', paddingBottom:'0', overflowX:'auto' }}>
        {Object.keys(TAB_STATUS).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            style={{
              background:'none', border:'none', padding:'0.65rem 0.85rem', cursor:'pointer', whiteSpace:'nowrap',
              color: activeTab === tab ? '#6366f1' : '#64748b',
              fontWeight: activeTab === tab ? '800' : '600', fontSize:'0.86rem',
              borderBottom: activeTab === tab ? '2.5px solid #6366f1' : '2.5px solid transparent',
              transition:'all 0.15s ease', display:'flex', alignItems:'center', gap:'6px'
            }}>
            {tab}
            {TAB_COUNTS[tab] && (
              <span style={{ background: activeTab === tab ? '#6366f1' : '#f1f5f9', color: activeTab === tab ? '#fff' : '#64748b', padding:'1px 7px', borderRadius:'12px', fontSize:'0.72rem', fontWeight:'800' }}>
                {TAB_COUNTS[tab]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── SEARCH & FILTERS BAR ─────────────────────────────────────────────── */}
      <div style={{ display:'flex', flexWrap:'wrap', gap:'0.75rem', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ position:'relative', width:'320px' }}>
          <Search size={15} style={{ position:'absolute', left:'12px', top:'50%', transform:'translateY(-50%)', color:'#94a3b8' }}/>
          <input type="text" placeholder="Search by keyword..."
            value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            style={{ width:'100%', padding:'0.65rem 1rem 0.65rem 2.25rem', borderRadius:'12px', border:'1px solid #cbd5e1', fontSize:'0.84rem', outline:'none', background:'#fff' }}/>
        </div>

        <div style={{ display:'flex', gap:'0.65rem', alignItems:'flex-end', flexWrap:'wrap' }}>
          <div>
            <span style={{ fontSize:'0.72rem', fontWeight:'700', color:'#64748b', display:'block', marginBottom:'2px' }}>Report Type</span>
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
              style={{ padding:'0.55rem 0.85rem', borderRadius:'10px', border:'1px solid #cbd5e1', fontSize:'0.82rem', background:'#fff', fontWeight:'700', color:'#0f172a' }}>
              <option value="All">All</option>
              <option value="User">User</option>
              <option value="Job">Job</option>
              <option value="Company">Company</option>
            </select>
          </div>

          <div>
            <span style={{ fontSize:'0.72rem', fontWeight:'700', color:'#64748b', display:'block', marginBottom:'2px' }}>Reported Against</span>
            <select value={targetFilter} onChange={e => setTargetFilter(e.target.value)}
              style={{ padding:'0.55rem 0.85rem', borderRadius:'10px', border:'1px solid #cbd5e1', fontSize:'0.82rem', background:'#fff', fontWeight:'700', color:'#0f172a' }}>
              <option value="All">All</option>
              <option value="Users">Users</option>
              <option value="Jobs">Jobs</option>
              <option value="Companies">Companies</option>
            </select>
          </div>

          <div>
            <span style={{ fontSize:'0.72rem', fontWeight:'700', color:'#64748b', display:'block', marginBottom:'2px' }}>Status</span>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              style={{ padding:'0.55rem 0.85rem', borderRadius:'10px', border:'1px solid #cbd5e1', fontSize:'0.82rem', background:'#fff', fontWeight:'700', color:'#0f172a' }}>
              <option value="All">All</option>
              <option value="Pending">Pending</option>
              <option value="Under Review">Under Review</option>
              <option value="Resolved">Resolved</option>
              <option value="Rejected">Rejected</option>
              <option value="Reopened">Reopened</option>
            </select>
          </div>

          <div style={{ display:'flex', alignItems:'center', gap:'6px', padding:'0.55rem 0.9rem', borderRadius:'10px', border:'1px solid #cbd5e1', background:'#fff', fontSize:'0.82rem', fontWeight:'700', color:'#334155', cursor:'pointer', whiteSpace:'nowrap' }}>
            📅 01 Aug 2026 - 10 Aug 2026 <ChevronDown size={13} color="#94a3b8"/>
          </div>

          <button onClick={() => { setSearchQuery(''); setTypeFilter('All'); setTargetFilter('All'); setStatusFilter('All'); setActiveTab('All'); }}
            style={{ background:'none', border:'none', color:'#6366f1', fontWeight:'700', fontSize:'0.82rem', cursor:'pointer', padding:'0.55rem 0' }}>
            Clear All
          </button>
        </div>
      </div>

      {/* ── DATA TABLE ───────────────────────────────────────────────────────── */}
      <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:'20px', padding:'1.5rem', boxShadow:'0 1px 4px rgba(15,23,42,0.02)' }}>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.84rem' }}>
          <thead>
            <tr style={{ borderBottom:'1px solid #e2e8f0', textAlign:'left' }}>
              {['Report ID','Reported By','Type','Reported Against','Reason','Reported On ↕','Status','Priority','Actions'].map((h,i) => (
                <th key={i} style={{ paddingBottom:'0.9rem', fontWeight:'700', fontSize:'0.75rem', color:'#64748b', textAlign: i === 8 ? 'right' : 'left' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => {
              const st = STATUS_STYLES[r.status] || STATUS_STYLES['Pending'];
              const tp = TYPE_STYLES[r.type] || TYPE_STYLES['User'];
              const pr = PRIORITY_STYLES[r.priority] || PRIORITY_STYLES['Medium'];
              return (
                <tr key={r.id} style={{ borderBottom:'1px solid #f8fafc' }}>

                  {/* Report ID */}
                  <td style={{ padding:'0.9rem 0', color:'#475569', fontSize:'0.77rem', fontWeight:'700', fontFamily:'monospace' }}>{r.id}</td>

                  {/* Reported By */}
                  <td>
                    <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                      <div style={{ width:'36px', height:'36px', borderRadius:'50%', background:AVATAR_COLORS[r.avatarIdx], color:'#fff', fontWeight:'800', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.82rem', flexShrink:0 }}>
                        {r.initials}
                      </div>
                      <div>
                        <strong style={{ fontSize:'0.85rem', color:'#0f172a', display:'block' }}>{r.reporterName}</strong>
                        <span style={{ fontSize:'0.73rem', color:'#64748b' }}>{r.reporterEmail}</span>
                      </div>
                    </div>
                  </td>

                  {/* Type Badge */}
                  <td>
                    <span style={{ background:tp.bg, color:tp.color, padding:'3px 10px', borderRadius:'8px', fontSize:'0.74rem', fontWeight:'800' }}>
                      {r.type}
                    </span>
                  </td>

                  {/* Reported Against */}
                  <td>
                    <div style={{ fontSize:'0.85rem', fontWeight:'700', color:'#0f172a' }}>{r.reportedAgainst}</div>
                    <span style={{ fontSize:'0.73rem', color:'#64748b' }}>{r.targetDetail}</span>
                  </td>

                  {/* Reason */}
                  <td style={{ color:'#334155', fontSize:'0.82rem', fontWeight:'600' }}>{r.reason}</td>

                  {/* Reported On */}
                  <td style={{ color:'#475569', fontSize:'0.8rem', fontWeight:'600' }}>{r.submittedOn}</td>

                  {/* Status */}
                  <td>
                    <span style={{ background:st.bg, color:st.color, border:`1px solid ${st.border}`, padding:'3px 10px', borderRadius:'8px', fontSize:'0.74rem', fontWeight:'800' }}>
                      {r.status}
                    </span>
                  </td>

                  {/* Priority */}
                  <td>
                    <span style={{ color:pr.color, background:pr.bg, padding:'3px 8px', borderRadius:'6px', fontSize:'0.74rem', fontWeight:'800' }}>
                      {r.priority}
                    </span>
                  </td>

                  {/* Actions */}
                  <td style={{ textAlign:'right', position:'relative' }}>
                    <div style={{ display:'inline-flex', gap:'6px', alignItems:'center' }}>
                      <button onClick={() => setSelectedReport(r)}
                        style={{ background:'#fff', color:'#334155', border:'1px solid #cbd5e1', borderRadius:'8px', padding:'0.4rem 0.85rem', fontWeight:'700', fontSize:'0.76rem', cursor:'pointer' }}>
                        View Details
                      </button>
                      <button onClick={() => setActiveDropdownId(activeDropdownId === r.id ? null : r.id)}
                        style={{ background:'#f8fafc', border:'1px solid #cbd5e1', borderRadius:'8px', width:'32px', height:'32px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <ChevronDown size={14} color="#64748b"/>
                      </button>
                    </div>

                    {activeDropdownId === r.id && (
                      <div style={{ position:'absolute', right:0, top:'100%', marginTop:'4px', background:'#fff', border:'1px solid #e2e8f0', borderRadius:'12px', boxShadow:'0 10px 30px rgba(0,0,0,0.12)', zIndex:60, padding:'4px', minWidth:'175px', textAlign:'left' }}>
                        <button onClick={() => updateStatus(r.id, 'Under Review')}
                          style={{ width:'100%', padding:'0.5rem 0.75rem', border:'none', background:'#eff6ff', color:'#2563eb', fontSize:'0.78rem', fontWeight:'700', cursor:'pointer', textAlign:'left', borderRadius:'6px', marginBottom:'2px', display:'block' }}>
                          🔍 Move to Under Review
                        </button>
                        <button onClick={() => updateStatus(r.id, 'Resolved')}
                          style={{ width:'100%', padding:'0.5rem 0.75rem', border:'none', background:'#f0fdf4', color:'#16a34a', fontSize:'0.78rem', fontWeight:'700', cursor:'pointer', textAlign:'left', borderRadius:'6px', marginBottom:'2px', display:'block' }}>
                          ✅ Mark as Resolved
                        </button>
                        <button onClick={() => updateStatus(r.id, 'Rejected')}
                          style={{ width:'100%', padding:'0.5rem 0.75rem', border:'none', background:'#fef2f2', color:'#dc2626', fontSize:'0.78rem', fontWeight:'700', cursor:'pointer', textAlign:'left', borderRadius:'6px', marginBottom:'2px', display:'block' }}>
                          ❌ Reject Report
                        </button>
                        <button onClick={() => updateStatus(r.id, 'Reopened')}
                          style={{ width:'100%', padding:'0.5rem 0.75rem', border:'none', background:'#f5f3ff', color:'#7c3aed', fontSize:'0.78rem', fontWeight:'700', cursor:'pointer', textAlign:'left', borderRadius:'6px', display:'block' }}>
                          🔄 Reopen Complaint
                        </button>
                      </div>
                    )}
                  </td>

                </tr>
              );
            })}
          </tbody>
        </table>

        {/* ── PAGINATION FOOTER ──────────────────────────────────────────────── */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', paddingTop:'1rem', borderTop:'1px solid #f1f5f9', fontSize:'0.82rem', color:'#64748b', marginTop:'0.75rem' }}>
          <div>Showing {filtered.length} of {reports.length} reports</div>
        </div>
      </div>

      {/* ── VIEW DETAILS MODAL ───────────────────────────────────────────────── */}
      {selectedReport && (
        <div style={{ position:'fixed', inset:0, background:'rgba(15,23,42,0.65)', backdropFilter:'blur(6px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:300, padding:'1rem' }}>
          <div style={{ width:'540px', background:'#fff', borderRadius:'24px', padding:'2rem', boxShadow:'0 25px 60px rgba(15,23,42,0.2)', border:'1px solid #e2e8f0' }}>

            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.25rem' }}>
              <div>
                <h3 style={{ fontSize:'1.1rem', fontWeight:'800', color:'#0f172a', margin:0 }}>Report &amp; Complaint Details</h3>
                <span style={{ fontSize:'0.75rem', color:'#64748b', fontFamily:'monospace' }}>{selectedReport.id}</span>
              </div>
              <button onClick={() => setSelectedReport(null)} style={{ background:'#f1f5f9', border:'none', borderRadius:'50%', width:'32px', height:'32px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <X size={16} color="#64748b"/>
              </button>
            </div>

            {/* Reporter Card */}
            <div style={{ display:'flex', alignItems:'center', gap:'1rem', background:'#f8fafc', padding:'1rem', borderRadius:'16px', marginBottom:'1rem' }}>
              <div style={{ width:'48px', height:'48px', borderRadius:'50%', background:AVATAR_COLORS[selectedReport.avatarIdx], color:'#fff', fontWeight:'800', fontSize:'1.1rem', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                {selectedReport.initials}
              </div>
              <div>
                <span style={{ fontSize:'0.72rem', color:'#64748b', fontWeight:'700', textTransform:'uppercase' }}>Reported By</span>
                <strong style={{ fontSize:'1rem', color:'#0f172a', display:'block' }}>{selectedReport.reporterName}</strong>
                <span style={{ fontSize:'0.82rem', color:'#6366f1' }}>{selectedReport.reporterEmail}</span>
              </div>
              <span style={{ marginLeft:'auto', background:TYPE_STYLES[selectedReport.type].bg, color:TYPE_STYLES[selectedReport.type].color, padding:'4px 12px', borderRadius:'10px', fontSize:'0.76rem', fontWeight:'800' }}>
                Target: {selectedReport.type}
              </span>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.85rem', fontSize:'0.84rem', marginBottom:'1.25rem' }}>
              <div><span style={{ color:'#64748b' }}>Reported Entity</span><strong style={{ display:'block', color:'#0f172a' }}>{selectedReport.reportedAgainst}</strong></div>
              <div><span style={{ color:'#64748b' }}>Entity Detail</span><span style={{ display:'block', color:'#334155' }}>{selectedReport.targetDetail}</span></div>
              <div><span style={{ color:'#64748b' }}>Reason / Complaint</span><strong style={{ display:'block', color:'#dc2626' }}>{selectedReport.reason}</strong></div>
              <div><span style={{ color:'#64748b' }}>Priority Level</span>
                <span style={{ display:'block', color:PRIORITY_STYLES[selectedReport.priority].color, fontWeight:'800', marginTop:'2px' }}>
                  {selectedReport.priority}
                </span>
              </div>
              <div><span style={{ color:'#64748b' }}>Reported On</span><span style={{ display:'block', color:'#334155' }}>{selectedReport.submittedOn}</span></div>
              <div><span style={{ color:'#64748b' }}>Current Status</span>
                <span style={{ display:'block', marginTop:'2px' }}>
                  <span style={{ background:STATUS_STYLES[selectedReport.status]?.bg, color:STATUS_STYLES[selectedReport.status]?.color, border:`1px solid ${STATUS_STYLES[selectedReport.status]?.border}`, padding:'2px 10px', borderRadius:'8px', fontSize:'0.76rem', fontWeight:'800' }}>
                    {selectedReport.status}
                  </span>
                </span>
              </div>
            </div>

            {/* Quick Action Decision Buttons */}
            <div style={{ borderTop:'1px solid #f1f5f9', paddingTop:'1rem' }}>
              <p style={{ fontSize:'0.78rem', fontWeight:'700', color:'#64748b', marginBottom:'0.65rem' }}>TAKE ADMINISTRATIVE ACTION</p>
              <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap' }}>
                <button onClick={() => updateStatus(selectedReport.id, 'Under Review')}
                  style={{ background:'#eff6ff', color:'#2563eb', border:'1px solid #bfdbfe', borderRadius:'8px', padding:'0.5rem 0.9rem', fontSize:'0.78rem', fontWeight:'700', cursor:'pointer' }}>
                  🔍 Move to Review
                </button>
                <button onClick={() => updateStatus(selectedReport.id, 'Resolved')}
                  style={{ background:'#f0fdf4', color:'#16a34a', border:'1px solid #bbf7d0', borderRadius:'8px', padding:'0.5rem 0.9rem', fontSize:'0.78rem', fontWeight:'700', cursor:'pointer' }}>
                  ✅ Mark Resolved
                </button>
                <button onClick={() => updateStatus(selectedReport.id, 'Rejected')}
                  style={{ background:'#fef2f2', color:'#dc2626', border:'1px solid #fca5a5', borderRadius:'8px', padding:'0.5rem 0.9rem', fontSize:'0.78rem', fontWeight:'700', cursor:'pointer' }}>
                  ❌ Reject Complaint
                </button>
                <button onClick={() => updateStatus(selectedReport.id, 'Reopened')}
                  style={{ background:'#f5f3ff', color:'#7c3aed', border:'1px solid #ddd6fe', borderRadius:'8px', padding:'0.5rem 0.9rem', fontSize:'0.78rem', fontWeight:'700', cursor:'pointer' }}>
                  🔄 Reopen Issue
                </button>
              </div>
            </div>

            <div style={{ display:'flex', justifyContent:'flex-end', marginTop:'1.25rem' }}>
              <button onClick={() => setSelectedReport(null)} style={{ padding:'0.65rem 1.4rem', borderRadius:'10px', background:'#6366f1', color:'#fff', border:'none', fontWeight:'800', cursor:'pointer' }}>Close</button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
