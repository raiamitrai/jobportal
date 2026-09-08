import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Plus, CheckCircle2, ExternalLink, Globe, Edit3, Trash2,
  Search, Bookmark, Upload, X, Filter, RotateCcw,
  Briefcase, MapPin, DollarSign, Calendar, Award, Code, FileText,
  Clock, ChevronLeft, ChevronRight, Eye, MoreVertical,
  Lock, Unlock, Check
} from 'lucide-react';
import { useJobs } from '../context/JobContext';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import CompanyLogo from '../components/CompanyLogo';
import { getSettings } from '../utils/settingsManager';
import {
  getTodayIsoDate,
  getDefaultDeadlineDate,
  formatJobDate,
  isJobExpired,
  isDateInPast
} from '../utils/timeAgo';

// ─── Logo Upload ──────────────────────────────────────────────────────────────
function LogoUpload({ logoUrl, onChange }) {
  const ref = useRef();
  return (
    <div>
      <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '6px' }}>
        Company Logo (optional)
      </label>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {logoUrl ? (
          <div style={{ position: 'relative' }}>
            <img src={logoUrl} alt="logo" style={{ width: '50px', height: '50px', borderRadius: '10px', objectFit: 'contain', border: '1px solid #e2e8f0' }} />
            <button type="button" onClick={() => onChange(null)} style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#dc2626', border: 'none', borderRadius: '50%', width: '18px', height: '18px', color: '#ffffff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
              <X size={10} />
            </button>
          </div>
        ) : (
          <div onClick={() => ref.current?.click()} style={{ width: '50px', height: '50px', borderRadius: '10px', border: '2px dashed #c7d2fe', background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#4f46e5' }}>
            <Upload size={19} />
          </div>
        )}
        <div>
          <button type="button" onClick={() => ref.current?.click()} style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', color: '#475569', padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Upload size={13} /> {logoUrl ? 'Change Logo' : 'Upload Logo'}
          </button>
          <p style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '3px' }}>PNG, JPG — max 500KB</p>
        </div>
        <input ref={ref} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => {
          const f = e.target.files?.[0];
          if (!f) return;
          if (f.size > 500 * 1024) { alert('Max 500KB'); return; }
          const r = new FileReader();
          r.onload = ev => onChange(ev.target.result);
          r.readAsDataURL(f);
        }} />
      </div>
    </div>
  );
}

