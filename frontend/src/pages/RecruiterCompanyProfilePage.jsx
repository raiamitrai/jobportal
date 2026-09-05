import React, { useState } from 'react';
import {
  Building,
  Globe,
  MapPin,
  Users,
  Calendar,
  Upload,
  CheckCircle2,
  Trophy,
  Save,
  Check,
  Plus,
  Linkedin,
  Twitter,
  Instagram,
  Facebook,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  X,
  Edit3
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function RecruiterCompanyProfilePage() {
  const { user } = useAuth();
  const userEmail = (user?.email || '').toLowerCase().trim();
  const userKey = userEmail || 'guest';

  // Active Sub-Tab: 'info' | 'branding' | 'social' | 'team'
  const [activeSubTab, setActiveSubTab] = useState('info');
  const [savedSuccess, setSavedSuccess] = useState('');

  // Form State (Clean & User-Scoped, no hardcoded TechNova dummy data)
  const [companyForm, setCompanyForm] = useState(() => {
    try {
      const saved = localStorage.getItem(`careonix_comp_profile_${userKey}`);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {}
    return {
      name: user?.company || '',
      industry: '',
      companySize: '',
      yearFounded: '',
      location: '',
      website: '',
      tagline: '',
      description: '',
      companyType: 'Private Limited',
      logoUrl: null,
      coverUrl: null,
      linkedin: '',
      twitter: '',
      instagram: '',
      facebook: ''
    };
  });

  // Team Members List (Scoped to current recruiter)
  const [teamMembers, setTeamMembers] = useState(() => {
    try {
      const saved = localStorage.getItem(`careonix_comp_team_${userKey}`);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {}
    return [
      { name: user?.name || 'Recruiter', role: 'Lead Recruiter & Hiring Manager', email: user?.email || 'recruiter@careonix.com', status: 'Owner' }
    ];
  });

  const [newMember, setNewMember] = useState({ name: '', role: '', email: '' });
  const [showAddTeamModal, setShowAddTeamModal] = useState(false);

  const handleSave = (e) => {
    if (e) e.preventDefault();
    if (userKey && userKey !== 'guest') {
      localStorage.setItem(`careonix_comp_profile_${userKey}`, JSON.stringify(companyForm));
      localStorage.setItem(`careonix_comp_team_${userKey}`, JSON.stringify(teamMembers));
    }
    setSavedSuccess('🎉 Company public profile updated successfully!');
    setTimeout(() => setSavedSuccess(''), 3000);
  };

  const handleAddMember = (e) => {
    e.preventDefault();
    if (!newMember.name || !newMember.email) return;
    const updated = [...teamMembers, { ...newMember, status: 'Active' }];
    setTeamMembers(updated);
    if (userKey && userKey !== 'guest') {
      localStorage.setItem(`careonix_comp_team_${userKey}`, JSON.stringify(updated));
    }
    setNewMember({ name: '', role: '', email: '' });
    setShowAddTeamModal(false);
    setSavedSuccess('🎉 New team member added successfully!');
    setTimeout(() => setSavedSuccess(''), 3000);
  };

  // Real Dynamic Profile Completion Calculation
  const completionItems = [
    { label: 'Basic Information', done: Boolean(companyForm.name && companyForm.location) },
    { label: 'Company Description', done: Boolean(companyForm.description && companyForm.description.trim()) },
    { label: 'Company Logo', done: Boolean(companyForm.logoUrl) },
    { label: 'Cover Image', done: Boolean(companyForm.coverUrl) },
    { label: 'Social Links', done: Boolean(companyForm.linkedin || companyForm.website) },
    { label: 'Team Members', done: teamMembers.length > 0 }
  ];
  const completedCount = completionItems.filter(i => i.done).length;
  const completionPercentage = Math.round((completedCount / completionItems.length) * 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', background: '#f8fafc', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      
      {/* Toast Saved Alert */}
      {savedSuccess && (
        <div style={{
          position: 'fixed', top: '24px', right: '24px', background: '#10b981', color: '#ffffff',
          padding: '0.9rem 1.4rem', borderRadius: '14px', boxShadow: '0 10px 25px rgba(16,185,129,0.3)',
          display: 'flex', alignItems: 'center', gap: '0.6rem', zIndex: 300, fontWeight: '700', fontSize: '0.9rem'
        }}>
          <CheckCircle2 size={20} />
          <span>{savedSuccess}</span>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
            Company Profile
          </h1>
          <p style={{ color: '#64748b', marginTop: '4px', fontSize: '0.9rem' }}>
            Manage your company information that candidates see on CAREONIX.
          </p>
        </div>

        <button
          onClick={handleSave}
          style={{
            background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
            color: '#ffffff', border: 'none', borderRadius: '12px',
            padding: '0.75rem 1.5rem', fontWeight: '800', fontSize: '0.9rem',
            display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(79,70,229,0.25)'
          }}
        >
          <Save size={16} /> Save Changes
        </button>
      </div>

      {/* Navigation Sub-Tabs */}
      <div style={{ display: 'flex', gap: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.1rem' }}>
        {[
          { id: 'info', label: 'Company Information' },
          { id: 'branding', label: 'Branding' },
          { id: 'social', label: 'Social Links' },
          { id: 'team', label: 'Team Members' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id)}
            style={{
              background: 'none', border: 'none', padding: '0.65rem 0',
              color: activeSubTab === tab.id ? '#6366f1' : '#64748b',
              fontWeight: activeSubTab === tab.id ? '800' : '600',
              fontSize: '0.92rem', cursor: 'pointer',
              borderBottom: activeSubTab === tab.id ? '2.5px solid #6366f1' : '2.5px solid transparent',
              transition: 'all 0.15s ease'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main 2-Column Grid Layout (Matching Screenshot 100%) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.75rem', alignItems: 'flex-start' }}>

        {/* Left Column: Form Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* TAB 1: Company Information */}
          {activeSubTab === 'info' && (
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* Basic Information Card */}
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.75rem', boxShadow: '0 1px 4px rgba(15,23,42,0.02)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Basic Information</h3>
                  <p style={{ fontSize: '0.84rem', color: '#64748b', marginTop: '3px', margin: 0 }}>Update your company details and tell candidates about your organization.</p>
                </div>

                {/* Row 1: Company Name + Industry */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#0f172a', display: 'block', marginBottom: '6px' }}>
                      Company Name <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={companyForm.name}
                      onChange={e => setCompanyForm({ ...companyForm, name: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.88rem', fontFamily: 'Inter, sans-serif' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#0f172a', display: 'block', marginBottom: '6px' }}>
                      Industry <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    <select
                      value={companyForm.industry}
                      onChange={e => setCompanyForm({ ...companyForm, industry: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.88rem', fontFamily: 'Inter, sans-serif', background: '#ffffff' }}
                    >
                      <option>Information Technology & Services</option>
                      <option>Software Product & SaaS</option>
                      <option>Financial Services & Fintech</option>
                      <option>E-commerce & Retail</option>
                      <option>Healthcare & Biotech</option>
                    </select>
                  </div>
                </div>

                {/* Row 2: Company Size + Year Founded */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#0f172a', display: 'block', marginBottom: '6px' }}>Company Size</label>
                    <select
                      value={companyForm.companySize}
                      onChange={e => setCompanyForm({ ...companyForm, companySize: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.88rem', fontFamily: 'Inter, sans-serif', background: '#ffffff' }}
                    >
                      <option>1 – 10 employees</option>
                      <option>11 – 50 employees</option>
                      <option>51 – 200 employees</option>
                      <option>201 – 500 employees</option>
                      <option>500+ employees</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#0f172a', display: 'block', marginBottom: '6px' }}>Year Founded</label>
                    <input
                      type="text"
                      value={companyForm.yearFounded}
                      onChange={e => setCompanyForm({ ...companyForm, yearFounded: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.88rem', fontFamily: 'Inter, sans-serif' }}
                    />
                  </div>
                </div>

                {/* Row 3: Headquarters Location + Company Website */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#0f172a', display: 'block', marginBottom: '6px' }}>
                      Headquarters Location <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <MapPin size={17} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                      <input
                        type="text"
                        required
                        value={companyForm.location}
                        onChange={e => setCompanyForm({ ...companyForm, location: e.target.value })}
                        style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.4rem', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.88rem', fontFamily: 'Inter, sans-serif' }}
                      />
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#0f172a', display: 'block', marginBottom: '6px' }}>Company Website</label>
                    <div style={{ position: 'relative' }}>
                      <Globe size={17} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                      <input
                        type="url"
                        value={companyForm.website}
                        onChange={e => setCompanyForm({ ...companyForm, website: e.target.value })}
                        style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.4rem', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.88rem', fontFamily: 'Inter, sans-serif' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Row 4: Company Tagline */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#0f172a' }}>Company Tagline</label>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{companyForm.tagline.length}/100</span>
                  </div>
                  <input
                    type="text"
                    value={companyForm.tagline}
                    onChange={e => setCompanyForm({ ...companyForm, tagline: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.88rem', fontFamily: 'Inter, sans-serif' }}
                  />
                </div>

                {/* Row 5: Company Description (Rich Text Field) */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#0f172a' }}>
                      Company Description <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{companyForm.description.length}/1000</span>
                  </div>

                  {/* Rich Text Toolbar */}
                  <div style={{ border: '1px solid #cbd5e1', borderRadius: '12px', overflow: 'hidden' }}>
                    <div style={{ background: '#f8fafc', padding: '0.45rem 0.75rem', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <button type="button" style={{ background: 'none', border: 'none', padding: '4px', cursor: 'pointer', color: '#475569' }}><Bold size={15} /></button>
                      <button type="button" style={{ background: 'none', border: 'none', padding: '4px', cursor: 'pointer', color: '#475569' }}><Italic size={15} /></button>
                      <button type="button" style={{ background: 'none', border: 'none', padding: '4px', cursor: 'pointer', color: '#475569' }}><Underline size={15} /></button>
                      <div style={{ width: '1px', height: '16px', background: '#cbd5e1' }} />
                      <button type="button" style={{ background: 'none', border: 'none', padding: '4px', cursor: 'pointer', color: '#475569' }}><List size={15} /></button>
                      <button type="button" style={{ background: 'none', border: 'none', padding: '4px', cursor: 'pointer', color: '#475569' }}><ListOrdered size={15} /></button>
                      <button type="button" style={{ background: 'none', border: 'none', padding: '4px', cursor: 'pointer', color: '#475569' }}><Link size={15} /></button>
                    </div>

                    <textarea
                      required
                      rows={5}
                      value={companyForm.description}
                      onChange={e => setCompanyForm({ ...companyForm, description: e.target.value })}
                      style={{ width: '100%', padding: '0.85rem 1rem', border: 'none', outline: 'none', fontSize: '0.88rem', fontFamily: 'Inter, sans-serif', color: '#0f172a', resize: 'vertical' }}
                    />
                  </div>
                </div>

                {/* Row 6: Company Type Radio Choices */}
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#0f172a', display: 'block', marginBottom: '8px' }}>Company Type</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    {['Private Limited', 'Public Limited', 'Partnership', 'Others'].map(type => (
                      <label key={type} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.86rem', color: '#334155', cursor: 'pointer', fontWeight: '600' }}>
                        <input
                          type="radio"
                          name="companyType"
                          checked={companyForm.companyType === type}
                          onChange={() => setCompanyForm({ ...companyForm, companyType: type })}
                          style={{ accentColor: '#6366f1' }}
                        />
                        <span>{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

              </div>

              {/* Work Culture (Optional) Card (Matching Screenshot 100%) */}
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.75rem', boxShadow: '0 1px 4px rgba(15,23,42,0.02)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Work Culture (Optional)</h3>
                  <p style={{ fontSize: '0.84rem', color: '#64748b', marginTop: '3px', margin: 0 }}>Add images that represent your work environment and culture.</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem' }}>
                  {/* Photo 1 */}
                  <img
                    src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=300&auto=format&fit=crop&q=80"
                    alt="Work Culture 1"
                    style={{ width: '100%', height: '90px', borderRadius: '14px', objectFit: 'cover', border: '1px solid #e2e8f0' }}
                  />
                  {/* Photo 2 */}
                  <img
                    src="https://images.unsplash.com/photo-1531482615713-2afd69097998?w=300&auto=format&fit=crop&q=80"
                    alt="Work Culture 2"
                    style={{ width: '100%', height: '90px', borderRadius: '14px', objectFit: 'cover', border: '1px solid #e2e8f0' }}
                  />
                  {/* Photo 3 */}
                  <img
                    src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=300&auto=format&fit=crop&q=80"
                    alt="Work Culture 3"
                    style={{ width: '100%', height: '90px', borderRadius: '14px', objectFit: 'cover', border: '1px solid #e2e8f0' }}
                  />
                  {/* Photo 4 */}
                  <img
                    src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=300&auto=format&fit=crop&q=80"
                    alt="Work Culture 4"
                    style={{ width: '100%', height: '90px', borderRadius: '14px', objectFit: 'cover', border: '1px solid #e2e8f0' }}
                  />

                  {/* Upload More Box */}
                  <div
                    onClick={() => handleSave()}
                    style={{
                      border: '2px dashed #c084fc', background: '#faf5ff', borderRadius: '14px',
                      height: '90px', display: 'flex', flexDirection: 'column', alignItems: 'center',
                      justify: 'center', gap: '4px', cursor: 'pointer', color: '#7c3aed'
                    }}
                  >
                    <Upload size={20} />
                    <span style={{ fontSize: '0.72rem', fontWeight: '800' }}>Upload More</span>
                  </div>
                </div>

              </div>

            </form>
          )}

          {/* TAB 2: Branding (Logo & Banner Upload) */}
          {activeSubTab === 'branding' && (
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.75rem', boxShadow: '0 1px 4px rgba(15,23,42,0.02)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Company Branding & Assets</h3>
                <p style={{ fontSize: '0.84rem', color: '#64748b', marginTop: '3px', margin: 0 }}>Upload high-resolution logos and cover banners for candidates to recognize your brand.</p>
              </div>

              {/* Logo Upload Box */}
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: '700', color: '#0f172a', display: 'block', marginBottom: '8px' }}>Company Logo</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', border: '1px dashed #cbd5e1', padding: '1.25rem', borderRadius: '16px', background: '#f8fafc' }}>
                  <div style={{ width: '72px', height: '72px', borderRadius: '16px', background: '#6366f1', color: '#ffffff', fontSize: '1.8rem', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    T
                  </div>
                  <div>
                    <button onClick={handleSave} style={{ background: '#ffffff', border: '1px solid #cbd5e1', padding: '0.5rem 1rem', borderRadius: '10px', fontSize: '0.84rem', fontWeight: '700', cursor: 'pointer', color: '#334155', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <Upload size={15} /> Change Logo Image
                    </button>
                    <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '6px' }}>Recommended 400x400px, PNG or JPG (max 2MB)</div>
                  </div>
                </div>
              </div>

              {/* Banner Upload Box */}
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: '700', color: '#0f172a', display: 'block', marginBottom: '8px' }}>Cover Banner Image</label>
                <div style={{ height: '140px', border: '1px dashed #cbd5e1', borderRadius: '16px', background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#ffffff', gap: '8px', cursor: 'pointer' }} onClick={handleSave}>
                  <Upload size={24} />
                  <span style={{ fontSize: '0.86rem', fontWeight: '700' }}>Click to Upload New Banner Image</span>
                  <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>1200x300px recommended banner resolution</span>
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: Social Links */}
          {activeSubTab === 'social' && (
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.75rem', boxShadow: '0 1px 4px rgba(15,23,42,0.02)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Social Media Handles</h3>
                <p style={{ fontSize: '0.84rem', color: '#64748b', marginTop: '3px', margin: 0 }}>Connect your official social media pages for candidates to follow your updates.</p>
              </div>

              {/* LinkedIn */}
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <Linkedin size={16} color="#0a66c2" /> LinkedIn Profile URL
                </label>
                <input
                  type="url"
                  value={companyForm.linkedin}
                  onChange={e => setCompanyForm({ ...companyForm, linkedin: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                />
              </div>

              {/* Twitter / X */}
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <Twitter size={16} color="#1da1f2" /> X (Twitter) Handle URL
                </label>
                <input
                  type="url"
                  value={companyForm.twitter}
                  onChange={e => setCompanyForm({ ...companyForm, twitter: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                />
              </div>

              {/* Instagram */}
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <Instagram size={16} color="#e1306c" /> Instagram Profile URL
                </label>
                <input
                  type="url"
                  value={companyForm.instagram}
                  onChange={e => setCompanyForm({ ...companyForm, instagram: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                />
              </div>

            </div>
          )}

          {/* TAB 4: Team Members */}
          {activeSubTab === 'team' && (
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.75rem', boxShadow: '0 1px 4px rgba(15,23,42,0.02)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Company Recruiters & Team</h3>
                  <p style={{ fontSize: '0.84rem', color: '#64748b', marginTop: '3px', margin: 0 }}>Manage authorized recruiters and team members for TechNova Solutions.</p>
                </div>
                <button
                  onClick={() => setShowAddTeamModal(true)}
                  style={{ background: '#6366f1', color: '#ffffff', border: 'none', borderRadius: '10px', padding: '0.55rem 1.1rem', fontWeight: '700', fontSize: '0.84rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <Plus size={16} /> Add Team Member
                </button>
              </div>

              {/* Members Table */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {teamMembers.map((m, i) => (
                  <div key={i} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#e0e7ff', color: '#4f46e5', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>
                        {m.name.charAt(0)}
                      </div>
                      <div>
                        <strong style={{ fontSize: '0.92rem', color: '#0f172a', display: 'block' }}>{m.name}</strong>
                        <span style={{ fontSize: '0.78rem', color: '#64748b' }}>{m.role} &bull; {m.email}</span>
                      </div>
                    </div>
                    <span style={{ background: m.status === 'Owner' ? '#dcfce7' : '#eff6ff', color: m.status === 'Owner' ? '#15803d' : '#2563eb', padding: '4px 12px', borderRadius: '12px', fontSize: '0.76rem', fontWeight: '700' }}>
                      {m.status}
                    </span>
                  </div>
                ))}
              </div>

            </div>
          )}

        </div>

        {/* Right Column: Live Company Preview & Profile Completion Widget (100% Matching Screenshot) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Card 1: Company Preview Card */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.35rem', boxShadow: '0 1px 4px rgba(15,23,42,0.02)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            <div>
              <h3 style={{ fontSize: '0.98rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Company Preview</h3>
              <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '2px 0 0 0' }}>This is how candidates will see your company profile.</p>
            </div>

            {/* Live Card Mockup */}
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '18px', overflow: 'hidden', background: '#ffffff', boxShadow: '0 4px 12px rgba(15,23,42,0.03)' }}>
              
              {/* Dark Banner Background */}
              <div style={{ height: '90px', background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)', position: 'relative' }}>
                <div style={{ position: 'absolute', inset: 0, opacity: 0.15, backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '12px 12px' }} />
              </div>

              {/* Logo & Info */}
              <div style={{ padding: '0 1.25rem 1.25rem 1.25rem', marginTop: '-32px', position: 'relative' }}>
                
                {/* Purple Logo Badge */}
                <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: '#ffffff', border: '3px solid #ffffff', boxShadow: '0 4px 14px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#6366f1', color: '#ffffff', fontSize: '1.6rem', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    T
                  </div>
                </div>

                {/* Company Name */}
                <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                  {companyForm.name}
                </h4>

                <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '600', marginTop: '2px' }}>
                  {companyForm.industry}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.76rem', color: '#64748b', marginTop: '6px', flexWrap: 'wrap' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <MapPin size={13} color="#94a3b8" /> {companyForm.location.split(',')[0]}
                  </span>
                  <span>&bull;</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <Users size={13} color="#94a3b8" /> {companyForm.companySize}
                  </span>
                </div>

                {/* Tagline */}
                <div style={{ fontSize: '0.8rem', color: '#4f46e5', fontWeight: '700', marginTop: '0.75rem', fontStyle: 'italic' }}>
                  "{companyForm.tagline}"
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '0.85rem', paddingTop: '0.85rem', borderTop: '1px solid #f1f5f9', fontSize: '0.78rem', color: '#475569' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Building size={14} color="#94a3b8" />
                    <span>Founded in {companyForm.yearFounded}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Globe size={14} color="#94a3b8" />
                    <a href={companyForm.website} target="_blank" rel="noreferrer" style={{ color: '#6366f1', textDecoration: 'none', fontWeight: '600' }}>
                      {companyForm.website}
                    </a>
                  </div>
                </div>

              </div>

            </div>

          </div>

          {/* Card 2: Why Company Profile is Important? */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.35rem', boxShadow: '0 1px 4px rgba(15,23,42,0.02)' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0f172a', margin: '0 0 0.85rem 0' }}>
              Why Company Profile is Important?
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.8rem', color: '#334155' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <CheckCircle2 size={16} color="#22c55e" style={{ flexShrink: 0, marginTop: '1px' }} />
                <span>Build trust with candidates by showcasing your company.</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <CheckCircle2 size={16} color="#22c55e" style={{ flexShrink: 0, marginTop: '1px' }} />
                <span>Help candidates understand your culture and values.</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <CheckCircle2 size={16} color="#22c55e" style={{ flexShrink: 0, marginTop: '1px' }} />
                <span>Increase job post engagement and applications.</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <CheckCircle2 size={16} color="#22c55e" style={{ flexShrink: 0, marginTop: '1px' }} />
                <span>Attract the right talent for your organization.</span>
              </div>
            </div>
          </div>

          {/* Card 3: Profile Completion Widget (Matching Screenshot 100%) */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.35rem', boxShadow: '0 1px 4px rgba(15,23,42,0.02)', display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Profile Completion</h3>
              <span style={{ fontSize: '0.82rem', fontWeight: '800', color: '#6366f1' }}>{completionPercentage}% Complete</span>
            </div>

            {/* Purple Progress Bar */}
            <div style={{ width: '100%', height: '8px', background: '#f1f5f9', borderRadius: '10px', overflow: 'hidden' }}>
              <div style={{ width: `${completionPercentage}%`, height: '100%', background: 'linear-gradient(90deg, #6366f1, #a855f7)', borderRadius: '10px' }} />
            </div>

            {/* Checklist */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
              {completionItems.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: item.done ? '#0f172a' : '#94a3b8', fontWeight: item.done ? '700' : '500' }}>
                  {item.done ? (
                    <CheckCircle2 size={15} color="#22c55e" />
                  ) : (
                    <div style={{ width: '13px', height: '13px', borderRadius: '50%', border: '1.5px solid #cbd5e1' }} />
                  )}
                  <span>{item.label}</span>
                </div>
              ))}
            </div>

            {/* Great Job Banner Box */}
            <div style={{ background: '#faf5ff', border: '1px solid #f3e8ff', borderRadius: '16px', padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: '#ede9fe', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Trophy size={22} />
              </div>
              <div>
                <strong style={{ fontSize: '0.88rem', color: '#0f172a', display: 'block' }}>Great Job!</strong>
                <span style={{ fontSize: '0.76rem', color: '#64748b' }}>Your company profile looks awesome.</span>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* MODAL: Add Team Member Modal */}
      {showAddTeamModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: '1rem' }}>
          <div style={{ width: '480px', background: '#ffffff', borderRadius: '24px', padding: '1.75rem', boxShadow: '0 25px 60px rgba(15,23,42,0.2)', border: '1px solid #e2e8f0' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Add Recruiter / Team Member</h3>
              <button onClick={() => setShowAddTeamModal(false)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={18} color="#64748b" />
              </button>
            </div>

            <form onSubmit={handleAddMember} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ananya Sharma"
                  value={newMember.name}
                  onChange={e => setNewMember({ ...newMember, name: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>Role / Designation *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Technical Recruiter"
                  value={newMember.role}
                  onChange={e => setNewMember({ ...newMember, role: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>Work Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="ananya@technova.com"
                  value={newMember.email}
                  onChange={e => setNewMember({ ...newMember, email: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowAddTeamModal(false)} style={{ padding: '0.7rem 1.3rem', borderRadius: '10px', background: '#f1f5f9', border: 'none', color: '#475569', fontWeight: '700', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" style={{ padding: '0.7rem 1.5rem', borderRadius: '10px', background: '#6366f1', color: '#ffffff', border: 'none', fontWeight: '800', cursor: 'pointer' }}>
                  Add Member
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
