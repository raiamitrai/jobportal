import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { JobProvider } from './context/JobContext';
import { NotificationProvider } from './context/NotificationContext';
import LoginPage from './pages/LoginPage';
import LandingPage from './pages/LandingPage';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import AdminDashboard from './pages/AdminDashboard';
import ClientDashboard from './pages/ClientDashboard';
import JobListings from './pages/JobListings';
import Subscriptions from './pages/Subscriptions';
import UserDirectory from './pages/UserDirectory';
import { useJobs } from './context/JobContext';
import { 
  CheckCircle2, Briefcase, MapPin, Calendar, 
  Bookmark, User, Edit3, Save, BookmarkX 
} from 'lucide-react';
import CompanyLogo from './components/CompanyLogo';

import MyApplicationsPage from './pages/MyApplicationsPage';
import HelpSupportPage from './pages/HelpSupportPage';
import SavedJobsPage from './pages/SavedJobsPage';
import CandidateProfilePage from './pages/CandidateProfilePage';
import RecruiterDashboard from './pages/RecruiterDashboard';
import RecruiterApplicationsPage from './pages/RecruiterApplicationsPage';
import RecruiterCandidatesPage from './pages/RecruiterCandidatesPage';
import RecruiterCompanyProfilePage from './pages/RecruiterCompanyProfilePage';
import RecruiterReportsPage from './pages/RecruiterReportsPage';
import RecruiterMessagesPage from './pages/RecruiterMessagesPage';
import RecruiterSettingsPage from './pages/RecruiterSettingsPage';
import AdminSettingsPage from './pages/AdminSettingsPage';
import AdminCompaniesPage from './pages/AdminCompaniesPage';
import AdminApplicationsPage from './pages/AdminApplicationsPage';
import AdminVerificationPage from './pages/AdminVerificationPage';
import AdminReportsPage from './pages/AdminReportsPage';
import AdminAnalyticsPage from './pages/AdminAnalyticsPage';
import AdminAnalyticsReportsPage from './pages/AdminAnalyticsReportsPage';
import AdminNotificationsPage from './pages/AdminNotificationsPage';
import NotificationsPage from './pages/NotificationsPage';
import CandidateMessagesPage from './pages/CandidateMessagesPage';
import AdminMessagesPage from './pages/AdminMessagesPage';
import AdminAuditLogsPage from './pages/AdminAuditLogsPage';
import OAuthCallbackPage from './pages/OAuthCallbackPage';
import AdminSystemHealthPage from './pages/AdminSystemHealthPage';
import AdminSubscriptionPage from './pages/AdminSubscriptionPage';
import { ChatProvider } from './context/ChatContext';
import RecruiterFeatureLock from './pages/RecruiterFeatureLock';
import { isRecruiterUnlocked } from './utils/subscriptionUtils';
import { applySettingsToDOM, getSettings } from './utils/settingsManager';

export const PATH_TO_TAB = {
  // ── Global / Short URL Aliases ──
  '/dashboard': 'dashboard',
  '/jobs': 'jobs',
  '/post-job': 'post-job',
  '/subscriptions': 'subscriptions',
  '/applications': 'applications',
  '/candidates': 'candidates',
  '/users': 'users',
  '/companies': 'companies',
  '/verification': 'verification',
  '/saved': 'saved',
  '/profile': 'profile',
  '/analytics': 'analytics',
  '/analytics-reports': 'analytics_reports',
  '/reports': 'reports',
  '/messages': 'messages',
  '/notifications': 'notifications',
  '/settings': 'settings',
  '/audit-logs': 'audit_logs',
  '/system-health': 'system_health',
  '/help': 'help',

  // ── Recruiter Dedicated Routes ──
  '/recruiter': 'dashboard',
  '/recruiter/dashboard': 'dashboard',
  '/recruiter/jobs': 'jobs',
  '/recruiter/my-jobs': 'jobs',
  '/recruiter/post-job': 'post-job',
  '/recruiter/applications': 'applications',
  '/recruiter/candidates': 'candidates',
  '/recruiter/company': 'profile',
  '/recruiter/profile': 'profile',
  '/recruiter/messages': 'messages',
  '/recruiter/subscriptions': 'subscriptions',
  '/recruiter/reports': 'reports',
  '/recruiter/analytics': 'analytics',
  '/recruiter/notifications': 'notifications',
  '/recruiter/settings': 'settings',

  // ── Candidate Dedicated Routes ──
  '/candidate': 'dashboard',
  '/candidate/dashboard': 'dashboard',
  '/candidate/jobs': 'jobs',
  '/candidate/applications': 'applications',
  '/candidate/saved': 'saved',
  '/candidate/profile': 'profile',
  '/candidate/messages': 'messages',
  '/candidate/notifications': 'notifications',
  '/candidate/help': 'help',

  // ── Admin Dedicated Routes ──
  '/admin': 'dashboard',
  '/admin/dashboard': 'dashboard',
  '/admin/users': 'users',
  '/admin/jobs': 'jobs',
  '/admin/companies': 'companies',
  '/admin/applications': 'applications',
  '/admin/subscriptions': 'subscriptions',
  '/admin/verification': 'verification',
  '/admin/analytics': 'analytics',
  '/admin/analytics-reports': 'analytics_reports',
  '/admin/reports': 'reports',
  '/admin/messages': 'messages',
  '/admin/notifications': 'notifications',
  '/admin/system-health': 'system_health',
  '/admin/audit-logs': 'audit_logs',
  '/admin/settings': 'settings',
};

