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
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import WhatsAppChatInput, { WhatsAppMessageBubble } from '../components/WhatsAppChatInput';

export default function CandidateMessagesPage() {
  const { user } = useAuth();
  const {
    threads,
    sendMessage,
    markThreadAsRead,
    getEligibleRecruitersForCandidate,
    getOrCreateCandidateRecruiterThread,
    getOrCreateRecruiterAdminThread,
    isCandidateBlocked
  } = useChat();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeThreadId, setActiveThreadId] = useState(() => {
    try {
      return sessionStorage.getItem('careonix_active_chat_thread') || null;
    } catch (_) {
      return null;
    }
  });
  const [inputText, setInputText] = useState('');
  const chatContainerRef = useRef(null);

  const candidateEmail = (user?.email || user?.identifier || '').toLowerCase().trim();
  const eligibleRecruiters = getEligibleRecruitersForCandidate(candidateEmail);

  // Auto-create threads for candidate's applied job vacancies
  useEffect(() => {
    if (eligibleRecruiters && eligibleRecruiters.length > 0) {
      eligibleRecruiters.forEach(rec => {
        getOrCreateCandidateRecruiterThread({
          candidateEmail,
          candidateName: user?.name || candidateEmail.split('@')[0],
          recruiterEmail: rec.recruiterEmail,
          recruiterName: rec.recruiterName,
          companyName: rec.companyName,
          jobId: rec.jobId,
          jobTitle: rec.jobTitle
        });
      });
    }
  }, [eligibleRecruiters?.length, candidateEmail]);

  const candThreads = (threads || []).filter(t => {
    const tCand = (t.candidateEmail || '').toLowerCase().trim();
    const tRec = (t.recruiterEmail || '').toLowerCase().trim();
    if (t.type === 'recruiter_admin') {
      return tCand === candidateEmail || tRec === candidateEmail;
    }
    return tCand === candidateEmail || (user?.identifier && tCand === (user.identifier || '').toLowerCase().trim());
  });

  // Sort by recent activity timestamp (WhatsApp style: latest activity moves to top!)
  const sortedThreads = [...candThreads].sort((a, b) => {
    const timeA = a.messages?.[a.messages.length - 1]?.timestamp || a.updatedAt || 0;
    const timeB = b.messages?.[b.messages.length - 1]?.timestamp || b.updatedAt || 0;
    return timeB - timeA;
  });

  const filteredThreads = sortedThreads.filter(t => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    const name = (t.companyName || t.candidateName || t.recruiterName || '').toLowerCase();
    const job = (t.jobTitle || '').toLowerCase();
    return name.includes(q) || job.includes(q);
  });

  // Ensure activeThreadId selects the requested thread or defaults to the first available
  useEffect(() => {
    const stored = sessionStorage.getItem('careonix_active_chat_thread');
    if (stored && threads.some(t => t.id === stored)) {
      setActiveThreadId(stored);
      sessionStorage.removeItem('careonix_active_chat_thread');
    } else if (filteredThreads.length > 0 && (!activeThreadId || !threads.some(t => t.id === activeThreadId))) {
      setActiveThreadId(filteredThreads[0].id);
    }
  }, [filteredThreads.length, threads.length]);

  const activeThread = (threads || []).find(t => t.id === activeThreadId) || filteredThreads[0];
  const isBlocked = activeThread ? (isCandidateBlocked(candidateEmail) || isCandidateBlocked(activeThread.id)) : false;
  const isAdminSupportThread = activeThread?.type === 'recruiter_admin';

  useEffect(() => {
    if (activeThread?.id) {
      markThreadAsRead(activeThread.id, 'candidate');
    }
  }, [activeThread?.id, activeThread?.messages?.length]);

  // Smooth scroll ONLY inside message history container without scrolling main document
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [activeThread?.messages?.length, activeThreadId]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeThread) return;
    sendMessage(activeThread.id, inputText, 'candidate', candidateEmail);
    setInputText('');
  };

  const handleContactAdmin = () => {
    const thread = getOrCreateRecruiterAdminThread(candidateEmail, user?.name, 'Candidate Account');
    if (thread) setActiveThreadId(thread.id);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', background: '#f8fafc', height: 'calc(100vh - 120px)', overflow: 'hidden', fontFamily: 'Inter, sans-serif' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            Candidate Messages 💬
          </h1>
          <p style={{ color: '#64748b', marginTop: '2px', fontSize: '0.84rem', margin: 0 }}>
            Direct WhatsApp-style 1-on-1 messaging with recruiters of your applied CAREONIX jobs.
          </p>
        </div>

        <button
          onClick={handleContactAdmin}
          style={{
            padding: '0.65rem 1.15rem',
            background: 'linear-gradient(135deg, #4f46e5, #3730a3)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '12px',
            fontWeight: '700',
            fontSize: '0.85rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            boxShadow: '0 4px 12px rgba(79,70,229,0.2)'
          }}
        >
          <Shield size={16} /> Contact Admin Support
        </button>
      </div>

      {/* Main Messaging Container */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '1.25rem', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '24px', overflow: 'hidden', flex: 1, minHeight: 0, boxShadow: '0 4px 20px rgba(15,23,42,0.04)' }}>
        
        {/* Left Conversation List */}
        <div style={{ borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', background: '#ffffff', height: '100%', minHeight: 0, overflow: 'hidden' }}>
          
          {/* Search Box */}
          <div style={{ padding: '1rem', borderBottom: '1px solid #f1f5f9', flexShrink: 0 }}>
            <div style={{ position: 'relative' }}>
              <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Search recruiters, jobs, companies..."
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
                <div style={{ fontWeight: '700', color: '#0f172a', marginBottom: '4px' }}>No recruiter chats yet</div>
                <p style={{ margin: 0, lineHeight: 1.45 }}>
                  You can message recruiters once you apply for jobs directly on CAREONIX!
                </p>
              </div>
            ) : (
              filteredThreads.map(t => {
                const isActive = t.id === activeThreadId;
                const isSystemAdmin = t.type === 'recruiter_admin';
                const lastMsg = t.messages?.[t.messages.length - 1];
                const unreadCount = t.unreadCounts?.candidate || 0;

                return (
                  <div
                    key={t.id}
                    onClick={() => setActiveThreadId(t.id)}
                    style={{
                      padding: '0.9rem 1rem',
                      borderBottom: '1px solid #f8fafc',
                      background: isActive ? '#f3e8ff' : 'transparent',
                      borderLeft: isActive ? '4px solid #7c3aed' : '4px solid transparent',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem'
                    }}
                  >
                    <div style={{
                      width: '42px', height: '42px', borderRadius: '50%',
                      background: isSystemAdmin ? '#4f46e5' : '#7c3aed',
                      color: '#ffffff', fontWeight: '800', fontSize: '0.9rem',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {isSystemAdmin ? <Shield size={20} /> : (t.companyName || 'C').charAt(0).toUpperCase()}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                        <span style={{ fontWeight: '800', fontSize: '0.86rem', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {isSystemAdmin ? 'CAREONIX Support' : t.companyName}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                            {lastMsg?.time || ''}
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

                      <div style={{ fontSize: '0.75rem', color: '#7c3aed', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '2px' }}>
                        {isSystemAdmin ? 'System Administrator' : t.jobTitle}
                      </div>

                      <div style={{ fontSize: '0.78rem', color: unreadCount > 0 ? '#0f172a' : '#64748b', fontWeight: unreadCount > 0 ? '700' : '400', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {lastMsg ? lastMsg.text : 'Tap to open chat...'}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Active Chat Window */}
        {activeThread ? (
          <div style={{ display: 'flex', flexDirection: 'column', background: '#f8fafc', height: '100%', minHeight: 0, overflow: 'hidden' }}>
            
            {/* Chat Top Header */}
            <div style={{ padding: '1rem 1.5rem', background: '#ffffff', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div style={{
                  width: '44px', height: '44px', borderRadius: '50%',
                  background: activeThread.type === 'recruiter_admin' ? '#4f46e5' : '#7c3aed',
                  color: '#ffffff', fontWeight: '800', fontSize: '1rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {activeThread.type === 'recruiter_admin' ? <Shield size={22} /> : (activeThread.companyName || 'C').charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {activeThread.type === 'recruiter_admin' ? 'CAREONIX System Admin' : activeThread.companyName}
                    <CheckCircle2 size={16} color="#16a34a" />
                  </h3>
                  <span style={{ fontSize: '0.78rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Briefcase size={13} color="#7c3aed" /> {activeThread.type === 'recruiter_admin' ? 'Official Admin Support' : activeThread.jobTitle} &bull; <span style={{ color: '#16a34a', fontWeight: '700' }}>● Online</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Candidate Admin Support Warning Banner */}
            {isAdminSupportThread && !isBlocked && (
              <div style={{ background: '#fff7ed', borderBottom: '1px solid #fed7aa', padding: '0.75rem 1.25rem', boxShadow: '0 1px 4px rgba(234,88,12,0.05)', flexShrink: 0 }}>
                <div style={{ color: '#c2410c', fontWeight: '800', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  ⚠️ Notice: Candidate support messages are strictly restricted for urgent issues:
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{ background: '#ffedd5', color: '#9a3412', border: '1px solid #fdba74', padding: '3px 10px', borderRadius: '8px', fontSize: '0.74rem', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    🚫 Misbehave by recruiter
                  </span>
                  <span style={{ background: '#ffedd5', color: '#9a3412', border: '1px solid #fdba74', padding: '3px 10px', borderRadius: '8px', fontSize: '0.74rem', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    ⚡ Server glitch
                  </span>
                  <span style={{ background: '#ffedd5', color: '#9a3412', border: '1px solid #fdba74', padding: '3px 10px', borderRadius: '8px', fontSize: '0.74rem', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    🛠️ System error
                  </span>
                </div>
              </div>
            )}

            {/* Blocked Candidate Suspension Banner */}
            {isBlocked && (
              <div style={{ background: '#fef2f2', borderBottom: '1px solid #fca5a5', color: '#991b1b', padding: '0.85rem 1.25rem', fontWeight: '800', fontSize: '0.84rem', display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                ⛔ Your support messaging access has been suspended by System Admin due to policy violation. Text input is locked.
              </div>
            )}

            {/* Message History Area (Internal Scroll) */}
            <div ref={chatContainerRef} style={{ flex: 1, padding: '1.25rem 1.5rem', overflowY: 'auto', minHeight: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {activeThread.messages?.map((msg, idx) => {
                const isCandidateMsg = msg.sender === 'candidate';
                const isSystemMsg = msg.sender === 'system';

                if (isSystemMsg) {
                  return (
                    <div key={idx} style={{ textAlign: 'center', margin: '0.5rem 0' }}>
                      <span style={{ background: '#f1f5f9', color: '#64748b', padding: '4px 12px', borderRadius: '50px', fontSize: '0.74rem', fontWeight: '600' }}>
                        {msg.text}
                      </span>
                    </div>
                  );
                }

                return (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: isCandidateMsg ? 'flex-end' : 'flex-start',
                      maxWidth: '75%',
                      alignSelf: isCandidateMsg ? 'flex-end' : 'flex-start'
                    }}
                  >
                    <div style={{
                      background: isCandidateMsg ? 'linear-gradient(135deg, #7c3aed, #4f46e5)' : '#ffffff',
                      color: isCandidateMsg ? '#ffffff' : '#0f172a',
                      padding: '0.85rem 1.15rem',
                      borderRadius: isCandidateMsg ? '18px 18px 2px 18px' : '18px 18px 18px 2px',
                      boxShadow: '0 2px 8px rgba(15,23,42,0.04)',
                      fontSize: '0.9rem',
                      lineHeight: '1.45',
                      border: isCandidateMsg ? 'none' : '1px solid #e2e8f0'
                    }}>
                      <WhatsAppMessageBubble msg={msg} isOwn={isCandidateMsg} />
                    </div>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '4px', fontWeight: '500' }}>
                      {msg.time}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Message Input Bar (WhatsApp Media & Emoji Enabled for Recruiter Chat, Blocked/Text-Only for Admin Support) */}
            <WhatsAppChatInput
              onSendMessage={(txt, media) => {
                if (!activeThread || isBlocked) return;
                sendMessage(activeThread.id, txt, 'candidate', candidateEmail, media);
              }}
              disabled={isBlocked}
              hideAttachmentsAndEmojis={isAdminSupportThread}
              placeholder={
                isBlocked
                  ? "🔒 Locked: You have been blocked by System Admin from sending support messages."
                  : `Type a message to ${isAdminSupportThread ? 'Admin Support' : activeThread.companyName}...`
              }
            />

          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem', color: '#64748b', textAlign: 'center' }}>
            <MessageSquare size={48} color="#94a3b8" style={{ marginBottom: '1rem' }} />
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800', color: '#0f172a' }}>Select a conversation</h3>
            <p style={{ fontSize: '0.88rem', color: '#64748b', maxWidth: '360px', marginTop: '6px' }}>
              Choose a recruiter conversation from the list to start messaging.
            </p>
          </div>
        )}

      </div>

    </div>
  );
}
