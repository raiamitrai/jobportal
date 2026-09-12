import React, { useState, useEffect } from 'react';
import ENDPOINTS from '../config/api';
import {
  Users,
  User,
  Building,
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
  UserCheck,
  UserX,
  Lock,
  Briefcase
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function UserDirectory() {
  const { registeredUsers, saveRegisteredUsers, approveRecruiter, setRecruiterPending, rejectRecruiter, deleteUserAccount } = useAuth();
  const [dbProfiles, setDbProfiles] = useState([]);
  
  // Tabs & Filter states
  const [activeTab, setActiveTab] = useState('All Users'); // 'All Users' | 'Candidates' | 'Recruiters' | 'Admins' | 'Suspended'
  const [searchQuery, setSearchQuery] = useState('');
  const [userTypeFilter, setUserTypeFilter] = useState('All Types');
  const [statusFilter, setStatusFilter] = useState('All Status');

  // Modals & Action States
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [selectedUserView, setSelectedUserView] = useState(null);
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

  // Add User Form State
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserType, setNewUserType] = useState('Candidate');
  const [newUserCompany, setNewUserCompany] = useState('');

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  useEffect(() => {
    fetch(ENDPOINTS.profiles('?size=1000'))
      .then(res => res.json())
      .then(data => {
        const list = Array.isArray(data) ? data : (data.content || []);
        if (list.length > 0) setDbProfiles(list);
      })
      .catch(err => console.log('Notice fetching live DB profiles:', err.message));

    const handleUserDeleted = (e) => {
      const delEmail = (e?.detail?.email || '').toLowerCase().trim();
      if (delEmail) {
        setDbProfiles(prev => prev.filter(p => (p.email || '').toLowerCase().trim() !== delEmail));
        setUsersList(prev => prev.filter(u => (u.email || '').toLowerCase().trim() !== delEmail));
      }
    };
    window.addEventListener('careonix_user_deleted', handleUserDeleted);
    return () => window.removeEventListener('careonix_user_deleted', handleUserDeleted);
  }, []);

  const [usersList, setUsersList] = useState([]);

  useEffect(() => {
    let combined = [];

    if (Array.isArray(dbProfiles) && dbProfiles.length > 0) {
      const dbFormatted = dbProfiles.map((p, idx) => {
        const isRecruiter = (p.role || '').toLowerCase() === 'recruiter';
        return {
          id: `db_u_${p.profileId || idx}`,
          name: p.fullName || (p.email ? p.email.split('@')[0] : 'User'),
          company: p.companyName || (isRecruiter ? 'Employer Company' : 'N/A'),
          type: isRecruiter ? 'Recruiter' : 'Candidate',
          email: p.email,
          phone: p.phone || 'Not provided',
          status: isRecruiter ? (p.approvalStatus || 'Verified') : 'Active',
          verified: true,
          regDate: 'Recently',
          lastLogin: 'Active Today',
          avatarBg: '#6366f1'
        };
      });
      combined = [...dbFormatted];
    }

    const ADMIN_EMAILS = ['admin@careonix.com', 'raiamitrai1001@gmail.com'];
    if (Array.isArray(registeredUsers)) {
      registeredUsers.forEach((u, idx) => {
        const uEmail = (u.email || u.identifier || '').toLowerCase().trim();
        if (!ADMIN_EMAILS.includes(uEmail)) {
          if (!combined.find(c => c.email.toLowerCase().trim() === uEmail)) {
            const isRecruiter = u.accountType === 'recruiter';
            combined.unshift({
              id: `reg_u_${idx}`,
              name: u.name || uEmail.split('@')[0],
              company: u.company || (isRecruiter ? 'Employer Company' : 'N/A'),
              type: isRecruiter ? 'Recruiter' : 'Candidate',
              email: u.email || u.identifier,
              phone: u.phone || 'Not provided',
              status: isRecruiter ? (u.approvalStatus === 'APPROVED' ? 'Verified' : 'Pending') : 'Active',
              verified: true,
              regDate: 'Recently',
              lastLogin: 'Active Today',
              avatarBg: '#10b981'
            });
          }
        }
      });
    }

    setUsersList(combined.filter(u => !ADMIN_EMAILS.includes((u.email || '').toLowerCase().trim())));
  }, [dbProfiles, registeredUsers]);

  // Filtered Users List
  const filteredUsers = usersList.filter(u => {
    // Tab filter
    if (activeTab === 'Candidates' && u.type !== 'Candidate') return false;
    if (activeTab === 'Recruiters' && u.type !== 'Recruiter') return false;
    if (activeTab === 'Admins' && u.type !== 'Admin') return false;
    if (activeTab === 'Suspended' && u.status !== 'Suspended') return false;

    // Search query filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = u.name.toLowerCase().includes(q);
      const matchEmail = u.email.toLowerCase().includes(q);
      const matchPhone = u.phone.toLowerCase().includes(q);
      const matchComp = (u.company || '').toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchPhone && !matchComp) return false;
    }

    // Type filter dropdown
    if (userTypeFilter !== 'All Types') {
      if (userTypeFilter === 'Candidates' && u.type !== 'Candidate') return false;
      if (userTypeFilter === 'Recruiters' && u.type !== 'Recruiter') return false;
    }

    // Status filter dropdown
    if (statusFilter !== 'All Status') {
      if (u.status !== statusFilter) return false;
    }

    return true;
  });

  const handleAddUserSubmit = (e) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail) return;

    const newUser = {
      id: `u_${Date.now()}`,
      name: newUserName,
      company: newUserType === 'Recruiter' ? (newUserCompany || 'Careonix Partner') : 'Candidate',
      type: newUserType,
      email: newUserEmail,
      phone: newUserPhone || '+91 98765 00000',
      status: newUserType === 'Recruiter' ? 'Pending' : 'Active',
      verified: true,
      regDate: 'Just Now',
      lastLogin: 'Just Now',
      avatarBg: '#6366f1'
    };

    setUsersList([newUser, ...usersList]);
    setShowAddUserModal(false);
    setNewUserName('');
    setNewUserEmail('');
    setNewUserPhone('');
    triggerToast(`🎉 New ${newUserType} "${newUserName}" added successfully!`);
  };

  const handleToggleUserStatus = (userId, currentStatus) => {
    const newStatus = currentStatus === 'Suspended' ? 'Active' : 'Suspended';
    setUsersList(prev => prev.map(u => u.id === userId ? { ...u, status: newStatus } : u));
    setActiveDropdownId(null);
    triggerToast(`User status updated to ${newStatus}`);
  };

  const handleSetUserApproval = (userId, email, newStatus) => {
    if (email) {
      if (newStatus === 'Verified' || newStatus === 'APPROVED') {
        approveRecruiter(email);
      } else if (newStatus === 'Pending' || newStatus === 'PENDING_APPROVAL' || newStatus === 'Under Review') {
        setRecruiterPending(email);
      } else if (newStatus === 'Rejected' || newStatus === 'REJECTED') {
        rejectRecruiter(email);
      }
    }
    setUsersList(prev => prev.map(u => u.id === userId ? { ...u, status: newStatus } : u));
    setActiveDropdownId(null);
    triggerToast(`User "${email}" status set to ${newStatus}`);
  };

  const handleDeleteUser = (userId, name, email) => {
    if (window.confirm(`Are you sure you want to permanently delete user "${name}" and all associated jobs, applications, and database records?`)) {
      if (email) {
        deleteUserAccount(email);
      }
      setUsersList(prev => prev.filter(u => u.id !== userId));
      setActiveDropdownId(null);
      triggerToast(`🗑️ User "${name}" and all related data permanently deleted.`);
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
          Dashboard &gt; Users &gt; All Users
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
              Users
            </h1>
            <p style={{ color: '#64748b', marginTop: '4px', fontSize: '0.9rem' }}>
              Manage all platform users and their access.
            </p>
          </div>

          {/* Action Buttons: Add User & Export */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={() => setShowAddUserModal(true)}
              style={{
                background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                color: '#ffffff', border: 'none', borderRadius: '12px',
                padding: '0.65rem 1.25rem', fontWeight: '800', fontSize: '0.86rem',
                display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(79,70,229,0.25)'
              }}
            >
              <Plus size={18} /> Add User
            </button>

            <button
              onClick={() => triggerToast('Exporting User Directory CSV...')}
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

      {/* ── TOP KPI ROW (5 Metric Cards Real Data) ──────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem' }}>
        
        {/* Card 1: Total Users */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '18px', padding: '1.25rem', boxShadow: '0 1px 4px rgba(15,23,42,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: '#f3e8ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={18} />
            </div>
            <div>
              <span style={{ fontSize: '0.76rem', fontWeight: '700', color: '#64748b', display: 'block' }}>Total Users</span>
              <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', lineHeight: 1.1 }}>{usersList.length}</div>
            </div>
          </div>
        </div>

        {/* Card 2: Candidates */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '18px', padding: '1.25rem', boxShadow: '0 1px 4px rgba(15,23,42,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={18} />
            </div>
            <div>
              <span style={{ fontSize: '0.76rem', fontWeight: '700', color: '#64748b', display: 'block' }}>Candidates</span>
              <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', lineHeight: 1.1 }}>
                {usersList.filter(u => u.type === 'Candidate').length}
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Verified Recruiters */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '18px', padding: '1.25rem', boxShadow: '0 1px 4px rgba(15,23,42,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Building size={18} />
            </div>
            <div>
              <span style={{ fontSize: '0.76rem', fontWeight: '700', color: '#64748b', display: 'block' }}>Verified Recruiters</span>
              <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', lineHeight: 1.1 }}>
                {usersList.filter(u => u.type === 'Recruiter' && (u.status === 'Verified' || u.status === 'APPROVED' || u.status === 'Active')).length}
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: Pending Recruiters */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '18px', padding: '1.25rem', boxShadow: '0 1px 4px rgba(15,23,42,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: '#fff7ed', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={18} />
            </div>
            <div>
              <span style={{ fontSize: '0.76rem', fontWeight: '700', color: '#64748b', display: 'block' }}>Pending Recruiters</span>
              <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', lineHeight: 1.1 }}>
                {usersList.filter(u => u.type === 'Recruiter' && (u.status === 'Pending' || u.status === 'PENDING_APPROVAL')).length}
              </div>
            </div>
          </div>
        </div>

        {/* Card 5: Suspended Users */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '18px', padding: '1.25rem', boxShadow: '0 1px 4px rgba(15,23,42,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: '#fef2f2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <UserX size={18} />
            </div>
            <div>
              <span style={{ fontSize: '0.76rem', fontWeight: '700', color: '#64748b', display: 'block' }}>Suspended Users</span>
              <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', lineHeight: 1.1 }}>
                {usersList.filter(u => u.status === 'Suspended').length}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ── SUB-TABS BAR (100% Match with Screenshot) ───────────────────────── */}
      <div style={{ display: 'flex', gap: '2rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.1rem' }}>
        {['All Users', 'Candidates', 'Recruiters', 'Admins', 'Suspended'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              background: 'none', border: 'none', padding: '0.65rem 0',
              color: activeTab === tab ? '#6366f1' : '#64748b',
              fontWeight: activeTab === tab ? '800' : '600',
              fontSize: '0.9rem', cursor: 'pointer',
              borderBottom: activeTab === tab ? '2.5px solid #6366f1' : '2.5px solid transparent',
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
            placeholder="Search by name, email or phone..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '0.65rem 1rem 0.65rem 2.5rem', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.86rem', outline: 'none', background: '#ffffff' }}
          />
        </div>

        {/* Right Filter Dropdowns */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          
          <div>
            <span style={{ fontSize: '0.72rem', fontWeight: '700', color: '#64748b', display: 'block', marginBottom: '2px' }}>User Type</span>
            <select
              value={userTypeFilter}
              onChange={e => setUserTypeFilter(e.target.value)}
              style={{ padding: '0.55rem 0.85rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.82rem', background: '#ffffff', fontWeight: '700', color: '#0f172a' }}
            >
              <option value="All Types">All Types</option>
              <option value="Candidates">Candidates</option>
              <option value="Recruiters">Recruiters</option>
            </select>
          </div>

          <div>
            <span style={{ fontSize: '0.72rem', fontWeight: '700', color: '#64748b', display: 'block', marginBottom: '2px' }}>Status</span>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              style={{ padding: '0.55rem 0.85rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.82rem', background: '#ffffff', fontWeight: '700', color: '#0f172a' }}
            >
              <option value="All Status">All Status</option>
              <option value="Verified">Verified</option>
              <option value="Active">Active</option>
              <option value="Pending">Pending</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>

          <div>
            <span style={{ fontSize: '0.72rem', fontWeight: '700', color: '#64748b', display: 'block', marginBottom: '2px' }}>Registered Date</span>
            <select
              style={{ padding: '0.55rem 0.85rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.82rem', background: '#ffffff', fontWeight: '700', color: '#0f172a' }}
            >
              <option value="Select Date">Select Date</option>
              <option value="Last 7 Days">Last 7 Days</option>
              <option value="Last 30 Days">Last 30 Days</option>
            </select>
          </div>

          <button
            onClick={() => triggerToast('Advanced filters applied')}
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
                <th style={{ paddingBottom: '0.85rem', fontWeight: '700' }}>User</th>
              <th style={{ paddingBottom: '0.85rem', fontWeight: '700' }}>Type</th>
              <th style={{ paddingBottom: '0.85rem', fontWeight: '700' }}>Email / Phone</th>
              <th style={{ paddingBottom: '0.85rem', fontWeight: '700' }}>Status</th>
              <th style={{ paddingBottom: '0.85rem', fontWeight: '700', textAlign: 'center' }}>Email Verified</th>
              <th style={{ paddingBottom: '0.85rem', fontWeight: '700' }}>Registered On</th>
              <th style={{ paddingBottom: '0.85rem', fontWeight: '700' }}>Last Login</th>
              <th style={{ paddingBottom: '0.85rem', fontWeight: '700', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(u => (
              <tr key={u.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                
                {/* User Name & Avatar */}
                <td style={{ padding: '0.85rem 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: u.avatarBg, color: '#ffffff', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', flexShrink: 0 }}>
                    {u.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <strong style={{ fontSize: '0.88rem', color: '#0f172a', display: 'block' }}>{u.name}</strong>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{u.company}</span>
                  </div>
                </td>

                {/* Type Badge */}
                <td>
                  <span style={{
                    background: u.type === 'Recruiter' ? '#f3e8ff' : '#eff6ff',
                    color: u.type === 'Recruiter' ? '#7c3aed' : '#2563eb',
                    border: `1px solid ${u.type === 'Recruiter' ? '#ddd6fe' : '#bfdbfe'}`,
                    padding: '3px 10px', borderRadius: '8px', fontSize: '0.74rem', fontWeight: '800'
                  }}>
                    {u.type}
                  </span>
                </td>

                {/* Email / Phone */}
                <td>
                  <div style={{ fontSize: '0.82rem', color: '#0f172a', fontWeight: '600' }}>{u.email}</div>
                  <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{u.phone}</div>
                </td>

                {/* Status Badge */}
                <td>
                  <span style={{
                    background: u.status === 'Verified' || u.status === 'Active' ? '#dcfce7' : (u.status === 'Pending' ? '#fef3c7' : '#fee2e2'),
                    color: u.status === 'Verified' || u.status === 'Active' ? '#15803d' : (u.status === 'Pending' ? '#b45309' : '#dc2626'),
                    border: `1px solid ${u.status === 'Verified' || u.status === 'Active' ? '#bbf7d0' : (u.status === 'Pending' ? '#fde68a' : '#fca5a5')}`,
                    padding: '3px 10px', borderRadius: '8px', fontSize: '0.74rem', fontWeight: '800'
                  }}>
                    {u.status}
                  </span>
                </td>

                {/* Email Verified Checkmark Icon */}
                <td style={{ textAlign: 'center' }}>
                  {u.verified ? (
                    <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#dcfce7', color: '#16a34a', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Check size={14} />
                    </div>
                  ) : (
                    <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#fee2e2', color: '#dc2626', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                      <X size={14} />
                    </div>
                  )}
                </td>

                {/* Registered On */}
                <td style={{ color: '#475569', fontSize: '0.8rem', fontWeight: '600' }}>{u.regDate}</td>

                {/* Last Login */}
                <td style={{ color: '#475569', fontSize: '0.8rem', fontWeight: '600' }}>{u.lastLogin}</td>

                {/* Action Buttons: Eye + More Dots Dropdown */}
                <td className="action-menu-container" style={{ textAlign: 'right', position: 'relative' }}>
                  <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                    <button
                      onClick={() => setSelectedUserView(u)}
                      style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1' }}
                      title="View Details"
                    >
                      <Eye size={16} />
                    </button>

                    <button
                      onClick={() => setActiveDropdownId(activeDropdownId === u.id ? null : u.id)}
                      style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}
                    >
                      <MoreVertical size={16} />
                    </button>
                  </div>

                  {/* Dropdown Menu */}
                  {activeDropdownId === u.id && (
                    <div style={{ position: 'absolute', right: 0, top: '100%', marginTop: '4px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.12)', zIndex: 60, padding: '4px', width: '175px', textAlign: 'left' }}>
                      {u.type === 'Recruiter' && u.status !== 'Verified' && (
                        <button onClick={() => handleSetUserApproval(u.id, u.email, 'Verified')} style={{ width: '100%', padding: '0.5rem 0.75rem', border: 'none', background: '#f0fdf4', color: '#16a34a', fontSize: '0.78rem', fontWeight: '800', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '6px', borderRadius: '6px', marginBottom: '2px' }}>
                          <CheckCircle2 size={14} /> Approve Recruiter
                        </button>
                      )}
                      {u.type === 'Recruiter' && u.status !== 'Pending' && (
                        <button onClick={() => handleSetUserApproval(u.id, u.email, 'Pending')} style={{ width: '100%', padding: '0.5rem 0.75rem', border: 'none', background: '#eff6ff', color: '#2563eb', fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '6px', borderRadius: '6px', marginBottom: '2px' }}>
                          <Clock size={14} /> Move Under Review
                        </button>
                      )}
                      <button onClick={() => handleToggleUserStatus(u.id, u.status)} style={{ width: '100%', padding: '0.5rem 0.75rem', border: 'none', background: 'transparent', color: u.status === 'Suspended' ? '#16a34a' : '#ea580c', fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                        {u.status === 'Suspended' ? <UserCheck size={14} /> : <UserX size={14} />}
                        {u.status === 'Suspended' ? 'Unsuspend' : 'Suspend User'}
                      </button>

                      <button onClick={() => handleDeleteUser(u.id, u.name, u.email)} style={{ width: '100%', padding: '0.5rem 0.75rem', border: 'none', background: '#fef2f2', color: '#dc2626', fontSize: '0.78rem', fontWeight: '800', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '6px', borderRadius: '6px' }}>
                        <X size={14} /> Delete & Cascade
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
            Showing {filteredUsers.length} of {usersList.length} registered users
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <button style={{ border: '1px solid #cbd5e1', background: '#ffffff', borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ChevronLeft size={16} color="#64748b" /></button>
              <button style={{ border: 'none', background: '#6366f1', color: '#ffffff', borderRadius: '8px', width: '32px', height: '32px', fontWeight: '800', cursor: 'pointer' }}>1</button>
              <button style={{ border: '1px solid #cbd5e1', background: '#ffffff', borderRadius: '8px', width: '32px', height: '32px', fontWeight: '700', cursor: 'pointer', color: '#334155' }}>2</button>
              <button style={{ border: '1px solid #cbd5e1', background: '#ffffff', borderRadius: '8px', width: '32px', height: '32px', fontWeight: '700', cursor: 'pointer', color: '#334155' }}>3</button>
              <span style={{ padding: '0 4px' }}>...</span>
              <button style={{ border: '1px solid #cbd5e1', background: '#ffffff', borderRadius: '8px', padding: '0 8px', height: '32px', fontWeight: '700', cursor: 'pointer', color: '#334155' }}>1285</button>
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

      {/* ── MODAL 1: Add User Modal ────────────────────────────────────────── */}
      {showAddUserModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: '1rem' }}>
          <div style={{ width: '520px', background: '#ffffff', borderRadius: '24px', padding: '2rem', boxShadow: '0 25px 60px rgba(15,23,42,0.2)', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Add New Platform User</h3>
              <button onClick={() => setShowAddUserModal(false)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={18} color="#64748b" />
              </button>
            </div>

            <form onSubmit={handleAddUserSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>Full Name *</label>
                <input type="text" required value={newUserName} onChange={e => setNewUserName(e.target.value)} placeholder="e.g. Aditi Sharma" style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }} />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>Email Address *</label>
                <input type="email" required value={newUserEmail} onChange={e => setNewUserEmail(e.target.value)} placeholder="e.g. aditi@company.com" style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>Phone Number</label>
                  <input type="text" value={newUserPhone} onChange={e => setNewUserPhone(e.target.value)} placeholder="+91 98765 00000" style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>User Type</label>
                  <select value={newUserType} onChange={e => setNewUserType(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem', background: '#ffffff' }}>
                    <option value="Candidate">Candidate</option>
                    <option value="Recruiter">Recruiter</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
              </div>

              {newUserType === 'Recruiter' && (
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>Company Name</label>
                  <input type="text" value={newUserCompany} onChange={e => setNewUserCompany(e.target.value)} placeholder="e.g. TechNova Solutions" style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }} />
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.75rem' }}>
                <button type="button" onClick={() => setShowAddUserModal(false)} style={{ padding: '0.75rem 1.25rem', borderRadius: '10px', background: '#f1f5f9', border: 'none', color: '#475569', fontWeight: '700', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '0.75rem 1.5rem', borderRadius: '10px', background: '#6366f1', color: '#ffffff', border: 'none', fontWeight: '800', cursor: 'pointer' }}>Create User</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 2: View User Profile Details ─────────────────────────────── */}
      {selectedUserView && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: '1rem' }}>
          <div style={{ width: '480px', background: '#ffffff', borderRadius: '24px', padding: '2rem', boxShadow: '0 25px 60px rgba(15,23,42,0.2)', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>User Profile Details</h3>
              <button onClick={() => setSelectedUserView(null)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={18} color="#64748b" />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#f8fafc', padding: '1rem', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: selectedUserView.avatarBg, color: '#ffffff', fontWeight: '800', fontSize: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {selectedUserView.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <strong style={{ fontSize: '1rem', color: '#0f172a', display: 'block' }}>{selectedUserView.name}</strong>
                  <span style={{ fontSize: '0.82rem', color: '#64748b' }}>{selectedUserView.company}</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', fontSize: '0.84rem' }}>
                <div><span style={{ color: '#64748b' }}>Email:</span> <strong style={{ display: 'block', color: '#0f172a' }}>{selectedUserView.email}</strong></div>
                <div><span style={{ color: '#64748b' }}>Phone:</span> <strong style={{ display: 'block', color: '#0f172a' }}>{selectedUserView.phone}</strong></div>
                <div><span style={{ color: '#64748b' }}>Role Type:</span> <strong style={{ display: 'block', color: '#6366f1' }}>{selectedUserView.type}</strong></div>
                <div><span style={{ color: '#64748b' }}>Status:</span> <strong style={{ display: 'block', color: '#16a34a' }}>{selectedUserView.status}</strong></div>
                <div><span style={{ color: '#64748b' }}>Registered On:</span> <span style={{ display: 'block', color: '#334155' }}>{selectedUserView.regDate}</span></div>
                <div><span style={{ color: '#64748b' }}>Last Login:</span> <span style={{ display: 'block', color: '#334155' }}>{selectedUserView.lastLogin}</span></div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button onClick={() => setSelectedUserView(null)} style={{ padding: '0.65rem 1.4rem', borderRadius: '10px', background: '#6366f1', color: '#ffffff', border: 'none', fontWeight: '800', cursor: 'pointer' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
