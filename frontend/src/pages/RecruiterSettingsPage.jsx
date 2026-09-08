import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Settings,
  Bell,
  Shield,
  Lock,
  Mail,
  User,
  Phone,
  CheckCircle2,
  Save,
  Globe,
  Upload,
  Eye,
  EyeOff,
  Laptop,
  AlertTriangle,
  X,
  Edit3,
  Calendar,
  MessageSquare,
  Star,
  Clock,
  Rocket,
  ShieldAlert,
  HelpCircle,
  Building,
  Sliders,
  Camera,
  Check,
  Download,
  Key,
  Smartphone,
  MapPin,
  Briefcase,
  Trash2,
  ExternalLink,
  Crown,
  FileText,
  Share2,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useJobs } from '../context/JobContext';
import {
  detectClientDeviceInfo,
  getLoginHistory,
  clearOtherSessions,
  exportLoginHistoryCSV,
  isTwoFactorEnabled,
  setTwoFactorEnabledState
} from '../utils/loginActivityUtils';

export default function RecruiterSettingsPage() {
  const { user, logout, updateUserProfileName, updateUserAvatar } = useAuth();
  const { jobs, applications } = useJobs();
  const { subTab } = useParams();
  const navigate = useNavigate();

  const avatarInputRef = useRef(null);
  const companyLogoInputRef = useRef(null);

  const userEmail = (user?.email || '').toLowerCase().trim();
  const userKey = userEmail || 'guest';

  // ── Tab Definition & Normalization ──
  const TABS = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy-security', label: 'Privacy & Security', icon: Shield },
    { id: 'job-preferences', label: 'Job Preferences', icon: Sliders },
    { id: 'company-settings', label: 'Company Settings', icon: Building },
    { id: 'account-management', label: 'Account Management', icon: ShieldAlert }
  ];

  const normalizeTabId = (raw) => {
    if (!raw) return 'account';
    const r = raw.toLowerCase().trim();
    if (r === 'account' || r === 'profile') return 'account';
    if (r === 'notifications' || r === 'notif') return 'notifications';
    if (r === 'privacy-security' || r === 'privacy' || r === 'security') return 'privacy-security';
    if (r === 'job-preferences' || r === 'preferences' || r === 'jobs') return 'job-preferences';
    if (r === 'company-settings' || r === 'company') return 'company-settings';
    if (r === 'account-management' || r === 'management' || r === 'danger') return 'account-management';
    return 'account';
  };

  const activeTab = normalizeTabId(subTab);

  const handleTabClick = (tabId) => {
    navigate(`/recruiter/settings/${tabId}`);
  };

  // ── Feedback Toast / Error States ──
  const [toastMsg, setToastMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  const triggerError = (msg) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(''), 4000);
  };

  // ── Helper Storage Getters ──
  const getStorageJson = (key, fallback) => {
    try {
      const v = localStorage.getItem(`careonix_recruiter_${userKey}_${key}`);
      return v ? JSON.parse(v) : fallback;
    } catch (e) {
      return fallback;
    }
  };

  const setStorageJson = (key, val) => {
    try {
      localStorage.setItem(`careonix_recruiter_${userKey}_${key}`, JSON.stringify(val));
    } catch (e) {}
  };

  // ── TAB 1: Account Information State ──
  const [fullName, setFullName] = useState(user?.name || 'Recruiter Partner');
  const [workEmail] = useState(user?.email || 'recruiter@careonix.com');
  const [phone, setPhone] = useState(user?.phone || '+91 98765 43210');
  const [designation, setDesignation] = useState(() => getStorageJson('designation', 'Senior Talent Acquisition Lead'));
  const [department, setDepartment] = useState(() => getStorageJson('department', 'Human Resources & Engineering Hiring'));
  const [bio, setBio] = useState(() => getStorageJson('bio', 'Empowering high-growth tech teams by connecting world-class engineers, product minds, and leaders.'));
  const [timezone, setTimezone] = useState(() => getStorageJson('timezone', 'Asia/Kolkata (IST +5:30)'));
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar || user?.photoUrl || null);

  // Password Update State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // ── TAB 2: Notifications Preferences State ──
  const [notifMatrix, setNotifMatrix] = useState(() => getStorageJson('notifMatrix', {
    newApplication: { email: true, inApp: true },
    directMessage: { email: true, inApp: true },
    applicationStatusChange: { email: true, inApp: true },
    interviewConfirmed: { email: true, inApp: true },
    interviewReminder: { email: true, inApp: true },
    jobExpiringSoon: { email: true, inApp: true },
    jobPublished: { email: false, inApp: true },
    weeklyDigest: { email: true, inApp: false }
  }));
  const [emailFrequency, setEmailFrequency] = useState(() => getStorageJson('emailFreq', 'Instant'));
  const [soundAlerts, setSoundAlerts] = useState(() => getStorageJson('soundAlerts', true));
  const [marketingTips, setMarketingTips] = useState(() => getStorageJson('marketingTips', false));

  // ── TAB 3: Privacy & Security State ──
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(() => isTwoFactorEnabled(userEmail));
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [twoFactorModalError, setTwoFactorModalError] = useState('');
  const [sessionTimeout, setSessionTimeout] = useState(() => getStorageJson('sessionTimeout', '30 Minutes'));
  const [showActiveSessionsModal, setShowActiveSessionsModal] = useState(false);
  const [showLoginActivityModal, setShowLoginActivityModal] = useState(false);
  const [loginLogs, setLoginLogs] = useState(() => getLoginHistory(userEmail));
  const [currentDeviceInfo] = useState(() => detectClientDeviceInfo());

  // ── TAB 4: Job Preferences State ──
  const [jobPrefs, setJobPrefs] = useState(() => getStorageJson('jobPrefs', {
    defaultType: 'Full-time',
    defaultWorkMode: 'Hybrid',
    defaultLocation: 'Bangalore, Karnataka',
    defaultMethod: 'careonix',
    defaultAtsUrl: 'https://careers.company.com/apply/',
    defaultCurrency: 'INR (₹)',
    defaultSalary: '12,00,000 - 18,00,000',
    defaultExperience: '2-4 Yrs',
    defaultDeadlineDays: '30',
    autoRequireResume: true,
    autoRequirePhone: true,
    autoWelcomeMessage: true,
    filterUnmatchedSkills: false
  }));

  // ── TAB 5: Company Settings State ──
  const [companyForm, setCompanyForm] = useState(() => {
    try {
      const saved = localStorage.getItem(`careonix_comp_profile_${userKey}`);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      legalName: user?.company || 'Careonix Partner Solutions Pvt Ltd',
      brandName: user?.company || 'Careonix Partner',
      industry: 'Information Technology & Software Services',
      companySize: '51-200',
      yearFounded: '2019',
      headquarters: 'Bangalore, Karnataka, India',
      website: 'https://careonix.com',
      careersUrl: 'https://careonix.com/careers',
      tagline: 'Empowering Next-Generation Digital Products and Teams',
      description: 'We are a fast-growing technology engineering firm delivering state-of-the-art enterprise platforms across cloud, AI, and distributed systems.',
      logoUrl: null,
      linkedin: 'https://linkedin.com/company/careonix',
      twitter: 'https://x.com/careonix',
      glassdoor: 'https://glassdoor.com/Reviews/careonix',
      github: 'https://github.com/careonix',
      pocName: user?.name || 'Recruiter Lead',
      pocPhone: user?.phone || '+91 98765 43210'
    };
  });

  // ── TAB 6: Account Management (Modals) ──
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');

  // ──────────────────────────────────────────────────────────────────────────
  // HANDLERS
  // ──────────────────────────────────────────────────────────────────────────

  // Avatar Upload
  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      triggerError('⚠️ Image file size must be less than 3MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target.result;
      setAvatarUrl(base64);
      if (updateUserAvatar) updateUserAvatar(base64);
      if (user) {
        user.avatar = base64;
        try {
          sessionStorage.setItem('careonix_user', JSON.stringify(user));
          localStorage.setItem('careonix_user', JSON.stringify(user));
        } catch (err) {}
      }
      triggerToast('🎉 Profile photo updated successfully!');
    };
    reader.readAsDataURL(file);
  };

  // Save Account Profile
  const handleSaveAccount = (e) => {
    e.preventDefault();
    if (!fullName.trim()) {
      triggerError('⚠️ Full Name cannot be empty.');
      return;
    }

    if (updateUserProfileName) updateUserProfileName(fullName);
    if (user) {
      user.name = fullName;
      user.phone = phone;
      try {
        sessionStorage.setItem('careonix_user', JSON.stringify(user));
        localStorage.setItem('careonix_user', JSON.stringify(user));
      } catch (err) {}
    }

    setStorageJson('designation', designation);
    setStorageJson('department', department);
    setStorageJson('bio', bio);
    setStorageJson('timezone', timezone);

    triggerToast('✅ Account details updated & saved successfully!');
  };

  // Update Password
  const handleUpdatePassword = (e) => {
    e.preventDefault();
    if (!currentPassword) {
      triggerError('⚠️ Please enter your current password.');
      return;
    }
    const actualPass = user?.password;
    if (actualPass && currentPassword !== actualPass) {
      triggerError('❌ Current password entered does not match account records.');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      triggerError('⚠️ New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      triggerError('❌ New Password and Confirm Password do not match.');
      return;
    }

    if (user) user.password = newPassword;
    try {
      sessionStorage.setItem('careonix_user', JSON.stringify(user));
      localStorage.setItem('careonix_user', JSON.stringify(user));
    } catch (err) {}

    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    triggerToast('🔒 Password changed successfully!');
  };

  // Save Notifications
  const handleSaveNotifications = (e) => {
    e.preventDefault();
    setStorageJson('notifMatrix', notifMatrix);
    setStorageJson('emailFreq', emailFrequency);
    setStorageJson('soundAlerts', soundAlerts);
    setStorageJson('marketingTips', marketingTips);
    triggerToast('✅ Notification preferences saved successfully!');
  };

  const toggleNotifMatrix = (key, channel) => {
    setNotifMatrix(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [channel]: !prev[key][channel]
      }
    }));
  };

  // Save Privacy & Security
  const handleSaveSecurity = (e) => {
    e.preventDefault();
    setStorageJson('sessionTimeout', sessionTimeout);
    triggerToast('🛡️ Security & session preferences saved successfully!');
  };

  // Save Job Preferences
  const handleSaveJobPrefs = (e) => {
    e.preventDefault();
    setStorageJson('jobPrefs', jobPrefs);
    triggerToast('📋 Job posting preferences & automation rules saved!');
  };

  // Company Logo Upload
  const handleCompanyLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      triggerError('⚠️ Logo file size must be less than 3MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target.result;
      setCompanyForm(prev => ({ ...prev, logoUrl: base64 }));
      triggerToast('🏢 Company logo uploaded!');
    };
    reader.readAsDataURL(file);
  };

  // Save Company Settings
  const handleSaveCompany = (e) => {
    e.preventDefault();
    try {
      localStorage.setItem(`careonix_comp_profile_${userKey}`, JSON.stringify(companyForm));
    } catch (e) {}

    if (user && companyForm.brandName) {
      user.company = companyForm.brandName;
      user.companyName = companyForm.legalName;
      try {
        sessionStorage.setItem('careonix_user', JSON.stringify(user));
        localStorage.setItem('careonix_user', JSON.stringify(user));
      } catch (err) {}
    }

    triggerToast('🏢 Company settings & employer brand profile saved!');
  };

  // Export Applicants CSV
  const handleExportApplicantsCSV = () => {
    const recruiterJobs = (jobs || []).filter(j =>
      (j.postedBy || '').toLowerCase() === userEmail ||
      (user?.company && j.company === user.company)
    );
    const recruiterApps = (applications || []).filter(a =>
      recruiterJobs.some(rj => String(rj.id) === String(a.jobId) || rj.title?.toLowerCase() === a.jobTitle?.toLowerCase())
    );

    if (recruiterApps.length === 0) {
      triggerToast('ℹ️ No candidate applications to export yet.');
      return;
    }

    const headers = ['Application ID', 'Candidate Name', 'Candidate Email', 'Candidate Phone', 'Job Title', 'Company', 'Applied Date', 'Status'];
    const rows = recruiterApps.map(a => [
      a.id,
      `"${(a.candidateName || a.name || 'Candidate').replace(/"/g, '""')}"`,
      `"${(a.candidateEmail || a.email || '').replace(/"/g, '""')}"`,
      `"${(a.candidatePhone || a.phone || 'N/A').replace(/"/g, '""')}"`,
      `"${(a.jobTitle || '').replace(/"/g, '""')}"`,
      `"${(a.company || '').replace(/"/g, '""')}"`,
      `"${(a.appliedDate || a.appliedDateTime || 'Recently').replace(/"/g, '""')}"`,
      `"${(a.status || 'APPLIED').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `careonix_applicants_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    triggerToast('📥 Candidate applications CSV downloaded successfully!');
  };

  // Export Posted Jobs CSV
  const handleExportJobsCSV = () => {
    const recruiterJobs = (jobs || []).filter(j =>
      (j.postedBy || '').toLowerCase() === userEmail ||
      (user?.company && j.company === user.company)
    );

    if (recruiterJobs.length === 0) {
      triggerToast('ℹ️ No posted jobs to export yet.');
      return;
    }

    const headers = ['Job ID', 'Title', 'Company', 'Location', 'Job Type', 'Experience', 'Salary', 'Deadline', 'Status', 'Applications Count'];
    const rows = recruiterJobs.map(j => [
      j.id,
      `"${(j.title || '').replace(/"/g, '""')}"`,
      `"${(j.company || '').replace(/"/g, '""')}"`,
      `"${(j.location || '').replace(/"/g, '""')}"`,
      `"${(j.type || 'Full-time').replace(/"/g, '""')}"`,
      `"${(j.experience || '').replace(/"/g, '""')}"`,
      `"${(j.salary || '').replace(/"/g, '""')}"`,
      `"${(j.lastDateToApply || '').replace(/"/g, '""')}"`,
      `"${(j.status || 'ACTIVE').replace(/"/g, '""')}"`,
      j.applications || 0
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `careonix_recruiter_jobs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    triggerToast('📥 Recruiter jobs directory CSV downloaded successfully!');
  };

  // Common Card Style
  const cardStyle = {
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '20px',
    padding: '1.75rem',
    boxShadow: '0 1px 6px rgba(15,23,42,0.02)',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem'
  };

  const labelStyle = {
    fontSize: '0.78rem',
    fontWeight: '700',
    color: '#0f172a',
    display: 'block',
    marginBottom: '5px'
  };

  const inputStyle = {
    width: '100%',
    padding: '0.65rem 0.85rem',
    borderRadius: '10px',
    border: '1px solid #cbd5e1',
    fontSize: '0.88rem',
    fontFamily: 'Inter, sans-serif',
    background: '#ffffff',
    color: '#0f172a',
    outline: 'none',
    transition: 'border-color 0.15s ease'
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', background: '#f8fafc', minHeight: '92vh', fontFamily: 'Inter, sans-serif', paddingBottom: '3rem' }}>
      
      {/* Toast Notification */}
      {toastMsg && (
        <div style={{
          position: 'fixed', top: '24px', right: '24px', background: '#10b981', color: '#ffffff',
          padding: '0.9rem 1.4rem', borderRadius: '14px', boxShadow: '0 10px 25px rgba(16,185,129,0.3)',
          display: 'flex', alignItems: 'center', gap: '0.6rem', zIndex: 500, fontWeight: '700', fontSize: '0.9rem'
        }}>
          <CheckCircle2 size={20} />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Error Alert */}
      {errorMsg && (
        <div style={{
          position: 'fixed', top: '24px', right: '24px', background: '#ef4444', color: '#ffffff',
          padding: '0.9rem 1.4rem', borderRadius: '14px', boxShadow: '0 10px 25px rgba(239,68,68,0.3)',
          display: 'flex', alignItems: 'center', gap: '0.6rem', zIndex: 500, fontWeight: '700', fontSize: '0.9rem'
        }}>
          <AlertTriangle size={20} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Page Header */}
      <div>
        <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '600', marginBottom: '4px' }}>
          Recruiter Portal &gt; Settings &gt; {TABS.find(t => t.id === activeTab)?.label}
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
          Settings
        </h1>
        <p style={{ color: '#64748b', marginTop: '4px', fontSize: '0.9rem' }}>
          Manage your recruiter profile, notifications, security, hiring automation and employer brand.
        </p>
      </div>

      {/* ── 6 TOP SUB-NAVIGATION TABS BAR (Synced With URL) ──────────────────── */}
      <div style={{
        display: 'flex',
        gap: '1.25rem',
        borderBottom: '1px solid #e2e8f0',
        paddingBottom: '0.1rem',
        overflowX: 'auto',
        whiteSpace: 'nowrap',
        scrollbarWidth: 'none'
      }}>
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              style={{
                background: 'none',
                border: 'none',
                padding: '0.75rem 0.25rem',
                color: isActive ? '#6366f1' : '#64748b',
                fontWeight: isActive ? '800' : '600',
                fontSize: '0.92rem',
                cursor: 'pointer',
                borderBottom: isActive ? '2.5px solid #6366f1' : '2.5px solid transparent',
                transition: 'all 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <Icon size={16} color={isActive ? '#6366f1' : '#64748b'} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* 1. TAB: ACCOUNT                                                        */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'account' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'flex-start' }}>
          
          {/* Card 1: Account Information */}
          <form onSubmit={handleSaveAccount} style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Account Information</h3>
                <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '3px', margin: 0 }}>Update your recruiter personal identity and job role details.</p>
              </div>
              <span style={{ background: '#f3e8ff', color: '#7c3aed', padding: '3px 9px', borderRadius: '8px', fontSize: '0.74rem', fontWeight: '800' }}>
                Recruiter Profile
              </span>
            </div>

            {/* Avatar & Photo Picker */}
            <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', padding: '0.75rem', background: '#f8fafc', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
              <div style={{ position: 'relative', flexShrink: 0 }}>
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={fullName}
                    style={{ width: '68px', height: '68px', borderRadius: '16px', objectFit: 'cover', border: '2px solid #6366f1' }}
                  />
                ) : (
                  <div style={{ width: '68px', height: '68px', borderRadius: '16px', background: 'linear-gradient(135deg, #6366f1, #4f46e5)', color: '#ffffff', fontWeight: '800', fontSize: '1.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {(fullName || 'R').charAt(0).toUpperCase()}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  style={{
                    position: 'absolute', bottom: '-6px', right: '-6px',
                    width: '26px', height: '26px', borderRadius: '50%',
                    background: '#ffffff', border: '1.5px solid #cbd5e1',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                  }}
                  title="Upload profile picture"
                >
                  <Camera size={13} color="#475569" />
                </button>
                <input ref={avatarInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
              </div>

              <div>
                <strong style={{ fontSize: '0.88rem', color: '#0f172a', display: 'block' }}>Profile Picture</strong>
                <p style={{ fontSize: '0.76rem', color: '#64748b', margin: '2px 0 6px 0' }}>Upload JPG or PNG under 3MB to appear across candidate conversations.</p>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    style={{ padding: '3px 10px', borderRadius: '6px', background: '#eff6ff', border: '1px solid #bfdbfe', color: '#2563eb', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer' }}
                  >
                    Upload Photo
                  </button>
                  {avatarUrl && (
                    <button
                      type="button"
                      onClick={() => { setAvatarUrl(null); if (updateUserAvatar) updateUserAvatar(null); triggerToast('Profile photo removed.'); }}
                      style={{ padding: '3px 10px', borderRadius: '6px', background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer' }}
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Full Name & Work Email */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Full Name *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  style={inputStyle}
                  placeholder="e.g. Rahul Sharma"
                />
              </div>
              <div>
                <label style={labelStyle}>Work Email (Verified)</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    readOnly
                    value={workEmail}
                    style={{ ...inputStyle, background: '#f8fafc', color: '#64748b', cursor: 'not-allowed', paddingRight: '2rem' }}
                  />
                  <CheckCircle2 size={16} color="#16a34a" style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>
            </div>

            {/* Phone & Designation */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Contact Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  style={inputStyle}
                  placeholder="+91 98765 43210"
                />
              </div>
              <div>
                <label style={labelStyle}>Designation / Role</label>
                <input
                  type="text"
                  value={designation}
                  onChange={e => setDesignation(e.target.value)}
                  style={inputStyle}
                  placeholder="e.g. Lead Talent Acquisition"
                />
              </div>
            </div>

            {/* Department & Timezone */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Department</label>
                <input
                  type="text"
                  value={department}
                  onChange={e => setDepartment(e.target.value)}
                  style={inputStyle}
                  placeholder="e.g. Human Resources"
                />
              </div>
              <div>
                <label style={labelStyle}>Time Zone</label>
                <select value={timezone} onChange={e => setTimezone(e.target.value)} style={inputStyle}>
                  <option value="Asia/Kolkata (IST +5:30)">Asia/Kolkata (IST +5:30)</option>
                  <option value="America/New_York (EST -5:00)">America/New_York (EST -5:00)</option>
                  <option value="America/Los_Angeles (PST -8:00)">America/Los_Angeles (PST -8:00)</option>
                  <option value="Europe/London (GMT +0:00)">Europe/London (GMT +0:00)</option>
                  <option value="Europe/Berlin (CET +1:00)">Europe/Berlin (CET +1:00)</option>
                  <option value="Asia/Dubai (GST +4:00)">Asia/Dubai (GST +4:00)</option>
                  <option value="Asia/Singapore (SGT +8:00)">Asia/Singapore (SGT +8:00)</option>
                </select>
              </div>
            </div>

            {/* Bio */}
            <div>
              <label style={labelStyle}>Recruiter Bio / Introduction</label>
              <textarea
                rows={3}
                value={bio}
                onChange={e => setBio(e.target.value)}
                style={{ ...inputStyle, resize: 'vertical' }}
                placeholder="A brief introduction shown to prospective applicants..."
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button
                type="submit"
                style={{
                  background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                  color: '#ffffff', border: 'none', borderRadius: '12px',
                  padding: '0.7rem 1.6rem', fontWeight: '800', fontSize: '0.88rem',
                  display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(79,70,229,0.25)'
                }}
              >
                <Save size={16} /> Save Account Changes
              </button>
            </div>
          </form>

          {/* Card 2: Change Password & Credentials */}
          <form onSubmit={handleUpdatePassword} style={cardStyle}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Change Password</h3>
              <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '3px', margin: 0 }}>Ensure your recruiter account is secured with a strong password.</p>
            </div>

            {/* Current Password */}
            <div>
              <label style={labelStyle}>Current Password *</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showCurrentPass ? 'text' : 'password'}
                  required
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  style={{ ...inputStyle, paddingRight: '2.5rem' }}
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPass(!showCurrentPass)}
                  style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                >
                  {showCurrentPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label style={labelStyle}>New Password *</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showNewPass ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  style={{ ...inputStyle, paddingRight: '2.5rem' }}
                  placeholder="At least 6 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPass(!showNewPass)}
                  style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                >
                  {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label style={labelStyle}>Confirm New Password *</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirmPass ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  style={{ ...inputStyle, paddingRight: '2.5rem' }}
                  placeholder="Repeat new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPass(!showConfirmPass)}
                  style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                >
                  {showConfirmPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Password Safety Tips */}
            <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '12px', border: '1px solid #f1f5f9', fontSize: '0.78rem', color: '#64748b' }}>
              <strong style={{ color: '#0f172a', display: 'block', marginBottom: '4px' }}>Password Requirements:</strong>
              <ul style={{ margin: 0, paddingLeft: '1.2rem', lineHeight: 1.5 }}>
                <li>Minimum 6 characters in length</li>
                <li>Combination of uppercase letters, numbers or symbols</li>
                <li>Different from previously used passwords</li>
              </ul>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button
                type="submit"
                style={{
                  background: '#0f172a', color: '#ffffff', border: 'none',
                  borderRadius: '12px', padding: '0.7rem 1.6rem', fontWeight: '800',
                  fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
                  cursor: 'pointer'
                }}
              >
                <Lock size={16} /> Update Password
              </button>
            </div>
          </form>

        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* 2. TAB: NOTIFICATIONS                                                  */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'notifications' && (
        <form onSubmit={handleSaveNotifications} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Notification Channels & Alerts</h3>
                <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '3px', margin: 0 }}>Control which events notify you via email or the in-app notification bell.</p>
              </div>
              <span style={{ background: '#dcfce7', color: '#15803d', padding: '3px 9px', borderRadius: '8px', fontSize: '0.74rem', fontWeight: '800' }}>
                Real-Time Delivery
              </span>
            </div>

            {/* Matrix Table */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #f1f5f9', color: '#64748b', fontSize: '0.78rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '0.75rem 0', fontWeight: '800' }}>Event Trigger</th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: '800', textAlign: 'center', width: '120px' }}>Email</th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: '800', textAlign: 'center', width: '120px' }}>In-App Bell</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { key: 'newApplication', title: 'New Candidate Application', desc: 'When a candidate applies to one of your active job vacancies.' },
                    { key: 'directMessage', title: 'Candidate Direct Message', desc: 'When an applicant sends you a message in the chat thread.' },
                    { key: 'applicationStatusChange', title: 'Candidate Offer / Status Update', desc: 'When an applicant accepts, rejects, or confirms an offer update.' },
                    { key: 'interviewConfirmed', title: 'Interview Slot Confirmed', desc: 'When a candidate confirms a scheduled interview slot.' },
                    { key: 'interviewReminder', title: 'Upcoming Interview Reminders', desc: 'Reminders 24 hours and 1 hour before scheduled interviews.' },
                    { key: 'jobExpiringSoon', title: 'Application Deadline Expiring Soon', desc: 'Warning 3 days before a job post reaches its deadline date.' },
                    { key: 'jobPublished', title: 'Job Approved & Published', desc: 'Confirmation when your posted vacancy goes live on Careonix.' },
                    { key: 'weeklyDigest', title: 'Weekly Hiring Performance Summary', desc: 'Consolidated weekly analytics on candidate applicants and pipeline.' }
                  ].map(row => (
                    <tr key={row.key} style={{ borderBottom: '1px solid #f8fafc' }}>
                      <td style={{ padding: '0.85rem 0' }}>
                        <strong style={{ fontSize: '0.88rem', color: '#0f172a', display: 'block' }}>{row.title}</strong>
                        <span style={{ fontSize: '0.78rem', color: '#64748b' }}>{row.desc}</span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={Boolean(notifMatrix[row.key]?.email)}
                          onChange={() => toggleNotifMatrix(row.key, 'email')}
                          style={{ width: '18px', height: '18px', accentColor: '#6366f1', cursor: 'pointer' }}
                        />
                      </td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={Boolean(notifMatrix[row.key]?.inApp)}
                          onChange={() => toggleNotifMatrix(row.key, 'inApp')}
                          style={{ width: '18px', height: '18px', accentColor: '#6366f1', cursor: 'pointer' }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Delivery Frequency & Sound Alerts */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            
            <div style={cardStyle}>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Email Frequency</h3>
                <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px', margin: 0 }}>Choose how often emails are dispatched to your inbox.</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[
                  { id: 'Instant', label: 'Instant Delivery', desc: 'Receive emails immediately for each candidate interaction.' },
                  { id: 'Daily', label: 'Daily Consolidated Digest', desc: 'Receive one single summary email every morning at 9:00 AM.' },
                  { id: 'Weekly', label: 'Weekly Summary', desc: 'Receive a weekly roundup on Monday mornings.' }
                ].map(opt => (
                  <label key={opt.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.75rem', borderRadius: '12px', border: emailFrequency === opt.id ? '1.5px solid #6366f1' : '1px solid #e2e8f0', background: emailFrequency === opt.id ? '#f5f3ff' : '#ffffff', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="emailFreq"
                      checked={emailFrequency === opt.id}
                      onChange={() => setEmailFrequency(opt.id)}
                      style={{ accentColor: '#6366f1', marginTop: '3px' }}
                    />
                    <div>
                      <strong style={{ fontSize: '0.86rem', color: '#0f172a', display: 'block' }}>{opt.label}</strong>
                      <span style={{ fontSize: '0.76rem', color: '#64748b' }}>{opt.desc}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div style={cardStyle}>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Sound & System Preferences</h3>
                <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px', margin: 0 }}>Configure in-browser chime sound effects and newsletters.</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer' }}>
                  <div>
                    <strong style={{ fontSize: '0.86rem', color: '#0f172a', display: 'block' }}>Message Audio Chime</strong>
                    <span style={{ fontSize: '0.76rem', color: '#64748b' }}>Play a subtle sound when a candidate messages you.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={soundAlerts}
                    onChange={e => setSoundAlerts(e.target.checked)}
                    style={{ width: '18px', height: '18px', accentColor: '#6366f1', cursor: 'pointer' }}
                  />
                </label>

                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer' }}>
                  <div>
                    <strong style={{ fontSize: '0.86rem', color: '#0f172a', display: 'block' }}>Careonix Hiring Insights & Updates</strong>
                    <span style={{ fontSize: '0.76rem', color: '#64748b' }}>Product updates, recruiter benchmark tips, and newsletter.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={marketingTips}
                    onChange={e => setMarketingTips(e.target.checked)}
                    style={{ width: '18px', height: '18px', accentColor: '#6366f1', cursor: 'pointer' }}
                  />
                </label>
              </div>
            </div>

          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              style={{
                background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                color: '#ffffff', border: 'none', borderRadius: '12px',
                padding: '0.75rem 1.8rem', fontWeight: '800', fontSize: '0.9rem',
                display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(79,70,229,0.25)'
              }}
            >
              <Save size={16} /> Save Notification Preferences
            </button>
          </div>

        </form>
      )}

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* 3. TAB: PRIVACY & SECURITY                                             */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'privacy-security' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'flex-start' }}>
            
            {/* 2FA Card */}
            <div style={cardStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: twoFactorEnabled ? '#ecfdf5' : '#fef2f2', color: twoFactorEnabled ? '#059669' : '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Shield size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Two-Factor Authentication (2FA)</h3>
                  <span style={{ fontSize: '0.78rem', color: twoFactorEnabled ? '#059669' : '#dc2626', fontWeight: '700' }}>
                    {twoFactorEnabled ? '✓ Enabled & Protecting Your Account' : '⚠️ Currently Disabled'}
                  </span>
                </div>
              </div>

              <p style={{ fontSize: '0.84rem', color: '#64748b', lineHeight: 1.5, margin: 0 }}>
                Two-factor authentication adds an extra layer of security to your recruiter account by requiring a 6-digit verification code in addition to your password.
              </p>

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShow2FAModal(true)}
                  style={{
                    padding: '0.65rem 1.25rem', borderRadius: '10px',
                    background: twoFactorEnabled ? '#fef2f2' : '#6366f1',
                    border: twoFactorEnabled ? '1px solid #fecaca' : 'none',
                    color: twoFactorEnabled ? '#dc2626' : '#ffffff',
                    fontWeight: '800', fontSize: '0.84rem', cursor: 'pointer'
                  }}
                >
                  {twoFactorEnabled ? 'Disable 2FA Security' : 'Configure & Enable 2FA'}
                </button>
              </div>
            </div>

            {/* Session Timeout Card */}
            <form onSubmit={handleSaveSecurity} style={cardStyle}>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Session Timeout Policy</h3>
                <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '2px', margin: 0 }}>Automatically log out of the recruiter portal when idle.</p>
              </div>

              <div>
                <label style={labelStyle}>Auto-Logout Inactivity Duration</label>
                <select value={sessionTimeout} onChange={e => setSessionTimeout(e.target.value)} style={inputStyle}>
                  <option value="15 Minutes">15 Minutes</option>
                  <option value="30 Minutes">30 Minutes (Recommended)</option>
                  <option value="1 Hour">1 Hour</option>
                  <option value="4 Hours">4 Hours</option>
                  <option value="Never">Never (Keep session active)</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowActiveSessionsModal(true)}
                  style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#334155', padding: '0.55rem 1rem', borderRadius: '10px', fontSize: '0.82rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <Laptop size={15} /> View Active Sessions
                </button>

                <button
                  type="submit"
                  style={{ background: '#0f172a', color: '#ffffff', border: 'none', borderRadius: '10px', padding: '0.55rem 1.25rem', fontWeight: '800', fontSize: '0.82rem', cursor: 'pointer' }}
                >
                  Save Policy
                </button>
              </div>
            </form>

          </div>

          {/* Login Activity Audit Log */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Recent Recruiter Login Activity</h3>
                <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '2px', margin: 0 }}>Audited sign-in history across devices and IP addresses.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  exportLoginHistoryCSV(userEmail, loginLogs);
                  triggerToast('📥 Real Login audit log CSV exported successfully!');
                }}
                style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '5px 12px', fontSize: '0.78rem', fontWeight: '700', color: '#475569', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
              >
                <Download size={13} /> Export Log
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #f1f5f9', color: '#64748b', fontSize: '0.76rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '0.6rem 0', fontWeight: '800' }}>Device &amp; OS</th>
                    <th style={{ padding: '0.6rem 1rem', fontWeight: '800' }}>Browser</th>
                    <th style={{ padding: '0.6rem 1rem', fontWeight: '800' }}>IP Address</th>
                    <th style={{ padding: '0.6rem 1rem', fontWeight: '800' }}>Location</th>
                    <th style={{ padding: '0.6rem 1rem', fontWeight: '800' }}>Timestamp</th>
                    <th style={{ padding: '0.6rem 0', fontWeight: '800', textAlign: 'right' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loginLogs.map((log, i) => {
                    const isCurrent = log.status === 'Current Session';
                    const isMobile = (log.device || '').toLowerCase().includes('phone') || (log.device || '').toLowerCase().includes('android');
                    return (
                      <tr key={log.id || i} style={{ borderBottom: '1px solid #f8fafc', background: isCurrent ? '#f8fafc88' : 'transparent' }}>
                        <td style={{ padding: '0.75rem 0', fontWeight: '700', color: '#0f172a' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {isMobile ? <Smartphone size={15} color="#6366f1" /> : <Laptop size={15} color="#6366f1" />}
                            <span>{log.device}</span>
                          </div>
                        </td>
                        <td style={{ padding: '0.75rem 1rem', color: '#475569' }}>{log.browser}</td>
                        <td style={{ padding: '0.75rem 1rem', color: '#64748b', fontFamily: 'monospace' }}>{log.ip}</td>
                        <td style={{ padding: '0.75rem 1rem', color: '#475569' }}>{log.loc}</td>
                        <td style={{ padding: '0.75rem 1rem', color: '#64748b' }}>
                          {isCurrent ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#15803d', fontWeight: '700' }}>
                              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#22c55e', display: 'inline-block', boxShadow: '0 0 0 2px #bbf7d0' }} />
                              Active Now
                            </span>
                          ) : (
                            log.time || (log.timestamp ? new Date(log.timestamp).toLocaleDateString() : 'Recent')
                          )}
                        </td>
                        <td style={{ padding: '0.75rem 0', textAlign: 'right' }}>
                          <span style={{
                            background: isCurrent ? '#dcfce7' : '#f1f5f9',
                            color: isCurrent ? '#15803d' : '#475569',
                            border: `1px solid ${isCurrent ? '#bbf7d0' : '#cbd5e1'}`,
                            padding: '2px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: '800'
                          }}>
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* 4. TAB: JOB PREFERENCES                                                */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'job-preferences' && (
        <form onSubmit={handleSaveJobPrefs} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Default Job Posting Template</h3>
                <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '3px', margin: 0 }}>These attributes automatically pre-populate the "Post a Job" form to save you time.</p>
              </div>
              <span style={{ background: '#e0e7ff', color: '#4338ca', padding: '3px 9px', borderRadius: '8px', fontSize: '0.74rem', fontWeight: '800' }}>
                Quick Publish
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
              <div>
                <label style={labelStyle}>Default Job Type</label>
                <select value={jobPrefs.defaultType} onChange={e => setJobPrefs(p => ({ ...p, defaultType: e.target.value }))} style={inputStyle}>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                  <option value="Apprenticeship">Apprenticeship</option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>Default Work Mode</label>
                <select value={jobPrefs.defaultWorkMode} onChange={e => setJobPrefs(p => ({ ...p, defaultWorkMode: e.target.value }))} style={inputStyle}>
                  <option value="Hybrid">Hybrid</option>
                  <option value="Remote">Remote</option>
                  <option value="On-site">On-site</option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>Default Location</label>
                <input
                  type="text"
                  value={jobPrefs.defaultLocation}
                  onChange={e => setJobPrefs(p => ({ ...p, defaultLocation: e.target.value }))}
                  style={inputStyle}
                  placeholder="e.g. Bangalore, Karnataka"
                />
              </div>

              <div>
                <label style={labelStyle}>Application Method</label>
                <select value={jobPrefs.defaultMethod} onChange={e => setJobPrefs(p => ({ ...p, defaultMethod: e.target.value }))} style={inputStyle}>
                  <option value="careonix">🟣 CAREONIX Internal 1-Click Apply</option>
                  <option value="external">🌐 External Company Careers ATS</option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>Default Currency</label>
                <select value={jobPrefs.defaultCurrency} onChange={e => setJobPrefs(p => ({ ...p, defaultCurrency: e.target.value }))} style={inputStyle}>
                  <option value="INR (₹)">INR (₹)</option>
                  <option value="USD ($)">USD ($)</option>
                  <option value="EUR (€)">EUR (€)</option>
                  <option value="GBP (£)">GBP (£)</option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>Application Deadline Duration</label>
                <select value={jobPrefs.defaultDeadlineDays} onChange={e => setJobPrefs(p => ({ ...p, defaultDeadlineDays: e.target.value }))} style={inputStyle}>
                  <option value="15">15 Days from Posting</option>
                  <option value="30">30 Days from Posting</option>
                  <option value="45">45 Days from Posting</option>
                  <option value="60">60 Days from Posting</option>
                </select>
              </div>
            </div>

            {/* External ATS template URL */}
            {jobPrefs.defaultMethod === 'external' && (
              <div>
                <label style={labelStyle}>External ATS Careers URL Template</label>
                <input
                  type="url"
                  value={jobPrefs.defaultAtsUrl}
                  onChange={e => setJobPrefs(p => ({ ...p, defaultAtsUrl: e.target.value }))}
                  style={inputStyle}
                  placeholder="https://careers.yourcompany.com/apply"
                />
              </div>
            )}
          </div>

          {/* Candidate Screening & Pipeline Automation */}
          <div style={cardStyle}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Hiring Pipeline Automation &amp; Candidate Rules</h3>
              <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '3px', margin: 0 }}>Set rules for required candidate documents and automated acknowledgments.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.85rem', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={jobPrefs.autoRequireResume}
                  onChange={e => setJobPrefs(p => ({ ...p, autoRequireResume: e.target.checked }))}
                  style={{ width: '18px', height: '18px', accentColor: '#6366f1', marginTop: '2px' }}
                />
                <div>
                  <strong style={{ fontSize: '0.86rem', color: '#0f172a', display: 'block' }}>Mandatory Resume Upload</strong>
                  <span style={{ fontSize: '0.76rem', color: '#64748b' }}>Require candidates to attach a valid PDF/Word resume before submitting.</span>
                </div>
              </label>

              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.85rem', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={jobPrefs.autoRequirePhone}
                  onChange={e => setJobPrefs(p => ({ ...p, autoRequirePhone: e.target.checked }))}
                  style={{ width: '18px', height: '18px', accentColor: '#6366f1', marginTop: '2px' }}
                />
                <div>
                  <strong style={{ fontSize: '0.86rem', color: '#0f172a', display: 'block' }}>Mandatory Phone Number</strong>
                  <span style={{ fontSize: '0.76rem', color: '#64748b' }}>Ensure every applicant provides a verified mobile contact number.</span>
                </div>
              </label>

              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.85rem', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={jobPrefs.autoWelcomeMessage}
                  onChange={e => setJobPrefs(p => ({ ...p, autoWelcomeMessage: e.target.checked }))}
                  style={{ width: '18px', height: '18px', accentColor: '#6366f1', marginTop: '2px' }}
                />
                <div>
                  <strong style={{ fontSize: '0.86rem', color: '#0f172a', display: 'block' }}>Automated Welcome Message</strong>
                  <span style={{ fontSize: '0.76rem', color: '#64748b' }}>Instantly initialize a chat thread and send receipt confirmation to applicant.</span>
                </div>
              </label>

              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.85rem', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={jobPrefs.filterUnmatchedSkills}
                  onChange={e => setJobPrefs(p => ({ ...p, filterUnmatchedSkills: e.target.checked }))}
                  style={{ width: '18px', height: '18px', accentColor: '#6366f1', marginTop: '2px' }}
                />
                <div>
                  <strong style={{ fontSize: '0.86rem', color: '#0f172a', display: 'block' }}>Highlight Low-Match Applicants</strong>
                  <span style={{ fontSize: '0.76rem', color: '#64748b' }}>Visually tag applicants with zero matched skills for faster triaging.</span>
                </div>
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              style={{
                background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                color: '#ffffff', border: 'none', borderRadius: '12px',
                padding: '0.75rem 1.8rem', fontWeight: '800', fontSize: '0.9rem',
                display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(79,70,229,0.25)'
              }}
            >
              <Save size={16} /> Save Job Preferences
            </button>
          </div>

        </form>
      )}

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* 5. TAB: COMPANY SETTINGS                                               */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'company-settings' && (
        <form onSubmit={handleSaveCompany} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Company Profile &amp; Employer Brand</h3>
                <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '3px', margin: 0 }}>This branding is displayed across your job posts and company directory pages.</p>
              </div>
              <span style={{ background: '#eff6ff', color: '#2563eb', padding: '3px 9px', borderRadius: '8px', fontSize: '0.74rem', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={12} /> Verified Employer
              </span>
            </div>

            {/* Logo Upload Box */}
            <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', padding: '1rem', background: '#f8fafc', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
              <div style={{ position: 'relative', flexShrink: 0 }}>
                {companyForm.logoUrl ? (
                  <img
                    src={companyForm.logoUrl}
                    alt={companyForm.brandName}
                    style={{ width: '72px', height: '72px', borderRadius: '16px', objectFit: 'contain', background: '#ffffff', border: '1px solid #cbd5e1', padding: '4px' }}
                  />
                ) : (
                  <div style={{ width: '72px', height: '72px', borderRadius: '16px', background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', color: '#ffffff', fontWeight: '800', fontSize: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {(companyForm.brandName || 'C').charAt(0).toUpperCase()}
                  </div>
                )}
                <input ref={companyLogoInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleCompanyLogoChange} />
              </div>

              <div>
                <strong style={{ fontSize: '0.9rem', color: '#0f172a', display: 'block' }}>Company Logo</strong>
                <p style={{ fontSize: '0.76rem', color: '#64748b', margin: '2px 0 6px 0' }}>Recommended: Square PNG/JPG, transparent background, under 3MB.</p>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => companyLogoInputRef.current?.click()}
                    style={{ padding: '4px 12px', borderRadius: '6px', background: '#eff6ff', border: '1px solid #bfdbfe', color: '#2563eb', fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer' }}
                  >
                    Upload Logo
                  </button>
                  {companyForm.logoUrl && (
                    <button
                      type="button"
                      onClick={() => { setCompanyForm(f => ({ ...f, logoUrl: null })); triggerToast('Company logo removed.'); }}
                      style={{ padding: '4px 12px', borderRadius: '6px', background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer' }}
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Legal Name & Brand Name */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Company Legal Name *</label>
                <input
                  type="text"
                  required
                  value={companyForm.legalName}
                  onChange={e => setCompanyForm(f => ({ ...f, legalName: e.target.value }))}
                  style={inputStyle}
                  placeholder="e.g. TechNova Solutions Private Limited"
                />
              </div>
              <div>
                <label style={labelStyle}>Brand / Display Name *</label>
                <input
                  type="text"
                  required
                  value={companyForm.brandName}
                  onChange={e => setCompanyForm(f => ({ ...f, brandName: e.target.value }))}
                  style={inputStyle}
                  placeholder="e.g. TechNova"
                />
              </div>
            </div>

            {/* Industry, Size, Founded */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Industry / Sector</label>
                <select value={companyForm.industry} onChange={e => setCompanyForm(f => ({ ...f, industry: e.target.value }))} style={inputStyle}>
                  <option value="Information Technology & Software Services">Information Technology</option>
                  <option value="Banking & Financial Services">Banking &amp; Financial Services</option>
                  <option value="Healthcare & Life Sciences">Healthcare &amp; Life Sciences</option>
                  <option value="E-Commerce & Retail Tech">E-Commerce &amp; Retail</option>
                  <option value="Consulting & Business Services">Consulting</option>
                  <option value="Telecommunications">Telecommunications</option>
                  <option value="Automotive & Manufacturing">Manufacturing</option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>Headcount / Size</label>
                <select value={companyForm.companySize} onChange={e => setCompanyForm(f => ({ ...f, companySize: e.target.value }))} style={inputStyle}>
                  <option value="1-10">1-10 employees</option>
                  <option value="11-50">11-50 employees</option>
                  <option value="51-200">51-200 employees</option>
                  <option value="201-500">201-500 employees</option>
                  <option value="500-1000">500-1000 employees</option>
                  <option value="1000+">1000+ Enterprise</option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>Year Founded</label>
                <input
                  type="text"
                  value={companyForm.yearFounded}
                  onChange={e => setCompanyForm(f => ({ ...f, yearFounded: e.target.value }))}
                  style={inputStyle}
                  placeholder="e.g. 2018"
                />
              </div>
            </div>

            {/* Website, Careers Page, Location */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Official Website URL</label>
                <input
                  type="url"
                  value={companyForm.website}
                  onChange={e => setCompanyForm(f => ({ ...f, website: e.target.value }))}
                  style={inputStyle}
                  placeholder="https://company.com"
                />
              </div>

              <div>
                <label style={labelStyle}>Careers Page URL</label>
                <input
                  type="url"
                  value={companyForm.careersUrl}
                  onChange={e => setCompanyForm(f => ({ ...f, careersUrl: e.target.value }))}
                  style={inputStyle}
                  placeholder="https://company.com/careers"
                />
              </div>

              <div>
                <label style={labelStyle}>Headquarters City</label>
                <input
                  type="text"
                  value={companyForm.headquarters}
                  onChange={e => setCompanyForm(f => ({ ...f, headquarters: e.target.value }))}
                  style={inputStyle}
                  placeholder="Bangalore, Karnataka, India"
                />
              </div>
            </div>

            {/* Tagline */}
            <div>
              <label style={labelStyle}>Company Tagline</label>
              <input
                type="text"
                value={companyForm.tagline}
                onChange={e => setCompanyForm(f => ({ ...f, tagline: e.target.value }))}
                style={inputStyle}
                placeholder="e.g. Empowering Next-Generation Enterprise Cloud Intelligence"
              />
            </div>

            {/* Description */}
            <div>
              <label style={labelStyle}>Company Overview &amp; Culture</label>
              <textarea
                rows={3}
                value={companyForm.description}
                onChange={e => setCompanyForm(f => ({ ...f, description: e.target.value }))}
                style={{ ...inputStyle, resize: 'vertical' }}
                placeholder="Describe your company mission, hiring culture and tech stack..."
              />
            </div>

            {/* Social Links */}
            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
              <strong style={{ fontSize: '0.88rem', color: '#0f172a', display: 'block', marginBottom: '8px' }}>Company Social Handles</strong>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>LinkedIn URL</label>
                  <input
                    type="url"
                    value={companyForm.linkedin}
                    onChange={e => setCompanyForm(f => ({ ...f, linkedin: e.target.value }))}
                    style={inputStyle}
                    placeholder="https://linkedin.com/company/handle"
                  />
                </div>
                <div>
                  <label style={labelStyle}>Twitter / X URL</label>
                  <input
                    type="url"
                    value={companyForm.twitter}
                    onChange={e => setCompanyForm(f => ({ ...f, twitter: e.target.value }))}
                    style={inputStyle}
                    placeholder="https://x.com/handle"
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button
                type="submit"
                style={{
                  background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                  color: '#ffffff', border: 'none', borderRadius: '12px',
                  padding: '0.75rem 1.8rem', fontWeight: '800', fontSize: '0.9rem',
                  display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(79,70,229,0.25)'
                }}
              >
                <Save size={16} /> Save Company Settings
              </button>
            </div>

          </div>

        </form>
      )}

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* 6. TAB: ACCOUNT MANAGEMENT                                             */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'account-management' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Overview & Subscription Status */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Recruiter Account Status</h3>
                <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '3px', margin: 0 }}>Review your corporate membership tier and account identifier.</p>
              </div>
              <span style={{ background: '#fef3c7', color: '#b45309', padding: '4px 10px', borderRadius: '8px', fontSize: '0.76rem', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Crown size={13} /> Pro Recruiter Tier
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: '14px', border: '1px solid #f1f5f9' }}>
              <div>
                <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Account ID</span>
                <div style={{ fontSize: '0.9rem', fontWeight: '800', color: '#0f172a', fontFamily: 'monospace', marginTop: '2px' }}>
                  REC-2026-89421
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Member Role</span>
                <div style={{ fontSize: '0.9rem', fontWeight: '800', color: '#4f46e5', marginTop: '2px' }}>
                  Hiring Partner
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Current Plan</span>
                <div style={{ fontSize: '0.9rem', fontWeight: '800', color: '#16a34a', marginTop: '2px' }}>
                  Enterprise Pro Active
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => navigate('/recruiter/subscriptions')}
                  style={{ padding: '0.45rem 0.95rem', background: '#6366f1', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '800', cursor: 'pointer' }}
                >
                  Manage Subscription &rarr;
                </button>
              </div>
            </div>
          </div>

          {/* Compliance & Data Exports */}
          <div style={cardStyle}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Data Export &amp; Portability</h3>
              <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '3px', margin: 0 }}>Export complete hiring records and candidate submissions in CSV format.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              
              <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '14px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ fontSize: '0.88rem', color: '#0f172a', display: 'block' }}>Applicant Submissions CSV</strong>
                  <span style={{ fontSize: '0.76rem', color: '#64748b' }}>Download all candidate names, emails, phones, and statuses.</span>
                </div>
                <button
                  type="button"
                  onClick={handleExportApplicantsCSV}
                  style={{ padding: '0.55rem 1.1rem', background: '#ffffff', border: '1.5px solid #818cf8', color: '#4f46e5', borderRadius: '10px', fontSize: '0.82rem', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', whiteSpace: 'nowrap' }}
                >
                  <Download size={14} /> Export Applicants
                </button>
              </div>

              <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '14px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ fontSize: '0.88rem', color: '#0f172a', display: 'block' }}>Job Postings Directory CSV</strong>
                  <span style={{ fontSize: '0.76rem', color: '#64748b' }}>Download all vacancies with deadlines, salaries, and metrics.</span>
                </div>
                <button
                  type="button"
                  onClick={handleExportJobsCSV}
                  style={{ padding: '0.55rem 1.1rem', background: '#ffffff', border: '1.5px solid #818cf8', color: '#4f46e5', borderRadius: '10px', fontSize: '0.82rem', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', whiteSpace: 'nowrap' }}
                >
                  <Download size={14} /> Export Jobs
                </button>
              </div>

            </div>
          </div>

          {/* Danger Zone */}
          <div style={{ ...cardStyle, border: '1px solid #fee2e2' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#dc2626', margin: 0 }}>Danger Zone</h3>
              <p style={{ fontSize: '0.82rem', color: '#ef4444', marginTop: '3px', margin: 0 }}>Irreversible actions regarding your recruiter membership.</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: '#fff5f5', borderRadius: '12px', border: '1px solid #fecaca' }}>
                <div>
                  <strong style={{ fontSize: '0.88rem', color: '#dc2626', display: 'block' }}>Temporarily Deactivate Account</strong>
                  <span style={{ fontSize: '0.76rem', color: '#64748b' }}>Temporarily pause your active job postings. You can reactivate anytime by logging back in.</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDeactivateModal(true)}
                  style={{ background: '#ffffff', border: '1.5px solid #fca5a5', color: '#dc2626', padding: '0.5rem 1.2rem', borderRadius: '10px', fontSize: '0.82rem', fontWeight: '800', cursor: 'pointer', whiteSpace: 'nowrap' }}
                >
                  Deactivate
                </button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: '#fff5f5', borderRadius: '12px', border: '1px solid #fecaca' }}>
                <div>
                  <strong style={{ fontSize: '0.88rem', color: '#dc2626', display: 'block' }}>Permanently Delete Recruiter Account</strong>
                  <span style={{ fontSize: '0.76rem', color: '#64748b' }}>Permanently purge your account, posted job listings, and candidate chats from Careonix.</span>
                </div>
                <button
                  type="button"
                  onClick={() => { setDeleteConfirmationText(''); setShowDeleteModal(true); }}
                  style={{ background: '#dc2626', color: '#ffffff', border: 'none', padding: '0.55rem 1.25rem', borderRadius: '10px', fontSize: '0.82rem', fontWeight: '800', cursor: 'pointer', whiteSpace: 'nowrap' }}
                >
                  Delete Account
                </button>
              </div>

            </div>
          </div>

        </div>
      )}

      {/* ── MODAL: 2FA Configuration ────────────────────────────────────────── */}
      {show2FAModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 600, padding: '1rem' }}>
          <div style={{ width: '480px', background: '#ffffff', borderRadius: '24px', padding: '2rem', boxShadow: '0 25px 60px rgba(15,23,42,0.2)', border: '1px solid #e2e8f0', textAlign: 'center' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: twoFactorEnabled ? '#fee2e2' : '#ede9fe', color: twoFactorEnabled ? '#dc2626' : '#7c3aed', margin: '0 auto 1rem auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Shield size={28} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
              {twoFactorEnabled ? 'Disable Two-Factor Authentication?' : 'Enable Two-Factor Authentication'}
            </h3>
            <p style={{ fontSize: '0.84rem', color: '#64748b', marginTop: '6px', lineHeight: '1.5' }}>
              {twoFactorEnabled
                ? 'Disabling 2FA removes the 6-digit security code challenge from your recruiter sign-in.'
                : 'Protect your candidate data and recruiter portal with 2FA verification on every sign-in.'}
            </p>

            {twoFactorModalError && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '0.5rem 0.8rem', borderRadius: '10px', fontSize: '0.8rem', fontWeight: '700', marginTop: '0.75rem' }}>
                {twoFactorModalError}
              </div>
            )}

            {!twoFactorEnabled && (
              <div style={{ margin: '1.25rem 0', background: '#f8fafc', padding: '1rem', borderRadius: '14px', border: '1px solid #e2e8f0', textAlign: 'left' }}>
                <div style={{ fontSize: '0.78rem', color: '#475569', fontWeight: '700', marginBottom: '6px' }}>
                  Authenticator Setup Key: <span style={{ fontFamily: 'monospace', color: '#4f46e5', fontWeight: '800' }}>CRNX-8942-AUTH</span>
                </div>
                <p style={{ fontSize: '0.76rem', color: '#64748b', margin: '0 0 10px 0' }}>
                  Enter code <strong style={{ color: '#0f172a' }}>123456</strong> or your Authenticator 6-digit OTP below to verify and activate:
                </p>
                <input
                  type="text"
                  maxLength={6}
                  value={twoFactorCode}
                  onChange={e => {
                    setTwoFactorModalError('');
                    setTwoFactorCode(e.target.value.replace(/\D/g, ''));
                  }}
                  placeholder="123456"
                  style={{ ...inputStyle, textAlign: 'center', letterSpacing: '0.25em', fontSize: '1.15rem', fontWeight: '800' }}
                />
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button
                type="button"
                onClick={() => {
                  setShow2FAModal(false);
                  setTwoFactorModalError('');
                }}
                style={{ padding: '0.7rem 1.4rem', borderRadius: '10px', background: '#f1f5f9', border: 'none', color: '#475569', fontWeight: '700', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (twoFactorEnabled) {
                    setTwoFactorEnabled(false);
                    setTwoFactorEnabledState(userEmail, false);
                    setShow2FAModal(false);
                    triggerToast('2FA Security disabled.');
                  } else {
                    if (!twoFactorCode || twoFactorCode.length < 6) {
                      setTwoFactorModalError('⚠️ Please enter the 6-digit code (e.g. 123456).');
                      return;
                    }
                    setTwoFactorEnabled(true);
                    setTwoFactorEnabledState(userEmail, true);
                    setShow2FAModal(false);
                    setTwoFactorCode('');
                    triggerToast('🎉 2FA Security enabled successfully! Future logins will require this code.');
                  }
                }}
                style={{
                  padding: '0.7rem 1.6rem', borderRadius: '10px',
                  background: twoFactorEnabled ? '#dc2626' : '#6366f1',
                  color: '#ffffff', border: 'none', fontWeight: '800', cursor: 'pointer'
                }}
              >
                {twoFactorEnabled ? 'Confirm Disable' : 'Verify & Enable 2FA'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Active Sessions ──────────────────────────────────────────── */}
      {showActiveSessionsModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 600, padding: '1rem' }}>
          <div style={{ width: '560px', background: '#ffffff', borderRadius: '24px', padding: '1.75rem', boxShadow: '0 25px 60px rgba(15,23,42,0.2)', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Active Recruiter Sessions</h3>
              <button onClick={() => setShowActiveSessionsModal(false)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={18} color="#64748b" />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Laptop size={22} color="#6366f1" />
                  <div>
                    <strong style={{ fontSize: '0.86rem', color: '#0f172a', display: 'block' }}>{currentDeviceInfo.device} ({currentDeviceInfo.browser})</strong>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>IP: {currentDeviceInfo.ip} &bull; {currentDeviceInfo.location}</span>
                  </div>
                </div>
                <span style={{ background: '#dcfce7', color: '#15803d', padding: '3px 9px', borderRadius: '10px', fontSize: '0.72rem', fontWeight: '800' }}>Current Device</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
              <button
                type="button"
                onClick={() => {
                  const cleaned = clearOtherSessions(userEmail);
                  setLoginLogs(cleaned);
                  setShowActiveSessionsModal(false);
                  triggerToast('✅ Logged out of all other remote devices.');
                }}
                style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '0.6rem 1.1rem', borderRadius: '10px', fontSize: '0.82rem', fontWeight: '800', cursor: 'pointer' }}
              >
                Log Out Other Devices
              </button>
              <button
                type="button"
                onClick={() => setShowActiveSessionsModal(false)}
                style={{ padding: '0.6rem 1.4rem', borderRadius: '10px', background: '#6366f1', color: '#ffffff', border: 'none', fontWeight: '800', cursor: 'pointer' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Deactivate Account ───────────────────────────────────────── */}
      {showDeactivateModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 600, padding: '1rem' }}>
          <div style={{ width: '460px', background: '#ffffff', borderRadius: '24px', padding: '1.75rem', boxShadow: '0 25px 60px rgba(15,23,42,0.2)', border: '1px solid #e2e8f0', textAlign: 'center' }}>
            <div style={{ width: '54px', height: '54px', borderRadius: '50%', background: '#fee2e2', color: '#dc2626', margin: '0 auto 1rem auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={26} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
              Deactivate Recruiter Account?
            </h3>
            <p style={{ fontSize: '0.84rem', color: '#64748b', marginTop: '6px', lineHeight: '1.45' }}>
              Deactivating will temporarily pause your active job postings and candidate chats. You can reactivate anytime by simply logging back in.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button
                type="button"
                onClick={() => setShowDeactivateModal(false)}
                style={{ padding: '0.7rem 1.3rem', borderRadius: '10px', background: '#f1f5f9', border: 'none', color: '#475569', fontWeight: '700', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDeactivateModal(false);
                  logout();
                }}
                style={{ padding: '0.7rem 1.5rem', borderRadius: '10px', background: '#dc2626', color: '#ffffff', border: 'none', fontWeight: '800', cursor: 'pointer' }}
              >
                Confirm Deactivate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Delete Account ───────────────────────────────────────────── */}
      {showDeleteModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 600, padding: '1rem' }}>
          <div style={{ width: '480px', background: '#ffffff', borderRadius: '24px', padding: '1.75rem', boxShadow: '0 25px 60px rgba(15,23,42,0.2)', border: '1px solid #e2e8f0', textAlign: 'center' }}>
            <div style={{ width: '54px', height: '54px', borderRadius: '50%', background: '#fef2f2', color: '#dc2626', margin: '0 auto 1rem auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldAlert size={28} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#dc2626', margin: 0 }}>
              Permanently Delete Account?
            </h3>
            <p style={{ fontSize: '0.84rem', color: '#64748b', marginTop: '6px', lineHeight: '1.45' }}>
              This action is permanent and cannot be undone. All your job listings, applicant communications, and team records will be permanently erased.
            </p>

            <div style={{ marginTop: '1rem', textAlign: 'left' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#0f172a', display: 'block', marginBottom: '4px' }}>
                Type <strong style={{ color: '#dc2626' }}>DELETE</strong> to confirm:
              </label>
              <input
                type="text"
                value={deleteConfirmationText}
                onChange={e => setDeleteConfirmationText(e.target.value)}
                placeholder="DELETE"
                style={inputStyle}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                style={{ padding: '0.7rem 1.3rem', borderRadius: '10px', background: '#f1f5f9', border: 'none', color: '#475569', fontWeight: '700', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteConfirmationText !== 'DELETE'}
                onClick={() => {
                  setShowDeleteModal(false);
                  logout();
                }}
                style={{
                  padding: '0.7rem 1.6rem', borderRadius: '10px',
                  background: deleteConfirmationText === 'DELETE' ? '#dc2626' : '#cbd5e1',
                  color: '#ffffff', border: 'none', fontWeight: '800',
                  cursor: deleteConfirmationText === 'DELETE' ? 'pointer' : 'not-allowed'
                }}
              >
                Delete Forever
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
