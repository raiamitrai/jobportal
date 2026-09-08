import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Send,
  User,
  Search,
  CheckCircle2,
  Building,
  Briefcase,
  Shield,
  Clock,
  Eye,
  FileText,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import WhatsAppChatInput, { WhatsAppMessageBubble } from '../components/WhatsAppChatInput';
import {
  formatWhatsAppChatListTime,
  formatWhatsAppDateSeparator,
  formatWhatsAppMessageTime,
  formatExactDateTime,
  extractTimestamp,
  useRelativeTimeTick
} from '../utils/timeAgo';

// Helper to format names per user rule:
// Candidate:  Name ( candidate )  e.g. Ram ( candidate )
// Recruiter:  Name ( Company )    e.g. Mohan ( Rex )
const formatCandidateName = (name) => {
  const cleanName = (name || 'Candidate').trim();
  return `${cleanName} ( candidate )`;
};

const formatRecruiterName = (name, company) => {
  const cleanName = (name || 'Recruiter').trim();
  let cleanComp = (company || '').trim();
  if (!cleanComp || cleanComp === 'Candidate Account' || cleanComp === 'Company') {
    cleanComp = cleanName;
  }
  return `${cleanName} ( ${cleanComp} )`;
};

const isCandidateThread = (t) => {
  if (!t) return false;
  if (t.userRole === 'candidate') return true;
  const comp = (t.companyName || '').toLowerCase();
  const rec = (t.recruiterName || '').toLowerCase();
  const cand = (t.candidateName || '').toLowerCase();
  if (comp.includes('candidate') || rec.includes('candidate') || cand.includes('candidate')) return true;
  if (t.candidateEmail && !t.recruiterName) return true;
  return false;
};

const getFormattedThreadTitle = (t) => {
  if (!t) return '';
  if (t.type === 'candidate_recruiter') {
    return `${formatCandidateName(t.candidateName)} ↔ ${formatRecruiterName(t.recruiterName || t.companyName, t.companyName)}`;
  }
  if (isCandidateThread(t)) {
    return formatCandidateName(t.candidateName || t.recruiterName || t.companyName || t.recruiterEmail?.split('@')[0]);
  }
  return formatRecruiterName(t.recruiterName || t.companyName, t.companyName);
};

