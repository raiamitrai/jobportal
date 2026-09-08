import React, { useState, useRef, useEffect } from 'react';
import {
  Briefcase,
  CheckCircle2,
  ExternalLink,
  Globe,
  Bell,
  ChevronRight,
  Send,
  Home,
  UserCheck,
  Bookmark,
  Plus,
  Edit3,
  Trash2,
  Upload,
  X,
  Lock,
  Unlock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useJobs } from '../context/JobContext';
import CompanyLogo from '../components/CompanyLogo';

// ─── Reusable Job Card — Responsive Fluid Layout ────────────────────────
function JobCard({ job, role, hasApplied, isSaved, onApply, onSave, onEdit, onDelete, onStatusChange }) {
  const skillsList = Array.isArray(job.skills)
    ? job.skills
    : (job.skills ? job.skills.split(',').map(s => s.trim()) : []);

  const isClosed = (job.status || '').toUpperCase() === 'CLOSED';

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
          {/* Title + Closed Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a', margin: '0 0 2px 0', wordBreak: 'break-word' }}>
              {job.title}
            </h3>
            {isClosed && (
              <span style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', fontSize: '0.72rem', fontWeight: '800', padding: '1px 7px', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                <Lock size={10} /> Closed
              </span>
            )}
          </div>
          {/* Company + Verified tick */}
          <span style={{ fontSize: '0.85rem', color: '#334155', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            {job.company}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#3b82f6" style={{ flexShrink: 0 }}>
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </span>
          {/* Location • Type • Experience */}
          <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '4px 0 8px 0' }}>
            {job.location}
            {job.type && <> &bull; <span style={{ textTransform: 'capitalize' }}>{job.type}</span></>}
            {job.experience && <> &bull; {job.experience}</>}
          </p>
          {/* Skill Tags */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {skillsList.map((sk, i) => (
              <span key={i} style={{
                background: '#f1f5f9',
                border: '1px solid #e2e8f0',
                color: '#475569',
                padding: '2px 9px',
                borderRadius: '6px',
                fontSize: '0.74rem',
                fontWeight: '600'
              }}>{sk}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ── COL 2: Verified Badge + Salary + Source (CENTER) ───────────────── */}
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
        {/* Status badge */}
        {isClosed ? (
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

        {/* Salary/Package */}
        <span style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0f172a', whiteSpace: 'nowrap' }}>
          {job.salary}
        </span>

        {/* Recruiter/Admin: Edit, Delete, Close / Active */}
        {(role === 'recruiter' || role === 'admin') && (
          <div style={{ display: 'flex', gap: '0.4rem', marginTop: '4px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              onClick={() => onEdit(job)}
              style={{
                background: '#f8fafc', border: '1px solid #cbd5e1', color: '#334155',
                padding: '4px 10px', borderRadius: '8px', cursor: 'pointer',
                fontSize: '0.78rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.3rem'
              }}
            >
              <Edit3 size={13} /> Edit
            </button>
            <button
              onClick={() => onDelete(job.id, job.title)}
              style={{
                background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626',
                padding: '4px 10px', borderRadius: '8px', cursor: 'pointer',
                fontSize: '0.78rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.3rem'
              }}
            >
              <Trash2 size={13} /> Delete
            </button>
            {isClosed ? (
              <button
                onClick={() => onStatusChange && onStatusChange(job.id, 'ACTIVE')}
                title="Activate job - candidates can apply again"
                style={{ background: '#ecfdf5', border: '1.5px solid #6ee7b7', color: '#047857', padding: '4px 10px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
              >
                <Unlock size={13} /> Activate
              </button>
            ) : (
              <button
                onClick={() => onStatusChange && onStatusChange(job.id, 'CLOSED')}
                title="Close job - candidate apply button will be locked"
                style={{ background: '#fff7ed', border: '1.5px solid #fdba74', color: '#c2410c', padding: '4px 10px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
              >
                <Lock size={13} /> Close
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── COL 3: Apply Now + Save Bookmark (RIGHT) ───────────────────────── */}
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
              Deadline: {job.lastDateToApply}
            </span>
          )}
          {/* Apply Now / Applied / Closed button */}
          {isClosed ? (
            <button
              disabled
              title="Applications are closed for this position"
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
              <Lock size={13} /> Applications Closed
            </button>
          ) : hasApplied ? (
            <button
              disabled
              style={{
                padding: '0.45rem 0.9rem',
                background: '#dcfce7',
                color: '#15803d',
                border: '1.5px solid #86efac',
                borderRadius: '8px',
                fontWeight: '700',
                fontSize: '0.78rem',
                cursor: 'default',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px',
                whiteSpace: 'nowrap'
              }}
            >
              <CheckCircle2 size={14} /> Applied
            </button>
          ) : (
            <button
              onClick={() => onApply(job)}
              style={{
                padding: '0.45rem 0.9rem',
                background: '#4f46e5', color: '#ffffff',
                border: 'none', borderRadius: '8px',
                fontWeight: '700', fontSize: '0.78rem', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                whiteSpace: 'nowrap',
                boxShadow: '0 2px 8px rgba(79,70,229,0.2)'
              }}
            >
              Apply Now <ExternalLink size={12} />
            </button>
          )}

          {/* Save / Bookmark button */}
          <button
            onClick={() => onSave(job.id)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
              background: isSaved ? '#fefce8' : '#f8fafc',
              border: `1.5px solid ${isSaved ? '#fde68a' : '#e2e8f0'}`,
              color: isSaved ? '#d97706' : '#64748b',
              padding: '0.45rem 0.85rem',
              borderRadius: '8px',
              fontWeight: '600', fontSize: '0.78rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s ease'
            }}
            title={isSaved ? 'Remove bookmark' : 'Save for later'}
          >
            <Bookmark size={13} fill={isSaved ? '#d97706' : 'none'} />
            {isSaved ? 'Saved' : 'Save'}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Logo Upload Field ────────────────────────────────────────────────────────
function LogoUploadField({ logoUrl, onChange }) {
  const ref = useRef();
  return (
    <div>
      <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '6px' }}>
        Company Logo (optional)
      </label>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {logoUrl ? (
          <div style={{ position: 'relative' }}>
            <img src={logoUrl} alt="logo" style={{ width: '52px', height: '52px', borderRadius: '10px', objectFit: 'contain', border: '1px solid #e2e8f0' }} />
            <button
              type="button"
              onClick={() => onChange(null)}
              style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#dc2626', border: 'none', borderRadius: '50%', width: '18px', height: '18px', color: '#0f172a', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
            >
              <X size={11} />
            </button>
          </div>
        ) : (
          <div
            onClick={() => ref.current?.click()}
            style={{ width: '52px', height: '52px', borderRadius: '10px', border: '2px dashed #c7d2fe', background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#4f46e5' }}
          >
            <Upload size={20} />
          </div>
        )}
        <div>
          <button
            type="button"
            onClick={() => ref.current?.click()}
            style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', color: '#475569', padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '5px' }}
          >
            <Upload size={14} /> {logoUrl ? 'Change Logo' : 'Upload Logo'}
          </button>
          <p style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '4px' }}>PNG, JPG, SVG — max 500KB</p>
        </div>
        <input
          ref={ref}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={e => {
            const file = e.target.files?.[0];
            if (!file) return;
            if (file.size > 500 * 1024) { alert('File too large. Max 500KB.'); return; }
            const reader = new FileReader();
            reader.onload = ev => onChange(ev.target.result);
            reader.readAsDataURL(file);
          }}
        />
      </div>
    </div>
  );
}

// ─── Post / Edit Job Modal ────────────────────────────────────────────────────
function JobModal({ title, form, setForm, onSubmit, onClose, submitLabel = 'Publish Job', success }) {
  const inputStyle = {
    width: '100%', padding: '0.7rem 0.9rem', borderRadius: '10px',
    background: '#f8fafc', border: '1px solid #e2e8f0',
    color: '#0f172a', marginTop: '5px',
    fontFamily: 'Inter, sans-serif', fontSize: '0.875rem'
  };
  const labelStyle = { fontSize: '0.78rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: '1rem', overflowY: 'auto' }}>
      <div style={{ width: '640px', maxHeight: '90vh', overflowY: 'auto', background: '#ffffff', borderRadius: '20px', padding: '2rem', boxShadow: '0 25px 60px rgba(15,23,42,0.18)', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#0f172a' }}>{title}</h2>
            <p style={{ fontSize: '0.83rem', color: '#64748b', marginTop: '3px' }}>Fill details including apply link, currency, skills, and deadline.</p>
          </div>
          <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', borderRadius: '8px', padding: '6px 10px', cursor: 'pointer', color: '#64748b' }}>✕</button>
        </div>

        {success && (
          <div style={{ background: '#dcfce7', border: '1px solid #bbf7d0', color: '#15803d', borderRadius: '10px', padding: '0.75rem 1rem', marginBottom: '1.25rem', fontWeight: '600', fontSize: '0.9rem' }}>
            {success}
          </div>
        )}

        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Logo Upload */}
          <LogoUploadField logoUrl={form.logoUrl} onChange={v => setForm(f => ({ ...f, logoUrl: v }))} />

          {/* Row: Title + Company */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>Job Title *</label>
              <input style={inputStyle} required placeholder="e.g. Senior Java Architect" value={form.title || ''} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            </div>
            <div>
              <label style={labelStyle}>Company Name *</label>
              <input style={inputStyle} required placeholder="e.g. Careonix Tech" value={form.company || ''} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} />
            </div>
          </div>

          {/* Row: Location + Type */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>Location</label>
              <input style={inputStyle} placeholder="e.g. Bangalore, India" value={form.location || ''} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
            </div>
            <div>
              <label style={labelStyle}>Job Type</label>
              <select style={inputStyle} value={form.type || 'Full-time'} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                <option>Full-time</option>
                <option>Part-time</option>
                <option>Internship</option>
                <option>Apprentice</option>
                <option>Remote</option>
                <option>Hybrid</option>
                <option>Contract</option>
                <option>Freelance</option>
              </select>
            </div>
          </div>

          {/* Row: Currency + Salary */}
          <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>Currency</label>
              <select style={inputStyle} value={form.currency || 'INR'} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}>
                <option value="INR">₹ INR (India)</option>
                <option value="USD">$ USD (Foreign)</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Salary Range</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '5px' }}>
                <span style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a', flexShrink: 0 }}>
                  {form.currency === 'USD' ? '$' : '₹'}
                </span>
                <input style={{ ...inputStyle, marginTop: 0, flex: 1 }} placeholder="e.g. 8,00,000 - 12,00,000" value={form.salary || ''} onChange={e => setForm(f => ({ ...f, salary: e.target.value }))} />
              </div>
            </div>
          </div>

          {/* Row: Experience + Last Date */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>Experience Required</label>
              <select style={inputStyle} value={form.experience || '1-3 Years'} onChange={e => setForm(f => ({ ...f, experience: e.target.value }))}>
                <option>Fresher (0 Years)</option>
                <option>Fresher (0-1 Year)</option>
                <option>1-3 Years</option>
                <option>2-4 Yrs</option>
                <option>2-5 Yrs</option>
                <option>3-5 Years</option>
                <option>5+ Years</option>
                <option>7+ Years</option>
                <option>10+ Years</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Last Date to Apply</label>
              <input style={inputStyle} type="date" value={form.lastDateToApply || '2026-08-31'} onChange={e => setForm(f => ({ ...f, lastDateToApply: e.target.value }))} />
            </div>
          </div>

          {/* Skills */}
          <div>
            <label style={labelStyle}>Skills Required (comma separated)</label>
            <input style={inputStyle} placeholder="Java, Spring Boot, React, MySQL" value={form.skills || ''} onChange={e => setForm(f => ({ ...f, skills: e.target.value }))} />
          </div>

          {/* Apply URL */}
          <div>
            <label style={labelStyle}>Apply Link URL</label>
            <input style={inputStyle} placeholder="https://careers.company.com/apply" value={form.applyUrl || ''} onChange={e => setForm(f => ({ ...f, applyUrl: e.target.value }))} />
            <p style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '4px' }}>Candidates will be redirected here when they click "Apply Now"</p>
          </div>

          {/* Submit / Cancel */}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="submit" style={{ flex: 1, padding: '0.8rem', background: '#4f46e5', color: '#0f172a', border: 'none', borderRadius: '12px', fontWeight: '700', fontSize: '0.95rem', cursor: 'pointer' }}>
              {submitLabel}
            </button>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '0.8rem', background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0', borderRadius: '12px', fontWeight: '600', fontSize: '0.9rem', cursor: 'pointer' }}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main ClientDashboard ─────────────────────────────────────────────────────
export default function ClientDashboard({ setActiveTab }) {
  const { user } = useAuth();
  const { jobs, applications, savedJobs, toggleSaveJob, addJob, updateJob, deleteJob, updateJobStatus, applyToJob } = useJobs();
  const role = user?.role === 'admin' ? 'admin' : (user?.accountType === 'recruiter' ? 'recruiter' : 'candidate');

  // Initialize appliedJobIds from persisted applications filtered by current user's email
  const [appliedJobIds, setAppliedJobIds] = useState(() => {
    const myEmail = (user?.email || '').toLowerCase().trim();
    if (!myEmail) return [];
    return (applications || [])
      .filter(a => (a.candidateEmail || '').toLowerCase().trim() === myEmail)
      .map(a => a.jobId);
  });

  // Sync when user or applications change (e.g. after login / logout)
  useEffect(() => {
    const myEmail = (user?.email || '').toLowerCase().trim();
    if (!myEmail) { setAppliedJobIds([]); return; }
    const myJobIds = (applications || [])
      .filter(a => (a.candidateEmail || '').toLowerCase().trim() === myEmail)
      .map(a => a.jobId);
    setAppliedJobIds(myJobIds);
  }, [user?.email, applications]);

  const [pendingConfirmJob, setPendingConfirmJob] = useState(null);

  // Post modal (recruiter/admin)
  const [showPostModal, setShowPostModal] = useState(false);
  const [postForm, setPostForm] = useState({ currency: 'INR', type: 'Full-time', experience: '1-3 Years', lastDateToApply: '2026-08-31', logoUrl: null });
  const [postSuccess, setPostSuccess] = useState('');

  // Edit modal
  const [editingJob, setEditingJob] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editSuccess, setEditSuccess] = useState('');

  const handleApplyClick = (job) => {
    if (appliedJobIds.includes(job.id)) return;
    if (job.applyUrl) {
      const url = job.applyUrl.startsWith('http') ? job.applyUrl : `https://${job.applyUrl}`;
      window.open(url, '_blank');
    }
    setPendingConfirmJob(job);
  };

  const confirmApplication = (job) => {
    if (job && !appliedJobIds.includes(job.id)) {
      setAppliedJobIds(prev => [...prev, job.id]);
      applyToJob(job.id, user);
    }
    setPendingConfirmJob(null);
  };

  const handlePostSubmit = (e) => {
    e.preventDefault();
    if (!postForm.title) return;
    addJob({ ...postForm, skills: postForm.skills || '' }, user);
    setPostSuccess('🎉 Job vacancy published successfully!');
    setTimeout(() => { setPostSuccess(''); setShowPostModal(false); setPostForm({ currency: 'INR', type: 'Full-time', experience: '1-3 Years', lastDateToApply: '2026-08-31', logoUrl: null }); }, 1400);
  };

  const startEdit = (job) => {
    setEditingJob(job);
    setEditForm({
      title: job.title || '',
      company: job.company || '',
      location: job.location || '',
      currency: job.currency || 'INR',
      salary: job.salary ? job.salary.replace(/[₹$]/g, '').trim() : '',
      type: job.type || 'Full-time',
      experience: job.experience || '1-3 Years',
      lastDateToApply: job.lastDateToApply || '2026-08-31',
      skills: Array.isArray(job.skills) ? job.skills.join(', ') : (job.skills || ''),
      applyUrl: job.applyUrl || '',
      logoUrl: job.logoUrl || null
    });
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    updateJob(editingJob.id, { ...editForm, skills: editForm.skills || '' });
    setEditSuccess('✅ Job updated successfully!');
    setTimeout(() => { setEditSuccess(''); setEditingJob(null); }, 1400);
  };

  const handleDelete = (jobId) => {
    if (window.confirm('Delete this job? It will be removed for all candidates.')) {
      deleteJob(jobId);
    }
  };

  const displayJobs = jobs.slice(0, role === 'candidate' ? 3 : jobs.length);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', background: '#f8fafc', minHeight: '100vh' }}>

      {/* ── Application Confirmation Modal ──────────────────────────────── */}
      {pendingConfirmJob && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: '1rem' }}>
          <div style={{ width: '480px', padding: '2.25rem', background: '#ffffff', borderRadius: '20px', textAlign: 'center', boxShadow: '0 25px 60px rgba(15,23,42,0.2)', border: '1px solid #e2e8f0' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto', color: '#4f46e5' }}>
              <Globe size={28} />
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.5rem' }}>Confirm Application Status</h3>
            <p style={{ fontSize: '0.88rem', color: '#64748b', marginBottom: '1.5rem', lineHeight: '1.6' }}>
              We opened the official job portal for <strong style={{ color: '#4f46e5' }}>{pendingConfirmJob.company}</strong> in a new tab for <strong style={{ color: '#0f172a' }}>"{pendingConfirmJob.title}"</strong>.
              <br /><br />
              Did you successfully submit your application?
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button
                onClick={() => confirmApplication(pendingConfirmJob)}
                style={{ padding: '0.85rem', fontWeight: '700', fontSize: '0.95rem', background: '#10b981', color: '#0f172a', border: 'none', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                <CheckCircle2 size={18} /> Yes, I Applied Successfully!
              </button>
              <button
                onClick={() => setPendingConfirmJob(null)}
                style={{ padding: '0.75rem', fontWeight: '600', fontSize: '0.88rem', background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0', borderRadius: '12px', cursor: 'pointer' }}
              >
                ❌ No / Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Top Dashboard Header Grid: Welcome Banner + Quick Links Card ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '1.25rem', alignItems: 'stretch' }}>
        
        {/* Welcome Back Card (Left) */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.5rem 1.75rem', boxShadow: '0 2px 10px rgba(15,23,42,0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem', flex: 1 }}>
            <div>
              <h1 style={{ fontSize: '1.65rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                {role === 'recruiter' ? 'Recruiter Dashboard' : role === 'admin' ? 'Admin Control Panel' : 'Dashboard'}
              </h1>
              <p style={{ color: '#64748b', marginTop: '5px', fontSize: '0.88rem' }}>
                {role === 'candidate' ? 'Find verified job opportunities from official company career pages.' : 'Manage job postings, review candidates, and track applications.'}
              </p>
            </div>

            {/* 3 Stat Badges */}
            <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap' }}>
              {/* Stat 1: Verified Jobs */}
              <div style={{ background: '#f5f3ff', border: '1px solid #ede9fe', borderRadius: '14px', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '135px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#ede9fe', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Home size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '600' }}>Verified Jobs</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#0f172a', lineHeight: '1.1' }}>{jobs.length}</div>
                  <div style={{ fontSize: '0.66rem', color: '#7c3aed', fontWeight: '600', whiteSpace: 'nowrap' }}>New this week</div>
                </div>
              </div>

              {/* Stat 2: Applications */}
              <div style={{ background: '#f0fdf4', border: '1px solid #dcfce7', borderRadius: '14px', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '135px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#dcfce7', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Briefcase size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '600' }}>Applications</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#0f172a', lineHeight: '1.1' }}>
                    {role === 'candidate' ? appliedJobIds.length : applications.length}
                  </div>
                  <div style={{ fontSize: '0.66rem', color: '#059669', fontWeight: '600', whiteSpace: 'nowrap' }}>
                    {role === 'candidate' ? 'Applied jobs' : 'Total applications'}
                  </div>
                </div>
              </div>

              {/* Stat 3: Saved Jobs */}
              <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '14px', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '135px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Bookmark size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '600' }}>Saved Jobs</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#0f172a', lineHeight: '1.1' }}>{savedJobs ? savedJobs.length : 0}</div>
                  <div style={{ fontSize: '0.66rem', color: '#d97706', fontWeight: '600', whiteSpace: 'nowrap' }}>Saved for later</div>
                </div>
              </div>
            </div>
          </div>

          {(role === 'recruiter' || role === 'admin') && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'flex-end', flexShrink: 0 }}>
              <button
                onClick={() => setShowPostModal(true)}
                style={{ padding: '0.65rem 1.25rem', background: '#4f46e5', color: '#ffffff', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '0.88rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 4px 12px rgba(79,70,229,0.25)' }}
              >
                <Plus size={16} /> Post New Job
              </button>
            </div>
          )}
        </div>

        {/* Quick Links Card (Top Right Corner!) */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.2rem 1.35rem', boxShadow: '0 1px 6px rgba(15,23,42,0.03)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', margin: '0 0 0.5rem 0' }}>Quick Links</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {[
              { id: 'jobs', label: 'Browse Jobs', icon: Briefcase },
              { id: 'applications', label: 'My Applications', icon: CheckCircle2 },
              { id: 'saved', label: 'Saved Jobs', icon: Bookmark },
              { id: 'profile', label: 'Update Profile', icon: UserCheck }
            ].map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justify: 'space-between',
                    width: '100%',
                    padding: '0.6rem 0.75rem',
                    borderRadius: '10px',
                    background: '#ffffff',
                    color: '#1e293b',
                    border: '1px solid transparent',
                    fontSize: '0.86rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    fontFamily: 'Inter, sans-serif'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={e => e.currentTarget.style.background = '#ffffff'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <Icon size={16} color="#4f46e5" />
                    {item.label}
                  </div>
                  <ChevronRight size={15} color="#94a3b8" />
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* ── Main Feed: Latest Job Opportunities + How It Works ──────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '1.25rem', marginTop: '1.5rem' }}>

        {/* Left: Job Feed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0f172a' }}>Latest Job Opportunities</h2>
            <button onClick={() => setActiveTab('jobs')} style={{ background: 'none', border: 'none', color: '#4f46e5', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px' }}>
              View all <ChevronRight size={16} />
            </button>
          </div>

          {displayJobs.map(job => (
            <JobCard
              key={job.id}
              job={job}
              role={role}
              hasApplied={appliedJobIds.includes(job.id)}
              isSaved={savedJobs?.includes(job.id)}
              onApply={handleApplyClick}
              onSave={toggleSaveJob}
              onEdit={startEdit}
              onDelete={handleDelete}
              onStatusChange={updateJobStatus}
            />
          ))}

          {/* View All Jobs Button for Candidates */}
          {role === 'candidate' && jobs.length > 3 && (
            <button
              onClick={() => setActiveTab('jobs')}
              style={{
                width: '100%',
                padding: '0.85rem',
                background: '#ffffff',
                border: '1.5px solid #c7d2fe',
                color: '#4f46e5',
                borderRadius: '14px',
                fontWeight: '700',
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                boxShadow: '0 2px 8px rgba(79,70,229,0.06)',
                fontFamily: 'Inter, sans-serif'
              }}
            >
              View All Job Opportunities <ChevronRight size={18} />
            </button>
          )}

          {/* Notification Banner */}
          <div style={{ padding: '1.25rem 1.6rem', borderRadius: '16px', background: 'linear-gradient(135deg, #f5f3ff 0%, #eff6ff 100%)', border: '1px solid #e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1.25rem', marginTop: '0.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#e0e7ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Send size={20} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0f172a' }}>Don't miss new opportunities!</h4>
                <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>Turn on notifications and get updates for new jobs matching your profile.</p>
              </div>
            </div>
            <button onClick={() => alert('🔔 Notifications enabled!')} style={{ padding: '0.6rem 1.15rem', fontSize: '0.85rem', fontWeight: '700', background: '#4f46e5', color: '#ffffff', border: 'none', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem', whiteSpace: 'nowrap', boxShadow: '0 4px 12px rgba(79,70,229,0.25)' }}>
              <Bell size={15} /> Enable Notifications
            </button>
          </div>
        </div>

        {/* Right Sidebar: How It Works (FIXED / STICKY ON SCROLL) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', position: 'sticky', top: '1.5rem', alignSelf: 'start' }}>
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.4rem', boxShadow: '0 1px 6px rgba(15,23,42,0.03)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a', marginBottom: '1.1rem' }}>How It Works</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              {[
                { n: 1, bg: '#e0e7ff', fg: '#4f46e5', title: 'We collect jobs', desc: 'from official company career pages.' },
                { n: 2, bg: '#dcfce7', fg: '#059669', title: 'We verify', desc: 'and publish the jobs.' },
                { n: 3, bg: '#f3e8ff', fg: '#7c3aed', title: 'You apply directly', desc: 'on the company site.' }
              ].map(s => (
                <div key={s.n} style={{ display: 'flex', gap: '0.8rem', alignItems: 'flex-start' }}>
                  <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: s.bg, color: s.fg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '0.82rem', flexShrink: 0 }}>{s.n}</div>
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '0.85rem', color: '#0f172a' }}>{s.title}</div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
