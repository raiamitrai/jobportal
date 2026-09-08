import React, { useState } from 'react';
import {
  Bell, Mail, CheckCircle, Search, Trash2, CheckCircle2,
  Sparkles, Filter, Briefcase, ShieldAlert, Award, ArrowRight, Clock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { formatRelativeTime, formatExactDateTime, useRelativeTimeTick } from '../utils/timeAgo';

export default function NotificationsPage({ role }) {
  const { user } = useAuth();
  const { getNotificationsForUser, markAllAsRead, markAsRead } = useNotifications();

  // Auto-refresh dynamic timestamps every 30 seconds
  useRelativeTimeTick(30000);

  const [activeFilterTab, setActiveFilterTab] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  const emailClean = (user?.email || user?.identifier || '').toLowerCase();
  const userRole = role || (user?.accountType === 'recruiter' ? 'recruiter' : 'candidate');

  const notifications = getNotificationsForUser(emailClean, userRole);
  const unreadCount = notifications.filter(n => !n.read).length;

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleMarkAllRead = () => {
    markAllAsRead(emailClean, userRole);
    triggerToast('All notifications marked as read ✓');
  };

  const filteredNotifications = notifications.filter(n => {
    // Direct text/chat messages belong strictly to Messages tab, never in notifications
    if (n.type === 'NEW_MESSAGE' || n.title?.includes('New Message')) return false;

    // Filter by Tab
    if (activeFilterTab === 'UNREAD' && n.read) return false;
    if (activeFilterTab === 'STATUS' && n.type !== 'STATUS_CHANGE' && n.type !== 'EXTERNAL_STATUS_UPDATE') return false;
    if (activeFilterTab === 'JOBS' && n.type !== 'JOB_POSTED' && n.type !== 'NEW_APPLICATION') return false;
    if (activeFilterTab === 'SYSTEM' && n.type !== 'ADMIN_ANNOUNCEMENT' && n.type !== 'ADMIN_ACTION') return false;

    // Search query
    if (searchTerm) {
      const q = searchTerm.toLowerCase().trim();
      const matchTitle = (n.title || '').toLowerCase().includes(q);
      const matchMsg = (n.message || '').toLowerCase().includes(q);
      const matchSender = (n.sender || '').toLowerCase().includes(q);
      return matchTitle || matchMsg || matchSender;
    }
    return true;
  });

  return (
    <div style={{ padding: '2rem', background: '#f8fafc', minHeight: '90vh', fontFamily: 'Inter, sans-serif' }}>
      
      {/* Toast Notification */}
      {toastMsg && (
        <div style={{
          position: 'fixed', top: '24px', right: '24px', background: '#10b981', color: '#ffffff',
          padding: '0.85rem 1.4rem', borderRadius: '14px', boxShadow: '0 10px 25px rgba(16,185,129,0.3)',
          display: 'flex', alignItems: 'center', gap: '0.6rem', zIndex: 300, fontWeight: '700', fontSize: '0.9rem'
        }}>
          <CheckCircle2 size={18} /><span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ background: '#e0e7ff', padding: '0.6rem', borderRadius: '12px', display: 'flex', alignItems: 'center' }}>
              <Bell size={22} color="#4f46e5" />
            </div>
            <div>
              <h1 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
                Notification Center
              </h1>
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '2px 0 0 0' }}>
                Stay updated with real-time in-app alerts and email dispatches
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleMarkAllRead}
          style={{
            background: '#ffffff',
            border: '1px solid #cbd5e1',
            color: '#4f46e5',
            padding: '0.65rem 1.1rem',
            borderRadius: '12px',
            fontWeight: '700',
            fontSize: '0.85rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            boxShadow: '0 2px 5px rgba(0,0,0,0.03)'
          }}
        >
          <CheckCircle size={16} />
          <span>Mark All as Read</span>
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        padding: '1rem 1.25rem',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        boxShadow: '0 1px 3px rgba(15,23,42,0.02)'
      }}>
        {/* Category Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {[
            { id: 'ALL', label: `All Notifications (${notifications.length})` },
            { id: 'UNREAD', label: `Unread (${unreadCount})` },
            { id: 'STATUS', label: 'Status Updates' },
            { id: 'JOBS', label: 'Jobs & Applications' },
            { id: 'SYSTEM', label: 'System & Admin' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveFilterTab(tab.id)}
              style={{
                padding: '0.55rem 1rem',
                borderRadius: '10px',
                border: 'none',
                background: activeFilterTab === tab.id ? '#4f46e5' : '#f1f5f9',
                color: activeFilterTab === tab.id ? '#ffffff' : '#64748b',
                fontWeight: '700',
                fontSize: '0.82rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{ position: 'relative', width: '280px' }}>
          <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Search notifications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.55rem 1rem 0.55rem 2.4rem',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              background: '#f8fafc',
              fontSize: '0.82rem',
              outline: 'none'
            }}
          />
        </div>
      </div>

      {/* Notification Cards List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {filteredNotifications.length === 0 ? (
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '16px',
            padding: '3.5rem 2rem',
            textAlign: 'center'
          }}>
            <Bell size={36} color="#cbd5e1" style={{ marginBottom: '0.75rem' }} />
            <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#1e293b', margin: 0 }}>
              No Notifications Found
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>
              {searchTerm ? 'No notifications match your search keyword.' : 'You are all caught up! New alerts will appear here.'}
            </p>
          </div>
        ) : (
          filteredNotifications.map(item => (
            <div
              key={item.id}
              onClick={() => markAsRead(item.id)}
              style={{
                background: item.read ? '#ffffff' : '#f0f9ff',
                border: `1px solid ${item.read ? '#e2e8f0' : '#bae6fd'}`,
                borderRadius: '16px',
                padding: '1.15rem 1.35rem',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '1rem',
                transition: 'all 0.2s ease',
                boxShadow: item.read ? 'none' : '0 4px 12px rgba(56,189,248,0.08)',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                <div style={{
                  background: item.title?.includes('Congratulations') ? '#ecfdf5' : '#eef2ff',
                  padding: '0.65rem',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  marginTop: '2px'
                }}>
                  <Sparkles size={20} color={item.title?.includes('Congratulations') ? '#10b981' : '#4f46e5'} />
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{ fontWeight: '800', fontSize: '0.96rem', color: '#0f172a' }}>
                      {item.title}
                    </span>
                    {!item.read && (
                      <span style={{ background: '#38bdf8', color: '#0369a1', fontSize: '0.68rem', fontWeight: '800', padding: '2px 8px', borderRadius: '9999px' }}>
                        NEW
                      </span>
                    )}
                  </div>

                  <p style={{ fontSize: '0.875rem', color: '#334155', margin: '6px 0 8px 0', lineHeight: 1.45, fontWeight: '500' }}>
                    {item.message || item.desc}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', fontSize: '0.75rem', color: '#64748b' }}>
                    <span
                      title={formatExactDateTime(item)}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: '600' }}
                    >
                      <Clock size={13} color="#94a3b8" />
                      {formatRelativeTime(item, item.time || 'Recently')}
                    </span>

                    {item.sender && (
                      <span style={{ color: '#4f46e5', fontWeight: '700' }}>
                        From: {item.sender}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Side Channels */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#eef2ff', padding: '3px 8px', borderRadius: '8px', fontSize: '0.72rem', color: '#4f46e5', fontWeight: '700' }}>
                    <Bell size={12} color="#4f46e5" />
                    In-App Bell
                  </div>
                  {(item.channel === 'BOTH' || item.channel === 'EMAIL') && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#ecfdf5', padding: '3px 8px', borderRadius: '8px', fontSize: '0.72rem', color: '#059669', fontWeight: '700' }}>
                      <Mail size={12} color="#059669" />
                      Email Sent
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
