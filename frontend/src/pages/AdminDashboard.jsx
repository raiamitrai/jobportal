import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Users,
  CheckCircle2,
  Plus,
  TrendingUp,
  TrendingDown,
  FileText,
  Building,
  ArrowUpRight,
  ArrowDownRight,
  User,
  Calendar,
  Globe,
  Edit3,
  Trash2,
  ChevronDown,
  ChevronRight,
  Clock,
  AlertTriangle,
  UserCheck,
  ShieldCheck,
  Flag,
  UserPlus,
  BarChart2,
  Check,
  Filter,
  Activity,
  Server
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useJobs } from '../context/JobContext';
import { isJobExpired } from '../utils/timeAgo';

export default function AdminDashboard({ setActiveTab }) {
  const { registeredUsers, user, approveRecruiter, rejectRecruiter } = useAuth();
  const { jobs, applications, addJob, updateJob, deleteJob } = useJobs();

  const totalUsersCount = (registeredUsers || []).length;
  const candidatesCount = (registeredUsers || []).filter(u => u.accountType === 'candidate' || (!u.accountType && !u.company)).length;
  const verifiedRecruitersCount = (registeredUsers || []).filter(u => u.accountType === 'recruiter' && (u.approvalStatus === 'APPROVED' || u.approvalStatus === 'VERIFIED')).length;
  const pendingRecruitersCount = (registeredUsers || []).filter(u => u.accountType === 'recruiter' && (u.approvalStatus === 'PENDING_APPROVAL' || u.approvalStatus === 'PENDING')).length;

  const suspendedUsersCount = (registeredUsers || []).filter(u => 
    (u.status || '').toLowerCase() === 'suspended' || 
    (u.approvalStatus || '').toLowerCase() === 'suspended'
  ).length;

  const candPct = totalUsersCount > 0 ? Math.round((candidatesCount / totalUsersCount) * 100) : 0;
  const verPct = totalUsersCount > 0 ? Math.round((verifiedRecruitersCount / totalUsersCount) * 100) : 0;
  const pendPct = totalUsersCount > 0 ? Math.round((pendingRecruitersCount / totalUsersCount) * 100) : 0;
  const suspPct = totalUsersCount > 0 ? Math.max(0, 100 - (candPct + verPct + pendPct)) : 0;

  const CATEGORY_COLORS = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'];

  const categoryStats = React.useMemo(() => {
    const validJobs = (jobs || []).filter(j => (j.status || 'ACTIVE').toUpperCase() !== 'DELETED');
    if (!Array.isArray(validJobs) || validJobs.length === 0) {
      return {
        total: 0,
        categories: [
          { name: 'Technology & IT', count: 0, pct: 0, color: '#6366f1' },
          { name: 'Sales & Marketing', count: 0, pct: 0, color: '#3b82f6' },
          { name: 'Design & Creative', count: 0, pct: 0, color: '#10b981' },
          { name: 'Finance & Accounts', count: 0, pct: 0, color: '#f59e0b' },
          { name: 'Healthcare & Pharma', count: 0, pct: 0, color: '#ec4899' },
        ]
      };
    }

    const map = {};
    validJobs.forEach(j => {
      const cat = (j.category || j.department || 'General').trim();
      map[cat] = (map[cat] || 0) + 1;
    });

    const sorted = Object.entries(map).sort((a, b) => b[1] - a[1]);
    const top4 = sorted.slice(0, 4);
    const othersCount = sorted.slice(4).reduce((sum, [, c]) => sum + c, 0);

    const list = top4.map(([name, count], i) => ({
      name,
      count,
      pct: Math.max(1, Math.round((count / validJobs.length) * 100)),
      color: CATEGORY_COLORS[i % CATEGORY_COLORS.length]
    }));

    if (othersCount > 0) {
      list.push({
        name: 'Others',
        count: othersCount,
        pct: Math.max(1, Math.round((othersCount / validJobs.length) * 100)),
        color: '#cbd5e1'
      });
    }

    return {
      total: validJobs.length,
      categories: list
    };
  }, [jobs]);

  const activeJobsCount = (jobs || []).filter(j => (j.status || 'ACTIVE').toUpperCase() === 'ACTIVE' && !isJobExpired(j.lastDateToApply) && (j.status || '').toUpperCase() !== 'CLOSED' && (j.status || '').toUpperCase() !== 'INACTIVE').length;
  const pendingJobsCount = (jobs || []).filter(j => ((j.status || '').toUpperCase() === 'PENDING' || (j.status || '').toUpperCase() === 'PENDING_APPROVAL') && !isJobExpired(j.lastDateToApply)).length;
  const inactiveJobsCount = (jobs || []).filter(j => (j.status || '').toUpperCase() === 'INACTIVE' || (j.status || '').toUpperCase() === 'CLOSED' || isJobExpired(j.lastDateToApply)).length;
  const totalAppsCount = (applications || []).length;
  const interviewsCount = (applications || []).filter(a => (a.status || '').toUpperCase() === 'INTERVIEW').length;
  const hiresCount = (applications || []).filter(a => (a.status || '').toUpperCase() === 'HIRED' || (a.status || '').toUpperCase() === 'ACCEPTED').length;

  const [dateRange, setDateRange] = useState('Today (Real-time)');
  const [overviewFilter, setOverviewFilter] = useState('Daily');
  const [activeApprovalTab, setActiveApprovalTab] = useState('Recruiters');
  const [toastMsg, setToastMsg] = useState('');

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  // Pending Approvals (Interactive Real State)
  const [pendingRecruiters, setPendingRecruiters] = useState([]);

  useEffect(() => {
    if (Array.isArray(registeredUsers)) {
      const pendingList = registeredUsers
        .filter(u => u.accountType === 'recruiter' && (u.approvalStatus === 'PENDING_APPROVAL' || u.approvalStatus === 'PENDING'))
        .map((r, i) => ({
          id: `p_${i}`,
          name: r.company || r.name || 'Recruiter Account',
          type: 'Recruiter',
          email: r.email || r.identifier,
          date: 'Today',
          status: 'Pending'
        }));
      setPendingRecruiters(pendingList);
    }
  }, [registeredUsers]);

  const [openReviewId, setOpenReviewId] = useState(null);

  const handleApproveRecruiter = (id, name, email) => {
    if (email) {
      approveRecruiter(email);
    }
    setPendingRecruiters(prev => prev.filter(r => r.id !== id));
    setOpenReviewId(null);
    triggerToast(`✅ ${name} has been approved successfully!`);
  };

  const handleRejectRecruiter = (id, name, email) => {
    if (email) {
      rejectRecruiter(email);
    }
    setPendingRecruiters(prev => prev.filter(r => r.id !== id));
    setOpenReviewId(null);
    triggerToast(`❌ ${name} has been rejected.`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', background: '#f8fafc', minHeight: '92vh', fontFamily: 'Inter, sans-serif' }}>
      
      {/* Toast Alert */}
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

      {/* Header & Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
            Dashboard
          </h1>
          <p style={{ color: '#64748b', marginTop: '4px', fontSize: '0.9rem' }}>
            Real-time platform metrics, user management, and system operations.
          </p>
        </div>

        {/* Date Filter Pill */}
        <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '0.55rem 1rem', display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.86rem', fontWeight: '700', color: '#334155', cursor: 'pointer' }}>
          <Calendar size={16} color="#64748b" />
          <span>{dateRange}</span>
          <ChevronDown size={15} color="#94a3b8" />
        </div>
      </div>

      {/* ── TOP KPI ROW (5 Metric Cards Real Data) ────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem' }}>
        
        {/* Card 1: Total Users */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '18px', padding: '1.25rem', boxShadow: '0 1px 4px rgba(15,23,42,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: '#f3e8ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={18} />
            </div>
            <div>
              <span style={{ fontSize: '0.76rem', fontWeight: '700', color: '#64748b', display: 'block' }}>Total Users</span>
              <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', lineHeight: 1.1 }}>{totalUsersCount}</div>
            </div>
          </div>
          <div style={{ fontSize: '0.74rem', color: '#16a34a', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '3px' }}>
            <ArrowUpRight size={13} /> Real-time active users count
          </div>
        </div>

        {/* Card 2: Active Jobs */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '18px', padding: '1.25rem', boxShadow: '0 1px 4px rgba(15,23,42,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Briefcase size={18} />
            </div>
            <div>
              <span style={{ fontSize: '0.76rem', fontWeight: '700', color: '#64748b', display: 'block' }}>Active Jobs</span>
              <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', lineHeight: 1.1 }}>{activeJobsCount}</div>
            </div>
          </div>
          <div style={{ fontSize: '0.74rem', color: '#16a34a', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '3px' }}>
            <ArrowUpRight size={13} /> Published job vacancies
          </div>
        </div>

        {/* Card 3: Total Applications */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '18px', padding: '1.25rem', boxShadow: '0 1px 4px rgba(15,23,42,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={18} />
            </div>
            <div>
              <span style={{ fontSize: '0.76rem', fontWeight: '700', color: '#64748b', display: 'block' }}>Total Applications</span>
              <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', lineHeight: 1.1 }}>{totalAppsCount}</div>
            </div>
          </div>
          <div style={{ fontSize: '0.74rem', color: '#16a34a', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '3px' }}>
            <ArrowUpRight size={13} /> Submitted candidate applications
          </div>
        </div>

        {/* Card 4: Interviews Scheduled */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '18px', padding: '1.25rem', boxShadow: '0 1px 4px rgba(15,23,42,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: '#fff7ed', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Calendar size={18} />
            </div>
            <div>
              <span style={{ fontSize: '0.76rem', fontWeight: '700', color: '#64748b', display: 'block' }}>Interviews Scheduled</span>
              <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', lineHeight: 1.1 }}>{interviewsCount}</div>
            </div>
          </div>
          <div style={{ fontSize: '0.74rem', color: '#ea580c', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '3px' }}>
            <ArrowUpRight size={13} /> Candidates in interview stage
          </div>
        </div>

        {/* Card 5: Hires */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '18px', padding: '1.25rem', boxShadow: '0 1px 4px rgba(15,23,42,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: '#dcfce7', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={18} />
            </div>
            <div>
              <span style={{ fontSize: '0.76rem', fontWeight: '700', color: '#64748b', display: 'block' }}>Hires</span>
              <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', lineHeight: 1.1 }}>{hiresCount}</div>
            </div>
          </div>
          <div style={{ fontSize: '0.74rem', color: '#16a34a', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '3px' }}>
            <ArrowUpRight size={13} /> Total hired candidates
          </div>
        </div>

      </div>

      {/* ── ROW 1: Applications Overview Spline Wave Chart & Account & Job Status ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '1.5rem', alignItems: 'flex-start' }}>
        
        {/* LEFT: Applications Overview Chart */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.5rem', boxShadow: '0 1px 4px rgba(15,23,42,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Applications Overview</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginTop: '6px', fontSize: '0.78rem', fontWeight: '700' }}>
                <span style={{ color: '#6366f1', display: 'flex', alignItems: 'center', gap: '5px' }}>● Applications</span>
                <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '5px' }}>● Shortlisted</span>
                <span style={{ color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '5px' }}>● Interviews</span>
                <span style={{ color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '5px' }}>● Hired</span>
              </div>
            </div>

            <select
              value={overviewFilter}
              onChange={e => setOverviewFilter(e.target.value)}
              style={{ padding: '0.45rem 0.85rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.82rem', background: '#ffffff', fontWeight: '700', color: '#334155' }}
            >
              <option value="Daily">Daily</option>
              <option value="Weekly">Weekly</option>
              <option value="Monthly">Monthly</option>
            </select>
          </div>

          {/* SVG Multi-Line Wave Chart */}
          <div style={{ position: 'relative', width: '100%', height: '220px' }}>
            <svg viewBox="0 0 700 180" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
              
              {/* Horizontal Grid lines */}
              <line x1="40" y1="20" x2="680" y2="20" stroke="#f1f5f9" strokeDasharray="4 4" />
              <text x="15" y="24" fill="#94a3b8" fontSize="11" fontWeight="600">4K</text>

              <line x1="40" y1="60" x2="680" y2="60" stroke="#f1f5f9" strokeDasharray="4 4" />
              <text x="15" y="64" fill="#94a3b8" fontSize="11" fontWeight="600">3K</text>

              <line x1="40" y1="100" x2="680" y2="100" stroke="#f1f5f9" strokeDasharray="4 4" />
              <text x="15" y="104" fill="#94a3b8" fontSize="11" fontWeight="600">2K</text>

              <line x1="40" y1="140" x2="680" y2="140" stroke="#f1f5f9" strokeDasharray="4 4" />
              <text x="15" y="144" fill="#94a3b8" fontSize="11" fontWeight="600">1K</text>

              <line x1="40" y1="170" x2="680" y2="170" stroke="#e2e8f0" />
              <text x="20" y="174" fill="#94a3b8" fontSize="11" fontWeight="600">0</text>

              {/* Purple Line (Applications) */}
              <path d="M 40 120 C 100 90, 160 70, 220 80 C 280 60, 340 50, 400 75 C 460 60, 520 40, 580 50 L 640 55" fill="none" stroke="#6366f1" strokeWidth="3" />
              {/* Green Line (Shortlisted) */}
              <path d="M 40 145 C 100 135, 160 120, 220 130 C 280 125, 340 115, 400 130 C 460 125, 520 110, 580 120 L 640 125" fill="none" stroke="#10b981" strokeWidth="2.5" />
              {/* Orange Line (Interviews) */}
              <path d="M 40 160 C 100 155, 160 150, 220 155 C 280 150, 340 145, 400 155 C 460 150, 520 140, 580 150 L 640 152" fill="none" stroke="#f59e0b" strokeWidth="2" />
              {/* Blue Line (Hired) */}
              <path d="M 40 168 C 100 165, 160 162, 220 165 C 280 163, 340 160, 400 165 C 460 163, 520 158, 580 162 L 640 164" fill="none" stroke="#3b82f6" strokeWidth="2" />

              {/* Dots for Purple */}
              {[[40,120], [105,90], [170,70], [235,80], [300,60], [365,75], [430,60], [495,40], [560,50], [625,55]].map(([cx, cy], i) => (
                <circle key={i} cx={cx} cy={cy} r="4" fill="#6366f1" stroke="#ffffff" strokeWidth="2" />
              ))}

              {/* Dots for Green */}
              {[[40,145], [105,135], [170,120], [235,130], [300,125], [365,130], [430,125], [495,110], [560,120], [625,125]].map(([cx, cy], i) => (
                <circle key={i} cx={cx} cy={cy} r="3.5" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" />
              ))}
            </svg>
          </div>

          {/* X Axis Dates */}
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: '35px', paddingRight: '20px', fontSize: '0.74rem', color: '#64748b', fontWeight: '600' }}>
            <span>01 Aug</span>
            <span>02 Aug</span>
            <span>03 Aug</span>
            <span>04 Aug</span>
            <span>05 Aug</span>
            <span>06 Aug</span>
            <span>07 Aug</span>
            <span>08 Aug</span>
            <span>09 Aug</span>
            <span>10 Aug</span>
          </div>

        </div>

        {/* RIGHT: Account & Job Status Card */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.5rem', boxShadow: '0 1px 4px rgba(15,23,42,0.02)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Account & Job Status</h3>
            <span style={{ fontSize: '0.76rem', color: '#6366f1', fontWeight: '800', cursor: 'pointer' }} onClick={() => triggerToast('Viewing status overview')}>
              View All
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            
            {/* Item 1 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.65rem 0.85rem', background: '#fffbe6', borderRadius: '12px', border: '1px solid #ffe58f' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <UserCheck size={16} color="#d48806" />
                <span style={{ fontSize: '0.84rem', fontWeight: '700', color: '#594214' }}>Pending Recruiter Approvals</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ background: '#faad14', color: '#ffffff', padding: '2px 8px', borderRadius: '10px', fontSize: '0.76rem', fontWeight: '800' }}>{pendingRecruitersCount}</span>
                <ChevronRight size={16} color="#d48806" cursor="pointer" onClick={() => setActiveApprovalTab('Recruiters')} />
              </div>
            </div>

            {/* Item 2 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.65rem 0.85rem', background: '#e6f7ff', borderRadius: '12px', border: '1px solid #91d5ff' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Briefcase size={16} color="#096dd9" />
                <span style={{ fontSize: '0.84rem', fontWeight: '700', color: '#002c6c' }}>Pending Job Approvals</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ background: '#1890ff', color: '#ffffff', padding: '2px 8px', borderRadius: '10px', fontSize: '0.76rem', fontWeight: '800' }}>{pendingJobsCount}</span>
                <ChevronRight size={16} color="#096dd9" cursor="pointer" onClick={() => setActiveApprovalTab('Jobs')} />
              </div>
            </div>

            {/* Item 3 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.65rem 0.85rem', background: '#fff1f0', borderRadius: '12px', border: '1px solid #ffa39e' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Flag size={16} color="#cf1322" />
                <span style={{ fontSize: '0.84rem', fontWeight: '700', color: '#5c0011' }}>Reported Jobs</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ background: '#ff4d4f', color: '#ffffff', padding: '2px 8px', borderRadius: '10px', fontSize: '0.76rem', fontWeight: '800' }}>0</span>
                <ChevronRight size={16} color="#cf1322" cursor="pointer" onClick={() => triggerToast('No reported jobs')} />
              </div>
            </div>

            {/* Item 4 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.65rem 0.85rem', background: '#fff0f6', borderRadius: '12px', border: '1px solid #ffadd2' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <User size={16} color="#c41d7f" />
                <span style={{ fontSize: '0.84rem', fontWeight: '700', color: '#520339' }}>Suspended Accounts</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ background: '#eb2f96', color: '#ffffff', padding: '2px 8px', borderRadius: '10px', fontSize: '0.76rem', fontWeight: '800' }}>0</span>
                <ChevronRight size={16} color="#c41d7f" cursor="pointer" onClick={() => triggerToast('No suspended accounts')} />
              </div>
            </div>

            {/* Item 5 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.65rem 0.85rem', background: '#f5f5f5', borderRadius: '12px', border: '1px solid #d9d9d9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Clock size={16} color="#595959" />
                <span style={{ fontSize: '0.84rem', fontWeight: '700', color: '#262626' }}>Inactive Jobs (&gt; 30 days)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ background: '#8c8c8c', color: '#ffffff', padding: '2px 8px', borderRadius: '10px', fontSize: '0.76rem', fontWeight: '800' }}>{inactiveJobsCount}</span>
                <ChevronRight size={16} color="#595959" cursor="pointer" onClick={() => triggerToast(`Viewing ${inactiveJobsCount} inactive jobs`)} />
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* ── ROW 2: Users Overview & Top Job Categories (2 Donut Cards) ────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        
        {/* Box 1: Users Overview */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.5rem', boxShadow: '0 1px 4px rgba(15,23,42,0.02)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Users Overview</h3>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            {/* SVG Donut with Center Text */}
            <div style={{ position: 'relative', width: '140px', height: '140px', flexShrink: 0 }}>
              <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                <circle cx="18" cy="18" r="14" fill="none" stroke="#f1f5f9" strokeWidth="5" />
                {totalUsersCount > 0 ? (
                  <>
                    {candPct > 0 && <circle cx="18" cy="18" r="14" fill="none" stroke="#6366f1" strokeWidth="5" strokeDasharray={`${candPct} 100`} strokeDashoffset="0" />}
                    {verPct > 0 && <circle cx="18" cy="18" r="14" fill="none" stroke="#10b981" strokeWidth="5" strokeDasharray={`${verPct} 100`} strokeDashoffset={`-${candPct}`} />}
                    {pendPct > 0 && <circle cx="18" cy="18" r="14" fill="none" stroke="#fbbf24" strokeWidth="5" strokeDasharray={`${pendPct} 100`} strokeDashoffset={`-${candPct + verPct}`} />}
                    {suspPct > 0 && <circle cx="18" cy="18" r="14" fill="none" stroke="#ef4444" strokeWidth="5" strokeDasharray={`${suspPct} 100`} strokeDashoffset={`-${candPct + verPct + pendPct}`} />}
                  </>
                ) : (
                  <circle cx="18" cy="18" r="14" fill="none" stroke="#e2e8f0" strokeWidth="4" strokeDasharray="100 100" />
                )}
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                <strong style={{ fontSize: '0.95rem', color: '#0f172a', fontWeight: '800' }}>{totalUsersCount}</strong>
                <span style={{ fontSize: '0.65rem', color: '#64748b' }}>Total Users</span>
              </div>
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8rem', flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0f172a', fontWeight: '600' }}><span style={{ color: '#6366f1' }}>●</span> Candidates</span>
                <strong>{candidatesCount} ({candPct}%)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0f172a', fontWeight: '600' }}><span style={{ color: '#10b981' }}>●</span> Verified Recruiters</span>
                <strong>{verifiedRecruitersCount} ({verPct}%)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0f172a', fontWeight: '600' }}><span style={{ color: '#fbbf24' }}>●</span> Pending Recruiters</span>
                <strong>{pendingRecruitersCount} ({pendPct}%)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0f172a', fontWeight: '600' }}><span style={{ color: '#ef4444' }}>●</span> Suspended Users</span>
                <strong>{suspendedUsersCount} ({suspPct}%)</strong>
              </div>

              <div style={{ marginTop: '0.4rem' }}>
                <span style={{ fontSize: '0.78rem', color: '#6366f1', fontWeight: '800', cursor: 'pointer' }} onClick={() => setActiveTab('users')}>
                  View All Users &rarr;
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Box 2: Top Job Categories */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.5rem', boxShadow: '0 1px 4px rgba(15,23,42,0.02)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Top Job Categories</h3>
            <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: '600' }}>{categoryStats.total} Total Posted</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            {/* SVG Donut */}
            <div style={{ position: 'relative', width: '130px', height: '130px', flexShrink: 0 }}>
              {(() => {
                let accOffset = 0;
                return (
                  <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                    <circle cx="18" cy="18" r="14" fill="none" stroke="#f1f5f9" strokeWidth="5" />
                    {categoryStats.total > 0 ? (
                      categoryStats.categories.map((c, i) => {
                        if (c.pct <= 0) return null;
                        const currentOffset = accOffset;
                        accOffset += c.pct;
                        return (
                          <circle
                            key={i}
                            cx="18"
                            cy="18"
                            r="14"
                            fill="none"
                            stroke={c.color}
                            strokeWidth="5"
                            strokeDasharray={`${c.pct} 100`}
                            strokeDashoffset={`-${currentOffset}`}
                          />
                        );
                      })
                    ) : (
                      <circle cx="18" cy="18" r="14" fill="none" stroke="#e2e8f0" strokeWidth="4" strokeDasharray="100 100" />
                    )}
                  </svg>
                );
              })()}
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                <strong style={{ fontSize: '0.95rem', color: '#0f172a', fontWeight: '800' }}>{categoryStats.total}</strong>
                <span style={{ fontSize: '0.62rem', color: '#64748b' }}>Active Jobs</span>
              </div>
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8rem', flex: 1 }}>
              {categoryStats.categories.map((c, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0f172a', fontWeight: '600' }}>
                    <span style={{ color: c.color }}>●</span> {c.name}
                  </span>
                  <strong>{c.pct}% <span style={{ color: '#94a3b8', fontSize: '0.72rem', fontWeight: '500' }}>({c.count})</span></strong>
                </div>
              ))}

              <div style={{ marginTop: '0.4rem' }}>
                <span style={{ fontSize: '0.78rem', color: '#6366f1', fontWeight: '800', cursor: 'pointer' }} onClick={() => setActiveTab('jobs')}>
                  View All Categories &rarr;
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ── ROW 3: Pending Approvals Interactive Table & Right Activity / Quick Actions ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '1.5rem', alignItems: 'flex-start' }}>
        
        {/* LEFT: Pending Approvals Tabbed Table */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.5rem', boxShadow: '0 1px 4px rgba(15,23,42,0.02)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Pending Approvals</h3>
            
            {/* Approval Sub-Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', background: '#f1f5f9', padding: '3px', borderRadius: '10px' }}>
              {[
                `Recruiters (${pendingRecruiters.length})`,
                `Jobs (${(jobs || []).filter(j => (j.status || '').toUpperCase() === 'PENDING').length})`,
                'Companies (0)',
                'Documents (0)'
              ].map(tabLabel => {
                const cleanKey = tabLabel.split(' ')[0];
                const isActive = activeApprovalTab === cleanKey;
                return (
                  <button
                    key={cleanKey}
                    onClick={() => setActiveApprovalTab(cleanKey)}
                    style={{
                      background: isActive ? '#ffffff' : 'transparent',
                      color: isActive ? '#4f46e5' : '#64748b',
                      border: 'none', borderRadius: '8px', padding: '4px 10px',
                      fontSize: '0.76rem', fontWeight: isActive ? '800' : '600',
                      cursor: 'pointer', boxShadow: isActive ? '0 1px 4px rgba(0,0,0,0.06)' : 'none'
                    }}
                  >
                    {tabLabel}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Pending Approvals Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.76rem', textAlign: 'left' }}>
                <th style={{ paddingBottom: '0.75rem', fontWeight: '700' }}>Name / Company</th>
                <th style={{ paddingBottom: '0.75rem', fontWeight: '700' }}>Type</th>
                <th style={{ paddingBottom: '0.75rem', fontWeight: '700' }}>Email</th>
                <th style={{ paddingBottom: '0.75rem', fontWeight: '700' }}>Registered On</th>
                <th style={{ paddingBottom: '0.75rem', fontWeight: '700' }}>Status</th>
                <th style={{ paddingBottom: '0.75rem', fontWeight: '700', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {pendingRecruiters.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem 1rem', color: '#94a3b8', fontSize: '0.84rem' }}>
                    No pending recruiter approvals right now. All recruiter accounts are verified ✓
                  </td>
                </tr>
              ) : (
                pendingRecruiters.map(r => (
                <tr key={r.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                  <td style={{ padding: '0.85rem 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#6366f1', color: '#ffffff', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}>
                      {r.name.charAt(0)}
                    </div>
                    <strong style={{ fontSize: '0.86rem', color: '#0f172a' }}>{r.name}</strong>
                  </td>
                  <td style={{ color: '#475569', fontSize: '0.8rem', fontWeight: '600' }}>{r.type}</td>
                  <td style={{ color: '#64748b', fontSize: '0.8rem' }}>{r.email}</td>
                  <td style={{ color: '#64748b', fontSize: '0.8rem' }}>{r.date}</td>
                  <td>
                    <span style={{ background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', padding: '2px 8px', borderRadius: '8px', fontSize: '0.74rem', fontWeight: '800' }}>
                      {r.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', position: 'relative' }}>
                    <button
                      onClick={() => setOpenReviewId(openReviewId === r.id ? null : r.id)}
                      style={{ background: '#ffffff', border: '1px solid #cbd5e1', color: '#4f46e5', padding: '4px 10px', borderRadius: '8px', fontSize: '0.78rem', fontWeight: '800', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    >
                      Review <ChevronDown size={12} />
                    </button>

                    {/* Review Options Dropdown */}
                    {openReviewId === r.id && (
                      <div style={{ position: 'absolute', right: 0, top: '100%', marginTop: '4px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.12)', zIndex: 50, padding: '4px', width: '130px', textAlign: 'left' }}>
                        <button onClick={() => handleApproveRecruiter(r.id, r.name, r.email)} style={{ width: '100%', padding: '0.45rem 0.65rem', border: 'none', background: '#f0fdf4', color: '#16a34a', fontSize: '0.78rem', fontWeight: '800', cursor: 'pointer', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                          <Check size={14} /> Approve
                        </button>
                        <button onClick={() => handleRejectRecruiter(r.id, r.name, r.email)} style={{ width: '100%', padding: '0.45rem 0.65rem', border: 'none', background: '#fef2f2', color: '#dc2626', fontSize: '0.78rem', fontWeight: '800', cursor: 'pointer', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <X size={14} /> Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              )))}
            </tbody>
          </table>

          <div style={{ textAlign: 'center', paddingTop: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: '#6366f1', fontWeight: '800', cursor: 'pointer' }} onClick={() => setActiveTab('verification')}>
              View All Pending Approvals &rarr;
            </span>
          </div>

        </div>

        {/* RIGHT: Recent Activity & Quick Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* 1. Recent Activity Feed */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.5rem', boxShadow: '0 1px 4px rgba(15,23,42,0.02)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Recent Activity</h3>
              <span style={{ fontSize: '0.76rem', color: '#6366f1', fontWeight: '800', cursor: 'pointer' }} onClick={() => triggerToast('Viewing full activity log')}>
                View All
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              
              {/* Activity 1 */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#f3e8ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <UserPlus size={15} />
                  </div>
                  <div>
                    <strong style={{ fontSize: '0.82rem', color: '#0f172a', display: 'block' }}>New recruiter registered</strong>
                    <span style={{ fontSize: '0.74rem', color: '#64748b' }}>TechNova Solutions</span>
                  </div>
                </div>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>10:30 AM</span>
              </div>

              {/* Activity 2 */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#dcfce7', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <CheckCircle2 size={15} />
                  </div>
                  <div>
                    <strong style={{ fontSize: '0.82rem', color: '#0f172a', display: 'block' }}>Job approved</strong>
                    <span style={{ fontSize: '0.74rem', color: '#64748b' }}>Software Engineer (TechNova)</span>
                  </div>
                </div>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>09:45 AM</span>
              </div>

              {/* Activity 3 */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Briefcase size={15} />
                  </div>
                  <div>
                    <strong style={{ fontSize: '0.82rem', color: '#0f172a', display: 'block' }}>New job posted</strong>
                    <span style={{ fontSize: '0.74rem', color: '#64748b' }}>Backend Developer (InnovateX)</span>
                  </div>
                </div>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>09:20 AM</span>
              </div>

              {/* Activity 4 */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#fff1f0', color: '#cf1322', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Flag size={15} />
                  </div>
                  <div>
                    <strong style={{ fontSize: '0.82rem', color: '#0f172a', display: 'block' }}>Job reported</strong>
                    <span style={{ fontSize: '0.74rem', color: '#64748b' }}>Marketing Manager (XYZ Corp)</span>
                  </div>
                </div>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>08:55 AM</span>
              </div>

              {/* Activity 5 */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <UserCheck size={15} />
                  </div>
                  <div>
                    <strong style={{ fontSize: '0.82rem', color: '#0f172a', display: 'block' }}>Recruiter account approved</strong>
                    <span style={{ fontSize: '0.74rem', color: '#64748b' }}>Bright Future Pvt. Ltd.</span>
                  </div>
                </div>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>08:10 AM</span>
              </div>

            </div>
          </div>

          {/* 2. Quick Actions (4 Grid Cards) */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.5rem', boxShadow: '0 1px 4px rgba(15,23,42,0.02)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Quick Actions</h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              
              {/* Action 1 */}
              <div
                onClick={() => setActiveTab('users')}
                style={{ background: '#faf5ff', border: '1px solid #f3e8ff', borderRadius: '14px', padding: '0.85rem', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '4px' }}
              >
                <UserPlus size={20} color="#7c3aed" />
                <strong style={{ fontSize: '0.82rem', color: '#0f172a', marginTop: '2px' }}>Add New Admin</strong>
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Create admin accounts</span>
              </div>

              {/* Action 2 */}
              <div
                onClick={() => setActiveTab('jobs')}
                style={{ background: '#f0fdf4', border: '1px solid #dcfce7', borderRadius: '14px', padding: '0.85rem', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '4px' }}
              >
                <Briefcase size={20} color="#16a34a" />
                <strong style={{ fontSize: '0.82rem', color: '#0f172a', marginTop: '2px' }}>Review Jobs</strong>
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Approve or reject jobs</span>
              </div>

              {/* Action 3 */}
              <div
                onClick={() => setActiveTab('users')}
                style={{ background: '#eff6ff', border: '1px solid #dbeafe', borderRadius: '14px', padding: '0.85rem', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '4px' }}
              >
                <ShieldCheck size={20} color="#2563eb" />
                <strong style={{ fontSize: '0.82rem', color: '#0f172a', marginTop: '2px' }}>Verify Recruiters</strong>
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Review recruiter accounts</span>
              </div>

              {/* Action 4 */}
              <div
                onClick={() => setActiveTab('reports')}
                style={{ background: '#fff7ed', border: '1px solid #ffedd5', borderRadius: '14px', padding: '0.85rem', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '4px' }}
              >
                <Flag size={20} color="#ea580c" />
                <strong style={{ fontSize: '0.82rem', color: '#0f172a', marginTop: '2px' }}>View Reports</strong>
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>See all reports & complaints</span>
              </div>

            </div>
          </div>

          {/* 3. System Status & Microservices Health Card */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.5rem', boxShadow: '0 1px 4px rgba(15,23,42,0.02)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 0 3px rgba(16,185,129,0.2)' }} />
                <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>System & Server Health</h3>
              </div>
              <span style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', padding: '2px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: '800' }}>
                LIVE TELEMETRY
              </span>
            </div>

            <p style={{ color: '#64748b', fontSize: '0.82rem', margin: 0 }}>
              Real-time telemetry of all 11 microservices, API Gateway, Eureka discovery, MySQL & PostgreSQL databases.
            </p>

            <button
              onClick={() => setActiveTab('system_health')}
              style={{
                background: 'linear-gradient(135deg, #4f46e5, #4338ca)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                padding: '0.75rem 1.25rem',
                fontWeight: '800',
                fontSize: '0.86rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 12px rgba(79,70,229,0.25)',
                transition: 'all 0.2s ease'
              }}
            >
              <Activity size={16} /> View System Health Page
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
