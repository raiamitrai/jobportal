import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSettings } from '../utils/settingsManager';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem('careonix_central_notifications');
      if (saved) {
        const parsed = JSON.parse(saved);
        // ── Purge old seed/demo notifications and any verification code OTPs ──
        const cleaned = parsed.filter(n => !n.id?.startsWith('notif_seed_') && !n.title?.includes('Verification Code'));
        // Re-save if any seeds were removed
        if (cleaned.length !== parsed.length) {
          localStorage.setItem('careonix_central_notifications', JSON.stringify(cleaned));
        }
        return cleaned;
      }
    } catch (e) {}

    // No seed notifications — users start with a clean inbox.
    // Notifications are generated only from real platform events.
    return [];
  });

  const saveNotifications = (updatedList) => {
    setNotifications(updatedList);
    try {
      localStorage.setItem('careonix_central_notifications', JSON.stringify(updatedList));
    } catch (e) {}
  };

  // Listen for storage events across tabs/windows
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === 'careonix_central_notifications') {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) setNotifications(parsed);
        } catch (err) {}
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Helper to dispatch backend email notification via REST service & persistent local email log
  const dispatchBackendEmail = async (email, title, message, type = 'GENERAL') => {
    if (!email) return;
    const cleanEmail = email.toLowerCase().trim();

    const emailLogItem = {
      id: `EML-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      recipientEmail: cleanEmail,
      title: title,
      message: message,
      type: type,
      status: 'SENT_SUCCESSFULLY',
      sentAt: new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
      timestamp: Date.now()
    };

    // Save to careonix_sent_emails in localStorage
    try {
      const existingLogs = JSON.parse(localStorage.getItem('careonix_sent_emails') || '[]');
      localStorage.setItem('careonix_sent_emails', JSON.stringify([emailLogItem, ...existingLogs]));
    } catch (e) {}

    // Dispatch via backend REST endpoint Port 8086
    try {
      fetch('http://localhost:8086/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientId: 1,
          recipientEmail: cleanEmail,
          channel: 'EMAIL',
          title: title,
          message: message,
          type: type
        })
      }).catch(err => console.log('Backend notification service notice:', err.message));
    } catch (e) {}
  };

  // Add notification to state + local storage + backend service
  const addNotification = (item) => {
    const notifSettings = getSettings()?.notifications || {};
    if (item.type === 'NEW_APPLICATION' && notifSettings.candidateApplied === false) return null;
    if (item.type === 'STATUS_CHANGE' && notifSettings.statusChange === false) return null;
    if (item.type === 'JOB_POSTED' && notifSettings.jobModeration === false) return null;
    if (item.type === 'ADMIN_ALERT' && notifSettings.recruiterSignup === false) return null;

    const newNotif = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      time: 'Just now',
      read: false,
      channel: item.channel || 'BOTH',
      createdAt: new Date().toISOString(),
      ...item
    };

    let updatedList = [];
    setNotifications(prev => {
      updatedList = [newNotif, ...prev];
      try {
        localStorage.setItem('careonix_central_notifications', JSON.stringify(updatedList));
      } catch (e) {}
      return updatedList;
    });

    // If channel is BOTH or EMAIL, trigger email dispatch to targets
    if (item.channel === 'BOTH' || item.channel === 'EMAIL') {
      const emailTargets = new Set();

      // 1. Direct recipient email if provided
      if (item.recipientEmail && !item.recipientEmail.startsWith('all_')) {
        emailTargets.add(item.recipientEmail.toLowerCase().trim());
      }

      // Read registered users from localStorage
      let registeredUsers = [];
      try {
        const savedUsers = localStorage.getItem('careonix_registered_users');
        if (savedUsers) registeredUsers = JSON.parse(savedUsers);
      } catch (e) {}

      let candidateApplications = [];
      try {
        const savedApps = localStorage.getItem('careonix_candidate_applications');
        if (savedApps) candidateApplications = JSON.parse(savedApps);
      } catch (e) {}

      const isForCandidates = item.recipientEmail === 'all_candidates' || item.recipientEmail === 'all_users' || item.recipientRole === 'candidate' || item.audience === 'All Candidates' || item.audience === 'All Users';
      const isForRecruiters = item.recipientEmail === 'all_recruiters' || item.recipientEmail === 'all_users' || item.recipientRole === 'recruiter' || item.audience === 'All Recruiters' || item.audience === 'All Companies' || item.audience === 'All Users';

      // 2. Add Candidate Registered Emails
      if (isForCandidates) {
        registeredUsers.forEach(u => {
          const em = (u.email || u.identifier || '').toLowerCase().trim();
          if (em && (u.role === 'candidate' || u.accountType === 'candidate' || (!u.role && !u.accountType))) {
            emailTargets.add(em);
          }
        });
        candidateApplications.forEach(app => {
          if (app.candidateEmail) emailTargets.add(app.candidateEmail.toLowerCase().trim());
        });
        emailTargets.add('candidate@careonix.com');
      }

      // 3. Add Recruiter Registered Emails
      if (isForRecruiters) {
        registeredUsers.forEach(u => {
          const em = (u.email || u.identifier || '').toLowerCase().trim();
          if (em && (u.role === 'recruiter' || u.accountType === 'recruiter')) {
            emailTargets.add(em);
          }
        });
        emailTargets.add('recruiter@careonix.com');
      }

      // Dispatch backend email to every targeted registered user email
      Array.from(emailTargets).forEach(targetEmail => {
        dispatchBackendEmail(targetEmail, item.title, item.message, item.type || 'GENERAL');
      });
    }

    return newNotif;
  };

  // ----------------------------------------------------
  // FLOW 1a: Recruiter -> Candidates (New Job Posted)
  // ----------------------------------------------------
  const notifyJobPosted = ({ jobTitle, company, experience, location, salary, postedBy }) => {
    const title = `📢 New Job Vacancy: ${jobTitle} at ${company}`;
    const message = `New Job Vacancy Posted: ${jobTitle} at ${company}. Experience: ${experience || '0-2 Yrs'}, Location: ${location || 'India'}, Package: ${salary || 'Best in Industry'}. Apply now on CAREONIX!`;
    
    // Broadcast to candidates
    addNotification({
      recipientRole: 'candidate',
      recipientEmail: 'all_candidates',
      title,
      message,
      type: 'JOB_POSTED',
      channel: 'BOTH',
      sender: postedBy || company
    });
  };

  // ----------------------------------------------------
  // FLOW 1b: Recruiter -> Candidate (Status Change on Internal Jobs "Apply on CAREONIX")
  // ----------------------------------------------------
  const notifyApplicationStatusChange = ({ candidateEmail, candidateName, jobTitle, company, newStatus, recruiterEmail, isPositive }) => {
    const isCongrats = isPositive || ['SHORTLISTED', 'INTERVIEW', 'HIRED', 'ACCEPTED', 'OFFER'].includes((newStatus || '').toUpperCase());
    const title = isCongrats
      ? `🎉 Congratulations! Application Update for ${jobTitle}`
      : `📋 Application Status Update: ${jobTitle}`;
    
    const message = isCongrats
      ? `🎉 Congratulations ${candidateName || ''}! Your application for "${jobTitle}" at ${company} has been updated to ${newStatus.toUpperCase()} by Recruiter (${recruiterEmail || company}).`
      : `Your application for "${jobTitle}" at ${company} has been updated to ${newStatus.toUpperCase()} by Recruiter (${recruiterEmail || company}).`;

    addNotification({
      recipientRole: 'candidate',
      recipientEmail: (candidateEmail || '').toLowerCase().trim(),
      title,
      message,
      type: 'STATUS_CHANGE',
      channel: 'BOTH',
      sender: recruiterEmail || company
    });
  };

  // ----------------------------------------------------
  // FLOW 1c: Candidate -> Recruiter (Status Change on External Jobs "Apply on External Website")
  // ----------------------------------------------------
  const notifyExternalJobStatusChange = ({ recruiterEmail, candidateName, jobTitle, newStatus }) => {
    const title = `📌 External Job Candidate Status Update`;
    const message = `Candidate ${candidateName || 'Job Seeker'} updated their external application status to "${newStatus}" for position "${jobTitle}".`;

    addNotification({
      recipientRole: 'recruiter',
      recipientEmail: (recruiterEmail || '').toLowerCase().trim(),
      title,
      message,
      type: 'EXTERNAL_STATUS_UPDATE',
      channel: 'BELL',
      sender: candidateName || 'Candidate'
    });
  };

  // ----------------------------------------------------
  // FLOW 2: Candidate -> Recruiter (Job Application Submitted)
  // ----------------------------------------------------
  const notifyCandidateApplied = ({ recruiterEmail, candidateName, candidateEmail, jobTitle }) => {
    const title = `📩 New Candidate Application Received`;
    const message = `Candidate ${candidateName || candidateEmail} has applied for vacancy "${jobTitle}" on CAREONIX. Review profile in Candidate Applications.`;

    addNotification({
      recipientRole: 'recruiter',
      recipientEmail: (recruiterEmail || '').toLowerCase().trim(),
      title,
      message,
      type: 'NEW_APPLICATION',
      channel: 'BOTH',
      sender: candidateEmail
    });
  };

  // ----------------------------------------------------
  // FLOW 3: Recruiter -> Admin (Recruiter Registration / Verification Event)
  // ----------------------------------------------------
  const notifyRecruiterEventToAdmin = ({ recruiterName, company, email, eventType }) => {
    const title = `🛡️ Recruiter Action: ${eventType || 'New Registration'}`;
    const message = `Recruiter ${recruiterName || company} (${email}) has submitted details for ${eventType || 'account verification'}. Action required in Admin Verification panel.`;

    addNotification({
      recipientRole: 'admin',
      recipientEmail: 'admin@careonix.com',
      title,
      message,
      type: 'ADMIN_ALERT',
      channel: 'BELL',
      sender: email
    });
  };

  // ----------------------------------------------------
  // FLOW 4: Admin -> Recruiter (Account Approved / Rejected / Deleted)
  // ----------------------------------------------------
  const notifyAdminRecruiterAction = ({ recruiterEmail, company, action }) => {
    const cleanEmail = (recruiterEmail || '').toLowerCase().trim();
    let title = '';
    let message = '';
    let type = 'ADMIN_ACTION';

    if (action === 'APPROVED' || action === 'VERIFIED') {
      title = `🎉 Congratulations! Recruiter Account Approved`;
      message = `Your Recruiter Account for "${company || 'Organization'}" has been Verified & Approved by System Admin! You now have full access to post job vacancies and search candidates on CAREONIX.`;
    } else if (action === 'REJECTED') {
      title = `⚠️ Recruiter Account Verification Update`;
      message = `Your account verification for "${company || 'Organization'}" was Rejected by System Admin. Please update your company details or contact support.`;
    } else if (action === 'DELETED') {
      title = `🚨 Account Notice: Recruiter Account Removed`;
      message = `Your Recruiter Account for "${company || 'Organization'}" has been removed by System Admin.`;
    } else {
      title = `📢 Recruiter Account Notice`;
      message = `System Admin updated your account status to ${action} for ${company || 'Organization'}.`;
    }

    addNotification({
      recipientRole: 'recruiter',
      recipientEmail: cleanEmail,
      title,
      message,
      type,
      channel: 'BOTH',
      sender: 'admin@careonix.com'
    });
  };

  // ----------------------------------------------------
  // FLOW 5: Admin -> Candidate (Announcements, Security, System Updates)
  // ----------------------------------------------------
  const notifyAdminToCandidate = ({ candidateEmail, title, message, category }) => {
    addNotification({
      recipientRole: 'candidate',
      recipientEmail: candidateEmail ? candidateEmail.toLowerCase().trim() : 'all_candidates',
      title: title || `📢 CAREONIX Update`,
      message: message || `Important system notification from CAREONIX Administration.`,
      type: category || 'ADMIN_ANNOUNCEMENT',
      channel: 'BOTH',
      sender: 'admin@careonix.com'
    });
  };

  // ----------------------------------------------------
  // FLOW 6: User <-> User (New Direct Message Notification)
  // ----------------------------------------------------
  const notifyNewMessage = ({ recipientEmail, recipientRole, senderName, senderEmail, messageText, threadId }) => {
    if (!recipientEmail) return;
    addNotification({
      recipientRole: recipientRole || 'candidate',
      recipientEmail: (recipientEmail || '').toLowerCase().trim(),
      title: `💬 New Message from ${senderName || senderEmail}`,
      message: messageText?.length > 80 ? `${messageText.slice(0, 80)}...` : messageText,
      type: 'NEW_MESSAGE',
      channel: 'BELL',
      sender: senderName || senderEmail,
      threadId
    });
  };

  // Mark single notification as read
  const markAsRead = (id) => {
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    saveNotifications(updated);
  };

  // Mark all notifications as read for current user
  const markAllAsRead = (email, role) => {
    const userNotifs = getNotificationsForUser(email, role);
    const userNotifIds = new Set(userNotifs.map(n => n.id));
    const updated = notifications.map(n => {
      if (userNotifIds.has(n.id)) {
        return { ...n, read: true };
      }
      return n;
    });
    saveNotifications(updated);
  };

  // Get notifications filtered for specific user email & role
  const getNotificationsForUser = (userEmail, userRole) => {
    const cleanEmail = (userEmail || '').toLowerCase().trim();
    return notifications.filter(n => {
      // Admin sees all system notifications
      if (userRole === 'admin') return true;

      // ── Broadcast to ALL users (every role) ──
      if (n.recipientEmail === 'all_users' || n.audience === 'All Users') return true;

      // ── Candidate rules ──
      if (userRole === 'candidate') {
        // Explicit broadcast to all candidates
        if (n.recipientEmail === 'all_candidates' || n.audience === 'All Candidates') return true;
        // Direct email match only
        if (cleanEmail && n.recipientEmail && n.recipientEmail.toLowerCase().trim() === cleanEmail) return true;
      }

      // ── Recruiter rules ──
      if (userRole === 'recruiter') {
        // Explicit broadcast to all recruiters
        if (n.recipientEmail === 'all_recruiters' || n.audience === 'All Recruiters' || n.audience === 'All Companies') return true;
        // Direct email match only — NOT role-based broadcast
        if (cleanEmail && n.recipientEmail && n.recipientEmail.toLowerCase().trim() === cleanEmail) return true;
      }

      return false;
    });
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      addNotification,
      markAsRead,
      markAllAsRead,
      getNotificationsForUser,
      notifyJobPosted,
      notifyApplicationStatusChange,
      notifyExternalJobStatusChange,
      notifyCandidateApplied,
      notifyRecruiterEventToAdmin,
      notifyAdminRecruiterAction,
      notifyAdminToCandidate,
      notifyNewMessage
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}
