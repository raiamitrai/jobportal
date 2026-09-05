import React, { useState } from 'react';
import {
  Users, Briefcase, FileText, CheckCircle2, Building, Calendar,
  TrendingUp, Download, ChevronDown, Info, ArrowUpRight, ShieldCheck,
  Bell, AlertCircle, Clock, Award, ArrowRight
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { useJobs } from '../context/JobContext';

export default function AdminAnalyticsPage() {
  const { registeredUsers } = useAuth();
  const { jobs, applications } = useJobs();

  const totalUsersVal = (registeredUsers || []).length;
  const activeJobsVal = (jobs || []).filter(j => (j.status || 'ACTIVE').toUpperCase() === 'ACTIVE').length;
  const totalAppsVal = (applications || []).length;
  const hiresVal = (applications || []).filter(a => (a.status || '').toUpperCase() === 'HIRED' || (a.status || '').toUpperCase() === 'ACCEPTED').length;
  const companiesVal = (registeredUsers || []).filter(u => u.accountType === 'recruiter' || u.company).length;
  const interviewsVal = (applications || []).filter(a => (a.status || '').toUpperCase() === 'INTERVIEW').length;

  const [dateRange, setDateRange]   = useState('Today (Real-time)');
  const [toastMsg, setToastMsg]     = useState('');
  const [timeframe, setTimeframe]   = useState('Daily');

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  // Sparkline Component
  const Sparkline = ({ points, color }) => (
    <svg width="100%" height="32" viewBox="0 0 120 32" style={{ overflow: 'visible' }}>
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', background: '#f8fafc', minHeight: '92vh', fontFamily: 'Inter, sans-serif' }}>

      {/* Toast Notification */}
      {toastMsg && (
        <div style={{ position: 'fixed', top: '24px', right: '24px', background: '#10b981', color: '#fff', padding: '0.9rem 1.4rem', borderRadius: '14px', boxShadow: '0 10px 25px rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', gap: '0.6rem', zIndex: 300, fontWeight: '700', fontSize: '0.9rem' }}>
          <CheckCircle2 size={20} /><span>{toastMsg}</span>
        </div>
      )}

      {/* ── HEADER ──────────────────────────────────────────────────────────── */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>Analytics Overview</h1>
            <p style={{ fontSize: '0.84rem', color: '#64748b', margin: '4px 0 0 0', fontWeight: '500' }}>
              Real-time analytics and growth insights across CAREONIX.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.6rem 1rem', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '0.84rem', fontWeight: '700', color: '#334155', cursor: 'pointer' }}>
              <Calendar size={15} color="#64748b" />
              <span>{dateRange}</span>
              <ChevronDown size={14} color="#94a3b8" />
            </div>

            <button onClick={() => triggerToast('Exporting Analytics Overview PDF/CSV report...')}
              style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)', color: '#fff', border: 'none', borderRadius: '12px', padding: '0.65rem 1.25rem', fontWeight: '800', fontSize: '0.86rem', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', boxShadow: '0 4px 14px rgba(79,70,229,0.25)' }}>
              Export Report <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* ── 6 KPI METRIC CARDS ────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '1rem' }}>
        {[
          { label: 'Total Users',           val: totalUsersVal, trend: 'Real-time',  up: true,  icon: <Users size={18} />,       iconBg: '#f3e8ff', iconColor: '#7c3aed', stroke: '#8b5cf6', spark: '0,24 20,20 40,22 60,14 80,18 100,10 120,6' },
          { label: 'Active Jobs',           val: activeJobsVal, trend: 'Active',     up: true,  icon: <Briefcase size={18} />,   iconBg: '#f0fdf4', iconColor: '#16a34a', stroke: '#10b981', spark: '0,26 20,22 40,16 60,20 80,14 100,12 120,8' },
          { label: 'Total Applications',   val: totalAppsVal,  trend: 'Submitted',  up: true,  icon: <FileText size={18} />,    iconBg: '#eff6ff', iconColor: '#2563eb', stroke: '#3b82f6', spark: '0,22 20,18 40,24 60,12 80,16 100,8 120,4' },
          { label: 'Hires',                 val: hiresVal,      trend: 'Accepted',   up: true,  icon: <CheckCircle2 size={18} />,iconBg: '#f0fdf4', iconColor: '#16a34a', stroke: '#10b981', spark: '0,28 20,24 40,20 60,18 80,12 100,14 120,6' },
          { label: 'Companies',             val: companiesVal,  trend: 'Registered', up: true,  icon: <Building size={18} />,    iconBg: '#fff7ed', iconColor: '#ea580c', stroke: '#f59e0b', spark: '0,26 20,22 40,18 60,20 80,14 100,12 120,8' },
          { label: 'Interviews Scheduled',  val: interviewsVal, trend: 'Active',     up: true,  icon: <Calendar size={18} />,    iconBg: '#f5f3ff', iconColor: '#7c3aed', stroke: '#8b5cf6', spark: '0,10 20,14 40,12 60,20 80,16 100,22 120,26' },
        ].map((c, i) => (
          <div key={i} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '18px', padding: '1.15rem', boxShadow: '0 1px 4px rgba(15,23,42,0.02)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.65rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: c.iconBg, color: c.iconColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {c.icon}
                </div>
                <span style={{ fontSize: '0.74rem', fontWeight: '700', color: '#64748b', lineHeight: 1.2 }}>{c.label}</span>
              </div>
              <div style={{ fontSize: '1.45rem', fontWeight: '800', color: '#0f172a', lineHeight: 1.1, marginBottom: '4px' }}>{c.val}</div>
              <div style={{ fontSize: '0.72rem', color: c.up ? '#16a34a' : '#dc2626', fontWeight: '700', marginBottom: '0.75rem' }}>
                {c.up ? '▲' : '▼'} {c.trend} <span style={{ color: '#94a3b8', fontWeight: '500' }}>vs last 10 days</span>
              </div>
            </div>
            <Sparkline points={c.spark} color={c.stroke} />
          </div>
        ))}
      </div>

      {/* ── CHARTS ROW 1 (TRENDS) ────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>

        {/* User Growth */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.35rem', boxShadow: '0 1px 4px rgba(15,23,42,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <strong style={{ fontSize: '0.95rem', color: '#0f172a', fontWeight: '800' }}>User Growth</strong>
              <Info size={14} color="#94a3b8" />
            </div>
            <select value={timeframe} onChange={e => setTimeframe(e.target.value)} style={{ padding: '3px 8px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.75rem', fontWeight: '700', background: '#fff', color: '#334155' }}>
              <option>Daily</option>
              <option>Weekly</option>
              <option>Monthly</option>
            </select>
          </div>

          <div style={{ height: '210px', position: 'relative' }}>
            <svg width="100%" height="100%" viewBox="0 0 400 200" preserveAspectRatio="none">
              {/* Grid Lines */}
              <line x1="0" y1="40" x2="400" y2="40" stroke="#f1f5f9" strokeDasharray="4 4" />
              <line x1="0" y1="90" x2="400" y2="90" stroke="#f1f5f9" strokeDasharray="4 4" />
              <line x1="0" y1="140" x2="400" y2="140" stroke="#f1f5f9" strokeDasharray="4 4" />
              <line x1="0" y1="190" x2="400" y2="190" stroke="#cbd5e1" />

              {/* Area Fill */}
              <polygon fill="url(#userGrowthGrad)" points="0,150 40,135 80,120 120,105 160,90 200,75 240,75 280,68 320,62 360,50 400,40 400,190 0,190" opacity="0.15" />
              <defs>
                <linearGradient id="userGrowthGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Main Line */}
              <polyline fill="none" stroke="#6366f1" strokeWidth="3" points="0,150 40,135 80,120 120,105 160,90 200,75 240,75 280,68 320,62 360,50 400,40" />

              {/* Dots */}
              {[[0,150],[40,135],[80,120],[120,105],[160,90],[200,75],[240,75],[280,68],[320,62],[360,50],[400,40]].map(([x,y], idx) => (
                <circle key={idx} cx={x} cy={y} r="4" fill="#6366f1" stroke="#fff" strokeWidth="2" />
              ))}
            </svg>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#94a3b8', marginTop: '6px', fontWeight: '600' }}>
            <span>01 Aug</span><span>02 Aug</span><span>03 Aug</span><span>04 Aug</span><span>05 Aug</span><span>06 Aug</span><span>07 Aug</span><span>08 Aug</span><span>09 Aug</span><span>10 Aug</span>
          </div>
        </div>

        {/* Applications Trend */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.35rem', boxShadow: '0 1px 4px rgba(15,23,42,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <strong style={{ fontSize: '0.95rem', color: '#0f172a', fontWeight: '800' }}>Applications Trend</strong>
              <Info size={14} color="#94a3b8" />
            </div>
            <select style={{ padding: '3px 8px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.75rem', fontWeight: '700', background: '#fff', color: '#334155' }}>
              <option>Daily</option>
            </select>
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', gap: '0.85rem', fontSize: '0.72rem', fontWeight: '700', marginBottom: '0.85rem' }}>
            <span style={{ color: '#6366f1', display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#6366f1' }}></span>Applications</span>
            <span style={{ color: '#16a34a', display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#16a34a' }}></span>Shortlisted</span>
            <span style={{ color: '#ea580c', display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ea580c' }}></span>Interviews</span>
            <span style={{ color: '#2563eb', display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2563eb' }}></span>Hired</span>
          </div>

          <div style={{ height: '185px', position: 'relative' }}>
            <svg width="100%" height="100%" viewBox="0 0 400 180" preserveAspectRatio="none">
              <line x1="0" y1="40" x2="400" y2="40" stroke="#f1f5f9" strokeDasharray="4 4" />
              <line x1="0" y1="90" x2="400" y2="90" stroke="#f1f5f9" strokeDasharray="4 4" />
              <line x1="0" y1="140" x2="400" y2="140" stroke="#f1f5f9" strokeDasharray="4 4" />

              {/* Line 1: Applications (purple) */}
              <polyline fill="none" stroke="#6366f1" strokeWidth="2.5" points="0,110 40,100 80,70 120,85 160,78 200,60 240,55 280,72 320,68 360,55 400,80" />
              {/* Line 2: Shortlisted (green) */}
              <polyline fill="none" stroke="#16a34a" strokeWidth="2.5" points="0,140 40,135 80,120 120,110 160,125 200,118 240,110 280,122 320,120 360,112 400,125" />
              {/* Line 3: Interviews (orange) */}
              <polyline fill="none" stroke="#ea580c" strokeWidth="2.5" points="0,165 40,162 80,152 120,148 160,154 200,150 240,146 280,152 320,150 360,148 400,155" />
              {/* Line 4: Hired (blue) */}
              <polyline fill="none" stroke="#2563eb" strokeWidth="2.5" points="0,178 40,177 80,175 120,174 160,176 200,174 240,173 280,175 320,174 360,173 400,176" />
            </svg>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#94a3b8', marginTop: '6px', fontWeight: '600' }}>
            <span>01 Aug</span><span>02 Aug</span><span>03 Aug</span><span>04 Aug</span><span>05 Aug</span><span>06 Aug</span><span>07 Aug</span><span>08 Aug</span><span>09 Aug</span><span>10 Aug</span>
          </div>
        </div>

        {/* Job Postings Trend */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.35rem', boxShadow: '0 1px 4px rgba(15,23,42,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <strong style={{ fontSize: '0.95rem', color: '#0f172a', fontWeight: '800' }}>Job Postings Trend</strong>
              <Info size={14} color="#94a3b8" />
            </div>
            <select style={{ padding: '3px 8px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.75rem', fontWeight: '700', background: '#fff', color: '#334155' }}>
              <option>Daily</option>
            </select>
          </div>

          <div style={{ height: '210px', position: 'relative' }}>
            <svg width="100%" height="100%" viewBox="0 0 400 200" preserveAspectRatio="none">
              <line x1="0" y1="50" x2="400" y2="50" stroke="#f1f5f9" strokeDasharray="4 4" />
              <line x1="0" y1="100" x2="400" y2="100" stroke="#f1f5f9" strokeDasharray="4 4" />
              <line x1="0" y1="150" x2="400" y2="150" stroke="#f1f5f9" strokeDasharray="4 4" />

              <polyline fill="none" stroke="#6366f1" strokeWidth="3" points="0,140 40,122 80,105 120,95 160,92 200,68 240,88 280,89 320,72 360,52 400,68" />
              {[[0,140],[40,122],[80,105],[120,95],[160,92],[200,68],[240,88],[280,89],[320,72],[360,52],[400,68]].map(([x,y], idx) => (
                <circle key={idx} cx={x} cy={y} r="4" fill="#6366f1" stroke="#fff" strokeWidth="2" />
              ))}
            </svg>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#94a3b8', marginTop: '6px', fontWeight: '600' }}>
            <span>01 Aug</span><span>02 Aug</span><span>03 Aug</span><span>04 Aug</span><span>05 Aug</span><span>06 Aug</span><span>07 Aug</span><span>08 Aug</span><span>09 Aug</span><span>10 Aug</span>
          </div>
        </div>

      </div>

      {/* ── CHARTS ROW 2 (DISTRIBUTIONS) ─────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>

        {/* Users by Type */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.35rem', boxShadow: '0 1px 4px rgba(15,23,42,0.02)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '1rem' }}>
              <strong style={{ fontSize: '0.95rem', color: '#0f172a', fontWeight: '800' }}>Users by Type</strong>
              <Info size={14} color="#94a3b8" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: '1rem', alignItems: 'center' }}>
              {/* Donut */}
              <div style={{ position: 'relative', width: '130px', height: '130px', margin: '0 auto' }}>
                <svg width="130" height="130" viewBox="0 0 42 42">
                  <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#f1f5f9" strokeWidth="6" />
                  {/* Candidates 70.9% */}
                  <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#6366f1" strokeWidth="6" strokeDasharray="70.9 29.1" strokeDashoffset="25" />
                  {/* Recruiters 18.8% */}
                  <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#10b981" strokeWidth="6" strokeDasharray="18.8 81.2" strokeDashoffset="-45.9" />
                  {/* Companies 7.7% */}
                  <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#f59e0b" strokeWidth="6" strokeDasharray="7.7 92.3" strokeDashoffset="-64.7" />
                  {/* Admins 2.6% */}
                  <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#ef4444" strokeWidth="6" strokeDasharray="2.6 97.4" strokeDashoffset="-72.4" />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: '800', color: '#0f172a', lineHeight: 1.1 }}>{totalUsersVal}</span>
                  <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: '600' }}>Total Users</span>
                </div>
              </div>

              {/* Legend */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.78rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#334155', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#6366f1' }}></span>Candidates</span>
                  <strong style={{ color: '#0f172a' }}>
                    {(registeredUsers || []).filter(u => u.accountType === 'candidate' || (!u.accountType && !u.company)).length}
                  </strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#334155', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#10b981' }}></span>Recruiters</span>
                  <strong style={{ color: '#0f172a' }}>
                    {companiesVal}
                  </strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#334155', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#f59e0b' }}></span>Active Jobs</span>
                  <strong style={{ color: '#0f172a' }}>
                    {activeJobsVal}
                  </strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#334155', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#ef4444' }}></span>Admins</span>
                  <strong style={{ color: '#0f172a' }}>
                    {(registeredUsers || []).filter(u => u.role === 'admin' || u.accountType === 'admin').length || 1}
                  </strong>
                </div>
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'center', paddingTop: '1rem', borderTop: '1px solid #f1f5f9', marginTop: '1rem' }}>
            <button onClick={() => triggerToast('Viewing Users Breakdown Report...')} style={{ background: 'none', border: 'none', color: '#6366f1', fontWeight: '700', fontSize: '0.82rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              View Full Report <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* Top Cities (Users) */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.35rem', boxShadow: '0 1px 4px rgba(15,23,42,0.02)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <strong style={{ fontSize: '0.95rem', color: '#0f172a', fontWeight: '800', display: 'block', marginBottom: '1rem' }}>Top Cities (Users)</strong>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {(() => {
                const cityCounts = {};
                (registeredUsers || []).forEach(u => {
                  const city = u.location || u.city || 'India / Remote';
                  cityCounts[city] = (cityCounts[city] || 0) + 1;
                });
                const cityList = Object.entries(cityCounts).map(([city, count]) => ({
                  city,
                  count,
                  pct: totalUsersVal ? `${Math.round((count / totalUsersVal) * 100)}%` : '0%',
                  w: totalUsersVal ? `${Math.min(100, Math.round((count / totalUsersVal) * 100))}%` : '0%'
                })).sort((a, b) => b.count - a.count).slice(0, 5);

                if (cityList.length === 0) {
                  return (
                    <div style={{ fontSize: '0.8rem', color: '#64748b', textAlign: 'center', padding: '1rem' }}>
                      No city demographic data recorded yet.
                    </div>
                  );
                }

                return cityList.map((item, idx) => (
                  <div key={idx}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '3px' }}>
                      <span style={{ fontWeight: '700', color: '#334155' }}>{item.city}</span>
                      <strong style={{ color: '#0f172a' }}>{item.count} <span style={{ color: '#94a3b8', fontWeight: '500' }}>({item.pct})</span></strong>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: '#f1f5f9', borderRadius: '6px', overflow: 'hidden' }}>
                      <div style={{ width: item.w, height: '100%', background: 'linear-gradient(90deg, #6366f1, #818cf8)', borderRadius: '6px' }}></div>
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>

          <div style={{ textAlign: 'center', paddingTop: '1rem', borderTop: '1px solid #f1f5f9', marginTop: '1rem' }}>
            <button onClick={() => triggerToast('Viewing Geographic City Report...')} style={{ background: 'none', border: 'none', color: '#6366f1', fontWeight: '700', fontSize: '0.82rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              View Full Report <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* Applications by Source */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.35rem', boxShadow: '0 1px 4px rgba(15,23,42,0.02)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '1rem' }}>
              <strong style={{ fontSize: '0.95rem', color: '#0f172a', fontWeight: '800' }}>Applications by Source</strong>
              <Info size={14} color="#94a3b8" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: '1rem', alignItems: 'center' }}>
              {/* Donut */}
              <div style={{ position: 'relative', width: '130px', height: '130px', margin: '0 auto' }}>
                <svg width="130" height="130" viewBox="0 0 42 42">
                  <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#f1f5f9" strokeWidth="6" />
                  {totalAppsVal > 0 && (
                    <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#6366f1" strokeWidth="6" strokeDasharray="100 0" strokeDashoffset="25" />
                  )}
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#0f172a', lineHeight: 1.1 }}>{totalAppsVal}</span>
                  <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: '600' }}>Total</span>
                </div>
              </div>

              {/* Legend */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.78rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#334155', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#6366f1' }}></span>Web Portal</span>
                  <strong style={{ color: '#0f172a' }}>{totalAppsVal} <span style={{ color: '#94a3b8', fontWeight: '500' }}>({totalAppsVal ? '100%' : '0%'})</span></strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#334155', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#10b981' }}></span>Mobile App</span>
                  <strong style={{ color: '#0f172a' }}>0 <span style={{ color: '#94a3b8', fontWeight: '500' }}>(0%)</span></strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#334155', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#f59e0b' }}></span>Referral</span>
                  <strong style={{ color: '#0f172a' }}>0 <span style={{ color: '#94a3b8', fontWeight: '500' }}>(0%)</span></strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#334155', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#ef4444' }}></span>Others</span>
                  <strong style={{ color: '#0f172a' }}>0 <span style={{ color: '#94a3b8', fontWeight: '500' }}>(0%)</span></strong>
                </div>
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'center', paddingTop: '1rem', borderTop: '1px solid #f1f5f9', marginTop: '1rem' }}>
            <button onClick={() => triggerToast('Viewing Source Breakdown Report...')} style={{ background: 'none', border: 'none', color: '#6366f1', fontWeight: '700', fontSize: '0.82rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              View Full Report <ArrowRight size={14} />
            </button>
          </div>
        </div>

      </div>

      {/* ── ROW 3 (TOP COMPANIES / RECENT ACTIVITY / KEY INSIGHTS) ───────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>

        {/* Top Companies by Hires */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.35rem', boxShadow: '0 1px 4px rgba(15,23,42,0.02)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <strong style={{ fontSize: '0.95rem', color: '#0f172a', fontWeight: '800', display: 'block', marginBottom: '0.85rem' }}>Top Companies by Hires</strong>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #f1f5f9', textAlign: 'left' }}>
                  <th style={{ paddingBottom: '8px', color: '#64748b', fontWeight: '700' }}>Company</th>
                  <th style={{ paddingBottom: '8px', color: '#64748b', fontWeight: '700' }}>Jobs / Hires</th>
                  <th style={{ paddingBottom: '8px', color: '#64748b', fontWeight: '700', textAlign: 'right' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const recruiters = (registeredUsers || []).filter(u => u.accountType === 'recruiter' || u.company);
                  if (recruiters.length === 0) {
                    return (
                      <tr>
                        <td colSpan="3" style={{ textAlign: 'center', padding: '1.5rem', color: '#64748b' }}>
                          No companies registered yet.
                        </td>
                      </tr>
                    );
                  }
                  return recruiters.slice(0, 5).map((r, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f8fafc' }}>
                      <td style={{ padding: '0.55rem 0', fontWeight: '700', color: '#0f172a' }}>{r.company || r.name || 'Organization'}</td>
                      <td style={{ padding: '0.55rem 0', fontWeight: '700', color: '#334155' }}>
                        {(jobs || []).filter(j => j.company === r.company || j.postedBy === r.email).length} Jobs
                      </td>
                      <td style={{ padding: '0.55rem 0', textAlign: 'right', fontWeight: '800', color: r.approvalStatus === 'APPROVED' ? '#16a34a' : '#ea580c' }}>
                        {r.approvalStatus || 'APPROVED'}
                      </td>
                    </tr>
                  ));
                })()}
              </tbody>
            </table>
          </div>

          <div style={{ textAlign: 'center', paddingTop: '0.85rem', borderTop: '1px solid #f1f5f9', marginTop: '0.85rem' }}>
            <button onClick={() => triggerToast('Viewing Full Companies Hiring Report...')} style={{ background: 'none', border: 'none', color: '#6366f1', fontWeight: '700', fontSize: '0.82rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              View Full Report <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* Recent Activity (Platform) */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.35rem', boxShadow: '0 1px 4px rgba(15,23,42,0.02)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <strong style={{ fontSize: '0.95rem', color: '#0f172a', fontWeight: '800', display: 'block', marginBottom: '0.85rem' }}>Recent Activity (Platform)</strong>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.78rem' }}>
              {(() => {
                const activities = [];
                (registeredUsers || []).slice(-3).reverse().forEach(u => {
                  activities.push({
                    text: `New user signup - ${u.name || u.email}`,
                    time: 'Recent',
                    icon: <Users size={14} />,
                    bg: '#f3e8ff',
                    color: '#7c3aed'
                  });
                });
                (jobs || []).slice(-2).reverse().forEach(j => {
                  activities.push({
                    text: `Job posted - ${j.title || j.jobTitle}`,
                    time: 'Recent',
                    icon: <Briefcase size={14} />,
                    bg: '#f0fdf4',
                    color: '#16a34a'
                  });
                });
                if (activities.length === 0) {
                  return <div style={{ color: '#64748b', textAlign: 'center', padding: '1rem' }}>No recent platform activity recorded.</div>;
                }
                return activities.slice(0, 5).map((act, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: act.bg, color: act.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {act.icon}
                      </div>
                      <span style={{ fontWeight: '600', color: '#334155' }}>{act.text}</span>
                    </div>
                    <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: '600', whiteSpace: 'nowrap' }}>{act.time}</span>
                  </div>
                ));
              })()}
            </div>
          </div>

          <div style={{ textAlign: 'center', paddingTop: '0.85rem', borderTop: '1px solid #f1f5f9', marginTop: '0.85rem' }}>
            <button onClick={() => triggerToast('Opening Platform Audit Activity Logs...')} style={{ background: 'none', border: 'none', color: '#6366f1', fontWeight: '700', fontSize: '0.82rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              View Activity Log <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* Key Insights */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.35rem', boxShadow: '0 1px 4px rgba(15,23,42,0.02)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <strong style={{ fontSize: '0.95rem', color: '#0f172a', fontWeight: '800', display: 'block', marginBottom: '0.85rem' }}>Key Insights</strong>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.78rem' }}>
              {[
                `Platform has ${totalUsersVal} registered user(s) currently active.`,
                `There are ${activeJobsVal} active job opening(s) live on the portal.`,
                `Total of ${totalAppsVal} application(s) received across all openings.`,
                `CAREONIX Web Portal is operating cleanly with 0 system errors.`,
              ].map((ins, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#f5f3ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                    <ShieldCheck size={14} />
                  </div>
                  <span style={{ fontWeight: '600', color: '#334155', lineHeight: 1.35 }}>{ins}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ textAlign: 'center', paddingTop: '0.85rem', borderTop: '1px solid #f1f5f9', marginTop: '0.85rem' }}>
            <button onClick={() => triggerToast('Viewing AI Detailed Strategic Insights...')} style={{ background: 'none', border: 'none', color: '#6366f1', fontWeight: '700', fontSize: '0.82rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              View Detailed Insights <ArrowRight size={14} />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
