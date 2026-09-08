import React, { useState, useEffect, useRef } from 'react';
import { Bell, LogOut, CheckCircle, Info, X, Sparkles, Menu, ChevronDown, ShieldCheck, UserCheck, Mail, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import careonixLogo from '../assets/careonix-logo-transparent.png';

export default function Navbar({ activeTab, setActiveTab, onToggleMobileSidebar }) {
  const { user, logout } = useAuth();
  const { getNotificationsForUser, markAllAsRead, markAsRead } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAllNotifs, setShowAllNotifs] = useState(false);
  const notifRef = useRef(null);

  const emailClean = (user?.email || user?.identifier || '').toLowerCase();
  const accountTypeClean = (user?.accountType || '').toLowerCase();
  const userRoleClean = (user?.role || '').toLowerCase();
  const viewOverride = sessionStorage.getItem('careonix_view_override');

  let role = 'candidate';
  if (viewOverride === 'admin' || viewOverride === 'recruiter' || viewOverride === 'candidate') {
    role = viewOverride;
  } else if (userRoleClean === 'admin' || accountTypeClean === 'admin') {
    role = 'admin';
  } else if (accountTypeClean === 'recruiter' || userRoleClean === 'recruiter' || (userRoleClean === 'client' && accountTypeClean !== 'candidate')) {
    role = 'recruiter';
  } else {
    role = 'candidate';
  }

  const notifications = getNotificationsForUser(emailClean, role);
  const unreadCount = notifications.filter(n => !n.read).length;
  const displayedNotifications = showAllNotifs ? notifications : notifications.slice(0, 1);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggleNotifs = () => {
    setShowNotifications(prev => !prev);
  };

  // Quick Portal View Switcher (Per-session view preview only, does NOT mutate user account object)
  const switchPortalRole = (newRole) => {
    try {
      sessionStorage.setItem('careonix_view_override', newRole);
    } catch (e) {}
    window.location.reload();
  };

  return (
    <header style={{
      background: '#ffffff',
      borderBottom: '1px solid #e2e8f0',
      padding: '0.65rem 1.25rem',
      position: 'sticky',
      top: 0,
      zIndex: 40,
      boxShadow: '0 1px 4px rgba(15,23,42,0.02)',
      fontFamily: 'Inter, sans-serif'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
        
        {/* Left Side: Mobile Hamburger + Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0, flex: 1 }}>
          
          {/* Universal Hamburger Menu Button (Visible on Mobile & Tablet < 1024px) */}
          <button
            onClick={onToggleMobileSidebar}
            className="mobile-nav-hamburger"
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              width: '38px',
              height: '38px',
              cursor: 'pointer',
              color: '#0f172a',
              flexShrink: 0,
            }}
            title="Open Navigation Menu"
          >
            <Menu size={20} />
          </button>

          {/* Mobile Brand Logo */}
          <div className="mobile-brand-title" style={{ flexShrink: 0 }}>
            <img
              src={careonixLogo}
              alt="Careonix Logo"
              style={{ height: '30px', width: 'auto', objectFit: 'contain', display: 'block' }}
            />
          </div>
        </div>

        {/* Right Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexShrink: 0 }}>

          {/* Notification Bell Icon */}
          <div ref={notifRef} style={{ position: 'relative' }}>
            <button
              onClick={handleToggleNotifs}
              style={{
                position: 'relative',
                cursor: 'pointer',
                background: showNotifications ? '#f1f5f9' : '#ffffff',
                border: '1px solid #e2e8f0',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease'
              }}
              title="Notifications & Alerts"
            >
              <Bell size={18} color="#475569" />
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-2px',
                  right: '-2px',
                  width: '18px',
                  height: '18px',
                  background: '#ef4444',
                  color: '#ffffff',
                  borderRadius: '50%',
                  fontSize: '0.68rem',
                  fontWeight: '800',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 6px rgba(239,68,68,0.4)'
                }}>
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown Panel */}
            {showNotifications && (
              <div
                className="navbar-notif-dropdown"
                style={{
                  position: 'absolute',
                  top: '50px',
                  right: 0,
                  width: '340px',
                  maxWidth: 'calc(100vw - 32px)',
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '16px',
                  boxShadow: '0 10px 25px -5px rgba(15,23,42,0.12), 0 8px 10px -6px rgba(15,23,42,0.04)',
                  padding: '1rem',
                  zIndex: 100
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.92rem', fontWeight: '800', color: '#0f172a' }}>Notifications</span>
                    {unreadCount > 0 && (
                      <span style={{ background: '#e0e7ff', color: '#4338ca', fontSize: '0.72rem', fontWeight: '700', padding: '1px 8px', borderRadius: '12px' }}>
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={() => markAllAsRead(emailClean, role)}
                      style={{ background: 'none', border: 'none', color: '#4f46e5', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer' }}
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                {/* Notification Items List */}
                <div style={{ maxHeight: '340px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {notifications.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '1.5rem 0', color: '#94a3b8', fontSize: '0.82rem' }}>
                      <CheckCircle size={28} color="#cbd5e1" style={{ margin: '0 auto 0.5rem auto' }} />
                      <div>You're all caught up!</div>
                    </div>
                  ) : (
                    displayedNotifications.map(n => (
                      <div
                        key={n.id}
                        onClick={() => markAsRead(n.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '0.75rem',
                          padding: '0.65rem',
                          borderRadius: '10px',
                          background: n.read ? '#f8fafc' : '#f5f3ff',
                          border: `1px solid ${n.read ? '#f1f5f9' : '#ddd6fe'}`,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <div style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          background: n.type === 'APPLICATION' ? '#dbeafe' : (n.type === 'INTERVIEW' ? '#dcfce7' : (n.type === 'STATUS' ? '#fef3c7' : '#e0e7ff')),
                          color: n.type === 'APPLICATION' ? '#1d4ed8' : (n.type === 'INTERVIEW' ? '#15803d' : (n.type === 'STATUS' ? '#b45309' : '#4338ca')),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          {n.type === 'APPLICATION' ? <UserCheck size={14} /> : (n.type === 'INTERVIEW' ? <CheckCircle size={14} /> : <Info size={14} />)}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '0.8rem', fontWeight: n.read ? '600' : '700', color: '#0f172a', lineHeight: 1.25 }}>
                            {n.title}
                          </div>
                          <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px', lineHeight: 1.35 }}>
                            {n.message}
                          </div>
                          <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '4px' }}>
                            {n.time}
                          </div>
                        </div>
                        {!n.read && (
                          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#7c3aed', marginTop: '4px', flexShrink: 0 }} />
                        )}
                      </div>
                    ))
                  )}
                </div>

                {/* View All Notifications Link (Navigates to dedicated page) */}
                <div style={{ borderTop: '1px solid #f1f5f9', marginTop: '0.75rem', paddingTop: '0.65rem' }}>
                  <button
                    onClick={() => {
                      setShowNotifications(false);
                      if (setActiveTab) setActiveTab('notifications');
                    }}
                    style={{
                      background: '#eef2ff',
                      border: '1px solid #c7d2fe',
                      color: '#4f46e5',
                      fontWeight: '700',
                      fontSize: '0.8rem',
                      padding: '0.5rem 0.85rem',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      width: '100%',
                      justifyContent: 'center',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 1px 3px rgba(79,70,229,0.1)'
                    }}
                  >
                    <span>View All Notifications ({notifications.length})</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Pill (Matching Reference UI 100%) */}
          <div
            onClick={() => setActiveTab && setActiveTab('profile')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer' }}
            title="View Your Profile"
          >
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: role === 'admin' ? '#4f46e5' : '#e0e7ff',
              color: role === 'admin' ? '#ffffff' : '#4f46e5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: '0.9rem',
              overflow: 'hidden',
              flexShrink: 0
            }}>
              {user?.avatar || user?.photoUrl ? (
                <img
                  src={user.avatar || user.photoUrl}
                  alt={user?.name || 'User'}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                (user?.name || 'A').charAt(0).toUpperCase()
              )}
            </div>
            <div className="navbar-user-text">
              <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#0f172a', lineHeight: 1.2 }}>
                {user?.name || (role === 'admin' ? 'CAREONIX Admin' : 'User Profile')}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '500' }}>
                {role === 'admin' ? 'Super Administrator' : (role === 'recruiter' ? 'Verified Recruiter' : 'Candidate')}
              </div>
            </div>
          </div>

          {/* Red Logout Button */}
          <button
            onClick={logout}
            className="navbar-logout-btn"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: '#fef2f2',
              color: '#dc2626',
              border: '1px solid #fecaca',
              padding: '0.48rem 0.95rem',
              borderRadius: '10px',
              fontWeight: '700',
              fontSize: '0.82rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 1px 4px rgba(220, 38, 38, 0.08)',
              fontFamily: 'Inter, sans-serif'
            }}
            title="Sign out of Careonix Portal"
          >
            <LogOut size={15} />
            <span className="navbar-logout-text">Logout</span>
          </button>
        </div>

      </div>
    </header>
  );
}