export const getPathForTab = (tab, role = 'candidate') => {
  if (role === 'recruiter') {
    const recruiterMap = {
      'dashboard': '/recruiter/dashboard',
      'jobs': '/recruiter/jobs',
      'post-job': '/recruiter/post-job',
      'applications': '/recruiter/applications',
      'candidates': '/recruiter/candidates',
      'profile': '/recruiter/company',
      'companies': '/recruiter/company',
      'messages': '/recruiter/messages',
      'subscriptions': '/recruiter/subscriptions',
      'reports': '/recruiter/reports',
      'analytics': '/recruiter/analytics',
      'notifications': '/recruiter/notifications',
      'settings': '/recruiter/settings',
    };
    return recruiterMap[tab] || `/recruiter/${tab}`;
  }
  if (role === 'admin') {
    const adminMap = {
      'dashboard': '/admin/dashboard',
      'users': '/admin/users',
      'jobs': '/admin/jobs',
      'companies': '/admin/companies',
      'applications': '/admin/applications',
      'subscriptions': '/admin/subscriptions',
      'verification': '/admin/verification',
      'analytics': '/admin/analytics',
      'analytics_reports': '/admin/analytics-reports',
      'reports': '/admin/reports',
      'messages': '/admin/messages',
      'notifications': '/admin/notifications',
      'audit_logs': '/admin/audit-logs',
      'system_health': '/admin/system-health',
      'settings': '/admin/settings',
    };
    return adminMap[tab] || `/admin/${tab}`;
  }
  // Candidate
  const candidateMap = {
    'dashboard': '/candidate/dashboard',
    'jobs': '/candidate/jobs',
    'applications': '/candidate/applications',
    'saved': '/candidate/saved',
    'profile': '/candidate/profile',
    'messages': '/candidate/messages',
    'notifications': '/candidate/notifications',
    'help': '/candidate/help',
  };
  return candidateMap[tab] || `/candidate/${tab}`;
};

