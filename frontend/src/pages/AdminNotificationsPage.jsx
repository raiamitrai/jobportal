import React, { useState, useEffect } from 'react';
import {
  Send, Mail, MessageSquare, CheckCircle2, XCircle, Clock,
  Filter, Search, ChevronDown, ChevronLeft, ChevronRight,
  Settings, Plus, Bell, Smartphone, ShieldAlert, Award,
  Users, Eye, MoreVertical, X, ArrowRight, ExternalLink, Zap, FileText
} from 'lucide-react';

import { useNotifications } from '../context/NotificationContext';
import { formatRelativeTime, formatExactDateTime, useRelativeTimeTick } from '../utils/timeAgo';

const STATUS_STYLES = {
  'Delivered': { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
  'Failed':    { bg: '#fef2f2', color: '#dc2626', border: '#fca5a5' },
  'Scheduled': { bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe' },
  'Sent':      { bg: '#f5f3ff', color: '#7c3aed', border: '#ddd6fe' },
  'Draft':     { bg: '#f1f5f9', color: '#475569', border: '#cbd5e1' },
};

const TYPE_STYLES = {
  'Job Alert':      { bg: '#f3e8ff', color: '#7c3aed' },
  'Welcome':        { bg: '#f0fdf4', color: '#16a34a' },
  'Account Update': { bg: '#fff7ed', color: '#ea580c' },
  'Interview':      { bg: '#f3e8ff', color: '#7c3aed' },
  'Security':       { bg: '#fef2f2', color: '#dc2626' },
  'Application':    { bg: '#fff7ed', color: '#ea580c' },
  'System':         { bg: '#e0f2fe', color: '#0284c7' },
  'Newsletter':     { bg: '#f1f5f9', color: '#475569' },
};

const ICON_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#f59e0b', '#06b6d4', '#64748b'];

const DEFAULT_NOTIFICATIONS = [];

export default function AdminNotificationsPage() {
  const { notifications: centralNotifs, addNotification, notifyAdminToCandidate } = useNotifications();
  const [activeTab, setActiveTab]             = useState('All Notifications');
  const [searchQuery, setSearchQuery]         = useState('');
  const [typeFilter, setTypeFilter]           = useState('All Types');
  const [channelFilter, setChannelFilter]     = useState('All Channels');
  const [audienceFilter, setAudienceFilter]   = useState('All Audience');
  const [activeDropdownId, setActiveDropdownId] = useState(null);

  // Close table row action dropdowns on click outside anywhere on screen
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.action-menu-container')) {
        setActiveDropdownId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showSendModal, setShowSendModal]     = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showMailHogModal, setShowMailHogModal] = useState(false);
  const [selectedMailHogItem, setSelectedMailHogItem] = useState(null);
  const [toastMsg, setToastMsg]               = useState('');
  const [localSent, setLocalSent]             = useState([]);

  // Auto-refresh dynamic timestamps every 30 seconds
  useRelativeTimeTick(30000);

  // Merge central notifications from NotificationContext + any local broadcasts
  const allNotifList = [...(centralNotifs || []), ...localSent];

  const formattedNotifications = allNotifList.map((n, idx) => {
    return {
      id: n.id || `NTF-${idx}`,
      title: n.title || 'System Notification',
      snippet: (n.message || n.snippet || '').substring(0, 60) + '...',
      type: n.type || 'System',
      audience: n.audience || (n.recipientRole === 'admin' ? 'System Admin' : n.recipientRole === 'candidate' ? 'Candidates' : n.recipientRole === 'recruiter' ? 'Recruiters' : 'All Users'),
      userCount: 'Active Users',
      channels: n.channels || (n.channel === 'BOTH' ? ['bell', 'email'] : [n.channel?.toLowerCase() || 'bell']),
      status: n.status || 'Delivered',
      sentAt: formatRelativeTime(n, n.time || n.sentAt || 'Recently'),
      exactTime: formatExactDateTime(n),
      createdBy: n.sender || n.createdBy || 'Admin',
      iconIdx: idx % 8,
      bodyMsg: n.message || n.bodyMsg || n.snippet || n.title,
      read: n.read || false,
      stats: n.stats || { delivered: '100%', delPct: '100%', opened: n.read ? '100%' : '0%', openPct: '0%', clicked: '0%', failPct: '0%' }
    };
  });

  // Send Notification Form State
  const [sendTitle, setSendTitle]             = useState('');
  const [sendType, setSendType]               = useState('Job Alert');
  const [sendAudience, setSendAudience]       = useState('All Users');
  const [sendMsg, setSendMsg]                 = useState('');
  const [sendChannelBell, setSendChannelBell] = useState(true);
  const [sendChannelEmail, setSendChannelEmail] = useState(true);
  const [sendChannelMobile, setSendChannelMobile] = useState(false);

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const filtered = formattedNotifications.filter(n => {
    if (activeTab === 'Sent' && n.status !== 'Sent' && n.status !== 'Delivered') return false;
    if (activeTab === 'Scheduled' && n.status !== 'Scheduled') return false;
    if (activeTab === 'Drafts' && n.status !== 'Draft') return false;
    if (activeTab === 'Failed' && n.status !== 'Failed') return false;

    if (typeFilter !== 'All Types' && n.type !== typeFilter) return false;
    if (audienceFilter !== 'All Audience' && !n.audience.toLowerCase().includes(audienceFilter.toLowerCase().slice(0, 4))) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (
        !n.title.toLowerCase().includes(q) &&
        !n.snippet.toLowerCase().includes(q) &&
        !n.audience.toLowerCase().includes(q) &&
        !n.id.toLowerCase().includes(q)
      ) return false;
    }
    return true;
  });

  const handleSendNotification = (e) => {
    e.preventDefault();
    if (!sendTitle || !sendMsg) return;

    const channels = [];
    if (sendChannelBell) channels.push('bell');
    if (sendChannelEmail) channels.push('email');
    if (sendChannelMobile) channels.push('mobile');

    let targetRole = 'all_users';
    let targetEmail = 'all_users';

    if (sendAudience === 'All Candidates') {
      targetRole = 'candidate';
      targetEmail = 'all_candidates';
    } else if (sendAudience === 'All Recruiters' || sendAudience === 'All Companies') {
      targetRole = 'recruiter';
      targetEmail = 'all_recruiters';
    }

    // Broadcast to NotificationContext so candidates & recruiters receive bell alerts & email instantly
    if (addNotification) {
      addNotification({
        recipientRole: targetRole,
        recipientEmail: targetEmail,
        title: sendTitle,
        message: sendMsg,
        type: sendType || 'ADMIN_ANNOUNCEMENT',
        channel: (sendChannelBell && sendChannelEmail) ? 'BOTH' : sendChannelEmail ? 'EMAIL' : 'BELL',
        sender: 'admin@careonix.com',
        audience: sendAudience
      });
    }

    const newNtf = {
      id: `NTF-${Date.now()}`,
      title: sendTitle,
      snippet: sendMsg.substring(0, 60) + '...',
      type: sendType,
      audience: sendAudience,
      userCount: 'Active Users',
      channels: channels.length ? channels : ['bell'],
      status: 'Delivered',
      sentAt: 'Just Now',
      createdBy: 'Admin',
      iconIdx: 0,
      bodyMsg: sendMsg,
      stats: { delivered: '100%', delPct: '100%', opened: '0%', openPct: '0%', clicked: '0%', failPct: '0%' }
    };

    setLocalSent([newNtf, ...localSent]);
    setSelectedNotification(newNtf);
    setShowSendModal(false);
    setSendTitle('');
    setSendMsg('');
    triggerToast(`🚀 Broadcast sent to ${sendAudience} via Bell 🔔 & Email 📧!`);
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
          Dashboard &gt; Notifications
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>Notifications</h1>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={() => setShowMailHogModal(true)}
              style={{ background: '#0f172a', color: '#38bdf8', border: '1px solid #334155', borderRadius: '12px', padding: '0.65rem 1.25rem', fontWeight: '700', fontSize: '0.86rem', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', boxShadow: '0 4px 14px rgba(15,23,42,0.15)' }}>
              <Mail size={16} color="#38bdf8" /> 📫 MailHog Inbox Viewer
            </button>
            <button onClick={() => setShowSettingsModal(true)}
              style={{ background: '#fff', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '0.65rem 1.25rem', fontWeight: '700', fontSize: '0.86rem', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <Settings size={16} /> Notification Settings
            </button>
            <button onClick={() => setShowSendModal(true)}
              style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)', color: '#fff', border: 'none', borderRadius: '12px', padding: '0.65rem 1.25rem', fontWeight: '800', fontSize: '0.86rem', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', boxShadow: '0 4px 14px rgba(79,70,229,0.25)' }}>
              <Plus size={16} /> Send Notification
            </button>
          </div>
        </div>
      </div>

      {/* ── 5 KPI CARDS ──────────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem' }}>
        {[
          { label: 'Total Sent', val: formattedNotifications.length, icon: <Send size={18} />,          iconBg: '#f3e8ff', iconColor: '#7c3aed' },
          { label: 'Unread',     val: formattedNotifications.filter(n => !n.read).length,             icon: <Mail size={18} />,          iconBg: '#fff7ed', iconColor: '#ea580c' },
          { label: 'Scheduled',  val: formattedNotifications.filter(n => n.status === 'Scheduled').length, icon: <MessageSquare size={18} />, iconBg: '#eff6ff', iconColor: '#2563eb' },
          { label: 'Delivered',  val: formattedNotifications.filter(n => n.status === 'Delivered').length, icon: <CheckCircle2 size={18} />,  iconBg: '#f0fdf4', iconColor: '#16a34a' },
          { label: 'Failed',     val: formattedNotifications.filter(n => n.status === 'Failed').length,    icon: <XCircle size={18} />,       iconBg: '#fef2f2', iconColor: '#dc2626' },
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

      {/* ── MAIN 2-COLUMN LAYOUT: (TABLE + INSPECTOR PANEL) ───────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: selectedNotification ? '1fr 420px' : '1fr', gap: '1.25rem', alignItems: 'start' }}>

        {/* LEFT: TABLE CONTAINER */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* Sub-Tabs & Filters */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '0' }}>
            <div style={{ display: 'flex', gap: '0.25rem' }}>
              {['All Notifications', 'Sent', 'Scheduled', 'Drafts', 'Failed', 'Email Logs'].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  style={{
                    background: 'none', border: 'none', padding: '0.65rem 0.85rem', cursor: 'pointer', whiteSpace: 'nowrap',
                    color: activeTab === tab ? '#6366f1' : '#64748b',
                    fontWeight: activeTab === tab ? '800' : '600', fontSize: '0.86rem',
                    borderBottom: activeTab === tab ? '2.5px solid #6366f1' : '2.5px solid transparent',
                    transition: 'all 0.15s ease'
                  }}>
                  {tab === 'Email Logs' ? '📧 Email Dispatch Logs' : tab}
                </button>
              ))}
            </div>

            <button onClick={() => triggerToast('Toggled Filter options')}
              style={{ background: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0.4rem 0.85rem', fontSize: '0.8rem', fontWeight: '700', color: '#334155', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
              <Filter size={14} /> Filter ▾
            </button>
          </div>

          {/* Search & Select Bar */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
              <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input type="text" placeholder="Search by title, message, receiver..."
                value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '0.6rem 1rem 0.6rem 2.25rem', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.82rem', outline: 'none', background: '#fff' }} />
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
                style={{ padding: '0.55rem 0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.8rem', background: '#fff', fontWeight: '700', color: '#0f172a' }}>
                <option>All Types</option>
                <option>Job Alert</option>
                <option>Welcome</option>
                <option>Account Update</option>
                <option>Interview</option>
                <option>Security</option>
              </select>

              <select value={channelFilter} onChange={e => setChannelFilter(e.target.value)}
                style={{ padding: '0.55rem 0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.8rem', background: '#fff', fontWeight: '700', color: '#0f172a' }}>
                <option>All Channels</option>
                <option>In-App</option>
                <option>Email</option>
                <option>Push</option>
              </select>

              <select value={audienceFilter} onChange={e => setAudienceFilter(e.target.value)}
                style={{ padding: '0.55rem 0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.8rem', background: '#fff', fontWeight: '700', color: '#0f172a' }}>
                <option>All Audience</option>
                <option>Candidates</option>
                <option>Recruiters</option>
                <option>Companies</option>
              </select>

              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '0.55rem 0.85rem', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '0.8rem', fontWeight: '700', color: '#334155', cursor: 'pointer' }}>
                📅 01 Aug - 10 Aug ▾
              </div>

              <button onClick={() => { setSearchQuery(''); setTypeFilter('All Types'); setChannelFilter('All Channels'); setAudienceFilter('All Audience'); }}
                style={{ background: 'none', border: 'none', color: '#6366f1', fontWeight: '700', fontSize: '0.78rem', cursor: 'pointer' }}>
                Clear Filters
              </button>
            </div>
          </div>

          {/* Table Container */}
          {activeTab === 'Email Logs' ? (
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.25rem', boxShadow: '0 1px 4px rgba(15,23,42,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  📧 Registered User Email Dispatch Audit Logs
                </h3>
                <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '600' }}>
                  Total Sent Logs: {(JSON.parse(localStorage.getItem('careonix_sent_emails') || '[]')).length}
                </span>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.83rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                    <th style={{ paddingBottom: '0.8rem', fontWeight: '700', fontSize: '0.75rem', color: '#64748b' }}>Recipient Registered Email</th>
                    <th style={{ paddingBottom: '0.8rem', fontWeight: '700', fontSize: '0.75rem', color: '#64748b' }}>Subject / Title</th>
                    <th style={{ paddingBottom: '0.8rem', fontWeight: '700', fontSize: '0.75rem', color: '#64748b' }}>Message Body</th>
                    <th style={{ paddingBottom: '0.8rem', fontWeight: '700', fontSize: '0.75rem', color: '#64748b' }}>Status</th>
                    <th style={{ paddingBottom: '0.8rem', fontWeight: '700', fontSize: '0.75rem', color: '#64748b' }}>Sent Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {(JSON.parse(localStorage.getItem('careonix_sent_emails') || '[]')).length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: '#64748b', fontWeight: '600' }}>
                        No email dispatch logs captured yet. Send a broadcast notification with "Email Dispatch" checked to view logs here!
                      </td>
                    </tr>
                  ) : (
                    (JSON.parse(localStorage.getItem('careonix_sent_emails') || '[]')).map((em, idx) => (
                      <tr key={em.id || idx} style={{ borderBottom: '1px solid #f8fafc' }}>
                        <td style={{ padding: '0.85rem 0', fontWeight: '700', color: '#4f46e5' }}>{em.recipientEmail}</td>
                        <td style={{ fontWeight: '700', color: '#0f172a' }}>{em.title}</td>
                        <td style={{ color: '#64748b', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{em.message}</td>
                        <td>
                          <span style={{ background: '#dcfce7', color: '#15803d', padding: '3px 10px', borderRadius: '8px', fontSize: '0.72rem', fontWeight: '800' }}>
                            ✓ DISPATCHED_EMAIL_GATEWAY
                          </span>
                        </td>
                        <td style={{ color: '#64748b', fontSize: '0.78rem' }}>{em.sentAt || 'Recently'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          ) : (
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.25rem', boxShadow: '0 1px 4px rgba(15,23,42,0.02)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.83rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                  {['Notification', 'Type', 'Audience', 'Channel', 'Status', 'Sent At', 'Actions'].map((h, i) => (
                    <th key={i} style={{ paddingBottom: '0.8rem', fontWeight: '700', fontSize: '0.75rem', color: '#64748b', textAlign: i === 6 ? 'right' : 'left' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(n => {
                  const st = STATUS_STYLES[n.status] || STATUS_STYLES['Delivered'];
                  const tp = TYPE_STYLES[n.type] || TYPE_STYLES['Newsletter'];
                  const isSelected = selectedNotification?.id === n.id;
                  return (
                    <tr key={n.id} onClick={() => setSelectedNotification(n)}
                      style={{ borderBottom: '1px solid #f8fafc', background: isSelected ? '#f5f3ff' : 'transparent', cursor: 'pointer', transition: 'all 0.15s ease' }}>

                      {/* Notification Info */}
                      <td style={{ padding: '0.85rem 0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#f1f5f9', color: ICON_COLORS[n.iconIdx % ICON_COLORS.length], display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <FileText size={18} />
                          </div>
                          <div>
                            <strong style={{ fontSize: '0.85rem', color: '#0f172a', display: 'block' }}>{n.title}</strong>
                            <span style={{ fontSize: '0.73rem', color: '#64748b', display: 'block', maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.snippet}</span>
                          </div>
                        </div>
                      </td>

                      {/* Type */}
                      <td>
                        <span style={{ background: tp.bg, color: tp.color, padding: '3px 9px', borderRadius: '8px', fontSize: '0.73rem', fontWeight: '800', whiteSpace: 'nowrap' }}>
                          {n.type}
                        </span>
                      </td>

                      {/* Audience */}
                      <td>
                        <div style={{ fontSize: '0.83rem', fontWeight: '700', color: '#0f172a' }}>{n.audience}</div>
                        <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{n.userCount}</span>
                      </td>

                      {/* Channel Icons */}
                      <td>
                        <div style={{ display: 'flex', gap: '6px', color: '#64748b' }}>
                          {n.channels.includes('bell') && <div style={{ background: '#f1f5f9', padding: '4px', borderRadius: '6px' }}><Bell size={13} color="#6366f1" /></div>}
                          {n.channels.includes('email') && <div style={{ background: '#f1f5f9', padding: '4px', borderRadius: '6px' }}><Mail size={13} color="#6366f1" /></div>}
                          {n.channels.includes('mobile') && <div style={{ background: '#f1f5f9', padding: '4px', borderRadius: '6px' }}><Smartphone size={13} color="#6366f1" /></div>}
                        </div>
                      </td>

                      {/* Status */}
                      <td>
                        <span style={{ background: st.bg, color: st.color, border: `1px solid ${st.border}`, padding: '3px 9px', borderRadius: '8px', fontSize: '0.73rem', fontWeight: '800' }}>
                          {n.status}
                        </span>
                      </td>

                      {/* Sent At */}
                      <td title={n.exactTime} style={{ color: '#475569', fontSize: '0.78rem', fontWeight: '600' }}>{n.sentAt}</td>

                      {/* Actions Menu */}
                      <td className="action-menu-container" style={{ textAlign: 'right', position: 'relative' }}>
                        <button onClick={() => setActiveDropdownId(prev => prev === n.id ? null : n.id)}
                          style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', width: '30px', height: '30px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                          <MoreVertical size={14} color="#64748b" />
                        </button>

                        {activeDropdownId === n.id && (
                          <div style={{ position: 'absolute', right: 0, top: '100%', marginTop: '4px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.12)', zIndex: 60, padding: '4px', minWidth: '150px', textAlign: 'left' }}>
                            <button onClick={() => { triggerToast(`Resent "${n.title}"`); setActiveDropdownId(null); }}
                              style={{ width: '100%', padding: '0.45rem 0.75rem', border: 'none', background: '#eff6ff', color: '#2563eb', fontSize: '0.76rem', fontWeight: '700', cursor: 'pointer', textAlign: 'left', borderRadius: '6px', marginBottom: '2px', display: 'block' }}>
                              🔄 Resend Broadcast
                            </button>
                            <button onClick={() => { setLocalSent(prev => prev.filter(item => item.id !== n.id)); setActiveDropdownId(null); triggerToast('Notification removed'); }}
                              style={{ width: '100%', padding: '0.45rem 0.75rem', border: 'none', background: '#fef2f2', color: '#dc2626', fontSize: '0.76rem', fontWeight: '700', cursor: 'pointer', textAlign: 'left', borderRadius: '6px', display: 'block' }}>
                              🗑️ Delete Notification
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
              <div>Showing {filtered.length} of {formattedNotifications.length} notifications</div>
            </div>

          </div>
          )}

        </div>

        {/* RIGHT: NOTIFICATION DETAILS INSPECTOR PANEL */}
        {selectedNotification && (
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '24px', padding: '1.5rem', boxShadow: '0 4px 20px rgba(15,23,42,0.03)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Title Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.85rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Notification Details</h3>
              <button onClick={() => setSelectedNotification(null)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={14} color="#64748b" />
              </button>
            </div>

            {/* Notification Title & Badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#f1f5f9', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <FileText size={22} />
              </div>
              <div style={{ flex: 1 }}>
                <strong style={{ fontSize: '1rem', color: '#0f172a', display: 'block', lineHeight: 1.2 }}>{selectedNotification.title}</strong>
              </div>
              <span style={{ background: STATUS_STYLES[selectedNotification.status]?.bg, color: STATUS_STYLES[selectedNotification.status]?.color, border: `1px solid ${STATUS_STYLES[selectedNotification.status]?.border}`, padding: '3px 10px', borderRadius: '8px', fontSize: '0.74rem', fontWeight: '800' }}>
                {selectedNotification.status}
              </span>
            </div>

            {/* Key-Value Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', fontSize: '0.82rem', background: '#f8fafc', padding: '1rem', borderRadius: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>Type</span><strong style={{ color: '#0f172a' }}>{selectedNotification.type}</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>Audience</span><strong style={{ color: '#0f172a' }}>{selectedNotification.audience}</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>Sent At</span><span style={{ color: '#334155', fontWeight: '600' }}>{selectedNotification.sentAt}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>Created By</span><span style={{ color: '#334155', fontWeight: '600' }}>{selectedNotification.createdBy}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>Campaign ID</span><span style={{ color: '#64748b', fontFamily: 'monospace', fontSize: '0.76rem' }}>{selectedNotification.id}</span></div>
            </div>

            {/* Message Preview */}
            <div>
              <p style={{ fontSize: '0.78rem', fontWeight: '700', color: '#64748b', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Message Preview</p>
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1rem', fontSize: '0.82rem', color: '#334155', lineHeight: 1.5, whiteSpace: 'pre-line' }}>
                {selectedNotification.bodyMsg}
              </div>
            </div>

          </div>
        )}

      </div>

      {/* ── SEND NOTIFICATION BROADCAST MODAL ──────────────────────────────── */}
      {showSendModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: '1rem' }}>
          <form onSubmit={handleSendNotification} style={{ width: '540px', background: '#fff', borderRadius: '24px', padding: '2rem', boxShadow: '0 25px 60px rgba(15,23,42,0.2)', border: '1px solid #e2e8f0' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>📢 Send New Notification Broadcast</h3>
              <button type="button" onClick={() => setShowSendModal(false)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={16} color="#64748b" />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.85rem' }}>
              <div>
                <label style={{ fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>Notification Title</label>
                <input type="text" placeholder="e.g. 🎉 Special Announcement / Maintenance Update"
                  value={sendTitle} onChange={e => setSendTitle(e.target.value)} required
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>Category / Type</label>
                  <select value={sendType} onChange={e => setSendType(e.target.value)} style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontWeight: '700', color: '#334155' }}>
                    <option>Job Alert</option>
                    <option>Welcome</option>
                    <option>Account Update</option>
                    <option>Interview</option>
                    <option>Security</option>
                    <option>System</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>Target Audience</label>
                  <select value={sendAudience} onChange={e => setSendAudience(e.target.value)} style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontWeight: '700', color: '#334155' }}>
                    <option>All Candidates</option>
                    <option>All Recruiters</option>
                    <option>All Companies</option>
                    <option>All Users</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>Dispatch Channels</label>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: '600' }}>
                    <input type="checkbox" checked={sendChannelBell} onChange={e => setSendChannelBell(e.target.checked)} /> 🔔 In-App Bell
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: '600' }}>
                    <input type="checkbox" checked={sendChannelEmail} onChange={e => setSendChannelEmail(e.target.checked)} /> 📧 Email Dispatch
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: '600' }}>
                    <input type="checkbox" checked={sendChannelMobile} onChange={e => setSendChannelMobile(e.target.checked)} /> 📱 Mobile Push
                  </label>
                </div>
              </div>

              <div>
                <label style={{ fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>Message Body</label>
                <textarea rows="4" placeholder="Write your announcement or notification message here..."
                  value={sendMsg} onChange={e => setSendMsg(e.target.value)} required
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none', resize: 'vertical' }} />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button type="button" onClick={() => setShowSendModal(false)} style={{ padding: '0.65rem 1.25rem', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#fff', color: '#334155', fontWeight: '700', cursor: 'pointer' }}>Cancel</button>
              <button type="submit" style={{ padding: '0.65rem 1.4rem', borderRadius: '10px', background: 'linear-gradient(135deg,#6366f1,#4f46e5)', color: '#fff', border: 'none', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Send size={15} /> Send Broadcast Now
              </button>
            </div>

          </form>
        </div>
      )}

      {/* ── NOTIFICATION SETTINGS MODAL ────────────────────────────────────── */}
      {showSettingsModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: '1rem' }}>
          <div style={{ width: '500px', background: '#fff', borderRadius: '24px', padding: '2rem', boxShadow: '0 25px 60px rgba(15,23,42,0.2)', border: '1px solid #e2e8f0' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>⚙️ System Notification Settings</h3>
              <button onClick={() => setShowSettingsModal(false)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={16} color="#64748b" />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.85rem' }}>
              {[
                { label: 'Email Gateway (Port 8086 / MailHog 8025)', desc: 'Automated Real-time OTP & Broadcast Email dispatch', active: true },
                { label: 'Push Notifications (FCM / Mobile Push)', desc: 'Instant push alerts to mobile applications', active: true },
                { label: 'In-App Bell Alerts', desc: 'Realtime badge counts & toast notifications', active: true },
                { label: 'Auto Retry Failed Notifications', desc: 'Retry failed deliveries 3 times before status set to Failed', active: true },
              ].map((setting, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: '#f8fafc', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                  <div>
                    <strong style={{ fontSize: '0.86rem', color: '#0f172a', display: 'block' }}>{setting.label}</strong>
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{setting.desc}</span>
                  </div>
                  <input type="checkbox" defaultChecked={setting.active} style={{ width: '18px', height: '18px', accentColor: '#6366f1', cursor: 'pointer' }} />
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem', gap: '0.75rem' }}>
              <button onClick={() => setShowSettingsModal(false)} style={{ padding: '0.65rem 1.25rem', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#fff', color: '#334155', fontWeight: '700', cursor: 'pointer' }}>Cancel</button>
              <button onClick={() => { setShowSettingsModal(false); triggerToast('✅ Notification Settings saved successfully!'); }} style={{ padding: '0.65rem 1.4rem', borderRadius: '10px', background: '#6366f1', color: '#fff', border: 'none', fontWeight: '800', cursor: 'pointer' }}>Save Settings</button>
            </div>

          </div>
        </div>
      )}

      {/* ── BUILT-IN MAILHOG WEB INBOX VIEWER MODAL ───────────────────────── */}
      {showMailHogModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 350, padding: '1.5rem' }}>
          <div style={{ width: '920px', height: '650px', background: '#0f172a', borderRadius: '24px', display: 'flex', flexDirection: 'column', boxShadow: '0 30px 80px rgba(0,0,0,0.5)', border: '1px solid #334155', overflow: 'hidden', color: '#f8fafc' }}>
            
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.75rem', background: '#1e293b', borderBottom: '1px solid #334155' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#38bdf8', color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '1.1rem' }}>
                  📫
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '800', margin: 0, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    MailHog Web Inbox <span style={{ fontSize: '0.72rem', background: '#0284c7', color: '#fff', padding: '2px 8px', borderRadius: '10px', fontWeight: '700' }}>PORT 8025 SIMULATOR</span>
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Real-time Email Dispatch & SMTP Capture Viewer</span>
                </div>
              </div>
              <button onClick={() => setShowMailHogModal(false)} style={{ background: '#334155', border: 'none', borderRadius: '50%', width: '34px', height: '34px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                <X size={18} color="#fff" />
              </button>
            </div>

            {/* Split View Container */}
            <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', flex: 1, overflow: 'hidden' }}>
              
              {/* Left Email Message List */}
              <div style={{ borderRight: '1px solid #334155', background: '#0f172a', overflowY: 'auto', padding: '0.75rem' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: '800', color: '#64748b', letterSpacing: '0.05em', marginBottom: '0.75rem', paddingLeft: '0.5rem' }}>
                  CAPTURED EMAILS ({(JSON.parse(localStorage.getItem('careonix_sent_emails') || '[]')).length})
                </div>
                {(JSON.parse(localStorage.getItem('careonix_sent_emails') || '[]')).length === 0 ? (
                  <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#64748b', fontSize: '0.82rem' }}>
                    No emails captured yet. Send a broadcast notification or trigger an email to test!
                  </div>
                ) : (
                  (JSON.parse(localStorage.getItem('careonix_sent_emails') || '[]')).map((msg, i) => {
                    const isSel = (selectedMailHogItem?.id || (JSON.parse(localStorage.getItem('careonix_sent_emails') || '[]'))[0]?.id) === msg.id;
                    return (
                      <div key={msg.id || i}
                        onClick={() => setSelectedMailHogItem(msg)}
                        style={{
                          padding: '0.85rem', borderRadius: '12px', marginBottom: '0.5rem', cursor: 'pointer',
                          background: isSel ? '#1e293b' : 'transparent', border: isSel ? '1px solid #38bdf8' : '1px solid transparent',
                          transition: 'all 0.15s ease'
                        }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <strong style={{ fontSize: '0.82rem', color: '#38bdf8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '180px' }}>{msg.recipientEmail}</strong>
                          <span title={formatExactDateTime(msg)} style={{ fontSize: '0.68rem', color: '#64748b' }}>{formatRelativeTime(msg, msg.sentAt || 'Just now')}</span>
                        </div>
                        <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#f1f5f9', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{msg.title}</div>
                        <div style={{ fontSize: '0.72rem', color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{msg.message}</div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Right Email Preview Inspector */}
              <div style={{ background: '#1e293b', padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {(() => {
                  const logs = JSON.parse(localStorage.getItem('careonix_sent_emails') || '[]');
                  const activeItem = selectedMailHogItem || logs[0];
                  if (!activeItem) {
                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748b' }}>
                        <Mail size={48} color="#334155" />
                        <p style={{ marginTop: '1rem', fontSize: '0.9rem' }}>Select an email from the left inbox list to preview</p>
                      </div>
                    );
                  }
                  return (
                    <>
                      {/* Email Headers Card */}
                      <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '16px', padding: '1rem 1.25rem', fontSize: '0.82rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '0.5rem', marginBottom: '6px' }}>
                          <span style={{ color: '#64748b', fontWeight: '700' }}>From:</span>
                          <span style={{ color: '#38bdf8', fontWeight: '600' }}>Careonix Portal &lt;careonixteam@gmail.com&gt;</span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '0.5rem', marginBottom: '6px' }}>
                          <span style={{ color: '#64748b', fontWeight: '700' }}>To:</span>
                          <span style={{ color: '#4ade80', fontWeight: '700' }}>{activeItem.recipientEmail}</span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '0.5rem', marginBottom: '6px' }}>
                          <span style={{ color: '#64748b', fontWeight: '700' }}>Subject:</span>
                          <span style={{ color: '#fff', fontWeight: '800' }}>{activeItem.title}</span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '0.5rem' }}>
                          <span style={{ color: '#64748b', fontWeight: '700' }}>Date:</span>
                          <span style={{ color: '#94a3b8' }}>{activeItem.sentAt}</span>
                        </div>
                      </div>

                      {/* HTML Rendered Email Body Box */}
                      <div style={{ background: '#ffffff', borderRadius: '16px', padding: '2rem', color: '#0f172a', border: '1px solid #e2e8f0', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
                        <div style={{ textAlignment: 'center', textAlign: 'center', marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid #e2e8f0' }}>
                          <h2 style={{ color: '#4f46e5', margin: 0, fontSize: '1.4rem', letterSpacing: '0.5px' }}>Careonix Job Portal</h2>
                          <p style={{ color: '#64748b', fontSize: '0.8rem', margin: '4px 0 0' }}>Official Notification & Email Dispatch</p>
                        </div>
                        <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '1rem' }}>
                          <h4 style={{ color: '#0f172a', margin: '0 0 10px', fontSize: '1rem' }}>{activeItem.title}</h4>
                          <p style={{ color: '#334155', fontSize: '0.9rem', margin: 0, lineHeight: 1.6, whiteSpace: 'pre-line' }}>{activeItem.message}</p>
                        </div>
                        <p style={{ color: '#94a3b8', fontSize: '0.75rem', textAlign: 'center', margin: 0 }}>© 2026 Careonix Job Portal. All rights reserved.</p>
                      </div>
                    </>
                  );
                })()}
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