// ─── Dual-Step Job Modal (Post / Edit) ─────────────────────────────────────────
function JobModal({ title, form, setForm, onSubmit, onClose, submitLabel, success, appMethod, setAppMethod, step = 2, setStep, isEdit = false }) {
  const iStyle = { width: '100%', padding: '0.75rem 0.9rem', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#0f172a', marginTop: '5px', fontFamily: 'Inter, sans-serif', fontSize: '0.875rem' };
  const lStyle = { fontSize: '0.78rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em' };

  // For Edit modal or step 2, show form directly
  const showFormDirectly = isEdit || step === 2 || !setStep;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: '1rem', overflowY: 'auto' }}>
      <div style={{ width: '640px', maxHeight: '90vh', overflowY: 'auto', background: '#ffffff', borderRadius: '24px', padding: '2rem', boxShadow: '0 25px 60px rgba(15,23,42,0.2)', border: '1px solid #e2e8f0' }}>
        
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
              {isEdit ? 'Edit Job Posting' : (step === 1 ? 'Select Application Method' : 'Post New Job Vacancy')}
            </h2>
            <p style={{ fontSize: '0.83rem', color: '#64748b', marginTop: '3px' }}>
              {isEdit ? 'Update vacancy details, salary, skills, status or apply link.' : (step === 1 ? 'Choose how candidates will submit their applications for this vacancy.' : 'Fill in the vacancy details to publish to candidate portal.')}
            </p>
          </div>
          <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>✕</button>
        </div>

        {success && (
          <div style={{ background: '#dcfce7', border: '1px solid #bbf7d0', color: '#15803d', borderRadius: '12px', padding: '0.85rem 1rem', marginBottom: '1.25rem', fontWeight: '700', fontSize: '0.9rem', textAlign: 'center' }}>
            {success}
          </div>
        )}

        {/* STEP 1: Application Method Selection Screen (Only for New Post) */}
        {!showFormDirectly && step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {/* Choice A: Apply on CAREONIX */}
            <div
              onClick={() => setAppMethod && setAppMethod('careonix')}
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
              <div style={{ width: '22px', height: '22px', borderRadius: '50%', border: `2px solid ${appMethod === 'careonix' ? '#7c3aed' : '#cbd5e1'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '4px' }}>
                {appMethod === 'careonix' && <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#7c3aed' }} />}
              </div>

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
                </div>
              </div>
            </div>

            {/* Choice B: Apply on External Website */}
            <div
              onClick={() => setAppMethod && setAppMethod('external')}
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
              <div style={{ width: '22px', height: '22px', borderRadius: '50%', border: `2px solid ${appMethod === 'external' ? '#7c3aed' : '#cbd5e1'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '4px' }}>
                {appMethod === 'external' && <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#7c3aed' }} />}
              </div>

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

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.86rem', color: '#334155' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle2 size={16} color="#16a34a" style={{ flexShrink: 0 }} />
                    <span>Provide your company's career page / ATS URL</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle2 size={16} color="#16a34a" style={{ flexShrink: 0 }} />
                    <span>Candidates will be redirected to your external portal</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Cancel & Continue Buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button
                onClick={onClose}
                style={{ padding: '0.75rem 1.6rem', borderRadius: '12px', background: '#f8fafc', border: '1px solid #cbd5e1', color: '#475569', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={() => setStep && setStep(2)}
                style={{ padding: '0.75rem 1.8rem', borderRadius: '12px', background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', border: 'none', color: '#ffffff', fontWeight: '800', fontSize: '0.92rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 14px rgba(124,58,237,0.25)' }}
              >
                Continue to Job Form &rarr;
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Job Details Form (Active when showFormDirectly is true) */}
        {showFormDirectly && (
          <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ background: '#f8fafc', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#0f172a' }}>
                Method: {(appMethod === 'careonix' || form.applicationMethod === 'careonix') ? '🟣 Apply on CAREONIX (Direct Internal)' : '🌐 Apply on External Website'}
              </span>
              {!isEdit && setStep && (
                <button type="button" onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: '#7c3aed', fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer' }}>
                  Change Method
                </button>
              )}
            </div>

            <LogoUpload logoUrl={form.logoUrl} onChange={v => setForm(f => ({ ...f, logoUrl: v }))} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={lStyle}>Job Title *</label>
                <input style={iStyle} required placeholder="e.g. Senior Java Developer" value={form.title || ''} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              </div>
              <div>
                <label style={lStyle}>Company Name *</label>
                <input style={iStyle} required placeholder="e.g. Careonix Tech" value={form.company || ''} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={lStyle}>Location</label>
                <input style={iStyle} placeholder="e.g. Bangalore, India" value={form.location || ''} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
              </div>
              <div>
                <label style={lStyle}>Job Status</label>
                <select style={iStyle} value={form.status || 'ACTIVE'} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                  <option value="ACTIVE">🟢 Active (Open for Applications)</option>
                  <option value="CLOSED">🔴 Closed (Applications Locked)</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={lStyle}>Job Type</label>
                <select style={iStyle} value={form.type || 'Full-time'} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                  <option>Full-time</option><option>Part-time</option><option>Internship</option>
                  <option>Apprentice</option><option>Remote</option><option>Hybrid</option>
                  <option>Contract</option><option>Freelance</option>
                </select>
              </div>
              <div>
                <label style={lStyle}>Experience</label>
                <select style={iStyle} value={form.experience || '1-3 Years'} onChange={e => setForm(f => ({ ...f, experience: e.target.value }))}>
                  <option>Fresher (0 Years)</option><option>Fresher (0-1 Year)</option>
                  <option>1-3 Years</option><option>2-4 Yrs</option><option>2-5 Yrs</option>
                  <option>3-5 Years</option><option>5+ Years</option><option>7+ Years</option><option>10+ Years</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '1rem' }}>
              <div>
                <label style={lStyle}>Currency</label>
                <select style={iStyle} value={form.currency || 'INR'} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}>
                  <option value="INR">₹ INR</option>
                  <option value="USD">$ USD</option>
                </select>
              </div>
              <div>
                <label style={lStyle}>Salary Range</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '5px' }}>
                  <span style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a', flexShrink: 0 }}>
                    {form.currency === 'USD' ? '$' : '₹'}
                  </span>
                  <input style={{ ...iStyle, marginTop: 0, flex: 1 }} placeholder="e.g. 8,00,000 - 15,00,000" value={form.salary || ''} onChange={e => setForm(f => ({ ...f, salary: e.target.value }))} />
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={lStyle}>Last Date to Apply (Deadline) *</label>
                <input
                  style={iStyle}
                  type="date"
                  required
                  min={getTodayIsoDate()}
                  value={form.lastDateToApply || getDefaultDeadlineDate(30)}
                  onChange={e => {
                    const newDate = e.target.value;
                    setForm(f => {
                      const wasExpired = isJobExpired(f.lastDateToApply);
                      const isNewFuture = !isJobExpired(newDate);
                      const nextStatus = (wasExpired && isNewFuture && (f.status || '').toUpperCase() === 'CLOSED') ? 'ACTIVE' : (f.status || 'ACTIVE');
                      return { ...f, lastDateToApply: newDate, status: nextStatus };
                    });
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                  <span style={{ fontSize: '0.74rem', color: '#6366f1', fontWeight: '700' }}>
                    Format: {formatJobDate(form.lastDateToApply || getDefaultDeadlineDate(30))}
                  </span>
                  {isDateInPast(form.lastDateToApply) ? (
                    <span style={{ fontSize: '0.72rem', color: '#dc2626', fontWeight: '700' }}>⚠️ Date is in past!</span>
                  ) : (
                    <span style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: '600' }}>✓ Today or future date</span>
                  )}
                </div>
              </div>
              <div>
                <label style={lStyle}>Application Method</label>
                <select style={iStyle} value={form.applicationMethod || (appMethod || 'careonix')} onChange={e => {
                  const val = e.target.value;
                  setForm(f => ({ ...f, applicationMethod: val }));
                  if (setAppMethod) setAppMethod(val);
                }}>
                  <option value="careonix">🟣 CAREONIX Internal</option>
                  <option value="external">🌐 External Website URL</option>
                </select>
              </div>
            </div>

            <div>
              <label style={lStyle}>Skills (comma separated)</label>
              <input style={iStyle} placeholder="Java, Spring Boot, React, MySQL" value={form.skills || ''} onChange={e => setForm(f => ({ ...f, skills: e.target.value }))} />
            </div>

            {/* External URL field if method is external */}
            {(form.applicationMethod === 'external' || appMethod === 'external') && (
              <div>
                <label style={lStyle}>Apply Link URL *</label>
                <input style={iStyle} required placeholder="https://careers.company.com/apply" value={form.applyUrl || ''} onChange={e => setForm(f => ({ ...f, applyUrl: e.target.value }))} />
                <p style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '4px' }}>Candidates click "Apply Now" &rarr; redirected here</p>
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button type="submit" style={{ flex: 1, padding: '0.8rem', background: '#4f46e5', color: '#ffffff', border: 'none', borderRadius: '12px', fontWeight: '700', fontSize: '0.95rem', cursor: 'pointer' }}>
                {submitLabel}
              </button>
              <button type="button" onClick={onClose} style={{ flex: 1, padding: '0.8rem', background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0', borderRadius: '12px', fontWeight: '600', fontSize: '0.9rem', cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}

// ─── Reference-matching Job Card ──────────────────────────────────────────────
function JobCard({ job, role, currentUser, hasApplied, isSaved, onApply, onSave, onEdit, onDelete, onStatusChange }) {
  const skillsList = Array.isArray(job.skills)
    ? job.skills
    : (job.skills ? job.skills.split(',').map(s => s.trim()) : []);

  const isExpired = isJobExpired(job.lastDateToApply);
  const isManuallyClosed = (job.status || '').toUpperCase() === 'CLOSED';
  const isClosed = isManuallyClosed || isExpired;
  const uEmail = (currentUser?.email || '').toLowerCase().trim();
  const uId = (currentUser?.identifier || '').toLowerCase().trim();
  const uName = (currentUser?.name || '').toLowerCase().trim();
  const uComp = (currentUser?.company || '').toLowerCase().trim();
  const p = (job.postedBy || '').toLowerCase().trim();
  const jComp = (job.company || '').toLowerCase().trim();

  const isOwnerOrAdmin = role === 'admin' || (role === 'recruiter' && (
    (p && (p === uEmail || p === uId || (uName && p === uName))) ||
    (uComp && jComp && jComp === uComp) ||
    (uEmail && p && (uEmail.includes(p) || p.includes(uEmail)))
  ));

  return (
    <div style={{
      background: '#ffffff',
      border: `1px solid ${isClosed ? '#fca5a5' : '#e2e8f0'}`,
      borderRadius: '16px',
      padding: '1.25rem',
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '1.25rem',
      boxShadow: '0 1px 6px rgba(15,23,42,0.04)',
      transition: 'box-shadow 0.2s ease',
      opacity: isClosed && role === 'candidate' ? 0.9 : 1
    }}>

      {/* ── COL 1: Company Logo + Job Info (LEFT) ───────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', flex: '1 1 280px', minWidth: 0 }}>
        <div style={{ flexShrink: 0 }}>
          <CompanyLogo company={job.company} logoUrl={job.logoUrl} size={50} />
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a', margin: '0 0 2px 0', wordBreak: 'break-word' }}>
              {job.title}
            </h3>
            {isExpired ? (
              <span style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', fontSize: '0.72rem', fontWeight: '800', padding: '1px 7px', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                <Lock size={10} /> Deadline Passed
              </span>
            ) : isClosed ? (
              <span style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', fontSize: '0.72rem', fontWeight: '800', padding: '1px 7px', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                <Lock size={10} /> Closed
              </span>
            ) : null}
          </div>
          <span style={{ fontSize: '0.85rem', color: '#334155', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            {job.company}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#3b82f6" style={{ flexShrink: 0 }}>
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </span>
          <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '4px 0 8px 0' }}>
            {job.location}
            {job.type && <> &bull; <span style={{ textTransform: 'capitalize' }}>{job.type}</span></>}
            {job.experience && <> &bull; {job.experience}</>}
          </p>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {skillsList.map((sk, i) => (
              <span key={i} style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', color: '#475569', padding: '2px 9px', borderRadius: '6px', fontSize: '0.74rem', fontWeight: '600' }}>{sk}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ── COL 2: Status Badge + Salary + Recruiter Actions (CENTER) ────────── */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        flex: '1 1 180px',
        textAlign: 'center',
        padding: '0 0.5rem'
      }}>
        {isExpired ? (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '4px',
            background: '#fee2e2', color: '#b91c1c',
            border: '1px solid #fca5a5',
            padding: '3px 12px', borderRadius: '6px',
            fontSize: '0.76rem', fontWeight: '700'
          }}>
            <Lock size={12} /> Closed &bull; Deadline Passed
          </span>
        ) : isClosed ? (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '4px',
            background: '#fee2e2', color: '#b91c1c',
            border: '1px solid #fca5a5',
            padding: '3px 12px', borderRadius: '6px',
            fontSize: '0.76rem', fontWeight: '700'
          }}>
            <Lock size={12} /> Closed
          </span>
        ) : (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '4px',
            background: '#dcfce7', color: '#15803d',
            border: '1px solid #bbf7d0',
            padding: '3px 12px', borderRadius: '6px',
            fontSize: '0.76rem', fontWeight: '700'
          }}>
            <CheckCircle2 size={12} /> Active &bull; Verified
          </span>
        )}

        <span style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0f172a', whiteSpace: 'nowrap' }}>
          {job.salary}
        </span>

        {/* Recruiter/Admin: Edit, Delete, Close / Active buttons (Restricted to Owner Recruiter or Admin) */}
        {isOwnerOrAdmin && (
          <div style={{ display: 'flex', gap: '0.4rem', marginTop: '4px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              onClick={() => onEdit(job)}
              title={isExpired ? "Extend application deadline date" : "Edit job details"}
              style={{
                background: isExpired ? '#fef3c7' : '#f8fafc',
                border: `1px solid ${isExpired ? '#f59e0b' : '#cbd5e1'}`,
                color: isExpired ? '#b45309' : '#334155',
                padding: '4px 10px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.78rem',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem'
              }}
            >
              <Edit3 size={13} /> {isExpired ? 'Extend Deadline' : 'Edit'}
            </button>
            <button
              onClick={() => onDelete(job.id, job.title)}
              title="Delete permanently from database and all dashboards"
              style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '4px 10px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
            >
              <Trash2 size={13} /> Delete
            </button>
            {isClosed ? (
              <button
                onClick={() => onStatusChange && onStatusChange(job.id, 'ACTIVE')}
                title={isExpired ? "Extend deadline to activate" : "Activate job - candidates can apply again"}
                style={{ background: '#ecfdf5', border: '1.5px solid #6ee7b7', color: '#047857', padding: '4px 10px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.3rem', boxShadow: '0 1px 4px rgba(16,185,129,0.15)' }}
              >
                <Unlock size={13} /> Activate
              </button>
            ) : (
              <button
                onClick={() => onStatusChange && onStatusChange(job.id, 'CLOSED')}
                title="Close job - lock candidate applications"
                style={{ background: '#fff7ed', border: '1.5px solid #fdba74', color: '#c2410c', padding: '4px 10px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
              >
                <Lock size={13} /> Close
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── COL 3: Apply Now + Save (RIGHT) ────────────────────────────────── */}
      {role === 'candidate' && (
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'flex-start',
          gap: '8px',
          flex: '1 1 140px'
        }}>
          {job.lastDateToApply && (
            <span style={{ fontSize: '0.72rem', color: isClosed ? '#94a3b8' : '#ea580c', fontWeight: '700', background: isClosed ? '#f1f5f9' : '#fffbeb', border: `1px solid ${isClosed ? '#e2e8f0' : '#fef3c7'}`, padding: '2px 8px', borderRadius: '6px', whiteSpace: 'nowrap', width: '100%' }}>
              Deadline: {formatJobDate(job.lastDateToApply)}
            </span>
          )}
          {isClosed ? (
            <button
              disabled
              title={isExpired ? "Application deadline has passed for this position" : "Applications are closed for this position"}
              style={{
                padding: '0.45rem 0.9rem',
                background: '#f8fafc',
                color: '#94a3b8',
                border: '1.5px solid #cbd5e1',
                borderRadius: '8px',
                fontWeight: '700',
                fontSize: '0.78rem',
                cursor: 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px',
                whiteSpace: 'nowrap',
                opacity: 0.85
              }}
            >
              <Lock size={13} /> {isExpired ? 'Application Closed (Deadline Passed)' : 'Applications Closed'}
            </button>
          ) : hasApplied ? (
            <button
              onClick={() => { if (job.applyUrl) { const u = job.applyUrl.startsWith('http') ? job.applyUrl : `https://${job.applyUrl}`; window.open(u, '_blank'); } }}
              style={{ padding: '0.45rem 0.9rem', background: '#dcfce7', color: '#15803d', border: '1.5px solid #86efac', borderRadius: '8px', fontWeight: '700', fontSize: '0.78rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', whiteSpace: 'nowrap' }}
            >
              <CheckCircle2 size={13} /> Applied ↗
            </button>
          ) : (
            <button
              onClick={() => onApply(job)}
              style={{ padding: '0.45rem 0.9rem', background: '#4f46e5', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '0.78rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', whiteSpace: 'nowrap', boxShadow: '0 2px 8px rgba(79,70,229,0.2)' }}
            >
              Apply Now <ExternalLink size={12} />
            </button>
          )}
          {getSettings()?.platform?.enableSavedJobs !== false && (
            <button
              onClick={() => onSave(job.id)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
                background: isSaved ? '#fefce8' : '#f8fafc',
                border: `1.5px solid ${isSaved ? '#fde68a' : '#e2e8f0'}`,
                color: isSaved ? '#d97706' : '#64748b',
                padding: '0.45rem 0.85rem', borderRadius: '8px',
                fontWeight: '600', fontSize: '0.78rem', cursor: 'pointer',
                whiteSpace: 'nowrap', transition: 'all 0.2s ease'
              }}
              title={isSaved ? 'Remove bookmark' : 'Save for later'}
            >
              <Bookmark size={13} fill={isSaved ? '#d97706' : 'none'} />
              {isSaved ? 'Saved' : 'Save'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// Available Skill Options for filter
const POPULAR_SKILLS = [
  'Java', 'Spring Boot', 'React', 'Python', 'JavaScript',
  'SQL', 'AWS', 'MySQL', 'Docker', 'Linux', 'Go', 'Data Structures'
];

// ─── Admin Jobs Directory View (100% Match with Reference UI Screenshot) ──────
function AdminJobsDirectory({ onPostJobClick, onEditJob }) {
  const { jobs, applications, updateJobStatusByAdmin, updateJobStatus, deleteJob } = useJobs();
  const [adminTab, setAdminTab] = useState('All Jobs');
  const [searchQuery, setSearchQuery] = useState('');
  const [jobTypeFilter, setJobTypeFilter] = useState('All Types');
  const [expFilter, setExpFilter] = useState('All Levels');
  const [locationFilter, setLocationFilter] = useState('All Locations');
  const [postedByFilter, setPostedByFilter] = useState('All');
  const [selectedJobView, setSelectedJobView] = useState(null);
  const [toastMsg, setToastMsg] = useState('');

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  // Derive job items dynamically from real JobContext state (NO DUMMY FAKE JOBS HARDCODED)
  const adminJobsList = (jobs || []).map((j, idx) => {
    const rawStatus = (j.status || 'ACTIVE').toUpperCase();
    const isExpired = isJobExpired(j.lastDateToApply);
    const isManuallyClosed = rawStatus === 'CLOSED' || rawStatus === 'INACTIVE';
    const isClosed = isManuallyClosed || isExpired;
    const isPending = rawStatus === 'PENDING' || rawStatus === 'PENDING_APPROVAL';

    let displayStatus = 'Active';
    if (isPending) displayStatus = 'Pending';
    else if (isClosed) displayStatus = 'Closed';
    else if (rawStatus === 'REPORTED') displayStatus = 'Reported';
    else displayStatus = 'Active';

    const bgColors = ['#6366f1', '#10b981', '#f59e0b', '#3b82f6', '#06b6d4', '#8b5cf6', '#ef4444', '#14b8a6'];
    const avatarBg = bgColors[idx % bgColors.length];

    const appsForJob = (applications || []).filter(a => String(a.jobId) === String(j.id));

    return {
      id: j.id,
      title: j.title || 'Position',
      expYears: j.experience || '1-3 Yrs',
      category: j.category || j.type || 'IT & Software',
      company: j.company || 'Careonix Partner',
      companyVerified: true,
      postedBy: j.postedBy || 'Recruiter',
      postedRole: (j.postedBy === 'admin@careonix.com' || j.postedBy === 'Admin') ? 'Admin' : 'Recruiter',
      type: j.type || 'Full-time',
      typeColor: (j.type || '').toLowerCase().includes('contract') ? '#f3e8ff' : '#dcfce7',
      typeTextColor: (j.type || '').toLowerCase().includes('contract') ? '#7c3aed' : '#15803d',
      location: j.location || 'Remote',
      workMode: j.workMode || 'Hybrid',
      applicantsCount: appsForJob.length || j.applications || 0,
      newApplicantsCount: appsForJob.filter(a => a.status === 'APPLIED' || a.status === 'PENDING').length || 0,
      postedDate: j.postedDate || 'Recent',
      lastDateToApply: j.lastDateToApply,
      isExpired,
      isManuallyClosed,
      isClosed,
      status: displayStatus,
      rawStatus: rawStatus,
      avatarBg: avatarBg,
      rawJob: j
    };
  });

  const platformSettings = getSettings()?.platform || {};
  const defaultPageSize = parseInt(platformSettings.jobsPerPage || '10', 10) || 10;
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [adminPage, setAdminPage] = useState(1);

  // Sync pageSize whenever settings change
  useEffect(() => {
    const s = getSettings()?.platform || {};
    const size = parseInt(s.jobsPerPage || '10', 10) || 10;
    setPageSize(size);
  }, []);

  const filteredAdminJobs = adminJobsList.filter(j => {
    if (adminTab.startsWith('Pending Approval') && j.status !== 'Pending') return false;
    if (adminTab.startsWith('Active Jobs') && j.status !== 'Active') return false;
    if (adminTab.startsWith('Closed Jobs') && j.status !== 'Closed') return false;
    if (adminTab.startsWith('Reported Jobs') && j.status !== 'Reported') return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = (j.title || '').toLowerCase().includes(q);
      const matchComp = (j.company || '').toLowerCase().includes(q);
      const matchCat = (j.category || '').toLowerCase().includes(q);
      if (!matchTitle && !matchComp && !matchCat) return false;
    }
    return true;
  });

  const totalAdminPages = Math.max(1, Math.ceil(filteredAdminJobs.length / pageSize));
  const adminStartIndex = (adminPage - 1) * pageSize;
  const paginatedAdminJobs = filteredAdminJobs.slice(adminStartIndex, adminStartIndex + pageSize);

  const handleActivateJob = (jobId, title, rawJob) => {
    const target = rawJob || jobs.find(j => String(j.id) === String(jobId));
    if (target && isJobExpired(target.lastDateToApply)) {
      alert(`Job "${title}" application deadline has expired (${formatJobDate(target.lastDateToApply)}). Please extend the deadline date to today or a future date to reopen applications.`);
      if (onEditJob) {
        onEditJob(target);
      }
      return;
    }
    if (updateJobStatus) updateJobStatus(jobId, 'ACTIVE');
    else if (updateJobStatusByAdmin) updateJobStatusByAdmin(jobId, 'ACTIVE');
    triggerToast(`🟢 Job "${title}" activated & open for applications!`);
  };

  const handleCloseJob = (jobId, title) => {
    if (updateJobStatus) updateJobStatus(jobId, 'CLOSED');
    else if (updateJobStatusByAdmin) updateJobStatusByAdmin(jobId, 'CLOSED');
    triggerToast(`🔒 Job "${title}" closed & candidate applications locked.`);
  };

  const handleDeleteJob = (jobId, title) => {
    if (window.confirm(`Delete "${title}" permanently? This removes the job from database and all dashboards.`)) {
      deleteJob(jobId);
      if (selectedJobView && selectedJobView.id === jobId) setSelectedJobView(null);
      triggerToast(`🗑️ Job "${title}" permanently deleted.`);
    }
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

      {/* Breadcrumb & Header Bar */}
      <div>
        <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '600', marginBottom: '4px' }}>
          Dashboard &gt; Jobs &gt; All Jobs
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
              Jobs
            </h1>
            <p style={{ color: '#64748b', marginTop: '4px', fontSize: '0.9rem' }}>
              Manage all jobs posted on the platform.
            </p>
          </div>

          {/* Action Buttons: Post a Job & Export */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={onPostJobClick}
              style={{
                background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                color: '#ffffff', border: 'none', borderRadius: '12px',
                padding: '0.65rem 1.25rem', fontWeight: '800', fontSize: '0.86rem',
                display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(79,70,229,0.25)'
              }}
            >
              <Plus size={18} /> Post a Job
            </button>

            <button
              onClick={() => triggerToast('Exporting Jobs Directory CSV...')}
              style={{
                background: '#ffffff', color: '#334155', border: '1px solid #cbd5e1',
                borderRadius: '12px', padding: '0.65rem 1.25rem', fontWeight: '700',
                fontSize: '0.86rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
                cursor: 'pointer'
              }}
            >
              <Upload size={16} style={{ transform: 'rotate(180deg)' }} /> Export
            </button>
          </div>
        </div>
      </div>

      {/* ── TOP KPI ROW (5 Metric Cards Matching Reference Screenshot) ────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem' }}>
        
        {/* Card 1: Total Jobs */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '18px', padding: '1.25rem', boxShadow: '0 1px 4px rgba(15,23,42,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: '#f3e8ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Briefcase size={18} />
            </div>
            <div>
              <span style={{ fontSize: '0.76rem', fontWeight: '700', color: '#64748b', display: 'block' }}>Total Jobs</span>
              <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', lineHeight: 1.1 }}>{(jobs || []).length}</div>
            </div>
          </div>
        </div>

        {/* Card 2: Pending Approval */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '18px', padding: '1.25rem', boxShadow: '0 1px 4px rgba(15,23,42,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: '#fff7ed', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={18} />
            </div>
            <div>
              <span style={{ fontSize: '0.76rem', fontWeight: '700', color: '#64748b', display: 'block' }}>Pending Approval</span>
              <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', lineHeight: 1.1 }}>
                {(jobs || []).filter(j => ((j.status || '').toUpperCase() === 'PENDING' || (j.status || '').toUpperCase() === 'PENDING_APPROVAL') && !isJobExpired(j.lastDateToApply)).length}
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Active Jobs */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '18px', padding: '1.25rem', boxShadow: '0 1px 4px rgba(15,23,42,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={18} />
            </div>
            <div>
              <span style={{ fontSize: '0.76rem', fontWeight: '700', color: '#64748b', display: 'block' }}>Active Jobs</span>
              <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', lineHeight: 1.1 }}>
                {(jobs || []).filter(j => (j.status || 'ACTIVE').toUpperCase() === 'ACTIVE' && !isJobExpired(j.lastDateToApply) && (j.status || '').toUpperCase() !== 'CLOSED' && (j.status || '').toUpperCase() !== 'INACTIVE').length}
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: Closed Jobs */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '18px', padding: '1.25rem', boxShadow: '0 1px 4px rgba(15,23,42,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: '#fef2f2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Briefcase size={18} />
            </div>
            <div>
              <span style={{ fontSize: '0.76rem', fontWeight: '700', color: '#64748b', display: 'block' }}>Closed Jobs</span>
              <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', lineHeight: 1.1 }}>
                {(jobs || []).filter(j => (j.status || '').toUpperCase() === 'CLOSED' || (j.status || '').toUpperCase() === 'INACTIVE' || isJobExpired(j.lastDateToApply)).length}
              </div>
            </div>
        </div>
      </div>

        {/* Card 5: Reported Jobs */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '18px', padding: '1.25rem', boxShadow: '0 1px 4px rgba(15,23,42,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: '#f3e8ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Award size={18} />
            </div>
            <div>
              <span style={{ fontSize: '0.76rem', fontWeight: '700', color: '#64748b', display: 'block' }}>Reported Jobs</span>
              <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', lineHeight: 1.1 }}>0</div>
            </div>
          </div>
        </div>

      </div>

      {/* ── SUB-TABS BAR ───────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: '2rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.1rem' }}>
        {['All Jobs', 'Pending Approval', 'Active Jobs', 'Closed Jobs', 'Reported Jobs'].map(tab => (
          <button
            key={tab}
            onClick={() => setAdminTab(tab)}
            style={{
              background: 'none', border: 'none', padding: '0.65rem 0',
              color: adminTab === tab ? '#6366f1' : '#64748b',
              fontWeight: adminTab === tab ? '800' : '600',
              fontSize: '0.9rem', cursor: 'pointer',
              borderBottom: adminTab === tab ? '2.5px solid #6366f1' : '2.5px solid transparent',
              transition: 'all 0.15s ease'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── SEARCH & FILTER CONTROLS BAR ────────────────────────────────────── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
        
        {/* Left: Search Bar */}
        <div style={{ position: 'relative', width: '380px' }}>
          <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Search by job title, company or keyword..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '0.65rem 1rem 0.65rem 2.5rem', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.86rem', outline: 'none', background: '#ffffff' }}
          />
        </div>

        {/* Right Filter Dropdowns */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          
          <div>
            <span style={{ fontSize: '0.72rem', fontWeight: '700', color: '#64748b', display: 'block', marginBottom: '2px' }}>Job Type</span>
            <select
              value={jobTypeFilter}
              onChange={e => setJobTypeFilter(e.target.value)}
              style={{ padding: '0.55rem 0.85rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.82rem', background: '#ffffff', fontWeight: '700', color: '#0f172a' }}
            >
              <option value="All Types">All Types</option>
              <option value="Full-time">Full-time</option>
              <option value="Contract">Contract</option>
            </select>
          </div>

          <div>
            <span style={{ fontSize: '0.72rem', fontWeight: '700', color: '#64748b', display: 'block', marginBottom: '2px' }}>Experience Level</span>
            <select
              value={expFilter}
              onChange={e => setExpFilter(e.target.value)}
              style={{ padding: '0.55rem 0.85rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.82rem', background: '#ffffff', fontWeight: '700', color: '#0f172a' }}
            >
              <option value="All Levels">All Levels</option>
              <option value="0-2 Yrs">0-2 Yrs</option>
              <option value="2-5 Yrs">2-5 Yrs</option>
            </select>
          </div>

          <div>
            <span style={{ fontSize: '0.72rem', fontWeight: '700', color: '#64748b', display: 'block', marginBottom: '2px' }}>Job Location</span>
            <select
              value={locationFilter}
              onChange={e => setLocationFilter(e.target.value)}
              style={{ padding: '0.55rem 0.85rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.82rem', background: '#ffffff', fontWeight: '700', color: '#0f172a' }}
            >
              <option value="All Locations">All Locations</option>
              <option value="Bangalore">Bangalore</option>
              <option value="Noida">Noida</option>
              <option value="Remote">Remote</option>
            </select>
          </div>

          <div>
            <span style={{ fontSize: '0.72rem', fontWeight: '700', color: '#64748b', display: 'block', marginBottom: '2px' }}>Posted By</span>
            <select
              value={postedByFilter}
              onChange={e => setPostedByFilter(e.target.value)}
              style={{ padding: '0.55rem 0.85rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.82rem', background: '#ffffff', fontWeight: '700', color: '#0f172a' }}
            >
              <option value="All">All</option>
              <option value="Recruiter">Recruiters</option>
              <option value="Admin">Admin</option>
            </select>
          </div>

          <button
            onClick={() => triggerToast('Advanced Job Filters Applied')}
            style={{ marginTop: '16px', background: '#ffffff', border: '1px solid #818cf8', color: '#4f46e5', borderRadius: '10px', padding: '0.55rem 1rem', fontSize: '0.82rem', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
          >
            <Filter size={15} /> Filters
          </button>

        </div>

      </div>

      {/* ── MAIN DATA TABLE CARD ───────────────────────────────────────────── */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.5rem', boxShadow: '0 1px 4px rgba(15,23,42,0.02)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.76rem', textAlign: 'left' }}>
              <th style={{ paddingBottom: '0.85rem', fontWeight: '700' }}>Job Title</th>
              <th style={{ paddingBottom: '0.85rem', fontWeight: '700' }}>Company</th>
              <th style={{ paddingBottom: '0.85rem', fontWeight: '700' }}>Posted By</th>
              <th style={{ paddingBottom: '0.85rem', fontWeight: '700' }}>Job Type</th>
              <th style={{ paddingBottom: '0.85rem', fontWeight: '700' }}>Location</th>
              <th style={{ paddingBottom: '0.85rem', fontWeight: '700' }}>Applicants</th>
              <th style={{ paddingBottom: '0.85rem', fontWeight: '700' }}>Posted On</th>
              <th style={{ paddingBottom: '0.85rem', fontWeight: '700' }}>Status</th>
              <th style={{ paddingBottom: '0.85rem', fontWeight: '700', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAdminJobs.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '3.5rem 1rem', color: '#64748b' }}>
                  <Briefcase size={36} color="#cbd5e1" style={{ marginBottom: '0.75rem' }} />
                  <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                    No Jobs Found in Directory
                  </h3>
                  <p style={{ fontSize: '0.84rem', color: '#64748b', marginTop: '4px' }}>
                    {searchQuery ? 'No jobs match your search keywords or filter criteria.' : 'No job vacancies have been posted on the platform yet. Posted recruiter jobs will appear here live.'}
                  </p>
                </td>
              </tr>
            ) : (
              paginatedAdminJobs.map(j => (
              <tr key={j.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                
                {/* Job Title & Experience */}
                <td style={{ padding: '0.85rem 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: j.avatarBg, color: '#ffffff', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', flexShrink: 0 }}>
                    {j.title.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <strong style={{ fontSize: '0.88rem', color: '#0f172a', display: 'block' }}>{j.title}</strong>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{j.expYears} &bull; {j.category}</span>
                  </div>
                </td>

                {/* Company Name & Verified Checkmark */}
                <td>
                  <span style={{ fontSize: '0.84rem', fontWeight: '700', color: '#0f172a', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    {j.company}
                    {j.companyVerified && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="#3b82f6">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                    )}
                  </span>
                </td>

                {/* Posted By */}
                <td>
                  <div style={{ fontSize: '0.82rem', color: '#0f172a', fontWeight: '600' }}>{j.postedBy}</div>
                  <span style={{ fontSize: '0.72rem', color: j.postedRole === 'Admin' ? '#2563eb' : '#7c3aed', background: j.postedRole === 'Admin' ? '#eff6ff' : '#f3e8ff', padding: '1px 6px', borderRadius: '6px', fontWeight: '700' }}>
                    {j.postedRole}
                  </span>
                </td>

                {/* Job Type Badge */}
                <td>
                  <span style={{ background: j.typeColor, color: j.typeTextColor, padding: '3px 10px', borderRadius: '8px', fontSize: '0.74rem', fontWeight: '800' }}>
                    {j.type}
                  </span>
                </td>

                {/* Location */}
                <td>
                  <div style={{ fontSize: '0.82rem', color: '#0f172a', fontWeight: '600' }}>📍 {j.location}</div>
                  <span style={{ fontSize: '0.74rem', color: '#64748b' }}>{j.workMode}</span>
                </td>

                {/* Applicants Count */}
                <td>
                  <div style={{ fontSize: '0.88rem', fontWeight: '800', color: '#0f172a' }}>{j.applicantsCount}</div>
                  <span style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: '700' }}>+{j.newApplicantsCount} new</span>
                </td>

                {/* Posted On */}
                <td>
                  <div style={{ color: '#475569', fontSize: '0.8rem', fontWeight: '600' }}>{j.postedDate}</div>
                  {j.lastDateToApply && (
                    <div style={{ fontSize: '0.72rem', color: j.isClosed ? '#dc2626' : '#64748b', fontWeight: j.isClosed ? '700' : '500', marginTop: '2px' }}>
                      Due: {formatJobDate(j.lastDateToApply)}
                    </div>
                  )}
                </td>

                {/* Status Badge */}
                <td>
                  {j.isClosed ? (
                    <span style={{
                      background: '#fef2f2',
                      color: '#dc2626',
                      border: '1px solid #fecaca',
                      padding: '3px 10px',
                      borderRadius: '8px',
                      fontSize: '0.74rem',
                      fontWeight: '800',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <Lock size={11} /> {j.isExpired ? 'Closed • Expired' : 'Closed'}
                    </span>
                  ) : j.status === 'Pending' ? (
                    <span style={{
                      background: '#fef3c7',
                      color: '#b45309',
                      border: '1px solid #fde68a',
                      padding: '3px 10px',
                      borderRadius: '8px',
                      fontSize: '0.74rem',
                      fontWeight: '800',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <Clock size={11} /> Pending
                    </span>
                  ) : (
                    <span style={{
                      background: '#dcfce7',
                      color: '#15803d',
                      border: '1px solid #bbf7d0',
                      padding: '3px 10px',
                      borderRadius: '8px',
                      fontSize: '0.74rem',
                      fontWeight: '800',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <CheckCircle2 size={11} /> Active
                    </span>
                  )}
                </td>

                {/* Action Buttons: Eye + Edit + Active/Close + Delete */}
                <td style={{ textAlign: 'right', padding: '0.85rem 0' }}>
                  <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center', justifyContent: 'flex-end' }}>
                    {/* View Details Button */}
                    <button
                      onClick={() => setSelectedJobView(j)}
                      style={{
                        background: '#f8fafc',
                        border: '1px solid #cbd5e1',
                        borderRadius: '8px',
                        width: '32px',
                        height: '32px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#6366f1',
                        transition: 'all 0.15s ease'
                      }}
                      title="View Details"
                    >
                      <Eye size={15} />
                    </button>

                    {/* Edit Button for Admin */}
                    {onEditJob && (
                      <button
                        onClick={() => onEditJob(j.rawJob)}
                        style={{
                          background: '#eff6ff',
                          border: '1px solid #bfdbfe',
                          borderRadius: '8px',
                          width: '32px',
                          height: '32px',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#2563eb',
                          transition: 'all 0.15s ease'
                        }}
                        title="Edit job details, status & deadline"
                      >
                        <Edit3 size={15} />
                      </button>
                    )}

                    {/* Active / Close Button for Admin */}
                    {j.isClosed ? (
                      <button
                        onClick={() => handleActivateJob(j.id, j.title, j.rawJob)}
                        style={{
                          background: '#ecfdf5',
                          border: '1.5px solid #6ee7b7',
                          color: '#047857',
                          padding: '4px 10px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '0.76rem',
                          fontWeight: '800',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          boxShadow: '0 1px 4px rgba(16,185,129,0.15)',
                          whiteSpace: 'nowrap'
                        }}
                        title={j.isExpired ? "Deadline has expired. Click to extend deadline & activate" : "Activate job - candidates can apply again"}
                      >
                        <Unlock size={12} /> Activate
                      </button>
                    ) : j.status === 'Pending' ? (
                      <div style={{ display: 'inline-flex', gap: '4px' }}>
                        <button
                          onClick={() => handleActivateJob(j.id, j.title, j.rawJob)}
                          style={{
                            background: '#ecfdf5',
                            border: '1.5px solid #6ee7b7',
                            color: '#047857',
                            padding: '4px 9px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '0.76rem',
                            fontWeight: '800',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            whiteSpace: 'nowrap'
                          }}
                          title="Approve & Activate Job"
                        >
                          <Check size={12} /> Approve
                        </button>
                        <button
                          onClick={() => handleCloseJob(j.id, j.title)}
                          style={{
                            background: '#fff7ed',
                            border: '1.5px solid #fdba74',
                            color: '#c2410c',
                            padding: '4px 9px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '0.76rem',
                            fontWeight: '800',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            whiteSpace: 'nowrap'
                          }}
                          title="Close / Reject Job"
                        >
                          <Lock size={12} /> Close
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleCloseJob(j.id, j.title)}
                        style={{
                          background: '#fff7ed',
                          border: '1.5px solid #fdba74',
                          color: '#c2410c',
                          padding: '4px 10px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '0.76rem',
                          fontWeight: '800',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          whiteSpace: 'nowrap'
                        }}
                        title="Close job - lock candidate applications"
                      >
                        <Lock size={12} /> Close
                      </button>
                    )}

                    {/* Delete Button for Admin */}
                    <button
                      onClick={() => handleDeleteJob(j.id, j.title)}
                      style={{
                        background: '#fef2f2',
                        border: '1px solid #fecaca',
                        borderRadius: '8px',
                        width: '32px',
                        height: '32px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#dc2626',
                        transition: 'all 0.15s ease'
                      }}
                      title="Delete permanently from database and all dashboards"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>

              </tr>
            )))}
          </tbody>
        </table>

        {/* ── PAGINATION FOOTER (Interactive & Synced with Platform Setting) ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid #f1f5f9', fontSize: '0.82rem', color: '#64748b', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            Showing {filteredAdminJobs.length === 0 ? 0 : adminStartIndex + 1}&ndash;{Math.min(adminStartIndex + pageSize, filteredAdminJobs.length)} of {filteredAdminJobs.length} jobs (Configured: {pageSize}/page)
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <button
                disabled={adminPage <= 1}
                onClick={() => setAdminPage(p => Math.max(1, p - 1))}
                style={{ border: '1px solid #cbd5e1', background: '#ffffff', borderRadius: '8px', width: '32px', height: '32px', cursor: adminPage <= 1 ? 'not-allowed' : 'pointer', opacity: adminPage <= 1 ? 0.4 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                &lt;
              </button>
              {Array.from({ length: totalAdminPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalAdminPages || (p >= adminPage - 1 && p <= adminPage + 1))
                .map((p, idx, arr) => (
                  <React.Fragment key={p}>
                    {idx > 0 && arr[idx - 1] !== p - 1 && <span style={{ padding: '0 4px', color: '#94a3b8' }}>...</span>}
                    <button
                      onClick={() => setAdminPage(p)}
                      style={{
                        border: adminPage === p ? 'none' : '1px solid #cbd5e1',
                        background: adminPage === p ? '#6366f1' : '#ffffff',
                        color: adminPage === p ? '#ffffff' : '#334155',
                        borderRadius: '8px', width: '32px', height: '32px',
                        fontWeight: adminPage === p ? '800' : '600', cursor: 'pointer'
                      }}
                    >
                      {p}
                    </button>
                  </React.Fragment>
                ))}
              <button
                disabled={adminPage >= totalAdminPages}
                onClick={() => setAdminPage(p => Math.min(totalAdminPages, p + 1))}
                style={{ border: '1px solid #cbd5e1', background: '#ffffff', borderRadius: '8px', width: '32px', height: '32px', cursor: adminPage >= totalAdminPages ? 'not-allowed' : 'pointer', opacity: adminPage >= totalAdminPages ? 0.4 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                &gt;
              </button>
            </div>

            <select
              value={pageSize}
              onChange={e => { setPageSize(parseInt(e.target.value, 10)); setAdminPage(1); }}
              style={{ padding: '0.45rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.8rem', background: '#ffffff', fontWeight: '700', color: '#334155' }}
            >
              <option value="5">5 / page</option>
              <option value="10">10 / page</option>
              <option value="20">20 / page</option>
              <option value="50">50 / page</option>
            </select>
          </div>
        </div>

      </div>

      {/* ── VIEW JOB DETAILS MODAL ─────────────────────────────────────────── */}
      {selectedJobView && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: '1rem' }}>
          <div style={{ width: '520px', background: '#ffffff', borderRadius: '24px', padding: '2rem', boxShadow: '0 25px 60px rgba(15,23,42,0.2)', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Job Posting Details</h3>
              <button onClick={() => setSelectedJobView(null)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={18} color="#64748b" />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                <strong style={{ fontSize: '1.1rem', color: '#0f172a', display: 'block' }}>{selectedJobView.title}</strong>
                <span style={{ fontSize: '0.84rem', color: '#4f46e5', fontWeight: '700' }}>{selectedJobView.company}</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', fontSize: '0.84rem' }}>
                <div><span style={{ color: '#64748b' }}>Category:</span> <strong style={{ display: 'block', color: '#0f172a' }}>{selectedJobView.category}</strong></div>
                <div><span style={{ color: '#64748b' }}>Experience:</span> <strong style={{ display: 'block', color: '#0f172a' }}>{selectedJobView.expYears}</strong></div>
                <div><span style={{ color: '#64748b' }}>Location:</span> <strong style={{ display: 'block', color: '#0f172a' }}>{selectedJobView.location} ({selectedJobView.workMode})</strong></div>
                <div><span style={{ color: '#64748b' }}>Total Applicants:</span> <strong style={{ display: 'block', color: '#16a34a' }}>{selectedJobView.applicantsCount} candidates</strong></div>
                <div><span style={{ color: '#64748b' }}>Posted On:</span> <span style={{ display: 'block', color: '#334155' }}>{selectedJobView.postedDate}</span></div>
                <div><span style={{ color: '#64748b' }}>Status:</span> <strong style={{ display: 'block', color: selectedJobView.status === 'Active' ? '#16a34a' : (selectedJobView.status === 'Closed' ? '#dc2626' : '#ea580c') }}>{selectedJobView.status}</strong></div>
              </div>

              {/* Admin Actions Bar inside Modal */}
              <div style={{ background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '14px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748b' }}>Admin Actions:</span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {selectedJobView.status === 'Closed' ? (
                    <button
                      onClick={() => {
                        handleActivateJob(selectedJobView.id, selectedJobView.title);
                        setSelectedJobView(prev => ({ ...prev, status: 'Active' }));
                      }}
                      style={{ background: '#ecfdf5', border: '1.5px solid #6ee7b7', color: '#047857', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Unlock size={13} /> Activate Job
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        handleCloseJob(selectedJobView.id, selectedJobView.title);
                        setSelectedJobView(prev => ({ ...prev, status: 'Closed' }));
                      }}
                      style={{ background: '#fff7ed', border: '1.5px solid #fdba74', color: '#c2410c', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Lock size={13} /> Close Job
                    </button>
                  )}

                  <button
                    onClick={() => handleDeleteJob(selectedJobView.id, selectedJobView.title)}
                    style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Trash2 size={13} /> Delete Job
                  </button>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
              <button onClick={() => setSelectedJobView(null)} style={{ padding: '0.65rem 1.4rem', borderRadius: '10px', background: '#6366f1', color: '#ffffff', border: 'none', fontWeight: '800', cursor: 'pointer' }}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// ─── Main JobListings Page ────────────────────────────────────────────────────
export default function JobListings({ role, setActiveTab, initialShowPostModal = false }) {
  const { jobs, applications, addJob, updateJob, deleteJob, updateJobStatus, applyToJob, savedJobs, toggleSaveJob } = useJobs();
  const { user } = useAuth();
  const { notifyJobPosted, notifyCandidateApplied } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();

  const isRecruiterOrAdmin = role === 'admin' || role === 'recruiter';

  // Initialize appliedIds from persisted applications for current logged-in user only
  const [appliedIds, setAppliedIds] = useState(() => {
    const myEmail = (user?.email || '').toLowerCase().trim();
    if (!myEmail) return [];
    return (applications || [])
      .filter(a => (a.candidateEmail || '').toLowerCase().trim() === myEmail)
      .map(a => a.jobId);
  });

  // Sync appliedIds whenever user or applications list changes (e.g. after login)
  useEffect(() => {
    const myEmail = (user?.email || '').toLowerCase().trim();
    if (!myEmail) {
      setAppliedIds([]);
      return;
    }
    const myJobIds = (applications || [])
      .filter(a => (a.candidateEmail || '').toLowerCase().trim() === myEmail)
      .map(a => a.jobId);
    setAppliedIds(myJobIds);
  }, [user?.email, applications]);

  const [pendingConfirmJob, setPendingConfirmJob] = useState(null);

  // ─── 7 Recommended Filter States ──────────────────────────────────────────
  const [searchTerm, setSearchTerm] = useState('');
  const [filterJobType, setFilterJobType] = useState(''); // Full-time, Part-time, Internship, Apprentice, Contract
  const [filterWorkMode, setFilterWorkMode] = useState(''); // Remote, Hybrid, On-site
  const [filterLocation, setFilterLocation] = useState(''); // Bangalore, Noida, Mumbai, Delhi, Remote
  const [locationSearchInput, setLocationSearchInput] = useState('');
  const [filterExperience, setFilterExperience] = useState(''); // Fresher, 0-1, 1-3, 3-5, 5+
  const [selectedSkills, setSelectedSkills] = useState([]); // ['Java', 'React']
  const [skillSearchInput, setSkillSearchInput] = useState('');
  const [filterSalaryRange, setFilterSalaryRange] = useState(''); // 0-5, 5-10, 10-20, 20+
  const [minSalaryLpa, setMinSalaryLpa] = useState(''); // numeric min LPA e.g. 8
  const [filterPostedDate, setFilterPostedDate] = useState(''); // today, 3days, 7days, 30days

  const [showPostModal, setShowPostModal] = useState(initialShowPostModal || false);
  const [postStep, setPostStep] = useState(1);
  const [postAppMethod, setPostAppMethod] = useState('careonix');
  const [postForm, setPostForm] = useState({ currency: 'INR', type: 'Full-time', experience: '1-3 Years', lastDateToApply: getDefaultDeadlineDate(30), logoUrl: null });
  const [postSuccess, setPostSuccess] = useState('');

  const [careonixApplyJob, setCareonixApplyJob] = useState(null);
  const [candidateCoverNote, setCandidateCoverNote] = useState('');
  const [careonixApplySuccess, setCareonixApplySuccess] = useState('');

  const [candidatePage, setCandidatePage] = useState(1);
  const [editingJob, setEditingJob] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editSuccess, setEditSuccess] = useState('');

  const resetAllFilters = () => {
    setSearchTerm('');
    setFilterJobType('');
    setFilterWorkMode('');
    setFilterLocation('');
    setLocationSearchInput('');
    setFilterExperience('');
    setSelectedSkills([]);
    setSkillSearchInput('');
    setFilterSalaryRange('');
    setMinSalaryLpa('');
    setFilterPostedDate('');
  };

  const activeFilterCount = (searchTerm ? 1 : 0) +
    (filterJobType ? 1 : 0) +
    (filterWorkMode ? 1 : 0) +
    (filterLocation || locationSearchInput ? 1 : 0) +
    (filterExperience ? 1 : 0) +
    (selectedSkills.length > 0 ? 1 : 0) +
    (filterSalaryRange || minSalaryLpa ? 1 : 0) +
    (filterPostedDate ? 1 : 0);

  const toggleSkill = (skill) => {
    setSelectedSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const addCustomSkill = (skillName) => {
    const trimmed = skillName.trim();
    if (!trimmed) return;
    if (!selectedSkills.includes(trimmed)) {
      setSelectedSkills(prev => [...prev, trimmed]);
    }
    setSkillSearchInput('');
  };

  const handleApplyClick = (job) => {
    if (appliedIds.includes(job.id)) return;

    const isExternal = job.applicationMethod === 'external' || (job.applyUrl && job.applicationMethod !== 'careonix');

    if (isExternal) {
      // External: Open company site in new tab + update URL to show apply action
      if (job.applyUrl) {
        const url = job.applyUrl.startsWith('http') ? job.applyUrl : `https://${job.applyUrl}`;
        window.open(url, '_blank');
      }
      // Update URL to reflect apply action (external) — confirms intent
      navigate(`/candidate/jobs/${job.id}/apply?type=external&company=${encodeURIComponent(job.company || '')}&title=${encodeURIComponent(job.title || '')}`, { replace: false });
      setPendingConfirmJob(job);
    } else {
      // Internal/Careonix: Navigate to dedicated apply URL
      navigate(`/candidate/jobs/${job.id}/apply?type=careonix&title=${encodeURIComponent(job.title || '')}`, { replace: false });
      setCareonixApplyJob(job);
      setCandidateCoverNote('');
    }
  };

  const submitCareonixApplication = (e) => {
    e.preventDefault();
    if (!careonixApplyJob || !user?.email) return;

    const uKey = (user?.email || '').toLowerCase().trim();
    const getUVal = (k, fallback = '') => {
      try { return localStorage.getItem(`careonix_prof_${uKey}_${k}`) || fallback; } catch (err) { return fallback; }
    };
    const getUJson = (k, fallback = null) => {
      try {
        const v = localStorage.getItem(`careonix_prof_${uKey}_${k}`);
        return v ? JSON.parse(v) : fallback;
      } catch (err) { return fallback; }
    };

    applyToJob(careonixApplyJob.id, user, {
      name: user?.name || getUVal('name', 'Candidate'),
      email: user?.email,
      phone: getUVal('phone', user?.phone || ''),
      location: getUVal('location', user?.location || ''),
      about: getUVal('about', ''),
      skills: getUJson('skills', []),
      education: getUJson('education', []),
      experience: getUJson('experience', []),
      preferences: getUJson('preferences', null),
      resumeFileName: getUVal('resume_name', user?.resumeFileName || ''),
      resumeData: getUVal('resume_data', ''),
      coverNote: candidateCoverNote
    });

    // Notify Recruiter Bell & Email
    if (notifyCandidateApplied) {
      notifyCandidateApplied({
        recruiterEmail: careonixApplyJob.postedBy || careonixApplyJob.recruiterEmail || 'recruiter@careonix.com',
        candidateName: user?.name || user?.email,
        candidateEmail: user?.email,
        jobTitle: careonixApplyJob.title
      });
    }

    setAppliedIds(prev => [...prev, careonixApplyJob.id]);
    setCareonixApplySuccess('🎉 Application submitted directly on CAREONIX! Employer will review your profile.');

    setTimeout(() => {
      setCareonixApplySuccess('');
      setCareonixApplyJob(null);
      // Navigate back to jobs listing after successful submission
      navigate('/candidate/jobs', { replace: true });
    }, 1500);
  };

  const confirmApplication = (job) => {
    if (job && !appliedIds.includes(job.id)) {
      setAppliedIds(prev => [...prev, job.id]);
      applyToJob(job.id, user);

      if (notifyCandidateApplied) {
        notifyCandidateApplied({
          recruiterEmail: job.postedBy || job.recruiterEmail || 'recruiter@careonix.com',
          candidateName: user?.name || 'Candidate User',
          candidateEmail: user?.email || 'candidate@careonix.com',
          jobTitle: job.title
        });
      }
    }
    setPendingConfirmJob(null);
    // Navigate back to jobs listing after confirmation
    navigate('/candidate/jobs', { replace: true });
  };

  const handlePostSubmit = (e) => {
    e.preventDefault();
    if (!postForm.title) return;
    if (isDateInPast(postForm.lastDateToApply)) {
      alert('Application deadline cannot be in the past. Please select today or a future date (Format: DD - MM - YYYY).');
      return;
    }

    addJob({
      ...postForm,
      applicationMethod: postAppMethod,
      applyUrl: postAppMethod === 'external' ? postForm.applyUrl : ''
    }, user);

    // Flow 1a: Notify Candidates Bell & Email (Title, Company, Exp, City/Location, Salary)
    if (notifyJobPosted) {
      notifyJobPosted({
        jobTitle: postForm.title,
        company: postForm.company || user?.company || user?.name || 'Careonix Partner',
        experience: postForm.experience || '1-3 Years',
        location: postForm.location || 'India',
        salary: postForm.salary ? `${postForm.salary} LPA` : 'Best in Industry',
        postedBy: user?.email || user?.company
      });
    }

    setPostSuccess('🎉 Job vacancy published successfully!');
    setTimeout(() => {
      setPostSuccess('');
      setShowPostModal(false);
      setPostStep(1);
      setPostForm({ currency: 'INR', type: 'Full-time', experience: '1-3 Years', lastDateToApply: getDefaultDeadlineDate(30), logoUrl: null });
    }, 1400);
  };

  const startEdit = (job) => {
    setEditingJob(job);
    const method = job.applicationMethod || (job.applyUrl ? 'external' : 'careonix');
    setPostAppMethod(method);
    setEditForm({
      id: job.id,
      title: job.title || '',
      company: job.company || '',
      location: job.location || '',
      currency: job.currency || 'INR',
      salary: job.salary ? job.salary.replace(/[₹$]/g, '').trim() : '',
      type: job.type || 'Full-time',
      experience: job.experience || '1-3 Years',
      lastDateToApply: job.lastDateToApply || getDefaultDeadlineDate(30),
      skills: Array.isArray(job.skills) ? job.skills.join(', ') : (job.skills || ''),
      applicationMethod: method,
      applyUrl: job.applyUrl || '',
      logoUrl: job.logoUrl || null,
      status: (job.status || 'ACTIVE').toUpperCase()
    });
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editForm.title) return;

    if (isDateInPast(editForm.lastDateToApply)) {
      alert('Application deadline cannot be in the past. Please select today or a future date (Format: DD - MM - YYYY).');
      return;
    }

    updateJob(editingJob.id, {
      ...editForm,
      applicationMethod: editForm.applicationMethod || postAppMethod
    });
    setEditSuccess('✅ Job updated successfully!');
    setTimeout(() => {
      setEditSuccess('');
      setEditingJob(null);
    }, 1200);
  };

  const handleStatusChange = (jobId, newStatus) => {
    if (newStatus === 'ACTIVE') {
      const target = jobs.find(j => String(j.id) === String(jobId));
      if (target && isJobExpired(target.lastDateToApply)) {
        alert('This job\'s application deadline has expired (' + formatJobDate(target.lastDateToApply) + '). Please extend the deadline date to today or a future date to reopen applications.');
        startEdit(target);
        return;
      }
    }
    if (updateJobStatus) {
      updateJobStatus(jobId, newStatus);
    }
  };

  const handleDeleteJob = (jobId, title) => {
    if (window.confirm(`Delete "${title}"? This permanently removes the job from all dashboards and database.`)) {
      deleteJob(jobId);
    }
  };

  // ─── 7-Point Filtering Engine ──────────────────────────────────────────────
  const filtered = jobs.filter(job => {
    // 0. Recruiter Strict Isolation: ONLY show jobs posted by THIS recruiter
    if (role === 'recruiter') {
      const uEmail = (user?.email || '').toLowerCase().trim();
      const uId = (user?.identifier || '').toLowerCase().trim();
      const uName = (user?.name || '').toLowerCase().trim();
      const uComp = (user?.company || '').toLowerCase().trim();
      const p = (job.postedBy || '').toLowerCase().trim();
      const jComp = (job.company || '').toLowerCase().trim();

      const isMyJob = (p && (p === uEmail || p === uId || (uName && p === uName))) ||
                      (uComp && jComp && jComp === uComp) ||
                      (uEmail && p && (uEmail.includes(p) || p.includes(uEmail)));
      if (!isMyJob) return false;
    }

    // 1. Search Query
    const q = searchTerm.toLowerCase().trim();
    if (q) {
      const jobSkills = Array.isArray(job.skills) ? job.skills.join(' ').toLowerCase() : (job.skills || '').toLowerCase();
      const matchTitle = (job.title || '').toLowerCase().includes(q);
      const matchCompany = (job.company || '').toLowerCase().includes(q);
      const matchLoc = (job.location || '').toLowerCase().includes(q);
      const matchSkill = jobSkills.includes(q);
      if (!matchTitle && !matchCompany && !matchLoc && !matchSkill) return false;
    }

    // 2. Job Type
    if (filterJobType) {
      const jType = (job.type || '').toLowerCase();
      const target = filterJobType.toLowerCase();
      if (target === 'apprenticeship' || target === 'apprentice') {
        if (!jType.includes('apprentice')) return false;
      } else if (!jType.includes(target)) {
        return false;
      }
    }

    // 3. Work Mode (Remote, Hybrid, On-site)
    if (filterWorkMode) {
      const mode = filterWorkMode.toLowerCase();
      const loc = (job.location || '').toLowerCase();
      const type = (job.type || '').toLowerCase();
      if (mode === 'remote' && !loc.includes('remote') && !type.includes('remote')) return false;
      if (mode === 'hybrid' && !loc.includes('hybrid') && !type.includes('hybrid')) return false;
      if (mode === 'on-site' && (loc.includes('remote') || loc.includes('hybrid'))) return false;
    }

    // 4. Location (Search Input or Dropdown Selection)
    const activeLoc = (locationSearchInput || filterLocation).trim().toLowerCase();
    if (activeLoc) {
      const locStr = (job.location || '').toLowerCase();
      if (activeLoc === 'remote') {
        if (!locStr.includes('remote') && !(job.type || '').toLowerCase().includes('remote')) return false;
      } else if (!locStr.includes(activeLoc)) {
        return false;
      }
    }

    // 5. Experience
    if (filterExperience) {
      const expStr = (job.experience || '').toLowerCase();
      const expTarget = filterExperience.toLowerCase();
      if (expTarget === 'fresher') {
        if (!expStr.includes('fresher') && !expStr.includes('0 year') && !expStr.includes('0-1')) return false;
      } else if (expTarget === '0-1') {
        if (!expStr.includes('0-1') && !expStr.includes('fresher') && !expStr.includes('0 year')) return false;
      } else if (expTarget === '1-3') {
        if (!expStr.includes('1-3') && !expStr.includes('1-2') && !expStr.includes('2-4') && !expStr.includes('1-')) return false;
      } else if (expTarget === '3-5') {
        if (!expStr.includes('3-5') && !expStr.includes('2-5') && !expStr.includes('4-6') && !expStr.includes('3-')) return false;
      } else if (expTarget === '5+') {
        if (!expStr.includes('5+') && !expStr.includes('5-') && !expStr.includes('7+') && !expStr.includes('10+')) return false;
      }
    }

    // 6. Skills (Selected skill chips)
    if (selectedSkills.length > 0) {
      const jobSkillsList = Array.isArray(job.skills)
        ? job.skills.map(s => s.toLowerCase().trim())
        : (job.skills ? job.skills.toLowerCase().split(',').map(s => s.trim()) : []);
      const hasAnySkill = selectedSkills.some(sk => jobSkillsList.some(js => js.includes(sk.toLowerCase())));
      if (!hasAnySkill) return false;
    }

    // 7. Salary & Min Salary (in LPA)
    const getSalaryMaxLpa = (salStr) => {
      if (!salStr) return 0;
      const matches = salStr.match(/[\d,]+/g);
      if (!matches) return 0;
      const nums = matches.map(m => parseInt(m.replace(/,/g, ''), 10)).filter(n => !isNaN(n));
      if (nums.length === 0) return 0;
      let maxVal = Math.max(...nums);
      if (salStr.toLowerCase().includes('month')) maxVal = maxVal * 12;
      if (maxVal > 1000) maxVal = maxVal / 100000;
      return maxVal;
    };

    const jobLpa = getSalaryMaxLpa(job.salary);

    if (filterSalaryRange) {
      if (filterSalaryRange === '0-5' && (jobLpa > 5 && jobLpa > 0)) return false;
      if (filterSalaryRange === '5-10' && (jobLpa < 5 || jobLpa > 10)) return false;
      if (filterSalaryRange === '10-20' && (jobLpa < 10 || jobLpa > 20)) return false;
      if (filterSalaryRange === '20+' && jobLpa < 20) return false;
    }

    if (minSalaryLpa && minSalaryLpa > 0) {
      if (jobLpa < parseFloat(minSalaryLpa)) return false;
    }

    // 8. Posted Date
    if (filterPostedDate) {
      const pDate = (job.postedDate || '').toLowerCase();
      if (filterPostedDate === 'today') {
        if (!pDate.includes('aug 8') && !pDate.includes('aug 9')) return false;
      } else if (filterPostedDate === '3days') {
        if (!pDate.includes('aug 7') && !pDate.includes('aug 8') && !pDate.includes('aug 9')) return false;
      } else if (filterPostedDate === '7days') {
        if (!pDate.includes('aug')) return false;
      }
    }

    return true;
  });

  const filterSectionStyle = {
    marginBottom: '1.25rem',
    paddingBottom: '1.25rem',
    borderBottom: '1px solid #f1f5f9'
  };

  const filterTitleStyle = {
    fontSize: '0.82rem',
    fontWeight: '700',
    color: '#0f172a',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '0.6rem',
    textTransform: 'uppercase',
    letterSpacing: '0.04em'
  };

  if (role === 'admin') {
    return (
      <>
        <AdminJobsDirectory onPostJobClick={() => setShowPostModal(true)} onEditJob={startEdit} />
        {showPostModal && (
          <JobModal title="Post New Job Vacancy" form={postForm} setForm={setPostForm} onSubmit={handlePostSubmit} onClose={() => setShowPostModal(false)} submitLabel="🚀 Publish Job" success={postSuccess} step={postStep} setStep={setPostStep} appMethod={postAppMethod} setAppMethod={setPostAppMethod} />
        )}
        {editingJob && (
          <JobModal
            title="Edit Job Posting"
            form={editForm}
            setForm={setEditForm}
            onSubmit={handleEditSubmit}
            onClose={() => setEditingJob(null)}
            submitLabel="✅ Save Changes"
            success={editSuccess}
            isEdit={true}
            step={2}
            appMethod={editForm.applicationMethod || postAppMethod}
            setAppMethod={(m) => setEditForm(f => ({ ...f, applicationMethod: m }))}
          />
        )}
      </>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* ── Confirmation Modal ───────────────────────────────────────────── */}
      {pendingConfirmJob && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 400, padding: '1rem' }}>
          <div style={{ width: '480px', padding: '2.25rem', background: '#ffffff', borderRadius: '20px', textAlign: 'center', boxShadow: '0 25px 60px rgba(15,23,42,0.2)', border: '1px solid #e2e8f0' }}>
            <div style={{ width: '58px', height: '58px', borderRadius: '50%', background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto', color: '#4f46e5' }}>
              <Globe size={26} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.5rem' }}>Confirm Application Status</h3>
            <p style={{ fontSize: '0.88rem', color: '#64748b', marginBottom: '1.5rem', lineHeight: '1.6' }}>
              We opened <strong style={{ color: '#4f46e5' }}>{pendingConfirmJob.company}</strong>'s official portal for <strong>"{pendingConfirmJob.title}"</strong>.<br /><br />
              Did you successfully apply?
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button onClick={() => confirmApplication(pendingConfirmJob)} style={{ padding: '0.8rem', fontWeight: '700', background: '#10b981', color: '#ffffff', border: 'none', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.95rem' }}>
                <CheckCircle2 size={18} /> Yes, I Applied Successfully!
              </button>
              <button onClick={() => { setPendingConfirmJob(null); navigate('/candidate/jobs', { replace: true }); }} style={{ padding: '0.75rem', fontWeight: '600', background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0', borderRadius: '12px', cursor: 'pointer', fontSize: '0.88rem' }}>
                ❌ No / Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Modal ──────────────────────────────────────────────────── */}
      {editingJob && (
        <JobModal
          title="Edit Job Posting"
          form={editForm}
          setForm={setEditForm}
          onSubmit={handleEditSubmit}
          onClose={() => setEditingJob(null)}
          submitLabel="✅ Save Changes"
          success={editSuccess}
          isEdit={true}
          step={2}
          appMethod={editForm.applicationMethod || postAppMethod}
          setAppMethod={(m) => setEditForm(f => ({ ...f, applicationMethod: m }))}
        />
      )}

      {/* ── Main Top Bar ────────────────────────────────────────────────── */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.25rem 1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', boxShadow: '0 1px 6px rgba(15,23,42,0.03)' }}>
        <div>
          <h1 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
            {role === 'recruiter' ? 'My Job Vacancies' : (role === 'admin' ? 'Manage Job Postings' : 'Browse All Jobs')}
          </h1>
          <p style={{ color: '#64748b', marginTop: '3px', fontSize: '0.84rem' }}>
            {role === 'recruiter'
              ? 'Showing jobs posted by your recruiter account'
              : 'Showing all available positions'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Main Search Input */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '0.55rem 1rem', width: '280px' }}>
            <Search size={16} color="#64748b" />
            <input
              placeholder="Search jobs, companies, skills..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '0.875rem', color: '#0f172a', width: '100%', fontFamily: 'Inter, sans-serif' }}
            />
            {searchTerm && (
              <X size={14} color="#94a3b8" style={{ cursor: 'pointer' }} onClick={() => setSearchTerm('')} />
            )}
          </div>

          {isRecruiterOrAdmin && (
            <button
              onClick={() => setShowPostModal(true)}
              style={{ padding: '0.6rem 1.2rem', background: '#4f46e5', color: '#ffffff', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '0.88rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 4px 12px rgba(79,70,229,0.25)' }}
            >
              <Plus size={16} /> Post Job
            </button>
          )}
        </div>
      </div>

      {/* ── Main Content Area: Filter Sidebar + Job List Grid ───────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '270px 1fr', gap: '1.5rem', alignItems: 'start' }}>

        {/* ──────────────────────────────────────────────────────────────────
            LEFT SIDEBAR: 7 RECOMMENDED FILTERS PANEL
        ────────────────────────────────────────────────────────────────── */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          padding: '1.25rem',
          boxShadow: '0 1px 6px rgba(15,23,42,0.03)',
          position: 'sticky',
          top: '1rem'
        }}>
          {/* Sidebar Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1.5px solid #f1f5f9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Filter size={17} color="#4f46e5" />
              <h3 style={{ fontSize: '0.98rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Filters</h3>
              {activeFilterCount > 0 && (
                <span style={{ background: '#4f46e5', color: '#ffffff', borderRadius: '50%', fontSize: '0.7rem', fontWeight: '800', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {activeFilterCount}
                </span>
              )}
            </div>
            {activeFilterCount > 0 && (
              <button
                onClick={resetAllFilters}
                style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
              >
                <RotateCcw size={12} /> Clear
              </button>
            )}
          </div>

          {/* 1. JOB TYPE */}
          <div style={filterSectionStyle}>
            <span style={filterTitleStyle}>
              <Briefcase size={14} color="#4f46e5" /> 1. Job Type
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {[
                { label: 'All Job Types', value: '' },
                { label: 'Full-time', value: 'Full-time' },
                { label: 'Part-time', value: 'Part-time' },
                { label: 'Internship', value: 'Internship' },
                { label: 'Apprenticeship', value: 'Apprentice' },
                { label: 'Contract', value: 'Contract' }
              ].map(opt => (
                <label key={opt.value} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: filterJobType === opt.value ? '#4f46e5' : '#334155', fontWeight: filterJobType === opt.value ? '700' : '500', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="jobType"
                    checked={filterJobType === opt.value}
                    onChange={() => setFilterJobType(opt.value)}
                    style={{ accentColor: '#4f46e5', cursor: 'pointer' }}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>

          {/* 2. WORK MODE */}
          <div style={filterSectionStyle}>
            <span style={filterTitleStyle}>
              <Globe size={14} color="#4f46e5" /> 2. Work Mode
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {[
                { label: 'All', value: '' },
                { label: 'Remote', value: 'Remote' },
                { label: 'Hybrid', value: 'Hybrid' },
                { label: 'On-site', value: 'On-site' }
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setFilterWorkMode(opt.value)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '0.76rem',
                    fontWeight: '700',
                    border: filterWorkMode === opt.value ? '1.5px solid #4f46e5' : '1px solid #cbd5e1',
                    background: filterWorkMode === opt.value ? '#eef2ff' : '#f8fafc',
                    color: filterWorkMode === opt.value ? '#4f46e5' : '#475569',
                    cursor: 'pointer'
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* 3. LOCATION (SEARCH & SELECT) */}
          <div style={filterSectionStyle}>
            <span style={filterTitleStyle}>
              <MapPin size={14} color="#4f46e5" /> 3. Location
            </span>
            {/* Location Type Search Input */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0.4rem 0.6rem', marginBottom: '8px' }}>
              <Search size={13} color="#64748b" />
              <input
                placeholder="Type city or state..."
                value={locationSearchInput}
                onChange={e => { setLocationSearchInput(e.target.value); setFilterLocation(''); }}
                style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', fontSize: '0.8rem', color: '#0f172a', fontFamily: 'Inter, sans-serif' }}
              />
              {locationSearchInput && (
                <X size={12} color="#94a3b8" style={{ cursor: 'pointer' }} onClick={() => setLocationSearchInput('')} />
              )}
            </div>
            {/* Quick Location Dropdown */}
            <select
              value={filterLocation}
              onChange={e => { setFilterLocation(e.target.value); setLocationSearchInput(''); }}
              style={{ width: '100%', padding: '0.45rem', borderRadius: '8px', background: '#f8fafc', border: '1px solid #cbd5e1', fontSize: '0.8rem', color: '#0f172a', fontFamily: 'Inter, sans-serif', cursor: 'pointer' }}
            >
              <option value="">-- Quick Select City --</option>
              <option value="Bangalore">Bangalore</option>
              <option value="Noida">Noida</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Delhi">Delhi</option>
              <option value="Hyderabad">Hyderabad</option>
              <option value="Pune">Pune</option>
              <option value="Remote">Work from Anywhere (Remote)</option>
            </select>
          </div>

          {/* 4. EXPERIENCE */}
          <div style={filterSectionStyle}>
            <span style={filterTitleStyle}>
              <Award size={14} color="#4f46e5" /> 4. Experience
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {[
                { label: 'Any Experience', value: '' },
                { label: 'Fresher / 0 Years', value: 'Fresher' },
                { label: '0 – 1 Years', value: '0-1' },
                { label: '1 – 3 Years', value: '1-3' },
                { label: '3 – 5 Years', value: '3-5' },
                { label: '5+ Years', value: '5+' }
              ].map(opt => (
                <label key={opt.value} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: filterExperience === opt.value ? '#4f46e5' : '#334155', fontWeight: filterExperience === opt.value ? '700' : '500', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="experience"
                    checked={filterExperience === opt.value}
                    onChange={() => setFilterExperience(opt.value)}
                    style={{ accentColor: '#4f46e5', cursor: 'pointer' }}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>

          {/* 5. SKILLS (TYPE, SEARCH & SELECT) */}
          <div style={filterSectionStyle}>
            <span style={filterTitleStyle}>
              <Code size={14} color="#4f46e5" /> 5. Skills
            </span>
            {/* Skill Search Input */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0.4rem 0.6rem', marginBottom: '8px' }}>
              <Search size={13} color="#64748b" />
              <input
                placeholder="Search or type skill..."
                value={skillSearchInput}
                onChange={e => setSkillSearchInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addCustomSkill(skillSearchInput);
                  }
                }}
                style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', fontSize: '0.8rem', color: '#0f172a', fontFamily: 'Inter, sans-serif' }}
              />
              {skillSearchInput && (
                <X size={12} color="#94a3b8" style={{ cursor: 'pointer' }} onClick={() => setSkillSearchInput('')} />
              )}
            </div>

            {/* Button to add custom skill if not in popular list */}
            {skillSearchInput.trim() && !POPULAR_SKILLS.some(s => s.toLowerCase() === skillSearchInput.trim().toLowerCase()) && (
              <button
                onClick={() => addCustomSkill(skillSearchInput)}
                style={{ width: '100%', marginBottom: '8px', padding: '5px 8px', background: '#eef2ff', border: '1px dashed #4f46e5', color: '#4f46e5', borderRadius: '6px', fontSize: '0.76rem', fontWeight: '700', cursor: 'pointer' }}
              >
                + Add "{skillSearchInput.trim()}" to filter
              </button>
            )}

            {/* Popular Skill Tags Filtered Live */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', maxHeight: '150px', overflowY: 'auto' }}>
              {POPULAR_SKILLS
                .filter(skill => !skillSearchInput.trim() || skill.toLowerCase().includes(skillSearchInput.toLowerCase().trim()))
                .map(skill => {
                  const isSelected = selectedSkills.includes(skill);
                  return (
                    <button
                      key={skill}
                      onClick={() => toggleSkill(skill)}
                      style={{
                        padding: '3px 9px',
                        borderRadius: '6px',
                        fontSize: '0.74rem',
                        fontWeight: '600',
                        border: isSelected ? '1.5px solid #4f46e5' : '1px solid #e2e8f0',
                        background: isSelected ? '#4f46e5' : '#f8fafc',
                        color: isSelected ? '#ffffff' : '#475569',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {skill} {isSelected ? '✓' : '+'}
                    </button>
                  );
                })}
            </div>
          </div>


          {/* 6. SALARY & MIN SALARY INPUT */}
          <div style={filterSectionStyle}>
            <span style={filterTitleStyle}>
              <DollarSign size={14} color="#4f46e5" /> 6. Salary Range
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '8px' }}>
              {[
                { label: 'All Packages', value: '' },
                { label: '₹0 – 5 LPA', value: '0-5' },
                { label: '₹5 – 10 LPA', value: '5-10' },
                { label: '₹10 – 20 LPA', value: '10-20' },
                { label: '₹20+ LPA', value: '20+' }
              ].map(opt => (
                <label key={opt.value} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: filterSalaryRange === opt.value ? '#4f46e5' : '#334155', fontWeight: filterSalaryRange === opt.value ? '700' : '500', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="salaryRange"
                    checked={filterSalaryRange === opt.value}
                    onChange={() => setFilterSalaryRange(opt.value)}
                    style={{ accentColor: '#4f46e5', cursor: 'pointer' }}
                  />
                  {opt.label}
                </label>
              ))}
            </div>

            {/* Min Salary Input */}
            <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '6px 10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '700', whiteSpace: 'nowrap' }}>Min LPA: ₹</span>
              <input
                type="number"
                placeholder="e.g. 8"
                value={minSalaryLpa}
                onChange={e => setMinSalaryLpa(e.target.value)}
                style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', fontSize: '0.84rem', fontWeight: '700', color: '#0f172a' }}
              />
              <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>LPA</span>
            </div>
          </div>

          {/* 7. POSTED DATE */}
          <div style={{ marginBottom: 0 }}>
            <span style={filterTitleStyle}>
              <Calendar size={14} color="#4f46e5" /> 7. Posted Date
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {[
                { label: 'Any time', value: '' },
                { label: 'Today', value: 'today' },
                { label: 'Last 3 days', value: '3days' },
                { label: 'Last 7 days', value: '7days' }
              ].map(opt => (
                <label key={opt.value} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: filterPostedDate === opt.value ? '#4f46e5' : '#334155', fontWeight: filterPostedDate === opt.value ? '700' : '500', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="postedDate"
                    checked={filterPostedDate === opt.value}
                    onChange={() => setFilterPostedDate(opt.value)}
                    style={{ accentColor: '#4f46e5', cursor: 'pointer' }}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* ──────────────────────────────────────────────────────────────────
            RIGHT SIDE: ACTIVE FILTER CHIPS + JOB LIST
        ────────────────────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* Active Filter Pills Bar */}
          {activeFilterCount > 0 && (
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Active Filters:</span>
              
              {filterJobType && (
                <span style={{ background: '#eef2ff', border: '1px solid #c7d2fe', color: '#4f46e5', padding: '2px 8px', borderRadius: '6px', fontSize: '0.76rem', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  Type: {filterJobType} <X size={12} style={{ cursor: 'pointer' }} onClick={() => setFilterJobType('')} />
                </span>
              )}
              {filterWorkMode && (
                <span style={{ background: '#eef2ff', border: '1px solid #c7d2fe', color: '#4f46e5', padding: '2px 8px', borderRadius: '6px', fontSize: '0.76rem', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  Mode: {filterWorkMode} <X size={12} style={{ cursor: 'pointer' }} onClick={() => setFilterWorkMode('')} />
                </span>
              )}
              {(filterLocation || locationSearchInput) && (
                <span style={{ background: '#eef2ff', border: '1px solid #c7d2fe', color: '#4f46e5', padding: '2px 8px', borderRadius: '6px', fontSize: '0.76rem', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  Location: {locationSearchInput || filterLocation} <X size={12} style={{ cursor: 'pointer' }} onClick={() => { setFilterLocation(''); setLocationSearchInput(''); }} />
                </span>
              )}
              {filterExperience && (
                <span style={{ background: '#eef2ff', border: '1px solid #c7d2fe', color: '#4f46e5', padding: '2px 8px', borderRadius: '6px', fontSize: '0.76rem', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  Exp: {filterExperience} <X size={12} style={{ cursor: 'pointer' }} onClick={() => setFilterExperience('')} />
                </span>
              )}
              {selectedSkills.map(sk => (
                <span key={sk} style={{ background: '#eef2ff', border: '1px solid #c7d2fe', color: '#4f46e5', padding: '2px 8px', borderRadius: '6px', fontSize: '0.76rem', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  Skill: {sk} <X size={12} style={{ cursor: 'pointer' }} onClick={() => toggleSkill(sk)} />
                </span>
              ))}
              {filterSalaryRange && (
                <span style={{ background: '#eef2ff', border: '1px solid #c7d2fe', color: '#4f46e5', padding: '2px 8px', borderRadius: '6px', fontSize: '0.76rem', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  Salary: ₹{filterSalaryRange} LPA <X size={12} style={{ cursor: 'pointer' }} onClick={() => setFilterSalaryRange('')} />
                </span>
              )}
              {minSalaryLpa && (
                <span style={{ background: '#eef2ff', border: '1px solid #c7d2fe', color: '#4f46e5', padding: '2px 8px', borderRadius: '6px', fontSize: '0.76rem', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  Min Salary: ₹{minSalaryLpa} LPA <X size={12} style={{ cursor: 'pointer' }} onClick={() => setMinSalaryLpa('')} />
                </span>
              )}
              {filterPostedDate && (
                <span style={{ background: '#eef2ff', border: '1px solid #c7d2fe', color: '#4f46e5', padding: '2px 8px', borderRadius: '6px', fontSize: '0.76rem', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  Date: {filterPostedDate} <X size={12} style={{ cursor: 'pointer' }} onClick={() => setFilterPostedDate('')} />
                </span>
              )}

              <button
                onClick={resetAllFilters}
                style={{ marginLeft: 'auto', background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '2px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer' }}
              >
                Clear All
              </button>
            </div>
          )}

          {/* Job Feed Cards */}
          {filtered.length === 0 ? (
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '3.5rem 2rem', textAlign: 'center', boxShadow: '0 1px 6px rgba(15,23,42,0.03)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🔍</div>
              <h3 style={{ fontWeight: '800', color: '#0f172a', fontSize: '1.1rem' }}>No matching jobs found</h3>
              <p style={{ color: '#64748b', fontSize: '0.88rem', marginTop: '0.35rem', marginBottom: '1.25rem' }}>
                We couldn't find any job matching all selected filters.
              </p>
              <button
                onClick={resetAllFilters}
                style={{ padding: '0.6rem 1.2rem', background: '#4f46e5', color: '#ffffff', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer' }}
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            (() => {
              const platformPerPage = parseInt(getSettings()?.platform?.jobsPerPage || '10', 10) || 10;
              const totalCandPages = Math.max(1, Math.ceil(filtered.length / platformPerPage));
              const candStart = (candidatePage - 1) * platformPerPage;
              const paginatedFeed = filtered.slice(candStart, candStart + platformPerPage);

              return (
                <>
                  {paginatedFeed.map(job => (
                    <JobCard
                      key={job.id}
                      job={job}
                      role={role}
                      currentUser={user}
                      hasApplied={appliedIds.includes(job.id)}
                      isSaved={savedJobs?.includes(job.id)}
                      onApply={handleApplyClick}
                      onSave={toggleSaveJob}
                      onEdit={startEdit}
                      onDelete={handleDeleteJob}
                      onStatusChange={handleStatusChange}
                    />
                  ))}

                  {/* ── Candidate Feed Pagination Bar ── */}
                  {filtered.length > platformPerPage && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ffffff', padding: '1rem 1.25rem', borderRadius: '14px', border: '1px solid #e2e8f0', marginTop: '0.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                      <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: '600' }}>
                        Showing {candStart + 1}&ndash;{Math.min(candStart + platformPerPage, filtered.length)} of {filtered.length} jobs (Page {candidatePage} of {totalCandPages})
                      </span>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <button
                          disabled={candidatePage <= 1}
                          onClick={() => setCandidatePage(p => Math.max(1, p - 1))}
                          style={{ border: '1px solid #cbd5e1', background: '#ffffff', borderRadius: '8px', padding: '6px 12px', fontSize: '0.8rem', fontWeight: '700', cursor: candidatePage <= 1 ? 'not-allowed' : 'pointer', opacity: candidatePage <= 1 ? 0.4 : 1 }}
                        >
                          &lt; Previous
                        </button>
                        {Array.from({ length: totalCandPages }, (_, i) => i + 1)
                          .filter(p => p === 1 || p === totalCandPages || (p >= candidatePage - 1 && p <= candidatePage + 1))
                          .map((p, idx, arr) => (
                            <React.Fragment key={p}>
                              {idx > 0 && arr[idx - 1] !== p - 1 && <span style={{ padding: '0 4px', color: '#94a3b8' }}>...</span>}
                              <button
                                onClick={() => setCandidatePage(p)}
                                style={{
                                  border: candidatePage === p ? 'none' : '1px solid #cbd5e1',
                                  background: candidatePage === p ? '#4f46e5' : '#ffffff',
                                  color: candidatePage === p ? '#ffffff' : '#334155',
                                  borderRadius: '8px', width: '32px', height: '32px',
                                  fontWeight: candidatePage === p ? '800' : '600', cursor: 'pointer'
                                }}
                              >
                                {p}
                              </button>
                            </React.Fragment>
                          ))}
                        <button
                          disabled={candidatePage >= totalCandPages}
                          onClick={() => setCandidatePage(p => Math.min(totalCandPages, p + 1))}
                          style={{ border: '1px solid #cbd5e1', background: '#ffffff', borderRadius: '8px', padding: '6px 12px', fontSize: '0.8rem', fontWeight: '700', cursor: candidatePage >= totalCandPages ? 'not-allowed' : 'pointer', opacity: candidatePage >= totalCandPages ? 0.4 : 1 }}
                        >
                          Next &gt;
                        </button>
                      </div>
                    </div>
                  )}
                </>
              );
            })()
          )}
        </div>
      </div>

      {/* ── MODAL: Post Job Vacancy (Dual Step) ───────────────────────── */}
      {showPostModal && (
        <JobModal
          title="Post New Job Vacancy"
          form={postForm}
          setForm={setPostForm}
          onSubmit={handlePostSubmit}
          onClose={() => { setShowPostModal(false); setPostStep(1); }}
          submitLabel="Publish Vacancy Now"
          success={postSuccess}
          appMethod={postAppMethod}
          setAppMethod={setPostAppMethod}
          step={postStep}
          setStep={setPostStep}
        />
      )}

      {/* ── MODAL: Candidate Direct CAREONIX Application Form ──────────── */}
      {careonixApplyJob && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: '1rem', overflowY: 'auto' }}>
          <div style={{ width: '560px', maxHeight: '90vh', overflowY: 'auto', background: '#ffffff', borderRadius: '24px', padding: '2rem', boxShadow: '0 25px 60px rgba(15,23,42,0.2)', border: '1px solid #e2e8f0' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <span style={{ background: '#f3e8ff', color: '#7c3aed', padding: '3px 10px', borderRadius: '10px', fontSize: '0.74rem', fontWeight: '800' }}>
                  🟣 Apply on CAREONIX
                </span>
                <h3 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#0f172a', margin: '6px 0 0 0' }}>
                  {careonixApplyJob.title}
                </h3>
                <p style={{ fontSize: '0.84rem', color: '#64748b', margin: '2px 0 0 0' }}>
                  {careonixApplyJob.company} &bull; {careonixApplyJob.location}
                </p>
              </div>
              <button onClick={() => { setCareonixApplyJob(null); navigate('/candidate/jobs', { replace: true }); }} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                <X size={18} />
              </button>
            </div>

            {careonixApplySuccess ? (
              <div style={{ background: '#dcfce7', border: '1px solid #bbf7d0', color: '#15803d', borderRadius: '14px', padding: '1.25rem', textAlign: 'center', fontWeight: '700', fontSize: '0.95rem' }}>
                {careonixApplySuccess}
              </div>
            ) : (
              <form onSubmit={submitCareonixApplication} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.86rem' }}>
                  <div style={{ fontWeight: '700', color: '#0f172a' }}>Candidate Details (From Profile):</div>
                  <div style={{ color: '#475569' }}>👤 Name: <strong>{user?.name || (user?.email ? user.email.split('@')[0] : 'Candidate')}</strong></div>
                  <div style={{ color: '#475569' }}>📧 Email: <strong>{user?.email || 'N/A'}</strong></div>
                  <div style={{ color: '#475569' }}>📱 Phone: <strong>{user?.phone || '+91 98765 43210'}</strong> (Verified ✓)</div>
                  <div style={{ color: '#475569' }}>📄 Resume Attached: <strong style={{ color: '#7c3aed' }}>{user?.resumeFileName || `${(user?.name || 'candidate').replace(/\s+/g, '_').toLowerCase()}_resume.pdf`}</strong></div>
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                    Cover Note / Message to Recruiter (Optional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Briefly introduce yourself and why you're a great fit for this position..."
                    value={candidateCoverNote}
                    onChange={e => setCandidateCoverNote(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.86rem', fontFamily: 'Inter, sans-serif' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button
                    type="submit"
                    style={{
                      flex: 1,
                      padding: '0.85rem',
                      background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '12px',
                      fontWeight: '800',
                      fontSize: '0.95rem',
                      cursor: 'pointer'
                    }}
                  >
                    Submit Application to Employer
                  </button>
                  <button type="button" onClick={() => setCareonixApplyJob(null)} style={{ padding: '0.85rem 1.25rem', background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0', borderRadius: '12px', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer' }}>
                    Cancel
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
