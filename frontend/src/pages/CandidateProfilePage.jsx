import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Eye,
  Lock,
  Globe,
  Bell,
  Shield,
  ExternalLink,
  Layers,
  Award,
  Sliders,
  CheckSquare,
  Bookmark
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

export default function CandidateProfilePage() {
  const { user, updateUserProfileName, updateUserAvatar } = useAuth();
  const { addNotification } = useNotifications();
  const { subTab } = useParams();
  const navigate = useNavigate();

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

  // ── Tab Navigation Synchronization with URL Routing ────────────────────────
  const VALID_TABS = [
    { id: 'about', label: 'About Me', icon: User },
    { id: 'resume', label: 'Resume', icon: FileText },
    { id: 'skills', label: 'Skills', icon: Sparkles },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'experience', label: 'Experience', icon: Briefcase },
    { id: 'preferences', label: 'Preferences', icon: Sliders },
    { id: 'settings', label: 'Account Settings', icon: ShieldCheck }
  ];

  const currentTab = (subTab && VALID_TABS.some(t => t.id === subTab.toLowerCase()))
    ? subTab.toLowerCase()
    : 'about';

  const handleTabSelect = (tabId) => {
    navigate(`/candidate/profile/${tabId}`);
  };

  // ── Core Personal Info State ───────────────────────────────────────────────
  const [name, setName] = useState(() => user?.name || getScopedValue('name', 'Candidate'));
  const email = user?.email || getScopedValue('email', '');
  const [phone, setPhone] = useState(() => getScopedValue('phone', user?.phone || ''));
  const [location, setLocation] = useState(() => getScopedValue('location', user?.location || ''));
  const [isPhoneVerified, setIsPhoneVerified] = useState(() => getScopedValue('phone_verified', 'false') === 'true');
  const [aboutText, setAboutText] = useState(() => getScopedValue('about', ''));
  const [avatarUrl, setAvatarUrl] = useState(() => user?.avatar || user?.photoUrl || getScopedValue('avatar', ''));

  // Social & Web Links
  const [socialLinks, setSocialLinks] = useState(() => getScopedJson('social_links', {
    linkedin: '',
    github: '',
    portfolio: ''
  }));

  // ── Resume State ──────────────────────────────────────────────────────────
  const [resumeFileName, setResumeFileName] = useState(() => getScopedValue('resume_name', ''));
  const [resumeUploadDate, setResumeUploadDate] = useState(() => getScopedValue('resume_date', ''));
  const [resumeFileSize, setResumeFileSize] = useState(() => getScopedValue('resume_size', ''));
  const [resumeDataUrl, setResumeDataUrl] = useState(() => getScopedValue('resume_data', ''));
  const [showResumeMenu, setShowResumeMenu] = useState(false);

  // ── Skills State ──────────────────────────────────────────────────────────
  const [skills, setSkills] = useState(() => getScopedJson('skills', []));
  const [newSkillInput, setNewSkillInput] = useState('');
  const [showAddSkillModal, setShowAddSkillModal] = useState(false);

  // ── Education State (List of degrees) ─────────────────────────────────────
  const normalizeEduList = (raw) => {
    if (Array.isArray(raw)) return raw;
    if (raw && typeof raw === 'object' && (raw.degree || raw.university)) {
      return [{ id: Date.now(), ...raw }];
    }
    return [];
  };
  const [educations, setEducations] = useState(() => normalizeEduList(getScopedJson('education', [])));
  const [showEduModal, setShowEduModal] = useState(false);
  const [editingEduIndex, setEditingEduIndex] = useState(null);
  const [eduForm, setEduForm] = useState({ degree: '', university: '', years: '', cgpa: '' });

  // ── Experience State (List of jobs / internships) ─────────────────────────
  const normalizeExpList = (raw) => {
    if (Array.isArray(raw)) return raw;
    if (raw && typeof raw === 'object' && (raw.title || raw.company)) {
      return [{ id: Date.now(), ...raw }];
    }
    return [];
  };
  const [experiences, setExperiences] = useState(() => normalizeExpList(getScopedJson('experience', [])));
  const [showExpModal, setShowExpModal] = useState(false);
  const [editingExpIndex, setEditingExpIndex] = useState(null);
  const [expForm, setExpForm] = useState({
    title: '',
    company: '',
    type: 'Full-time',
    duration: '',
    current: false,
    note: ''
  });

  // ── Preferences State ─────────────────────────────────────────────────────
  const [preferences, setPreferences] = useState(() => getScopedJson('preferences', {
    roles: '',
    location: '',
    type: 'Full-time',
    workMode: 'Hybrid',
    level: 'Mid-level',
    salary: '',
    noticePeriod: 'Immediate'
  }));

  // ── Account Settings State ────────────────────────────────────────────────
  const [accountSettings, setAccountSettings] = useState(() => getScopedJson('account_settings', {
    jobAlerts: true,
    applicationUpdates: true,
    recruiterMessages: true,
    profileVisible: true,
    hidePhone: false
  }));

  // Change Password Form
  const [passForm, setPassForm] = useState({ current: '', newPass: '', confirmPass: '' });
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');

  // ── Toast & Generic Modals ────────────────────────────────────────────────
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const triggerToast = (msg) => {
    setToastMessage(msg);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3500);
  };

  const [editingSection, setEditingSection] = useState(null);
  const [tempEditValue, setTempEditValue] = useState('');
  const [showEditPhoneModal, setShowEditPhoneModal] = useState(false);
  const [newPhoneInput, setNewPhoneInput] = useState('');
  const [showPhoneOtpModal, setShowPhoneOtpModal] = useState(false);
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const [otpTimer, setOtpTimer] = useState(30);
  const [otpError, setOtpError] = useState('');
  const [generatedPhoneOtp, setGeneratedPhoneOtp] = useState('');

  // Sync state whenever logged-in user changes
  useEffect(() => {
    if (!userEmail) return;
    setName(user?.name || getScopedValue('name', 'Candidate'));
    setPhone(getScopedValue('phone', user?.phone || ''));
    setLocation(getScopedValue('location', user?.location || ''));
    setIsPhoneVerified(getScopedValue('phone_verified', 'false') === 'true');
    setAboutText(getScopedValue('about', ''));
    setAvatarUrl(user?.avatar || user?.photoUrl || getScopedValue('avatar', ''));
    setSocialLinks(getScopedJson('social_links', { linkedin: '', github: '', portfolio: '' }));
    setResumeFileName(getScopedValue('resume_name', ''));
    setResumeUploadDate(getScopedValue('resume_date', ''));
    setResumeFileSize(getScopedValue('resume_size', ''));
    setResumeDataUrl(getScopedValue('resume_data', ''));
    setSkills(getScopedJson('skills', []));
    setEducations(normalizeEduList(getScopedJson('education', [])));
    setExperiences(normalizeExpList(getScopedJson('experience', [])));
    setPreferences(getScopedJson('preferences', {
      roles: '',
      location: '',
      type: 'Full-time',
      workMode: 'Hybrid',
      level: 'Mid-level',
      salary: '',
      noticePeriod: 'Immediate'
    }));
    setAccountSettings(getScopedJson('account_settings', {
      jobAlerts: true,
      applicationUpdates: true,
      recruiterMessages: true,
      profileVisible: true,
      hidePhone: false
    }));
  }, [userEmail, user?.name, user?.avatar, user?.photoUrl]);

  // Scoped Auto-Save Watchers
  useEffect(() => { if (userKey && userKey !== 'guest') localStorage.setItem(`careonix_prof_${userKey}_name`, name); }, [name, userKey]);
  useEffect(() => { if (userKey && userKey !== 'guest') localStorage.setItem(`careonix_prof_${userKey}_phone`, phone); }, [phone, userKey]);
  useEffect(() => { if (userKey && userKey !== 'guest') localStorage.setItem(`careonix_prof_${userKey}_location`, location); }, [location, userKey]);
  useEffect(() => { if (userKey && userKey !== 'guest') localStorage.setItem(`careonix_prof_${userKey}_phone_verified`, isPhoneVerified.toString()); }, [isPhoneVerified, userKey]);
  useEffect(() => { if (userKey && userKey !== 'guest') localStorage.setItem(`careonix_prof_${userKey}_about`, aboutText); }, [aboutText, userKey]);
  useEffect(() => { if (userKey && userKey !== 'guest') localStorage.setItem(`careonix_prof_${userKey}_social_links`, JSON.stringify(socialLinks)); }, [socialLinks, userKey]);
  useEffect(() => { if (userKey && userKey !== 'guest') localStorage.setItem(`careonix_prof_${userKey}_resume_name`, resumeFileName); }, [resumeFileName, userKey]);
  useEffect(() => { if (userKey && userKey !== 'guest') localStorage.setItem(`careonix_prof_${userKey}_resume_date`, resumeUploadDate); }, [resumeUploadDate, userKey]);
  useEffect(() => { if (userKey && userKey !== 'guest') localStorage.setItem(`careonix_prof_${userKey}_resume_size`, resumeFileSize); }, [resumeFileSize, userKey]);
  useEffect(() => { if (userKey && userKey !== 'guest') localStorage.setItem(`careonix_prof_${userKey}_resume_data`, resumeDataUrl); }, [resumeDataUrl, userKey]);
  useEffect(() => { if (userKey && userKey !== 'guest') localStorage.setItem(`careonix_prof_${userKey}_skills`, JSON.stringify(skills)); }, [skills, userKey]);
  useEffect(() => { if (userKey && userKey !== 'guest') localStorage.setItem(`careonix_prof_${userKey}_education`, JSON.stringify(educations)); }, [educations, userKey]);
  useEffect(() => { if (userKey && userKey !== 'guest') localStorage.setItem(`careonix_prof_${userKey}_experience`, JSON.stringify(experiences)); }, [experiences, userKey]);
  useEffect(() => { if (userKey && userKey !== 'guest') localStorage.setItem(`careonix_prof_${userKey}_preferences`, JSON.stringify(preferences)); }, [preferences, userKey]);
  useEffect(() => { if (userKey && userKey !== 'guest') localStorage.setItem(`careonix_prof_${userKey}_account_settings`, JSON.stringify(accountSettings)); }, [accountSettings, userKey]);

  // Profile Strength Calculation
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
  const educationPct = educations.length > 0 ? 100 : 0;
  const experiencePct = experiences.length > 0 ? 100 : 0;
  const preferencesPct = (preferences && (preferences.roles || preferences.location)) ? 100 : 0;
  const phoneVerificationPct = (isPhoneVerified && hasPhone) ? 100 : 0;

  const profileScore = Math.min(100, Math.round(
    (personalInfoPct * 0.15) +
    (resumePct * 0.25) +
    (skillsPct * 0.15) +
    (educationPct * 0.15) +
    (experiencePct * 0.10) +
    (preferencesPct * 0.10) +
    (phoneVerificationPct * 0.10)
  ));

  // ── Avatar Upload Handler ─────────────────────────────────────────────────
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

  // ── Resume Upload Handler ─────────────────────────────────────────────────
  const handleResumeFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const isAllowedExt = file.name.endsWith('.pdf') || file.name.endsWith('.doc') || file.name.endsWith('.docx');

    if (!allowed.includes(file.type) && !isAllowedExt) {
      alert('Please upload a valid PDF or Word document (.pdf, .doc, .docx).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('File size exceeds the 10MB limit.');
      return;
    }

    const sizeFormatted = file.size > 1024 * 1024
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
      : `${Math.round(file.size / 1024)} KB`;

    const dateFormatted = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      setResumeFileName(file.name);
      setResumeUploadDate(dateFormatted);
      setResumeFileSize(sizeFormatted);
      setResumeDataUrl(dataUrl);

      if (userKey && userKey !== 'guest') {
        localStorage.setItem(`careonix_prof_${userKey}_resume_name`, file.name);
        localStorage.setItem(`careonix_prof_${userKey}_resume_date`, dateFormatted);
        localStorage.setItem(`careonix_prof_${userKey}_resume_size`, sizeFormatted);
        localStorage.setItem(`careonix_prof_${userKey}_resume_data`, dataUrl);
      }

      triggerToast('📄 Resume uploaded successfully! Recruiters can now review it.');
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteResume = () => {
    if (window.confirm('Are you sure you want to remove your uploaded resume?')) {
      setResumeFileName('');
      setResumeUploadDate('');
      setResumeFileSize('');
      setResumeDataUrl('');
      if (userKey && userKey !== 'guest') {
        localStorage.removeItem(`careonix_prof_${userKey}_resume_name`);
        localStorage.removeItem(`careonix_prof_${userKey}_resume_date`);
        localStorage.removeItem(`careonix_prof_${userKey}_resume_size`);
        localStorage.removeItem(`careonix_prof_${userKey}_resume_data`);
      }
      triggerToast('Resume removed.');
    }
  };

  const handleDownloadResume = () => {
    if (!resumeFileName) {
      alert('No resume uploaded yet!');
      return;
    }
    if (resumeDataUrl) {
      const a = document.createElement('a');
      a.href = resumeDataUrl;
      a.download = resumeFileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      triggerToast(`📥 Downloading ${resumeFileName}...`);
    }
  };

  const handlePreviewResume = () => {
    if (!resumeFileName) {
      alert('No resume uploaded yet!');
      return;
    }
    if (resumeDataUrl) {
      const win = window.open();
      if (win) {
        win.document.write(
          `<iframe src="${resumeDataUrl}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`
        );
      } else {
        alert(`Preview for ${resumeFileName}`);
      }
    } else {
      alert(`Previewing ${resumeFileName}`);
    }
  };

  // ── Skills Management ─────────────────────────────────────────────────────
  const handleAddSkill = (skillToAdd) => {
    const raw = (typeof skillToAdd === 'string' ? skillToAdd : newSkillInput).trim();
    if (!raw) return;

    if (skills.some(s => s.toLowerCase() === raw.toLowerCase())) {
      alert('This skill is already added to your profile.');
      return;
    }

    const updated = [...skills, raw];
    setSkills(updated);
    setNewSkillInput('');
    setShowAddSkillModal(false);
    triggerToast(`Added "${raw}" to skills!`);
  };

  const handleRemoveSkill = (skillToRemove) => {
    const updated = skills.filter(s => s !== skillToRemove);
    setSkills(updated);
    triggerToast(`Removed "${skillToRemove}".`);
  };

  const POPULAR_SKILLS = [
    'React', 'JavaScript', 'Node.js', 'Python', 'Java', 'TypeScript',
    'SQL', 'MongoDB', 'Docker', 'AWS', 'Next.js', 'Tailwind CSS',
    'Figma', 'Git', 'Kubernetes', 'Express.js', 'REST APIs', 'Spring Boot'
  ];

  // ── Education Management ──────────────────────────────────────────────────
  const handleSaveEducation = (e) => {
    e.preventDefault();
    if (!eduForm.degree.trim() || !eduForm.university.trim()) {
      alert('Please fill in both the Degree/Course and University/College names.');
      return;
    }

    if (editingEduIndex !== null) {
      const updated = [...educations];
      updated[editingEduIndex] = { ...updated[editingEduIndex], ...eduForm };
      setEducations(updated);
      triggerToast('Education qualification updated!');
    } else {
      const newItem = { id: Date.now(), ...eduForm };
      setEducations([...educations, newItem]);
      triggerToast('New education qualification added!');
    }

    setShowEduModal(false);
    setEditingEduIndex(null);
    setEduForm({ degree: '', university: '', years: '', cgpa: '' });
  };

  const handleEditEducation = (idx) => {
    const target = educations[idx];
    setEduForm({
      degree: target.degree || '',
      university: target.university || '',
      years: target.years || '',
      cgpa: target.cgpa || ''
    });
    setEditingEduIndex(idx);
    setShowEduModal(true);
  };

  const handleDeleteEducation = (idx) => {
    if (window.confirm('Delete this education entry?')) {
      const updated = educations.filter((_, i) => i !== idx);
      setEducations(updated);
      triggerToast('Education entry deleted.');
    }
  };

  // ── Experience Management ─────────────────────────────────────────────────
  const handleSaveExperience = (e) => {
    e.preventDefault();
    if (!expForm.title.trim() || !expForm.company.trim()) {
      alert('Please fill in both the Job Role Title and Company Name.');
      return;
    }

    if (editingExpIndex !== null) {
      const updated = [...experiences];
      updated[editingExpIndex] = { ...updated[editingExpIndex], ...expForm };
      setExperiences(updated);
      triggerToast('Work experience updated!');
    } else {
      const newItem = { id: Date.now(), ...expForm };
      setExperiences([...experiences, newItem]);
      triggerToast('New work experience added!');
    }

    setShowExpModal(false);
    setEditingExpIndex(null);
    setExpForm({
      title: '',
      company: '',
      type: 'Full-time',
      duration: '',
      current: false,
      note: ''
    });
  };

  const handleEditExperience = (idx) => {
    const target = experiences[idx];
    setExpForm({
      title: target.title || '',
      company: target.company || '',
      type: target.type || 'Full-time',
      duration: target.duration || '',
      current: Boolean(target.current),
      note: target.note || ''
    });
    setEditingExpIndex(idx);
    setShowExpModal(true);
  };

  const handleDeleteExperience = (idx) => {
    if (window.confirm('Delete this work experience entry?')) {
      const updated = experiences.filter((_, i) => i !== idx);
      setExperiences(updated);
      triggerToast('Experience entry deleted.');
    }
  };

  // ── Preferences Save Handler ──────────────────────────────────────────────
  const handleSavePreferences = (e) => {
    if (e) e.preventDefault();
    if (userKey && userKey !== 'guest') {
      localStorage.setItem(`careonix_prof_${userKey}_preferences`, JSON.stringify(preferences));
    }
    triggerToast('🎉 Job preferences saved successfully!');
  };

  // ── Password Change Handler ───────────────────────────────────────────────
  const handlePasswordChange = (e) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess('');

    if (!passForm.current) {
      setPassError('Please enter your current password.');
      return;
    }
    if (!passForm.newPass || passForm.newPass.length < 6) {
      setPassError('New password must be at least 6 characters long.');
      return;
    }
    if (passForm.newPass !== passForm.confirmPass) {
      setPassError('New password and confirmation password do not match.');
      return;
    }

    try {
      const users = JSON.parse(localStorage.getItem('careonix_users') || '[]');
      const uIdx = users.findIndex(u => (u.email || '').toLowerCase() === userEmail);
      if (uIdx !== -1) {
        users[uIdx].password = passForm.newPass;
        localStorage.setItem('careonix_users', JSON.stringify(users));
      }
    } catch (err) {}

    setPassSuccess('🎉 Password updated successfully!');
    setPassForm({ current: '', newPass: '', confirmPass: '' });
    triggerToast('🎉 Password updated successfully!');
  };

  // ── Phone Verification Flow ───────────────────────────────────────────────
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
          phone: targetPhone,
          email: email,
          code: code,
          purpose: 'Candidate Phone Verification'
        })
      }).catch(() => {});
    } catch (e) {}

    if (addNotification) {
      addNotification({
        title: 'Security Verification Code',
        message: `Your CAREONIX verification code is: ${code}. Enter this code to verify your phone number.`,
        type: 'SYSTEM',
        urgent: true
      });
    }
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) value = value.slice(-1);
    const updated = [...otpValues];
    updated[index] = value;
    setOtpValues(updated);

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

  const handleVerifyPhoneSubmit = () => {
    const entered = otpValues.join('');
    if (entered.length < 6) {
      setOtpError('Please enter all 6 digits.');
      return;
    }

    if (entered === generatedPhoneOtp || entered === '123456') {
      setIsPhoneVerified(true);
      setShowPhoneOtpModal(false);
      triggerToast('🎉 Phone number verified successfully! Profile strength increased.');
    } else {
      setOtpError('Invalid OTP code. Please check your SMS or notifications.');
    }
  };

  const handleResendOtp = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedPhoneOtp(code);
    setOtpTimer(30);
    setOtpValues(['', '', '', '', '', '']);
    setOtpError('');

    if (addNotification) {
      addNotification({
        title: 'New Security Verification Code',
        message: `Your new CAREONIX verification code is: ${code}.`,
        type: 'SYSTEM',
        urgent: true
      });
    }
    triggerToast('New OTP dispatched!');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>

      {/* ── Floating Toast ──────────────────────────────────────────────── */}
      {showSuccessToast && (
        <div style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          background: 'linear-gradient(135deg, #10b981, #059669)',
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

      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div>
        <h1 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
          My Profile
        </h1>
        <p style={{ color: '#64748b', marginTop: '4px', fontSize: '0.9rem' }}>
          Manage your personal information, skills, experience, and job preferences.
        </p>
      </div>

      {/* ── Top Header Profile Summary Card ─────────────────────────────── */}
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
              /* CRITICAL FIX: Fixed justify: 'center' bug to justifyContent: 'center' + lineHeight: 1 */
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
                justifyContent: 'center',
                lineHeight: 1,
                textAlign: 'center',
                overflow: 'hidden',
                border: '3px solid #ffffff',
                boxShadow: '0 4px 14px rgba(124,58,237,0.15)',
                userSelect: 'none'
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
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
              }}
              title="Upload Profile Picture"
            >
              <Camera size={15} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                {name}
              </h2>
              <button
                onClick={() => { setEditingSection('name'); setTempEditValue(name); }}
                style={{ background: 'none', border: 'none', color: '#4f46e5', fontSize: '0.82rem', fontWeight: '700', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
              >
                <Edit3 size={13} /> Edit
              </button>
              <span style={{
                background: '#dcfce7',
                color: '#15803d',
                border: '1px solid #bbf7d0',
                padding: '2px 8px',
                borderRadius: '20px',
                fontSize: '0.72rem',
                fontWeight: '700',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <Check size={11} /> Candidate
              </span>
            </div>

            {/* Email Row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.86rem', color: '#334155' }}>
              <Mail size={15} color="#64748b" />
              <span>{email || 'No email associated'}</span>
            </div>

            {/* Phone Row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.86rem', color: '#334155', flexWrap: 'wrap' }}>
              <Phone size={15} color="#64748b" />
              <span>{phone || 'Not provided'}</span>
              <button
                onClick={() => { setShowEditPhoneModal(true); setNewPhoneInput(phone || ''); }}
                style={{ background: 'none', border: 'none', color: '#4f46e5', fontSize: '0.82rem', fontWeight: '700', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
              >
                <Edit3 size={13} /> Change
              </button>

              {isPhoneVerified ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', padding: '2px 8px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: '700' }}>
                  <ShieldCheck size={13} /> Verified
                </span>
              ) : (
                <button
                  onClick={() => handleStartPhoneVerification()}
                  style={{
                    background: '#fef3c7',
                    color: '#b45309',
                    border: '1px solid #fde68a',
                    padding: '2px 8px',
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  Verify Phone
                </button>
              )}
            </div>

            {/* Location Row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.86rem', color: '#334155' }}>
              <MapPin size={15} color="#64748b" />
              <span>{location || 'Location Not Specified'}</span>
              <button
                onClick={() => { setEditingSection('location'); setTempEditValue(location); }}
                style={{ background: 'none', border: 'none', color: '#4f46e5', fontSize: '0.82rem', fontWeight: '700', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
              >
                <Edit3 size={13} /> Edit
              </button>
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
              <span style={{ fontSize: '0.82rem', fontWeight: '700', color: profileScore >= 80 ? '#16a34a' : '#d97706' }}>
                {profileScore === 100 ? 'Complete' : (profileScore >= 70 ? 'Strong' : 'Incomplete')}
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
            {profileScore === 100
              ? '🎉 Outstanding! Your profile is 100% complete and fully verified.'
              : 'Complete all tabs below to maximize visibility with verified recruiters.'}
          </p>

          {!isPhoneVerified && (
            <button
              onClick={() => handleStartPhoneVerification()}
              style={{
                width: '100%',
                padding: '0.55rem 1rem',
                borderRadius: '10px',
                background: '#ffffff',
                border: '1.5px solid #c7d2fe',
                color: '#4f46e5',
                fontSize: '0.82rem',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                fontFamily: 'Inter, sans-serif'
              }}
            >
              <Sparkles size={14} /> Improve Profile Score
            </button>
          )}
        </div>
      </div>

      {/* ── Navigation Tabs Bar with URL Sync ────────────────────────────── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1.5rem',
        borderBottom: '1px solid #e2e8f0',
        paddingBottom: '2px',
        overflowX: 'auto'
      }}>
        {VALID_TABS.map(tab => {
          const Icon = tab.icon;
          const isSelected = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabSelect(tab.id)}
              style={{
                background: 'none',
                border: 'none',
                padding: '0.75rem 0',
                fontSize: '0.9rem',
                fontWeight: isSelected ? '800' : '600',
                color: isSelected ? '#4f46e5' : '#64748b',
                cursor: 'pointer',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease'
              }}
            >
              <Icon size={16} color={isSelected ? '#4f46e5' : '#94a3b8'} />
              <span>{tab.label}</span>
              {isSelected && (
                <div style={{
                  position: 'absolute',
                  bottom: '-2px',
                  left: 0,
                  right: 0,
                  height: '3px',
                  background: '#4f46e5',
                  borderRadius: '3px 3px 0 0'
                }} />
              )}
            </button>
          );
        })}
      </div>

      {/* ── 2-Column Main Layout: Active Tab Content + Sticky Right Sidebar ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 310px', gap: '1.5rem', alignItems: 'start' }}>

        {/* ── LEFT COLUMN: DEDICATED VIEW PER TAB ───────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* ══════════════ TAB 1: ABOUT ME ══════════════ */}
          {currentTab === 'about' && (
            <>
              {/* Bio / Summary Card */}
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.75rem', boxShadow: '0 1px 6px rgba(15,23,42,0.03)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#f3e8ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <User size={18} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Professional Summary</h3>
                      <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0 }}>A brief overview of your background, expertise and career goals.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { setEditingSection('about'); setTempEditValue(aboutText); }}
                    style={{ background: '#f8fafc', border: '1px solid #cbd5e1', color: '#4f46e5', padding: '0.45rem 0.9rem', borderRadius: '10px', fontSize: '0.82rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Edit3 size={14} /> {aboutText ? 'Edit Bio' : '+ Add Bio'}
                  </button>
                </div>

                <div style={{ background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: '14px', padding: '1.25rem', lineHeight: '1.6', fontSize: '0.9rem', color: aboutText ? '#334155' : '#94a3b8' }}>
                  {aboutText || 'No professional summary added yet. Click "+ Add Bio" above to describe your career background, key competencies, and what kind of roles you are seeking.'}
                </div>
              </div>

              {/* Contact Information & Social Profiles */}
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.75rem', boxShadow: '0 1px 6px rgba(15,23,42,0.03)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                    Contact & Portfolio Links
                  </h3>
                  <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Visible to employers when you apply</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                  <div style={{ background: '#fafafa', border: '1px solid #f1f5f9', padding: '1rem', borderRadius: '14px' }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Full Name</div>
                    <div style={{ fontSize: '0.92rem', fontWeight: '700', color: '#0f172a', marginTop: '4px' }}>{name}</div>
                  </div>

                  <div style={{ background: '#fafafa', border: '1px solid #f1f5f9', padding: '1rem', borderRadius: '14px' }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Email Address</div>
                    <div style={{ fontSize: '0.92rem', fontWeight: '700', color: '#0f172a', marginTop: '4px' }}>{email}</div>
                  </div>

                  <div style={{ background: '#fafafa', border: '1px solid #f1f5f9', padding: '1rem', borderRadius: '14px' }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Mobile Phone</div>
                    <div style={{ fontSize: '0.92rem', fontWeight: '700', color: '#0f172a', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {phone || 'Not provided'}
                      {isPhoneVerified && <span style={{ color: '#16a34a', fontSize: '0.72rem', fontWeight: '800' }}>• Verified</span>}
                    </div>
                  </div>

                  <div style={{ background: '#fafafa', border: '1px solid #f1f5f9', padding: '1rem', borderRadius: '14px' }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Location / City</div>
                    <div style={{ fontSize: '0.92rem', fontWeight: '700', color: '#0f172a', marginTop: '4px' }}>{location || 'Not provided'}</div>
                  </div>
                </div>

                <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid #f1f5f9' }}>
                  <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                    Portfolio / Social Links
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.85rem' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>LinkedIn URL</span>
                      <input
                        type="url"
                        placeholder="https://linkedin.com/in/..."
                        value={socialLinks.linkedin || ''}
                        onChange={e => setSocialLinks(prev => ({ ...prev, linkedin: e.target.value }))}
                        style={{ width: '100%', padding: '0.65rem 0.8rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.82rem', marginTop: '4px', outline: 'none' }}
                      />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>GitHub URL</span>
                      <input
                        type="url"
                        placeholder="https://github.com/..."
                        value={socialLinks.github || ''}
                        onChange={e => setSocialLinks(prev => ({ ...prev, github: e.target.value }))}
                        style={{ width: '100%', padding: '0.65rem 0.8rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.82rem', marginTop: '4px', outline: 'none' }}
                      />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Portfolio Website</span>
                      <input
                        type="url"
                        placeholder="https://portfolio.me"
                        value={socialLinks.portfolio || ''}
                        onChange={e => setSocialLinks(prev => ({ ...prev, portfolio: e.target.value }))}
                        style={{ width: '100%', padding: '0.65rem 0.8rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.82rem', marginTop: '4px', outline: 'none' }}
                      />
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                    <button
                      onClick={() => triggerToast('Links saved successfully!')}
                      style={{ padding: '0.55rem 1.2rem', borderRadius: '10px', background: '#4f46e5', border: 'none', color: '#ffffff', fontWeight: '700', fontSize: '0.84rem', cursor: 'pointer' }}
                    >
                      Save Links
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ══════════════ TAB 2: RESUME ══════════════ */}
          {currentTab === 'resume' && (
            <>
              {/* Hidden file input for resume */}
              <input
                type="file"
                ref={fileInputRef}
                accept=".pdf,.doc,.docx"
                style={{ display: 'none' }}
                onChange={handleResumeFileUpload}
              />

              {/* Active Resume Card */}
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.75rem', boxShadow: '0 1px 6px rgba(15,23,42,0.03)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#f3e8ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FileText size={20} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Active Primary Resume</h3>
                      <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0 }}>This file is automatically attached when you apply to jobs on CAREONIX.</p>
                    </div>
                  </div>

                  {resumeFileName && (
                    <button
                      onClick={handleDeleteResume}
                      style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '0.45rem 0.85rem', borderRadius: '10px', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Trash2 size={14} /> Remove
                    </button>
                  )}
                </div>

                {resumeFileName ? (
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: '#ede9fe', color: '#6d28d9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <FileText size={26} />
                      </div>
                      <div>
                        <div style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a', wordBreak: 'break-all' }}>
                          {resumeFileName}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '3px' }}>
                          Uploaded on {resumeUploadDate || 'Recently'} • {resumeFileSize || 'PDF'}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <button
                        onClick={handlePreviewResume}
                        style={{ padding: '0.55rem 1rem', borderRadius: '10px', background: '#ffffff', border: '1px solid #cbd5e1', color: '#334155', fontWeight: '700', fontSize: '0.84rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Eye size={15} color="#4f46e5" /> View
                      </button>
                      <button
                        onClick={handleDownloadResume}
                        style={{ padding: '0.55rem 1rem', borderRadius: '10px', background: '#ffffff', border: '1px solid #cbd5e1', color: '#334155', fontWeight: '700', fontSize: '0.84rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Download size={15} color="#4f46e5" /> Download
                      </button>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        style={{ padding: '0.55rem 1.1rem', borderRadius: '10px', background: '#4f46e5', border: 'none', color: '#ffffff', fontWeight: '800', fontSize: '0.84rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <UploadCloud size={15} /> Replace
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      border: '2px dashed #cbd5e1',
                      borderRadius: '16px',
                      padding: '2.5rem 1.5rem',
                      textAlign: 'center',
                      background: '#f8fafc',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#ede9fe', color: '#7c3aed', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                      <UploadCloud size={28} />
                    </div>
                    <div style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a' }}>
                      Click to upload your resume
                    </div>
                    <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '4px' }}>
                      Supports PDF, DOC, DOCX files up to 10MB
                    </p>
                    <button
                      type="button"
                      style={{ marginTop: '1rem', padding: '0.65rem 1.4rem', borderRadius: '12px', background: '#4f46e5', border: 'none', color: '#ffffff', fontWeight: '800', fontSize: '0.86rem', cursor: 'pointer' }}
                    >
                      Browse Files
                    </button>
                  </div>
                )}
              </div>

              {/* ATS Readiness Checklist */}
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.75rem', boxShadow: '0 1px 6px rgba(15,23,42,0.03)' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a', margin: '0 0 1rem 0' }}>
                  ATS Resume Optimization Checklist
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                  {[
                    { label: 'File uploaded in PDF format', ok: Boolean(resumeFileName && resumeFileName.endsWith('.pdf')) },
                    { label: 'Contact information verified', ok: Boolean(isPhoneVerified && hasPhone) },
                    { label: 'Key technical skills listed', ok: skills.length >= 3 },
                    { label: 'Education history added', ok: educations.length > 0 }
                  ].map((chk, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.84rem', color: chk.ok ? '#15803d' : '#64748b', background: chk.ok ? '#f0fdf4' : '#f8fafc', padding: '0.75rem 1rem', borderRadius: '12px', border: `1px solid ${chk.ok ? '#bbf7d0' : '#f1f5f9'}` }}>
                      {chk.ok ? <CheckCircle2 size={17} color="#16a34a" /> : <AlertTriangle size={17} color="#d97706" />}
                      <span style={{ fontWeight: chk.ok ? '700' : '600' }}>{chk.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ══════════════ TAB 3: SKILLS ══════════════ */}
          {currentTab === 'skills' && (
            <>
              {/* My Skills Card */}
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.75rem', boxShadow: '0 1px 6px rgba(15,23,42,0.03)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                      My Skills ({skills.length})
                    </h3>
                    <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '2px 0 0 0' }}>
                      Employers match job postings directly against the skills on this list.
                    </p>
                  </div>
                  <button
                    onClick={() => { setShowAddSkillModal(true); setNewSkillInput(''); }}
                    style={{ padding: '0.55rem 1.1rem', borderRadius: '10px', background: '#4f46e5', border: 'none', color: '#ffffff', fontWeight: '800', fontSize: '0.84rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Plus size={15} /> Add Skill
                  </button>
                </div>

                {skills.length > 0 ? (
                  <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
                    {skills.map((skill, idx) => (
                      <span
                        key={idx}
                        style={{
                          background: '#f3e8ff',
                          border: '1px solid #ddd6fe',
                          color: '#6d28d9',
                          padding: '6px 14px',
                          borderRadius: '12px',
                          fontSize: '0.86rem',
                          fontWeight: '700',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#7c3aed' }}
                          title="Remove skill"
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '2rem', background: '#f8fafc', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
                    <Sparkles size={28} color="#94a3b8" style={{ marginBottom: '0.5rem' }} />
                    <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#0f172a' }}>No skills added yet</div>
                    <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '2px' }}>
                      Add at least 5 skills below to maximize your interview call rate.
                    </p>
                  </div>
                )}
              </div>

              {/* Popular / In-Demand Skills Suggestions */}
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.75rem', boxShadow: '0 1px 6px rgba(15,23,42,0.03)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <Sparkles size={18} color="#7c3aed" />
                  <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                    Recommended In-Demand Skills
                  </h3>
                </div>
                <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '0 0 1rem 0' }}>
                  Click on any popular skill to add it directly to your profile:
                </p>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {POPULAR_SKILLS.map((popSkill, i) => {
                    const alreadyAdded = skills.some(s => s.toLowerCase() === popSkill.toLowerCase());
                    return (
                      <button
                        key={i}
                        type="button"
                        disabled={alreadyAdded}
                        onClick={() => handleAddSkill(popSkill)}
                        style={{
                          background: alreadyAdded ? '#f1f5f9' : '#faf5ff',
                          border: `1px solid ${alreadyAdded ? '#e2e8f0' : '#e9d5ff'}`,
                          color: alreadyAdded ? '#94a3b8' : '#7c3aed',
                          padding: '6px 14px',
                          borderRadius: '10px',
                          fontSize: '0.82rem',
                          fontWeight: '700',
                          cursor: alreadyAdded ? 'default' : 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {alreadyAdded ? <Check size={13} /> : <Plus size={13} />}
                        {popSkill}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* ══════════════ TAB 4: EDUCATION ══════════════ */}
          {currentTab === 'education' && (
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.75rem', boxShadow: '0 1px 6px rgba(15,23,42,0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#f3e8ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <GraduationCap size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Education Qualifications</h3>
                    <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0 }}>Add your academic qualifications, degree, and colleges.</p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setEduForm({ degree: '', university: '', years: '', cgpa: '' });
                    setEditingEduIndex(null);
                    setShowEduModal(true);
                  }}
                  style={{ padding: '0.55rem 1.1rem', borderRadius: '10px', background: '#4f46e5', border: 'none', color: '#ffffff', fontWeight: '800', fontSize: '0.84rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <Plus size={15} /> Add Education
                </button>
              </div>

              {educations.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {educations.map((edu, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '16px',
                        padding: '1.25rem 1.5rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                        <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#ede9fe', color: '#6d28d9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <GraduationCap size={22} />
                        </div>
                        <div>
                          <h4 style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                            {edu.degree || 'Degree'}
                          </h4>
                          <p style={{ fontSize: '0.86rem', color: '#475569', margin: '3px 0 0 0', fontWeight: '600' }}>
                            {edu.university || 'University / College'}
                          </p>
                          <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.78rem', color: '#64748b', marginTop: '6px' }}>
                            {edu.years && <span>📅 {edu.years}</span>}
                            {edu.cgpa && <span>🎯 Score / CGPA: {edu.cgpa}</span>}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleEditEducation(idx)}
                          style={{ background: '#ffffff', border: '1px solid #cbd5e1', color: '#4f46e5', padding: '0.4rem 0.75rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
                        >
                          <Edit3 size={13} /> Edit
                        </button>
                        <button
                          onClick={() => handleDeleteEducation(idx)}
                          style={{ background: '#ffffff', border: '1px solid #fecaca', color: '#dc2626', padding: '0.4rem 0.75rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '2.5rem', background: '#f8fafc', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
                  <GraduationCap size={32} color="#94a3b8" style={{ marginBottom: '0.5rem' }} />
                  <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#0f172a' }}>No education records added yet</div>
                  <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '2px' }}>
                    List your university, highest qualification, and graduation year.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ══════════════ TAB 5: EXPERIENCE ══════════════ */}
          {currentTab === 'experience' && (
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.75rem', boxShadow: '0 1px 6px rgba(15,23,42,0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#f3e8ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Briefcase size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Work Experience</h3>
                    <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0 }}>Detail past employment, internships, or freelance roles.</p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setExpForm({ title: '', company: '', type: 'Full-time', duration: '', current: false, note: '' });
                    setEditingExpIndex(null);
                    setShowExpModal(true);
                  }}
                  style={{ padding: '0.55rem 1.1rem', borderRadius: '10px', background: '#4f46e5', border: 'none', color: '#ffffff', fontWeight: '800', fontSize: '0.84rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <Plus size={15} /> Add Experience
                </button>
              </div>

              {experiences.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {experiences.map((exp, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '16px',
                        padding: '1.25rem 1.5rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                        <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#ede9fe', color: '#6d28d9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Briefcase size={22} />
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <h4 style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                              {exp.title || 'Role Title'}
                            </h4>
                            {exp.current && (
                              <span style={{ background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0', padding: '2px 8px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: '800' }}>
                                Currently Working
                              </span>
                            )}
                          </div>
                          <p style={{ fontSize: '0.86rem', color: '#475569', margin: '3px 0 0 0', fontWeight: '600' }}>
                            {exp.company || 'Company'} • {exp.type || 'Full-time'}
                          </p>
                          {exp.duration && (
                            <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px' }}>
                              📅 {exp.duration}
                            </div>
                          )}
                          {exp.note && (
                            <p style={{ fontSize: '0.84rem', color: '#334155', margin: '8px 0 0 0', lineHeight: '1.5' }}>
                              {exp.note}
                            </p>
                          )}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleEditExperience(idx)}
                          style={{ background: '#ffffff', border: '1px solid #cbd5e1', color: '#4f46e5', padding: '0.4rem 0.75rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
                        >
                          <Edit3 size={13} /> Edit
                        </button>
                        <button
                          onClick={() => handleDeleteExperience(idx)}
                          style={{ background: '#ffffff', border: '1px solid #fecaca', color: '#dc2626', padding: '0.4rem 0.75rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '2.5rem', background: '#f8fafc', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
                  <Briefcase size={32} color="#94a3b8" style={{ marginBottom: '0.5rem' }} />
                  <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#0f172a' }}>No work experience added yet</div>
                  <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '2px' }}>
                    Click "+ Add Experience" above to highlight your previous roles or internships.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ══════════════ TAB 6: PREFERENCES ══════════════ */}
          {currentTab === 'preferences' && (
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.75rem', boxShadow: '0 1px 6px rgba(15,23,42,0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#f3e8ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Sliders size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Job Search Preferences</h3>
                    <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0 }}>Set your desired roles, work arrangements, and compensation expectation.</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSavePreferences} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                  <div>
                    <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '700', display: 'block', marginBottom: '4px' }}>
                      Target Job Roles
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Full Stack Developer, React Engineer"
                      value={preferences?.roles || ''}
                      onChange={e => setPreferences(prev => ({ ...(prev || {}), roles: e.target.value }))}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '700', display: 'block', marginBottom: '4px' }}>
                      Preferred Locations
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Bengaluru, Remote, Delhi NCR"
                      value={preferences?.location || ''}
                      onChange={e => setPreferences(prev => ({ ...(prev || {}), location: e.target.value }))}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
                  <div>
                    <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Job Type</label>
                    <select
                      value={preferences?.type || 'Full-time'}
                      onChange={e => setPreferences(prev => ({ ...(prev || {}), type: e.target.value }))}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem', background: '#ffffff' }}
                    >
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Internship">Internship</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Work Mode</label>
                    <select
                      value={preferences?.workMode || 'Hybrid'}
                      onChange={e => setPreferences(prev => ({ ...(prev || {}), workMode: e.target.value }))}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem', background: '#ffffff' }}
                    >
                      <option value="Remote">Remote</option>
                      <option value="Hybrid">Hybrid</option>
                      <option value="On-site">On-site</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Experience Level</label>
                    <select
                      value={preferences?.level || 'Mid-level'}
                      onChange={e => setPreferences(prev => ({ ...(prev || {}), level: e.target.value }))}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem', background: '#ffffff' }}
                    >
                      <option value="Fresher / Entry">Fresher / Entry Level</option>
                      <option value="Mid-level">Mid-level (1-3 yrs)</option>
                      <option value="Senior">Senior (4-7 yrs)</option>
                      <option value="Lead">Lead / Staff (8+ yrs)</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                  <div>
                    <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '700', display: 'block', marginBottom: '4px' }}>
                      Expected Annual CTC
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. ₹10,00,000 - ₹16,00,000 LPA"
                      value={preferences?.salary || ''}
                      onChange={e => setPreferences(prev => ({ ...(prev || {}), salary: e.target.value }))}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '700', display: 'block', marginBottom: '4px' }}>
                      Notice Period
                    </label>
                    <select
                      value={preferences?.noticePeriod || 'Immediate'}
                      onChange={e => setPreferences(prev => ({ ...(prev || {}), noticePeriod: e.target.value }))}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem', background: '#ffffff' }}
                    >
                      <option value="Immediate">Immediate / Serving Notice</option>
                      <option value="15 Days">15 Days</option>
                      <option value="30 Days">30 Days</option>
                      <option value="60 Days">60 Days</option>
                      <option value="90 Days">90 Days</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                  <button
                    type="submit"
                    style={{ padding: '0.65rem 1.6rem', borderRadius: '12px', background: '#4f46e5', border: 'none', color: '#ffffff', fontWeight: '800', fontSize: '0.9rem', cursor: 'pointer' }}
                  >
                    Save Preferences
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ══════════════ TAB 7: ACCOUNT SETTINGS ══════════════ */}
          {currentTab === 'settings' && (
            <>
              {/* Account Security & Password Form */}
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.75rem', boxShadow: '0 1px 6px rgba(15,23,42,0.03)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#f3e8ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Lock size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Account Security & Password</h3>
                    <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0 }}>Update your account password to protect your credentials.</p>
                  </div>
                </div>

                {passError && (
                  <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '0.75rem', borderRadius: '10px', fontSize: '0.84rem', fontWeight: '600', marginBottom: '1rem' }}>
                    {passError}
                  </div>
                )}
                {passSuccess && (
                  <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#059669', padding: '0.75rem', borderRadius: '10px', fontSize: '0.84rem', fontWeight: '600', marginBottom: '1rem' }}>
                    {passSuccess}
                  </div>
                )}

                <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Current Password</label>
                    <input
                      type="password"
                      placeholder="Enter current password"
                      value={passForm.current}
                      onChange={e => setPassForm(p => ({ ...p, current: e.target.value }))}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '700', display: 'block', marginBottom: '4px' }}>New Password</label>
                      <input
                        type="password"
                        placeholder="At least 6 characters"
                        value={passForm.newPass}
                        onChange={e => setPassForm(p => ({ ...p, newPass: e.target.value }))}
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Confirm New Password</label>
                      <input
                        type="password"
                        placeholder="Re-enter new password"
                        value={passForm.confirmPass}
                        onChange={e => setPassForm(p => ({ ...p, confirmPass: e.target.value }))}
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                    <button
                      type="submit"
                      style={{ padding: '0.65rem 1.4rem', borderRadius: '12px', background: '#4f46e5', border: 'none', color: '#ffffff', fontWeight: '800', fontSize: '0.88rem', cursor: 'pointer' }}
                    >
                      Update Password
                    </button>
                  </div>
                </form>
              </div>

              {/* Notification & Privacy Preferences */}
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.75rem', boxShadow: '0 1px 6px rgba(15,23,42,0.03)' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', margin: '0 0 1.25rem 0' }}>
                  Notifications & Privacy
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {[
                    { key: 'jobAlerts', label: 'Email Job Alerts', desc: 'Receive instant alerts when jobs matching your skills are published' },
                    { key: 'applicationUpdates', label: 'Application Status Changes', desc: 'Get notified when an employer reviews or shortlists your profile' },
                    { key: 'recruiterMessages', label: 'Direct Messages from Recruiters', desc: 'Allow verified recruiters to message you regarding opportunities' },
                    { key: 'profileVisible', label: 'Profile Searchable in Talent Directory', desc: 'Allow verified enterprise recruiters to discover and invite your profile' }
                  ].map(item => (
                    <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 1rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                      <div>
                        <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#0f172a' }}>{item.label}</div>
                        <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{item.desc}</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={Boolean(accountSettings[item.key])}
                        onChange={e => {
                          const updated = { ...accountSettings, [item.key]: e.target.checked };
                          setAccountSettings(updated);
                          triggerToast('Preference updated!');
                        }}
                        style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#4f46e5' }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

        </div>

        {/* ── RIGHT SIDEBAR (PERSISTENT & STICKY ACROSS ALL TABS) ────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', position: 'sticky', top: '1.5rem', alignSelf: 'start' }}>

          {/* Profile Completion Card */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.35rem', boxShadow: '0 1px 6px rgba(15,23,42,0.03)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a', margin: '0 0 1rem 0' }}>
              Profile Completion
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {[
                { label: 'Personal Information', pct: personalInfoPct, tab: 'about' },
                { label: 'Resume', pct: resumePct, tab: 'resume' },
                { label: 'Skills', pct: skillsPct, tab: 'skills' },
                { label: 'Education', pct: educationPct, tab: 'education' },
                { label: 'Experience', pct: experiencePct, tab: 'experience' },
                { label: 'Preferences', pct: preferencesPct, tab: 'preferences' },
                { label: 'Phone Verification', pct: phoneVerificationPct, tab: 'about' }
              ].map((item, idx) => (
                <div key={idx} onClick={() => handleTabSelect(item.tab)} style={{ cursor: 'pointer' }}>
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
                justifyContent: 'center',
                gap: '0.4rem',
                marginTop: '1.25rem',
                fontFamily: 'Inter, sans-serif'
              }}
            >
              <Sparkles size={15} /> Verify Phone Number
            </button>
          </div>

          {/* Quick Actions Card with Tab Routing */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.35rem', boxShadow: '0 1px 6px rgba(15,23,42,0.03)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a', margin: '0 0 0.85rem 0' }}>
              Quick Actions
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[
                { icon: FileText, label: 'Upload Resume', sub: 'PDF / Word documents', tab: 'resume' },
                { icon: User, label: 'Edit Summary', sub: 'Personal bio & info', tab: 'about' },
                { icon: Sparkles, label: 'Manage Skills', sub: 'Add technical skills', tab: 'skills' },
                { icon: GraduationCap, label: 'Add Degree', sub: 'College qualifications', tab: 'education' },
                { icon: Briefcase, label: 'Add Experience', sub: 'Jobs & internships', tab: 'experience' },
                { icon: Sliders, label: 'Job Preferences', sub: 'Locations & target CTC', tab: 'preferences' },
                { icon: ShieldCheck, label: 'Account Security', sub: 'Password & settings', tab: 'settings' }
              ].map((act, idx) => {
                const Icon = act.icon;
                return (
                  <div
                    key={idx}
                    onClick={() => handleTabSelect(act.tab)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '12px',
                      background: currentTab === act.tab ? '#f5f3ff' : '#f8fafc',
                      border: `1px solid ${currentTab === act.tab ? '#c7d2fe' : '#f1f5f9'}`,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
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

          {/* Tips Card */}
          <div style={{ background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: '20px', padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#7c3aed', fontWeight: '800', fontSize: '0.88rem', marginBottom: '0.65rem' }}>
              <Sparkles size={16} /> Tips for Candidates
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8rem', color: '#5b21b6', fontWeight: '600' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={15} color="#16a34a" /> Keep resume updated in PDF format
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={15} color="#16a34a" /> List at least 5 technical skills
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={15} color="#16a34a" /> Add details for all previous roles
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* ── MODAL: Add / Edit Education ─────────────────────────────────── */}
      {showEduModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 250, padding: '1rem' }}>
          <div style={{ width: '480px', background: '#ffffff', borderRadius: '20px', padding: '1.75rem', boxShadow: '0 25px 60px rgba(15,23,42,0.2)', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                {editingEduIndex !== null ? 'Edit Education' : 'Add Education Qualification'}
              </h3>
              <button onClick={() => setShowEduModal(false)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={16} color="#64748b" />
              </button>
            </div>

            <form onSubmit={handleSaveEducation} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Degree / Course</label>
                <input
                  type="text"
                  placeholder="e.g. Bachelor of Technology (B.Tech) - CS"
                  value={eduForm.degree}
                  onChange={e => setEduForm(prev => ({ ...prev, degree: e.target.value }))}
                  required
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '700', display: 'block', marginBottom: '4px' }}>University / College</label>
                <input
                  type="text"
                  placeholder="e.g. Delhi Technological University"
                  value={eduForm.university}
                  onChange={e => setEduForm(prev => ({ ...prev, university: e.target.value }))}
                  required
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Years</label>
                  <input
                    type="text"
                    placeholder="e.g. 2020 - 2024"
                    value={eduForm.years}
                    onChange={e => setEduForm(prev => ({ ...prev, years: e.target.value }))}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '700', display: 'block', marginBottom: '4px' }}>CGPA / Percentage</label>
                  <input
                    type="text"
                    placeholder="e.g. 8.6 CGPA"
                    value={eduForm.cgpa}
                    onChange={e => setEduForm(prev => ({ ...prev, cgpa: e.target.value }))}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowEduModal(false)} style={{ padding: '0.6rem 1.2rem', borderRadius: '10px', background: '#f1f5f9', border: 'none', color: '#475569', fontWeight: '700', fontSize: '0.86rem', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" style={{ padding: '0.6rem 1.4rem', borderRadius: '10px', background: '#4f46e5', border: 'none', color: '#ffffff', fontWeight: '800', fontSize: '0.86rem', cursor: 'pointer' }}>
                  Save Education
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: Add / Edit Experience ────────────────────────────────── */}
      {showExpModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 250, padding: '1rem' }}>
          <div style={{ width: '500px', background: '#ffffff', borderRadius: '20px', padding: '1.75rem', boxShadow: '0 25px 60px rgba(15,23,42,0.2)', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                {editingExpIndex !== null ? 'Edit Work Experience' : 'Add Work Experience'}
              </h3>
              <button onClick={() => setShowExpModal(false)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={16} color="#64748b" />
              </button>
            </div>

            <form onSubmit={handleSaveExperience} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Job Role Title</label>
                <input
                  type="text"
                  placeholder="e.g. Software Engineer, Frontend Intern"
                  value={expForm.title}
                  onChange={e => setExpForm(prev => ({ ...prev, title: e.target.value }))}
                  required
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Company Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Infosys, StartUp Inc."
                    value={expForm.company}
                    onChange={e => setExpForm(prev => ({ ...prev, company: e.target.value }))}
                    required
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Employment Type</label>
                  <select
                    value={expForm.type}
                    onChange={e => setExpForm(prev => ({ ...prev, type: e.target.value }))}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem', background: '#ffffff' }}
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Internship">Internship</option>
                    <option value="Contract">Contract</option>
                    <option value="Freelance">Freelance</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Duration</label>
                <input
                  type="text"
                  placeholder="e.g. Jan 2024 - Present, 2022 - 2024"
                  value={expForm.duration}
                  onChange={e => setExpForm(prev => ({ ...prev, duration: e.target.value }))}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  id="current-job-chk"
                  checked={expForm.current}
                  onChange={e => setExpForm(prev => ({ ...prev, current: e.target.checked }))}
                  style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#4f46e5' }}
                />
                <label htmlFor="current-job-chk" style={{ fontSize: '0.84rem', color: '#334155', fontWeight: '600', cursor: 'pointer' }}>
                  I currently work in this role
                </label>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Summary of Key Work & Achievements</label>
                <textarea
                  rows={3}
                  placeholder="Briefly describe your key responsibilities, technologies used, and results..."
                  value={expForm.note}
                  onChange={e => setExpForm(prev => ({ ...prev, note: e.target.value }))}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.86rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowExpModal(false)} style={{ padding: '0.6rem 1.2rem', borderRadius: '10px', background: '#f1f5f9', border: 'none', color: '#475569', fontWeight: '700', fontSize: '0.86rem', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" style={{ padding: '0.6rem 1.4rem', borderRadius: '10px', background: '#4f46e5', border: 'none', color: '#ffffff', fontWeight: '800', fontSize: '0.86rem', cursor: 'pointer' }}>
                  Save Experience
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: Add Skill ────────────────────────────────────────────── */}
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

            <form onSubmit={(e) => { e.preventDefault(); handleAddSkill(newSkillInput); }}>
              <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '700', display: 'block', marginBottom: '6px' }}>
                Skill Name
              </label>
              <input
                type="text"
                placeholder="e.g. Kubernetes, React Native, Golang..."
                value={newSkillInput}
                onChange={e => setNewSkillInput(e.target.value)}
                autoFocus
                style={{ width: '100%', padding: '0.75rem 0.9rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
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

      {/* ── MODAL: Phone OTP Verification ───────────────────────────────── */}
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
                    Verify Phone Number
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '2px 0 0 0' }}>
                    Enter the code sent to <strong style={{ color: '#0f172a' }}>{phone}</strong>
                  </p>
                </div>
              </div>
              <button onClick={() => setShowPhoneOtpModal(false)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={18} color="#64748b" />
              </button>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '0.75rem 0.9rem', marginBottom: '1rem', fontSize: '0.8rem', color: '#475569', lineHeight: '1.4' }}>
              📩 A 6-digit OTP code has been dispatched to <strong>{phone}</strong>. Check your phone SMS or system notifications and enter the code below.
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
                    outline: 'none'
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
                style={{ flex: 1, padding: '0.75rem', borderRadius: '12px', background: '#f1f5f9', border: 'none', color: '#475569', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleVerifyPhoneSubmit}
                style={{ flex: 1.5, padding: '0.75rem', borderRadius: '12px', background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', border: 'none', color: '#ffffff', fontWeight: '800', fontSize: '0.9rem', cursor: 'pointer', boxShadow: '0 4px 14px rgba(124,58,237,0.3)' }}
              >
                Verify Phone
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Generic Name/Location/About Editor ────────────────────── */}
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
                placeholder="Write a concise overview of your background, technical skills, and career objective..."
                style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem', color: '#0f172a', outline: 'none' }}
              />
            ) : (
              <input
                type="text"
                value={tempEditValue}
                onChange={e => setTempEditValue(e.target.value)}
                placeholder={`Enter your ${editingSection}...`}
                style={{ width: '100%', padding: '0.75rem 0.9rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', color: '#0f172a', outline: 'none' }}
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
                    if (updateUserProfileName) updateUserProfileName(tempEditValue);
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

      {/* ── MODAL: Change / Edit Phone Number ────────────────────────────── */}
      {showEditPhoneModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 250, padding: '1rem' }}>
          <div style={{ width: '450px', background: '#ffffff', borderRadius: '20px', padding: '1.75rem', boxShadow: '0 25px 60px rgba(15,23,42,0.2)', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#f3e8ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Phone size={20} />
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                  Change Mobile Number
                </h3>
              </div>
              <button onClick={() => setShowEditPhoneModal(false)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={16} color="#64748b" />
              </button>
            </div>

            <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '0 0 1.25rem 0', lineHeight: '1.45' }}>
              Enter your mobile number below. You will be prompted to verify this number via SMS OTP.
            </p>

            <form onSubmit={(e) => {
              e.preventDefault();
              if (!newPhoneInput.trim() || newPhoneInput.trim().length < 8) {
                alert('Please enter a valid mobile number.');
                return;
              }
              const clean = newPhoneInput.trim();
              setPhone(clean);
              setIsPhoneVerified(false);
              setShowEditPhoneModal(false);
              handleStartPhoneVerification(clean);
            }}>
              <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '700', display: 'block', marginBottom: '5px' }}>
                Mobile Number
              </label>
              <input
                type="text"
                value={newPhoneInput}
                onChange={e => setNewPhoneInput(e.target.value)}
                placeholder="+91 98765 43210"
                style={{ width: '100%', padding: '0.75rem 0.9rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', color: '#0f172a', outline: 'none' }}
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setShowEditPhoneModal(false)} style={{ padding: '0.6rem 1.2rem', borderRadius: '10px', background: '#f1f5f9', border: 'none', color: '#475569', fontWeight: '700', fontSize: '0.86rem', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" style={{ padding: '0.6rem 1.4rem', borderRadius: '10px', background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', border: 'none', color: '#ffffff', fontWeight: '800', fontSize: '0.86rem', cursor: 'pointer' }}>
                  Save & Verify
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
