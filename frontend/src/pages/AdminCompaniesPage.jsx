import React, { useState, useEffect } from 'react';
import {
  Building,
  Users,
  Search,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Mail,
  Clock,
  Check,
  X,
  AlertTriangle,
  Plus,
  Download,
  Filter,
  Eye,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Globe,
  Phone,
  Ban,
  Briefcase
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AdminCompaniesPage() {
  const { user, registeredUsers, approveRecruiter, setRecruiterPending, rejectRecruiter, deleteUserAccount } = useAuth();
  
  // Tabs & Filter states
  const [activeTab, setActiveTab] = useState('All Companies'); // 'All Companies' | 'Pending Approval' | 'Verified Companies' | 'Rejected Companies' | 'Blocked Companies'
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [industryFilter, setIndustryFilter] = useState('All Industries');

  // Modals & Action States
  const [showAddCompanyModal, setShowAddCompanyModal] = useState(false);
  const [selectedCompanyView, setSelectedCompanyView] = useState(null);
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  const [toastMsg, setToastMsg] = useState('');

  // Close active action dropdowns on click anywhere outside on screen
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.action-menu-container')) {
        setActiveDropdownId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Add Company Form State
  const [newCompName, setNewCompName] = useState('');
  const [newCompIndustry, setNewCompIndustry] = useState('IT Services');
  const [newCompContact, setNewCompContact] = useState('');
  const [newCompPhone, setNewCompPhone] = useState('');
  const [newCompEmail, setNewCompEmail] = useState('');
  const [newCompDomain, setNewCompDomain] = useState('');

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const defaultCompanies = [];

  const [companiesList, setCompaniesList] = useState([]);

  useEffect(() => {
    if (Array.isArray(registeredUsers)) {
      const recruiters = registeredUsers.filter(u => u.accountType === 'recruiter' || u.company);
      const realCompanies = recruiters.map((r, idx) => {
        const compName = r.company || (r.name ? `${r.name}'s Organization` : 'Employer');
        const domain = r.email ? (r.email.split('@')[1] || 'careonix.com') : 'company.com';
        return {
          id: `comp_${idx + 1}`,
          name: compName,
          domain: domain,
          industry: 'IT Services / Technology',
          contactPerson: r.name || 'Hiring Lead',
          phone: r.phone || '+91 98000 11223',
          email: r.email || r.identifier,
          status: r.approvalStatus === 'APPROVED' ? 'Verified' : (r.approvalStatus === 'REJECTED' ? 'Rejected' : 'Pending'),
          regDate: 'Recently',
          avatarBg: '#6366f1'
        };
      });
      setCompaniesList(realCompanies);
    }

    const handleUserDeleted = (e) => {
      const delEmail = (e?.detail?.email || '').toLowerCase().trim();
      if (delEmail) {
        setCompaniesList(prev => prev.filter(c => (c.email || '').toLowerCase().trim() !== delEmail));
      }
    };
    window.addEventListener('careonix_user_deleted', handleUserDeleted);
    return () => window.removeEventListener('careonix_user_deleted', handleUserDeleted);
  }, [registeredUsers]);

  // Filtered Companies List
  const filteredCompanies = companiesList.filter(c => {
    if (activeTab === 'Pending Approval' && c.status !== 'Pending') return false;
    if (activeTab === 'Verified Companies' && c.status !== 'Verified') return false;
    if (activeTab === 'Rejected Companies' && c.status !== 'Rejected') return false;
    if (activeTab === 'Blocked Companies' && c.status !== 'Blocked') return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = c.name.toLowerCase().includes(q);
      const matchDomain = c.domain.toLowerCase().includes(q);
      const matchContact = c.contactPerson.toLowerCase().includes(q);
      const matchEmail = c.email.toLowerCase().includes(q);
      if (!matchName && !matchDomain && !matchContact && !matchEmail) return false;
    }

    if (statusFilter !== 'All Status' && c.status !== statusFilter) return false;
    if (industryFilter !== 'All Industries' && c.industry !== industryFilter) return false;

    return true;
  });

  const handleAddCompanySubmit = (e) => {
    e.preventDefault();
    if (!newCompName || !newCompEmail) return;

    const newCompany = {
      id: `c_${Date.now()}`,
      name: newCompName,
      domain: newCompDomain || `${newCompName.toLowerCase().replace(/\s+/g, '')}.com`,
      industry: newCompIndustry,
      contactPerson: newCompContact || 'Admin Manager',
      phone: newCompPhone || '+91 98765 00000',
      email: newCompEmail,
      status: 'Pending',
      regDate: 'Just Now',
      avatarBg: '#6366f1'
    };

    setCompaniesList([newCompany, ...companiesList]);
    setShowAddCompanyModal(false);
    setNewCompName('');
    setNewCompEmail('');
    setNewCompPhone('');
    setNewCompDomain('');
    triggerToast(`🎉 New company "${newCompName}" submitted for approval!`);
  };

  const handleApproveCompany = (compKey, name, email) => {
    if (email) {
      approveRecruiter(email);
    }
    setCompaniesList(prev => prev.map(c => c.id === compKey ? { ...c, status: 'Verified' } : c));
    setActiveDropdownId(null);
    triggerToast(`🛡️ Company "${name}" has been verified successfully!`);
  };

  const handleMoveUnderReview = (compKey, name, email) => {
    if (email) {
      setRecruiterPending(email);
    }
    setCompaniesList(prev => prev.map(c => c.id === compKey ? { ...c, status: 'Pending' } : c));
    setActiveDropdownId(null);
    triggerToast(`🔍 Company "${name}" moved to Under Review.`);
  };

  const handleRejectCompany = (compKey, name, email) => {
    if (email) {
      rejectRecruiter(email);
    }
    setCompaniesList(prev => prev.map(c => c.id === compKey ? { ...c, status: 'Rejected' } : c));
    setActiveDropdownId(null);
    triggerToast(`❌ Company "${name}" rejected.`);
  };

  const handleBlockCompany = (compKey, name) => {
    setCompaniesList(prev => prev.map(c => c.id === compKey ? { ...c, status: 'Blocked' } : c));
    setActiveDropdownId(null);
    triggerToast(`🚫 Company "${name}" blocked.`);
  };

  const handleDeleteCompany = (compKey, name, email) => {
    if (window.confirm(`Permanently delete company "${name}" and all associated jobs, applications, and accounts?`)) {
      if (email) {
        deleteUserAccount(email);
      }
      setCompaniesList(prev => prev.filter(c => c.id !== compKey));
      setActiveDropdownId(null);
      triggerToast(`🗑️ Company "${name}" and related data permanently deleted.`);
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
          Dashboard &gt; Companies &gt; All Companies
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
              Companies
            </h1>
            <p style={{ color: '#64748b', marginTop: '4px', fontSize: '0.9rem' }}>
              Manage all registered companies on the platform.
            </p>
          </div>

          {/* Action Buttons: Add Company & Export */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={() => setShowAddCompanyModal(true)}
              style={{
                background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                color: '#ffffff', border: 'none', borderRadius: '12px',
                padding: '0.65rem 1.25rem', fontWeight: '800', fontSize: '0.86rem',
                display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(79,70,229,0.25)'
              }}
            >
              <Plus size={18} /> Add Company
            </button>

            <button
              onClick={() => triggerToast('Exporting Registered Companies CSV...')}
              style={{
                background: '#ffffff', color: '#334155', border: '1px solid #cbd5e1',
                borderRadius: '12px', padding: '0.65rem 1.25rem', fontWeight: '700',
                fontSize: '0.86rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
                cursor: 'pointer'
              }}
            >
              <Download size={16} /> Export
            </button>
          </div>
        </div>
      </div>

      {/* ── TOP KPI ROW (5 Metric Cards Real Data) ────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem' }}>
        
        {/* Card 1: Total Companies */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '18px', padding: '1.25rem', boxShadow: '0 1px 4px rgba(15,23,42,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: '#f3e8ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Building size={18} />
            </div>
            <div>
              <span style={{ fontSize: '0.76rem', fontWeight: '700', color: '#64748b', display: 'block' }}>Total Companies</span>
              <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', lineHeight: 1.1 }}>{companiesList.length}</div>
            </div>
          </div>
        </div>

        {/* Card 2: Verified Companies */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '18px', padding: '1.25rem', boxShadow: '0 1px 4px rgba(15,23,42,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={18} />
            </div>
            <div>
              <span style={{ fontSize: '0.76rem', fontWeight: '700', color: '#64748b', display: 'block' }}>Verified Companies</span>
              <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', lineHeight: 1.1 }}>
                {companiesList.filter(c => c.status === 'Verified').length}
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Pending Approval */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '18px', padding: '1.25rem', boxShadow: '0 1px 4px rgba(15,23,42,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: '#fff7ed', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={18} />
            </div>
            <div>
              <span style={{ fontSize: '0.76rem', fontWeight: '700', color: '#64748b', display: 'block' }}>Pending Approval</span>
              <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', lineHeight: 1.1 }}>
                {companiesList.filter(c => c.status === 'Pending').length}
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: Rejected Companies */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '18px', padding: '1.25rem', boxShadow: '0 1px 4px rgba(15,23,42,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: '#fef2f2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <XCircle size={18} />
            </div>
            <div>
              <span style={{ fontSize: '0.76rem', fontWeight: '700', color: '#64748b', display: 'block' }}>Rejected Companies</span>
              <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', lineHeight: 1.1 }}>
                {companiesList.filter(c => c.status === 'Rejected').length}
              </div>
            </div>
          </div>
        </div>

        {/* Card 5: Blocked Companies */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '18px', padding: '1.25rem', boxShadow: '0 1px 4px rgba(15,23,42,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Ban size={18} />
            </div>
            <div>
              <span style={{ fontSize: '0.76rem', fontWeight: '700', color: '#64748b', display: 'block' }}>Blocked Companies</span>
              <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', lineHeight: 1.1 }}>
                {companiesList.filter(c => c.status === 'Blocked').length}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ── SEARCH & FILTER CONTROLS BAR ────────────────────────────────────── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
        
        {/* Left: Search Bar */}
        <div style={{ position: 'relative', width: '380px' }}>
          <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Search by company name, email or domain..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '0.65rem 1rem 0.65rem 2.5rem', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.86rem', outline: 'none', background: '#ffffff' }}
          />
        </div>

        {/* Right Filter Dropdowns */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          
          <div>
            <span style={{ fontSize: '0.72rem', fontWeight: '700', color: '#64748b', display: 'block', marginBottom: '2px' }}>Status</span>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              style={{ padding: '0.55rem 0.85rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.82rem', background: '#ffffff', fontWeight: '700', color: '#0f172a' }}
            >
              <option value="All Status">All Status</option>
              <option value="Verified">Verified</option>
              <option value="Pending">Pending</option>
              <option value="Rejected">Rejected</option>
              <option value="Blocked">Blocked</option>
            </select>
          </div>

          <div>
            <span style={{ fontSize: '0.72rem', fontWeight: '700', color: '#64748b', display: 'block', marginBottom: '2px' }}>Industry</span>
            <select
              value={industryFilter}
              onChange={e => setIndustryFilter(e.target.value)}
              style={{ padding: '0.55rem 0.85rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.82rem', background: '#ffffff', fontWeight: '700', color: '#0f172a' }}
            >
              <option value="All Industries">All Industries</option>
              <option value="IT Services">IT Services</option>
              <option value="Software">Software</option>
              <option value="Education">Education</option>
              <option value="Design">Design</option>
              <option value="BPO">BPO</option>
            </select>
          </div>

          <div>
            <span style={{ fontSize: '0.72rem', fontWeight: '700', color: '#64748b', display: 'block', marginBottom: '2px' }}>Registered On</span>
            <select
              style={{ padding: '0.55rem 0.85rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.82rem', background: '#ffffff', fontWeight: '700', color: '#0f172a' }}
            >
              <option value="Select Date">Select Date</option>
              <option value="Last 7 Days">Last 7 Days</option>
              <option value="Last 30 Days">Last 30 Days</option>
            </select>
          </div>

          <button
            onClick={() => triggerToast('Advanced Company Filters Applied')}
            style={{ marginTop: '16px', background: '#ffffff', border: '1px solid #818cf8', color: '#4f46e5', borderRadius: '10px', padding: '0.55rem 1rem', fontSize: '0.82rem', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
          >
            <Filter size={15} /> Filters
          </button>

        </div>

      </div>

      {/* ── MAIN DATA TABLE CARD ───────────────────────────────────────────── */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.25rem 1.5rem', boxShadow: '0 1px 4px rgba(15,23,42,0.02)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        
        <div className="table-responsive-wrapper">
          <table style={{ width: '100%', minWidth: '850px', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.76rem', textAlign: 'left' }}>
                <th style={{ paddingBottom: '0.85rem', fontWeight: '700' }}>Company</th>
              <th style={{ paddingBottom: '0.85rem', fontWeight: '700' }}>Industry</th>
              <th style={{ paddingBottom: '0.85rem', fontWeight: '700' }}>Contact Person</th>
              <th style={{ paddingBottom: '0.85rem', fontWeight: '700' }}>Email / Domain</th>
              <th style={{ paddingBottom: '0.85rem', fontWeight: '700' }}>Status</th>
              <th style={{ paddingBottom: '0.85rem', fontWeight: '700' }}>Registered On</th>
              <th style={{ paddingBottom: '0.85rem', fontWeight: '700', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCompanies.map(c => (
              <tr key={c.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                
                {/* Company Name & Domain Avatar */}
                <td style={{ padding: '0.85rem 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: c.avatarBg, color: '#ffffff', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', flexShrink: 0 }}>
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <strong style={{ fontSize: '0.88rem', color: '#0f172a', display: 'block' }}>{c.name}</strong>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{c.domain}</span>
                  </div>
                </td>

                {/* Industry */}
                <td style={{ color: '#475569', fontSize: '0.82rem', fontWeight: '600' }}>{c.industry}</td>

                {/* Contact Person & Phone */}
                <td>
                  <div style={{ fontSize: '0.82rem', color: '#0f172a', fontWeight: '600' }}>{c.contactPerson}</div>
                  <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{c.phone}</div>
                </td>

                {/* Email / Domain */}
                <td style={{ color: '#334155', fontSize: '0.82rem', fontWeight: '500' }}>{c.email}</td>

                {/* Status Badge */}
                <td>
                  <span style={{
                    background: c.status === 'Verified' ? '#dcfce7' : (c.status === 'Pending' ? '#fef3c7' : '#fee2e2'),
                    color: c.status === 'Verified' ? '#15803d' : (c.status === 'Pending' ? '#b45309' : '#dc2626'),
                    border: `1px solid ${c.status === 'Verified' ? '#bbf7d0' : (c.status === 'Pending' ? '#fde68a' : '#fca5a5')}`,
                    padding: '3px 10px', borderRadius: '8px', fontSize: '0.74rem', fontWeight: '800'
                  }}>
                    {c.status}
                  </span>
                </td>

                {/* Registered On */}
                <td style={{ color: '#475569', fontSize: '0.8rem', fontWeight: '600' }}>{c.regDate}</td>

                {/* Action Buttons: Eye + Options Dropdown */}
                <td className="action-menu-container" style={{ textAlign: 'right', position: 'relative' }}>
                  <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                    <button
                      onClick={() => setSelectedCompanyView(c)}
                      style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1' }}
                      title="View Details"
                    >
                      <Eye size={16} />
                    </button>

                    <button
                      onClick={() => setActiveDropdownId(activeDropdownId === c.id ? null : c.id)}
                      style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}
                    >
                      <MoreVertical size={16} />
                    </button>
                  </div>

                  {/* Dropdown Menu */}
                  {activeDropdownId === c.id && (
                    <div style={{ position: 'absolute', right: 0, top: '100%', marginTop: '4px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.12)', zIndex: 60, padding: '4px', width: '175px', textAlign: 'left' }}>
                      {c.status !== 'Verified' && (
                        <button onClick={() => handleApproveCompany(c.id, c.name, c.email)} style={{ width: '100%', padding: '0.5rem 0.75rem', border: 'none', background: '#f0fdf4', color: '#16a34a', fontSize: '0.78rem', fontWeight: '800', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '6px', borderRadius: '6px', marginBottom: '2px' }}>
                          <CheckCircle2 size={14} /> Verify Company
                        </button>
                      )}
                      {c.status !== 'Pending' && (
                        <button onClick={() => handleMoveUnderReview(c.id, c.name, c.email)} style={{ width: '100%', padding: '0.5rem 0.75rem', border: 'none', background: '#eff6ff', color: '#2563eb', fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '6px', borderRadius: '6px', marginBottom: '2px' }}>
                          <Clock size={14} /> Under Review
                        </button>
                      )}
                      <button onClick={() => handleRejectCompany(c.id, c.name, c.email)} style={{ width: '100%', padding: '0.5rem 0.75rem', border: 'none', background: 'transparent', color: '#ea580c', fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '6px', borderRadius: '6px', marginBottom: '2px' }}>
                        <XCircle size={14} /> Reject Company
                      </button>
                      <button onClick={() => handleBlockCompany(c.id, c.name)} style={{ width: '100%', padding: '0.5rem 0.75rem', border: 'none', background: 'transparent', color: '#7c3aed', fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '6px', borderRadius: '6px', marginBottom: '2px' }}>
                        <Ban size={14} /> Block Company
                      </button>
                      <button onClick={() => handleDeleteCompany(c.id, c.name, c.email)} style={{ width: '100%', padding: '0.5rem 0.75rem', border: 'none', background: '#fef2f2', color: '#dc2626', fontSize: '0.78rem', fontWeight: '800', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '6px', borderRadius: '6px' }}>
                        <Trash2 size={14} /> Delete & Cascade
                      </button>
                    </div>
                  )}
                </td>

              </tr>
            ))}
          </tbody>
        </table>
        </div>

        {/* ── PAGINATION FOOTER ───────────────────────────────────────── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid #f1f5f9', fontSize: '0.82rem', color: '#64748b' }}>
          <div>
            Showing {filteredCompanies.length} of {companiesList.length} registered companies
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <button style={{ border: '1px solid #cbd5e1', background: '#ffffff', borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ChevronLeft size={16} color="#64748b" /></button>
              <button style={{ border: 'none', background: '#6366f1', color: '#ffffff', borderRadius: '8px', width: '32px', height: '32px', fontWeight: '800', cursor: 'pointer' }}>1</button>
              <button style={{ border: '1px solid #cbd5e1', background: '#ffffff', borderRadius: '8px', width: '32px', height: '32px', fontWeight: '700', cursor: 'pointer', color: '#334155' }}>2</button>
              <button style={{ border: '1px solid #cbd5e1', background: '#ffffff', borderRadius: '8px', width: '32px', height: '32px', fontWeight: '700', cursor: 'pointer', color: '#334155' }}>3</button>
              <span style={{ padding: '0 4px' }}>...</span>
              <button style={{ border: '1px solid #cbd5e1', background: '#ffffff', borderRadius: '8px', padding: '0 8px', height: '32px', fontWeight: '700', cursor: 'pointer', color: '#334155' }}>86</button>
              <button style={{ border: '1px solid #cbd5e1', background: '#ffffff', borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ChevronRight size={16} color="#64748b" /></button>
            </div>

            <select style={{ padding: '0.45rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.8rem', background: '#ffffff', fontWeight: '700', color: '#334155' }}>
              <option value="10">10 / page</option>
              <option value="25">25 / page</option>
              <option value="50">50 / page</option>
            </select>
          </div>
        </div>

      </div>

      {/* ── MODAL 1: Add Company Modal ────────────────────────────────────── */}
      {showAddCompanyModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: '1rem' }}>
          <div style={{ width: '520px', background: '#ffffff', borderRadius: '24px', padding: '2rem', boxShadow: '0 25px 60px rgba(15,23,42,0.2)', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Register New Company</h3>
              <button onClick={() => setShowAddCompanyModal(false)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={18} color="#64748b" />
              </button>
            </div>

            <form onSubmit={handleAddCompanySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>Company Name *</label>
                <input type="text" required value={newCompName} onChange={e => setNewCompName(e.target.value)} placeholder="e.g. TechNova Solutions Pvt. Ltd." style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>Industry *</label>
                  <select value={newCompIndustry} onChange={e => setNewCompIndustry(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem', background: '#ffffff' }}>
                    <option value="IT Services">IT Services</option>
                    <option value="Software">Software</option>
                    <option value="Education">Education</option>
                    <option value="Design">Design</option>
                    <option value="BPO">BPO</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>Website Domain</label>
                  <input type="text" value={newCompDomain} onChange={e => setNewCompDomain(e.target.value)} placeholder="technova.com" style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>Contact Person Name</label>
                <input type="text" value={newCompContact} onChange={e => setNewCompContact(e.target.value)} placeholder="Rahul Sharma" style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>Work Email *</label>
                  <input type="email" required value={newCompEmail} onChange={e => setNewCompEmail(e.target.value)} placeholder="contact@technova.com" style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>Phone</label>
                  <input type="text" value={newCompPhone} onChange={e => setNewCompPhone(e.target.value)} placeholder="+91 98765 43210" style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.75rem' }}>
                <button type="button" onClick={() => setShowAddCompanyModal(false)} style={{ padding: '0.75rem 1.25rem', borderRadius: '10px', background: '#f1f5f9', border: 'none', color: '#475569', fontWeight: '700', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '0.75rem 1.5rem', borderRadius: '10px', background: '#6366f1', color: '#ffffff', border: 'none', fontWeight: '800', cursor: 'pointer' }}>Register Company</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 2: View Company Details ──────────────────────────────────── */}
      {selectedCompanyView && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: '1rem' }}>
          <div style={{ width: '500px', background: '#ffffff', borderRadius: '24px', padding: '2rem', boxShadow: '0 25px 60px rgba(15,23,42,0.2)', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Company Profile</h3>
              <button onClick={() => setSelectedCompanyView(null)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={18} color="#64748b" />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#f8fafc', padding: '1rem', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: selectedCompanyView.avatarBg, color: '#ffffff', fontWeight: '800', fontSize: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {selectedCompanyView.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <strong style={{ fontSize: '1rem', color: '#0f172a', display: 'block' }}>{selectedCompanyView.name}</strong>
                  <span style={{ fontSize: '0.82rem', color: '#6366f1', fontWeight: '700' }}>🌐 {selectedCompanyView.domain}</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', fontSize: '0.84rem' }}>
                <div><span style={{ color: '#64748b' }}>Industry:</span> <strong style={{ display: 'block', color: '#0f172a' }}>{selectedCompanyView.industry}</strong></div>
                <div><span style={{ color: '#64748b' }}>Contact Person:</span> <strong style={{ display: 'block', color: '#0f172a' }}>{selectedCompanyView.contactPerson}</strong></div>
                <div><span style={{ color: '#64748b' }}>Work Email:</span> <strong style={{ display: 'block', color: '#0f172a' }}>{selectedCompanyView.email}</strong></div>
                <div><span style={{ color: '#64748b' }}>Phone:</span> <strong style={{ display: 'block', color: '#0f172a' }}>{selectedCompanyView.phone}</strong></div>
                <div><span style={{ color: '#64748b' }}>Verification Status:</span> <strong style={{ display: 'block', color: selectedCompanyView.status === 'Verified' ? '#16a34a' : '#ea580c' }}>{selectedCompanyView.status}</strong></div>
                <div><span style={{ color: '#64748b' }}>Registered On:</span> <span style={{ display: 'block', color: '#334155' }}>{selectedCompanyView.regDate}</span></div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button onClick={() => setSelectedCompanyView(null)} style={{ padding: '0.65rem 1.4rem', borderRadius: '10px', background: '#6366f1', color: '#ffffff', border: 'none', fontWeight: '800', cursor: 'pointer' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
