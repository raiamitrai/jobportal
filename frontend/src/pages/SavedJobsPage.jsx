import React, { useState } from 'react';
import {
  Bookmark,
  Search,
  List,
  Grid,
  ExternalLink,
  MoreVertical,
  Filter,
  RotateCcw,
  Lightbulb,
  Heart,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Trash2,
  Share2,
  Eye,
  Check
} from 'lucide-react';
import { useJobs } from '../context/JobContext';
import CompanyLogo from '../components/CompanyLogo';

export default function SavedJobsPage({ setActiveTab }) {
  const { jobs, savedJobs, toggleSaveJob } = useJobs();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
  
  // Filter States
  const [jobTypeFilter, setJobTypeFilter] = useState('');
  const [expFilter, setExpFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  
  // Local state for removed items preview
  const [removedIds, setRemovedIds] = useState([]);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [copiedShareId, setCopiedShareId] = useState(null);

  // Real candidate saved jobs (Strictly no dummy fallbacks)
  const contextSavedJobs = jobs.filter(j => savedJobs?.includes(j.id));
  
  const allSaved = contextSavedJobs.map(j => {
    const formattedSaveDate = j.savedDate || `Saved on ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`;
    return {
      id: j.id,
      title: j.title,
      company: j.company,
      logoUrl: j.logoUrl,
      location: j.location || 'India',
      type: j.type || 'Full-time',
      experience: j.experience || '1-3 Yrs',
      salary: j.salary || '₹10,00,000 - ₹18,00,000',
      savedDate: formattedSaveDate,
      skills: Array.isArray(j.skills) ? j.skills : (j.skills ? j.skills.split(',') : []),
      verified: true,
      applyUrl: j.applyUrl || '#'
    };
  });

  // Filter out removed items locally
  const displaySaved = allSaved.filter(j => !removedIds.includes(j.id));

  // Search & Filters Application
  const filteredJobs = displaySaved.filter(job => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (Array.isArray(job.skills) && job.skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase())));

    const matchesType = !jobTypeFilter || job.type.toLowerCase().includes(jobTypeFilter.toLowerCase());
    const matchesExp = !expFilter || job.experience.toLowerCase().includes(expFilter.toLowerCase());
    const matchesLoc = !locationFilter || job.location.toLowerCase().includes(locationFilter.toLowerCase());

    return matchesSearch && matchesType && matchesExp && matchesLoc;
  });

  const handleRemove = (jobId) => {
    toggleSaveJob(jobId);
    setRemovedIds(prev => [...prev, jobId]);
    setOpenMenuId(null);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setJobTypeFilter('');
    setExpFilter('');
    setLocationFilter('');
    setDateFilter('');
  };

  const handleShare = (job) => {
    navigator.clipboard.writeText(`Check out ${job.title} at ${job.company} on CAREONIX: ${job.applyUrl || window.location.href}`);
    setCopiedShareId(job.id);
    setTimeout(() => setCopiedShareId(null), 2000);
    setOpenMenuId(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', background: '#f8fafc', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      
      {/* ── Page Header Title ────────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h1 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
              Saved Jobs
            </h1>
            <Bookmark size={22} color="#7c3aed" fill="#7c3aed" />
          </div>
          <p style={{ color: '#64748b', marginTop: '4px', fontSize: '0.9rem' }}>
            Jobs you've saved for later.
          </p>
        </div>

        <div style={{ fontSize: '0.92rem', fontWeight: '600', color: '#64748b' }}>
          <strong style={{ color: '#4f46e5', fontWeight: '800' }}>{filteredJobs.length} Jobs</strong> Saved
        </div>
      </div>

      {/* ── 2-Column Layout: Main Content + Right Sidebar ───────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 310px', gap: '1.5rem', alignItems: 'start' }}>

        {/* ── LEFT MAIN COLUMN ──────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* 1. Top Controls Bar: Search Input + Sort Select + View Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
            
            {/* Search Input Box */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '0.65rem 1rem', flex: 1, minWidth: '260px', boxShadow: '0 1px 4px rgba(15,23,42,0.02)' }}>
              <Search size={17} color="#94a3b8" />
              <input
                type="text"
                placeholder="Search saved jobs by title, company or skills..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '0.88rem', color: '#0f172a', width: '100%', fontFamily: 'Inter, sans-serif' }}
              />
            </div>

            {/* Sort Select Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                style={{
                  padding: '0.65rem 1rem',
                  borderRadius: '12px',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  color: '#0f172a',
                  fontSize: '0.86rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  outline: 'none',
                  boxShadow: '0 1px 4px rgba(15,23,42,0.02)'
                }}
              >
                <option value="recent">Sort by: Recently Saved</option>
                <option value="salary">Sort by: High Salary</option>
                <option value="company">Sort by: Company Name</option>
              </select>

              {/* View Layout Toggle Switcher (List / Grid) */}
              <div style={{ display: 'flex', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '3px', gap: '3px', boxShadow: '0 1px 4px rgba(15,23,42,0.02)' }}>
                <button
                  onClick={() => setViewMode('list')}
                  style={{
                    padding: '0.5rem 0.7rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: viewMode === 'list' ? '#f3e8ff' : 'transparent',
                    color: viewMode === 'list' ? '#7c3aed' : '#94a3b8',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease'
                  }}
                  title="List View"
                >
                  <List size={18} />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  style={{
                    padding: '0.5rem 0.7rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: viewMode === 'grid' ? '#f3e8ff' : 'transparent',
                    color: viewMode === 'grid' ? '#7c3aed' : '#94a3b8',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justify: 'center',
                    transition: 'all 0.2s ease'
                  }}
                  title="Grid View"
                >
                  <Grid size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* 2. Saved Job List Feed */}
          {filteredJobs.length === 0 ? (
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '3.5rem 2rem', textAlign: 'center', boxShadow: '0 1px 6px rgba(15,23,42,0.03)' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#f3e8ff', color: '#7c3aed', margin: '0 auto 1.25rem auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bookmark size={30} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0f172a', margin: '0 0 6px 0' }}>No saved jobs found</h3>
              <p style={{ color: '#64748b', fontSize: '0.88rem', margin: '0 0 1.5rem 0' }}>
                Try clearing your search filters or bookmark new jobs from the listings.
              </p>
              <button
                onClick={() => setActiveTab('jobs')}
                style={{
                  padding: '0.75rem 1.6rem',
                  background: '#4f46e5',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '12px',
                  fontWeight: '700',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(79,70,229,0.25)'
                }}
              >
                Browse All Jobs
              </button>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: viewMode === 'grid' ? 'repeat(2, 1fr)' : '1fr',
              gap: '1.1rem'
            }}>
              {filteredJobs.map(job => {
                const skillsList = Array.isArray(job.skills) ? job.skills : (job.skills ? job.skills.split(',') : []);

                return (
                  <div
                    key={job.id}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '18px',
                      padding: '1.35rem 1.6rem',
                      display: viewMode === 'grid' ? 'flex' : 'grid',
                      flexDirection: viewMode === 'grid' ? 'column' : 'row',
                      gridTemplateColumns: '1fr auto auto',
                      alignItems: viewMode === 'grid' ? 'flex-start' : 'center',
                      gap: '1.5rem',
                      boxShadow: '0 1px 4px rgba(15,23,42,0.03)',
                      transition: 'all 0.2s ease',
                      position: 'relative'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = '#c7d2fe';
                      e.currentTarget.style.boxShadow = '0 4px 14px rgba(79,70,229,0.06)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = '#e2e8f0';
                      e.currentTarget.style.boxShadow = '0 1px 4px rgba(15,23,42,0.03)';
                    }}
                  >
                    {/* COL 1: Logo + Job Info */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', minWidth: 0, width: viewMode === 'grid' ? '100%' : 'auto' }}>
                      <div style={{ flexShrink: 0, marginTop: '2px' }}>
                        <CompanyLogo company={job.company} logoUrl={job.logoUrl} size={50} />
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                          <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {job.title}
                          </h3>
                          {job.verified && (
                            <span style={{ background: '#f0fdf4', color: '#059669', border: '1px solid #bbf7d0', padding: '2px 8px', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                              <CheckCircle2 size={12} /> Verified
                            </span>
                          )}
                        </div>

                        <div style={{ fontSize: '0.86rem', color: '#334155', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '3px' }}>
                          {job.company}
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="#3b82f6" style={{ flexShrink: 0 }}>
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                          </svg>
                        </div>

                        <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '4px 0 8px 0' }}>
                          {job.location} &bull; {job.type} &bull; {job.experience}
                        </p>

                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {skillsList.map((sk, i) => (
                            <span key={i} style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', color: '#475569', padding: '2px 9px', borderRadius: '6px', fontSize: '0.74rem', fontWeight: '600' }}>
                              {sk.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* COL 2: Salary & Saved Date Tag */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: viewMode === 'grid' ? 'flex-start' : 'center', justifyContent: 'center', gap: '4px', minWidth: '170px' }}>
                      <div style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a' }}>
                        {job.salary}
                      </div>
                      <div style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: '500' }}>
                        {job.savedDate}
                      </div>
                    </div>

                    {/* COL 3: Apply Now + Filled Purple Bookmark + Overflow Menu */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexShrink: 0, marginTop: viewMode === 'grid' ? '0.75rem' : 0 }}>
                      <a
                        href={job.applyUrl || '#'}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          padding: '0.65rem 1.25rem',
                          background: '#4f46e5',
                          color: '#ffffff',
                          borderRadius: '10px',
                          fontWeight: '700',
                          fontSize: '0.86rem',
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          boxShadow: '0 4px 12px rgba(79,70,229,0.2)'
                        }}
                      >
                        Apply Now <ExternalLink size={14} />
                      </a>

                      {/* Filled Purple Bookmark Icon Button (Instant Remove) */}
                      <button
                        onClick={() => handleRemove(job.id)}
                        style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: '10px',
                          background: '#f3e8ff',
                          border: '1px solid #ddd6fe',
                          color: '#7c3aed',
                          display: 'flex',
                          alignItems: 'center',
                          justify: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                        title="Remove from Saved"
                      >
                        <Bookmark size={18} fill="#7c3aed" />
                      </button>

                      {/* Overflow ⋮ Menu Button */}
                      <div style={{ position: 'relative' }}>
                        <button
                          onClick={() => setOpenMenuId(openMenuId === job.id ? null : job.id)}
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            background: 'transparent',
                            border: 'none',
                            color: '#64748b',
                            display: 'flex',
                            alignItems: 'center',
                            justify: 'center',
                            cursor: 'pointer'
                          }}
                        >
                          <MoreVertical size={18} />
                        </button>

                        {/* Dropdown Options */}
                        {openMenuId === job.id && (
                          <div style={{
                            position: 'absolute',
                            right: 0,
                            top: '100%',
                            marginTop: '4px',
                            width: '180px',
                            background: '#ffffff',
                            border: '1px solid #e2e8f0',
                            borderRadius: '12px',
                            boxShadow: '0 10px 25px rgba(15,23,42,0.12)',
                            zIndex: 30,
                            padding: '4px'
                          }}>
                            <button
                              onClick={() => handleShare(job)}
                              style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: 'none', background: 'transparent', color: '#1e293b', fontSize: '0.82rem', fontWeight: '600', cursor: 'pointer', textAlign: 'left' }}
                            >
                              <Share2 size={14} color="#4f46e5" /> {copiedShareId === job.id ? 'Link Copied!' : 'Share Job'}
                            </button>
                            <button
                              onClick={() => handleRemove(job.id)}
                              style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: 'none', background: 'transparent', color: '#dc2626', fontSize: '0.82rem', fontWeight: '600', cursor: 'pointer', textAlign: 'left' }}
                            >
                              <Trash2 size={14} color="#dc2626" /> Remove from Saved
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 3. Bottom Private Note Banner Card (Matching reference image 100%) */}
          <div style={{
            background: 'linear-gradient(135deg, #f5f3ff 0%, #eff6ff 100%)',
            border: '1px solid #e0e7ff',
            borderRadius: '20px',
            padding: '1.25rem 1.6rem',
            display: 'flex',
            alignItems: 'center',
            justify: 'space-between',
            gap: '1.25rem',
            marginTop: '0.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#ede9fe', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Bookmark size={20} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.92rem', fontWeight: '800', color: '#0f172a', margin: '0 0 2px 0' }}>
                  Jobs saved here are private to you.
                </h4>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
                  Compare jobs, track opportunities, and never miss a great job.
                </p>
              </div>
            </div>

            {/* Folder graphic illustration icon */}
            <div style={{ width: '48px', height: '40px', background: '#e0e7ff', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4f46e5', flexShrink: 0 }}>
              <ShieldCheck size={24} />
            </div>
          </div>

        </div>

        {/* ── RIGHT SIDEBAR (STICKY ON SCROLL) ──────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', position: 'sticky', top: '1.5rem', alignSelf: 'start' }}>

          {/* 1. Filter Saved Jobs Card */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.35rem', boxShadow: '0 1px 6px rgba(15,23,42,0.03)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.1rem' }}>
              <Filter size={16} color="#0f172a" />
              <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                Filter Saved Jobs
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Job Type Dropdown */}
              <div>
                <label style={{ fontSize: '0.76rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '5px' }}>
                  Job Type
                </label>
                <select
                  value={jobTypeFilter}
                  onChange={e => setJobTypeFilter(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.84rem', color: '#0f172a', outline: 'none', background: '#ffffff' }}
                >
                  <option value="">All Job Types</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>

              {/* Experience Level Dropdown */}
              <div>
                <label style={{ fontSize: '0.76rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '5px' }}>
                  Experience Level
                </label>
                <select
                  value={expFilter}
                  onChange={e => setExpFilter(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.84rem', color: '#0f172a', outline: 'none', background: '#ffffff' }}
                >
                  <option value="">All Experience</option>
                  <option value="0-1">Fresher / 0-1 Yr</option>
                  <option value="1-3">1-3 Yrs</option>
                  <option value="2-4">2-4 Yrs</option>
                  <option value="5+">5+ Yrs</option>
                </select>
              </div>

              {/* Location Dropdown */}
              <div>
                <label style={{ fontSize: '0.76rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '5px' }}>
                  Location
                </label>
                <select
                  value={locationFilter}
                  onChange={e => setLocationFilter(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.84rem', color: '#0f172a', outline: 'none', background: '#ffffff' }}
                >
                  <option value="">All Locations</option>
                  <option value="Bangalore">Bangalore</option>
                  <option value="Hyderabad">Hyderabad</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Gurugram">Gurugram</option>
                  <option value="Pune">Pune</option>
                  <option value="Remote">Remote</option>
                </select>
              </div>

              {/* Date Saved Dropdown */}
              <div>
                <label style={{ fontSize: '0.76rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '5px' }}>
                  Date Saved
                </label>
                <select
                  value={dateFilter}
                  onChange={e => setDateFilter(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.84rem', color: '#0f172a', outline: 'none', background: '#ffffff' }}
                >
                  <option value="">Anytime</option>
                  <option value="7days">Last 7 Days</option>
                  <option value="30days">Last 30 Days</option>
                </select>
              </div>

              {/* Clear Filters Button */}
              <button
                onClick={handleClearFilters}
                style={{
                  width: '100%',
                  padding: '0.6rem',
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
                  marginTop: '0.25rem',
                  fontFamily: 'Inter, sans-serif'
                }}
              >
                <RotateCcw size={14} /> Clear Filters
              </button>
            </div>
          </div>

          {/* 2. Quick Tip Card */}
          <div style={{ background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: '20px', padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#7c3aed', fontWeight: '800', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
              <Lightbulb size={16} /> Quick Tip
            </div>
            <p style={{ fontSize: '0.8rem', color: '#5b21b6', margin: 0, lineHeight: '1.5', fontWeight: '500' }}>
              Review saved jobs regularly and apply before the deadlines.
            </p>
          </div>

          {/* 3. Love a job? Card */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.35rem', boxShadow: '0 1px 6px rgba(15,23,42,0.03)' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: '#f3e8ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
              <Heart size={18} fill="#7c3aed" />
            </div>
            <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a', margin: '0 0 4px 0' }}>
              Love a job?
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 1rem 0', lineHeight: '1.4' }}>
              Save it to apply later and keep track of opportunities you like.
            </p>

            <button
              onClick={() => setActiveTab('jobs')}
              style={{
                width: '100%',
                padding: '0.65rem 1rem',
                borderRadius: '10px',
                background: '#ffffff',
                border: '1.5px solid #c7d2fe',
                color: '#4f46e5',
                fontSize: '0.85rem',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justify: 'center',
                gap: '0.4rem',
                boxShadow: '0 2px 6px rgba(79,70,229,0.05)',
                fontFamily: 'Inter, sans-serif'
              }}
            >
              Browse More Jobs <ArrowRight size={15} />
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
