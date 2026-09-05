import React, { useState } from 'react';
import {
  Search, Filter, Download, ChevronDown, ChevronLeft, ChevronRight,
  CheckCircle2, Clock, X, FileText, Eye, AlertCircle, ShieldAlert,
  RefreshCw, XCircle, ShieldCheck, Flag, Plus, Calendar
} from 'lucide-react';

const STATUS_STYLES = {
  'Pending Review': { bg: '#fff7ed', color: '#ea580c', border: '#fed7aa' },
  'Under Review':  { bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe' },
  'Resolved':      { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
  'Rejected':      { bg: '#fef2f2', color: '#dc2626', border: '#fca5a5' },
  'Reopened':      { bg: '#f5f3ff', color: '#7c3aed', border: '#ddd6fe' },
};

const TYPE_STYLES = {
  'Fake Job / Scam':       { bg: '#fff7ed', color: '#ea580c' },
  'Inappropriate Content': { bg: '#f3e8ff', color: '#7c3aed' },
  'Harassment':            { bg: '#fef2f2', color: '#dc2626' },
  'Spam':                  { bg: '#eff6ff', color: '#2563eb' },
  'Other':                 { bg: '#f1f5f9', color: '#475569' },
};

const PRIORITY_STYLES = {
  'High':   { color: '#dc2626', bg: '#fef2f2' },
  'Medium': { color: '#d97706', bg: '#fffbeb' },
  'Low':    { color: '#16a34a', bg: '#f0fdf4' },
};

const AVATAR_COLORS = ['#6366f1', '#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899'];

const DEFAULT_REPORTS = [];

export default function AdminAnalyticsReportsPage() {
  const [searchQuery, setSearchQuery]         = useState('');
  const [typeFilter, setTypeFilter]           = useState('All Report Types');
  const [statusFilter, setStatusFilter]       = useState('All Status');
  const [priorityFilter, setPriorityFilter]   = useState('All Priority');
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  const [selectedReport, setSelectedReport]   = useState(null);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [toastMsg, setToastMsg]               = useState('');
  const [reports, setReports]                 = useState(DEFAULT_REPORTS);

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const filtered = reports.filter(r => {
    if (typeFilter !== 'All Report Types' && r.type !== typeFilter) return false;
    if (statusFilter !== 'All Status' && r.status !== statusFilter) return false;
    if (priorityFilter !== 'All Priority' && r.priority !== priorityFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (
        !r.id.toLowerCase().includes(q) &&
        !r.reporterName.toLowerCase().includes(q) &&
        !r.reason.toLowerCase().includes(q) &&
        !r.targetName.toLowerCase().includes(q)
      ) return false;
    }
    return true;
  });

  const updateStatus = (rptId, newStatus) => {
    setReports(prev => prev.map(r => r.id === rptId ? { ...r, status: newStatus } : r));
    setActiveDropdownId(null);
    setSelectedReport(prev => prev && prev.id === rptId ? { ...prev, status: newStatus } : prev);
    triggerToast(`✅ Report ${rptId} updated to "${newStatus}"`);
  };

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
          Dashboard &gt; Reports
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>Reports</h1>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={() => triggerToast('Exporting Reports summary...')}
              style={{ background: '#fff', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '0.65rem 1.25rem', fontWeight: '700', fontSize: '0.86rem', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <Download size={16} /> Export Report
            </button>
            <button onClick={() => setShowCustomModal(true)}
              style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)', color: '#fff', border: 'none', borderRadius: '12px', padding: '0.65rem 1.25rem', fontWeight: '800', fontSize: '0.86rem', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', boxShadow: '0 4px 14px rgba(79,70,229,0.25)' }}>
              Create Custom Report
            </button>
          </div>
        </div>
      </div>

      {/* ── 5 KPI CARDS ──────────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem' }}>
        {[
          { label: 'Total Reports',  val: reports.length, icon: <FileText size={18} />,    iconBg: '#f3e8ff', iconColor: '#7c3aed' },
          { label: 'Pending Review', val: reports.filter(r => r.status === 'Pending Review' || r.status === 'Pending').length, icon: <Clock size={18} />,       iconBg: '#fff7ed', iconColor: '#ea580c' },
          { label: 'Resolved',       val: reports.filter(r => r.status === 'Resolved').length, icon: <CheckCircle2 size={18} />,iconBg: '#f0fdf4', iconColor: '#16a34a' },
          { label: 'Rejected',       val: reports.filter(r => r.status === 'Rejected').length, icon: <XCircle size={18} />,     iconBg: '#fef2f2', iconColor: '#dc2626' },
          { label: 'Reopened',       val: reports.filter(r => r.status === 'Reopened').length, icon: <RefreshCw size={18} />,   iconBg: '#eff6ff', iconColor: '#2563eb' },
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

      {/* ── ROW 1 (CHARTS: Overview, By Type, By Status) ──────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>

        {/* Reports Overview */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.35rem', boxShadow: '0 1px 4px rgba(15,23,42,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <strong style={{ fontSize: '0.95rem', color: '#0f172a', fontWeight: '800' }}>Reports Overview</strong>
            <select style={{ padding: '3px 8px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.75rem', fontWeight: '700', background: '#fff', color: '#334155' }}>
              <option>Daily</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.7rem', fontWeight: '700', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
            <span style={{ color: '#6366f1', display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#6366f1' }}></span>Total Reports</span>
            <span style={{ color: '#ea580c', display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ea580c' }}></span>Pending</span>
            <span style={{ color: '#16a34a', display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#16a34a' }}></span>Resolved</span>
            <span style={{ color: '#dc2626', display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#dc2626' }}></span>Rejected</span>
          </div>

          <div style={{ height: '170px', position: 'relative' }}>
            <svg width="100%" height="100%" viewBox="0 0 400 170" preserveAspectRatio="none">
              <line x1="0" y1="35" x2="400" y2="35" stroke="#f1f5f9" strokeDasharray="4 4" />
              <line x1="0" y1="80" x2="400" y2="80" stroke="#f1f5f9" strokeDasharray="4 4" />
              <line x1="0" y1="125" x2="400" y2="125" stroke="#f1f5f9" strokeDasharray="4 4" />

              {/* Total Reports Line */}
              <polyline fill="none" stroke="#6366f1" strokeWidth="2.5" points="0,150 40,150 80,150 120,150 160,150 200,150 240,150 280,150 320,150 360,150" />
            </svg>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#94a3b8', marginTop: '6px', fontWeight: '600' }}>
            <span>01 Aug</span><span>02 Aug</span><span>03 Aug</span><span>04 Aug</span><span>05 Aug</span><span>06 Aug</span><span>07 Aug</span><span>08 Aug</span><span>09 Aug</span><span>10 Aug</span>
          </div>
        </div>

        {/* Reports by Type */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.35rem', boxShadow: '0 1px 4px rgba(15,23,42,0.02)' }}>
          <strong style={{ fontSize: '0.95rem', color: '#0f172a', fontWeight: '800', display: 'block', marginBottom: '1rem' }}>Reports by Type</strong>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: '1rem', alignItems: 'center' }}>
            <div style={{ position: 'relative', width: '125px', height: '125px', margin: '0 auto' }}>
              <svg width="125" height="125" viewBox="0 0 42 42">
                <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#f1f5f9" strokeWidth="6" />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#0f172a', lineHeight: 1.1 }}>{reports.length}</span>
                <span style={{ fontSize: '0.66rem', color: '#64748b', fontWeight: '600' }}>Total</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.74rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#334155', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '5px' }}><span style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#6366f1' }}></span>Inappropriate Content</span>
                <strong style={{ color: '#0f172a' }}>0</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#334155', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '5px' }}><span style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#10b981' }}></span>Fake Job / Scam</span>
                <strong style={{ color: '#0f172a' }}>0</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#334155', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '5px' }}><span style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#3b82f6' }}></span>Harassment</span>
                <strong style={{ color: '#0f172a' }}>0</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#334155', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '5px' }}><span style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#f59e0b' }}></span>Spam</span>
                <strong style={{ color: '#0f172a' }}>0</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#334155', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '5px' }}><span style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#ef4444' }}></span>Other</span>
                <strong style={{ color: '#0f172a' }}>0</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Reports by Status */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.35rem', boxShadow: '0 1px 4px rgba(15,23,42,0.02)' }}>
          <strong style={{ fontSize: '0.95rem', color: '#0f172a', fontWeight: '800', display: 'block', marginBottom: '1rem' }}>Reports by Status</strong>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: '1rem', alignItems: 'center' }}>
            <div style={{ position: 'relative', width: '125px', height: '125px', margin: '0 auto' }}>
              <svg width="125" height="125" viewBox="0 0 42 42">
                <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#f1f5f9" strokeWidth="6" />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#0f172a', lineHeight: 1.1 }}>{reports.length}</span>
                <span style={{ fontSize: '0.66rem', color: '#64748b', fontWeight: '600' }}>Total</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.74rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#334155', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '5px' }}><span style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#f59e0b' }}></span>Pending Review</span>
                <strong style={{ color: '#0f172a' }}>{reports.filter(r => r.status === 'Pending Review' || r.status === 'Pending').length}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#334155', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '5px' }}><span style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#3b82f6' }}></span>Under Review</span>
                <strong style={{ color: '#0f172a' }}>{reports.filter(r => r.status === 'Under Review').length}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#334155', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '5px' }}><span style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#10b981' }}></span>Resolved</span>
                <strong style={{ color: '#0f172a' }}>{reports.filter(r => r.status === 'Resolved').length}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#334155', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '5px' }}><span style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#ef4444' }}></span>Rejected</span>
                <strong style={{ color: '#0f172a' }}>{reports.filter(r => r.status === 'Rejected').length}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#334155', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '5px' }}><span style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#8b5cf6' }}></span>Reopened</span>
                <strong style={{ color: '#0f172a' }}>{reports.filter(r => r.status === 'Reopened').length}</strong>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ── SEARCH & FILTERS BAR ─────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ position: 'relative', width: '320px' }}>
          <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input type="text" placeholder="Search by Report ID, reason, reporter..."
            value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '0.65rem 1rem 0.65rem 2.25rem', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.84rem', outline: 'none', background: '#fff' }} />
        </div>

        <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
            style={{ padding: '0.6rem 0.85rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.82rem', background: '#fff', fontWeight: '700', color: '#0f172a' }}>
            <option>All Report Types</option>
            <option>Fake Job / Scam</option>
            <option>Inappropriate Content</option>
            <option>Harassment</option>
            <option>Spam</option>
          </select>

          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            style={{ padding: '0.6rem 0.85rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.82rem', background: '#fff', fontWeight: '700', color: '#0f172a' }}>
            <option>All Status</option>
            <option>Pending Review</option>
            <option>Under Review</option>
            <option>Resolved</option>
            <option>Rejected</option>
          </select>

          <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}
            style={{ padding: '0.6rem 0.85rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.82rem', background: '#fff', fontWeight: '700', color: '#0f172a' }}>
            <option>All Priority</option>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0.6rem 0.9rem', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '0.82rem', fontWeight: '700', color: '#334155', cursor: 'pointer' }}>
            📅 01 Aug 2026 - 10 Aug 2026 <ChevronDown size={13} color="#94a3b8" />
          </div>

          <button onClick={() => { setSearchQuery(''); setTypeFilter('All Report Types'); setStatusFilter('All Status'); setPriorityFilter('All Priority'); }}
            style={{ background: 'none', border: 'none', color: '#6366f1', fontWeight: '700', fontSize: '0.82rem', cursor: 'pointer' }}>
            Clear Filters
          </button>
        </div>
      </div>

      {/* ── DATA TABLE ───────────────────────────────────────────────────────── */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.5rem', boxShadow: '0 1px 4px rgba(15,23,42,0.02)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
              {['Report ID', 'Reported By', 'Reported Against', 'Type', 'Reason', 'Priority', 'Status', 'Reported On', 'Actions'].map((h, i) => (
                <th key={i} style={{ paddingBottom: '0.9rem', fontWeight: '700', fontSize: '0.75rem', color: '#64748b', textAlign: i === 8 ? 'right' : 'left' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => {
              const st = STATUS_STYLES[r.status] || STATUS_STYLES['Pending Review'];
              const tp = TYPE_STYLES[r.type] || TYPE_STYLES['Other'];
              const pr = PRIORITY_STYLES[r.priority] || PRIORITY_STYLES['Medium'];
              return (
                <tr key={r.id} style={{ borderBottom: '1px solid #f8fafc' }}>

                  {/* Report ID */}
                  <td style={{ padding: '0.9rem 0', color: '#475569', fontSize: '0.77rem', fontWeight: '700', fontFamily: 'monospace' }}>{r.id}</td>

                  {/* Reported By */}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: AVATAR_COLORS[r.avatarIdx], color: '#fff', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.82rem', flexShrink: 0 }}>
                        {r.initials}
                      </div>
                      <div>
                        <strong style={{ fontSize: '0.85rem', color: '#0f172a', display: 'block' }}>{r.reporterName}</strong>
                        <span style={{ fontSize: '0.73rem', color: '#64748b' }}>{r.reporterEmail}</span>
                      </div>
                    </div>
                  </td>

                  {/* Reported Against */}
                  <td>
                    <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#0f172a' }}>{r.targetName}</div>
                    <span style={{ fontSize: '0.73rem', color: '#64748b' }}>{r.targetSub}</span>
                  </td>

                  {/* Type */}
                  <td>
                    <span style={{ background: tp.bg, color: tp.color, padding: '3px 10px', borderRadius: '8px', fontSize: '0.74rem', fontWeight: '800', whiteSpace: 'nowrap' }}>
                      {r.type}
                    </span>
                  </td>

                  {/* Reason */}
                  <td style={{ color: '#334155', fontSize: '0.82rem', fontWeight: '600' }}>{r.reason}</td>

                  {/* Priority */}
                  <td>
                    <span style={{ color: pr.color, background: pr.bg, padding: '3px 8px', borderRadius: '6px', fontSize: '0.74rem', fontWeight: '800' }}>
                      {r.priority}
                    </span>
                  </td>

                  {/* Status */}
                  <td>
                    <span style={{ background: st.bg, color: st.color, border: `1px solid ${st.border}`, padding: '3px 10px', borderRadius: '8px', fontSize: '0.74rem', fontWeight: '800', whiteSpace: 'nowrap' }}>
                      {r.status}
                    </span>
                  </td>

                  {/* Reported On */}
                  <td style={{ color: '#475569', fontSize: '0.8rem', fontWeight: '600' }}>{r.submittedOn}</td>

                  {/* Actions */}
                  <td style={{ textAlign: 'right', position: 'relative' }}>
                    <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                      <button onClick={() => setSelectedReport(r)}
                        style={{ background: '#fff', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0.4rem 0.85rem', fontWeight: '700', fontSize: '0.76rem', cursor: 'pointer' }}>
                        View Details
                      </button>
                      <button onClick={() => setActiveDropdownId(activeDropdownId === r.id ? null : r.id)}
                        style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ChevronDown size={14} color="#64748b" />
                      </button>
                    </div>

                    {activeDropdownId === r.id && (
                      <div style={{ position: 'absolute', right: 0, top: '100%', marginTop: '4px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.12)', zIndex: 60, padding: '4px', minWidth: '175px', textAlign: 'left' }}>
                        <button onClick={() => updateStatus(r.id, 'Under Review')}
                          style={{ width: '100%', padding: '0.5rem 0.75rem', border: 'none', background: '#eff6ff', color: '#2563eb', fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer', textAlign: 'left', borderRadius: '6px', marginBottom: '2px', display: 'block' }}>
                          🔍 Move to Under Review
                        </button>
                        <button onClick={() => updateStatus(r.id, 'Resolved')}
                          style={{ width: '100%', padding: '0.5rem 0.75rem', border: 'none', background: '#f0fdf4', color: '#16a34a', fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer', textAlign: 'left', borderRadius: '6px', marginBottom: '2px', display: 'block' }}>
                          ✅ Mark as Resolved
                        </button>
                        <button onClick={() => updateStatus(r.id, 'Rejected')}
                          style={{ width: '100%', padding: '0.5rem 0.75rem', border: 'none', background: '#fef2f2', color: '#dc2626', fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer', textAlign: 'left', borderRadius: '6px', display: 'block' }}>
                          ❌ Reject Report
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid #f1f5f9', fontSize: '0.82rem', color: '#64748b', marginTop: '0.75rem' }}>
          <div>Showing 1 to {filtered.length} of 1,248 reports</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <button style={{ border: '1px solid #cbd5e1', background: '#fff', borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ChevronLeft size={14} color="#64748b" /></button>
              {[1, 2, 3].map(p => (
                <button key={p} style={{ border: p === 1 ? 'none' : '1px solid #cbd5e1', background: p === 1 ? '#6366f1' : '#fff', color: p === 1 ? '#fff' : '#334155', borderRadius: '8px', width: '32px', height: '32px', fontWeight: '800', cursor: 'pointer' }}>{p}</button>
              ))}
              <span style={{ padding: '0 4px' }}>...</span>
              <button style={{ border: '1px solid #cbd5e1', background: '#fff', borderRadius: '8px', padding: '0 8px', height: '32px', fontWeight: '700', cursor: 'pointer', color: '#334155' }}>125</button>
              <button style={{ border: '1px solid #cbd5e1', background: '#fff', borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ChevronRight size={14} color="#64748b" /></button>
            </div>
            <select style={{ padding: '0.45rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.8rem', background: '#fff', fontWeight: '700', color: '#334155' }}>
              <option>10 / page</option>
              <option>25 / page</option>
              <option>50 / page</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── CREATE CUSTOM REPORT MODAL ─────────────────────────────────────── */}
      {showCustomModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: '1rem' }}>
          <div style={{ width: '500px', background: '#fff', borderRadius: '24px', padding: '2rem', boxShadow: '0 25px 60px rgba(15,23,42,0.2)', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Create Custom Report</h3>
              <button onClick={() => setShowCustomModal(false)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={16} color="#64748b" />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.85rem' }}>
              <div>
                <label style={{ fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>Report Name</label>
                <input type="text" placeholder="e.g. Q3 Platform Security Audit" style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none' }} />
              </div>

              <div>
                <label style={{ fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>Include Categories</label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {['User Growth', 'Job Postings', 'Reported Jobs', 'Hiring Conversions', 'Security Complaints'].map((cat, idx) => (
                    <span key={idx} style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '4px 10px', borderRadius: '8px', fontWeight: '700', color: '#334155', cursor: 'pointer', fontSize: '0.78rem' }}>
                      + {cat}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>File Format</label>
                <select style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontWeight: '700', color: '#334155' }}>
                  <option>PDF (Formatted Dashboard Summary)</option>
                  <option>CSV (Raw Data Table Export)</option>
                  <option>Excel (.XLSX)</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button onClick={() => setShowCustomModal(false)} style={{ padding: '0.65rem 1.25rem', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#fff', color: '#334155', fontWeight: '700', cursor: 'pointer' }}>Cancel</button>
              <button onClick={() => { setShowCustomModal(false); triggerToast('✅ Custom report generated & downloading...'); }} style={{ padding: '0.65rem 1.4rem', borderRadius: '10px', background: 'linear-gradient(135deg,#6366f1,#4f46e5)', color: '#fff', border: 'none', fontWeight: '800', cursor: 'pointer' }}>Generate &amp; Download</button>
            </div>
          </div>
        </div>
      )}

      {/* ── VIEW DETAILS MODAL ───────────────────────────────────────────────── */}
      {selectedReport && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: '1rem' }}>
          <div style={{ width: '520px', background: '#fff', borderRadius: '24px', padding: '2rem', boxShadow: '0 25px 60px rgba(15,23,42,0.2)', border: '1px solid #e2e8f0' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Report Details</h3>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'monospace' }}>{selectedReport.id}</span>
              </div>
              <button onClick={() => setSelectedReport(null)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={16} color="#64748b" />
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#f8fafc', padding: '1rem', borderRadius: '16px', marginBottom: '1rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: AVATAR_COLORS[selectedReport.avatarIdx], color: '#fff', fontWeight: '800', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {selectedReport.initials}
              </div>
              <div>
                <strong style={{ fontSize: '1rem', color: '#0f172a', display: 'block' }}>{selectedReport.reporterName}</strong>
                <span style={{ fontSize: '0.82rem', color: '#6366f1' }}>{selectedReport.reporterEmail}</span>
              </div>
              <span style={{ marginLeft: 'auto', background: TYPE_STYLES[selectedReport.type]?.bg, color: TYPE_STYLES[selectedReport.type]?.color, padding: '4px 12px', borderRadius: '10px', fontSize: '0.76rem', fontWeight: '800' }}>
                {selectedReport.type}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', fontSize: '0.84rem', marginBottom: '1.25rem' }}>
              <div><span style={{ color: '#64748b' }}>Reported Entity</span><strong style={{ display: 'block', color: '#0f172a' }}>{selectedReport.targetName} ({selectedReport.targetSub})</strong></div>
              <div><span style={{ color: '#64748b' }}>Reason</span><strong style={{ display: 'block', color: '#dc2626' }}>{selectedReport.reason}</strong></div>
              <div><span style={{ color: '#64748b' }}>Priority</span><span style={{ display: 'block', color: PRIORITY_STYLES[selectedReport.priority]?.color, fontWeight: '800', marginTop: '2px' }}>{selectedReport.priority}</span></div>
              <div><span style={{ color: '#64748b' }}>Current Status</span>
                <span style={{ display: 'block', marginTop: '2px' }}>
                  <span style={{ background: STATUS_STYLES[selectedReport.status]?.bg, color: STATUS_STYLES[selectedReport.status]?.color, border: `1px solid ${STATUS_STYLES[selectedReport.status]?.border}`, padding: '2px 10px', borderRadius: '8px', fontSize: '0.76rem', fontWeight: '800' }}>
                    {selectedReport.status}
                  </span>
                </span>
              </div>
              <div><span style={{ color: '#64748b' }}>Reported On</span><span style={{ display: 'block', color: '#334155' }}>{selectedReport.submittedOn}</span></div>
            </div>

            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
              <p style={{ fontSize: '0.78rem', fontWeight: '700', color: '#64748b', marginBottom: '0.65rem' }}>ADMIN ACTIONS</p>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {['Pending Review', 'Under Review', 'Resolved', 'Rejected'].map(s => {
                  const st = STATUS_STYLES[s];
                  return (
                    <button key={s} onClick={() => updateStatus(selectedReport.id, s)}
                      style={{ background: st.bg, color: st.color, border: `1px solid ${st.border}`, borderRadius: '8px', padding: '0.4rem 0.85rem', fontSize: '0.76rem', fontWeight: '700', cursor: 'pointer' }}>
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
              <button onClick={() => setSelectedReport(null)} style={{ padding: '0.65rem 1.4rem', borderRadius: '10px', background: '#6366f1', color: '#fff', border: 'none', fontWeight: '800', cursor: 'pointer' }}>Close</button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