// Profile Page
function ProfilePage() {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '700px' }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a' }}>My Profile</h1>
        <p style={{ color: '#64748b', marginTop: '0.25rem', fontSize: '0.9rem' }}>Manage your personal information and preferences.</p>
      </div>

      {/* Profile Card */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(15,23,42,0.04)' }}>
        {/* Cover */}
        <div style={{ height: '100px', background: 'linear-gradient(135deg, #e0e7ff 0%, #f3e8ff 100%)' }} />
        
        {/* Avatar & Name */}
        <div style={{ padding: '0 1.75rem 1.75rem', position: 'relative' }}>
          <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: '#e0e7ff', border: '4px solid #ffffff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.75rem', marginTop: '-36px', boxShadow: '0 4px 12px rgba(79,70,229,0.15)' }}>
            {(user?.name || 'U').charAt(0).toUpperCase()}
          </div>

          <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a' }}>{user?.name || 'Candidate User'}</h2>
              <p style={{ color: '#64748b', fontSize: '0.88rem' }}>{user?.email || ''}</p>
              <span style={{ background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0', padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700', display: 'inline-block', marginTop: '0.4rem' }}>Candidate</span>
            </div>
            <button
              onClick={() => setEditing(!editing)}
              style={{ background: editing ? '#dcfce7' : '#f1f5f9', color: editing ? '#15803d' : '#475569', border: `1px solid ${editing ? '#bbf7d0' : '#e2e8f0'}`, padding: '0.55rem 1rem', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <Edit3 size={15} /> {editing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>
        </div>
      </div>

      {/* Profile Info Form */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.75rem', boxShadow: '0 2px 8px rgba(15,23,42,0.04)' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a', marginBottom: '1.25rem' }}>Personal Information</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
          <div>
            <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Full Name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              disabled={!editing}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', background: editing ? '#f8fafc' : '#fafafa', border: `1px solid ${editing ? '#cbd5e1' : '#f1f5f9'}`, color: '#0f172a', marginTop: '0.35rem', fontFamily: 'Inter, sans-serif', fontSize: '0.9rem' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Email Address</label>
            <input
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={!editing}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', background: editing ? '#f8fafc' : '#fafafa', border: `1px solid ${editing ? '#cbd5e1' : '#f1f5f9'}`, color: '#0f172a', marginTop: '0.35rem', fontFamily: 'Inter, sans-serif', fontSize: '0.9rem' }}
            />
          </div>
        </div>
        {editing && (
          <button
            onClick={() => { alert('Profile updated!'); setEditing(false); }}
            style={{ marginTop: '1.25rem', background: '#4f46e5', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Save size={16} /> Save Changes
          </button>
        )}
      </div>
    </div>
  );
}

function AuthenticatedApp({ tab }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTabState] = useState(() => {
    // Dynamic route matching for apply pages, admin settings, and candidate profile subtabs
    const applyMatch = location.pathname.match(/^\/candidate\/jobs\/[^/]+\/apply$/);
    const adminSettingsMatch = location.pathname.startsWith('/admin/settings');
    const candidateProfileMatch = location.pathname.startsWith('/candidate/profile');
    const recruiterSettingsMatch = location.pathname.startsWith('/recruiter/settings');
    return tab || (applyMatch ? 'jobs' : adminSettingsMatch ? 'settings' : recruiterSettingsMatch ? 'settings' : candidateProfileMatch ? 'profile' : PATH_TO_TAB[location.pathname]) || sessionStorage.getItem('careonix_active_tab') || 'dashboard';
  });

  useEffect(() => {
    // Dynamic route matching for apply pages, admin settings, candidate profile, and recruiter settings subtabs
    const applyMatch = location.pathname.match(/^\/candidate\/jobs\/[^/]+\/apply$/);
    const adminSettingsMatch = location.pathname.startsWith('/admin/settings');
    const candidateProfileMatch = location.pathname.startsWith('/candidate/profile');
    const recruiterSettingsMatch = location.pathname.startsWith('/recruiter/settings');
    const currentTab = tab || (applyMatch ? 'jobs' : adminSettingsMatch ? 'settings' : recruiterSettingsMatch ? 'settings' : candidateProfileMatch ? 'profile' : PATH_TO_TAB[location.pathname]) || 'dashboard';
    setActiveTabState(currentTab);
    try {
      sessionStorage.setItem('careonix_active_tab', currentTab);
    } catch (e) {}
  }, [location.pathname, tab]);

  const setActiveTab = (newTab) => {
    setActiveTabState(newTab);
    try {
      sessionStorage.setItem('careonix_active_tab', newTab);
    } catch (e) {}
    const targetPath = getPathForTab(newTab, role);
    if (location.pathname !== targetPath) {
      navigate(targetPath);
    }
  };

  const accountTypeClean = (user?.accountType || '').toLowerCase();
  const userRoleClean = (user?.role || '').toLowerCase();
  const viewOverride = sessionStorage.getItem('careonix_view_override');

  let role = 'candidate';
  if (viewOverride === 'admin' || viewOverride === 'recruiter' || viewOverride === 'candidate') {
    role = viewOverride;
  } else if (userRoleClean === 'admin' || accountTypeClean === 'admin') {
    role = 'admin';
  } else if (
    accountTypeClean === 'recruiter' ||
    userRoleClean === 'recruiter' ||
    Boolean(user?.company) ||
    Boolean(user?.companyName)
  ) {
    role = 'recruiter';
  } else {
    role = 'candidate';
  }

  useEffect(() => {
    if (role === 'admin') {
      if (activeTab === 'users') document.title = "User Directory | CAREONIX Admin";
      else if (activeTab === 'subscriptions') document.title = "Manage Subscriptions | CAREONIX Admin";
      else if (activeTab === 'jobs') document.title = "All Job Listings | CAREONIX Admin";
      else if (activeTab === 'applications') document.title = "All Applications | CAREONIX Admin";
      else document.title = "Admin Operations | CAREONIX";
    } else if (role === 'recruiter') {
      if (activeTab === 'jobs') document.title = "My Job Postings | CAREONIX Recruiter";
      else if (activeTab === 'post-job') document.title = "Post a New Job | CAREONIX Recruiter";
      else if (activeTab === 'applications') document.title = "Candidate Applicants | CAREONIX Recruiter";
      else if (activeTab === 'profile') document.title = "Company Profile | CAREONIX Recruiter";
      else document.title = "Recruiter Dashboard | CAREONIX";
    } else {
      if (activeTab === 'jobs') document.title = "Browse Jobs | CAREONIX";
      else if (activeTab === 'applications') document.title = "My Applications | CAREONIX";
      else if (activeTab === 'saved') document.title = "Saved Jobs | CAREONIX";
      else if (activeTab === 'profile') document.title = "My Profile | CAREONIX";
      else document.title = "Candidate Dashboard | CAREONIX";
    }
  }, [role, activeTab]);

  const renderContent = () => {
    const isRecruiterPending = role === 'recruiter' && !isRecruiterUnlocked(user);
    const currentSettings = getSettings();

    // ── Maintenance Mode Gate for Candidates & Recruiters ──
    if (currentSettings?.general?.maintenanceMode && role !== 'admin') {
      const gen = currentSettings.general;
      return (
        <div style={{
          background: '#fff', borderRadius: '24px', padding: '3.5rem 2rem',
          border: '1px solid #fed7aa', boxShadow: '0 10px 30px rgba(234,88,12,0.06)',
          maxWidth: '620px', margin: '3rem auto', textAlign: 'center', fontFamily: 'Inter, sans-serif'
        }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: '#fff7ed', color: '#ea580c', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
            <AlertCircle size={32} />
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: '900', color: '#0f172a', margin: '0 0 0.5rem 0' }}>Under Scheduled Maintenance</h2>
          <p style={{ fontSize: '0.92rem', color: '#64748b', lineHeight: '1.6', marginBottom: '1.5rem' }}>
            {gen.maintenanceMsg || 'We are currently performing scheduled platform maintenance. We will be back online shortly.'}
          </p>
          {gen.estimatedBack && (
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '0.75rem 1.25rem', display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '0.86rem', color: '#334155', fontWeight: '700', marginBottom: '1.5rem' }}>
              <Calendar size={16} color="#6366f1" /> Estimated Back Online: {gen.estimatedBack}
            </div>
          )}
          <div>
            <a href={`mailto:${gen.supportEmail || 'support@careonix.com'}`} style={{ textDecoration: 'none', background: '#6366f1', color: '#fff', padding: '0.75rem 1.5rem', borderRadius: '12px', fontWeight: '700', fontSize: '0.88rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Mail size={16} /> Contact Support
            </a>
          </div>
        </div>
      );
    }

    if (activeTab === 'jobs') {
      if (isRecruiterPending) return <RecruiterFeatureLock featureName="My Jobs" setActiveTab={setActiveTab} />;
      return <JobListings role={role} setActiveTab={setActiveTab} />;
    }
    if (activeTab === 'post-job') {
      if (isRecruiterPending) {
        return <RecruiterFeatureLock featureName="Job Vacancy Posting" setActiveTab={setActiveTab} />;
      }
      return <JobListings role={role} setActiveTab={setActiveTab} initialShowPostModal={true} />;
    }
    if (activeTab === 'subscriptions') {
      return role === 'admin' ? <AdminSubscriptionPage /> : <Subscriptions role={role} />;
    }
    if (activeTab === 'applications') {
      if (role === 'admin') return <AdminApplicationsPage />;
      if (role === 'candidate') return <MyApplicationsPage setActiveTab={setActiveTab} />;
      if (isRecruiterPending) return <RecruiterFeatureLock featureName="Applications Management" setActiveTab={setActiveTab} />;
      return <RecruiterApplicationsPage setActiveTab={setActiveTab} />;
    }
    if (activeTab === 'candidates') {
      if (isRecruiterPending) return <RecruiterFeatureLock featureName="Candidate Talent Directory" setActiveTab={setActiveTab} />;
      return <RecruiterCandidatesPage setActiveTab={setActiveTab} />;
    }
    if (activeTab === 'users') {
      if (role === 'admin') return <UserDirectory />;
      if (isRecruiterPending) return <RecruiterFeatureLock featureName="Candidate Search" setActiveTab={setActiveTab} />;
      return <RecruiterCandidatesPage setActiveTab={setActiveTab} />;
    }
    if (activeTab === 'companies') {
      return role === 'admin' ? <AdminCompaniesPage /> : <RecruiterCompanyProfilePage />;
    }
    if (activeTab === 'verification') {
      return role === 'admin' ? <AdminVerificationPage /> : null;
    }
    if (activeTab === 'saved') {
      return <SavedJobsPage setActiveTab={setActiveTab} />;
    }
    if (activeTab === 'profile') {
      return role === 'candidate' ? <CandidateProfilePage /> : (role === 'recruiter' ? <RecruiterCompanyProfilePage /> : <ProfilePage />);
    }
    if (activeTab === 'analytics') {
      if (role === 'admin') return <AdminAnalyticsPage />;
      if (isRecruiterPending) return <RecruiterFeatureLock featureName="Recruiter Analytics" setActiveTab={setActiveTab} />;
      return <RecruiterReportsPage />;
    }
    if (activeTab === 'analytics_reports') {
      if (role === 'admin') return <AdminAnalyticsReportsPage />;
      if (isRecruiterPending) return <RecruiterFeatureLock featureName="Recruiter Reports" setActiveTab={setActiveTab} />;
      return <RecruiterReportsPage />;
    }
    if (activeTab === 'reports') {
      if (role === 'admin') return <AdminReportsPage />;
      if (isRecruiterPending) return <RecruiterFeatureLock featureName="Reports & Analytics" setActiveTab={setActiveTab} />;
      return <RecruiterReportsPage />;
    }
    if (activeTab === 'messages') {
      if (role === 'admin') return <AdminMessagesPage setActiveTab={setActiveTab} />;
      if (role === 'candidate') return <CandidateMessagesPage setActiveTab={setActiveTab} />;
      if (isRecruiterPending) return <RecruiterFeatureLock featureName="Candidate Messaging" setActiveTab={setActiveTab} />;
      return <RecruiterMessagesPage setActiveTab={setActiveTab} />;
    }
    if (activeTab === 'notifications') {
      return role === 'admin' ? <AdminNotificationsPage setActiveTab={setActiveTab} /> : <NotificationsPage role={role} setActiveTab={setActiveTab} />;
    }
    if (activeTab === 'settings') {
      return role === 'admin' ? <AdminSettingsPage /> : <RecruiterSettingsPage />;
    }
    if (activeTab === 'audit_logs') {
      return role === 'admin' ? <AdminAuditLogsPage /> : null;
    }
    if (activeTab === 'system_health') {
      return role === 'admin' ? <AdminSystemHealthPage /> : null;
    }
    if (activeTab === 'help') {
      return <HelpSupportPage />;
    }

    return role === 'admin' ? (
      <AdminDashboard setActiveTab={setActiveTab} />
    ) : (
      role === 'recruiter' ? <RecruiterDashboard setActiveTab={setActiveTab} /> : <ClientDashboard setActiveTab={setActiveTab} />
    );
  };

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="app-container">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />
      <div className="main-content">
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(prev => !prev)}
        />
        <main className="page-content">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

