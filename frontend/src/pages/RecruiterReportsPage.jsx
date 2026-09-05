import React, { useState } from 'react';
import {
  BarChart2,
  TrendingUp,
  TrendingDown,
  Users,
  Briefcase,
  CheckCircle2,
  Clock,
  Download,
  Calendar,
  Filter,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  UserCheck,
  Building,
  Target,
  ChevronDown,
  Star,
  Info,
  ChevronRight,
  Send,
  Rocket
} from 'lucide-react';
import { useJobs } from '../context/JobContext';
import { useAuth } from '../context/AuthContext';

export default function RecruiterReportsPage() {
  const { jobs, applications } = useJobs();
  const { user } = useAuth();

  const [dateRange, setDateRange] = useState('Today (Real-time)');
  const [overviewFilter, setOverviewFilter] = useState('Daily');
  const [toastMsg, setToastMsg] = useState('');

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  // Real Dynamic Metric counts calculated from live recruiter jobs and applications
  const recruiterEmail = (user?.email || '').toLowerCase();
  const recruiterJobs = (jobs || []).filter(j => (j.postedBy || '').toLowerCase() === recruiterEmail || (user?.company && j.company === user.company));
  const totalJobs = recruiterJobs.length;
  
  const recruiterApps = (applications || []).filter(a => recruiterJobs.some(rj => rj.id === a.jobId || rj.title === a.jobTitle));
  const totalApps = recruiterApps.length;
  const totalShortlisted = recruiterApps.filter(a => (a.status || '').toUpperCase() === 'SHORTLISTED').length;
  const totalInterviews = recruiterApps.filter(a => (a.status || '').toUpperCase() === 'INTERVIEW').length;
  const totalHired = recruiterApps.filter(a => (a.status || '').toUpperCase() === 'HIRED' || (a.status || '').toUpperCase() === 'ACCEPTED').length;

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
            Reports & Analytics
          </h1>
          <p style={{ color: '#64748b', marginTop: '4px', fontSize: '0.9rem' }}>
            Track your hiring performance and make smarter decisions.
          </p>
        </div>

        {/* Date Picker Pill & Filters Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          
          {/* Date Picker */}
          <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '0.55rem 1rem', display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.86rem', fontWeight: '700', color: '#334155', cursor: 'pointer' }}>
            <Calendar size={16} color="#64748b" />
            <span>{dateRange}</span>
            <ChevronDown size={15} color="#94a3b8" />
          </div>

          {/* Filters */}
          <button
            onClick={() => triggerToast('Analytics filters panel opened')}
            style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '0.55rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.86rem', fontWeight: '700', color: '#334155', cursor: 'pointer' }}
          >
            <Filter size={16} color="#64748b" /> Filters
          </button>

        </div>
      </div>

      {/* ── TOP KPI ROW (5 Cards) ─────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem' }}>
        
        {/* Card 1: Total Jobs */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '18px', padding: '1.25rem', boxShadow: '0 1px 4px rgba(15,23,42,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: '#f3e8ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Briefcase size={18} />
            </div>
            <div>
              <span style={{ fontSize: '0.76rem', fontWeight: '700', color: '#64748b', display: 'block' }}>Total Jobs</span>
              <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', lineHeight: 1.1 }}>{totalJobs}</div>
            </div>
          </div>
          <div style={{ fontSize: '0.74rem', color: '#16a34a', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '3px' }}>
            <ArrowUpRight size={13} /> ▲ 9% <span style={{ color: '#94a3b8', fontWeight: '500' }}>vs last 10 days</span>
          </div>
        </div>

        {/* Card 2: Total Applications */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '18px', padding: '1.25rem', boxShadow: '0 1px 4px rgba(15,23,42,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={18} />
            </div>
            <div>
              <span style={{ fontSize: '0.76rem', fontWeight: '700', color: '#64748b', display: 'block' }}>Total Applications</span>
              <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', lineHeight: 1.1 }}>{totalApps}</div>
            </div>
          </div>
          <div style={{ fontSize: '0.74rem', color: '#16a34a', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '3px' }}>
            <ArrowUpRight size={13} /> ▲ 18% <span style={{ color: '#94a3b8', fontWeight: '500' }}>vs last 10 days</span>
          </div>
        </div>

        {/* Card 3: Shortlisted */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '18px', padding: '1.25rem', boxShadow: '0 1px 4px rgba(15,23,42,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Star size={18} />
            </div>
            <div>
              <span style={{ fontSize: '0.76rem', fontWeight: '700', color: '#64748b', display: 'block' }}>Shortlisted</span>
              <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', lineHeight: 1.1 }}>{totalShortlisted}</div>
            </div>
          </div>
          <div style={{ fontSize: '0.74rem', color: '#16a34a', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '3px' }}>
            <ArrowUpRight size={13} /> ▲ 11% <span style={{ color: '#94a3b8', fontWeight: '500' }}>vs last 10 days</span>
          </div>
        </div>

        {/* Card 4: Interviews */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '18px', padding: '1.25rem', boxShadow: '0 1px 4px rgba(15,23,42,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: '#fff7ed', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Calendar size={18} />
            </div>
            <div>
              <span style={{ fontSize: '0.76rem', fontWeight: '700', color: '#64748b', display: 'block' }}>Interviews</span>
              <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', lineHeight: 1.1 }}>{totalInterviews}</div>
            </div>
          </div>
          <div style={{ fontSize: '0.74rem', color: '#dc2626', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '3px' }}>
            <ArrowDownRight size={13} /> ▼ 6% <span style={{ color: '#94a3b8', fontWeight: '500' }}>vs last 10 days</span>
          </div>
        </div>

        {/* Card 5: Hired */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '18px', padding: '1.25rem', boxShadow: '0 1px 4px rgba(15,23,42,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: '#dcfce7', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={18} />
            </div>
            <div>
              <span style={{ fontSize: '0.76rem', fontWeight: '700', color: '#64748b', display: 'block' }}>Hired</span>
              <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', lineHeight: 1.1 }}>{totalHired}</div>
            </div>
          </div>
          <div style={{ fontSize: '0.74rem', color: '#16a34a', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '3px' }}>
            <ArrowUpRight size={13} /> ▲ 20% <span style={{ color: '#94a3b8', fontWeight: '500' }}>vs last 10 days</span>
          </div>
        </div>

      </div>

      {/* ── MAIN DASHBOARD GRID (2 Columns: Left Main 68% | Right Sidebar 32%) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '1.5rem', alignItems: 'flex-start' }}>
        
        {/* LEFT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* 1. Applications Overview Wave Spline Chart */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.5rem', boxShadow: '0 1px 4px rgba(15,23,42,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Applications Overview</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginTop: '6px', fontSize: '0.8rem', fontWeight: '700' }}>
                  <span style={{ color: '#6366f1', display: 'flex', alignItems: 'center', gap: '5px' }}>● Applications</span>
                  <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '5px' }}>● Shortlisted</span>
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

            {/* Custom SVG Wave Chart */}
            <div style={{ position: 'relative', width: '100%', height: '240px' }}>
              <svg viewBox="0 0 700 200" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                <defs>
                  <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal Grid lines */}
                <line x1="40" y1="20" x2="680" y2="20" stroke="#f1f5f9" strokeDasharray="4 4" />
                <text x="15" y="24" fill="#94a3b8" fontSize="11" fontWeight="600">80</text>

                <line x1="40" y1="60" x2="680" y2="60" stroke="#f1f5f9" strokeDasharray="4 4" />
                <text x="15" y="64" fill="#94a3b8" fontSize="11" fontWeight="600">60</text>

                <line x1="40" y1="100" x2="680" y2="100" stroke="#f1f5f9" strokeDasharray="4 4" />
                <text x="15" y="104" fill="#94a3b8" fontSize="11" fontWeight="600">40</text>

                <line x1="40" y1="140" x2="680" y2="140" stroke="#f1f5f9" strokeDasharray="4 4" />
                <text x="15" y="144" fill="#94a3b8" fontSize="11" fontWeight="600">20</text>

                <line x1="40" y1="180" x2="680" y2="180" stroke="#e2e8f0" />
                <text x="20" y="184" fill="#94a3b8" fontSize="11" fontWeight="600">0</text>

                {/* Filled Area Gradient Below Purple Line */}
                <path
                  d="M 40 120 C 100 80, 160 90, 220 60 C 280 40, 340 70, 400 90 C 460 60, 520 70, 580 40 L 640 50 L 640 180 L 40 180 Z"
                  fill="url(#purpleGrad)"
                />

                {/* Purple Spline Wave Line (Applications) */}
                <path
                  d="M 40 120 C 100 80, 160 90, 220 60 C 280 40, 340 70, 400 90 C 460 60, 520 70, 580 40 L 640 50"
                  fill="none"
                  stroke="#6366f1"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />

                {/* Green Spline Wave Line (Shortlisted) */}
                <path
                  d="M 40 160 C 100 135, 160 145, 220 130 C 280 120, 340 140, 400 120 C 460 130, 520 110, 580 160 L 640 165"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="3"
                  strokeLinecap="round"
                />

                {/* Dots on Purple line */}
                {[[40,120], [105,80], [170,90], [235,60], [300,45], [365,75], [430,90], [495,62], [560,42], [625,50]].map(([cx, cy], i) => (
                  <circle key={i} cx={cx} cy={cy} r="5" fill="#6366f1" stroke="#ffffff" strokeWidth="2" />
                ))}

                {/* Dots on Green line */}
                {[[40,160], [105,135], [170,145], [235,130], [300,120], [365,140], [430,120], [495,130], [560,110], [625,160]].map(([cx, cy], i) => (
                  <circle key={i} cx={cx} cy={cy} r="4" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
                ))}
              </svg>
            </div>

            {/* X Axis Date Labels */}
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

          {/* 2. Sub-Row: Applications by Status (Donut) & Time to Hire (Bar Chart) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            
            {/* Box A: Applications by Status */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.5rem', boxShadow: '0 1px 4px rgba(15,23,42,0.02)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Applications by Status</h3>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {/* SVG Donut Chart */}
                <div style={{ position: 'relative', width: '130px', height: '130px', flexShrink: 0 }}>
                  <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                    <circle cx="18" cy="18" r="14" fill="none" stroke="#f1f5f9" strokeWidth="5" />
                    {/* Applied 100% Segment */}
                    <circle cx="18" cy="18" r="14" fill="none" stroke="#818cf8" strokeWidth="5" strokeDasharray="30 100" strokeDashoffset="0" />
                    {/* Shortlisted 20.7% */}
                    <circle cx="18" cy="18" r="14" fill="none" stroke="#60a5fa" strokeWidth="5" strokeDasharray="20 100" strokeDashoffset="-30" />
                    {/* Interview 8.0% */}
                    <circle cx="18" cy="18" r="14" fill="none" stroke="#fbbf24" strokeWidth="5" strokeDasharray="12 100" strokeDashoffset="-50" />
                    {/* Hired 1.7% */}
                    <circle cx="18" cy="18" r="14" fill="none" stroke="#34d399" strokeWidth="5" strokeDasharray="8 100" strokeDashoffset="-62" />
                    {/* Rejected 29.9% */}
                    <circle cx="18" cy="18" r="14" fill="none" stroke="#f87171" strokeWidth="5" strokeDasharray="30 100" strokeDashoffset="-70" />
                  </svg>
                </div>

                {/* Legend */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.78rem', flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#0f172a', fontWeight: '600' }}><span style={{ color: '#818cf8' }}>●</span> Applied</span>
                    <strong style={{ color: '#0f172a' }}>348 (100%)</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#0f172a', fontWeight: '600' }}><span style={{ color: '#60a5fa' }}>●</span> Shortlisted</span>
                    <strong style={{ color: '#0f172a' }}>72 (20.7%)</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#0f172a', fontWeight: '600' }}><span style={{ color: '#fbbf24' }}>●</span> Interview</span>
                    <strong style={{ color: '#0f172a' }}>28 (8.0%)</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#0f172a', fontWeight: '600' }}><span style={{ color: '#34d399' }}>●</span> Hired</span>
                    <strong style={{ color: '#0f172a' }}>6 (1.7%)</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#0f172a', fontWeight: '600' }}><span style={{ color: '#f87171' }}>●</span> Rejected</span>
                    <strong style={{ color: '#0f172a' }}>104 (29.9%)</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Box B: Time to Hire */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.5rem', boxShadow: '0 1px 4px rgba(15,23,42,0.02)', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  Time to Hire <Info size={14} color="#94a3b8" />
                </h3>
              </div>

              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a' }}>18 <span style={{ fontSize: '0.88rem', fontWeight: '600', color: '#64748b' }}>Days (Avg.)</span></div>
                <div style={{ fontSize: '0.74rem', color: '#16a34a', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '3px', marginTop: '2px' }}>
                  <ArrowDownRight size={13} /> ▼ 2 days <span style={{ color: '#94a3b8', fontWeight: '500' }}>vs last 10 days</span>
                </div>
              </div>

              {/* Bar Chart */}
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '90px', paddingTop: '10px', borderBottom: '1px solid #f1f5f9' }}>
                {/* Bar 1 */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <div style={{ width: '28px', height: '40px', background: '#a5b4fc', borderRadius: '6px 6px 0 0' }} />
                  <span style={{ fontSize: '0.7rem', color: '#64748b' }}>0-10</span>
                </div>
                {/* Bar 2 */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <div style={{ width: '28px', height: '75px', background: '#6366f1', borderRadius: '6px 6px 0 0' }} />
                  <span style={{ fontSize: '0.7rem', color: '#64748b' }}>11-20</span>
                </div>
                {/* Bar 3 */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <div style={{ width: '28px', height: '35px', background: '#a5b4fc', borderRadius: '6px 6px 0 0' }} />
                  <span style={{ fontSize: '0.7rem', color: '#64748b' }}>21-30</span>
                </div>
                {/* Bar 4 */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <div style={{ width: '28px', height: '25px', background: '#cbd5e1', borderRadius: '6px 6px 0 0' }} />
                  <span style={{ fontSize: '0.7rem', color: '#64748b' }}>31-40</span>
                </div>
                {/* Bar 5 */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <div style={{ width: '28px', height: '18px', background: '#cbd5e1', borderRadius: '6px 6px 0 0' }} />
                  <span style={{ fontSize: '0.7rem', color: '#64748b' }}>41+</span>
                </div>
              </div>
            </div>

          </div>

          {/* 3. Recent Activity Table */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.5rem', boxShadow: '0 1px 4px rgba(15,23,42,0.02)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Recent Activity</h3>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.76rem', textAlign: 'left' }}>
                  <th style={{ paddingBottom: '0.75rem', fontWeight: '700' }}>Activity</th>
                  <th style={{ paddingBottom: '0.75rem', fontWeight: '700' }}>Date</th>
                  <th style={{ paddingBottom: '0.75rem', fontWeight: '700' }}>Details</th>
                </tr>
              </thead>
              <tbody>
                
                {/* Item 1 */}
                <tr style={{ borderBottom: '1px solid #f8fafc' }}>
                  <td style={{ padding: '0.85rem 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: '#f3e8ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Briefcase size={16} />
                    </div>
                    <div>
                      <strong style={{ fontSize: '0.86rem', color: '#0f172a', display: 'block' }}>New job published</strong>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Software Engineer</span>
                    </div>
                  </td>
                  <td style={{ color: '#475569', fontSize: '0.8rem', fontWeight: '600' }}>10 Aug 2026, 10:30 AM</td>
                  <td style={{ color: '#0f172a', fontSize: '0.8rem', fontWeight: '600' }}>Published successfully</td>
                </tr>

                {/* Item 2 */}
                <tr style={{ borderBottom: '1px solid #f8fafc' }}>
                  <td style={{ padding: '0.85rem 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Users size={16} />
                    </div>
                    <div>
                      <strong style={{ fontSize: '0.86rem', color: '#0f172a', display: 'block' }}>New application received</strong>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>from Amit Kumar Rai</span>
                    </div>
                  </td>
                  <td style={{ color: '#475569', fontSize: '0.8rem', fontWeight: '600' }}>10 Aug 2026, 09:15 AM</td>
                  <td style={{ color: '#0f172a', fontSize: '0.8rem', fontWeight: '600' }}>Software Engineer</td>
                </tr>

                {/* Item 3 */}
                <tr style={{ borderBottom: '1px solid #f8fafc' }}>
                  <td style={{ padding: '0.85rem 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: '#fff7ed', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Star size={16} />
                    </div>
                    <div>
                      <strong style={{ fontSize: '0.86rem', color: '#0f172a', display: 'block' }}>Candidate shortlisted</strong>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Priya Sharma</span>
                    </div>
                  </td>
                  <td style={{ color: '#475569', fontSize: '0.8rem', fontWeight: '600' }}>09 Aug 2026, 04:20 PM</td>
                  <td style={{ color: '#0f172a', fontSize: '0.8rem', fontWeight: '600' }}>Backend Developer</td>
                </tr>

                {/* Item 4 */}
                <tr style={{ borderBottom: '1px solid #f8fafc' }}>
                  <td style={{ padding: '0.85rem 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Calendar size={16} />
                    </div>
                    <div>
                      <strong style={{ fontSize: '0.86rem', color: '#0f172a', display: 'block' }}>Interview scheduled</strong>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Rahul Verma</span>
                    </div>
                  </td>
                  <td style={{ color: '#475569', fontSize: '0.8rem', fontWeight: '600' }}>09 Aug 2026, 02:45 PM</td>
                  <td style={{ color: '#0f172a', fontSize: '0.8rem', fontWeight: '600' }}>Full Stack Developer</td>
                </tr>

                {/* Item 5 */}
                <tr>
                  <td style={{ padding: '0.85rem 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: '#dcfce7', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <CheckCircle2 size={16} />
                    </div>
                    <div>
                      <strong style={{ fontSize: '0.86rem', color: '#0f172a', display: 'block' }}>Candidate hired</strong>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Vikas Singh</span>
                    </div>
                  </td>
                  <td style={{ color: '#475569', fontSize: '0.8rem', fontWeight: '600' }}>08 Aug 2026, 06:10 PM</td>
                  <td style={{ color: '#0f172a', fontSize: '0.8rem', fontWeight: '600' }}>Java Developer</td>
                </tr>

              </tbody>
            </table>

            <div style={{ textAlign: 'center', paddingTop: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: '#6366f1', fontWeight: '800', cursor: 'pointer' }} onClick={() => triggerToast('Viewing complete activity history log')}>
                View All Activity
              </span>
            </div>

          </div>

        </div>

        {/* RIGHT SIDEBAR COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* 1. Application Funnel (Inverted Funnel Card) */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.5rem', boxShadow: '0 1px 4px rgba(15,23,42,0.02)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Application Funnel</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
              
              {/* Funnel Level 1: Applications */}
              <div style={{ width: '100%', background: '#c7d2fe', padding: '0.75rem 1rem', borderRadius: '12px', textAlign: 'center', color: '#1e1b4b', fontWeight: '800', fontSize: '0.86rem', boxShadow: '0 2px 6px rgba(199,210,254,0.4)' }}>
                348 <span style={{ fontWeight: '600', fontSize: '0.78rem' }}>Applications</span>
              </div>

              {/* Funnel Level 2: Shortlisted */}
              <div style={{ width: '85%', background: '#93c5fd', padding: '0.65rem 1rem', borderRadius: '12px', textAlign: 'center', color: '#1e3a8a', fontWeight: '800', fontSize: '0.84rem', boxShadow: '0 2px 6px rgba(147,197,253,0.4)' }}>
                72 (20.7%) <span style={{ fontWeight: '600', fontSize: '0.78rem' }}>Shortlisted</span>
              </div>

              {/* Funnel Level 3: Interviews */}
              <div style={{ width: '70%', background: '#fdba74', padding: '0.6rem 1rem', borderRadius: '12px', textAlign: 'center', color: '#7c2d12', fontWeight: '800', fontSize: '0.82rem', boxShadow: '0 2px 6px rgba(253,186,116,0.4)' }}>
                28 (8.0%) <span style={{ fontWeight: '600', fontSize: '0.78rem' }}>Interviews</span>
              </div>

              {/* Funnel Level 4: Hired */}
              <div style={{ width: '55%', background: '#6ee7b7', padding: '0.55rem 1rem', borderRadius: '12px', textAlign: 'center', color: '#064e3b', fontWeight: '800', fontSize: '0.8rem', boxShadow: '0 2px 6px rgba(110,231,183,0.4)' }}>
                6 (1.7%) <span style={{ fontWeight: '600', fontSize: '0.78rem' }}>Hired</span>
              </div>

            </div>
          </div>

          {/* 2. Job Performance Table */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.5rem', boxShadow: '0 1px 4px rgba(15,23,42,0.02)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Job Performance</h3>
              <span style={{ fontSize: '0.76rem', color: '#6366f1', fontWeight: '800', cursor: 'pointer' }} onClick={() => triggerToast('Navigating to All Jobs')}>
                View All Jobs
              </span>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.72rem', textAlign: 'left' }}>
                  <th style={{ paddingBottom: '0.5rem', fontWeight: '700' }}>Job Title</th>
                  <th style={{ paddingBottom: '0.5rem', fontWeight: '700', textAlign: 'center' }}>Apps</th>
                  <th style={{ paddingBottom: '0.5rem', fontWeight: '700', textAlign: 'center' }}>Shortlisted</th>
                  <th style={{ paddingBottom: '0.5rem', fontWeight: '700', textAlign: 'right' }}>Hired</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #f8fafc' }}>
                  <td style={{ padding: '0.6rem 0', fontWeight: '700', color: '#0f172a' }}>Software Engineer</td>
                  <td style={{ textAlign: 'center', color: '#475569' }}>128</td>
                  <td style={{ textAlign: 'center', color: '#475569' }}>32 (25%)</td>
                  <td style={{ textAlign: 'right', fontWeight: '800', color: '#16a34a' }}>4</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f8fafc' }}>
                  <td style={{ padding: '0.6rem 0', fontWeight: '700', color: '#0f172a' }}>Backend Developer</td>
                  <td style={{ textAlign: 'center', color: '#475569' }}>84</td>
                  <td style={{ textAlign: 'center', color: '#475569' }}>18 (21%)</td>
                  <td style={{ textAlign: 'right', fontWeight: '800', color: '#16a34a' }}>1</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f8fafc' }}>
                  <td style={{ padding: '0.6rem 0', fontWeight: '700', color: '#0f172a' }}>Full Stack Developer</td>
                  <td style={{ textAlign: 'center', color: '#475569' }}>62</td>
                  <td style={{ textAlign: 'center', color: '#475569' }}>12 (19%)</td>
                  <td style={{ textAlign: 'right', fontWeight: '800', color: '#16a34a' }}>1</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f8fafc' }}>
                  <td style={{ padding: '0.6rem 0', fontWeight: '700', color: '#0f172a' }}>Java Developer</td>
                  <td style={{ textAlign: 'center', color: '#475569' }}>40</td>
                  <td style={{ textAlign: 'center', color: '#475569' }}>8 (20%)</td>
                  <td style={{ textAlign: 'right', fontWeight: '800', color: '#94a3b8' }}>0</td>
                </tr>
                <tr>
                  <td style={{ padding: '0.6rem 0', fontWeight: '700', color: '#0f172a' }}>UI/UX Designer</td>
                  <td style={{ textAlign: 'center', color: '#475569' }}>34</td>
                  <td style={{ textAlign: 'center', color: '#475569' }}>2 (6%)</td>
                  <td style={{ textAlign: 'right', fontWeight: '800', color: '#94a3b8' }}>0</td>
                </tr>
              </tbody>
            </table>

          </div>

          {/* 3. Top Source of Applications (Donut Chart) */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.5rem', boxShadow: '0 1px 4px rgba(15,23,42,0.02)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Top Source of Applications</h3>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              {/* SVG Donut */}
              <div style={{ position: 'relative', width: '100px', height: '100px', flexShrink: 0 }}>
                <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                  <circle cx="18" cy="18" r="14" fill="none" stroke="#f1f5f9" strokeWidth="5" />
                  <circle cx="18" cy="18" r="14" fill="none" stroke="#818cf8" strokeWidth="5" strokeDasharray="48 100" strokeDashoffset="0" />
                  <circle cx="18" cy="18" r="14" fill="none" stroke="#f472b6" strokeWidth="5" strokeDasharray="22 100" strokeDashoffset="-48" />
                  <circle cx="18" cy="18" r="14" fill="none" stroke="#fbbf24" strokeWidth="5" strokeDasharray="15 100" strokeDashoffset="-70" />
                  <circle cx="18" cy="18" r="14" fill="none" stroke="#34d399" strokeWidth="5" strokeDasharray="8 100" strokeDashoffset="-85" />
                  <circle cx="18" cy="18" r="14" fill="none" stroke="#a78bfa" strokeWidth="5" strokeDasharray="7 100" strokeDashoffset="-93" />
                </svg>
              </div>

              {/* Legend */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.74rem', flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#0f172a' }}>
                  <span><span style={{ color: '#818cf8' }}>●</span> CAREONIX Job Board</span>
                  <strong>48% (167)</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#0f172a' }}>
                  <span><span style={{ color: '#f472b6' }}>●</span> Direct / Company Page</span>
                  <strong>22% (77)</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#0f172a' }}>
                  <span><span style={{ color: '#fbbf24' }}>●</span> LinkedIn</span>
                  <strong>15% (52)</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#0f172a' }}>
                  <span><span style={{ color: '#34d399' }}>●</span> Employee Referral</span>
                  <strong>8% (28)</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#0f172a' }}>
                  <span><span style={{ color: '#a78bfa' }}>●</span> Others</span>
                  <strong>7% (24)</strong>
                </div>
              </div>

            </div>

          </div>

          {/* 4. Quick Actions */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.5rem', boxShadow: '0 1px 4px rgba(15,23,42,0.02)', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Quick Actions</h3>

            <div
              onClick={() => triggerToast('📥 Full Analytics PDF Report downloaded successfully!')}
              style={{ background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: '12px', padding: '0.85rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: '#f3e8ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Download size={16} />
                </div>
                <div>
                  <strong style={{ fontSize: '0.84rem', color: '#0f172a', display: 'block' }}>Download Full Report</strong>
                  <span style={{ fontSize: '0.74rem', color: '#64748b' }}>Get detailed analytics report</span>
                </div>
              </div>
              <ChevronRight size={18} color="#94a3b8" />
            </div>

            <div
              onClick={() => triggerToast('📅 Report scheduled! You will receive weekly analytics on your email.')}
              style={{ background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: '12px', padding: '0.85rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Calendar size={16} />
                </div>
                <div>
                  <strong style={{ fontSize: '0.84rem', color: '#0f172a', display: 'block' }}>Schedule Report</strong>
                  <span style={{ fontSize: '0.74rem', color: '#64748b' }}>Receive reports on your email</span>
                </div>
              </div>
              <ChevronRight size={18} color="#94a3b8" />
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
