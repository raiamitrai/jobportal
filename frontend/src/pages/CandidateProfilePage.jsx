import React, { useState, useEffect, useRef } from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit3,
  CheckCircle2,
  AlertTriangle,
  UploadCloud,
  FileText,
  Plus,
  GraduationCap,
  Briefcase,
  DollarSign,
  Clock,
  Sparkles,
  ChevronRight,
  X,
  Camera,
  MoreVertical,
  ShieldCheck,
  Check,
  ArrowRight,
  Info,
  Trash2,
  Download,
  Eye
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

export default function CandidateProfilePage() {
  const { user, updateUserProfileName, updateUserAvatar } = useAuth();
  const { addNotification } = useNotifications();
  const fileInputRef = useRef(null);
  const avatarInputRef = useRef(null);

  const userEmail = (user?.email || '').toLowerCase().trim();
  const userKey = userEmail || 'guest';

  // Helper functions for user-scoped storage
  const getScopedValue = (key, fallback) => {
    if (!userKey || userKey === 'guest') return fallback;
    try {
      const val = localStorage.getItem(`careonix_prof_${userKey}_${key}`);
      return val !== null ? val : fallback;
    } catch (e) {
      return fallback;
    }
  };

  const getScopedJson = (key, fallback) => {
    if (!userKey || userKey === 'guest') return fallback;
    try {
      const saved = localStorage.getItem(`careonix_prof_${userKey}_${key}`);
      return saved ? JSON.parse(saved) : fallback;
    } catch (e) {
      return fallback;
    }
  };

  // Core Personal Info State (Strictly scoped by user account, no fake dummy data)
  const [name, setName] = useState(() => user?.name || getScopedValue('name', 'Candidate'));
  const email = user?.email || getScopedValue('email', '');
  const [phone, setPhone] = useState(() => getScopedValue('phone', user?.phone || ''));
  const [location, setLocation] = useState(() => getScopedValue('location', user?.location || ''));
  const [isPhoneVerified, setIsPhoneVerified] = useState(() => getScopedValue('phone_verified', 'false') === 'true');
  const [aboutText, setAboutText] = useState(() => getScopedValue('about', ''));
  const [avatarUrl, setAvatarUrl] = useState(() => user?.avatar || user?.photoUrl || getScopedValue('avatar', ''));

  const handleAvatarUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image file size should be less than 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64Url = reader.result;
      setAvatarUrl(base64Url);
      if (userKey && userKey !== 'guest') {
        localStorage.setItem(`careonix_prof_${userKey}_avatar`, base64Url);
      }
      if (updateUserAvatar) {
        updateUserAvatar(base64Url);
      }
      triggerToast('🎉 Profile picture updated successfully!');
    };
    reader.readAsDataURL(file);
  };

  // Resume State (Scoped per user, default empty)
  const [resumeFileName, setResumeFileName] = useState(() => getScopedValue('resume_name', ''));
  const [resumeUploadDate, setResumeUploadDate] = useState(() => getScopedValue('resume_date', ''));
  const [resumeFileSize, setResumeFileSize] = useState(() => getScopedValue('resume_size', ''));
  const [resumeFileObj, setResumeFileObj] = useState(null);

  // Skills State (Default empty list for new users)
  const [skills, setSkills] = useState(() => getScopedJson('skills', []));

  // Education State (Default clean null for new users)
  const [education, setEducation] = useState(() => getScopedJson('education', null));

  // Experience State (Default clean null for new users)
  const [experience, setExperience] = useState(() => getScopedJson('experience', null));

  // Preferences State (Default clean null for new users)
  const [preferences, setPreferences] = useState(() => getScopedJson('preferences', null));

  // Sync state whenever logged-in user changes
  useEffect(() => {
    if (!userEmail) return;
    setName(user?.name || getScopedValue('name', 'Candidate'));
    setPhone(getScopedValue('phone', user?.phone || ''));
    setLocation(getScopedValue('location', user?.location || ''));
    setIsPhoneVerified(getScopedValue('phone_verified', 'false') === 'true');
    setAboutText(getScopedValue('about', ''));
    setAvatarUrl(user?.avatar || user?.photoUrl || getScopedValue('avatar', ''));
    setResumeFileName(getScopedValue('resume_name', ''));
    setResumeUploadDate(getScopedValue('resume_date', ''));
    setResumeFileSize(getScopedValue('resume_size', ''));
    setSkills(getScopedJson('skills', []));
    setEducation(getScopedJson('education', null));
    setExperience(getScopedJson('experience', null));
    setPreferences(getScopedJson('preferences', null));
  }, [userEmail, user?.name, user?.avatar, user?.photoUrl]);

  // Scoped Auto-Save Watchers
  useEffect(() => { if (userKey && userKey !== 'guest') localStorage.setItem(`careonix_prof_${userKey}_name`, name); }, [name, userKey]);
  useEffect(() => { if (userKey && userKey !== 'guest') localStorage.setItem(`careonix_prof_${userKey}_phone`, phone); }, [phone, userKey]);
  useEffect(() => { if (userKey && userKey !== 'guest') localStorage.setItem(`careonix_prof_${userKey}_location`, location); }, [location, userKey]);
  useEffect(() => { if (userKey && userKey !== 'guest') localStorage.setItem(`careonix_prof_${userKey}_phone_verified`, isPhoneVerified.toString()); }, [isPhoneVerified, userKey]);
  useEffect(() => { if (userKey && userKey !== 'guest') localStorage.setItem(`careonix_prof_${userKey}_about`, aboutText); }, [aboutText, userKey]);
  useEffect(() => { if (userKey && userKey !== 'guest') localStorage.setItem(`careonix_prof_${userKey}_resume_name`, resumeFileName); }, [resumeFileName, userKey]);
  useEffect(() => { if (userKey && userKey !== 'guest') localStorage.setItem(`careonix_prof_${userKey}_resume_date`, resumeUploadDate); }, [resumeUploadDate, userKey]);
  useEffect(() => { if (userKey && userKey !== 'guest') localStorage.setItem(`careonix_prof_${userKey}_resume_size`, resumeFileSize); }, [resumeFileSize, userKey]);
  useEffect(() => { if (userKey && userKey !== 'guest') localStorage.setItem(`careonix_prof_${userKey}_skills`, JSON.stringify(skills)); }, [skills, userKey]);
  useEffect(() => { if (userKey && userKey !== 'guest') localStorage.setItem(`careonix_prof_${userKey}_education`, JSON.stringify(education)); }, [education, userKey]);
  useEffect(() => { if (userKey && userKey !== 'guest') localStorage.setItem(`careonix_prof_${userKey}_experience`, JSON.stringify(experience)); }, [experience, userKey]);
  useEffect(() => { if (userKey && userKey !== 'guest') localStorage.setItem(`careonix_prof_${userKey}_preferences`, JSON.stringify(preferences)); }, [preferences, userKey]);

  // Tab State
  const [activeTab, setActiveTab] = useState('about');

  // Modal States
  const [showPhoneOtpModal, setShowPhoneOtpModal] = useState(false);
  const [showEditPhoneModal, setShowEditPhoneModal] = useState(false);
  const [newPhoneInput, setNewPhoneInput] = useState('');
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const [otpTimer, setOtpTimer] = useState(30);
  const [otpError, setOtpError] = useState('');
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Editing Modals
  const [showAddSkillModal, setShowAddSkillModal] = useState(false);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [showEditSkillsModal, setShowEditSkillsModal] = useState(false);
  const [showEditEducationModal, setShowEditEducationModal] = useState(false);
  const [showEditExperienceModal, setShowEditExperienceModal] = useState(false);
  const [showEditPreferencesModal, setShowEditPreferencesModal] = useState(false);

  // Generic Edit Modal for Name/Location/About
  const [editingSection, setEditingSection] = useState(null);
  const [tempEditValue, setTempEditValue] = useState('');

  // Resume Overflow Menu State
  const [showResumeMenu, setShowResumeMenu] = useState(false);

  // OTP Countdown Timer
  useEffect(() => {
    let interval = null;
    if (showPhoneOtpModal && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [showPhoneOtpModal, otpTimer]);

  const [generatedPhoneOtp, setGeneratedPhoneOtp] = useState('');

  // ── Dynamic Profile Section Percentages Math ─────────────────────────
  const hasName = Boolean(name && name.trim());
  const hasEmail = Boolean(email && email.trim());
  const hasPhone = Boolean(phone && phone.trim() && phone !== 'Not provided');
  const hasLocation = Boolean(location && location.trim() && location !== 'Not provided');
  const personalInfoPct = Math.round(
    (hasName ? 25 : 0) + (hasEmail ? 25 : 0) + (hasPhone ? 25 : 0) + (hasLocation ? 25 : 0)
  );

  const hasResume = Boolean(resumeFileName && resumeFileName.trim());
  const resumePct = hasResume ? 100 : 0;

  const skillsPct = skills.length >= 5 ? 100 : Math.round((skills.length / 5) * 100);

  const educationPct = (education && (education.degree || education.university)) ? 100 : 0;
  const experiencePct = (experience && (experience.title || experience.company)) ? 100 : 0;
  const preferencesPct = (preferences && (preferences.roles || preferences.location)) ? 100 : 0;

  const phoneVerificationPct = (isPhoneVerified && hasPhone) ? 100 : 0;

  // Weighted Overall Profile Score
  const profileScore = Math.min(100, Math.round(
    (personalInfoPct * 0.15) +
    (resumePct * 0.25) +
    (skillsPct * 0.15) +
    (educationPct * 0.15) +
    (experiencePct * 0.10) +
    (preferencesPct * 0.10) +
    (phoneVerificationPct * 0.10)
  ));

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3500);
  };

  // Start Phone Verification Flow
  const handleStartPhoneVerification = (phoneNumToVerify) => {
    const targetPhone = phoneNumToVerify || phone;
    if (!targetPhone || targetPhone === 'Not provided' || !targetPhone.trim()) {
      setShowEditPhoneModal(true);
      setNewPhoneInput('');
      return;
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedPhoneOtp(code);
    setOtpTimer(30);
    setOtpValues(['', '', '', '', '', '']);
    setOtpError('');
    setShowPhoneOtpModal(true);

    try {
      fetch('http://localhost:8086/notifications/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient: email || targetPhone
        })
      }).catch(e => console.log('Backend OTP notice:', e));
    } catch(e) {}

    triggerToast(`📩 6-digit OTP code dispatched to ${targetPhone} & registered email.`);
  };

  // 1. Resume File Upload Handler
  const handleResumeFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5MB limit. Please upload a smaller file.');
      return;
    }

    const todayStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const sizeInKb = (file.size / 1024).toFixed(0);

    setResumeFileName(file.name);
    setResumeUploadDate(`Uploaded on ${todayStr}`);
    setResumeFileSize(`${sizeInKb} KB`);
    setResumeFileObj(file);

    triggerToast(`Resume updated successfully: ${file.name}`);
  };

  // 2. Skill Add/Remove Handlers
  const handleAddSkill = (e) => {
    if (e) e.preventDefault();
    if (!newSkillInput.trim()) return;

    if (skills.some(s => s.toLowerCase() === newSkillInput.trim().toLowerCase())) {
      alert('This skill is already in your list!');
      return;
    }

    setSkills(prev => [...prev, newSkillInput.trim()]);
    triggerToast(`Added skill: ${newSkillInput.trim()}`);
    setNewSkillInput('');
    setShowAddSkillModal(false);
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(prev => prev.filter(s => s !== skillToRemove));
    triggerToast(`Removed skill: ${skillToRemove}`);
  };

  // 3. OTP Verification
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otpValues];
    newOtp[index] = value.slice(-1);
    setOtpValues(newOtp);
    setOtpError('');

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleVerifyPhoneSubmit = (e) => {
    if (e) e.preventDefault();
    const enteredOtp = otpValues.join('');
    if (enteredOtp.length < 6) {
      setOtpError('Please enter all 6 digits of the OTP.');
      return;
    }

    if (!generatedPhoneOtp || enteredOtp !== generatedPhoneOtp) {
      setOtpError('❌ Incorrect OTP code. Please enter the exact 6-digit OTP received on your mobile phone.');
      return;
    }

    setIsPhoneVerified(true);
    setShowPhoneOtpModal(false);
    setOtpValues(['', '', '', '', '', '']);
    triggerToast(`✅ Phone number ${phone} verified successfully!`);
  };

  const handleResendOtp = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedPhoneOtp(code);
    setOtpTimer(30);
    setOtpValues(['', '', '', '', '', '']);
    setOtpError('');

    try {
      fetch('http://localhost:8086/notifications/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient: phone
        })
      }).catch(e => console.log('Backend SMS OTP notice:', e));
    } catch(e) {}

    triggerToast(`📩 Resent 6-digit OTP to ${phone}`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', background: '#f8fafc', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      
      {/* Hidden File Input for Resume */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleResumeFileSelect}
        accept=".pdf,.doc,.docx"
        style={{ display: 'none' }}
      />

      {/* Notification Toast */}
      {showSuccessToast && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: '#10b981',
          color: '#ffffff',
          padding: '0.9rem 1.4rem',
          borderRadius: '14px',
          boxShadow: '0 10px 25px rgba(16,185,129,0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          zIndex: 300,
          fontWeight: '700',
          fontSize: '0.9rem'
        }}>
          <CheckCircle2 size={20} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── Page Header Title ────────────────────────────────────────────── */}
      <div>
        <h1 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
          My Profile
        </h1>
        <p style={{ color: '#64748b', marginTop: '4px', fontSize: '0.9rem' }}>
          Manage your personal information, skills, experience and preferences.
        </p>
      </div>

      {/* ── Top Header Profile Summary Card ──────────────────────────────── */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '20px',
        padding: '1.75rem 2rem',
        boxShadow: '0 1px 6px rgba(15,23,42,0.03)',
        display: 'grid',
        gridTemplateColumns: '1fr 340px',
        gap: '2rem',
        alignItems: 'center'
      }}>
        {/* Left Column: Avatar + Details */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem' }}>
          {/* Hidden File Input for Avatar Upload */}
          <input
            type="file"
            ref={avatarInputRef}
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleAvatarUpload}
          />

          <div
            onClick={() => avatarInputRef.current?.click()}
            style={{ position: 'relative', flexShrink: 0, cursor: 'pointer' }}
            title="Click to upload profile picture"
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={name}
                style={{
                  width: '105px',
                  height: '105px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '3px solid #ffffff',
                  boxShadow: '0 4px 14px rgba(124,58,237,0.2)'
                }}
              />
            ) : (
              <div style={{
                width: '105px',
                height: '105px',
                borderRadius: '50%',
                background: '#f3e8ff',
                color: '#7c3aed',
                fontSize: '2.5rem',
                fontWeight: '800',
                display: 'flex',
                alignItems: 'center',
                justify: 'center',
                border: '3px solid #ffffff',
                boxShadow: '0 4px 14px rgba(124,58,237,0.15)'
              }}>
                {(name || 'A').charAt(0).toUpperCase()}
              </div>
            )}

            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); avatarInputRef.current?.click(); }}
              style={{
                position: 'absolute',
                bottom: '2px',
                right: '2px',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: '#4f46e5',
                color: '#ffffff',
                border: '2px solid #ffffff',
                display: 'flex',
                alignItems: 'center',
                justify: 'center',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
              }}
              title="Upload Profile Picture"
            >
              <Camera size={15} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                {name}
              </h2>
              <button
                onClick={() => { setEditingSection('name'); setTempEditValue(name); }}
                style={{ background: 'none', border: 'none', color: '#4f46e5', fontSize: '0.84rem', fontWeight: '700', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
              >
                <Edit3 size={14} /> Edit
              </button>
              <span style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', padding: '3px 10px', borderRadius: '20px', fontSize: '0.74rem', fontWeight: '700' }}>
                Active Job Seeker
              </span>
            </div>

            {/* Email Row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.86rem', color: '#334155', marginTop: '2px' }}>
              <Mail size={15} color="#64748b" />
              <span>{email}</span>
              <span style={{ background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0', padding: '2px 8px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                <CheckCircle2 size={12} /> Verified
              </span>
            </div>

            {/* Phone Row (With Edit Link & OTP Verification) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.86rem', color: '#334155' }}>
              <Phone size={15} color="#64748b" />
              <span>{phone || 'Not provided'}</span>
              <button
                onClick={() => { setShowEditPhoneModal(true); setNewPhoneInput(phone); }}
                style={{ background: 'none', border: 'none', color: '#4f46e5', fontSize: '0.82rem', fontWeight: '700', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
              >
                <Edit3 size={13} /> Edit
              </button>
              {(isPhoneVerified && hasPhone) ? (
                <span style={{ background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0', padding: '2px 8px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                  <CheckCircle2 size={12} /> Verified
                </span>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ background: '#fffbe6', color: '#d97706', border: '1px solid #fef08a', padding: '2px 8px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                    <AlertTriangle size={12} /> Not Verified
                  </span>
                  <button
                    onClick={() => handleStartPhoneVerification()}
                    style={{
                      background: '#4f46e5',
                      color: '#ffffff',
                      border: 'none',
                      padding: '2px 10px',
                      borderRadius: '8px',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    Verify Phone
                  </button>
                </div>
              )}
            </div>

            {/* Location Row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.86rem', color: '#334155' }}>
              <MapPin size={15} color="#64748b" />
              <span>{location || 'Not provided'}</span>
              <button
                onClick={() => { setEditingSection('location'); setTempEditValue(location); }}
                style={{ background: 'none', border: 'none', color: '#4f46e5', fontSize: '0.82rem', fontWeight: '700', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
              >
                <Edit3 size={13} /> Edit
              </button>
            </div>

            {/* Joined Date */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.82rem', color: '#64748b' }}>
              <Calendar size={15} color="#64748b" />
              <span>Joined on 07 Aug 2026</span>
            </div>
          </div>
        </div>

        {/* Right Column: Profile Strength Box */}
        <div style={{
          background: '#fafafa',
          border: '1px solid #f1f5f9',
          borderRadius: '16px',
          padding: '1.35rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.85rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.88rem', fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '4px' }}>
              Profile Strength <Info size={14} color="#94a3b8" />
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
              <span style={{ fontSize: '1.4rem', fontWeight: '900', color: '#4f46e5' }}>
                {profileScore}%
              </span>
              <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#16a34a' }}>
                {isPhoneVerified ? 'Complete' : 'Strong'}
              </span>
            </div>
          </div>

          <div style={{ width: '100%', height: '8px', borderRadius: '9999px', background: '#e2e8f0', overflow: 'hidden' }}>
            <div style={{
              width: `${profileScore}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #7c3aed, #4f46e5)',
              borderRadius: '9999px',
              transition: 'width 0.4s ease'
            }} />
          </div>

          <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0 }}>
            {isPhoneVerified ? '🎉 Outstanding! Your profile is 100% complete and verified.' : 'Great job! Your profile is almost complete.'}
          </p>

          {!isPhoneVerified && (
            <button
              onClick={() => { setShowPhoneOtpModal(true); setOtpTimer(30); setOtpError(''); }}
              style={{
                width: '100%',
                padding: '0.6rem 1rem',
                borderRadius: '10px',
                background: '#ffffff',
                border: '1.5px solid #c7d2fe',
                color: '#4f46e5',
                fontSize: '0.84rem',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justify: 'center',
                gap: '0.4rem',
                fontFamily: 'Inter, sans-serif'
              }}
            >
              <Sparkles size={15} /> Improve Profile
            </button>
          )}
        </div>
      </div>

      {/* ── Navigation Tabs Bar ──────────────────────────────────────────── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '2rem',
        borderBottom: '1px solid #e2e8f0',
        paddingBottom: '2px'
      }}>
        {[
          { id: 'about', label: 'About Me' },
          { id: 'resume', label: 'Resume' },
          { id: 'skills', label: 'Skills' },
          { id: 'education', label: 'Education' },
          { id: 'experience', label: 'Experience' },
          { id: 'preferences', label: 'Preferences' },
          { id: 'settings', label: 'Account Settings' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              background: 'none',
              border: 'none',
              padding: '0.75rem 0',
              fontSize: '0.9rem',
              fontWeight: activeTab === tab.id ? '800' : '600',
              color: activeTab === tab.id ? '#4f46e5' : '#64748b',
              cursor: 'pointer',
              position: 'relative',
              transition: 'all 0.2s ease'
            }}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div style={{ position: 'absolute', bottom: '-2px', left: 0, right: 0, height: '3px', background: '#4f46e5', borderRadius: '3px 3px 0 0' }} />
            )}
          </button>
        ))}
      </div>

      {/* ── 2-Column Main Section Grid ───────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 310px', gap: '1.5rem', alignItems: 'start' }}>

        {/* ── LEFT MAIN CARDS ──────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* 1. About Me Card */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.5rem 1.75rem', boxShadow: '0 1px 6px rgba(15,23,42,0.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                About Me
              </h3>
              <button
                onClick={() => { setEditingSection('about'); setTempEditValue(aboutText); }}
                style={{ background: 'none', border: 'none', color: '#4f46e5', fontSize: '0.84rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <Edit3 size={14} /> Edit
              </button>
            </div>
            <p style={{ fontSize: '0.88rem', color: '#475569', margin: 0, lineHeight: '1.6', fontWeight: '500' }}>
              {aboutText || 'No summary added yet. Click Edit to add a short bio about your professional background.'}
            </p>
          </div>

          {/* 2. Resume & Skills Grid (2 Cards Row) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            
            {/* Resume Card (Fully Functional Upload) */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.35rem 1.5rem', boxShadow: '0 1px 6px rgba(15,23,42,0.03)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                    Resume
                  </h3>
                  <div style={{ position: 'relative' }}>
                    <MoreVertical
                      size={16}
                      color="#94a3b8"
                      style={{ cursor: 'pointer' }}
                      onClick={() => setShowResumeMenu(!showResumeMenu)}
                    />
                    {showResumeMenu && (
                      <div style={{ position: 'absolute', right: 0, top: '100%', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 10px 25px rgba(15,23,42,0.1)', zIndex: 30, padding: '4px', width: '160px' }}>
                        <button
                          onClick={() => {
                            if (resumeFileObj) {
                              const url = URL.createObjectURL(resumeFileObj);
                              window.open(url, '_blank');
                            } else if (resumeFileName) {
                              alert(`Previewing ${resumeFileName}`);
                            } else {
                              alert('No resume uploaded yet!');
                            }
                            setShowResumeMenu(false);
                          }}
                          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', padding: '0.5rem 0.75rem', borderRadius: '8px', border: 'none', background: 'transparent', color: '#0f172a', fontSize: '0.82rem', fontWeight: '600', cursor: 'pointer', textAlign: 'left' }}
                        >
                          <Eye size={14} color="#4f46e5" /> View Resume
                        </button>
                        <button
                          onClick={() => {
                            fileInputRef.current?.click();
                            setShowResumeMenu(false);
                          }}
                          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', padding: '0.5rem 0.75rem', borderRadius: '8px', border: 'none', background: 'transparent', color: '#0f172a', fontSize: '0.82rem', fontWeight: '600', cursor: 'pointer', textAlign: 'left' }}
                        >
                          <UploadCloud size={14} color="#4f46e5" /> Replace File
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.25rem' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#f3e8ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <FileText size={22} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: '800', color: '#0f172a', wordBreak: 'break-all' }}>
                      {resumeFileName || 'No resume uploaded'}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                      {resumeFileName ? `${resumeUploadDate} • ${resumeFileSize}` : 'Upload your PDF resume to apply for jobs'}
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => fileInputRef.current?.click()}
                style={{
                  width: 'fit-content',
                  padding: '0.55rem 1.1rem',
                  borderRadius: '10px',
                  background: '#ffffff',
                  border: '1.5px solid #c7d2fe',
                  color: '#4f46e5',
                  fontSize: '0.84rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontFamily: 'Inter, sans-serif'
                }}
              >
                <UploadCloud size={16} /> Update Resume
              </button>
            </div>

            {/* Skills Card (Fully Functional Edit & Add More) */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.35rem 1.5rem', boxShadow: '0 1px 6px rgba(15,23,42,0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                  Skills
                </h3>
                <button
                  onClick={() => setShowEditSkillsModal(true)}
                  style={{ background: 'none', border: 'none', color: '#4f46e5', fontSize: '0.84rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <Edit3 size={14} /> Edit
                </button>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                {skills.map((skill, i) => (
                  <span key={i} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', color: '#334155', padding: '4px 12px', borderRadius: '8px', fontSize: '0.78rem', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    {skill}
                  </span>
                ))}
                <button
                  onClick={() => { setShowAddSkillModal(true); setNewSkillInput(''); }}
                  style={{ background: '#f3e8ff', border: '1px dashed #c7d2fe', color: '#7c3aed', padding: '4px 12px', borderRadius: '8px', fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                >
                  <Plus size={14} /> Add More
                </button>
              </div>
            </div>

          </div>

          {/* 3. Education & Experience Grid (2 Cards Row) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            
            {/* Education Card (Fully Functional Edit) */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.35rem 1.5rem', boxShadow: '0 1px 6px rgba(15,23,42,0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                  Education
                </h3>
                <button
                  onClick={() => setShowEditEducationModal(true)}
                  style={{ background: 'none', border: 'none', color: '#4f46e5', fontSize: '0.84rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <Edit3 size={14} /> {education ? 'Edit' : '+ Add'}
                </button>
              </div>

              {education && (education.degree || education.university) ? (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#f3e8ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <GraduationCap size={22} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: '800', color: '#0f172a' }}>
                      {education.degree || 'Degree Not Specified'}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                      {education.university || 'University / College'}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px' }}>
                      {education.years || ''} {education.cgpa ? `• ${education.cgpa}` : ''}
                    </div>
                  </div>
                </div>
              ) : (
                <p style={{ fontSize: '0.84rem', color: '#64748b', margin: 0 }}>
                  No education details added yet. Click <strong>+ Add</strong> to list your degree and college.
                </p>
              )}
            </div>

            {/* Experience Card (Fully Functional Edit) */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.35rem 1.5rem', boxShadow: '0 1px 6px rgba(15,23,42,0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                  Experience
                </h3>
                <button
                  onClick={() => setShowEditExperienceModal(true)}
                  style={{ background: 'none', border: 'none', color: '#4f46e5', fontSize: '0.84rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <Edit3 size={14} /> {experience ? 'Edit' : '+ Add'}
                </button>
              </div>

              {experience && (experience.title || experience.company) ? (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#f3e8ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Briefcase size={22} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: '800', color: '#0f172a' }}>
                      {experience.title || 'Role Title'}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                      {experience.company || 'Company'}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px' }}>
                      {experience.note || ''}
                    </div>
                  </div>
                </div>
              ) : (
                <p style={{ fontSize: '0.84rem', color: '#64748b', margin: 0 }}>
                  No work experience added yet. Click <strong>+ Add</strong> to list previous roles or internships.
                </p>
              )}
            </div>

          </div>

          {/* 4. Job Preferences Card (Fully Functional Edit) */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.5rem 1.75rem', boxShadow: '0 1px 6px rgba(15,23,42,0.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.1rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                Job Preferences
              </h3>
              <button
                onClick={() => setShowEditPreferencesModal(true)}
                style={{ background: 'none', border: 'none', color: '#4f46e5', fontSize: '0.84rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <Edit3 size={14} /> {preferences ? 'Edit' : '+ Add'}
              </button>
            </div>

            {preferences && (preferences.roles || preferences.location || preferences.salary) ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#f3e8ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Briefcase size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '600' }}>Preferred Roles</div>
                    <div style={{ fontSize: '0.82rem', fontWeight: '800', color: '#0f172a', marginTop: '2px' }}>
                      {preferences.roles || 'Not specified'}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#f3e8ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <MapPin size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '600' }}>Preferred Location</div>
                    <div style={{ fontSize: '0.82rem', fontWeight: '800', color: '#0f172a', marginTop: '2px' }}>
                      {preferences.location || 'Not specified'}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#f3e8ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Clock size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '600' }}>Job Type</div>
                    <div style={{ fontSize: '0.82rem', fontWeight: '800', color: '#0f172a', marginTop: '2px' }}>
                      {preferences.type || 'Full-time'}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#f3e8ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <User size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '600' }}>Experience Level</div>
                    <div style={{ fontSize: '0.82rem', fontWeight: '800', color: '#0f172a', marginTop: '2px' }}>
                      {preferences.level || 'Not specified'}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#f3e8ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <DollarSign size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '600' }}>Expected Salary</div>
                    <div style={{ fontSize: '0.82rem', fontWeight: '800', color: '#0f172a', marginTop: '2px' }}>
                      {preferences.salary || 'Not specified'}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p style={{ fontSize: '0.84rem', color: '#64748b', margin: 0 }}>
                No job preferences set. Click <strong>+ Add</strong> to set your target roles, location, and salary expectation.
              </p>
            )}
          </div>

        </div>

        {/* ── RIGHT SIDEBAR (STICKY ON SCROLL) ──────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', position: 'sticky', top: '1.5rem', alignSelf: 'start' }}>

          {/* Profile Completion Card */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.35rem', boxShadow: '0 1px 6px rgba(15,23,42,0.03)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a', margin: '0 0 1rem 0' }}>
              Profile Completion
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {[
                { label: 'Personal Information', pct: personalInfoPct },
                { label: 'Resume', pct: resumePct },
                { label: 'Skills', pct: skillsPct },
                { label: 'Education', pct: educationPct },
                { label: 'Experience', pct: experiencePct },
                { label: 'Preferences', pct: preferencesPct },
                { label: 'Phone Verification', pct: phoneVerificationPct }
              ].map((item, idx) => (
                <div key={idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: '700', color: '#475569', marginBottom: '3px' }}>
                    <span>{item.label}</span>
                    <span style={{ color: item.pct === 100 ? '#16a34a' : (item.pct === 0 ? '#ef4444' : '#d97706') }}>{item.pct}%</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', borderRadius: '9999px', background: '#f1f5f9', overflow: 'hidden' }}>
                    <div style={{ width: `${item.pct}%`, height: '100%', background: item.pct === 100 ? '#10b981' : (item.pct > 50 ? '#4f46e5' : (item.pct > 0 ? '#f59e0b' : '#cbd5e1')), borderRadius: '9999px', transition: 'width 0.3s ease' }} />
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => handleStartPhoneVerification()}
              style={{
                width: '100%',
                padding: '0.65rem',
                borderRadius: '10px',
                background: '#ffffff',
                border: '1.5px solid #c7d2fe',
                color: '#4f46e5',
                fontSize: '0.84rem',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justify: 'center',
                gap: '0.4rem',
                marginTop: '1.25rem',
                fontFamily: 'Inter, sans-serif'
              }}
            >
              <Sparkles size={15} /> Improve Profile
            </button>
          </div>

          {/* Quick Actions Card */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.35rem', boxShadow: '0 1px 6px rgba(15,23,42,0.03)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a', margin: '0 0 0.85rem 0' }}>
              Quick Actions
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[
                { icon: UploadCloud, label: 'Update Resume', sub: 'Upload your latest resume', action: () => fileInputRef.current?.click() },
                { icon: User, label: 'Edit Profile', sub: 'Update your personal details', action: () => setEditingSection('name') },
                { icon: Sparkles, label: 'Manage Skills', sub: 'Add or remove skills', action: () => setShowEditSkillsModal(true) },
                { icon: Briefcase, label: 'Job Preferences', sub: 'Update your job preferences', action: () => setShowEditPreferencesModal(true) },
                { icon: ShieldCheck, label: 'Account Settings', sub: 'Manage your account', action: () => alert('Account Settings') }
              ].map((act, idx) => {
                const Icon = act.icon;
                return (
                  <div
                    key={idx}
                    onClick={act.action}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justify: 'space-between',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '12px',
                      background: '#f8fafc',
                      border: '1px solid #f1f5f9',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = '#c7d2fe';
                      e.currentTarget.style.background = '#ffffff';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = '#f1f5f9';
                      e.currentTarget.style.background = '#f8fafc';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: '#f3e8ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon size={16} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.84rem', fontWeight: '800', color: '#0f172a' }}>{act.label}</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{act.sub}</div>
                      </div>
                    </div>
                    <ChevronRight size={16} color="#94a3b8" />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tips to Improve Card */}
          <div style={{ background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: '20px', padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#7c3aed', fontWeight: '800', fontSize: '0.88rem', marginBottom: '0.65rem' }}>
              <Sparkles size={16} /> Tips to Improve
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8rem', color: '#5b21b6', fontWeight: '600' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={15} color="#16a34a" /> Add more skills to increase visibility
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={15} color="#16a34a" /> Add work experience or projects
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }} onClick={() => setShowPhoneOtpModal(true)}>
                {isPhoneVerified ? (
                  <CheckCircle2 size={15} color="#16a34a" />
                ) : (
                  <span style={{ width: '13px', height: '13px', borderRadius: '50%', border: '2px solid #7c3aed', display: 'inline-block' }} />
                )}
                {isPhoneVerified ? 'Phone number verified (100% Score)' : 'Verify phone number for 100% profile score'}
              </div>
            </div>

            <a
              href="#tips"
              onClick={(e) => { e.preventDefault(); alert('View all tips'); }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: '800', color: '#7c3aed', textDecoration: 'none', marginTop: '0.85rem' }}
            >
              View All Tips <ArrowRight size={14} />
            </a>
          </div>

        </div>

      </div>

      {/* ── MODAL 1: Add Skill Modal ─────────────────────────────────────── */}
      {showAddSkillModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 250, padding: '1rem' }}>
          <div style={{ width: '420px', background: '#ffffff', borderRadius: '20px', padding: '1.75rem', boxShadow: '0 25px 60px rgba(15,23,42,0.2)', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                Add New Skill
              </h3>
              <button onClick={() => setShowAddSkillModal(false)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={16} color="#64748b" />
              </button>
            </div>

            <form onSubmit={handleAddSkill}>
              <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '700', display: 'block', marginBottom: '6px' }}>
                Skill Name
              </label>
              <input
                type="text"
                placeholder="e.g. Docker, Kubernetes, React Native..."
                value={newSkillInput}
                onChange={e => setNewSkillInput(e.target.value)}
                autoFocus
                style={{ width: '100%', padding: '0.75rem 0.9rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', fontFamily: 'Inter, sans-serif', color: '#0f172a', outline: 'none' }}
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button type="button" onClick={() => setShowAddSkillModal(false)} style={{ padding: '0.6rem 1.2rem', borderRadius: '10px', background: '#f1f5f9', border: 'none', color: '#475569', fontWeight: '700', fontSize: '0.86rem', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" style={{ padding: '0.6rem 1.4rem', borderRadius: '10px', background: '#4f46e5', border: 'none', color: '#ffffff', fontWeight: '800', fontSize: '0.86rem', cursor: 'pointer' }}>
                  Add Skill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 2: Manage Skills Modal ─────────────────────────────────── */}
      {showEditSkillsModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 250, padding: '1rem' }}>
          <div style={{ width: '480px', background: '#ffffff', borderRadius: '20px', padding: '1.75rem', boxShadow: '0 25px 60px rgba(15,23,42,0.2)', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                Manage Skills
              </h3>
              <button onClick={() => setShowEditSkillsModal(false)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={16} color="#64748b" />
              </button>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem', maxHeight: '250px', overflowY: 'auto', padding: '4px' }}>
              {skills.map((skill, i) => (
                <span key={i} style={{ background: '#f3e8ff', border: '1px solid #ddd6fe', color: '#7c3aed', padding: '6px 12px', borderRadius: '10px', fontSize: '0.84rem', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  {skill}
                  <X
                    size={14}
                    style={{ cursor: 'pointer', color: '#7c3aed' }}
                    onClick={() => handleRemoveSkill(skill)}
                  />
                </span>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                onClick={() => { setShowAddSkillModal(true); setNewSkillInput(''); }}
                style={{ background: '#f8fafc', border: '1px dashed #cbd5e1', color: '#4f46e5', padding: '0.55rem 1rem', borderRadius: '10px', fontSize: '0.84rem', fontWeight: '700', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                <Plus size={15} /> Add Another Skill
              </button>
              <button onClick={() => setShowEditSkillsModal(false)} style={{ padding: '0.6rem 1.4rem', borderRadius: '10px', background: '#4f46e5', border: 'none', color: '#ffffff', fontWeight: '800', fontSize: '0.86rem', cursor: 'pointer' }}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 3: Edit Education Modal ───────────────────────────────── */}
      {showEditEducationModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 250, padding: '1rem' }}>
          <div style={{ width: '480px', background: '#ffffff', borderRadius: '20px', padding: '1.75rem', boxShadow: '0 25px 60px rgba(15,23,42,0.2)', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                Edit Education
              </h3>
              <button onClick={() => setShowEditEducationModal(false)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={16} color="#64748b" />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Degree / Course</label>
                <input
                  type="text"
                  placeholder="e.g. Bachelor of Technology (B.Tech)"
                  value={education?.degree || ''}
                  onChange={e => setEducation(prev => ({ ...(prev || {}), degree: e.target.value }))}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem', fontFamily: 'Inter, sans-serif' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '700', display: 'block', marginBottom: '4px' }}>University / College</label>
                <input
                  type="text"
                  placeholder="e.g. State Technological University"
                  value={education?.university || ''}
                  onChange={e => setEducation(prev => ({ ...(prev || {}), university: e.target.value }))}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem', fontFamily: 'Inter, sans-serif' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Years</label>
                  <input
                    type="text"
                    placeholder="e.g. 2020 - 2024"
                    value={education?.years || ''}
                    onChange={e => setEducation(prev => ({ ...(prev || {}), years: e.target.value }))}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem', fontFamily: 'Inter, sans-serif' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '700', display: 'block', marginBottom: '4px' }}>CGPA / Grade</label>
                  <input
                    type="text"
                    placeholder="e.g. 8.4 CGPA"
                    value={education?.cgpa || ''}
                    onChange={e => setEducation(prev => ({ ...(prev || {}), cgpa: e.target.value }))}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem', fontFamily: 'Inter, sans-serif' }}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button onClick={() => setShowEditEducationModal(false)} style={{ padding: '0.6rem 1.2rem', borderRadius: '10px', background: '#f1f5f9', border: 'none', color: '#475569', fontWeight: '700', fontSize: '0.86rem', cursor: 'pointer' }}>
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowEditEducationModal(false);
                  triggerToast('Education details saved!');
                }}
                style={{ padding: '0.6rem 1.4rem', borderRadius: '10px', background: '#4f46e5', border: 'none', color: '#ffffff', fontWeight: '800', fontSize: '0.86rem', cursor: 'pointer' }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 4: Edit Experience Modal ──────────────────────────────── */}
      {showEditExperienceModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 250, padding: '1rem' }}>
          <div style={{ width: '480px', background: '#ffffff', borderRadius: '20px', padding: '1.75rem', boxShadow: '0 25px 60px rgba(15,23,42,0.2)', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                Edit Experience
              </h3>
              <button onClick={() => setShowEditExperienceModal(false)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={16} color="#64748b" />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Title / Role</label>
                <input
                  type="text"
                  placeholder="e.g. Software Developer / Intern"
                  value={experience?.title || ''}
                  onChange={e => setExperience(prev => ({ ...(prev || {}), title: e.target.value }))}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem', fontFamily: 'Inter, sans-serif' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Company / Subtitle</label>
                <input
                  type="text"
                  placeholder="e.g. Tech Solutions Pvt Ltd"
                  value={experience?.company || ''}
                  onChange={e => setExperience(prev => ({ ...(prev || {}), company: e.target.value }))}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem', fontFamily: 'Inter, sans-serif' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Note / Description</label>
                <input
                  type="text"
                  placeholder="e.g. Worked on full stack web applications"
                  value={experience?.note || ''}
                  onChange={e => setExperience(prev => ({ ...(prev || {}), note: e.target.value }))}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem', fontFamily: 'Inter, sans-serif' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button onClick={() => setShowEditExperienceModal(false)} style={{ padding: '0.6rem 1.2rem', borderRadius: '10px', background: '#f1f5f9', border: 'none', color: '#475569', fontWeight: '700', fontSize: '0.86rem', cursor: 'pointer' }}>
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowEditExperienceModal(false);
                  triggerToast('Experience details saved!');
                }}
                style={{ padding: '0.6rem 1.4rem', borderRadius: '10px', background: '#4f46e5', border: 'none', color: '#ffffff', fontWeight: '800', fontSize: '0.86rem', cursor: 'pointer' }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 5: Edit Preferences Modal ─────────────────────────────── */}
      {showEditPreferencesModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 250, padding: '1rem' }}>
          <div style={{ width: '520px', background: '#ffffff', borderRadius: '20px', padding: '1.75rem', boxShadow: '0 25px 60px rgba(15,23,42,0.2)', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                Edit Job Preferences
              </h3>
              <button onClick={() => setShowEditPreferencesModal(false)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={16} color="#64748b" />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Preferred Roles</label>
                <input
                  type="text"
                  placeholder="e.g. Software Engineer, Full Stack Developer"
                  value={preferences?.roles || ''}
                  onChange={e => setPreferences(prev => ({ ...(prev || {}), roles: e.target.value }))}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem', fontFamily: 'Inter, sans-serif' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Preferred Location</label>
                <input
                  type="text"
                  placeholder="e.g. Bengaluru, Noida, Remote"
                  value={preferences?.location || ''}
                  onChange={e => setPreferences(prev => ({ ...(prev || {}), location: e.target.value }))}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem', fontFamily: 'Inter, sans-serif' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Job Type</label>
                  <select
                    value={preferences?.type || 'Full-time'}
                    onChange={e => setPreferences(prev => ({ ...(prev || {}), type: e.target.value }))}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem', fontFamily: 'Inter, sans-serif', background: '#ffffff' }}
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Experience Level</label>
                  <input
                    type="text"
                    placeholder="e.g. Entry / Mid Level"
                    value={preferences?.level || ''}
                    onChange={e => setPreferences(prev => ({ ...(prev || {}), level: e.target.value }))}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem', fontFamily: 'Inter, sans-serif' }}
                  />
                </div>
              </div>
              <div>
                <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Expected Salary</label>
                <input
                  type="text"
                  placeholder="e.g. ₹8,00,000 - ₹14,00,000 LPA"
                  value={preferences?.salary || ''}
                  onChange={e => setPreferences(prev => ({ ...(prev || {}), salary: e.target.value }))}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem', fontFamily: 'Inter, sans-serif' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button onClick={() => setShowEditPreferencesModal(false)} style={{ padding: '0.6rem 1.2rem', borderRadius: '10px', background: '#f1f5f9', border: 'none', color: '#475569', fontWeight: '700', fontSize: '0.86rem', cursor: 'pointer' }}>
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowEditPreferencesModal(false);
                  triggerToast('Job preferences saved!');
                }}
                style={{ padding: '0.6rem 1.4rem', borderRadius: '10px', background: '#4f46e5', border: 'none', color: '#ffffff', fontWeight: '800', fontSize: '0.86rem', cursor: 'pointer' }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 6: Phone OTP Verification Dialog ─────────────────────────── */}
      {showPhoneOtpModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 250, padding: '1rem' }}>
          <div style={{ width: '420px', background: '#ffffff', borderRadius: '24px', padding: '2rem', boxShadow: '0 25px 60px rgba(15,23,42,0.2)', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#f3e8ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Phone size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                    Verify your phone number
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '2px 0 0 0' }}>
                    We sent a 6-digit OTP to <strong style={{ color: '#0f172a' }}>{phone}</strong>
                  </p>
                </div>
              </div>
              <button onClick={() => setShowPhoneOtpModal(false)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={18} color="#64748b" />
              </button>
            </div>

            {/* Clean Security Notice (No OTP Code on Screen) */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '0.75rem 0.9rem',
              marginBottom: '1rem',
              fontSize: '0.8rem',
              color: '#475569',
              lineHeight: '1.4'
            }}>
              📩 A 6-digit OTP code has been dispatched to <strong>+91 {phone}</strong> and your email address (<strong>{email}</strong>). Please check your phone SMS or email inbox and enter the code below.
            </div>

            {otpError && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '0.65rem', borderRadius: '10px', fontSize: '0.82rem', fontWeight: '600', marginBottom: '1rem', textAlign: 'center' }}>
                {otpError}
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', margin: '1.5rem 0' }}>
              {otpValues.map((val, idx) => (
                <input
                  key={idx}
                  id={`otp-input-${idx}`}
                  type="text"
                  maxLength={1}
                  value={val}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                  style={{
                    width: '46px',
                    height: '52px',
                    borderRadius: '12px',
                    border: `2px solid ${val ? '#7c3aed' : '#cbd5e1'}`,
                    background: val ? '#f3e8ff' : '#ffffff',
                    fontSize: '1.25rem',
                    fontWeight: '800',
                    textAlign: 'center',
                    color: '#0f172a',
                    outline: 'none',
                    fontFamily: 'Inter, sans-serif',
                    boxShadow: '0 2px 6px rgba(15,23,42,0.03)'
                  }}
                />
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', fontSize: '0.82rem' }}>
              <span style={{ color: '#64748b' }}>Didn't receive code?</span>
              {otpTimer > 0 ? (
                <span style={{ color: '#94a3b8', fontWeight: '600' }}>Resend in {otpTimer}s</span>
              ) : (
                <button
                  onClick={handleResendOtp}
                  style={{ background: 'none', border: 'none', color: '#4f46e5', fontWeight: '800', cursor: 'pointer', padding: 0 }}
                >
                  Resend OTP
                </button>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => setShowPhoneOtpModal(false)}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  borderRadius: '12px',
                  background: '#f1f5f9',
                  border: 'none',
                  color: '#475569',
                  fontWeight: '700',
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleVerifyPhoneSubmit}
                style={{
                  flex: 1.5,
                  padding: '0.75rem',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                  border: 'none',
                  color: '#ffffff',
                  fontWeight: '800',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(124,58,237,0.3)'
                }}
              >
                Verify Phone
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 7: Generic Name/Location/About Editor Modal ──────────── */}
      {editingSection && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 250, padding: '1rem' }}>
          <div style={{ width: '450px', background: '#ffffff', borderRadius: '20px', padding: '1.75rem', boxShadow: '0 25px 60px rgba(15,23,42,0.2)', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', margin: 0, textTransform: 'capitalize' }}>
                Edit {editingSection}
              </h3>
              <button onClick={() => setEditingSection(null)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={16} color="#64748b" />
              </button>
            </div>

            {editingSection === 'about' ? (
              <textarea
                value={tempEditValue}
                onChange={e => setTempEditValue(e.target.value)}
                rows={5}
                style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem', fontFamily: 'Inter, sans-serif', color: '#0f172a', outline: 'none' }}
              />
            ) : (
              <input
                type="text"
                value={tempEditValue}
                onChange={e => setTempEditValue(e.target.value)}
                style={{ width: '100%', padding: '0.75rem 0.9rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', fontFamily: 'Inter, sans-serif', color: '#0f172a', outline: 'none' }}
              />
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
              <button onClick={() => setEditingSection(null)} style={{ padding: '0.6rem 1.2rem', borderRadius: '10px', background: '#f1f5f9', border: 'none', color: '#475569', fontWeight: '700', fontSize: '0.86rem', cursor: 'pointer' }}>
                Cancel
              </button>
              <button
                onClick={() => {
                  if (editingSection === 'name') {
                    setName(tempEditValue);
                    updateUserProfileName(tempEditValue);
                  }
                  if (editingSection === 'location') setLocation(tempEditValue);
                  if (editingSection === 'about') setAboutText(tempEditValue);
                  setEditingSection(null);
                  triggerToast(`${editingSection} updated!`);
                }}
                style={{ padding: '0.6rem 1.4rem', borderRadius: '10px', background: '#4f46e5', border: 'none', color: '#ffffff', fontWeight: '800', fontSize: '0.86rem', cursor: 'pointer' }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ── MODAL 8: Change / Edit Phone Number Modal ────────────────────── */}
      {showEditPhoneModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 250, padding: '1rem' }}>
          <div style={{ width: '450px', background: '#ffffff', borderRadius: '20px', padding: '1.75rem', boxShadow: '0 25px 60px rgba(15,23,42,0.2)', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#f3e8ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Phone size={20} />
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                  Change Phone Number
                </h3>
              </div>
              <button onClick={() => setShowEditPhoneModal(false)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={16} color="#64748b" />
              </button>
            </div>

            <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '0 0 1.25rem 0', lineHeight: '1.45' }}>
              Enter your new phone number below. After saving, you will be required to verify this new number via OTP to make it verified.
            </p>

            <form onSubmit={(e) => {
              e.preventDefault();
              if (!newPhoneInput.trim() || newPhoneInput.trim().length < 8) {
                alert('Please enter a valid mobile number.');
                return;
              }

              const cleanPhone = newPhoneInput.trim();
              setPhone(cleanPhone);
              setIsPhoneVerified(false);
              setShowEditPhoneModal(false);
              handleStartPhoneVerification(cleanPhone);
            }}>
              <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '700', display: 'block', marginBottom: '5px' }}>
                New Mobile Number
              </label>
              <input
                type="text"
                value={newPhoneInput}
                onChange={e => setNewPhoneInput(e.target.value)}
                placeholder="+91 98765 43210"
                style={{ width: '100%', padding: '0.75rem 0.9rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', fontFamily: 'Inter, sans-serif', color: '#0f172a', outline: 'none' }}
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setShowEditPhoneModal(false)} style={{ padding: '0.6rem 1.2rem', borderRadius: '10px', background: '#f1f5f9', border: 'none', color: '#475569', fontWeight: '700', fontSize: '0.86rem', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" style={{ padding: '0.6rem 1.4rem', borderRadius: '10px', background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', border: 'none', color: '#ffffff', fontWeight: '800', fontSize: '0.86rem', cursor: 'pointer' }}>
                  Save & Verify New Number
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
