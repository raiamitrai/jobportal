import React, { useState } from 'react';
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
  HelpCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function RecruiterSettingsPage() {
  const { user, logout } = useAuth();

  // Top Tabs
  const [activeTab, setActiveTab] = useState('Account');

  // Notifications & Alerts
  const [toastMsg, setToastMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  // Account Information State
  const [fullName, setFullName] = useState(user?.name || 'kashirama');
  const [workEmail] = useState(user?.email || 'kashirama1001@gmail.com');
  const [phoneNumber] = useState(user?.phone || '+91 98765 43210');
  const [designation, setDesignation] = useState('Recruiter');

  // Password Fields with Eye Toggles
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // Notification Preferences State (Checkboxes Table)
  const [notifState, setNotifState] = useState({
    newApp: { email: true, inApp: true },
    candMsg: { email: true, inApp: true },
    candShortlisted: { email: false, inApp: true },
    interviewScheduled: { email: true, inApp: true },
    interviewReminder: { email: true, inApp: true },
    jobExpiring: { email: true, inApp: false },
    jobPublished: { email: false, inApp: true }
  });

  const [emailFrequency, setEmailFrequency] = useState('Instant');
  const [marketingEmails, setMarketingEmails] = useState(true);

  // Privacy & Security Modals
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [showActiveSessionsModal, setShowActiveSessionsModal] = useState(false);
  const [showLoginActivityModal, setShowLoginActivityModal] = useState(false);

  // Job Preferences State
  const [defaultJobType, setDefaultJobType] = useState('Full-time');
  const [defaultLocation, setDefaultLocation] = useState('India');
  const [defaultAppMethod, setDefaultAppMethod] = useState('Apply on CAREONIX');
  const [defaultCurrency, setDefaultCurrency] = useState('INR (₹)');

  // Danger Zone Modals
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Password Update Submit Handler
  const handleUpdatePassword = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!currentPassword) {
      setErrorMsg('⚠️ Please enter your current password.');
      return;
    }

    const actualPass = user?.password;
    if (actualPass && currentPassword !== actualPass) {
      setErrorMsg('❌ Entered current password does not match your account password!');
      return;
    }

    if (!newPassword) {
      setErrorMsg('⚠️ Please enter a new password.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg('⚠️ New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('❌ New Password and Confirm New Password do not match!');
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

    triggerToast('🎉 Password updated successfully!');
  };

  const toggleNotif = (key, type) => {
    setNotifState(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [type]: !prev[key][type]
      }
    }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', background: '#f8fafc', minHeight: '92vh', fontFamily: 'Inter, sans-serif' }}>
      
      {/* Toast Notification */}
      {toastMsg && (
        <div style={{
          position: 'fixed', top: '24px', right: '24px', background: '#10b981', color: '#ffffff',
          padding: '0.9rem 1.4rem', borderRadius: '14px', boxShadow: '0 10px 25px rgba(16,185,129,0.3)',
          display: 'flex', alignItems: 'center', gap: '0.6rem', zIndex: 300, fontWeight: '700', fontSize: '0.9rem'
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
          display: 'flex', alignItems: 'center', gap: '0.6rem', zIndex: 300, fontWeight: '700', fontSize: '0.9rem'
        }}>
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Page Header */}
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
          Settings
        </h1>
        <p style={{ color: '#64748b', marginTop: '4px', fontSize: '0.9rem' }}>
          Manage your account, preferences and notification settings.
        </p>
      </div>

      {/* Top Sub-Navigation Tabs Bar (100% Match with Screenshot) */}
      <div style={{ display: 'flex', gap: '2rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.1rem' }}>
        {[
          'Account',
          'Notifications',
          'Privacy & Security',
          'Job Preferences',
          'Company Settings',
          'Account Management'
        ].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              background: 'none', border: 'none', padding: '0.65rem 0',
              color: activeTab === tab ? '#6366f1' : '#64748b',
              fontWeight: activeTab === tab ? '800' : '600',
              fontSize: '0.9rem', cursor: 'pointer',
              borderBottom: activeTab === tab ? '2.5px solid #6366f1' : '2.5px solid transparent',
              transition: 'all 0.15s ease'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── ROW 1: Account Information & Notification Preferences (2 Columns Grid) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'flex-start' }}>
        
        {/* LEFT COLUMN: Account Information + Change Password */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Card A: Account Information */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.75rem', boxShadow: '0 1px 4px rgba(15,23,42,0.02)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Account Information</h3>
              <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '3px', margin: 0 }}>Update your personal account information.</p>
            </div>

            <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
              
              {/* Purple Large Avatar Box with Pencil Badge */}
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'linear-gradient(135deg, #6366f1, #4f46e5)', color: '#ffffff', fontWeight: '800', fontSize: '1.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {(fullName || 'K').charAt(0).toUpperCase()}
                </div>
                <button
                  onClick={() => triggerToast('Avatar editor opened')}
                  style={{
                    position: 'absolute', bottom: '-4px', right: '-4px',
                    width: '24px', height: '24px', borderRadius: '50%',
                    background: '#ffffff', border: '1px solid #cbd5e1',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                  }}
                >
                  <Edit3 size={12} color="#475569" />
                </button>
              </div>

              {/* Form Inputs */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
                
                {/* Full Name */}
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#0f172a', display: 'block', marginBottom: '4px' }}>Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem', fontFamily: 'Inter, sans-serif' }}
                  />
                </div>

                {/* Work Email with Verified ✓ Badge inside on right */}
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#0f172a', display: 'block', marginBottom: '4px' }}>Work Email</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="email"
                      readOnly
                      value={workEmail}
                      style={{ width: '100%', padding: '0.65rem 5.5rem 0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem', background: '#f8fafc', color: '#0f172a' }}
                    />
                    <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0', padding: '2px 8px', borderRadius: '8px', fontSize: '0.74rem', fontWeight: '800' }}>
                      Verified ✓
                    </span>
                  </div>
                </div>

                {/* Phone Number with Verified ✓ Badge inside on right */}
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#0f172a', display: 'block', marginBottom: '4px' }}>Phone Number</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      readOnly
                      value={phoneNumber}
                      style={{ width: '100%', padding: '0.65rem 5.5rem 0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem', background: '#f8fafc', color: '#0f172a' }}
                    />
                    <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0', padding: '2px 8px', borderRadius: '8px', fontSize: '0.74rem', fontWeight: '800' }}>
                      Verified ✓
                    </span>
                  </div>
                </div>

                {/* Designation */}
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#0f172a', display: 'block', marginBottom: '4px' }}>Designation</label>
                  <input
                    type="text"
                    value={designation}
                    onChange={e => setDesignation(e.target.value)}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem', fontFamily: 'Inter, sans-serif' }}
                  />
                </div>

                {/* Profile Photo Upload */}
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#0f172a', display: 'block', marginBottom: '4px' }}>Profile Photo</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <button
                      type="button"
                      onClick={() => triggerToast('Profile photo uploaded')}
                      style={{ background: '#ffffff', border: '1px solid #cbd5e1', color: '#334155', borderRadius: '10px', padding: '0.5rem 1rem', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Upload size={14} /> Upload Photo
                    </button>
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>JPG, PNG or SVG. Max size 2MB</span>
                  </div>
                </div>

              </div>

            </div>

          </div>

          {/* Card B: Change Password */}
          <form onSubmit={handleUpdatePassword} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.75rem', boxShadow: '0 1px 4px rgba(15,23,42,0.02)', display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
            
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Change Password</h3>
              <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '3px', margin: 0 }}>Update your account password.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.85rem' }}>
              
              {/* Current Password */}
              <div>
                <label style={{ fontSize: '0.76rem', fontWeight: '700', color: '#0f172a', display: 'block', marginBottom: '4px' }}>Current Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showCurrentPass ? 'text' : 'password'}
                    placeholder="Enter current password"
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    style={{ width: '100%', padding: '0.6rem 2.2rem 0.6rem 0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                  />
                  <button type="button" onClick={() => setShowCurrentPass(!showCurrentPass)} style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                    {showCurrentPass ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label style={{ fontSize: '0.76rem', fontWeight: '700', color: '#0f172a', display: 'block', marginBottom: '4px' }}>New Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    style={{ width: '100%', padding: '0.6rem 2.2rem 0.6rem 0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                  />
                  <button type="button" onClick={() => setShowNewPass(!showNewPass)} style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                    {showNewPass ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div>
                <label style={{ fontSize: '0.76rem', fontWeight: '700', color: '#0f172a', display: 'block', marginBottom: '4px' }}>Confirm New Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showConfirmPass ? 'text' : 'password'}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    style={{ width: '100%', padding: '0.6rem 2.2rem 0.6rem 0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                  />
                  <button type="button" onClick={() => setShowConfirmPass(!showConfirmPass)} style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                    {showConfirmPass ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
              <button
                type="submit"
                style={{
                  padding: '0.6rem 1.4rem', borderRadius: '10px',
                  background: '#6366f1', color: '#ffffff', border: 'none',
                  fontWeight: '800', fontSize: '0.84rem', cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(99,102,241,0.2)'
                }}
              >
                Update Password
              </button>
            </div>

          </form>

        </div>

        {/* RIGHT COLUMN: Notification Preferences Table & Email Preferences */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.75rem', boxShadow: '0 1px 4px rgba(15,23,42,0.02)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Notification Preferences</h3>
            <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '3px', margin: 0 }}>Choose what you want to be notified about and how.</p>
          </div>

          {/* Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.76rem', textAlign: 'left' }}>
                <th style={{ paddingBottom: '0.75rem', fontWeight: '700' }}>Notification Type</th>
                <th style={{ paddingBottom: '0.75rem', fontWeight: '700', textAlign: 'center', width: '70px' }}>Email</th>
                <th style={{ paddingBottom: '0.75rem', fontWeight: '700', textAlign: 'center', width: '70px' }}>In-app</th>
              </tr>
            </thead>
            <tbody>
              
              {/* Row 1 */}
              <tr style={{ borderBottom: '1px solid #f8fafc' }}>
                <td style={{ padding: '0.75rem 0', display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a', fontWeight: '600' }}>
                  <User size={15} color="#6366f1" /> New Application Received
                </td>
                <td style={{ textAlign: 'center' }}>
                  <input type="checkbox" checked={notifState.newApp.email} onChange={() => toggleNotif('newApp', 'email')} style={{ accentColor: '#6366f1', width: '16px', height: '16px', cursor: 'pointer' }} />
                </td>
                <td style={{ textAlign: 'center' }}>
                  <input type="checkbox" checked={notifState.newApp.inApp} onChange={() => toggleNotif('newApp', 'inApp')} style={{ accentColor: '#6366f1', width: '16px', height: '16px', cursor: 'pointer' }} />
                </td>
              </tr>

              {/* Row 2 */}
              <tr style={{ borderBottom: '1px solid #f8fafc' }}>
                <td style={{ padding: '0.75rem 0', display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a', fontWeight: '600' }}>
                  <MessageSquare size={15} color="#6366f1" /> Candidate Messages
                </td>
                <td style={{ textAlign: 'center' }}>
                  <input type="checkbox" checked={notifState.candMsg.email} onChange={() => toggleNotif('candMsg', 'email')} style={{ accentColor: '#6366f1', width: '16px', height: '16px', cursor: 'pointer' }} />
                </td>
                <td style={{ textAlign: 'center' }}>
                  <input type="checkbox" checked={notifState.candMsg.inApp} onChange={() => toggleNotif('candMsg', 'inApp')} style={{ accentColor: '#6366f1', width: '16px', height: '16px', cursor: 'pointer' }} />
                </td>
              </tr>

              {/* Row 3 */}
              <tr style={{ borderBottom: '1px solid #f8fafc' }}>
                <td style={{ padding: '0.75rem 0', display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a', fontWeight: '600' }}>
                  <Star size={15} color="#6366f1" /> Candidate Shortlisted
                </td>
                <td style={{ textAlign: 'center' }}>
                  <input type="checkbox" checked={notifState.candShortlisted.email} onChange={() => toggleNotif('candShortlisted', 'email')} style={{ accentColor: '#6366f1', width: '16px', height: '16px', cursor: 'pointer' }} />
                </td>
                <td style={{ textAlign: 'center' }}>
                  <input type="checkbox" checked={notifState.candShortlisted.inApp} onChange={() => toggleNotif('candShortlisted', 'inApp')} style={{ accentColor: '#6366f1', width: '16px', height: '16px', cursor: 'pointer' }} />
                </td>
              </tr>

              {/* Row 4 */}
              <tr style={{ borderBottom: '1px solid #f8fafc' }}>
                <td style={{ padding: '0.75rem 0', display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a', fontWeight: '600' }}>
                  <Calendar size={15} color="#6366f1" /> Interview Scheduled
                </td>
                <td style={{ textAlign: 'center' }}>
                  <input type="checkbox" checked={notifState.interviewScheduled.email} onChange={() => toggleNotif('interviewScheduled', 'email')} style={{ accentColor: '#6366f1', width: '16px', height: '16px', cursor: 'pointer' }} />
                </td>
                <td style={{ textAlign: 'center' }}>
                  <input type="checkbox" checked={notifState.interviewScheduled.inApp} onChange={() => toggleNotif('interviewScheduled', 'inApp')} style={{ accentColor: '#6366f1', width: '16px', height: '16px', cursor: 'pointer' }} />
                </td>
              </tr>

              {/* Row 5 */}
              <tr style={{ borderBottom: '1px solid #f8fafc' }}>
                <td style={{ padding: '0.75rem 0', display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a', fontWeight: '600' }}>
                  <Bell size={15} color="#6366f1" /> Interview Reminder
                </td>
                <td style={{ textAlign: 'center' }}>
                  <input type="checkbox" checked={notifState.interviewReminder.email} onChange={() => toggleNotif('interviewReminder', 'email')} style={{ accentColor: '#6366f1', width: '16px', height: '16px', cursor: 'pointer' }} />
                </td>
                <td style={{ textAlign: 'center' }}>
                  <input type="checkbox" checked={notifState.interviewReminder.inApp} onChange={() => toggleNotif('interviewReminder', 'inApp')} style={{ accentColor: '#6366f1', width: '16px', height: '16px', cursor: 'pointer' }} />
                </td>
              </tr>

              {/* Row 6 */}
              <tr style={{ borderBottom: '1px solid #f8fafc' }}>
                <td style={{ padding: '0.75rem 0', display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a', fontWeight: '600' }}>
                  <Clock size={15} color="#6366f1" /> Job Expiring Soon
                </td>
                <td style={{ textAlign: 'center' }}>
                  <input type="checkbox" checked={notifState.jobExpiring.email} onChange={() => toggleNotif('jobExpiring', 'email')} style={{ accentColor: '#6366f1', width: '16px', height: '16px', cursor: 'pointer' }} />
                </td>
                <td style={{ textAlign: 'center' }}>
                  <input type="checkbox" checked={notifState.jobExpiring.inApp} onChange={() => toggleNotif('jobExpiring', 'inApp')} style={{ accentColor: '#6366f1', width: '16px', height: '16px', cursor: 'pointer' }} />
                </td>
              </tr>

              {/* Row 7 */}
              <tr>
                <td style={{ padding: '0.75rem 0', display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a', fontWeight: '600' }}>
                  <Rocket size={15} color="#6366f1" /> Job Published / Approved
                </td>
                <td style={{ textAlign: 'center' }}>
                  <input type="checkbox" checked={notifState.jobPublished.email} onChange={() => toggleNotif('jobPublished', 'email')} style={{ accentColor: '#6366f1', width: '16px', height: '16px', cursor: 'pointer' }} />
                </td>
                <td style={{ textAlign: 'center' }}>
                  <input type="checkbox" checked={notifState.jobPublished.inApp} onChange={() => toggleNotif('jobPublished', 'inApp')} style={{ accentColor: '#6366f1', width: '16px', height: '16px', cursor: 'pointer' }} />
                </td>
              </tr>

            </tbody>
          </table>

          {/* Embedded Email Preferences Box */}
          <div style={{ background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: '16px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h4 style={{ fontSize: '0.92rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Email Preferences</h4>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ fontSize: '0.84rem', color: '#0f172a', display: 'block' }}>Email Frequency</strong>
                <span style={{ fontSize: '0.76rem', color: '#64748b' }}>Choose how often you want to receive email notifications.</span>
              </div>
              <select
                value={emailFrequency}
                onChange={e => setEmailFrequency(e.target.value)}
                style={{ padding: '0.45rem 0.85rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.82rem', background: '#ffffff', fontWeight: '700' }}
              >
                <option value="Instant">Instant</option>
                <option value="Daily">Daily Digest</option>
                <option value="Weekly">Weekly Summary</option>
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid #e2e8f0' }}>
              <div>
                <strong style={{ fontSize: '0.84rem', color: '#0f172a', display: 'block' }}>Marketing Emails</strong>
                <span style={{ fontSize: '0.76rem', color: '#64748b' }}>Receive updates about new features, tips and industry insights.</span>
              </div>
              <button
                type="button"
                onClick={() => setMarketingEmails(!marketingEmails)}
                style={{ background: marketingEmails ? '#6366f1' : '#cbd5e1', color: '#ffffff', border: 'none', padding: '4px 12px', borderRadius: '14px', fontSize: '0.76rem', fontWeight: '800', cursor: 'pointer' }}
              >
                {marketingEmails ? 'ON' : 'OFF'}
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* ── ROW 2: Privacy & Security, Job Preferences & Danger Zone (3 Columns Grid) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.1fr 1fr', gap: '1.5rem', alignItems: 'flex-start' }}>
        
        {/* COLUMN 1: Privacy & Security */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.5rem', boxShadow: '0 1px 4px rgba(15,23,42,0.02)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Privacy & Security</h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px', margin: 0 }}>Manage your security settings and account activity.</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            {/* Two-Factor Authentication */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: '#f3e8ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Shield size={16} />
                </div>
                <div>
                  <strong style={{ fontSize: '0.84rem', color: '#0f172a', display: 'block' }}>Two-Factor Authentication</strong>
                  <span style={{ fontSize: '0.74rem', color: '#64748b' }}>Add an extra layer of security to your account.</span>
                </div>
              </div>
              <button
                onClick={() => setShow2FAModal(true)}
                style={{ background: twoFactorEnabled ? '#dcfce7' : '#ffffff', border: `1.5px solid ${twoFactorEnabled ? '#bbf7d0' : '#818cf8'}`, color: twoFactorEnabled ? '#15803d' : '#4f46e5', padding: '0.4rem 0.9rem', borderRadius: '10px', fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer', flexShrink: 0 }}
              >
                {twoFactorEnabled ? 'Enabled ✓' : 'Enable'}
              </button>
            </div>

            {/* Active Sessions */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Laptop size={16} />
                </div>
                <div>
                  <strong style={{ fontSize: '0.84rem', color: '#0f172a', display: 'block' }}>Active Sessions</strong>
                  <span style={{ fontSize: '0.74rem', color: '#64748b' }}>Manage your active sessions across devices.</span>
                </div>
              </div>
              <button
                onClick={() => setShowActiveSessionsModal(true)}
                style={{ background: '#ffffff', border: '1.5px solid #818cf8', color: '#4f46e5', padding: '0.4rem 0.9rem', borderRadius: '10px', fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer', flexShrink: 0 }}
              >
                Manage
              </button>
            </div>

            {/* Login Activity */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Clock size={16} />
                </div>
                <div>
                  <strong style={{ fontSize: '0.84rem', color: '#0f172a', display: 'block' }}>Login Activity</strong>
                  <span style={{ fontSize: '0.74rem', color: '#64748b' }}>View your recent login history.</span>
                </div>
              </div>
              <button
                onClick={() => setShowLoginActivityModal(true)}
                style={{ background: '#ffffff', border: '1.5px solid #818cf8', color: '#4f46e5', padding: '0.4rem 0.9rem', borderRadius: '10px', fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer', flexShrink: 0 }}
              >
                View
              </button>
            </div>

          </div>
        </div>

        {/* COLUMN 2: Job Preferences */}
        <form onSubmit={(e) => { e.preventDefault(); triggerToast('Job Preferences saved!'); }} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.5rem', boxShadow: '0 1px 4px rgba(15,23,42,0.02)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Job Preferences</h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px', margin: 0 }}>Set default preferences for creating new jobs.</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div>
              <label style={{ fontSize: '0.76rem', fontWeight: '700', color: '#0f172a', display: 'block', marginBottom: '3px' }}>Default Job Type</label>
              <select value={defaultJobType} onChange={e => setDefaultJobType(e.target.value)} style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.82rem', background: '#ffffff' }}>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Remote">Remote</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.76rem', fontWeight: '700', color: '#0f172a', display: 'block', marginBottom: '3px' }}>Default Location</label>
              <select value={defaultLocation} onChange={e => setDefaultLocation(e.target.value)} style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.82rem', background: '#ffffff' }}>
                <option value="India">India</option>
                <option value="Bangalore">Bangalore, India</option>
                <option value="Remote">Remote Worldwide</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.76rem', fontWeight: '700', color: '#0f172a', display: 'block', marginBottom: '3px' }}>Default Application Method</label>
              <select value={defaultAppMethod} onChange={e => setDefaultAppMethod(e.target.value)} style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.82rem', background: '#ffffff' }}>
                <option value="Apply on CAREONIX">Apply on CAREONIX</option>
                <option value="External Website ATS">External Website ATS</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.76rem', fontWeight: '700', color: '#0f172a', display: 'block', marginBottom: '3px' }}>Default Currency</label>
              <select value={defaultCurrency} onChange={e => setDefaultCurrency(e.target.value)} style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.82rem', background: '#ffffff' }}>
                <option value="INR (₹)">INR (₹)</option>
                <option value="USD ($)">USD ($)</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
            <button type="submit" style={{ padding: '0.55rem 1.25rem', borderRadius: '10px', background: '#6366f1', color: '#ffffff', border: 'none', fontWeight: '800', fontSize: '0.82rem', cursor: 'pointer' }}>
              Save Preferences
            </button>
          </div>
        </form>

        {/* COLUMN 3: Danger Zone */}
        <div style={{ background: '#ffffff', border: '1px solid #fee2e2', borderRadius: '20px', padding: '1.5rem', boxShadow: '0 1px 4px rgba(15,23,42,0.02)', display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#dc2626', margin: 0 }}>Danger Zone</h3>
            <p style={{ fontSize: '0.78rem', color: '#ef4444', marginTop: '2px', margin: 0 }}>Irreversible and sensitive account actions.</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <strong style={{ fontSize: '0.84rem', color: '#dc2626', display: 'block' }}>Deactivate Account</strong>
              <span style={{ fontSize: '0.74rem', color: '#64748b', display: 'block', marginBottom: '8px' }}>Temporarily deactivate your account.</span>
              <button
                type="button"
                onClick={() => setShowDeactivateModal(true)}
                style={{ background: '#ffffff', border: '1.5px solid #fca5a5', color: '#dc2626', padding: '0.45rem 1rem', borderRadius: '10px', fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer' }}
              >
                Deactivate
              </button>
            </div>

            <div style={{ paddingTop: '0.85rem', borderTop: '1px solid #fee2e2' }}>
              <strong style={{ fontSize: '0.84rem', color: '#dc2626', display: 'block' }}>Delete Account</strong>
              <span style={{ fontSize: '0.74rem', color: '#64748b', display: 'block', marginBottom: '8px' }}>Permanently delete your account and all data.</span>
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                style={{ background: '#dc2626', color: '#ffffff', border: 'none', padding: '0.5rem 1.1rem', borderRadius: '10px', fontSize: '0.78rem', fontWeight: '800', cursor: 'pointer' }}
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* ── MODAL 1: 2FA Enable Modal ───────────────────────────────────────── */}
      {show2FAModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: '1rem' }}>
          <div style={{ width: '460px', background: '#ffffff', borderRadius: '24px', padding: '1.75rem', boxShadow: '0 25px 60px rgba(15,23,42,0.2)', border: '1px solid #e2e8f0', textAlign: 'center' }}>
            <div style={{ width: '54px', height: '54px', borderRadius: '50%', background: '#ede9fe', color: '#7c3aed', margin: '0 auto 1rem auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Shield size={26} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
              {twoFactorEnabled ? 'Disable 2-Factor Authentication?' : 'Enable 2-Factor Authentication'}
            </h3>
            <p style={{ fontSize: '0.84rem', color: '#64748b', marginTop: '6px', lineHeight: '1.45' }}>
              {twoFactorEnabled
                ? 'Disabling 2FA will lower your account security score.'
                : 'Protect your recruiter portal account using 6-digit OTP verification code.'}
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginTop: '1.25rem' }}>
              <button onClick={() => setShow2FAModal(false)} style={{ padding: '0.7rem 1.3rem', borderRadius: '10px', background: '#f1f5f9', border: 'none', color: '#475569', fontWeight: '700', cursor: 'pointer' }}>
                Cancel
              </button>
              <button
                onClick={() => {
                  setTwoFactorEnabled(!twoFactorEnabled);
                  setShow2FAModal(false);
                  triggerToast(twoFactorEnabled ? '2FA disabled.' : '🎉 2FA OTP security enabled successfully!');
                }}
                style={{ padding: '0.7rem 1.5rem', borderRadius: '10px', background: '#6366f1', color: '#ffffff', border: 'none', fontWeight: '800', cursor: 'pointer' }}
              >
                {twoFactorEnabled ? 'Confirm Disable' : 'Enable 2FA Security'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 2: Login Activity Log Modal ────────────────────────────────── */}
      {showLoginActivityModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: '1rem' }}>
          <div style={{ width: '560px', background: '#ffffff', borderRadius: '24px', padding: '1.75rem', boxShadow: '0 25px 60px rgba(15,23,42,0.2)', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Recent Login History</h3>
              <button onClick={() => setShowLoginActivityModal(false)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={18} color="#64748b" />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ fontSize: '0.86rem', color: '#0f172a', display: 'block' }}>Windows PC — Chrome Browser</strong>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>IP: 103.21.124.5 &bull; Bengaluru, India</span>
                </div>
                <span style={{ background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '10px', fontSize: '0.72rem', fontWeight: '800' }}>Active Now</span>
              </div>

              <div style={{ background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ fontSize: '0.86rem', color: '#0f172a', display: 'block' }}>Android Smartphone — Mobile Web</strong>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>IP: 49.37.18.92 &bull; Yesterday 4:15 PM</span>
                </div>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Logged Out</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
              <button onClick={() => setShowLoginActivityModal(false)} style={{ padding: '0.65rem 1.4rem', borderRadius: '10px', background: '#6366f1', color: '#ffffff', border: 'none', fontWeight: '800', cursor: 'pointer' }}>
                Close Log
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 3: Active Sessions Modal ───────────────────────────────────── */}
      {showActiveSessionsModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: '1rem' }}>
          <div style={{ width: '560px', background: '#ffffff', borderRadius: '24px', padding: '1.75rem', boxShadow: '0 25px 60px rgba(15,23,42,0.2)', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Active Logged-in Sessions</h3>
              <button onClick={() => setShowActiveSessionsModal(false)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={18} color="#64748b" />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Laptop size={22} color="#6366f1" />
                  <div>
                    <strong style={{ fontSize: '0.86rem', color: '#0f172a', display: 'block' }}>This Device (Windows 11)</strong>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Chrome 128.0 &bull; Session Token Active</span>
                  </div>
                </div>
                <span style={{ background: '#dcfce7', color: '#15803d', padding: '3px 9px', borderRadius: '10px', fontSize: '0.72rem', fontWeight: '800' }}>Current</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
              <button onClick={() => { setShowActiveSessionsModal(false); triggerToast('Logged out from all other devices.'); }} style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '0.6rem 1.1rem', borderRadius: '10px', fontSize: '0.82rem', fontWeight: '800', cursor: 'pointer' }}>
                Log Out Other Sessions
              </button>
              <button onClick={() => setShowActiveSessionsModal(false)} style={{ padding: '0.6rem 1.3rem', borderRadius: '10px', background: '#6366f1', color: '#ffffff', border: 'none', fontWeight: '800', cursor: 'pointer' }}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 4: Deactivate Confirmation Modal ──────────────────────────── */}
      {showDeactivateModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: '1rem' }}>
          <div style={{ width: '460px', background: '#ffffff', borderRadius: '24px', padding: '1.75rem', boxShadow: '0 25px 60px rgba(15,23,42,0.2)', border: '1px solid #e2e8f0', textAlign: 'center' }}>
            <div style={{ width: '54px', height: '54px', borderRadius: '50%', background: '#fee2e2', color: '#dc2626', margin: '0 auto 1rem auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={26} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
              Deactivate Recruiter Account?
            </h3>
            <p style={{ fontSize: '0.84rem', color: '#64748b', marginTop: '6px', lineHeight: '1.45' }}>
              Deactivating will temporarily unpublish your active job posts. You can reactivate anytime by logging back in.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginTop: '1.25rem' }}>
              <button onClick={() => setShowDeactivateModal(false)} style={{ padding: '0.7rem 1.3rem', borderRadius: '10px', background: '#f1f5f9', border: 'none', color: '#475569', fontWeight: '700', cursor: 'pointer' }}>
                Cancel
              </button>
              <button
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

      {/* ── MODAL 5: Delete Account Confirmation Modal ──────────────────────── */}
      {showDeleteModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: '1rem' }}>
          <div style={{ width: '460px', background: '#ffffff', borderRadius: '24px', padding: '1.75rem', boxShadow: '0 25px 60px rgba(15,23,42,0.2)', border: '1px solid #e2e8f0', textAlign: 'center' }}>
            <div style={{ width: '54px', height: '54px', borderRadius: '50%', background: '#fef2f2', color: '#dc2626', margin: '0 auto 1rem auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldAlert size={26} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#dc2626', margin: 0 }}>
              Permanently Delete Account?
            </h3>
            <p style={{ fontSize: '0.84rem', color: '#64748b', marginTop: '6px', lineHeight: '1.45' }}>
              This action is permanent and cannot be undone. All your job listings and applicant records will be permanently removed.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginTop: '1.25rem' }}>
              <button onClick={() => setShowDeleteModal(false)} style={{ padding: '0.7rem 1.3rem', borderRadius: '10px', background: '#f1f5f9', border: 'none', color: '#475569', fontWeight: '700', cursor: 'pointer' }}>
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  logout();
                }}
                style={{ padding: '0.7rem 1.5rem', borderRadius: '10px', background: '#dc2626', color: '#ffffff', border: 'none', fontWeight: '800', cursor: 'pointer' }}
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
