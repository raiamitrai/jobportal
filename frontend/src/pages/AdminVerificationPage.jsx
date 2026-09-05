import React, { useState, useEffect } from 'react';
import {
  Search, Filter, Download, ChevronDown, ChevronLeft, ChevronRight,
  CheckCircle2, Clock, X, FileText, Eye, MoreVertical, Shield,
  AlertCircle, XCircle, Trash2, UserCheck, Building
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const STATUS_STYLES = {
  'Pending':       { bg:'#fff7ed', color:'#ea580c', border:'#fed7aa' },
  'Under Review':  { bg:'#eff6ff', color:'#2563eb', border:'#bfdbfe' },
  'Verified':      { bg:'#f0fdf4', color:'#16a34a', border:'#bbf7d0' },
  'Rejected':      { bg:'#fef2f2', color:'#dc2626', border:'#fca5a5' },
};

const USER_TYPE_STYLES = {
  'Recruiter': { bg:'#eff6ff', color:'#2563eb' },
  'Candidate': { bg:'#f0fdf4', color:'#16a34a' },
  'Company':   { bg:'#f5f3ff', color:'#7c3aed' },
};

const AVATAR_COLORS = ['#6366f1','#10b981','#3b82f6','#f59e0b','#8b5cf6','#06b6d4','#ec4899','#14b8a6'];

export default function AdminVerificationPage() {
  const { registeredUsers, approveRecruiter, setRecruiterPending, rejectRecruiter, deleteUserAccount } = useAuth();
  const [activeTab, setActiveTab]           = useState('All Requests');
  const [searchQuery, setSearchQuery]       = useState('');
  const [userTypeFilter, setUserTypeFilter] = useState('All');
  const [verTypeFilter, setVerTypeFilter]   = useState('All');
  const [statusFilter, setStatusFilter]     = useState('All');
  const [activeDropdownId, setActiveDropdownId] = useState(null);

  // Close active action dropdowns on click anywhere outside on screen
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.action-menu-container')) {
        setActiveDropdownId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    const handleUserDeleted = () => setRefreshKey(prev => prev + 1);
    window.addEventListener('careonix_user_deleted', handleUserDeleted);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('careonix_user_deleted', handleUserDeleted);
    };
  }, []);
  const [selectedReq, setSelectedReq]       = useState(null);
  const [reqToDelete, setReqToDelete]       = useState(null); // Modal state for account deletion confirmation
  const [toastMsg, setToastMsg]             = useState('');
  const [refreshKey, setRefreshKey]         = useState(0);

  // Build requests list dynamically from real registeredUsers
  const requests = React.useMemo(() => {
    if (!Array.isArray(registeredUsers)) return [];

    let approvedRecruiters = [];
    let rejectedRecruiters = [];
    try {
      const appSaved = localStorage.getItem('careonix_approved_recruiters');
      if (appSaved) approvedRecruiters = JSON.parse(appSaved);
      const rejSaved = localStorage.getItem('careonix_rejected_recruiters');
      if (rejSaved) rejectedRecruiters = JSON.parse(rejSaved);
    } catch (e) {}

    const list = registeredUsers.map((u, idx) => {
      const cleanEmail = (u.email || u.identifier || '').toLowerCase().trim();
      const isRecruiter = u.accountType === 'recruiter' || u.role === 'recruiter';
      
      let status = 'Pending';
      if (!isRecruiter) {
        status = 'Verified';
      } else if (approvedRecruiters.includes(cleanEmail) || u.approvalStatus === 'APPROVED' || u.approvalStatus === 'Verified') {
        status = 'Verified';
      } else if (rejectedRecruiters.includes(cleanEmail) || u.approvalStatus === 'REJECTED') {
        status = 'Rejected';
      } else {
        // Any recruiter not explicitly approved by Admin stays PENDING
        status = 'Pending';
      }

      return {
        id: `VER-${String(idx + 1000).padStart(7, '0')}`,
        name: u.name || (u.company ? u.company : 'User'),
        email: cleanEmail,
        phone: u.phone || 'N/A',
        initials: (u.name || u.email || 'U').slice(0, 2).toUpperCase(),
        userType: isRecruiter ? 'Recruiter' : 'Candidate',
        verType: u.company ? 'Company Verification' : 'Identity Verification',
        verSubtype: u.company || 'Direct Registration',
        submittedOn: 'Recently',
        status: status,
        docs: u.company ? 3 : 1,
        avatarIdx: idx % 8,
        _rawApprovalStatus: u.approvalStatus,
        _email: cleanEmail
      };
    });

    // SORT REQUESTS: Pending Recruiters FIRST at the top of the table!
    return list.sort((a, b) => {
      const priority = { 'Pending': 1, 'Under Review': 2, 'Verified': 3, 'Rejected': 4 };
      return (priority[a.status] || 5) - (priority[b.status] || 5);
    });
  }, [registeredUsers, refreshKey]);

  const pendingRecruiters = requests.filter(r => r.userType === 'Recruiter' && r.status === 'Pending');
  const pendingCount = pendingRecruiters.length;

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  const candidateCount = requests.filter(r => r.userType === 'Candidate').length;
  const recruiterCount = requests.filter(r => r.userType === 'Recruiter').length;

  const filteredCounts = {
    'All Requests':             requests.length,
    'Candidate Verifications':  candidateCount,
    'Recruiter Verifications':  recruiterCount,
    'Pending':                  requests.filter(r => r.status === 'Pending').length,
    'Verified':                 requests.filter(r => r.status === 'Verified').length,
    'Rejected':                 requests.filter(r => r.status === 'Rejected').length,
  };

  const filtered = requests.filter(r => {
    // Top Tabs filtering
    if (activeTab === 'Candidate Verifications' && r.userType !== 'Candidate') return false;
    if (activeTab === 'Recruiter Verifications' && r.userType !== 'Recruiter') return false;
    if (activeTab === 'Pending' && r.status !== 'Pending') return false;
    if (activeTab === 'Verified' && r.status !== 'Verified') return false;
    if (activeTab === 'Rejected' && r.status !== 'Rejected') return false;

    // Additional dropdown filters
    if (userTypeFilter !== 'All' && r.userType !== userTypeFilter) return false;
    if (statusFilter !== 'All' && r.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!r.name.toLowerCase().includes(q) && !r.email.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const updateStatus = (reqId, newStatus, targetEmail) => {
    const matchedReq = requests.find(r => r.id === reqId);
    const emailToUse = targetEmail || matchedReq?._email || matchedReq?.email;
    setActiveDropdownId(null);
    setSelectedReq(prev => prev && prev.id === reqId ? { ...prev, status: newStatus } : prev);
    if (emailToUse) {
      if (newStatus === 'Verified' || newStatus === 'Approved') {
        approveRecruiter(emailToUse);
      } else if (newStatus === 'Under Review' || newStatus === 'Pending') {
        setRecruiterPending(emailToUse);
      } else if (newStatus === 'Rejected') {
        rejectRecruiter(emailToUse);
      }
    }
    setRefreshKey(prev => prev + 1);
    triggerToast(`✅ Status updated to "${newStatus}" for ${emailToUse}`);
  };

  const handleDeleteConfirm = () => {
    if (!reqToDelete) return;
    const emailToDelete = reqToDelete._email || reqToDelete.email;
    setActiveDropdownId(null);
    if (selectedReq && selectedReq.id === reqToDelete.id) {
      setSelectedReq(null);
    }
    deleteUserAccount(emailToDelete);
    setReqToDelete(null);
    triggerToast(`🗑️ Account "${emailToDelete}" permanently deleted from database & local memory.`);
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'1.5rem', background:'#f8fafc', minHeight:'92vh', fontFamily:'Inter, sans-serif' }}>

      {/* Toast Notification */}
      {toastMsg && (
        <div style={{ position:'fixed', top:'24px', right:'24px', background:'#10b981', color:'#fff', padding:'0.9rem 1.4rem', borderRadius:'14px', boxShadow:'0 10px 25px rgba(16,185,129,0.3)', display:'flex', alignItems:'center', gap:'0.6rem', zIndex:400, fontWeight:'700', fontSize:'0.9rem' }}>
          <CheckCircle2 size={20}/><span>{toastMsg}</span>
        </div>
      )}

      {/* ── HEADER ──────────────────────────────────────────────────────────── */}
      <div>
        <div style={{ fontSize:'0.78rem', color:'#64748b', fontWeight:'600', marginBottom:'4px' }}>
          Dashboard &gt; Verification
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
          <div>
            <h1 style={{ fontSize:'1.75rem', fontWeight:'800', color:'#0f172a', margin:0, letterSpacing:'-0.02em' }}>Verification Management</h1>
            <p style={{ fontSize:'0.84rem', color:'#64748b', margin:'4px 0 0 0', fontWeight:'500' }}>
              Review, approve, reject, or permanently delete candidate & recruiter verification requests.
            </p>
          </div>
          <div style={{ display:'flex', gap:'0.75rem' }}>
            <button onClick={() => triggerToast('Exporting verification requests CSV...')}
              style={{ background:'#fff', color:'#334155', border:'1px solid #cbd5e1', borderRadius:'12px', padding:'0.65rem 1.25rem', fontWeight:'700', fontSize:'0.86rem', display:'flex', alignItems:'center', gap:'0.5rem', cursor:'pointer' }}>
              <Download size={16}/> Export
            </button>
            <button onClick={() => triggerToast('Advanced Filters opened')}
              style={{ background:'linear-gradient(135deg,#6366f1,#4f46e5)', color:'#fff', border:'none', borderRadius:'12px', padding:'0.65rem 1.25rem', fontWeight:'800', fontSize:'0.86rem', display:'flex', alignItems:'center', gap:'0.5rem', cursor:'pointer', boxShadow:'0 4px 14px rgba(79,70,229,0.25)' }}>
              <Filter size={16}/> Filters
            </button>
          </div>
        </div>
      </div>

      {/* ── KPI CARDS ────────────────────────────────────────────────────────── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'1rem' }}>
        {[
          { label:'Total Accounts',        val: requests.length, icon:<FileText size={18}/>,   iconBg:'#eff6ff',  iconColor:'#2563eb' },
          { label:'Candidates Registered', val: candidateCount,   icon:<UserCheck size={18}/>, iconBg:'#f0fdf4',  iconColor:'#16a34a' },
          { label:'Recruiters Registered', val: recruiterCount,   icon:<Building size={18}/>,  iconBg:'#f5f3ff',  iconColor:'#7c3aed' },
          { label:'Pending Approval',      val: requests.filter(r=>r.status==='Pending').length, icon:<Clock size={18}/>, iconBg:'#fff7ed', iconColor:'#ea580c' },
        ].map((c, i) => (
          <div key={i} style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:'18px', padding:'1.25rem', boxShadow:'0 1px 4px rgba(15,23,42,0.02)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'0.75rem' }}>
              <div style={{ width:'38px', height:'38px', borderRadius:'12px', background:c.iconBg, color:c.iconColor, display:'flex', alignItems:'center', justifyContent:'center' }}>{c.icon}</div>
              <div>
                <span style={{ fontSize:'0.76rem', fontWeight:'700', color:'#64748b', display:'block' }}>{c.label}</span>
                <div style={{ fontSize:'1.5rem', fontWeight:'800', color:'#0f172a', lineHeight:1.1 }}>{c.val}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── PENDING RECRUITER APPROVALS (Priority Notification Banner) ────── */}
      {pendingCount > 0 && (
        <div style={{ background:'linear-gradient(135deg,#fffbeb,#fef3c7)', border:'2px solid #f59e0b', borderRadius:'18px', padding:'1.35rem 1.5rem' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'1rem' }}>
            <AlertCircle size={20} color="#d97706" />
            <h3 style={{ margin:0, fontSize:'1rem', fontWeight:'800', color:'#78350f' }}>
              🔔 {pendingCount} Recruiter Account{pendingCount > 1 ? 's' : ''} Awaiting Approval
            </h3>
            <span style={{ background:'#d97706', color:'#fff', padding:'2px 9px', borderRadius:'20px', fontSize:'0.74rem', fontWeight:'800' }}>{pendingCount}</span>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:'0.65rem' }}>
            {pendingRecruiters.map((r, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', background:'rgba(255,255,255,0.8)', border:'1px solid #fde68a', borderRadius:'12px', padding:'0.85rem 1rem', gap:'1rem' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
                  <div style={{ width:'36px', height:'36px', borderRadius:'50%', background:AVATAR_COLORS[r.avatarIdx], color:'#fff', fontWeight:'800', fontSize:'0.85rem', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    {r.initials}
                  </div>
                  <div>
                    <strong style={{ fontSize:'0.88rem', color:'#0f172a', display:'block' }}>{r.name}</strong>
                    <span style={{ fontSize:'0.74rem', color:'#64748b' }}>{r.email}</span>
                    {r.verSubtype !== 'Direct Registration' && <span style={{ fontSize:'0.72rem', color:'#7c3aed', fontWeight:'700', marginLeft:'6px' }}>• {r.verSubtype}</span>}
                  </div>
                </div>
                <div style={{ display:'flex', gap:'0.5rem', flexShrink:0 }}>
                  <button
                    onClick={() => updateStatus(r.id, 'Verified', r._email)}
                    style={{ background:'#16a34a', color:'#fff', border:'none', borderRadius:'8px', padding:'0.45rem 1rem', fontWeight:'800', fontSize:'0.8rem', cursor:'pointer', display:'flex', alignItems:'center', gap:'5px' }}
                  >
                    <CheckCircle2 size={14}/> Approve
                  </button>
                  <button
                    onClick={() => updateStatus(r.id, 'Rejected', r._email)}
                    style={{ background:'#fef2f2', color:'#dc2626', border:'1px solid #fca5a5', borderRadius:'8px', padding:'0.45rem 0.9rem', fontWeight:'800', fontSize:'0.8rem', cursor:'pointer', display:'flex', alignItems:'center', gap:'5px' }}
                  >
                    <X size={14}/> Reject
                  </button>
                  <button
                    onClick={() => setReqToDelete(r)}
                    style={{ background:'#dc2626', color:'#fff', border:'none', borderRadius:'8px', padding:'0.45rem 0.9rem', fontWeight:'800', fontSize:'0.8rem', cursor:'pointer', display:'flex', alignItems:'center', gap:'5px' }}
                  >
                    <Trash2 size={14}/> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 2-PART DIVISION HUB (Recruiter Section vs Candidate Section) ──────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
        
        {/* PART 1: RECRUITER VERIFICATIONS SECTION */}
        <div
          onClick={() => setActiveTab('Recruiter Verifications')}
          style={{
            background: activeTab === 'Recruiter Verifications' ? 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)' : '#ffffff',
            border: activeTab === 'Recruiter Verifications' ? '2.5px solid #2563eb' : '1.5px solid #cbd5e1',
            borderRadius: '20px',
            padding: '1.35rem 1.5rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: activeTab === 'Recruiter Verifications' ? '0 8px 25px rgba(37,99,235,0.15)' : '0 2px 6px rgba(15,23,42,0.02)',
            position: 'relative'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: '#dbeafe', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800' }}>
                <Building size={24} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', color: '#1e3a8a' }}>
                  🏢 Recruiter Accounts Section
                </h3>
                <span style={{ fontSize: '0.78rem', color: '#3b82f6', fontWeight: '600' }}>
                  Company Details & Approval Status
                </span>
              </div>
            </div>
            <span style={{ background: '#2563eb', color: '#ffffff', padding: '4px 12px', borderRadius: '50px', fontSize: '0.82rem', fontWeight: '800' }}>
              {recruiterCount} Recruiters
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', fontSize: '0.78rem', flexWrap: 'wrap' }}>
            <span style={{ background: '#fff7ed', color: '#ea580c', border: '1px solid #fed7aa', padding: '4px 10px', borderRadius: '8px', fontWeight: '700' }}>
              ⏳ {pendingCount} Awaiting Approval
            </span>
            <span style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', padding: '4px 10px', borderRadius: '8px', fontWeight: '700' }}>
              ✅ {requests.filter(r => r.userType === 'Recruiter' && r.status === 'Verified').length} Verified
            </span>
          </div>
        </div>

        {/* PART 2: CANDIDATE VERIFICATIONS SECTION */}
        <div
          onClick={() => setActiveTab('Candidate Verifications')}
          style={{
            background: activeTab === 'Candidate Verifications' ? 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)' : '#ffffff',
            border: activeTab === 'Candidate Verifications' ? '2.5px solid #16a34a' : '1.5px solid #cbd5e1',
            borderRadius: '20px',
            padding: '1.35rem 1.5rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: activeTab === 'Candidate Verifications' ? '0 8px 25px rgba(22,163,74,0.15)' : '0 2px 6px rgba(15,23,42,0.02)',
            position: 'relative'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800' }}>
                <UserCheck size={24} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', color: '#14532d' }}>
                  👤 Candidate Accounts Section
                </h3>
                <span style={{ fontSize: '0.78rem', color: '#16a34a', fontWeight: '600' }}>
                  Job Seeker Identity & Profile Directory
                </span>
              </div>
            </div>
            <span style={{ background: '#16a34a', color: '#ffffff', padding: '4px 12px', borderRadius: '50px', fontSize: '0.82rem', fontWeight: '800' }}>
              {candidateCount} Candidates
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', fontSize: '0.78rem', flexWrap: 'wrap' }}>
            <span style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', padding: '4px 10px', borderRadius: '8px', fontWeight: '700' }}>
              ✅ {requests.filter(r => r.userType === 'Candidate' && r.status === 'Verified').length} Active Candidates
            </span>
            <span style={{ background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', padding: '4px 10px', borderRadius: '8px', fontWeight: '700' }}>
              🌐 Direct Registered Users
            </span>
          </div>
        </div>

      </div>

      {/* ── PROMINENT ROLE SEPARATION SUB-TABS ──────────────────────── */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'2px solid #e2e8f0', paddingBottom:'0' }}>
        <div style={{ display:'flex', gap:'0.4rem', overflowX:'auto' }}>
          {[
            { key: 'All Requests',            label: 'All Requests',            icon: null },
            { key: 'Candidate Verifications', label: '👤 Candidate Requests',  icon: null },
            { key: 'Recruiter Verifications', label: '🏢 Recruiter Requests',  icon: null },
            { key: 'Pending',                 label: '⏳ Pending Approval',    icon: null },
            { key: 'Verified',                label: '✅ Verified',             icon: null },
            { key: 'Rejected',                label: '❌ Rejected',             icon: null },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              style={{
                background:'none', border:'none', padding:'0.75rem 1.1rem', cursor:'pointer', whiteSpace:'nowrap',
                color: activeTab === tab.key ? '#6366f1' : '#64748b',
                fontWeight: activeTab === tab.key ? '800' : '600', fontSize:'0.88rem',
                borderBottom: activeTab === tab.key ? '3px solid #6366f1' : '3px solid transparent',
                transition:'all 0.15s ease', display:'flex', alignItems:'center', gap:'6px'
              }}>
              {tab.label}
              <span style={{
                background: activeTab === tab.key ? '#6366f1' : '#f1f5f9',
                color: activeTab === tab.key ? '#fff' : '#64748b',
                padding:'2px 8px', borderRadius:'12px', fontSize:'0.73rem', fontWeight:'800'
              }}>
                {filteredCounts[tab.key] ?? 0}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── SEARCH & FILTERS BAR ─────────────────────────────────────────────── */}
      <div style={{ display:'flex', flexWrap:'wrap', gap:'0.75rem', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ position:'relative', width:'340px' }}>
          <Search size={15} style={{ position:'absolute', left:'12px', top:'50%', transform:'translateY(-50%)', color:'#94a3b8' }}/>
          <input type="text" placeholder="Search by candidate name, recruiter email, company..."
            value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            style={{ width:'100%', padding:'0.65rem 1rem 0.65rem 2.25rem', borderRadius:'12px', border:'1px solid #cbd5e1', fontSize:'0.84rem', outline:'none', background:'#fff' }}/>
        </div>

        <div style={{ display:'flex', gap:'0.65rem', alignItems:'flex-end', flexWrap:'wrap' }}>
          <div>
            <span style={{ fontSize:'0.72rem', fontWeight:'700', color:'#64748b', display:'block', marginBottom:'2px' }}>User Type</span>
            <select value={userTypeFilter} onChange={e => setUserTypeFilter(e.target.value)}
              style={{ padding:'0.55rem 0.85rem', borderRadius:'10px', border:'1px solid #cbd5e1', fontSize:'0.82rem', background:'#fff', fontWeight:'700', color:'#0f172a' }}>
              <option value="All">All User Types</option>
              <option value="Candidate">Candidate Only</option>
              <option value="Recruiter">Recruiter Only</option>
            </select>
          </div>
          <div>
            <span style={{ fontSize:'0.72rem', fontWeight:'700', color:'#64748b', display:'block', marginBottom:'2px' }}>Verification Type</span>
            <select value={verTypeFilter} onChange={e => setVerTypeFilter(e.target.value)}
              style={{ padding:'0.55rem 0.85rem', borderRadius:'10px', border:'1px solid #cbd5e1', fontSize:'0.82rem', background:'#fff', fontWeight:'700', color:'#0f172a' }}>
              <option value="All">All Types</option>
              <option value="Company">Company Verification</option>
              <option value="Identity">Identity Verification</option>
            </select>
          </div>
          <div>
            <span style={{ fontSize:'0.72rem', fontWeight:'700', color:'#64748b', display:'block', marginBottom:'2px' }}>Status</span>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              style={{ padding:'0.55rem 0.85rem', borderRadius:'10px', border:'1px solid #cbd5e1', fontSize:'0.82rem', background:'#fff', fontWeight:'700', color:'#0f172a' }}>
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Under Review">Under Review</option>
              <option value="Verified">Verified</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
          <button onClick={() => { setSearchQuery(''); setUserTypeFilter('All'); setVerTypeFilter('All'); setStatusFilter('All'); setActiveTab('All Requests'); }}
            style={{ background:'none', border:'none', color:'#6366f1', fontWeight:'700', fontSize:'0.82rem', cursor:'pointer', padding:'0.55rem 0' }}>
            Clear All
          </button>
        </div>
      </div>

      {/* ── MAIN DATA TABLE ─────────────────────────────────────────────────── */}
      <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:'20px', padding:'1.25rem 1.5rem', boxShadow:'0 1px 4px rgba(15,23,42,0.02)' }}>
        <div className="table-responsive-wrapper">
          <table style={{ width:'100%', minWidth:'850px', borderCollapse:'collapse', fontSize:'0.84rem' }}>
            <thead>
              <tr style={{ borderBottom:'1px solid #e2e8f0', textAlign:'left' }}>
                {['Request ID','User','User Type','Verification Type','Submitted On','Status','Documents','Actions'].map((h,i) => (
                  <th key={i} style={{ paddingBottom:'0.9rem', fontWeight:'700', fontSize:'0.75rem', color:'#64748b', textAlign: i === 7 ? 'right' : 'left' }}>{h}</th>
                ))}
              </tr>
            </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign:'center', padding:'2.5rem', color:'#64748b', fontWeight:'600' }}>
                  No verification requests matching your selected tab or filter criteria.
                </td>
              </tr>
            ) : (
              filtered.map(r => {
                const st = STATUS_STYLES[r.status];
                const ut = USER_TYPE_STYLES[r.userType];
                return (
                  <tr key={r.id} style={{ borderBottom:'1px solid #f8fafc' }}>

                    {/* Request ID */}
                    <td style={{ padding:'0.9rem 0', color:'#475569', fontSize:'0.77rem', fontWeight:'700', fontFamily:'monospace' }}>{r.id}</td>

                    {/* User */}
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                        <div style={{ width:'36px', height:'36px', borderRadius:'50%', background:AVATAR_COLORS[r.avatarIdx], color:'#fff', fontWeight:'800', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.82rem', flexShrink:0 }}>
                          {r.initials}
                        </div>
                        <div>
                          <strong style={{ fontSize:'0.85rem', color:'#0f172a', display:'block' }}>{r.name}</strong>
                          <span style={{ fontSize:'0.73rem', color:'#64748b', display:'block' }}>{r.email}</span>
                          <span style={{ fontSize:'0.72rem', color:'#94a3b8' }}>{r.phone}</span>
                        </div>
                      </div>
                    </td>

                    {/* User Type Badge */}
                    <td>
                      <span style={{ background:ut.bg, color:ut.color, padding:'3px 10px', borderRadius:'8px', fontSize:'0.74rem', fontWeight:'800' }}>
                        {r.userType}
                      </span>
                    </td>

                    {/* Verification Type */}
                    <td>
                      <div style={{ fontSize:'0.85rem', fontWeight:'700', color:'#0f172a' }}>{r.verType}</div>
                      <span style={{ fontSize:'0.73rem', color:'#64748b' }}>{r.verSubtype}</span>
                    </td>

                    {/* Submitted On */}
                    <td style={{ color:'#475569', fontSize:'0.8rem', fontWeight:'600' }}>{r.submittedOn}</td>

                    {/* Status */}
                    <td>
                      <span style={{ background:st.bg, color:st.color, border:`1px solid ${st.border}`, padding:'3px 10px', borderRadius:'8px', fontSize:'0.74rem', fontWeight:'800' }}>
                        {r.status}
                      </span>
                    </td>

                    {/* Documents Count */}
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap:'5px', color:'#475569', fontSize:'0.82rem', fontWeight:'700' }}>
                        <FileText size={14} color="#6366f1"/> {r.docs}
                      </div>
                    </td>

                    {/* Actions Dropdown */}
                    <td className="action-menu-container" style={{ textAlign:'right', position:'relative' }}>
                      <div style={{ display:'inline-flex', gap:'6px', alignItems:'center' }}>
                        <button onClick={() => setSelectedReq(r)}
                          style={{
                            background: (r.status === 'Pending' || r.status === 'Under Review') ? 'linear-gradient(135deg,#6366f1,#4f46e5)' : '#f1f5f9',
                            color: (r.status === 'Pending' || r.status === 'Under Review') ? '#fff' : '#334155',
                            border:'none', borderRadius:'8px', padding:'0.4rem 0.85rem', fontWeight:'700', fontSize:'0.76rem', cursor:'pointer'
                          }}>
                          {(r.status === 'Pending' || r.status === 'Under Review') ? 'Review' : 'View'}
                        </button>
                        <button onClick={() => setActiveDropdownId(activeDropdownId === r.id ? null : r.id)}
                          style={{ background:'#f8fafc', border:'1px solid #cbd5e1', borderRadius:'8px', width:'32px', height:'32px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                          <ChevronDown size={14} color="#64748b"/>
                        </button>
                      </div>

                      {/* 4 ACTIONS DROPDOWN MENU */}
                      {activeDropdownId === r.id && (
                        <div style={{ position:'absolute', right:0, top:'100%', marginTop:'4px', background:'#fff', border:'1px solid #e2e8f0', borderRadius:'14px', boxShadow:'0 12px 32px rgba(0,0,0,0.15)', zIndex:60, padding:'6px', minWidth:'200px', textAlign:'left' }}>
                          
                          {/* Option 1: Move to Under Review */}
                          <button onClick={() => updateStatus(r.id, 'Under Review')}
                            style={{ width:'100%', padding:'0.55rem 0.85rem', border:'none', background:'#eff6ff', color:'#2563eb', fontSize:'0.8rem', fontWeight:'700', cursor:'pointer', textAlign:'left', borderRadius:'8px', marginBottom:'3px', display:'flex', alignItems:'center', gap:'8px' }}>
                            🔍 Move to Under Review
                          </button>
                          
                          {/* Option 2: Verify & Approve */}
                          <button onClick={() => updateStatus(r.id, 'Verified')}
                            style={{ width:'100%', padding:'0.55rem 0.85rem', border:'none', background:'#f0fdf4', color:'#16a34a', fontSize:'0.8rem', fontWeight:'700', cursor:'pointer', textAlign:'left', borderRadius:'8px', marginBottom:'3px', display:'flex', alignItems:'center', gap:'8px' }}>
                            ✅ Verify & Approve
                          </button>
                          
                          {/* Option 3: Reject Request */}
                          <button onClick={() => updateStatus(r.id, 'Rejected')}
                            style={{ width:'100%', padding:'0.55rem 0.85rem', border:'none', background:'#fff7ed', color:'#ea580c', fontSize:'0.8rem', fontWeight:'700', cursor:'pointer', textAlign:'left', borderRadius:'8px', marginBottom:'3px', display:'flex', alignItems:'center', gap:'8px' }}>
                            ❌ Reject Request
                          </button>
                          
                          {/* Option 4: Delete Account (Permanent Delete) */}
                          <button onClick={() => { setActiveDropdownId(null); setReqToDelete(r); }}
                            style={{ width:'100%', padding:'0.55rem 0.85rem', border:'none', background:'#fef2f2', color:'#dc2626', fontSize:'0.8rem', fontWeight:'800', cursor:'pointer', textAlign:'left', borderRadius:'8px', display:'flex', alignItems:'center', gap:'8px' }}>
                            🗑️ Delete Account
                          </button>
                          
                        </div>
                      )}
                    </td>

                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        </div>

        {/* ── PAGINATION FOOTER ──────────────────────────────────────────────── */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', paddingTop:'1rem', borderTop:'1px solid #f1f5f9', fontSize:'0.82rem', color:'#64748b', marginTop:'0.75rem' }}>
          <div>Showing {filtered.length} of {requests.length} registered accounts</div>
        </div>
      </div>

      {/* ── REVIEW / VIEW DETAILS MODAL ─────────────────────────────────────── */}
      {selectedReq && (
        <div style={{ position:'fixed', inset:0, background:'rgba(15,23,42,0.65)', backdropFilter:'blur(6px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:300, padding:'1rem' }}>
          <div style={{ width:'560px', background:'#fff', borderRadius:'24px', padding:'2rem', boxShadow:'0 25px 60px rgba(15,23,42,0.2)', border:'1px solid #e2e8f0' }}>

            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.25rem' }}>
              <div>
                <h3 style={{ fontSize:'1.1rem', fontWeight:'800', color:'#0f172a', margin:0 }}>Verification Request Details</h3>
                <span style={{ fontSize:'0.75rem', color:'#64748b', fontFamily:'monospace' }}>{selectedReq.id}</span>
              </div>
              <button onClick={() => setSelectedReq(null)} style={{ background:'#f1f5f9', border:'none', borderRadius:'50%', width:'32px', height:'32px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <X size={16} color="#64748b"/>
              </button>
            </div>

            {/* Requester Info */}
            <div style={{ display:'flex', alignItems:'center', gap:'1rem', background:'#f8fafc', padding:'1rem', borderRadius:'16px', marginBottom:'1rem' }}>
              <div style={{ width:'48px', height:'48px', borderRadius:'50%', background:AVATAR_COLORS[selectedReq.avatarIdx], color:'#fff', fontWeight:'800', fontSize:'1.1rem', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                {selectedReq.initials}
              </div>
              <div>
                <strong style={{ fontSize:'1rem', color:'#0f172a', display:'block' }}>{selectedReq.name}</strong>
                <span style={{ fontSize:'0.82rem', color:'#64748b', display:'block' }}>{selectedReq.email}</span>
                <span style={{ fontSize:'0.78rem', color:'#94a3b8' }}>{selectedReq.phone}</span>
              </div>
              <span style={{ marginLeft:'auto', background:USER_TYPE_STYLES[selectedReq.userType].bg, color:USER_TYPE_STYLES[selectedReq.userType].color, padding:'4px 12px', borderRadius:'10px', fontSize:'0.76rem', fontWeight:'800' }}>
                {selectedReq.userType}
              </span>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.85rem', fontSize:'0.84rem', marginBottom:'1.25rem' }}>
              <div><span style={{ color:'#64748b' }}>Verification Type</span><strong style={{ display:'block', color:'#0f172a' }}>{selectedReq.verType}</strong></div>
              <div><span style={{ color:'#64748b' }}>Sub-Type</span><strong style={{ display:'block', color:'#0f172a' }}>{selectedReq.verSubtype}</strong></div>
              <div><span style={{ color:'#64748b' }}>Submitted On</span><span style={{ display:'block', color:'#334155' }}>{selectedReq.submittedOn}</span></div>
              <div><span style={{ color:'#64748b' }}>Documents</span>
                <span style={{ display:'flex', alignItems:'center', gap:'4px', color:'#6366f1', fontWeight:'700', marginTop:'2px' }}>
                  <FileText size={14}/> {selectedReq.docs} files attached
                </span>
              </div>
              <div><span style={{ color:'#64748b' }}>Current Status</span>
                <span style={{ display:'block', marginTop:'2px' }}>
                  <span style={{ background:STATUS_STYLES[selectedReq.status].bg, color:STATUS_STYLES[selectedReq.status].color, border:`1px solid ${STATUS_STYLES[selectedReq.status].border}`, padding:'2px 10px', borderRadius:'8px', fontSize:'0.76rem', fontWeight:'800' }}>
                    {selectedReq.status}
                  </span>
                </span>
              </div>
            </div>

            {/* Quick Decisions (including Delete Account option) */}
            <div style={{ borderTop:'1px solid #f1f5f9', paddingTop:'1rem' }}>
              <p style={{ fontSize:'0.78rem', fontWeight:'700', color:'#64748b', marginBottom:'0.65rem' }}>ADMIN ACTIONS & QUICK DECISION</p>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.65rem' }}>
                <button onClick={() => updateStatus(selectedReq.id, 'Under Review')}
                  style={{ background:'#eff6ff', color:'#2563eb', border:'1px solid #bfdbfe', borderRadius:'10px', padding:'0.6rem 0.85rem', fontSize:'0.8rem', fontWeight:'700', cursor:'pointer', textAlign:'center' }}>
                  🔍 Move to Under Review
                </button>
                <button onClick={() => updateStatus(selectedReq.id, 'Verified')}
                  style={{ background:'#f0fdf4', color:'#16a34a', border:'1px solid #bbf7d0', borderRadius:'10px', padding:'0.6rem 0.85rem', fontSize:'0.8rem', fontWeight:'700', cursor:'pointer', textAlign:'center' }}>
                  ✅ Approve & Verify
                </button>
                <button onClick={() => updateStatus(selectedReq.id, 'Rejected')}
                  style={{ background:'#fff7ed', color:'#ea580c', border:'1px solid #fed7aa', borderRadius:'10px', padding:'0.6rem 0.85rem', fontSize:'0.8rem', fontWeight:'700', cursor:'pointer', textAlign:'center' }}>
                  ❌ Reject Request
                </button>
                <button onClick={() => setReqToDelete(selectedReq)}
                  style={{ background:'#fef2f2', color:'#dc2626', border:'1px solid #fca5a5', borderRadius:'10px', padding:'0.6rem 0.85rem', fontSize:'0.8rem', fontWeight:'800', cursor:'pointer', textAlign:'center' }}>
                  🗑️ Delete Account
                </button>
              </div>
            </div>

            <div style={{ display:'flex', justifyContent:'flex-end', marginTop:'1.25rem' }}>
              <button onClick={() => setSelectedReq(null)} style={{ padding:'0.65rem 1.4rem', borderRadius:'10px', background:'#6366f1', color:'#fff', border:'none', fontWeight:'800', cursor:'pointer' }}>Close</button>
            </div>

          </div>
        </div>
      )}

      {/* ── CONFIRM ACCOUNT DELETION MODAL ─────────────────────────────────── */}
      {reqToDelete && (
        <div style={{ position:'fixed', inset:0, background:'rgba(15,23,42,0.7)', backdropFilter:'blur(6px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:500, padding:'1rem' }}>
          <div style={{ width:'460px', background:'#fff', borderRadius:'24px', padding:'2rem', boxShadow:'0 25px 60px rgba(15,23,42,0.25)', border:'1px solid #e2e8f0', textAlign:'center' }}>
            
            <div style={{ width:'60px', height:'60px', borderRadius:'50%', background:'#fef2f2', color:'#dc2626', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1.25rem auto' }}>
              <Trash2 size={28} />
            </div>

            <h3 style={{ fontSize:'1.2rem', fontWeight:'800', color:'#0f172a', margin:'0 0 0.5rem 0' }}>
              Permanently Delete Account?
            </h3>

            <p style={{ fontSize:'0.86rem', color:'#64748b', lineHeight:1.45, marginBottom:'1.25rem' }}>
              Are you sure you want to permanently delete the account for <strong style={{ color:'#0f172a' }}>{reqToDelete.name}</strong> (<span style={{ color:'#6366f1' }}>{reqToDelete.email}</span>)?
            </p>

            <div style={{ background:'#fff7ed', border:'1px solid #fed7aa', borderRadius:'12px', padding:'0.85rem 1rem', textAlign:'left', marginBottom:'1.5rem', fontSize:'0.78rem', color:'#9a3412', fontWeight:'600' }}>
              ⚠️ <strong>Permanent Action:</strong> This will erase the user account, verification requests, and profile data permanently from both local storage and the MySQL database.
            </div>

            <div style={{ display:'flex', gap:'0.75rem', justifyContent:'center' }}>
              <button
                onClick={() => setReqToDelete(null)}
                style={{ background:'#fff', border:'1px solid #cbd5e1', borderRadius:'12px', padding:'0.65rem 1.4rem', fontWeight:'700', fontSize:'0.86rem', color:'#334155', cursor:'pointer', flex:1 }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                style={{ background:'#dc2626', border:'none', borderRadius:'12px', padding:'0.65rem 1.4rem', fontWeight:'800', fontSize:'0.86rem', color:'#fff', cursor:'pointer', flex:1, boxShadow:'0 4px 14px rgba(220,38,38,0.3)' }}
              >
                🗑️ Yes, Delete Account
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
