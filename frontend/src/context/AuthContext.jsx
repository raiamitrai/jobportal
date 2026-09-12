import React, { createContext, useContext, useState } from 'react';
import { recordLoginEvent } from '../utils/loginActivityUtils';
import ENDPOINTS from '../config/api';

const AuthContext = createContext(null);

// ── Standalone email dispatch (avoids circular NotificationContext dependency)
const sendAdminEmail = (recipientEmail, subject, htmlBody, type = 'ADMIN_ACTION') => {
  if (!recipientEmail) return;
  const cleanEmail = recipientEmail.toLowerCase().trim();

  // 1. Log to localStorage (shown in Admin Email Logs)
  try {
    const logItem = {
      id: `EML-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      recipientEmail: cleanEmail,
      subject,
      body: htmlBody,
      type,
      status: 'SENT',
      sentAt: new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
      timestamp: Date.now()
    };
    const existing = JSON.parse(localStorage.getItem('careonix_sent_emails') || '[]');
    localStorage.setItem('careonix_sent_emails', JSON.stringify([logItem, ...existing]));
  } catch (e) {}

  // 2. Fire to Java Notification Service via API Gateway — no-op if not running
  try {
    fetch(ENDPOINTS.notifications(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipientId: 1,
        recipientEmail: cleanEmail,
        channel: 'EMAIL',
        title: subject,
        message: htmlBody,
        type
      })
    }).catch(() => {});
  } catch (e) {}
};

export function AuthProvider({ children }) {
  // Read session per-tab strictly from sessionStorage for multi-tab role isolation
  const [user, setUser] = useState(() => {
    try {
      const sessionSaved = sessionStorage.getItem('careonix_user');
      if (sessionSaved) {
        const u = JSON.parse(sessionSaved);
        return u;
      }
      return null;
    } catch (e) {
      return null;
    }
  });

  const [registeredUsers, setRegisteredUsers] = useState(() => {
    try {
      let approvedList = [];
      const appSaved = localStorage.getItem('careonix_approved_recruiters');
      if (appSaved) approvedList = JSON.parse(appSaved);
      let rejectedList = [];
      const rejSaved = localStorage.getItem('careonix_rejected_recruiters');
      if (rejSaved) rejectedList = JSON.parse(rejSaved);
      let deletedList = [];
      const delSaved = localStorage.getItem('careonix_deleted_users');
      if (delSaved) deletedList = JSON.parse(delSaved);

      const saved = localStorage.getItem('careonix_registered_users');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const ADMIN_EMAILS = ['admin@careonix.com', 'raiamitrai1001@gmail.com'];
          const clean = parsed
            .filter(u => {
              const e = (u.email || u.identifier || '').toLowerCase().trim();
              return !ADMIN_EMAILS.includes(e) && !deletedList.includes(e);
            })
            .map(u => {
              const e = (u.email || u.identifier || '').toLowerCase().trim();
              const isRecruiter = u.accountType === 'recruiter' || u.role === 'recruiter';
              if (isRecruiter) {
                if (approvedList.includes(e)) {
                  return { ...u, approvalStatus: 'APPROVED' };
                } else if (rejectedList.includes(e)) {
                  return { ...u, approvalStatus: 'REJECTED' };
                } else {
                  return { ...u, approvalStatus: 'PENDING_APPROVAL' };
                }
              }
              return u;
            });
          try {
            localStorage.setItem('careonix_registered_users', JSON.stringify(clean));
          } catch (ex) {}
          return clean;
        }
      }
      return [];
    } catch (e) {
      return [];
    }
  });

  const saveRegisteredUsers = (updatedList) => {
    let deletedList = [];
    try {
      const delSaved = localStorage.getItem('careonix_deleted_users');
      if (delSaved) deletedList = JSON.parse(delSaved);
    } catch (e) {}

    const cleanList = (updatedList || []).filter(u => {
      const e = (u.email || u.identifier || '').toLowerCase().trim();
      return e && !deletedList.includes(e);
    });

    setRegisteredUsers(() => cleanList);
    try {
      localStorage.setItem('careonix_registered_users', JSON.stringify(cleanList));
    } catch (e) {}
  };

  // Sync user profiles directly from WampServer MySQL database (Master Source of Truth across devices)
  const syncProfilesFromBackend = async () => {
    try {
      const res = await fetch(ENDPOINTS.profiles('?size=1000'), {
        signal: typeof AbortSignal !== 'undefined' && AbortSignal.timeout ? AbortSignal.timeout(2500) : undefined
      }).catch(() => null);
      if (!res || !res.ok) return;
      const data = await res.json();
      const rawList = Array.isArray(data) ? data : (data.content || data._embedded?.profiles || []);
      
      const ADMIN_EMAILS = ['admin@careonix.com', 'raiamitrai1001@gmail.com'];
      let approvedList = [];
      try {
        const appSaved = localStorage.getItem('careonix_approved_recruiters');
        if (appSaved) approvedList = JSON.parse(appSaved);
      } catch (e) {}
      let rejectedList = [];
      try {
        const rejSaved = localStorage.getItem('careonix_rejected_recruiters');
        if (rejSaved) rejectedList = JSON.parse(rejSaved);
      } catch (e) {}
      let deletedList = [];
      try {
        const delSaved = localStorage.getItem('careonix_deleted_users');
        if (delSaved) deletedList = JSON.parse(delSaved);
      } catch (e) {}

      const mysqlUsers = rawList
        .filter(p => {
          const e = (p.email || '').toLowerCase().trim();
          return !ADMIN_EMAILS.includes(e) && !deletedList.includes(e);
        })
        .map(p => {
          const cleanEmail = (p.email || '').toLowerCase().trim();
          const isRecruiter = (p.role || '').toLowerCase().includes('recruiter') || Boolean(p.companyName);
          const dbStatus = p.approvalStatus || (isRecruiter ? 'PENDING_APPROVAL' : 'APPROVED');

          // Read pending list (highest priority — admin explicitly locked this recruiter)
          let pendingList = [];
          try {
            const pendSaved = localStorage.getItem('careonix_pending_recruiters');
            if (pendSaved) pendingList = JSON.parse(pendSaved);
          } catch (e) {}

          let approvalStatus = dbStatus;
          if (isRecruiter) {
            // Pending list has TOP priority (admin explicitly set Under Review)
            if (pendingList.includes(cleanEmail)) {
              approvalStatus = 'PENDING_APPROVAL';
            } else if (rejectedList.includes(cleanEmail) || dbStatus === 'REJECTED') {
              approvalStatus = 'REJECTED';
            } else if (approvedList.includes(cleanEmail) || dbStatus === 'APPROVED' || dbStatus === 'Verified') {
              approvalStatus = 'APPROVED';
            } else {
              approvalStatus = 'PENDING_APPROVAL';
            }
          }
          return {
            identifier: cleanEmail,
            email: cleanEmail,
            password: p.password,
            name: p.fullName || (p.email ? p.email.split('@')[0] : 'User'),
            company: p.companyName || null,
            role: 'client',
            accountType: isRecruiter ? 'recruiter' : 'candidate',
            approvalStatus
          };
        });

      // Master sync: set registeredUsers state to exactly match database
      setRegisteredUsers(mysqlUsers);
      try {
        localStorage.setItem('careonix_registered_users', JSON.stringify(mysqlUsers));
      } catch (e) {}

      // Update current user if logged in on this laptop
      setUser(activeUser => {
        if (!activeUser || !activeUser.email) return activeUser;
        const cleanActiveEmail = activeUser.email.toLowerCase().trim();

        // Never auto-logout: admins, OAuth social login users, or emails in ADMIN_EMAILS list
        if (activeUser.role === 'admin' || activeUser.accountType === 'admin') return activeUser;
        if (activeUser.oauthProvider) return activeUser; // GitHub/Google/LinkedIn OAuth — skip MySQL check
        if (ADMIN_EMAILS.includes(cleanActiveEmail)) return activeUser; // Admin email — always keep logged in

        const matchedDbUser = mysqlUsers.find(u => u.email === cleanActiveEmail);
        if (!matchedDbUser) {
          // User was deleted from backend MySQL by another admin on another device! Force logout.
          try {
            sessionStorage.removeItem('careonix_user');
            sessionStorage.removeItem('careonix_active_tab');
            localStorage.removeItem('careonix_user');
          } catch (e) {}
          return null;
        }

        let updatedActive = { ...activeUser, ...matchedDbUser };
        // Preserve OAuth fields that MySQL doesn't store
        if (activeUser.oauthProvider) updatedActive.oauthProvider = activeUser.oauthProvider;
        if (activeUser.photoUrl) updatedActive.photoUrl = activeUser.photoUrl;

        // CRITICAL: Re-check approvalStatus from localStorage lists (overrides stale sessionStorage)
        if (updatedActive.accountType === 'recruiter') {
          const cleanActiveEmail = updatedActive.email?.toLowerCase().trim() || '';
          let pendingList2 = [];
          let approvedList2 = [];
          let rejectedList2 = [];
          try {
            const ps = localStorage.getItem('careonix_pending_recruiters');
            if (ps) pendingList2 = JSON.parse(ps);
            const as = localStorage.getItem('careonix_approved_recruiters');
            if (as) approvedList2 = JSON.parse(as);
            const rs = localStorage.getItem('careonix_rejected_recruiters');
            if (rs) rejectedList2 = JSON.parse(rs);
          } catch (e) {}

          if (pendingList2.includes(cleanActiveEmail)) {
            updatedActive.approvalStatus = 'PENDING_APPROVAL';
          } else if (rejectedList2.includes(cleanActiveEmail)) {
            updatedActive.approvalStatus = 'REJECTED';
          } else if (approvedList2.includes(cleanActiveEmail)) {
            updatedActive.approvalStatus = 'APPROVED';
          }
        }

        try {
          sessionStorage.setItem('careonix_user', JSON.stringify(updatedActive));
          localStorage.setItem('careonix_user', JSON.stringify(updatedActive));
        } catch (e) {}
        return updatedActive;
      });
    } catch (err) {
      console.log('MySQL Profile Sync note:', err.message);
    }
  };

  React.useEffect(() => {
    syncProfilesFromBackend();

    // Auto-poll MySQL database every 2 seconds for instant real-time sync across multiple laptops
    const poller = setInterval(() => {
      syncProfilesFromBackend();
    }, 2000);

    const handleFocus = () => syncProfilesFromBackend();
    const handleStorageChange = (e) => {
      if (e.key === 'careonix_approval_update_trigger' || e.key === 'careonix_registered_users') {
        syncProfilesFromBackend();
      }
      // Also re-read approvalStatus immediately when pending/approved/rejected lists change
      if (
        e.key === 'careonix_pending_recruiters' ||
        e.key === 'careonix_approved_recruiters' ||
        e.key === 'careonix_rejected_recruiters'
      ) {
        setUser(activeUser => {
          if (!activeUser || activeUser.accountType !== 'recruiter') return activeUser;
          const cleanActiveEmail = (activeUser.email || '').toLowerCase().trim();
          let pendingList = [];
          let approvedList = [];
          let rejectedList = [];
          try {
            const ps = localStorage.getItem('careonix_pending_recruiters');
            if (ps) pendingList = JSON.parse(ps);
            const as = localStorage.getItem('careonix_approved_recruiters');
            if (as) approvedList = JSON.parse(as);
            const rs = localStorage.getItem('careonix_rejected_recruiters');
            if (rs) rejectedList = JSON.parse(rs);
          } catch (e) {}

          let newStatus = activeUser.approvalStatus;
          if (pendingList.includes(cleanActiveEmail)) {
            newStatus = 'PENDING_APPROVAL';
          } else if (rejectedList.includes(cleanActiveEmail)) {
            newStatus = 'REJECTED';
          } else if (approvedList.includes(cleanActiveEmail)) {
            newStatus = 'APPROVED';
          }
          if (newStatus === activeUser.approvalStatus) return activeUser;
          const updated = { ...activeUser, approvalStatus: newStatus };
          try {
            sessionStorage.setItem('careonix_user', JSON.stringify(updated));
            localStorage.setItem('careonix_user', JSON.stringify(updated));
          } catch (e) {}
          return updated;
        });
      }
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('storage', handleStorageChange);
    return () => {
      clearInterval(poller);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const registerUser = (userData, password) => {
    const identifier = typeof userData === 'string' ? userData : (userData.email || userData.phone);
    const cleanId = (identifier || '').toLowerCase().trim();
    const isRecruiter = typeof userData === 'object' && userData.accountType === 'recruiter';

    const providedName = typeof userData === 'object' ? userData.name : null;
    const fallbackName = cleanId.includes('@') ? (cleanId.split('@')[0].charAt(0).toUpperCase() + cleanId.split('@')[0].slice(1)) : cleanId;
    const finalName = (providedName && !providedName.includes('@')) ? providedName.trim() : fallbackName;
    
    const newUser = {
      identifier: cleanId,
      email: typeof userData === 'object' ? userData.email : cleanId,
      phone: typeof userData === 'object' ? userData.phone : null,
      password,
      name: finalName,
      company: typeof userData === 'object' ? userData.company : null,
      role: typeof userData === 'object' ? userData.role : 'client',
      accountType: typeof userData === 'object' ? userData.accountType : 'candidate',
      oauthProvider: typeof userData === 'object' ? userData.oauthProvider : undefined,
      photoUrl: typeof userData === 'object' ? userData.photoUrl : undefined,
      avatar: typeof userData === 'object' ? userData.avatar : undefined,
      githubUsername: typeof userData === 'object' ? userData.githubUsername : undefined,
      bio: typeof userData === 'object' ? userData.bio : undefined,
      // Recruiter accounts default to PENDING_APPROVAL until System Admin verifies them!
      approvalStatus: isRecruiter ? 'PENDING_APPROVAL' : 'APPROVED'
    };

    // If this email was previously deleted, clear it from deleted blacklist on fresh registration
    try {
      const delSaved = localStorage.getItem('careonix_deleted_users');
      if (delSaved) {
        const delList = JSON.parse(delSaved);
        const filteredDel = delList.filter(e => e !== cleanId);
        localStorage.setItem('careonix_deleted_users', JSON.stringify(filteredDel));
      }
    } catch (e) {}

    // Read latest list directly from localStorage to avoid stale React closure
    let currentList = [];
    try {
      const saved = localStorage.getItem('careonix_registered_users');
      currentList = saved ? JSON.parse(saved) : [];
    } catch (e) {
      currentList = [...registeredUsers];
    }

    // Check if user already registered
    const existingIndex = currentList.findIndex(u => (u.identifier || u.email || '').toLowerCase().trim() === cleanId);
    if (existingIndex >= 0) {
      const existing = currentList[existingIndex];
      const updatedUser = {
        ...existing,
        password: password || existing.password,
        accountType: (typeof userData === 'object' && userData.accountType) || existing.accountType,
        company: (typeof userData === 'object' && userData.company) || existing.company,
        name: (providedName && !providedName.includes('@')) ? providedName.trim() : existing.name
      };
      const updatedList = [...currentList];
      updatedList[existingIndex] = updatedUser;
      saveRegisteredUsers(updatedList);
      return updatedUser;
    }

    // Save to registered users list in localStorage (permanent)
    const updated = [...currentList, newUser];
    saveRegisteredUsers(updated);

    // Real Backend Integration: Dispatch registration to Spring Boot auth-service via API Gateway
    try {
      const nameParts = (providedName || '').trim().split(' ');
      const firstName = nameParts[0] || (cleanId.split('@')[0]);
      const lastName = nameParts.slice(1).join(' ') || '';
      const role = (typeof userData === 'object' && userData.accountType ? userData.accountType : 'candidate').toUpperCase();

      fetch(ENDPOINTS.auth('/register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanId,
          password: password,
          firstName,
          lastName,
          role
        })
      }).catch(err => console.log('Backend auth-service registration note:', err.message));
    } catch (e) {}

    // Async sync via profile-service (through API Gateway)
    try {
      fetch(ENDPOINTS.profiles('/register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      }).catch(err => console.log('Backend profile sync note:', err.message));
    } catch (e) {}

    return newUser;
  };


  const findUserByEmail = (identifier) => {
    const cleanId = (identifier || '').toLowerCase().trim();
    if (!cleanId) return null;

    let deletedList = [];
    try {
      const delSaved = localStorage.getItem('careonix_deleted_users');
      if (delSaved) deletedList = JSON.parse(delSaved);
    } catch (e) {}
    if (deletedList.includes(cleanId)) return null;

    // First check React state
    const fromState = registeredUsers.find(u =>
      (u.identifier || '').toLowerCase().trim() === cleanId || (u.email || '').toLowerCase().trim() === cleanId
    );
    if (fromState) return fromState;

    // Fallback: check localStorage directly (handles stale-state edge case after fresh registration)
    try {
      const saved = localStorage.getItem('careonix_registered_users');
      if (saved) {
        const localList = JSON.parse(saved);
        return localList.find(u =>
          (u.identifier || '').toLowerCase().trim() === cleanId || (u.email || '').toLowerCase().trim() === cleanId
        ) || null;
      }
    } catch (e) {}

    return null;
  };

  const validateUser = (identifier, password) => {
    const cleanId = (identifier || '').toLowerCase().trim();
    const inputPass = (password || '').trim();
    if (!cleanId || !inputPass) return null;

    let deletedList = [];
    try {
      const delSaved = localStorage.getItem('careonix_deleted_users');
      if (delSaved) deletedList = JSON.parse(delSaved);
    } catch (e) {}
    if (deletedList.includes(cleanId)) return null;

    const matchFn = (u) => {
      const uEmail = (u.email || u.identifier || '').toLowerCase().trim();
      const uPass = (u.password || '').trim();
      return uEmail === cleanId && uPass !== '' && uPass === inputPass;
    };

    // First check React state
    const fromState = registeredUsers.find(matchFn);
    if (fromState) return fromState;

    // Fallback: check localStorage (handles stale state after fresh signup)
    try {
      const saved = localStorage.getItem('careonix_registered_users');
      if (saved) {
        const localList = JSON.parse(saved);
        return localList.find(matchFn) || null;
      }
    } catch (e) {}

    return null;
  };

  const login = (param1, param2, param3) => {
    let userData = {};

    let email = '';
    let candidateName = '';

    if (typeof param1 === 'object' && param1 !== null) {
      email = (param1.email || '').toLowerCase().trim();
      candidateName = param1.name;
    } else {
      email = (param1 || '').toLowerCase().trim();
    }

    const existing = registeredUsers.find(u => (u.email || u.identifier || '').toLowerCase().trim() === email);

    // Resolve name in order of priority:
    // 1. Registered name in registeredUsers if valid
    // 2. Name passed in param1 if valid
    // 3. Properly capitalized email prefix
    let resolvedName = 'User';
    if (existing?.name && !existing.name.includes('@')) {
      resolvedName = existing.name;
    } else if (candidateName && !candidateName.includes('@')) {
      resolvedName = candidateName;
    } else if (email) {
      const prefix = email.split('@')[0];
      resolvedName = prefix.charAt(0).toUpperCase() + prefix.slice(1);
    }

    const isAdmin = (typeof param1 === 'object' && param1?.role === 'admin') || param3 === 'admin';

    // For admin logins, ALWAYS use the name passed directly — never override from registeredUsers
    if (isAdmin) {
      userData = {
        email: email || 'admin@careonix.com',
        name: (typeof param1 === 'object' && param1.name) ? param1.name : 'Admin',
        role: 'admin',
        accountType: 'admin',
        company: null,
        approvalStatus: 'APPROVED',
        token: 'jwt_mock_token_' + Date.now(),
        loginTime: new Date().toISOString()
      };
      setUser(userData);
      try {
        sessionStorage.setItem('careonix_user', JSON.stringify(userData));
        sessionStorage.setItem('careonix_active_tab', 'dashboard');
        sessionStorage.removeItem('careonix_view_override');
      } catch (e) {}
      return userData;
    }

    const resolvedAccountType = (typeof param1 === 'object' && param1?.accountType)
      ? param1.accountType
      : (existing?.accountType || ((existing?.company || (typeof param1 === 'object' && param1?.company)) ? 'recruiter' : 'candidate'));

    const resolvedCompany = (typeof param1 === 'object' && param1?.company)
      ? param1.company
      : (existing?.company || null);

    userData = {
      email: email || 'user@careonix.com',
      name: resolvedName,
      role: typeof param1 === 'object' ? (param1.role || 'client') : (param3 || 'client'),
      accountType: resolvedAccountType,
      company: resolvedCompany,
      approvalStatus: (typeof param1 === 'object' && param1?.approvalStatus)
        ? param1.approvalStatus
        : (existing?.approvalStatus || 'APPROVED'),
      // Preserve OAuth provider and photo so social login users are not auto-logged-out
      oauthProvider: (typeof param1 === 'object' && param1?.oauthProvider) ? param1.oauthProvider : undefined,
      photoUrl: (typeof param1 === 'object' && param1?.photoUrl) ? param1.photoUrl : (existing?.photoUrl || undefined),
      githubUsername: (typeof param1 === 'object' && param1?.githubUsername) ? param1.githubUsername : undefined,
      token: 'jwt_mock_token_' + Date.now(),
      loginTime: new Date().toISOString()
    };

    setUser(userData);

    if (email) {
      try {
        recordLoginEvent(email);
      } catch (e) {}
    }

    // Tab-Isolated Storage: Save strictly to sessionStorage per tab
    // Also clear any stale view override so role always reflects real credentials
    try {
      sessionStorage.setItem('careonix_user', JSON.stringify(userData));
      sessionStorage.setItem('careonix_active_tab', 'dashboard');
      sessionStorage.removeItem('careonix_view_override');
    } catch (e) {}

    return userData;
  };

  const approveRecruiter = (emailToApprove) => {
    if (!emailToApprove) return;
    const cleanEmail = emailToApprove.toLowerCase().trim();

    try {
      let approvedList = [];
      const appSaved = localStorage.getItem('careonix_approved_recruiters');
      if (appSaved) approvedList = JSON.parse(appSaved);
      if (!approvedList.includes(cleanEmail)) {
        approvedList.push(cleanEmail);
        localStorage.setItem('careonix_approved_recruiters', JSON.stringify(approvedList));
      }
      let rejectedList = [];
      const rejSaved = localStorage.getItem('careonix_rejected_recruiters');
      if (rejSaved) rejectedList = JSON.parse(rejSaved);
      localStorage.setItem('careonix_rejected_recruiters', JSON.stringify(rejectedList.filter(e => e !== cleanEmail)));

      // CRITICAL: Remove from pending list when approving (pending list has highest priority)
      let pendingList = [];
      const pendSaved = localStorage.getItem('careonix_pending_recruiters');
      if (pendSaved) pendingList = JSON.parse(pendSaved);
      localStorage.setItem('careonix_pending_recruiters', JSON.stringify(pendingList.filter(e => e !== cleanEmail)));
    } catch (e) {}

    let updatedUsers = [];
    setRegisteredUsers(prev => {
      updatedUsers = prev.map(u => {
        if ((u.email || u.identifier || '').toLowerCase().trim() === cleanEmail) {
          return { ...u, approvalStatus: 'APPROVED' };
        }
        return u;
      });
      try {
        localStorage.setItem('careonix_registered_users', JSON.stringify(updatedUsers));
      } catch (e) {}
      return updatedUsers;
    });

    if (user && (user.email || '').toLowerCase().trim() === cleanEmail) {
      const updatedUser = { ...user, approvalStatus: 'APPROVED' };
      setUser(updatedUser);
      try {
        sessionStorage.setItem('careonix_user', JSON.stringify(updatedUser));
        localStorage.setItem('careonix_user', JSON.stringify(updatedUser));
      } catch (e) {}
    }

    try {
      fetch(ENDPOINTS.profiles(`/status?email=${encodeURIComponent(cleanEmail)}&status=APPROVED`), {
        method: 'PUT'
      }).catch(err => console.log('Backend Profile status update notice:', err.message));
    } catch (e) {}

    // Dispatch in-app notification (Recruiter: Approved)
    try {
      const savedNotifs = localStorage.getItem('careonix_central_notifications');
      const list = savedNotifs ? JSON.parse(savedNotifs) : [];
      const newNotif = {
        id: `notif_${Date.now()}_app`,
        recipientRole: 'recruiter',
        recipientEmail: cleanEmail,
        title: '🎉 Congratulations! Recruiter Account Approved',
        message: 'Your Recruiter Account has been Verified & Approved by System Admin! You now have full access to post job vacancies and search candidates on CAREONIX.',
        type: 'ADMIN_ACTION',
        channel: 'BOTH',
        sender: 'admin@careonix.com',
        time: 'Just now',
        read: false,
        createdAt: new Date().toISOString()
      };
      localStorage.setItem('careonix_central_notifications', JSON.stringify([newNotif, ...list]));
      localStorage.setItem('careonix_approval_update_trigger', JSON.stringify({ email: cleanEmail, status: 'APPROVED', time: Date.now() }));
    } catch (e) {}

    // Send email to recruiter
    sendAdminEmail(
      cleanEmail,
      '🎉 Your Recruiter Account on CAREONIX is Approved!',
      'Congratulations! Your Recruiter Account has been Verified & Approved by System Admin. You now have full access to post job vacancies, search candidates, and manage your hiring pipeline on CAREONIX. Log in now to get started!',
      'ADMIN_ACTION'
    );
  };

  const setRecruiterPending = (emailToPending) => {
    if (!emailToPending) return;
    const cleanEmail = emailToPending.toLowerCase().trim();

    try {
      // Remove from approved list
      let approvedList = [];
      const appSaved = localStorage.getItem('careonix_approved_recruiters');
      if (appSaved) approvedList = JSON.parse(appSaved);
      localStorage.setItem('careonix_approved_recruiters', JSON.stringify(approvedList.filter(e => e !== cleanEmail)));

      // Remove from rejected list
      let rejectedList = [];
      const rejSaved = localStorage.getItem('careonix_rejected_recruiters');
      if (rejSaved) rejectedList = JSON.parse(rejSaved);
      localStorage.setItem('careonix_rejected_recruiters', JSON.stringify(rejectedList.filter(e => e !== cleanEmail)));

      // ADD to pending list (highest priority in sync — this is what actually locks the page)
      let pendingList = [];
      const pendSaved = localStorage.getItem('careonix_pending_recruiters');
      if (pendSaved) pendingList = JSON.parse(pendSaved);
      if (!pendingList.includes(cleanEmail)) {
        pendingList.push(cleanEmail);
        localStorage.setItem('careonix_pending_recruiters', JSON.stringify(pendingList));
      }
    } catch (e) {}

    let updatedUsers = [];
    setRegisteredUsers(prev => {
      updatedUsers = prev.map(u => {
        if ((u.email || u.identifier || '').toLowerCase().trim() === cleanEmail) {
          return { ...u, approvalStatus: 'PENDING_APPROVAL' };
        }
        return u;
      });
      try {
        localStorage.setItem('careonix_registered_users', JSON.stringify(updatedUsers));
      } catch (e) {}
      return updatedUsers;
    });

    if (user && (user.email || '').toLowerCase().trim() === cleanEmail) {
      const updatedUser = { ...user, approvalStatus: 'PENDING_APPROVAL' };
      setUser(updatedUser);
      try {
        sessionStorage.setItem('careonix_user', JSON.stringify(updatedUser));
        localStorage.setItem('careonix_user', JSON.stringify(updatedUser));
      } catch (e) {}
    }

    try {
      fetch(ENDPOINTS.profiles(`/status?email=${encodeURIComponent(cleanEmail)}&status=PENDING_APPROVAL`), {
        method: 'PUT'
      }).catch(err => console.log('Backend Profile status update notice:', err.message));
    } catch (e) {}

    // Dispatch in-app notification (Recruiter: Under Review)
    try {
      const savedNotifs = localStorage.getItem('careonix_central_notifications');
      const list = savedNotifs ? JSON.parse(savedNotifs) : [];
      const newNotif = {
        id: `notif_${Date.now()}_pend`,
        recipientRole: 'recruiter',
        recipientEmail: cleanEmail,
        title: '🔍 Recruiter Account Moved to Under Review',
        message: 'Your recruiter account verification has been placed Under Review by System Admin. Recruiter posting features are temporarily locked.',
        type: 'ADMIN_ACTION',
        channel: 'BOTH',
        sender: 'admin@careonix.com',
        time: 'Just now',
        read: false,
        createdAt: new Date().toISOString()
      };
      localStorage.setItem('careonix_central_notifications', JSON.stringify([newNotif, ...list]));
      localStorage.setItem('careonix_approval_update_trigger', JSON.stringify({ email: cleanEmail, status: 'PENDING_APPROVAL', time: Date.now() }));
    } catch (e) {}

    // Send email to recruiter
    sendAdminEmail(
      cleanEmail,
      '🔍 Your CAREONIX Recruiter Account is Under Review',
      'Your recruiter account verification has been placed Under Review by System Admin. Your job posting and candidate search features are temporarily locked until the review is complete. If you have any questions, please contact support.',
      'ADMIN_ACTION'
    );
  };

  const rejectRecruiter = (emailToReject) => {
    if (!emailToReject) return;
    const cleanEmail = emailToReject.toLowerCase().trim();

    try {
      let rejectedList = [];
      const rejSaved = localStorage.getItem('careonix_rejected_recruiters');
      if (rejSaved) rejectedList = JSON.parse(rejSaved);
      if (!rejectedList.includes(cleanEmail)) {
        rejectedList.push(cleanEmail);
        localStorage.setItem('careonix_rejected_recruiters', JSON.stringify(rejectedList));
      }
      let approvedList = [];
      const appSaved = localStorage.getItem('careonix_approved_recruiters');
      if (appSaved) approvedList = JSON.parse(appSaved);
      localStorage.setItem('careonix_approved_recruiters', JSON.stringify(approvedList.filter(e => e !== cleanEmail)));

      // CRITICAL: Also remove from pending list when rejecting
      let pendingList = [];
      const pendSaved = localStorage.getItem('careonix_pending_recruiters');
      if (pendSaved) pendingList = JSON.parse(pendSaved);
      localStorage.setItem('careonix_pending_recruiters', JSON.stringify(pendingList.filter(e => e !== cleanEmail)));
    } catch (e) {}

    let updatedUsers = [];
    setRegisteredUsers(prev => {
      updatedUsers = prev.map(u => {
        if ((u.email || u.identifier || '').toLowerCase().trim() === cleanEmail) {
          return { ...u, approvalStatus: 'REJECTED' };
        }
        return u;
      });
      try {
        localStorage.setItem('careonix_registered_users', JSON.stringify(updatedUsers));
      } catch (e) {}
      return updatedUsers;
    });

    if (user && (user.email || '').toLowerCase().trim() === cleanEmail) {
      const updatedUser = { ...user, approvalStatus: 'REJECTED' };
      setUser(updatedUser);
      try {
        sessionStorage.setItem('careonix_user', JSON.stringify(updatedUser));
        localStorage.setItem('careonix_user', JSON.stringify(updatedUser));
      } catch (e) {}
    }

    try {
      fetch(ENDPOINTS.profiles(`/status?email=${encodeURIComponent(cleanEmail)}&status=REJECTED`), {
        method: 'PUT'
      }).catch(err => console.log('Backend Profile status update notice:', err.message));
    } catch (e) {}

    // Dispatch in-app notification (Recruiter: Rejected)
    try {
      const savedNotifs = localStorage.getItem('careonix_central_notifications');
      const list = savedNotifs ? JSON.parse(savedNotifs) : [];
      const newNotif = {
        id: `notif_${Date.now()}_rej`,
        recipientRole: 'recruiter',
        recipientEmail: cleanEmail,
        title: '⚠️ Recruiter Account Verification Update',
        message: 'Your account verification was Rejected by System Admin. Please update your company details or contact support.',
        type: 'ADMIN_ACTION',
        channel: 'BOTH',
        sender: 'admin@careonix.com',
        time: 'Just now',
        read: false,
        createdAt: new Date().toISOString()
      };
      localStorage.setItem('careonix_central_notifications', JSON.stringify([newNotif, ...list]));
      localStorage.setItem('careonix_approval_update_trigger', JSON.stringify({ email: cleanEmail, status: 'REJECTED', time: Date.now() }));
    } catch (e) {}

    // Send email to recruiter
    sendAdminEmail(
      cleanEmail,
      '⚠️ Your CAREONIX Recruiter Account Verification was Rejected',
      'We regret to inform you that your Recruiter Account verification on CAREONIX has been Rejected by System Admin. Please review your company details and resubmit, or contact our support team for assistance.',
      'ADMIN_ACTION'
    );
  };

  const deleteUserAccount = (emailToDelete) => {
    if (!emailToDelete) return;
    const cleanEmail = emailToDelete.toLowerCase().trim();

    // 1. Add to permanent deleted users tombstone blacklist
    try {
      let deletedList = [];
      const delSaved = localStorage.getItem('careonix_deleted_users');
      if (delSaved) deletedList = JSON.parse(delSaved);
      if (!deletedList.includes(cleanEmail)) {
        deletedList.push(cleanEmail);
        localStorage.setItem('careonix_deleted_users', JSON.stringify(deletedList));
      }
    } catch (e) {}

    // 2. Find user details for cascade matching (company, name)
    let currentRegistered = [];
    try {
      const saved = localStorage.getItem('careonix_registered_users');
      currentRegistered = saved ? JSON.parse(saved) : [...registeredUsers];
    } catch (e) {
      currentRegistered = [...registeredUsers];
    }

    const targetUser = currentRegistered.find(u => (u.email || u.identifier || '').toLowerCase().trim() === cleanEmail);
    const targetCompany = (targetUser?.company || '').toLowerCase().trim();
    const targetName = (targetUser?.name || '').toLowerCase().trim();

    // 3. Remove user from registeredUsers (both state and localStorage)
    const updated = currentRegistered.filter(u => (u.email || u.identifier || '').toLowerCase().trim() !== cleanEmail);
    saveRegisteredUsers(updated);

    // 4. Remove from approved/rejected lists
    try {
      let approvedList = [];
      const appSaved = localStorage.getItem('careonix_approved_recruiters');
      if (appSaved) approvedList = JSON.parse(appSaved);
      localStorage.setItem('careonix_approved_recruiters', JSON.stringify(approvedList.filter(e => e !== cleanEmail)));

      let rejectedList = [];
      const rejSaved = localStorage.getItem('careonix_rejected_recruiters');
      if (rejSaved) rejectedList = JSON.parse(rejSaved);
      localStorage.setItem('careonix_rejected_recruiters', JSON.stringify(rejectedList.filter(e => e !== cleanEmail)));
    } catch (e) {}

    // 4. CASCADE DELETE: All Jobs posted by this recruiter from careonix_posted_jobs and backend
    let deletedJobIds = [];
    try {
      const savedJobs = localStorage.getItem('careonix_posted_jobs');
      if (savedJobs) {
        const parsedJobs = JSON.parse(savedJobs);
        const remainingJobs = parsedJobs.filter(j => {
          const p = (j.postedBy || '').toLowerCase().trim();
          const comp = (j.company || '').toLowerCase().trim();
          const isMatch = (p && (p === cleanEmail || (targetName && p === targetName))) ||
                          (targetCompany && comp && comp === targetCompany);
          if (isMatch) {
            deletedJobIds.push(j.id);
            return false;
          }
          return true;
        });
        localStorage.setItem('careonix_posted_jobs', JSON.stringify(remainingJobs));
      }
    } catch (e) {}

    // 5. CASCADE DELETE: All applications for those deleted jobs or by this candidate
    try {
      const savedApps = localStorage.getItem('careonix_candidate_applications');
      if (savedApps) {
        const parsedApps = JSON.parse(savedApps);
        const remainingApps = parsedApps.filter(app => {
          const cand = (app.candidateEmail || '').toLowerCase().trim();
          const p = (app.postedBy || '').toLowerCase().trim();
          const comp = (app.company || '').toLowerCase().trim();
          if (cand === cleanEmail) return false;
          if (p === cleanEmail) return false;
          if (targetCompany && comp === targetCompany) return false;
          if (deletedJobIds.includes(app.jobId)) return false;
          return true;
        });
        localStorage.setItem('careonix_candidate_applications', JSON.stringify(remainingApps));
      }
    } catch (e) {}

    // 6. CASCADE DELETE: Saved jobs map
    try {
      const savedMapStr = localStorage.getItem('careonix_user_saved_jobs');
      if (savedMapStr) {
        const savedMap = JSON.parse(savedMapStr);
        delete savedMap[cleanEmail];
        // For all other users, remove deletedJobIds
        Object.keys(savedMap).forEach(k => {
          savedMap[k] = (savedMap[k] || []).filter(jId => !deletedJobIds.includes(jId));
        });
        localStorage.setItem('careonix_user_saved_jobs', JSON.stringify(savedMap));
      }
    } catch (e) {}

    // 7. CASCADE DELETE: Profile and company local data
    try {
      localStorage.removeItem(`careonix_profile_name_${cleanEmail}`);
      localStorage.removeItem(`careonix_company_${cleanEmail}`);
      // Remove all scoped keys for this user
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && (k.startsWith(`careonix_prof_${cleanEmail}`) || k.includes(cleanEmail))) {
          localStorage.removeItem(k);
        }
      }
    } catch (e) {}

    // 8. Backend profile & job removal via Gateway
    try {
      fetch(ENDPOINTS.profiles(`?email=${encodeURIComponent(cleanEmail)}`), { method: 'DELETE' })
        .then(() => {
          syncProfilesFromBackend();
        })
        .catch(err => console.log('Backend Profile delete notice:', err.message));
    } catch (e) {}

    try {
      fetch(ENDPOINTS.jobs(`/by-recruiter?email=${encodeURIComponent(cleanEmail)}`), { method: 'DELETE' })
        .catch(err => console.log('Job service delete notice:', err.message));
    } catch (e) {}

    // 9. Dispatch Real-Time Cross-Tab, Notification + Email Triggers
    // First capture user details before they are purged from state
    const deletedUserName = targetUser?.name || cleanEmail.split('@')[0];
    const deletedUserRole = targetUser?.accountType || 'user';

    try {
      localStorage.setItem('careonix_approval_update_trigger', JSON.stringify({ email: cleanEmail, action: 'DELETED', time: Date.now() }));
      localStorage.setItem('careonix_jobs_sync_trigger', String(Date.now()));
      localStorage.setItem('careonix_apps_sync_trigger', String(Date.now()));
      window.dispatchEvent(new CustomEvent('careonix_user_deleted', { detail: { email: cleanEmail } }));
    } catch (e) {}

    // In-app notification for deleted user (will show on their next login attempt)
    try {
      const savedNotifs = localStorage.getItem('careonix_central_notifications');
      const list = savedNotifs ? JSON.parse(savedNotifs) : [];
      const newNotif = {
        id: `notif_${Date.now()}_del`,
        recipientEmail: cleanEmail,
        title: '🚫 Account Deleted by Admin',
        message: `Your CAREONIX account has been permanently deleted by System Admin. All associated data has been removed. For any queries, please contact support.`,
        type: 'ADMIN_ACTION',
        channel: 'BOTH',
        sender: 'admin@careonix.com',
        time: 'Just now',
        read: false,
        createdAt: new Date().toISOString()
      };
      localStorage.setItem('careonix_central_notifications', JSON.stringify([newNotif, ...list]));
    } catch (e) {}

    // Send deletion email to the affected user
    const roleLabel = deletedUserRole === 'recruiter' ? 'Recruiter' : 'Candidate';
    sendAdminEmail(
      cleanEmail,
      `🚫 Your CAREONIX ${roleLabel} Account has been Deleted`,
      `Dear ${deletedUserName}, your ${roleLabel} account on CAREONIX has been permanently deleted by System Admin. All your associated data including job postings, applications and profile information has been removed. If you believe this is an error, please contact our support team immediately.`,
      'ADMIN_ACTION'
    );

    // 10. If currently logged in as this user, force logout
    if (user && (user.email || '').toLowerCase().trim() === cleanEmail) {
      logout();
    }
  };

  const updateUserProfileName = (newName) => {
    if (!newName || !user) return;
    const cleanEmail = (user.email || '').toLowerCase().trim();

    if (cleanEmail) {
      try {
        localStorage.setItem(`careonix_profile_name_${cleanEmail}`, newName);
      } catch (e) {}

      // Update registeredUsers array for persistence
      const updatedList = registeredUsers.map(u => {
        if ((u.email || u.identifier || '').toLowerCase().trim() === cleanEmail) {
          return { ...u, name: newName };
        }
        return u;
      });
      saveRegisteredUsers(updatedList);
    }

    const updatedUser = { ...user, name: newName };
    setUser(updatedUser);
    try {
      sessionStorage.setItem('careonix_user', JSON.stringify(updatedUser));
    } catch (e) {}
  };

  const updateUserAvatar = (newAvatar) => {
    if (!newAvatar || !user) return;
    const cleanEmail = (user.email || '').toLowerCase().trim();

    if (cleanEmail) {
      try {
        localStorage.setItem(`careonix_prof_${cleanEmail}_avatar`, newAvatar);
      } catch (e) {}

      const updatedList = registeredUsers.map(u => {
        if ((u.email || u.identifier || '').toLowerCase().trim() === cleanEmail) {
          return { ...u, avatar: newAvatar, photoUrl: newAvatar };
        }
        return u;
      });
      saveRegisteredUsers(updatedList);
    }

    const updatedUser = { ...user, avatar: newAvatar, photoUrl: newAvatar };
    setUser(updatedUser);
    try {
      sessionStorage.setItem('careonix_user', JSON.stringify(updatedUser));
    } catch (e) {}
  };

  const updatePassword = (email, newPassword) => {
    if (!email || !newPassword) return false;
    const cleanEmail = email.toLowerCase().trim();
    const cleanPass = newPassword.trim();

    let currentList = [];
    try {
      const saved = localStorage.getItem('careonix_registered_users');
      currentList = saved ? JSON.parse(saved) : [];
    } catch (e) { currentList = [...registeredUsers]; }

    const idx = currentList.findIndex(u =>
      (u.email || u.identifier || '').toLowerCase().trim() === cleanEmail
    );
    if (idx < 0) return false;

    currentList[idx] = { ...currentList[idx], password: cleanPass };
    saveRegisteredUsers(currentList);
    return true;
  };

  const logout = () => {
    setUser(null);
    try {
      sessionStorage.removeItem('careonix_user');
      sessionStorage.removeItem('careonix_active_tab');
      sessionStorage.removeItem('careonix_view_override');
    } catch (e) {}
  };

  return (
    <AuthContext.Provider value={{
      user,
      registeredUsers,
      saveRegisteredUsers,
      registerUser,
      validateUser,
      findUserByEmail,
      syncProfilesFromBackend,
      login,
      logout,
      approveRecruiter,
      setRecruiterPending,
      rejectRecruiter,
      deleteUserAccount,
      updateUserProfileName,
      updateUserAvatar,
      updatePassword,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
