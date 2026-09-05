import React, { useState } from 'react';
import {
  Briefcase,
  Users,
  UserCheck,
  Calendar,
  Award,
  Plus,
  ChevronRight,
  TrendingUp,
  MoreVertical,
  Bell,
  HelpCircle,
  Search,
  ExternalLink,
  CheckCircle2,
  X,
  FileText,
  Globe,
  Check,
  ArrowRight,
  ChevronDown,
  Layers,
  Crown,
  MessageSquare,
  Settings,
  PieChart,
  BarChart2,
  ShieldAlert,
  AlertTriangle,
  Lock,
  Building
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useJobs } from '../context/JobContext';
import RecruiterFeatureLock from './RecruiterFeatureLock';
import { isRecruiterUnlocked, getRecruiterSubscription } from '../utils/subscriptionUtils';

export default function RecruiterDashboard({ setActiveTab }) {
  const { user } = useAuth();
  const { jobs, applications, addJob, updateApplicationStatusByRecruiter } = useJobs();

  // Dual Post Job Modal States
  const [showPostModal, setShowPostModal] = useState(false);
  const [postStep, setPostStep] = useState(1); // Step 1: Choice, Step 2: Form
  const [appMethod, setAppMethod] = useState('careonix'); // 'careonix' | 'external'

  const [postForm, setPostForm] = useState({
    title: '',
    company: user?.company || 'TechNova Solutions',
    location: 'Bangalore, Karnataka',
    type: 'Full-time',
    currency: 'INR',
    salary: '12,00,000 - 18,00,000',
    experience: '2-4 Yrs',
    lastDateToApply: '2026-08-31',
    skills: 'Java, Spring Boot, React, MySQL',
    applyUrl: 'https://technova.careers/apply/java-dev',
    logoUrl: null
  });
  const [postSuccess, setPostSuccess] = useState('');

  // Selected Job Details Modal
  const [selectedJobDetails, setSelectedJobDetails] = useState(null);

  // Applications Drawer State
  const [showApplicationsModal, setShowApplicationsModal] = useState(false);
  const [selectedAppForStatus, setSelectedAppForStatus] = useState(null);

  const handlePostSubmit = (e) => {
    e.preventDefault();
    if (!postForm.title) return;

    addJob({
      ...postForm,
      applicationMethod: appMethod,
      applyUrl: appMethod === 'external' ? postForm.applyUrl : ''
    }, user);

    setPostSuccess('🎉 Job vacancy published successfully!');
    setTimeout(() => {
      setPostSuccess('');
      setShowPostModal(false);
      setPostStep(1);
      setPostForm({
        title: '',
        company: user?.company || 'TechNova Solutions',
        location: 'Bangalore, Karnataka',
        type: 'Full-time',
        currency: 'INR',
        salary: '12,00,000 - 18,00,000',
        experience: '2-4 Yrs',
        lastDateToApply: '2026-08-31',
        skills: 'Java, Spring Boot, React, MySQL',
        applyUrl: 'https://technova.careers/apply/java-dev',
        logoUrl: null
      });
    }, 1200);
  };

  const isUnlocked = isRecruiterUnlocked(user);
  const currentSubscription = getRecruiterSubscription(user?.email || user?.identifier);
  const isApprovedByAdmin = user?.approvalStatus === 'APPROVED' || user?.approvalStatus === 'Verified';

  // ── PENDING & NOT SUBSCRIBED: Show locked dashboard with subscription options ─────
  if (!isUnlocked) {
    return <RecruiterFeatureLock featureName="Recruiter Dashboard" setActiveTab={setActiveTab} />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', background: '#f8fafc', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      
      {/* ── Active Subscription Notification Banner ── */}
      {currentSubscription && currentSubscription.status === 'ACTIVE' && (
        <div style={{
          background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
          border: '1.5px solid #c4b5fd',
          borderRadius: '16px',
          padding: '0.9rem 1.35rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          boxShadow: '0 4px 14px rgba(124, 58, 237, 0.08)',
          flexWrap: 'wrap', gap: '0.75rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#7c3aed', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Crown size={18} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span style={{ fontWeight: '800', fontSize: '0.95rem', color: '#4c1d95' }}>
                  Active Subscription: {currentSubscription.planName}
                </span>
                <span style={{ background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0', padding: '2px 8px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: '800' }}>
                  ACTIVE (UNLOCKED)
                </span>
              </div>
              <div style={{ fontSize: '0.82rem', color: '#6d28d9', marginTop: '2px' }}>
                ⏳ <strong>{currentSubscription.daysRemaining} days remaining</strong> (Valid until {currentSubscription.formattedExpiry})
              </div>
            </div>
          </div>
          <button
            onClick={() => setActiveTab && setActiveTab('subscriptions')}
            style={{
              background: '#7c3aed', color: 'white', border: 'none',
              padding: '0.5rem 1.1rem', borderRadius: '10px',
              fontWeight: '700', fontSize: '0.84rem', cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(124, 58, 237, 0.25)'
            }}
          >
            Upgrade / Renew Plan
          </button>
        </div>
      )}
      
      {/* ── Top Header Welcome & Action Row ─────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.85rem' }}>
        <div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: '800', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            Welcome back, Recruiter! 👋
          </h1>
          <p style={{ color: '#64748b', marginTop: '4px', fontSize: '0.88rem' }}>
            Here's what's happening with your jobs today.
          </p>
        </div>

        <button
          onClick={() => {
            if (user?.approvalStatus === 'PENDING_APPROVAL' || user?.approvalStatus === 'PENDING') {
              setActiveTab && setActiveTab('post-job');
            } else {
              setShowPostModal(true);
              setPostStep(1);
            }
          }}
          style={{
            padding: '0.75rem 1.4rem',
            background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '12px',
            fontWeight: '800',
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            boxShadow: '0 4px 14px rgba(124,58,237,0.3)',
            fontFamily: 'Inter, sans-serif'
          }}
        >
          {(user?.approvalStatus === 'PENDING_APPROVAL' || user?.approvalStatus === 'PENDING') ? <Lock size={16} /> : <Plus size={18} />} Post a New Job
        </button>
      </div>

      {/* ── Recruiter Pending Verification Status Banner ──────────────────── */}
      {(user?.approvalStatus === 'PENDING_APPROVAL' || user?.approvalStatus === 'PENDING') && (
        <div style={{
          background: 'linear-gradient(135deg, #fffbeb, #fef3c7)',
          border: '1.5px solid #fcd34d',
          borderRadius: '18px',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.25rem',
          boxShadow: '0 4px 15px rgba(245, 158, 11, 0.12)',
          margin: '0.5rem 0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '46px', height: '46px', borderRadius: '14px', background: '#fef3c7', border: '1.5px solid #f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706', flexShrink: 0 }}>
              <ShieldAlert size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '3px' }}>
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '800', color: '#78350f' }}>Your recruiter account is pending verification</h4>
                <span style={{ background: '#ffffff', border: '1px solid #f59e0b', color: '#b45309', padding: '2px 9px', borderRadius: '50px', fontSize: '0.75rem', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#d97706' }} /> Verification Status: 🟡 Pending
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#92400e', fontWeight: '500' }}>
                Your account is under review. Complete your company information and verification details to unlock full recruiter features.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab && setActiveTab('profile')}
            style={{
              padding: '0.65rem 1.15rem',
              background: '#d97706',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              fontWeight: '800',
              fontSize: '0.85rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              boxShadow: '0 2px 8px rgba(217, 119, 6, 0.3)'
            }}
          >
            <Building size={16} /> Complete Company Profile <ChevronRight size={15} />
          </button>
        </div>
      )}

      {/* ── 5 Metric KPI Cards Row ────────────────────────────────────────── */}
      {(() => {
        const recruiterEmail = (user?.email || '').toLowerCase().trim();
        const recruiterIdentifier = (user?.identifier || '').toLowerCase().trim();
        const recruiterName = (user?.name || '').toLowerCase().trim();
        const recruiterCompany = (user?.company || '').toLowerCase().trim();

        const recruiterJobs = (jobs || []).filter(j => {
          const p = (j.postedBy || '').toLowerCase().trim();
          const jComp = (j.company || '').toLowerCase().trim();
          if (p && (p === recruiterEmail || p === recruiterIdentifier || (recruiterName && p === recruiterName))) return true;
          if (recruiterCompany && jComp && jComp === recruiterCompany) return true;
          // If no specific match, also show if postedBy contains part of email
          if (recruiterEmail && p && (recruiterEmail.includes(p) || p.includes(recruiterEmail))) return true;
          return false;
        });

        const recruiterApps = (applications || []).filter(a =>
          recruiterJobs.some(rj => String(rj.id) === String(a.jobId) || rj.title?.toLowerCase() === a.jobTitle?.toLowerCase())
        );

        const activeJobsCount = recruiterJobs.filter(j => (j.status || 'ACTIVE').toUpperCase() === 'ACTIVE').length;
        const totalAppsCount = recruiterApps.length;
        const shortlistedCount = recruiterApps.filter(a => (a.status || '').toUpperCase() === 'SHORTLISTED').length;
        const interviewsCount = recruiterApps.filter(a => (a.status || '').toUpperCase() === 'INTERVIEW').length;
        const hiredCount = recruiterApps.filter(a => (a.status || '').toUpperCase() === 'HIRED' || (a.status || '').toUpperCase() === 'ACCEPTED').length;
        const rejectedCount = recruiterApps.filter(a => (a.status || '').toUpperCase() === 'REJECTED').length;
        const appliedCount = Math.max(0, totalAppsCount - (shortlistedCount + interviewsCount + hiredCount + rejectedCount));

        const realTopJobs = recruiterJobs.map((j, idx) => {
          const jobApps = recruiterApps.filter(a => String(a.jobId) === String(j.id) || a.jobTitle?.toLowerCase() === j.title?.toLowerCase());
          return {
            id: j.id || `job-${idx}`,
            title: j.title,
            company: j.company,
            loc: j.location || 'Remote',
            apps: jobApps.length,
            shortlisted: jobApps.filter(a => (a.status || '').toUpperCase() === 'SHORTLISTED').length,
            interviews: jobApps.filter(a => (a.status || '').toUpperCase() === 'INTERVIEW').length,
            hired: jobApps.filter(a => (a.status || '').toUpperCase() === 'HIRED' || (a.status || '').toUpperCase() === 'ACCEPTED').length,
            status: (j.status || 'Active').charAt(0).toUpperCase() + (j.status || 'active').slice(1).toLowerCase(),
            type: j.type || 'Full-time'
          };
        }).sort((a, b) => b.apps - a.apps);

        const calcPct = (cnt) => totalAppsCount > 0 ? Math.round((cnt / totalAppsCount) * 100) : 0;
        const appliedPct = calcPct(appliedCount);
        const shortlistedPct = calcPct(shortlistedCount);
        const interviewsPct = calcPct(interviewsCount);
        const hiredPct = calcPct(hiredCount);
        const rejectedPct = calcPct(rejectedCount);

        const circ = 238.76;
        const dashApplied = totalAppsCount > 0 ? (appliedCount / totalAppsCount) * circ : 0;
        const dashShortlisted = totalAppsCount > 0 ? (shortlistedCount / totalAppsCount) * circ : 0;
        const dashInterviews = totalAppsCount > 0 ? (interviewsCount / totalAppsCount) * circ : 0;
        const dashHired = totalAppsCount > 0 ? (hiredCount / totalAppsCount) * circ : 0;
        const dashRejected = totalAppsCount > 0 ? (rejectedCount / totalAppsCount) * circ : 0;

        return (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem' }}>
              
              {/* Card 1: Active Jobs */}
              <div
                onClick={() => setActiveTab && setActiveTab('jobs')}
                style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.15rem 1.25rem', boxShadow: '0 1px 4px rgba(15,23,42,0.02)', cursor: 'pointer', transition: 'all 0.2s ease' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#7c3aed'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(124, 58, 237, 0.12)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(15,23,42,0.02)'; }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#f3e8ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Briefcase size={20} />
                  </div>
                  <ChevronRight size={16} color="#94a3b8" />
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '700' }}>Active Jobs</div>
                <div style={{ fontSize: '1.75rem', fontWeight: '900', color: '#0f172a', margin: '2px 0 6px 0', lineHeight: 1 }}>{activeJobsCount}</div>
                <div style={{ fontSize: '0.74rem', color: '#16a34a', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16a34a' }} /> Published by you
                </div>
              </div>

              {/* Card 2: Total Applications */}
              <div
                onClick={() => setActiveTab && setActiveTab('applications')}
                style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.15rem 1.25rem', boxShadow: '0 1px 4px rgba(15,23,42,0.02)', cursor: 'pointer', transition: 'all 0.2s ease' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#2563eb'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(37, 99, 235, 0.12)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(15,23,42,0.02)'; }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Users size={20} />
                  </div>
                  <ChevronRight size={16} color="#94a3b8" />
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '700' }}>Total Applications</div>
                <div style={{ fontSize: '1.75rem', fontWeight: '900', color: '#0f172a', margin: '2px 0 6px 0', lineHeight: 1 }}>{totalAppsCount}</div>
                <div style={{ fontSize: '0.74rem', color: '#16a34a', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <TrendingUp size={12} /> Received on your listings
                </div>
              </div>

              {/* Card 3: Shortlisted */}
              <div
                onClick={() => setActiveTab && setActiveTab('applications')}
                style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.15rem 1.25rem', boxShadow: '0 1px 4px rgba(15,23,42,0.02)', cursor: 'pointer', transition: 'all 0.2s ease' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#16a34a'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(22, 163, 74, 0.12)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(15,23,42,0.02)'; }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <UserCheck size={20} />
                  </div>
                  <ChevronRight size={16} color="#94a3b8" />
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '700' }}>Shortlisted</div>
                <div style={{ fontSize: '1.75rem', fontWeight: '900', color: '#0f172a', margin: '2px 0 6px 0', lineHeight: 1 }}>{shortlistedCount}</div>
                <div style={{ fontSize: '0.74rem', color: '#16a34a', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <TrendingUp size={12} /> Shortlisted candidates
                </div>
              </div>

              {/* Card 4: Interviews */}
              <div
                onClick={() => setActiveTab && setActiveTab('applications')}
                style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.15rem 1.25rem', boxShadow: '0 1px 4px rgba(15,23,42,0.02)', cursor: 'pointer', transition: 'all 0.2s ease' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#d97706'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(217, 119, 6, 0.12)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(15,23,42,0.02)'; }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#fffbe6', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Calendar size={20} />
                  </div>
                  <ChevronRight size={16} color="#94a3b8" />
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '700' }}>Interviews</div>
                <div style={{ fontSize: '1.75rem', fontWeight: '900', color: '#0f172a', margin: '2px 0 6px 0', lineHeight: 1 }}>{interviewsCount}</div>
                <div style={{ fontSize: '0.74rem', color: '#d97706', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <TrendingUp size={12} /> Scheduled interviews
                </div>
              </div>

              {/* Card 5: Hired */}
              <div
                onClick={() => setActiveTab && setActiveTab('applications')}
                style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.15rem 1.25rem', boxShadow: '0 1px 4px rgba(15,23,42,0.02)', cursor: 'pointer', transition: 'all 0.2s ease' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#4f46e5'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(79, 70, 229, 0.12)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(15,23,42,0.02)'; }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#e0e7ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Award size={20} />
                  </div>
                  <ChevronRight size={16} color="#94a3b8" />
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '700' }}>Hired</div>
                <div style={{ fontSize: '1.75rem', fontWeight: '900', color: '#0f172a', margin: '2px 0 6px 0', lineHeight: 1 }}>{hiredCount}</div>
                <div style={{ fontSize: '0.74rem', color: '#16a34a', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <TrendingUp size={12} /> Successful hires
                </div>
              </div>

            </div>

            {/* ── Middle Section: Charts Row (2 Columns) ──────────────────────── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1.25rem', marginTop: '1.25rem' }}>
              
              {/* Left Chart: Applications Overview */}
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.5rem 1.75rem', boxShadow: '0 1px 6px rgba(15,23,42,0.03)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                    Applications Overview
                  </h3>
                  <select style={{ padding: '0.4rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.8rem', fontWeight: '600', color: '#475569', background: '#ffffff', outline: 'none', cursor: 'pointer' }}>
                    <option>Last 30 Days</option>
                    <option>Last 7 Days</option>
                    <option>Last 3 Months</option>
                  </select>
                </div>

                {/* Line Chart SVG Visualization */}
                <div style={{ width: '100%', height: '210px', position: 'relative' }}>
                  <svg width="100%" height="100%" viewBox="0 0 500 180" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.35" />
                        <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    
                    {/* Grid Lines */}
                    <line x1="30" y1="20" x2="480" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                    <line x1="30" y1="60" x2="480" y2="60" stroke="#f1f5f9" strokeWidth="1" />
                    <line x1="30" y1="100" x2="480" y2="100" stroke="#f1f5f9" strokeWidth="1" />
                    <line x1="30" y1="140" x2="480" y2="140" stroke="#e2e8f0" strokeWidth="1" />

                    {totalAppsCount > 0 ? (
                      <>
                        {/* Dynamic Area Fill */}
                        <path
                          d="M 30 140 Q 80 120 120 90 T 210 60 T 300 80 T 390 40 L 480 70 L 480 140 Z"
                          fill="url(#purpleGrad)"
                        />
                        {/* Dynamic Curve Line */}
                        <path
                          d="M 30 140 Q 80 120 120 90 T 210 60 T 300 80 T 390 40 L 480 70"
                          fill="none"
                          stroke="#7c3aed"
                          strokeWidth="3"
                          strokeLinecap="round"
                        />
                      </>
                    ) : (
                      <>
                        <path
                          d="M 30 140 Q 150 138 250 135 T 480 140 L 480 140 Z"
                          fill="url(#purpleGrad)"
                        />
                        <line x1="30" y1="140" x2="480" y2="140" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="6 4" />
                      </>
                    )}

                    {/* X Axis Labels */}
                    <text x="30" y="165" fontSize="11" fill="#94a3b8" textAnchor="middle">Week 1</text>
                    <text x="140" y="165" fontSize="11" fill="#94a3b8" textAnchor="middle">Week 2</text>
                    <text x="250" y="165" fontSize="11" fill="#94a3b8" textAnchor="middle">Week 3</text>
                    <text x="360" y="165" fontSize="11" fill="#94a3b8" textAnchor="middle">Week 4</text>
                    <text x="460" y="165" fontSize="11" fill="#94a3b8" textAnchor="middle">Today</text>
                  </svg>

                  {totalAppsCount === 0 && (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                      <span style={{ background: 'rgba(255,255,255,0.92)', border: '1px solid #e2e8f0', padding: '6px 14px', borderRadius: '12px', fontSize: '0.78rem', color: '#64748b', fontWeight: '700' }}>
                        📊 No applications received yet. Post a job to start seeing candidate analytics!
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Donut Chart: Applications by Status */}
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.5rem 1.75rem', boxShadow: '0 1px 6px rgba(15,23,42,0.03)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', margin: '0 0 1rem 0' }}>
                  Applications by Status
                </h3>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  {/* SVG Dynamic Donut Chart */}
                  <div style={{ position: 'relative', width: '130px', height: '130px', flexShrink: 0 }}>
                    <svg width="130" height="130" viewBox="0 0 100 100">
                      {totalAppsCount === 0 ? (
                        <circle cx="50" cy="50" r="38" fill="none" stroke="#e2e8f0" strokeWidth="14" />
                      ) : (
                        <>
                          <circle cx="50" cy="50" r="38" fill="none" stroke="#7c3aed" strokeWidth="14" strokeDasharray={`${dashApplied} ${circ}`} strokeDashoffset="0" />
                          <circle cx="50" cy="50" r="38" fill="none" stroke="#16a34a" strokeWidth="14" strokeDasharray={`${dashShortlisted} ${circ}`} strokeDashoffset={`-${dashApplied}`} />
                          <circle cx="50" cy="50" r="38" fill="none" stroke="#2563eb" strokeWidth="14" strokeDasharray={`${dashInterviews} ${circ}`} strokeDashoffset={`-${dashApplied + dashShortlisted}`} />
                          <circle cx="50" cy="50" r="38" fill="none" stroke="#4f46e5" strokeWidth="14" strokeDasharray={`${dashHired} ${circ}`} strokeDashoffset={`-${dashApplied + dashShortlisted + dashInterviews}`} />
                          <circle cx="50" cy="50" r="38" fill="none" stroke="#dc2626" strokeWidth="14" strokeDasharray={`${dashRejected} ${circ}`} strokeDashoffset={`-${dashApplied + dashShortlisted + dashInterviews + dashHired}`} />
                        </>
                      )}
                    </svg>
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Total</span>
                      <span style={{ fontSize: '1.2rem', fontWeight: '900', color: '#0f172a', lineHeight: '1.1' }}>{totalAppsCount}</span>
                    </div>
                  </div>

                  {/* Dynamic Legend List */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', width: '100%', fontSize: '0.78rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#475569', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#7c3aed' }} /> Applied
                      </span>
                      <strong style={{ color: '#0f172a' }}>{appliedCount} ({appliedPct}%)</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#475569', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#16a34a' }} /> Shortlisted
                      </span>
                      <strong style={{ color: '#0f172a' }}>{shortlistedCount} ({shortlistedPct}%)</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#475569', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2563eb' }} /> Interview
                      </span>
                      <strong style={{ color: '#0f172a' }}>{interviewsCount} ({interviewsPct}%)</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#475569', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4f46e5' }} /> Hired
                      </span>
                      <strong style={{ color: '#0f172a' }}>{hiredCount} ({hiredPct}%)</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#475569', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#dc2626' }} /> Rejected
                      </span>
                      <strong style={{ color: '#0f172a' }}>{rejectedCount} ({rejectedPct}%)</strong>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* ── Bottom Section: Top Performing Jobs + Right Sidebar ──────────── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 310px', gap: '1.5rem', alignItems: 'start', marginTop: '1.25rem' }}>
              
              {/* Left Table: Top Performing Jobs */}
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.5rem 1.75rem', boxShadow: '0 1px 6px rgba(15,23,42,0.03)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                    Top Performing Jobs
                  </h3>
                </div>

                <div className="table-responsive-wrapper">
                  <table style={{ width: '100%', minWidth: '540px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.76rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        <th style={{ padding: '0.65rem 0', fontWeight: '700' }}>Job Title</th>
                        <th style={{ padding: '0.65rem 0', fontWeight: '700', textAlign: 'center' }}>Applications</th>
                        <th style={{ padding: '0.65rem 0', fontWeight: '700', textAlign: 'center' }}>Shortlisted</th>
                        <th style={{ padding: '0.65rem 0', fontWeight: '700', textAlign: 'center' }}>Interviews</th>
                        <th style={{ padding: '0.65rem 0', fontWeight: '700', textAlign: 'center' }}>Hired</th>
                        <th style={{ padding: '0.65rem 0', fontWeight: '700', textAlign: 'right' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {realTopJobs.length === 0 ? (
                        <tr>
                          <td colSpan={6} style={{ padding: '2rem 1rem', textAlign: 'center', color: '#64748b' }}>
                            <Briefcase size={28} color="#94a3b8" style={{ marginBottom: '6px' }} />
                            <div style={{ fontWeight: '800', color: '#0f172a' }}>No jobs posted yet</div>
                            <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>Click "+ Post a New Job" above to publish your first vacancy!</div>
                          </td>
                        </tr>
                      ) : (
                        realTopJobs.map((j, i) => (
                          <tr key={i} style={{ borderBottom: i === realTopJobs.length - 1 ? 'none' : '1px solid #f1f5f9' }}>
                            <td style={{ padding: '0.9rem 0' }}>
                              <div style={{ fontWeight: '800', color: '#4f46e5', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16a34a' }} />
                                {j.title}
                              </div>
                              <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '2px' }}>{j.loc}</div>
                            </td>
                            <td style={{ padding: '0.9rem 0', textAlign: 'center', fontWeight: '800', color: '#0f172a' }}>{j.apps}</td>
                            <td style={{ padding: '0.9rem 0', textAlign: 'center', fontWeight: '700', color: '#475569' }}>{j.shortlisted}</td>
                            <td style={{ padding: '0.9rem 0', textAlign: 'center', fontWeight: '700', color: '#475569' }}>{j.interviews}</td>
                            <td style={{ padding: '0.9rem 0', textAlign: 'center', fontWeight: '700', color: '#475569' }}>{j.hired}</td>
                            <td style={{ padding: '0.9rem 0', textAlign: 'right' }}>
                              <button
                                onClick={() => setSelectedJobDetails(j)}
                                style={{
                                  padding: '0.4rem 0.85rem',
                                  borderRadius: '8px',
                                  background: '#ffffff',
                                  border: '1.5px solid #c7d2fe',
                                  color: '#4f46e5',
                                  fontSize: '0.78rem',
                                  fontWeight: '700',
                                  cursor: 'pointer'
                                }}
                              >
                                View Details
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div style={{ textAlign: 'center', marginTop: '1.25rem', paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9' }}>
                  <button
                    onClick={() => setActiveTab('jobs')}
                    style={{ background: 'none', border: 'none', color: '#4f46e5', fontSize: '0.86rem', fontWeight: '800', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  >
                    View all jobs <ArrowRight size={15} />
                  </button>
                </div>
              </div>

              {/* Right Sidebar: Recent Jobs + Quick Actions + Notifications */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                
                {/* Recent Jobs Box */}
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.35rem', boxShadow: '0 1px 6px rgba(15,23,42,0.03)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Recent Jobs</h3>
                    <button onClick={() => setActiveTab('jobs')} style={{ background: 'none', border: 'none', color: '#4f46e5', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer' }}>
                      View All
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {realTopJobs.length === 0 ? (
                      <div style={{ fontSize: '0.8rem', color: '#64748b', textAlign: 'center', padding: '1rem' }}>No recent jobs posted.</div>
                    ) : (
                      realTopJobs.slice(0, 4).map((rj, idx) => (
                        <div key={idx} style={{ padding: '0.65rem 0.75rem', borderRadius: '12px', background: '#f8fafc', border: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontSize: '0.84rem', fontWeight: '800', color: '#0f172a' }}>{rj.title}</div>
                            <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>{rj.loc} &bull; {rj.type}</div>
                            <div style={{ fontSize: '0.72rem', color: '#7c3aed', fontWeight: '700', marginTop: '2px' }}>Applications: {rj.apps}</div>
                          </div>
                          <span style={{
                            background: rj.status === 'Active' ? '#dcfce7' : '#fffbe6',
                            color: rj.status === 'Active' ? '#15803d' : '#d97706',
                            border: `1px solid ${rj.status === 'Active' ? '#bbf7d0' : '#fef08a'}`,
                            padding: '2px 8px',
                            borderRadius: '10px',
                            fontSize: '0.72rem',
                            fontWeight: '700'
                          }}>
                            {rj.status}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

          {/* Quick Actions Grid */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.35rem', boxShadow: '0 1px 6px rgba(15,23,42,0.03)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a', margin: '0 0 0.85rem 0' }}>Quick Actions</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', textAlign: 'center' }}>
              <div
                onClick={() => { setShowPostModal(true); setPostStep(1); }}
                style={{ background: '#f3e8ff', padding: '0.75rem 0.5rem', borderRadius: '12px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}
              >
                <Plus size={18} color="#7c3aed" />
                <span style={{ fontSize: '0.72rem', fontWeight: '700', color: '#581c87' }}>Post Job</span>
              </div>
              <div
                onClick={() => setActiveTab('applications')}
                style={{ background: '#eff6ff', padding: '0.75rem 0.5rem', borderRadius: '12px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}
              >
                <Users size={18} color="#2563eb" />
                <span style={{ fontSize: '0.72rem', fontWeight: '700', color: '#1e40af' }}>View Apps</span>
              </div>
              <div
                onClick={() => setActiveTab('candidates')}
                style={{ background: '#f0fdf4', padding: '0.75rem 0.5rem', borderRadius: '12px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}
              >
                <UserCheck size={18} color="#16a34a" />
                <span style={{ fontSize: '0.72rem', fontWeight: '700', color: '#166534' }}>Search</span>
              </div>
              <div
                onClick={() => setActiveTab('reports')}
                style={{ background: '#fffbeb', padding: '0.75rem 0.5rem', borderRadius: '12px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}
              >
                <BarChart2 size={18} color="#d97706" />
                <span style={{ fontSize: '0.72rem', fontWeight: '700', color: '#92400e' }}>Reports</span>
              </div>
            </div>
          </div>

          {/* Notifications Panel */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.35rem', boxShadow: '0 1px 6px rgba(15,23,42,0.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Notifications</h3>
              <button onClick={() => setActiveTab('messages')} style={{ background: 'none', border: 'none', color: '#4f46e5', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer' }}>
                View All
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.78rem' }}>
              <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'flex-start' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Users size={14} />
                </div>
                <div>
                  <strong style={{ color: '#0f172a', display: 'block' }}>New application received</strong>
                  <span style={{ color: '#64748b' }}>Java Developer &bull; 2m ago</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'flex-start' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <CheckCircle2 size={14} />
                </div>
                <div>
                  <strong style={{ color: '#0f172a', display: 'block' }}>Candidate shortlisted</strong>
                  <span style={{ color: '#64748b' }}>Frontend Developer (React) &bull; 1h ago</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'flex-start' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#fffbe6', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Calendar size={14} />
                </div>
                <div>
                  <strong style={{ color: '#0f172a', display: 'block' }}>Interview scheduled</strong>
                  <span style={{ color: '#64748b' }}>Backend Developer (Node.js) &bull; 3h ago</span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </>
  );
})()}

      {/* ── MODAL: Post a Job Dual Selection (Step 1 & Step 2) ────────── */}
      {showPostModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: '1rem', overflowY: 'auto' }}>
          <div style={{ width: '640px', maxHeight: '90vh', overflowY: 'auto', background: '#ffffff', borderRadius: '24px', padding: '2rem', boxShadow: '0 25px 60px rgba(15,23,42,0.2)', border: '1px solid #e2e8f0' }}>
            
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                  {postStep === 1 ? 'Select Application Method' : 'Post New Job Vacancy'}
                </h2>
                <p style={{ fontSize: '0.83rem', color: '#64748b', marginTop: '3px' }}>
                  {postStep === 1 ? 'Choose how candidates will apply for this position.' : 'Fill in the vacancy details to publish to candidate portal.'}
                </p>
              </div>
              <button onClick={() => setShowPostModal(false)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={18} color="#64748b" />
              </button>
            </div>

            {postSuccess && (
              <div style={{ background: '#dcfce7', border: '1px solid #bbf7d0', color: '#15803d', borderRadius: '12px', padding: '0.85rem 1rem', marginBottom: '1.25rem', fontWeight: '700', fontSize: '0.9rem', textAlign: 'center' }}>
                {postSuccess}
              </div>
            )}

            {/* STEP 1: Application Method Selection Screen */}
            {postStep === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                
                {/* Choice A: Apply on CAREONIX */}
                <div
                  onClick={() => setAppMethod('careonix')}
                  style={{
                    border: `2px solid ${appMethod === 'careonix' ? '#7c3aed' : '#e2e8f0'}`,
                    background: appMethod === 'careonix' ? '#faf5ff' : '#ffffff',
                    borderRadius: '18px',
                    padding: '1.4rem 1.5rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '1.15rem',
                    boxShadow: appMethod === 'careonix' ? '0 4px 16px rgba(124,58,237,0.1)' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {/* Radio Ring */}
                  <div style={{ width: '22px', height: '22px', borderRadius: '50%', border: `2px solid ${appMethod === 'careonix' ? '#7c3aed' : '#cbd5e1'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '4px' }}>
                    {appMethod === 'careonix' && <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#7c3aed' }} />}
                  </div>

                  {/* Icon Box */}
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#f3e8ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <FileText size={22} />
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.65rem' }}>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                        Apply on CAREONIX
                      </h4>
                      <span style={{ background: '#f3e8ff', color: '#7c3aed', padding: '3px 10px', borderRadius: '12px', fontSize: '0.76rem', fontWeight: '700' }}>
                        Recommended
                      </span>
                    </div>

                    {/* 4 Bullet checkmarks */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.86rem', color: '#334155' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <CheckCircle2 size={16} color="#16a34a" style={{ flexShrink: 0 }} />
                        <span>Candidates apply directly on CAREONIX</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <CheckCircle2 size={16} color="#16a34a" style={{ flexShrink: 0 }} />
                        <span>You receive applications in your Recruiter Portal</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <CheckCircle2 size={16} color="#16a34a" style={{ flexShrink: 0 }} />
                        <span>Manage candidate status (Shortlisted, Interview, Hired, Rejected)</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <CheckCircle2 size={16} color="#16a34a" style={{ flexShrink: 0 }} />
                        <span>Candidate status updates automatically on their portal</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Choice B: Apply on External Website */}
                <div
                  onClick={() => setAppMethod('external')}
                  style={{
                    border: `2px solid ${appMethod === 'external' ? '#7c3aed' : '#e2e8f0'}`,
                    background: appMethod === 'external' ? '#faf5ff' : '#ffffff',
                    borderRadius: '18px',
                    padding: '1.4rem 1.5rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '1.15rem',
                    boxShadow: appMethod === 'external' ? '0 4px 16px rgba(124,58,237,0.1)' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {/* Radio Ring */}
                  <div style={{ width: '22px', height: '22px', borderRadius: '50%', border: `2px solid ${appMethod === 'external' ? '#7c3aed' : '#cbd5e1'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '4px' }}>
                    {appMethod === 'external' && <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#7c3aed' }} />}
                  </div>

                  {/* Icon Box */}
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Globe size={22} />
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.65rem' }}>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                        Apply on External Website
                      </h4>
                      <span style={{ background: '#eff6ff', color: '#2563eb', padding: '3px 10px', borderRadius: '12px', fontSize: '0.76rem', fontWeight: '700' }}>
                        Redirect URL
                      </span>
                    </div>

                    {/* 3 Bullet checkmarks */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.86rem', color: '#334155' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <CheckCircle2 size={16} color="#16a34a" style={{ flexShrink: 0 }} />
                        <span>Provide your company's existing career page / ATS URL</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <CheckCircle2 size={16} color="#16a34a" style={{ flexShrink: 0 }} />
                        <span>Candidates will be redirected to your external portal</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <CheckCircle2 size={16} color="#16a34a" style={{ flexShrink: 0 }} />
                        <span>You manage candidate status manually</span>
                      </div>
                    </div>

                    <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.55rem' }}>
                      Examples: careers.company.com, lever.co, greenhouse.io, etc.
                    </div>
                  </div>
                </div>

                {/* Cancel & Continue Buttons */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button
                    onClick={() => setShowPostModal(false)}
                    style={{
                      padding: '0.75rem 1.6rem',
                      borderRadius: '12px',
                      background: '#f8fafc',
                      border: '1px solid #cbd5e1',
                      color: '#475569',
                      fontWeight: '700',
                      fontSize: '0.9rem',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setPostStep(2)}
                    style={{
                      padding: '0.75rem 1.8rem',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                      border: 'none',
                      color: '#ffffff',
                      fontWeight: '800',
                      fontSize: '0.92rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: '0 4px 14px rgba(124,58,237,0.25)'
                    }}
                  >
                    Continue to Job Form &rarr;
                  </button>
                </div>

                {/* Bottom Alert Banner: You can't change this later */}
                <div style={{
                  background: '#faf5ff',
                  border: '1px solid #ede9fe',
                  borderRadius: '14px',
                  padding: '0.85rem 1.15rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  marginTop: '0.25rem'
                }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#ede9fe', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: '800' }}>
                    ⓘ
                  </div>
                  <div>
                    <strong style={{ fontSize: '0.86rem', color: '#0f172a', display: 'block' }}>You can't change this later</strong>
                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>The application method you choose now will apply to this job post.</span>
                  </div>
                </div>

              </div>
            )}

            {/* STEP 2: Job Details Form */}
            {postStep === 2 && (
              <form onSubmit={handlePostSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ background: '#f8fafc', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#0f172a' }}>
                    Method: {appMethod === 'careonix' ? '🟣 Apply on CAREONIX (Direct Internal)' : '🌐 Apply on External Website'}
                  </span>
                  <button type="button" onClick={() => setPostStep(1)} style={{ background: 'none', border: 'none', color: '#7c3aed', fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer' }}>
                    Change Method
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Job Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Senior Java Developer"
                      value={postForm.title}
                      onChange={e => setPostForm({ ...postForm, title: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem', fontFamily: 'Inter, sans-serif' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Company Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. TechNova Solutions"
                      value={postForm.company}
                      onChange={e => setPostForm({ ...postForm, company: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem', fontFamily: 'Inter, sans-serif' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Location</label>
                    <input
                      type="text"
                      placeholder="e.g. Bangalore, Karnataka"
                      value={postForm.location}
                      onChange={e => setPostForm({ ...postForm, location: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem', fontFamily: 'Inter, sans-serif' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Job Type</label>
                    <select
                      value={postForm.type}
                      onChange={e => setPostForm({ ...postForm, type: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem', fontFamily: 'Inter, sans-serif', background: '#ffffff' }}
                    >
                      <option>Full-time</option>
                      <option>Part-time</option>
                      <option>Contract</option>
                      <option>Internship</option>
                      <option>Remote</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Salary Range</label>
                    <input
                      type="text"
                      placeholder="e.g. ₹12,00,000 - ₹18,00,000"
                      value={postForm.salary}
                      onChange={e => setPostForm({ ...postForm, salary: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem', fontFamily: 'Inter, sans-serif' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Experience Required</label>
                    <input
                      type="text"
                      placeholder="e.g. 2-4 Yrs"
                      value={postForm.experience}
                      onChange={e => setPostForm({ ...postForm, experience: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem', fontFamily: 'Inter, sans-serif' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Skills (comma separated)</label>
                  <input
                    type="text"
                    placeholder="Java, Spring Boot, React, MySQL"
                    value={postForm.skills}
                    onChange={e => setPostForm({ ...postForm, skills: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem', fontFamily: 'Inter, sans-serif' }}
                  />
                </div>

                {/* External URL field ONLY shown if method is external */}
                {appMethod === 'external' && (
                  <div>
                    <label style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>External Career Page URL *</label>
                    <input
                      type="text"
                      required
                      placeholder="https://careers.google.com/jobs/101"
                      value={postForm.applyUrl}
                      onChange={e => setPostForm({ ...postForm, applyUrl: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem', fontFamily: 'Inter, sans-serif' }}
                    />
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                  <button type="button" onClick={() => setPostStep(1)} style={{ padding: '0.75rem 1.25rem', borderRadius: '12px', background: '#f1f5f9', border: 'none', color: '#475569', fontWeight: '700', cursor: 'pointer' }}>
                    Back
                  </button>
                  <button
                    type="submit"
                    style={{
                      padding: '0.75rem 1.6rem',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                      border: 'none',
                      color: '#ffffff',
                      fontWeight: '800',
                      fontSize: '0.9rem',
                      cursor: 'pointer'
                    }}
                  >
                    Publish Vacancy Now
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

      {/* ── MODAL: View Top Job Details ─────────────────────────────────── */}
      {selectedJobDetails && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 250, padding: '1rem' }}>
          <div style={{ width: '520px', background: '#ffffff', borderRadius: '20px', padding: '1.75rem', boxShadow: '0 25px 60px rgba(15,23,42,0.2)', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>{selectedJobDetails.title}</h3>
                <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '2px 0 0 0' }}>{selectedJobDetails.loc}</p>
              </div>
              <button onClick={() => setSelectedJobDetails(null)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={16} color="#64748b" />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', textAlign: 'center', marginBottom: '1.5rem', background: '#f8fafc', padding: '1rem', borderRadius: '14px', border: '1px solid #f1f5f9' }}>
              <div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700' }}>Applications</div>
                <div style={{ fontSize: '1.3rem', fontWeight: '900', color: '#0f172a' }}>{selectedJobDetails.apps}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700' }}>Shortlisted</div>
                <div style={{ fontSize: '1.3rem', fontWeight: '900', color: '#16a34a' }}>{selectedJobDetails.shortlisted}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700' }}>Interviews</div>
                <div style={{ fontSize: '1.3rem', fontWeight: '900', color: '#2563eb' }}>{selectedJobDetails.interviews}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700' }}>Hired</div>
                <div style={{ fontSize: '1.3rem', fontWeight: '900', color: '#7c3aed' }}>{selectedJobDetails.hired}</div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button onClick={() => setSelectedJobDetails(null)} style={{ padding: '0.6rem 1.2rem', borderRadius: '10px', background: '#f1f5f9', border: 'none', color: '#475569', fontWeight: '700', cursor: 'pointer' }}>
                Close
              </button>
              <button onClick={() => { setSelectedJobDetails(null); setActiveTab('applications'); }} style={{ padding: '0.6rem 1.4rem', borderRadius: '10px', background: '#4f46e5', border: 'none', color: '#ffffff', fontWeight: '800', cursor: 'pointer' }}>
                Manage Applications
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