function AppContent() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const accountTypeClean = (user?.accountType || '').toLowerCase();
  const userRoleClean = (user?.role || '').toLowerCase();
  const viewOverride = sessionStorage.getItem('careonix_view_override');

  useEffect(() => {
    // Apply persistent styling, favicon, font, and custom CSS on startup
    applySettingsToDOM();
    const handleSettingsUpdate = () => applySettingsToDOM();
    window.addEventListener('careonix_settings_updated', handleSettingsUpdate);
    return () => window.removeEventListener('careonix_settings_updated', handleSettingsUpdate);
  }, []);

  let defaultDashboard = '/candidate/dashboard';
  if (viewOverride === 'admin' || userRoleClean === 'admin' || accountTypeClean === 'admin') {
    defaultDashboard = '/admin/dashboard';
  } else if (
    viewOverride === 'recruiter' ||
    accountTypeClean === 'recruiter' ||
    userRoleClean === 'recruiter' ||
    Boolean(user?.company) ||
    Boolean(user?.companyName)
  ) {
    defaultDashboard = '/recruiter/dashboard';
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Navigate to={defaultDashboard} replace />
          ) : (
            <LandingPage
              onLogin={() => navigate('/login')}
              onSignup={() => navigate('/signup')}
            />
          )
        }
      />
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to={defaultDashboard} replace />
          ) : (
            <LoginPage
              onBack={() => navigate('/')}
              defaultIsRegister={false}
            />
          )
        }
      />
      <Route
        path="/signup"
        element={
          isAuthenticated ? (
            <Navigate to={defaultDashboard} replace />
          ) : (
            <LoginPage
              onBack={() => navigate('/')}
              defaultIsRegister={true}
            />
          )
        }
      />
      <Route
        path="/register"
        element={<Navigate to="/signup" replace />}
      />

      {/* ── REAL OAUTH SSO CALLBACK ROUTES ── */}
      <Route path="/auth/callback/:provider" element={<OAuthCallbackPage />} />
      <Route path="/auth/callback" element={<OAuthCallbackPage />} />

      {/* ── RECRUITER DEDICATED ROUTES ── */}
      <Route path="/recruiter" element={isAuthenticated ? <AuthenticatedApp tab="dashboard" /> : <Navigate to="/login" replace />} />
      <Route path="/recruiter/dashboard" element={isAuthenticated ? <AuthenticatedApp tab="dashboard" /> : <Navigate to="/login" replace />} />
      <Route path="/recruiter/jobs" element={isAuthenticated ? <AuthenticatedApp tab="jobs" /> : <Navigate to="/login" replace />} />
      <Route path="/recruiter/my-jobs" element={isAuthenticated ? <AuthenticatedApp tab="jobs" /> : <Navigate to="/login" replace />} />
      <Route path="/recruiter/post-job" element={isAuthenticated ? <AuthenticatedApp tab="post-job" /> : <Navigate to="/login" replace />} />
      <Route path="/recruiter/applications" element={isAuthenticated ? <AuthenticatedApp tab="applications" /> : <Navigate to="/login" replace />} />
      <Route path="/recruiter/candidates" element={isAuthenticated ? <AuthenticatedApp tab="candidates" /> : <Navigate to="/login" replace />} />
      <Route path="/recruiter/company" element={isAuthenticated ? <AuthenticatedApp tab="profile" /> : <Navigate to="/login" replace />} />
      <Route path="/recruiter/profile" element={isAuthenticated ? <AuthenticatedApp tab="profile" /> : <Navigate to="/login" replace />} />
      <Route path="/recruiter/messages" element={isAuthenticated ? <AuthenticatedApp tab="messages" /> : <Navigate to="/login" replace />} />
      <Route path="/recruiter/subscriptions" element={isAuthenticated ? <AuthenticatedApp tab="subscriptions" /> : <Navigate to="/login" replace />} />
      <Route path="/recruiter/reports" element={isAuthenticated ? <AuthenticatedApp tab="reports" /> : <Navigate to="/login" replace />} />
      <Route path="/recruiter/analytics" element={isAuthenticated ? <AuthenticatedApp tab="analytics" /> : <Navigate to="/login" replace />} />
      <Route path="/recruiter/notifications" element={isAuthenticated ? <AuthenticatedApp tab="notifications" /> : <Navigate to="/login" replace />} />
      <Route path="/recruiter/settings" element={isAuthenticated ? <AuthenticatedApp tab="settings" /> : <Navigate to="/login" replace />} />
      <Route path="/recruiter/settings/:subTab" element={isAuthenticated ? <AuthenticatedApp tab="settings" /> : <Navigate to="/login" replace />} />

      {/* ── CANDIDATE DEDICATED ROUTES ── */}
      <Route path="/candidate" element={isAuthenticated ? <AuthenticatedApp tab="dashboard" /> : <Navigate to="/login" replace />} />
      <Route path="/candidate/dashboard" element={isAuthenticated ? <AuthenticatedApp tab="dashboard" /> : <Navigate to="/login" replace />} />
      <Route path="/candidate/jobs" element={isAuthenticated ? <AuthenticatedApp tab="jobs" /> : <Navigate to="/login" replace />} />

      {/* ── Apply Routes: both External & Internal (Careonix) applications ── */}
      {/* External:  /candidate/jobs/:jobId/apply?type=external  → opens company site + confirm modal */}
      {/* Internal:  /candidate/jobs/:jobId/apply?type=careonix  → opens Careonix apply form modal  */}
      <Route path="/candidate/jobs/:jobId/apply" element={isAuthenticated ? <AuthenticatedApp tab="jobs" /> : <Navigate to="/login" replace />} />

      <Route path="/candidate/applications" element={isAuthenticated ? <AuthenticatedApp tab="applications" /> : <Navigate to="/login" replace />} />
      <Route path="/candidate/saved" element={isAuthenticated ? <AuthenticatedApp tab="saved" /> : <Navigate to="/login" replace />} />
      <Route path="/candidate/profile" element={isAuthenticated ? <AuthenticatedApp tab="profile" /> : <Navigate to="/login" replace />} />
      <Route path="/candidate/profile/:subTab" element={isAuthenticated ? <AuthenticatedApp tab="profile" /> : <Navigate to="/login" replace />} />
      <Route path="/candidate/messages" element={isAuthenticated ? <AuthenticatedApp tab="messages" /> : <Navigate to="/login" replace />} />
      <Route path="/candidate/notifications" element={isAuthenticated ? <AuthenticatedApp tab="notifications" /> : <Navigate to="/login" replace />} />
      <Route path="/candidate/help" element={isAuthenticated ? <AuthenticatedApp tab="help" /> : <Navigate to="/login" replace />} />

      {/* ── ADMIN DEDICATED ROUTES ── */}
      <Route path="/admin" element={isAuthenticated ? <AuthenticatedApp tab="dashboard" /> : <Navigate to="/login" replace />} />
      <Route path="/admin/dashboard" element={isAuthenticated ? <AuthenticatedApp tab="dashboard" /> : <Navigate to="/login" replace />} />
      <Route path="/admin/users" element={isAuthenticated ? <AuthenticatedApp tab="users" /> : <Navigate to="/login" replace />} />
      <Route path="/admin/jobs" element={isAuthenticated ? <AuthenticatedApp tab="jobs" /> : <Navigate to="/login" replace />} />
      <Route path="/admin/companies" element={isAuthenticated ? <AuthenticatedApp tab="companies" /> : <Navigate to="/login" replace />} />
      <Route path="/admin/applications" element={isAuthenticated ? <AuthenticatedApp tab="applications" /> : <Navigate to="/login" replace />} />
      <Route path="/admin/subscriptions" element={isAuthenticated ? <AuthenticatedApp tab="subscriptions" /> : <Navigate to="/login" replace />} />
      <Route path="/admin/verification" element={isAuthenticated ? <AuthenticatedApp tab="verification" /> : <Navigate to="/login" replace />} />
      <Route path="/admin/analytics" element={isAuthenticated ? <AuthenticatedApp tab="analytics" /> : <Navigate to="/login" replace />} />
      <Route path="/admin/analytics-reports" element={isAuthenticated ? <AuthenticatedApp tab="analytics_reports" /> : <Navigate to="/login" replace />} />
      <Route path="/admin/reports" element={isAuthenticated ? <AuthenticatedApp tab="reports" /> : <Navigate to="/login" replace />} />
      <Route path="/admin/messages" element={isAuthenticated ? <AuthenticatedApp tab="messages" /> : <Navigate to="/login" replace />} />
      <Route path="/admin/notifications" element={isAuthenticated ? <AuthenticatedApp tab="notifications" /> : <Navigate to="/login" replace />} />
      <Route path="/admin/audit-logs" element={isAuthenticated ? <AuthenticatedApp tab="audit_logs" /> : <Navigate to="/login" replace />} />
      <Route path="/admin/system-health" element={isAuthenticated ? <AuthenticatedApp tab="system_health" /> : <Navigate to="/login" replace />} />
      <Route path="/admin/settings" element={isAuthenticated ? <AuthenticatedApp tab="settings" /> : <Navigate to="/login" replace />} />
      <Route path="/admin/settings/:subTab" element={isAuthenticated ? <AuthenticatedApp tab="settings" /> : <Navigate to="/login" replace />} />

      {/* ── GLOBAL SHORTCUT / ROOT ALIAS ROUTES — redirect to role-based paths ── */}
      <Route path="/dashboard" element={isAuthenticated ? <Navigate to={defaultDashboard} replace /> : <Navigate to="/login" replace />} />
      <Route path="/jobs" element={isAuthenticated ? <Navigate to={`${defaultDashboard.replace('/dashboard', '')}/jobs`} replace /> : <Navigate to="/login" replace />} />
      <Route path="/post-job" element={isAuthenticated ? <Navigate to={`${defaultDashboard.replace('/dashboard', '')}/post-job`} replace /> : <Navigate to="/login" replace />} />
      <Route path="/subscriptions" element={isAuthenticated ? <Navigate to={`${defaultDashboard.replace('/dashboard', '')}/subscriptions`} replace /> : <Navigate to="/login" replace />} />
      <Route path="/applications" element={isAuthenticated ? <Navigate to={`${defaultDashboard.replace('/dashboard', '')}/applications`} replace /> : <Navigate to="/login" replace />} />
      <Route path="/candidates" element={isAuthenticated ? <Navigate to="/recruiter/candidates" replace /> : <Navigate to="/login" replace />} />
      <Route path="/users" element={isAuthenticated ? <Navigate to="/admin/users" replace /> : <Navigate to="/login" replace />} />
      <Route path="/companies" element={isAuthenticated ? <Navigate to="/admin/companies" replace /> : <Navigate to="/login" replace />} />
      <Route path="/verification" element={isAuthenticated ? <Navigate to="/admin/verification" replace /> : <Navigate to="/login" replace />} />
      <Route path="/saved" element={isAuthenticated ? <Navigate to="/candidate/saved" replace /> : <Navigate to="/login" replace />} />
      <Route path="/profile" element={isAuthenticated ? <Navigate to={`${defaultDashboard.replace('/dashboard', '')}/profile`} replace /> : <Navigate to="/login" replace />} />
      <Route path="/analytics" element={isAuthenticated ? <Navigate to={`${defaultDashboard.replace('/dashboard', '')}/analytics`} replace /> : <Navigate to="/login" replace />} />
      <Route path="/analytics-reports" element={isAuthenticated ? <Navigate to="/admin/analytics-reports" replace /> : <Navigate to="/login" replace />} />
      <Route path="/reports" element={isAuthenticated ? <Navigate to={`${defaultDashboard.replace('/dashboard', '')}/reports`} replace /> : <Navigate to="/login" replace />} />
      <Route path="/messages" element={isAuthenticated ? <Navigate to={`${defaultDashboard.replace('/dashboard', '')}/messages`} replace /> : <Navigate to="/login" replace />} />
      <Route path="/notifications" element={isAuthenticated ? <Navigate to={`${defaultDashboard.replace('/dashboard', '')}/notifications`} replace /> : <Navigate to="/login" replace />} />
      <Route path="/settings" element={isAuthenticated ? <Navigate to={`${defaultDashboard.replace('/dashboard', '')}/settings`} replace /> : <Navigate to="/login" replace />} />
      <Route path="/audit-logs" element={isAuthenticated ? <Navigate to="/admin/audit-logs" replace /> : <Navigate to="/login" replace />} />
      <Route path="/system-health" element={isAuthenticated ? <Navigate to="/admin/system-health" replace /> : <Navigate to="/login" replace />} />
      <Route path="/help" element={isAuthenticated ? <Navigate to="/candidate/help" replace /> : <Navigate to="/login" replace />} />

      {/* Fallback Route */}
      <Route
        path="*"
        element={<Navigate to={isAuthenticated ? defaultDashboard : "/"} replace />}
      />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <JobProvider>
        <NotificationProvider>
          <ChatProvider>
            <AppContent />
          </ChatProvider>
        </NotificationProvider>
      </JobProvider>
    </AuthProvider>
  );
}
