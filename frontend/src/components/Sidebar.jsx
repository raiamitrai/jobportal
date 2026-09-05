import React, { useState, useEffect, useRef } from 'react';
import {
  Briefcase,
  FileText,
  User,
  Bookmark,
  HelpCircle,
  Home,
  Users,
  CreditCard,
  LogOut,
  ChevronDown,
  ChevronUp,
  Plus,
  Building,
  BarChart2,
  MessageSquare,
  Settings,
  Crown,
  UserCheck,
  ShieldCheck,
  Flag,
  Bell,
  Clock,
  Activity,
  Star,
  Lock,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { useNotifications } from '../context/NotificationContext';

export default function Sidebar({ activeTab, setActiveTab, isOpen = false, onClose }) {
  const { user, logout } = useAuth();
  const { getTotalUnreadCount } = useChat();
  const { getNotificationsForUser, markAllAsRead } = useNotifications();

  const navTo = (tabId) => {
    setActiveTab(tabId);
    if (onClose) onClose();
  };

  // Submenu states for Admin Sidebar
  const [showAdminJobsSubmenu, setShowAdminJobsSubmenu] = useState(true);
  const [showAdminUsersSubmenu, setShowAdminUsersSubmenu] = useState(false);
  const [showAdminCompaniesSubmenu, setShowAdminCompaniesSubmenu] = useState(false);
  const [showAdminAppsSubmenu, setShowAdminAppsSubmenu] = useState(false);

  const [showRecruiterAppsSubmenu, setShowRecruiterAppsSubmenu] = useState(true);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const userDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const totalUnread = getTotalUnreadCount ? getTotalUnreadCount(role, emailClean) : 0;
  const userNotifications = getNotificationsForUser ? getNotificationsForUser(emailClean, role) : [];
  const unreadNotifCount = userNotifications.filter(n => !n.read).length;

  const portalSubtitle = role === 'admin'
    ? 'Admin Operations'
    : (role === 'recruiter' ? 'Recruiter Portal' : 'Candidate Portal');

  // Candidate Menu Items
  const candidateMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'jobs', label: 'Browse Jobs', icon: Briefcase },
    { id: 'applications', label: 'My Applications', icon: FileText },
    { id: 'saved', label: 'Saved Jobs', icon: Bookmark },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'help', label: 'Help & Support', icon: HelpCircle }
  ];

  // Dynamic Background & Styling based on Role
  const isAdmin = role === 'admin';
  const sidebarBg = isAdmin ? '#0b0f19' : '#ffffff';
  const sidebarBorder = isAdmin ? '#1e293b' : '#e2e8f0';
  const textColor = isAdmin ? '#94a3b8' : '#475569';
  const headingColor = isAdmin ? '#64748b' : '#94a3b8';

  return (
    <>
      {isOpen && (
        <div
          className="sidebar-mobile-backdrop"
          onClick={onClose}
        />
      )}
      <aside
        className={`app-sidebar ${isOpen ? 'sidebar-open' : ''}`}
        style={{
          width: '255px',
          height: '100vh',
          position: 'sticky',
          top: 0,
          flexShrink: 0,
          background: sidebarBg,
          borderRight: `1px solid ${sidebarBorder}`,
          padding: '1.25rem 1rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          zIndex: 1000,
          overflowY: 'auto',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        <div>
          {/* Brand Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 0.25rem 1rem 0.25rem', borderBottom: `1px solid ${isAdmin ? '#1e293b' : '#f1f5f9'}`, marginBottom: '1.15rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.25rem', flex: 1 }}>
              <div style={{ borderRadius: '14px', overflow: 'hidden', width: '100%' }}>
                <img
                  src="/careonix-brand-logo.png"
                  alt="CAREONIX Logo"
                  style={{ width: '100%', maxHeight: '42px', objectFit: 'contain', display: 'block' }}
                />
              </div>
              <div style={{ fontSize: '0.74rem', color: isAdmin ? '#818cf8' : '#7c3aed', fontWeight: '800', letterSpacing: '0.01em' }}>
                {role === 'admin' ? 'Admin Portal' : portalSubtitle}
              </div>
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={onClose}
              className="sidebar-close-btn"
              style={{
                background: isAdmin ? '#1e293b' : '#f1f5f9',
                border: 'none',
                borderRadius: '8px',
                width: '32px',
                height: '32px',
                cursor: 'pointer',
                color: isAdmin ? '#f8fafc' : '#475569',
                marginLeft: '0.5rem',
              }}
              title="Close Navigation"
            >
              <X size={18} />
            </button>
          </div>

        {/* ── 1. ADMIN PORTAL SPECIFIC SIDEBAR (Matching reference hierarchy 100%) ── */}
        {role === 'admin' ? (
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            
            {/* Dashboard */}
            <button
              onClick={() => navTo('dashboard')}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%', padding: '0.65rem 0.85rem',
                borderRadius: '12px', background: activeTab === 'dashboard' ? '#4f46e5' : 'transparent',
                color: activeTab === 'dashboard' ? '#ffffff' : '#cbd5e1', border: 'none',
                fontWeight: activeTab === 'dashboard' ? '800' : '600', fontSize: '0.88rem', cursor: 'pointer',
                boxShadow: activeTab === 'dashboard' ? '0 4px 12px rgba(79,70,229,0.35)' : 'none'
              }}
            >
              <Home size={18} color={activeTab === 'dashboard' ? '#ffffff' : '#94a3b8'} />
              <span>Dashboard</span>
            </button>

            {/* SECTION: MANAGEMENT */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: '800', color: headingColor, letterSpacing: '0.05em', paddingLeft: '0.85rem', marginBottom: '4px' }}>
                MANAGEMENT
              </div>

              {/* Users */}
              <button
                onClick={() => navTo('users')}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%', padding: '0.6rem 0.85rem',
                  borderRadius: '10px', background: activeTab === 'users' ? '#1e1b4b' : 'transparent',
                  color: activeTab === 'users' ? '#818cf8' : '#cbd5e1', border: 'none',
                  fontWeight: activeTab === 'users' ? '700' : '600', fontSize: '0.86rem', cursor: 'pointer'
                }}
              >
                <Users size={17} color={activeTab === 'users' ? '#818cf8' : '#94a3b8'} />
                <span>Users</span>
              </button>

              {/* Jobs */}
              <button
                onClick={() => navTo('jobs')}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%', padding: '0.6rem 0.85rem',
                  borderRadius: '10px', background: activeTab === 'jobs' ? '#1e1b4b' : 'transparent',
                  color: activeTab === 'jobs' ? '#818cf8' : '#cbd5e1', border: 'none',
                  fontWeight: activeTab === 'jobs' ? '700' : '600', fontSize: '0.86rem', cursor: 'pointer'
                }}
              >
                <Briefcase size={17} color={activeTab === 'jobs' ? '#818cf8' : '#94a3b8'} />
                <span>Jobs</span>
              </button>

              {/* Companies */}
              <button
                onClick={() => navTo('companies')}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%', padding: '0.6rem 0.85rem',
                  borderRadius: '10px', background: activeTab === 'companies' ? '#1e1b4b' : 'transparent',
                  color: activeTab === 'companies' ? '#818cf8' : '#cbd5e1', border: 'none',
                  fontWeight: activeTab === 'companies' ? '700' : '600', fontSize: '0.86rem', cursor: 'pointer'
                }}
              >
                <Building size={17} color={activeTab === 'companies' ? '#818cf8' : '#94a3b8'} />
                <span>Companies</span>
              </button>

              {/* Applications */}
              <button
                onClick={() => navTo('applications')}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%', padding: '0.6rem 0.85rem',
                  borderRadius: '10px', background: activeTab === 'applications' ? '#1e1b4b' : 'transparent',
                  color: activeTab === 'applications' ? '#818cf8' : '#cbd5e1', border: 'none',
                  fontWeight: activeTab === 'applications' ? '700' : '600', fontSize: '0.86rem', cursor: 'pointer'
                }}
              >
                <FileText size={17} color={activeTab === 'applications' ? '#818cf8' : '#94a3b8'} />
                <span>Applications</span>
              </button>

              {/* Verification */}
              <button
                onClick={() => navTo('verification')}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%', padding: '0.6rem 0.85rem',
                  borderRadius: '10px', background: activeTab === 'verification' ? '#1e1b4b' : 'transparent',
                  color: activeTab === 'verification' ? '#818cf8' : '#cbd5e1', border: 'none',
                  fontWeight: activeTab === 'verification' ? '700' : '600', fontSize: '0.86rem', cursor: 'pointer'
                }}
              >
                <ShieldCheck size={17} color={activeTab === 'verification' ? '#818cf8' : '#94a3b8'} />
                <span>Verification</span>
              </button>

              {/* Subscriptions & Pricing Hub */}
              <button
                onClick={() => navTo('subscriptions')}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%', padding: '0.6rem 0.85rem',
                  borderRadius: '10px', background: activeTab === 'subscriptions' ? '#1e1b4b' : 'transparent',
                  color: activeTab === 'subscriptions' ? '#818cf8' : '#cbd5e1', border: 'none',
                  fontWeight: activeTab === 'subscriptions' ? '700' : '600', fontSize: '0.86rem', cursor: 'pointer'
                }}
              >
                <CreditCard size={17} color={activeTab === 'subscriptions' ? '#818cf8' : '#94a3b8'} />
                <span>Subscriptions &amp; Pricing</span>
              </button>

              {/* Reports & Complaints */}
              <button
                onClick={() => navTo('reports')}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%', padding: '0.6rem 0.85rem',
                  borderRadius: '10px', background: activeTab === 'reports' ? '#1e1b4b' : 'transparent',
                  color: activeTab === 'reports' ? '#818cf8' : '#cbd5e1', border: 'none',
                  fontWeight: activeTab === 'reports' ? '700' : '600', fontSize: '0.86rem', cursor: 'pointer'
                }}
              >
                <Flag size={17} color={activeTab === 'reports' ? '#818cf8' : '#94a3b8'} />
                <span>Reports &amp; Complaints</span>
              </button>

              {/* Messages */}
              <button
                onClick={() => navTo('messages')}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '0.6rem 0.85rem',
                  borderRadius: '10px', background: activeTab === 'messages' ? '#1e1b4b' : 'transparent',
                  color: activeTab === 'messages' ? '#818cf8' : '#cbd5e1', border: 'none',
                  fontWeight: activeTab === 'messages' ? '700' : '600', fontSize: '0.86rem', cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <MessageSquare size={17} color={activeTab === 'messages' ? '#818cf8' : '#94a3b8'} />
                  <span>Messages</span>
                </div>
                {totalUnread > 0 && (
                  <span style={{ background: '#22c55e', color: '#ffffff', padding: '1px 7px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: '800' }}>
                    {totalUnread}
                  </span>
                )}
              </button>

            </div>

            {/* SECTION: ANALYTICS */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: '800', color: headingColor, letterSpacing: '0.05em', paddingLeft: '0.85rem', marginBottom: '4px' }}>
                ANALYTICS
              </div>

              <button
                onClick={() => navTo('analytics')}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%', padding: '0.6rem 0.85rem',
                  borderRadius: '10px', background: activeTab === 'analytics' ? '#1e1b4b' : 'transparent',
                  color: activeTab === 'analytics' ? '#818cf8' : '#cbd5e1', border: 'none',
                  fontWeight: activeTab === 'analytics' ? '700' : '600', fontSize: '0.86rem', cursor: 'pointer'
                }}
              >
                <BarChart2 size={17} color={activeTab === 'analytics' ? '#818cf8' : '#94a3b8'} />
                <span>Analytics</span>
              </button>

              <button
                onClick={() => navTo('analytics_reports')}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%', padding: '0.6rem 0.85rem',
                  borderRadius: '10px', background: activeTab === 'analytics_reports' ? '#1e1b4b' : 'transparent',
                  color: activeTab === 'analytics_reports' ? '#818cf8' : '#cbd5e1', border: 'none',
                  fontWeight: activeTab === 'analytics_reports' ? '700' : '600', fontSize: '0.86rem', cursor: 'pointer'
                }}
              >
                <FileText size={17} color={activeTab === 'analytics_reports' ? '#818cf8' : '#94a3b8'} />
                <span>Reports</span>
              </button>
            </div>

            {/* SECTION: SYSTEM */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: '800', color: headingColor, letterSpacing: '0.05em', paddingLeft: '0.85rem', marginBottom: '4px' }}>
                SYSTEM
              </div>

              {/* Notifications with Dynamic Badge */}
              <button
                onClick={() => {
                  markAllAsRead(emailClean, role);
                  navTo('notifications');
                }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '0.6rem 0.85rem',
                  borderRadius: '10px', background: activeTab === 'notifications' ? '#1e1b4b' : 'transparent',
                  color: activeTab === 'notifications' ? '#818cf8' : '#cbd5e1', border: 'none',
                  fontWeight: activeTab === 'notifications' ? '700' : '600', fontSize: '0.86rem', cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Bell size={17} color={activeTab === 'notifications' ? '#818cf8' : '#94a3b8'} />
                  <span>Notifications</span>
                </div>
                {unreadNotifCount > 0 && (
                  <span style={{ background: '#4f46e5', color: '#ffffff', padding: '1px 7px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: '800' }}>
                    {unreadNotifCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => navTo('settings')}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%', padding: '0.6rem 0.85rem',
                  borderRadius: '10px', background: activeTab === 'settings' ? '#1e1b4b' : 'transparent',
                  color: activeTab === 'settings' ? '#818cf8' : '#cbd5e1', border: 'none',
                  fontWeight: activeTab === 'settings' ? '700' : '600', fontSize: '0.86rem', cursor: 'pointer'
                }}
              >
                <Settings size={17} color={activeTab === 'settings' ? '#818cf8' : '#94a3b8'} />
                <span>Settings</span>
              </button>

              <button
                onClick={() => navTo('audit_logs')}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%', padding: '0.6rem 0.85rem',
                  borderRadius: '10px', background: activeTab === 'audit_logs' ? '#1e1b4b' : 'transparent',
                  color: activeTab === 'audit_logs' ? '#818cf8' : '#cbd5e1', border: 'none',
                  fontWeight: activeTab === 'audit_logs' ? '700' : '600', fontSize: '0.86rem', cursor: 'pointer'
                }}
              >
                <Clock size={17} color={activeTab === 'audit_logs' ? '#818cf8' : '#94a3b8'} />
                <span>Audit Logs</span>
              </button>

              <button
                onClick={() => navTo('system_health')}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%', padding: '0.6rem 0.85rem',
                  borderRadius: '10px', background: activeTab === 'system_health' ? '#1e1b4b' : 'transparent',
                  color: activeTab === 'system_health' ? '#818cf8' : '#cbd5e1', border: 'none',
                  fontWeight: activeTab === 'system_health' ? '700' : '600', fontSize: '0.86rem', cursor: 'pointer'
                }}
              >
                <Activity size={17} color={activeTab === 'system_health' ? '#818cf8' : '#94a3b8'} />
                <span>System Health</span>
              </button>
            </div>

          </nav>
        ) : (role === 'recruiter' ? (() => {
          const isRecruiterPending = user?.approvalStatus === 'PENDING_APPROVAL' || user?.approvalStatus === 'PENDING';
          return (
          /* ── 2. RECRUITER PORTAL SPECIFIC SIDEBAR ── */
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            
            {/* 1. Dashboard */}
            <button
              onClick={() => navTo('dashboard')}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%', padding: '0.65rem 0.85rem',
                borderRadius: '12px', background: activeTab === 'dashboard' ? '#f3e8ff' : 'transparent',
                color: activeTab === 'dashboard' ? '#7c3aed' : '#475569', border: 'none',
                fontWeight: activeTab === 'dashboard' ? '800' : '600', fontSize: '0.88rem', cursor: 'pointer'
              }}
            >
              <Home size={18} color={activeTab === 'dashboard' ? '#7c3aed' : '#64748b'} />
              <span>Dashboard</span>
            </button>



            {/* 3. My Jobs */}
            <button
              onClick={() => !isRecruiterPending && navTo('jobs')}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '0.65rem 0.85rem',
                borderRadius: '12px',
                background: isRecruiterPending ? 'transparent' : (activeTab === 'jobs' ? '#f3e8ff' : 'transparent'),
                color: isRecruiterPending ? '#94a3b8' : (activeTab === 'jobs' ? '#7c3aed' : '#475569'), border: 'none',
                fontWeight: activeTab === 'jobs' ? '800' : '600', fontSize: '0.88rem',
                cursor: isRecruiterPending ? 'not-allowed' : 'pointer',
                opacity: isRecruiterPending ? 0.5 : 1
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Briefcase size={18} color={isRecruiterPending ? '#94a3b8' : (activeTab === 'jobs' ? '#7c3aed' : '#64748b')} />
                <span>My Jobs</span>
              </div>
              {isRecruiterPending && <Lock size={14} color="#d97706" title="Verification Required" />}
            </button>

            {/* 4. Applications */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <button
                onClick={() => { if (!isRecruiterPending) { navTo('applications'); setShowRecruiterAppsSubmenu(!showRecruiterAppsSubmenu); } }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '0.65rem 0.85rem',
                  borderRadius: '12px',
                  background: isRecruiterPending ? 'transparent' : (activeTab === 'applications' ? '#f3e8ff' : 'transparent'),
                  color: isRecruiterPending ? '#94a3b8' : (activeTab === 'applications' ? '#7c3aed' : '#475569'), border: 'none',
                  fontWeight: activeTab === 'applications' ? '800' : '600', fontSize: '0.88rem',
                  cursor: isRecruiterPending ? 'not-allowed' : 'pointer',
                  opacity: isRecruiterPending ? 0.5 : 1
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <FileText size={18} color={isRecruiterPending ? '#94a3b8' : (activeTab === 'applications' ? '#7c3aed' : '#64748b')} />
                  <span>Applications</span>
                </div>
                {isRecruiterPending ? <Lock size={14} color="#d97706" title="Verification Required" /> : (showRecruiterAppsSubmenu ? <ChevronUp size={16} color="#64748b" /> : <ChevronDown size={16} color="#64748b" />)}
              </button>
            </div>

            {/* 5. Candidates */}
            <button
              onClick={() => !isRecruiterPending && navTo('candidates')}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '0.65rem 0.85rem',
                borderRadius: '12px',
                background: isRecruiterPending ? 'transparent' : (activeTab === 'candidates' ? '#f3e8ff' : 'transparent'),
                color: isRecruiterPending ? '#94a3b8' : (activeTab === 'candidates' ? '#7c3aed' : '#475569'), border: 'none',
                fontWeight: activeTab === 'candidates' ? '800' : '600', fontSize: '0.88rem',
                cursor: isRecruiterPending ? 'not-allowed' : 'pointer',
                opacity: isRecruiterPending ? 0.5 : 1
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <UserCheck size={18} color={isRecruiterPending ? '#94a3b8' : (activeTab === 'candidates' ? '#7c3aed' : '#64748b')} />
                <span>Candidates</span>
              </div>
              {isRecruiterPending && <Lock size={14} color="#d97706" title="Verification Required" />}
            </button>

            {/* 6. Company Profile */}
            <button
              onClick={() => navTo('profile')}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%', padding: '0.65rem 0.85rem',
                borderRadius: '12px', background: activeTab === 'profile' ? '#f3e8ff' : 'transparent',
                color: activeTab === 'profile' ? '#7c3aed' : '#475569', border: 'none',
                fontWeight: activeTab === 'profile' ? '800' : '600', fontSize: '0.88rem', cursor: 'pointer'
              }}
            >
              <Building size={18} color={activeTab === 'profile' ? '#7c3aed' : '#64748b'} />
              <span>Company Profile</span>
            </button>

            {/* 7. Reports & Analytics */}
            <button
              onClick={() => !isRecruiterPending && navTo('reports')}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '0.65rem 0.85rem',
                borderRadius: '12px',
                background: isRecruiterPending ? 'transparent' : (activeTab === 'reports' ? '#f3e8ff' : 'transparent'),
                color: isRecruiterPending ? '#94a3b8' : (activeTab === 'reports' ? '#7c3aed' : '#475569'), border: 'none',
                fontWeight: activeTab === 'reports' ? '800' : '600', fontSize: '0.88rem',
                cursor: isRecruiterPending ? 'not-allowed' : 'pointer',
                opacity: isRecruiterPending ? 0.5 : 1
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <BarChart2 size={18} color={isRecruiterPending ? '#94a3b8' : (activeTab === 'reports' ? '#7c3aed' : '#64748b')} />
                <span>Reports &amp; Analytics</span>
              </div>
              {isRecruiterPending && <Lock size={14} color="#d97706" title="Verification Required" />}
            </button>

            {/* 8. Messages */}
            <button
              onClick={() => !isRecruiterPending && navTo('messages')}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '0.65rem 0.85rem',
                borderRadius: '12px',
                background: isRecruiterPending ? 'transparent' : (activeTab === 'messages' ? '#f3e8ff' : 'transparent'),
                color: isRecruiterPending ? '#94a3b8' : (activeTab === 'messages' ? '#7c3aed' : '#475569'), border: 'none',
                fontWeight: activeTab === 'messages' ? '800' : '600', fontSize: '0.88rem',
                cursor: isRecruiterPending ? 'not-allowed' : 'pointer',
                opacity: isRecruiterPending ? 0.5 : 1
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <MessageSquare size={18} color={isRecruiterPending ? '#94a3b8' : (activeTab === 'messages' ? '#7c3aed' : '#64748b')} />
                <span>Messages</span>
              </div>
              {isRecruiterPending ? (
                <Lock size={14} color="#d97706" title="Verification Required" />
              ) : totalUnread > 0 ? (
                <span style={{ background: '#22c55e', color: '#ffffff', padding: '2px 7px', borderRadius: '50px', fontSize: '0.74rem', fontWeight: '800' }}>
                  {totalUnread}
                </span>
              ) : null}
            </button>

            {/* 9. Subscriptions */}
            <button
              onClick={() => navTo('subscriptions')}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%', padding: '0.65rem 0.85rem',
                borderRadius: '12px', background: activeTab === 'subscriptions' ? '#f3e8ff' : 'transparent',
                color: activeTab === 'subscriptions' ? '#7c3aed' : '#475569', border: 'none',
                fontWeight: activeTab === 'subscriptions' ? '800' : '600', fontSize: '0.88rem', cursor: 'pointer'
              }}
            >
              <Crown size={18} color={activeTab === 'subscriptions' ? '#7c3aed' : '#64748b'} />
              <span>Subscriptions</span>
            </button>

            {/* 10. Notifications */}
            <button
              onClick={() => { markAllAsRead(emailClean, role); navTo('notifications'); }}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '0.65rem 0.85rem',
                borderRadius: '12px', background: activeTab === 'notifications' ? '#f3e8ff' : 'transparent',
                color: activeTab === 'notifications' ? '#7c3aed' : '#475569', border: 'none',
                fontWeight: activeTab === 'notifications' ? '800' : '600', fontSize: '0.88rem', cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Bell size={18} color={activeTab === 'notifications' ? '#7c3aed' : '#64748b'} />
                <span>Notifications</span>
              </div>
              {unreadNotifCount > 0 && (
                <span style={{ background: '#4f46e5', color: '#ffffff', padding: '1px 7px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: '800' }}>
                  {unreadNotifCount}
                </span>
              )}
            </button>

            {/* 11. Settings */}
            <button
              onClick={() => navTo('settings')}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%', padding: '0.65rem 0.85rem',
                borderRadius: '12px', background: activeTab === 'settings' ? '#f3e8ff' : 'transparent',
                color: activeTab === 'settings' ? '#7c3aed' : '#475569', border: 'none',
                fontWeight: activeTab === 'settings' ? '800' : '600', fontSize: '0.88rem', cursor: 'pointer'
              }}
            >
              <Settings size={18} color={activeTab === 'settings' ? '#7c3aed' : '#64748b'} />
              <span>Settings</span>
            </button>

          </nav>
          );
        })() : (
          /* ── 3. CANDIDATE SIDEBAR ── */
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {candidateMenuItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => navTo(item.id)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '0.75rem 1rem',
                    borderRadius: '12px', background: isActive ? '#f3e8ff' : 'transparent',
                    color: isActive ? '#7c3aed' : '#64748b', border: 'none',
                    fontWeight: isActive ? '700' : '600', fontSize: '0.9rem', textAlign: 'left', cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Icon size={18} color={isActive ? '#7c3aed' : '#64748b'} />
                    <span>{item.label}</span>
                  </div>
                  {item.id === 'messages' && totalUnread > 0 && (
                    <span style={{ background: '#22c55e', color: '#ffffff', padding: '2px 7px', borderRadius: '50px', fontSize: '0.74rem', fontWeight: '800' }}>
                      {totalUnread}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        ))}
      </div>

      {/* ── BOTTOM SECTION: User Profile Footer ─────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>

        {/* User Profile Pill Footer */}
        <div ref={userDropdownRef} style={{ position: 'relative' }}>
          <div
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.6rem 0.75rem',
              borderRadius: '12px',
              background: isAdmin ? '#1e293b' : '#f8fafc',
              border: `1px solid ${isAdmin ? '#334155' : '#e2e8f0'}`,
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: isAdmin ? '#4f46e5' : '#7c3aed', color: '#ffffff', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.95rem' }}>
                {(user?.company || user?.name || 'A').charAt(0).toUpperCase()}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.84rem', fontWeight: '800', color: isAdmin ? '#f8fafc' : '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '120px' }}>
                  {user?.name || user?.company || 'Admin'}
                </span>
                <span style={{ fontSize: '0.72rem', color: isAdmin ? '#94a3b8' : '#64748b', fontWeight: '500', textTransform: 'capitalize' }}>
                  {role === 'admin' ? 'Super Administrator' : role}
                </span>
              </div>
            </div>
            <ChevronDown size={16} color={isAdmin ? '#94a3b8' : '#94a3b8'} />
          </div>

          {/* User Options Dropdown */}
          {showUserDropdown && (
            <div style={{ position: 'absolute', bottom: '100%', left: 0, right: 0, marginBottom: '6px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 10px 25px rgba(15,23,42,0.1)', zIndex: 60, padding: '6px' }}>
              <button
                onClick={() => { navTo('profile'); setShowUserDropdown(false); }}
                style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '8px', border: 'none', background: 'transparent', color: '#0f172a', fontSize: '0.82rem', fontWeight: '600', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <User size={14} color="#7c3aed" /> Account Details
              </button>
              <button
                onClick={() => { logout(); setShowUserDropdown(false); if (onClose) onClose(); }}
                style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '8px', border: 'none', background: '#fef2f2', color: '#dc2626', fontSize: '0.82rem', fontWeight: '700', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}
              >
                <LogOut size={14} color="#dc2626" /> Logout
              </button>
            </div>
          )}
        </div>

        {/* Footer Copyright */}
        {isAdmin && (
          <div style={{ fontSize: '0.68rem', color: '#64748b', textAlign: 'center', marginTop: '2px' }}>
            &copy; 2026 CAREONIX. All rights reserved.
          </div>
        )}

      </div>
    </aside>
    </>
  );
}