export default function AdminMessagesPage() {
  const { user } = useAuth();
  useRelativeTimeTick(30000);
  const { threads, sendMessage, markThreadAsRead, blockCandidate, unblockCandidate, isCandidateBlocked } = useChat();

  const [activeTab, setActiveTab] = useState('support'); // 'support' | 'audit'
  const [searchQuery, setSearchQuery] = useState('');
  const [activeThreadId, setActiveThreadId] = useState(null);
  const [inputText, setInputText] = useState('');
  const chatContainerRef = useRef(null);

  const adminEmail = (user?.email || 'admin@careonix.com').toLowerCase().trim();

  // Support Threads: recruiter_admin
  const supportThreads = (threads || []).filter(t => t.type === 'recruiter_admin');

  // Audit Threads: candidate_recruiter
  const auditThreads = (threads || []).filter(t => t.type === 'candidate_recruiter');

  const currentCategoryThreads = activeTab === 'support' ? supportThreads : auditThreads;

  // Sort by recent activity timestamp (WhatsApp style: latest activity moves to top!)
  const sortedThreads = [...currentCategoryThreads].sort((a, b) => {
    const timeA = a.messages?.[a.messages.length - 1]?.timestamp || a.updatedAt || 0;
    const timeB = b.messages?.[b.messages.length - 1]?.timestamp || b.updatedAt || 0;
    return timeB - timeA;
  });

  // Filter by Search Query
  const filteredThreads = sortedThreads.filter(t => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    const cand = (t.candidateName || '').toLowerCase();
    const rec = (t.recruiterName || '').toLowerCase();
    const comp = (t.companyName || '').toLowerCase();
    const job = (t.jobTitle || '').toLowerCase();
    return cand.includes(q) || rec.includes(q) || comp.includes(q) || job.includes(q);
  });

  useEffect(() => {
    if (filteredThreads.length > 0) {
      setActiveThreadId(filteredThreads[0].id);
    } else {
      setActiveThreadId(null);
    }
  }, [activeTab, filteredThreads.length]);

  const activeThread = (threads || []).find(t => t.id === activeThreadId) || filteredThreads[0];

  useEffect(() => {
    if (activeThreadId) {
      markThreadAsRead(activeThreadId, 'admin');
    }
  }, [activeThreadId, activeThread?.messages?.length]);

  // Smooth scroll ONLY inside the message container without moving outer page
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [activeThread?.messages?.length, activeThreadId]);

  const handleSendAdminReply = (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeThread || activeTab !== 'support') return;
    sendMessage(activeThread.id, inputText, 'admin', adminEmail);
    setInputText('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', background: '#f8fafc', height: 'calc(100vh - 120px)', overflow: 'hidden', fontFamily: 'Inter, sans-serif' }}>
      
      {/* Header */}
      <div style={{ flexShrink: 0 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          Admin Messages & Audit Center 💬
        </h1>
        <p style={{ color: '#64748b', marginTop: '2px', fontSize: '0.84rem', margin: 0 }}>
          Manage recruiter support channels & inspect candidate-recruiter chat logs for compliance & security.
        </p>
      </div>

      {/* Main Top Navigation Tabs */}
      <div style={{ display: 'flex', gap: '0.75rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.4rem', flexShrink: 0 }}>
        <button
          onClick={() => setActiveTab('support')}
          style={{
            padding: '0.65rem 1.25rem',
            background: activeTab === 'support' ? 'linear-gradient(135deg, #4f46e5, #3730a3)' : '#ffffff',
            color: activeTab === 'support' ? '#ffffff' : '#475569',
            border: activeTab === 'support' ? 'none' : '1px solid #cbd5e1',
            borderRadius: '12px',
            fontWeight: '800',
            fontSize: '0.86rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            boxShadow: activeTab === 'support' ? '0 4px 12px rgba(79,70,229,0.2)' : 'none'
          }}
        >
          <Shield size={16} /> 🛡️ Support Desk Channels ({supportThreads.length})
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          style={{
            padding: '0.65rem 1.25rem',
            background: activeTab === 'audit' ? 'linear-gradient(135deg, #7c3aed, #6d28d9)' : '#ffffff',
            color: activeTab === 'audit' ? '#ffffff' : '#475569',
            border: activeTab === 'audit' ? 'none' : '1px solid #cbd5e1',
            borderRadius: '12px',
            fontWeight: '800',
            fontSize: '0.86rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            boxShadow: activeTab === 'audit' ? '0 4px 12px rgba(124,58,237,0.2)' : 'none'
          }}
        >
          <Eye size={16} /> 👁️ Candidate-Recruiter Audit Monitor ({auditThreads.length})
        </button>
      </div>

      {/* Main Messaging Layout (2 Columns) */}
      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '1.25rem', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '24px', overflow: 'hidden', flex: 1, minHeight: 0, boxShadow: '0 4px 20px rgba(15,23,42,0.04)' }}>
        
        {/* Left Conversation List */}
        <div style={{ borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', background: '#ffffff', height: '100%', minHeight: 0, overflow: 'hidden' }}>
          
          {/* Search Box */}
          <div style={{ padding: '1rem', borderBottom: '1px solid #f1f5f9', flexShrink: 0 }}>
            <div style={{ position: 'relative' }}>
              <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder={activeTab === 'support' ? "Search recruiter support threads..." : "Search candidate/recruiter logs..."}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '0.6rem 0.85rem 0.6rem 2.25rem', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.82rem', outline: 'none', background: '#f8fafc' }}
              />
            </div>
          </div>

          {/* Conversations List */}
          <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
            {filteredThreads.length === 0 ? (
              <div style={{ padding: '2rem 1.25rem', textAlign: 'center', color: '#64748b', fontSize: '0.82rem' }}>
                <AlertCircle size={28} color="#94a3b8" style={{ marginBottom: '8px' }} />
                <div style={{ fontWeight: '700', color: '#0f172a', marginBottom: '4px' }}>No conversations found</div>
                <p style={{ margin: 0, lineHeight: 1.45 }}>
                  {activeTab === 'support' ? "No recruiter support queries received yet." : "No active candidate-recruiter chat logs found."}
                </p>
              </div>
            ) : (
              filteredThreads.map(t => {
                const isActive = t.id === activeThreadId;
                const lastMsg = t.messages?.[t.messages.length - 1];
                const unreadCount = t.unreadCounts?.admin || 0;

                return (
                  <div
                    key={t.id}
                    onClick={() => setActiveThreadId(t.id)}
                    style={{
                      padding: '0.9rem 1rem',
                      borderBottom: '1px solid #f8fafc',
                      background: isActive ? (activeTab === 'support' ? '#eff6ff' : '#f3e8ff') : 'transparent',
                      borderLeft: isActive ? `4px solid ${activeTab === 'support' ? '#2563eb' : '#7c3aed'}` : '4px solid transparent',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem'
                    }}
                  >
                    <div style={{
                      width: '42px', height: '42px', borderRadius: '50%',
                      background: activeTab === 'support' ? '#2563eb' : '#7c3aed',
                      color: '#ffffff', fontWeight: '800', fontSize: '0.9rem',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {activeTab === 'support' ? <Building size={20} /> : (t.candidateName || 'C').charAt(0).toUpperCase()}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                        <span style={{ fontWeight: '800', fontSize: '0.86rem', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {getFormattedThreadTitle(t)}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span
                            title={formatExactDateTime(lastMsg?.timestamp || extractTimestamp(lastMsg?.id) || t.updatedAt)}
                            style={{ fontSize: '0.7rem', color: '#94a3b8', whiteSpace: 'nowrap' }}
                          >
                            {formatWhatsAppChatListTime(lastMsg?.timestamp || extractTimestamp(lastMsg?.id) || t.updatedAt, lastMsg?.time)}
                          </span>
                          {unreadCount > 0 && (
                            <span style={{
                              background: '#22c55e',
                              color: '#ffffff',
                              borderRadius: '50%',
                              minWidth: '20px',
                              height: '20px',
                              padding: '0 6px',
                              fontSize: '0.72rem',
                              fontWeight: '800',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justify: 'center'
                            }}>
                              {unreadCount}
                            </span>
                          )}
                        </div>
                      </div>

                      <div style={{ fontSize: '0.75rem', color: activeTab === 'support' ? '#2563eb' : '#7c3aed', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '2px' }}>
                        {activeTab === 'support' ? t.recruiterEmail : `Job: ${t.jobTitle}`}
                      </div>

                      <div style={{ fontSize: '0.78rem', color: unreadCount > 0 ? '#0f172a' : '#64748b', fontWeight: unreadCount > 0 ? '700' : '400', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {lastMsg ? lastMsg.text : 'Tap to inspect transcript...'}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Active Chat / Audit Monitor Window */}
        {activeThread ? (
          <div style={{ display: 'flex', flexDirection: 'column', background: '#f8fafc', height: '100%', minHeight: 0, overflow: 'hidden' }}>
            
            {/* Top Chat Header */}
            <div style={{ padding: '1rem 1.5rem', background: '#ffffff', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div style={{
                  width: '44px', height: '44px', borderRadius: '50%',
                  background: activeTab === 'support' ? '#2563eb' : '#7c3aed',
                  color: '#ffffff', fontWeight: '800', fontSize: '1rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {activeTab === 'support' ? <Building size={22} /> : <Eye size={22} />}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {getFormattedThreadTitle(activeThread)}
                    <CheckCircle2 size={16} color="#16a34a" />
                  </h3>
                  <span style={{ fontSize: '0.78rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Briefcase size={13} color="#4f46e5" /> {activeTab === 'support' ? `User / Support Email: ${activeThread.recruiterEmail}` : `Target Job: ${activeThread.jobTitle}`}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {activeTab === 'audit' && (
                  <span style={{ background: '#fef3c7', color: '#b45309', border: '1px solid #fcd34d', padding: '4px 12px', borderRadius: '50px', fontSize: '0.76rem', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                    👁️ Admin Compliance Read-Only Monitor
                  </span>
                )}

                {/* Admin Block / Unblock Candidate Toggle */}
                {(() => {
                  const targetEmail = (activeThread?.candidateEmail || activeThread?.recruiterEmail || '').toLowerCase().trim();
                  const targetKey = targetEmail || activeThread?.id;
                  const isBlocked = targetKey ? (isCandidateBlocked(targetKey) || isCandidateBlocked(activeThread?.id)) : false;

                  return isBlocked ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5', padding: '4px 10px', borderRadius: '50px', fontSize: '0.74rem', fontWeight: '800' }}>
                        🔴 Account Blocked
                      </span>
                      <button
                        onClick={() => {
                          if (targetEmail) unblockCandidate(targetEmail);
                          if (activeThread?.id) unblockCandidate(activeThread.id);
                        }}
                        style={{
                          background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0',
                          padding: '0.45rem 0.95rem', borderRadius: '10px', fontWeight: '800',
                          fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
                        }}
                        title="Unblock this user from sending support messages"
                      >
                        🔓 Unblock Candidate
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        if (targetEmail) blockCandidate(targetEmail);
                        if (activeThread?.id) blockCandidate(activeThread.id);
                      }}
                      style={{
                        background: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5',
                        padding: '0.45rem 0.95rem', borderRadius: '10px', fontWeight: '800',
                        fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
                      }}
                      title="Block this user from sending support messages"
                    >
                      🚫 Block Candidate
                    </button>
                  );
                })()}
              </div>
            </div>

            {/* Message History Area (Internal Scroll) */}
            <div ref={chatContainerRef} style={{ flex: 1, padding: '1.25rem 1.5rem', overflowY: 'auto', minHeight: 0, display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {activeThread.messages?.map((msg, idx) => {
                const isAdminMsg = msg.sender === 'admin';
                const isCandidateMsg = msg.sender === 'candidate';
                const isRecruiterMsg = msg.sender === 'recruiter';
                const msgTs = msg.timestamp || extractTimestamp(msg.id) || Date.now();

                // Group by calendar day for WhatsApp date separator banner
                const curDateKey = new Date(msgTs).toDateString();
                const prevMsg = idx > 0 ? activeThread.messages[idx - 1] : null;
                const prevMsgTs = prevMsg ? (prevMsg.timestamp || extractTimestamp(prevMsg.id) || Date.now()) : null;
                const prevDateKey = prevMsgTs ? new Date(prevMsgTs).toDateString() : null;
                const isNewDay = idx === 0 || curDateKey !== prevDateKey;

                let bg = '#ffffff';
                let textColor = '#0f172a';
                let align = 'flex-start';
                let label = 'User';

                if (activeTab === 'support') {
                  align = isAdminMsg ? 'flex-end' : 'flex-start';
                  bg = isAdminMsg ? 'linear-gradient(135deg, #4f46e5, #3730a3)' : '#ffffff';
                  textColor = isAdminMsg ? '#ffffff' : '#0f172a';
                  if (isAdminMsg) {
                    label = 'System Admin';
                  } else if (isCandidateThread(activeThread)) {
                    label = formatCandidateName(activeThread.candidateName || activeThread.recruiterName || 'Candidate');
                  } else {
                    label = formatRecruiterName(activeThread.recruiterName || activeThread.companyName, activeThread.companyName);
                  }
                } else {
                  // Audit Mode
                  align = isCandidateMsg ? 'flex-start' : 'flex-end';
                  bg = isCandidateMsg ? '#eff6ff' : '#f3e8ff';
                  textColor = '#0f172a';
                  label = isCandidateMsg
                    ? formatCandidateName(activeThread.candidateName)
                    : formatRecruiterName(activeThread.recruiterName || activeThread.companyName, activeThread.companyName);
                }

                return (
                  <React.Fragment key={msg.id || idx}>
                    {/* WhatsApp Date Separator Banner (TODAY, YESTERDAY, Day of Week, Date) */}
                    {isNewDay && (
                      <div style={{ display: 'flex', justifyContent: 'center', margin: '0.65rem 0' }}>
                        <span style={{
                          background: '#ffffff',
                          color: '#64748b',
                          padding: '4px 14px',
                          borderRadius: '8px',
                          fontSize: '0.72rem',
                          fontWeight: '700',
                          letterSpacing: '0.04em',
                          border: '1px solid #e2e8f0',
                          boxShadow: '0 1px 3px rgba(15,23,42,0.05)',
                          textTransform: 'uppercase'
                        }}>
                          {formatWhatsAppDateSeparator(msgTs)}
                        </span>
                      </div>
                    )}

                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: align,
                        maxWidth: '75%',
                        alignSelf: align
                      }}
                    >
                      <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700', marginBottom: '2px' }}>
                        {label}
                      </span>
                      <div style={{
                        background: bg,
                        color: textColor,
                        padding: '0.85rem 1.15rem',
                        borderRadius: '16px',
                        boxShadow: '0 2px 8px rgba(15,23,42,0.04)',
                        fontSize: '0.9rem',
                        lineHeight: '1.45',
                        border: isAdminMsg ? 'none' : '1px solid #e2e8f0'
                      }}>
                        <WhatsAppMessageBubble msg={msg} isOwn={isAdminMsg} />
                      </div>
                      <span
                        title={formatExactDateTime(msgTs)}
                        style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '4px', fontWeight: '500' }}
                      >
                        {formatWhatsAppMessageTime(msg)}
                      </span>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>

            {/* Input Bar (WhatsApp Media & Emoji Enabled) */}
            {activeTab === 'support' ? (
              <WhatsAppChatInput
                onSendMessage={(txt, media) => {
                  if (!activeThread) return;
                  sendMessage(activeThread.id, txt, 'admin', adminEmail, media);
                }}
                placeholder={`Reply as System Admin to ${getFormattedThreadTitle(activeThread)}...`}
              />
            ) : (
              <div style={{ padding: '1rem 1.5rem', background: '#ffffff', borderTop: '1px solid #e2e8f0', textAlign: 'center', color: '#64748b', fontSize: '0.82rem', fontWeight: '600' }}>
                🔒 Read-Only Audit View: As System Admin, you are monitoring live Candidate-Recruiter chat logs.
              </div>
            )}

          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem', color: '#64748b', textAlign: 'center' }}>
            <MessageSquare size={48} color="#94a3b8" style={{ marginBottom: '1rem' }} />
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800', color: '#0f172a' }}>Select a conversation</h3>
            <p style={{ fontSize: '0.88rem', color: '#64748b', maxWidth: '360px', marginTop: '6px' }}>
              Choose a support channel or audit thread from the left menu to view.
            </p>
          </div>
        )}

      </div>

    </div>
  );
}
