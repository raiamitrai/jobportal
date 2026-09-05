import React, { useState, useEffect } from 'react';
import {
  FileText, Download, Filter, Search, ChevronDown, ChevronLeft, ChevronRight,
  CheckCircle2, Clock, X, ShieldAlert, AlertTriangle, ShieldCheck, User, Users,
  MoreVertical, Eye, Trash2, Edit3, Plus, Settings, Lock, Database, Globe,
  Terminal, Monitor, MapPin, ArrowRight
} from 'lucide-react';

const STATUS_STYLES = {
  'Success': { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
  'Warning': { bg: '#fff7ed', color: '#ea580c', border: '#fed7aa' },
  'Failed':  { bg: '#fef2f2', color: '#dc2626', border: '#fca5a5' },
};

const ROLE_STYLES = {
  'Super Admin':   { bg: '#f3e8ff', color: '#7c3aed' },
  'Admin':         { bg: '#f0fdf4', color: '#16a34a' },
  'Recruiter':     { bg: '#fff7ed', color: '#ea580c' },
  'Company Admin': { bg: '#eff6ff', color: '#2563eb' },
  'System':        { bg: '#f1f5f9', color: '#475569' },
};

const AVATAR_COLORS = ['#6366f1', '#f59e0b', '#10b981', '#6366f1', '#3b82f6', '#6366f1', '#ec4899', '#64748b', '#10b981', '#6366f1'];

const DEFAULT_LOGS = [];

export default function AdminAuditLogsPage() {
  const [activeTab, setActiveTab]             = useState('All Logs');
  const [searchQuery, setSearchQuery]         = useState('');
  const [userFilter, setUserFilter]           = useState('All Users');
  const [actionFilter, setActionFilter]       = useState('All Actions');
  const [actionTypeFilter, setActionTypeFilter] = useState('All Action Types');
  const [moduleFilter, setModuleFilter]       = useState('All Modules');
  const [statusFilter, setStatusFilter]       = useState('All Status');
  const [roleFilter, setRoleFilter]           = useState('All Roles');
  const [activeDropdownId, setActiveDropdownId] = useState(null);

  // Close action dropdowns on click anywhere outside on screen
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.action-menu-container')) {
        setActiveDropdownId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [selectedLog, setSelectedLog]         = useState(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showClearModal, setShowClearModal]   = useState(false);
  const [showRetentionModal, setShowRetentionModal] = useState(false);
  const [toastMsg, setToastMsg]               = useState('');
  const [logs, setLogs]                       = useState(DEFAULT_LOGS);

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const filtered = logs.filter(l => {
    if (activeTab === 'Admin Actions' && l.role !== 'Admin' && l.role !== 'Super Admin') return false;
    if (activeTab === 'User Actions' && l.role !== 'Recruiter' && l.role !== 'Candidate') return false;
    if (activeTab === 'System Events' && l.role !== 'System') return false;
    if (activeTab === 'Security' && l.module !== 'Security' && l.actionType !== 'login') return false;

    if (actionTypeFilter !== 'All Action Types' && l.actionType !== actionTypeFilter) return false;
    if (moduleFilter !== 'All Modules' && l.module !== moduleFilter) return false;
    if (statusFilter !== 'All Status' && l.status !== statusFilter) return false;
    if (roleFilter !== 'All Roles' && l.role !== roleFilter) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (
        !l.userName.toLowerCase().includes(q) &&
        !l.userEmail.toLowerCase().includes(q) &&
        !l.actionText.toLowerCase().includes(q) &&
        !l.targetDetail.toLowerCase().includes(q) &&
        !l.id.toLowerCase().includes(q)
      ) return false;
    }
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', background: '#f8fafc', minHeight: '92vh', fontFamily: 'Inter, sans-serif' }}>

      {/* Toast Notification */}
      {toastMsg && (
        <div style={{ position: 'fixed', top: '24px', right: '24px', background: '#10b981', color: '#fff', padding: '0.9rem 1.4rem', borderRadius: '14px', boxShadow: '0 10px 25px rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', gap: '0.6rem', zIndex: 300, fontWeight: '700', fontSize: '0.9rem' }}>
          <CheckCircle2 size={20} /><span>{toastMsg}</span>
        </div>
      )}

      {/* ── HEADER ──────────────────────────────────────────────────────────── */}
      <div>
        <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '600', marginBottom: '4px' }}>
          Dashboard &gt; Audit Logs
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>Audit Logs</h1>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={() => setShowClearModal(true)}
              style={{ background: '#fff', color: '#dc2626', border: '1px solid #fca5a5', borderRadius: '12px', padding: '0.65rem 1.25rem', fontWeight: '700', fontSize: '0.86rem', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <Trash2 size={16} /> Clear Logs
            </button>
            <button onClick={() => setShowExportModal(true)}
              style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)', color: '#fff', border: 'none', borderRadius: '12px', padding: '0.65rem 1.25rem', fontWeight: '800', fontSize: '0.86rem', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', boxShadow: '0 4px 14px rgba(79,70,229,0.25)' }}>
              <Download size={16} /> Export Logs
            </button>
          </div>
        </div>
      </div>

      {/* ── 5 KPI CARDS ──────────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem' }}>
        {[
          { label: 'Total Logs',      val: logs.length, icon: <FileText size={18} />,    iconBg: '#f3e8ff', iconColor: '#7c3aed' },
          { label: 'Admin Actions',   val: logs.filter(l => l.role === 'Admin' || l.role === 'Super Admin').length, icon: <User size={18} />,        iconBg: '#fff7ed', iconColor: '#ea580c' },
          { label: 'User Actions',    val: logs.filter(l => l.role === 'Recruiter' || l.role === 'Candidate').length, icon: <Users size={18} />,       iconBg: '#eff6ff', iconColor: '#2563eb' },
          { label: 'System Events',   val: logs.filter(l => l.role === 'System').length, icon: <ShieldCheck size={18} />, iconBg: '#f0fdf4', iconColor: '#16a34a' },
          { label: 'Security Events', val: logs.filter(l => l.module === 'Security').length, icon: <ShieldAlert size={18} />, iconBg: '#fef2f2', iconColor: '#dc2626' },
        ].map((c, i) => (
          <div key={i} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '18px', padding: '1.25rem', boxShadow: '0 1px 4px rgba(15,23,42,0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: c.iconBg, color: c.iconColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{c.icon}</div>
              <div>
                <span style={{ fontSize: '0.76rem', fontWeight: '700', color: '#64748b', display: 'block' }}>{c.label}</span>
                <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', lineHeight: 1.1 }}>{c.val}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── MAIN 2-COLUMN LAYOUT: (TABLE + LOG DETAILS INSPECTOR) ────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: selectedLog ? '1fr 400px' : '1fr', gap: '1.25rem', alignItems: 'start' }}>

        {/* LEFT COLUMN: SEARCH & TABLE */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* Search & Multi-Filter Dropdowns Bar */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.55rem', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
              <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input type="text" placeholder="Search by action, user, target..."
                value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '0.6rem 1rem 0.6rem 2.25rem', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.82rem', outline: 'none', background: '#fff' }} />
            </div>

            <div style={{ display: 'flex', gap: '0.45rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <select value={userFilter} onChange={e => setUserFilter(e.target.value)}
                style={{ padding: '0.55rem 0.65rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.78rem', background: '#fff', fontWeight: '700', color: '#0f172a' }}>
                <option>All Users</option>
                <option>Admin</option>
                <option>Recruiters</option>
                <option>System</option>
              </select>

              <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
                style={{ padding: '0.55rem 0.65rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.78rem', background: '#fff', fontWeight: '700', color: '#0f172a' }}>
                <option>All Roles</option>
                <option>Super Admin</option>
                <option>Admin</option>
                <option>Recruiter</option>
                <option>Company Admin</option>
              </select>

              <select value={actionFilter} onChange={e => setActionFilter(e.target.value)}
                style={{ padding: '0.55rem 0.65rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.78rem', background: '#fff', fontWeight: '700', color: '#0f172a' }}>
                <option>All Actions</option>
                <option>Deleted User</option>
                <option>Updated Job</option>
                <option>Approved Company</option>
              </select>

              <select value={moduleFilter} onChange={e => setModuleFilter(e.target.value)}
                style={{ padding: '0.55rem 0.65rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.78rem', background: '#fff', fontWeight: '700', color: '#0f172a' }}>
                <option>All Modules</option>
                <option>Users</option>
                <option>Jobs</option>
                <option>Companies</option>
                <option>Settings</option>
              </select>

              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                style={{ padding: '0.55rem 0.65rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.78rem', background: '#fff', fontWeight: '700', color: '#0f172a' }}>
                <option>All Status</option>
                <option>Success</option>
                <option>Warning</option>
                <option>Failed</option>
              </select>

              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '0.55rem 0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '0.78rem', fontWeight: '700', color: '#334155', cursor: 'pointer' }}>
                📅 01 Aug - 10 Aug ▾
              </div>

              <button onClick={() => triggerToast('Advanced Log Filters toggled')}
                style={{ background: '#fff', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '0.55rem 0.75rem', fontSize: '0.78rem', fontWeight: '700', color: '#334155', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                <Filter size={13} /> Filters
              </button>

              <button onClick={() => { setSearchQuery(''); setUserFilter('All Users'); setRoleFilter('All Roles'); setActionFilter('All Actions'); setModuleFilter('All Modules'); setStatusFilter('All Status'); }}
                style={{ background: 'none', border: 'none', color: '#6366f1', fontWeight: '700', fontSize: '0.76rem', cursor: 'pointer' }}>
                Clear All
              </button>
            </div>
          </div>

          {/* Log Data Table */}
          <div className="table-responsive-wrapper" style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.25rem', boxShadow: '0 1px 4px rgba(15,23,42,0.02)', overflowX: 'auto' }}>
            <table style={{ width: '100%', minWidth: '980px', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                  {['ID', 'Time & Date', 'User', 'Role', 'Action', 'Module', 'Target', 'Details', 'IP Address', 'Status', 'Actions'].map((h, i) => (
                    <th key={i} style={{ paddingBottom: '0.8rem', fontWeight: '700', fontSize: '0.73rem', color: '#64748b', textAlign: i === 10 ? 'right' : 'left' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(l => {
                  const st = STATUS_STYLES[l.status] || STATUS_STYLES['Success'];
                  const rl = ROLE_STYLES[l.role] || ROLE_STYLES['System'];
                  const isSelected = selectedLog?.id === l.id;
                  return (
                    <tr key={l.id} onClick={() => setSelectedLog(l)}
                      style={{ borderBottom: '1px solid #f8fafc', background: isSelected ? '#f5f3ff' : 'transparent', cursor: 'pointer', transition: 'all 0.15s ease' }}>

                      {/* ID */}
                      <td style={{ padding: '0.85rem 0', color: '#475569', fontSize: '0.74rem', fontWeight: '700', fontFamily: 'monospace' }}>{l.id}</td>

                      {/* Time & Date */}
                      <td style={{ color: '#334155', fontSize: '0.76rem', fontWeight: '600', whiteSpace: 'nowrap' }}>{l.timestamp}</td>

                      {/* User */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: AVATAR_COLORS[l.avatarIdx], color: '#fff', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.78rem', flexShrink: 0 }}>
                            {l.initials}
                          </div>
                          <div>
                            <strong style={{ fontSize: '0.82rem', color: '#0f172a', display: 'block' }}>{l.userName}</strong>
                            <span style={{ fontSize: '0.71rem', color: '#64748b', display: 'block', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.userEmail}</span>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td>
                        <span style={{ background: rl.bg, color: rl.color, padding: '2px 8px', borderRadius: '6px', fontSize: '0.71rem', fontWeight: '800', whiteSpace: 'nowrap' }}>
                          {l.role}
                        </span>
                      </td>

                      {/* Action */}
                      <td style={{ fontWeight: '700', color: l.actionType === 'delete' ? '#dc2626' : (l.actionType === 'warning' ? '#ea580c' : '#0f172a'), whiteSpace: 'nowrap' }}>
                        {l.actionText}
                      </td>

                      {/* Module */}
                      <td style={{ color: '#475569', fontSize: '0.78rem', fontWeight: '600' }}>{l.module}</td>

                      {/* Target */}
                      <td>
                        <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#0f172a' }}>{l.targetId}</div>
                        <span style={{ fontSize: '0.71rem', color: '#64748b' }}>{l.targetDetail}</span>
                      </td>

                      {/* Details */}
                      <td style={{ color: '#334155', fontSize: '0.76rem', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {l.details}
                      </td>

                      {/* IP Address */}
                      <td style={{ color: '#64748b', fontSize: '0.76rem', fontFamily: 'monospace' }}>{l.ipAddress}</td>

                      {/* Status */}
                      <td>
                        <span style={{ background: st.bg, color: st.color, border: `1px solid ${st.border}`, padding: '2px 8px', borderRadius: '6px', fontSize: '0.71rem', fontWeight: '800' }}>
                          {l.status}
                        </span>
                      </td>

                      {/* Actions Menu */}
                      <td className="action-menu-container" style={{ textAlign: 'right', position: 'relative' }}>
                        <button onClick={() => setActiveDropdownId(prev => prev === l.id ? null : l.id)}
                          style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', width: '28px', height: '28px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                          <MoreVertical size={13} color="#64748b" />
                        </button>

                        {activeDropdownId === l.id && (
                          <div style={{ position: 'absolute', right: 0, top: '100%', marginTop: '4px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.12)', zIndex: 60, padding: '4px', minWidth: '150px', textAlign: 'left' }}>
                            <button onClick={() => { setSelectedLog(l); setActiveDropdownId(null); }}
                              style={{ width: '100%', padding: '0.45rem 0.75rem', border: 'none', background: '#eff6ff', color: '#2563eb', fontSize: '0.76rem', fontWeight: '700', cursor: 'pointer', textAlign: 'left', borderRadius: '6px', marginBottom: '2px', display: 'block' }}>
                              👁 View Log Inspector
                            </button>
                            <button onClick={() => { triggerToast(`Exported log ${l.id}`); setActiveDropdownId(null); }}
                              style={{ width: '100%', padding: '0.45rem 0.75rem', border: 'none', background: '#f8fafc', color: '#334155', fontSize: '0.76rem', fontWeight: '700', cursor: 'pointer', textAlign: 'left', borderRadius: '6px', display: 'block' }}>
                              📥 Download Log Record
                            </button>
                          </div>
                        )}
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Pagination Footer */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid #f1f5f9', fontSize: '0.8rem', color: '#64748b', marginTop: '0.75rem' }}>
              <div>Showing {filtered.length} of {logs.length} logs</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <button style={{ border: '1px solid #cbd5e1', background: '#fff', borderRadius: '8px', width: '30px', height: '30px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ChevronLeft size={14} color="#64748b" /></button>
                  {[1, 2, 3].map(p => (
                    <button key={p} style={{ border: p === 1 ? 'none' : '1px solid #cbd5e1', background: p === 1 ? '#6366f1' : '#fff', color: p === 1 ? '#fff' : '#334155', borderRadius: '8px', width: '30px', height: '30px', fontWeight: '800', cursor: 'pointer' }}>{p}</button>
                  ))}
                  <span style={{ padding: '0 4px' }}>...</span>
                  <button style={{ border: '1px solid #cbd5e1', background: '#fff', borderRadius: '8px', padding: '0 8px', height: '30px', fontWeight: '700', cursor: 'pointer', color: '#334155' }}>2486</button>
                  <button style={{ border: '1px solid #cbd5e1', background: '#fff', borderRadius: '8px', width: '30px', height: '30px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ChevronRight size={14} color="#64748b" /></button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '0.78rem' }}>Rows per page:</span>
                  <select style={{ padding: '0.35rem 0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.78rem', background: '#fff', fontWeight: '700', color: '#334155' }}>
                    <option>10</option>
                    <option>25</option>
                    <option>50</option>
                  </select>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* RIGHT COLUMN: LOG DETAILS INSPECTOR PANEL */}
        {selectedLog && (
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '24px', padding: '1.5rem', boxShadow: '0 4px 20px rgba(15,23,42,0.03)', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>

            {/* Header Box */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: selectedLog.actionType === 'delete' ? '#fef2f2' : '#eff6ff', color: selectedLog.actionType === 'delete' ? '#dc2626' : '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {selectedLog.actionType === 'delete' ? <Trash2 size={20} /> : <FileText size={20} />}
                </div>
                <div>
                  <strong style={{ fontSize: '1rem', color: '#0f172a', display: 'block', lineHeight: 1.2 }}>{selectedLog.actionText}</strong>
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{selectedLog.timestamp}</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ background: STATUS_STYLES[selectedLog.status]?.bg, color: STATUS_STYLES[selectedLog.status]?.color, border: `1px solid ${STATUS_STYLES[selectedLog.status]?.border}`, padding: '3px 9px', borderRadius: '8px', fontSize: '0.74rem', fontWeight: '800' }}>
                  {selectedLog.status}
                </span>
                <button onClick={() => setSelectedLog(null)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '26px', height: '26px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <X size={14} color="#64748b" />
                </button>
              </div>
            </div>

            {/* Log Key-Value Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', fontSize: '0.82rem', background: '#f8fafc', padding: '1rem', borderRadius: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>Log ID</span><span style={{ color: '#0f172a', fontFamily: 'monospace', fontWeight: '700', fontSize: '0.76rem' }}>{selectedLog.id}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>User</span><strong style={{ color: '#0f172a' }}>{selectedLog.userName} ({selectedLog.role})</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>IP Address</span><span style={{ color: '#334155', fontFamily: 'monospace', fontWeight: '600' }}>{selectedLog.ipAddress}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>Module</span><strong style={{ color: '#0f172a' }}>{selectedLog.module}</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>Target</span><span style={{ color: '#0f172a', textAlign: 'right', fontWeight: '700' }}>{selectedLog.targetId}<br /><span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '500' }}>{selectedLog.targetDetail}</span></span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>Action</span><strong style={{ color: '#0f172a' }}>{selectedLog.actionText}</strong></div>
            </div>

            {/* Description */}
            <div>
              <p style={{ fontSize: '0.76rem', fontWeight: '700', color: '#64748b', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Description</p>
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '0.85rem 1rem', fontSize: '0.82rem', color: '#334155', lineHeight: 1.45, fontWeight: '500' }}>
                {selectedLog.details}
              </div>
            </div>

            {/* Device / Browser & Location */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.78rem' }}>
              <div>
                <span style={{ color: '#64748b', fontWeight: '700', display: 'block', marginBottom: '2px' }}>Device / Browser</span>
                <span style={{ color: '#0f172a', fontWeight: '600' }}>{selectedLog.deviceInfo}</span>
              </div>

              <div>
                <span style={{ color: '#64748b', fontWeight: '700', display: 'block', marginBottom: '2px' }}>Location</span>
                <span style={{ color: '#0f172a', fontWeight: '600' }}>{selectedLog.location}</span>
              </div>
            </div>

            {/* Related Information */}
            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '0.85rem' }}>
              <p style={{ fontSize: '0.76rem', fontWeight: '700', color: '#64748b', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Related Information</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.78rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>Joined On</span><span style={{ color: '#334155', fontWeight: '600' }}>{selectedLog.joinedOn}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>Last Login</span><span style={{ color: '#334155', fontWeight: '600' }}>{selectedLog.lastLogin}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>Status</span><span style={{ color: '#dc2626', fontWeight: '800' }}>{selectedLog.targetStatus}</span></div>
              </div>
            </div>

            {/* Bottom Action Button */}
            <div style={{ paddingTop: '0.5rem' }}>
              <button onClick={() => triggerToast(`Navigating to profile for ${selectedLog.userName}...`)}
                style={{ width: '100%', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '0.65rem 1rem', fontSize: '0.82rem', fontWeight: '800', color: '#6366f1', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <Eye size={15} /> View User Profile
              </button>
            </div>

          </div>
        )}

      </div>

      {/* ── LOG RETENTION SETTINGS MODAL ─────────────────────────────────────── */}
      {showRetentionModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: '1rem' }}>
          <div style={{ width: '480px', background: '#fff', borderRadius: '24px', padding: '2rem', boxShadow: '0 25px 60px rgba(15,23,42,0.2)', border: '1px solid #e2e8f0' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Log Retention Settings</h3>
              <button onClick={() => setShowRetentionModal(false)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={16} color="#64748b" />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.85rem' }}>
              <div>
                <label style={{ fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>Keep Audit Logs For</label>
                <select style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontWeight: '700', color: '#334155' }}>
                  <option>90 Days (Recommended)</option>
                  <option>180 Days</option>
                  <option>1 Year</option>
                  <option>Indefinite (No Auto-Purge)</option>
                </select>
              </div>

              <div>
                <label style={{ fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>Auto-Archive to S3 Cold Storage</label>
                <select style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontWeight: '700', color: '#334155' }}>
                  <option>Enabled (Daily GZIP archive)</option>
                  <option>Disabled</option>
                </select>
              </div>

              <div>
                <label style={{ fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>Syslog / SIEM Forwarding</label>
                <input type="text" defaultValue="udp://siem.careonix.internal:514" style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontWeight: '600', color: '#334155' }} />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button onClick={() => setShowRetentionModal(false)} style={{ padding: '0.65rem 1.25rem', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#fff', color: '#334155', fontWeight: '700', cursor: 'pointer' }}>Cancel</button>
              <button onClick={() => { setShowRetentionModal(false); triggerToast('✅ Log Retention Policy saved!'); }} style={{ padding: '0.65rem 1.4rem', borderRadius: '10px', background: '#6366f1', color: '#fff', border: 'none', fontWeight: '800', cursor: 'pointer' }}>Save Settings</button>
            </div>

          </div>
        </div>
      )}

      {/* ── EXPORT LOGS MODAL ──────────────────────────────────────────────── */}
      {showExportModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: '1rem' }}>
          <div style={{ width: '460px', background: '#fff', borderRadius: '24px', padding: '2rem', boxShadow: '0 25px 60px rgba(15,23,42,0.2)', border: '1px solid #e2e8f0' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Export Audit Logs</h3>
              <button onClick={() => setShowExportModal(false)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={16} color="#64748b" />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.85rem' }}>
              <div>
                <label style={{ fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>Export Format</label>
                <select style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontWeight: '700', color: '#334155' }}>
                  <option>CSV (.csv)</option>
                  <option>JSON Lines (.jsonl)</option>
                  <option>PDF Compliance Report</option>
                </select>
              </div>

              <div>
                <label style={{ fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>Date Range</label>
                <select style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontWeight: '700', color: '#334155' }}>
                  <option>Last 10 Days (01 Aug - 10 Aug 2026)</option>
                  <option>Last 30 Days</option>
                  <option>Custom Date Range</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button onClick={() => setShowExportModal(false)} style={{ padding: '0.65rem 1.25rem', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#fff', color: '#334155', fontWeight: '700', cursor: 'pointer' }}>Cancel</button>
              <button onClick={() => { setShowExportModal(false); triggerToast('✅ Audit logs exported & downloading...'); }} style={{ padding: '0.65rem 1.4rem', borderRadius: '10px', background: 'linear-gradient(135deg,#6366f1,#4f46e5)', color: '#fff', border: 'none', fontWeight: '800', cursor: 'pointer' }}>Download Export</button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
