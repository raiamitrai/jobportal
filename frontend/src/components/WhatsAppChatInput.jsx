import React, { useState, useEffect, useRef } from 'react';
import {
  Paperclip,
  Smile,
  Send,
  Image as ImageIcon,
  Video as VideoIcon,
  FileText,
  Mic,
  UserCheck,
  Sticker as StickerIcon,
  X,
  Check,
  Download,
  Phone
} from 'lucide-react';

const EMOJI_LIST = [
  '😀', '😂', '😍', '😊', '😎', '🙏', '👍', '🙌', '🚀', '💼',
  '📄', '✅', '🎯', '🏆', '💡', '🔥', '🤝', '💬', '📌', '🌟',
  '⚡', '🎉', '📑', '📁', '📞', '✉️', '💯', '⭐', '👏', '❤️',
  '❤️‍🔥', '✨', '👋', '🥳', '👇', '👉', '💼', '📊', '📈', '🏅'
];

const STICKERS_LIST = [
  { id: 'st1', label: '🎯 Hired!', bg: '#dcfce7', color: '#15803d', text: '🎯 HIRED & SELECTED!' },
  { id: 'st2', label: '🚀 Lets Connect', bg: '#eff6ff', color: '#1d4ed8', text: '🚀 LETS CONNECT!' },
  { id: 'st3', label: '💼 Interview Scheduled', bg: '#f3e8ff', color: '#7e22ce', text: '💼 INTERVIEW SCHEDULED' },
  { id: 'st4', label: '⭐ Approved', bg: '#fef3c7', color: '#b45309', text: '⭐ PROFILE APPROVED' },
  { id: 'st5', label: '🔥 Awesome Profile', bg: '#ffe4e6', color: '#be123c', text: '🔥 AWESOME PROFILE!' },
  { id: 'st6', label: '📜 Offer Letter Ready', bg: '#e0e7ff', color: '#4338ca', text: '📜 OFFER LETTER READY' },
  { id: 'st7', label: '👍 Verified', bg: '#f0fdf4', color: '#16a34a', text: '👍 VERIFIED & APPROVED' },
  { id: 'st8', label: '🎉 Congratulations', bg: '#fae8ff', color: '#86198f', text: '🎉 CONGRATULATIONS!' }
];

export default function WhatsAppChatInput({ onSendMessage, placeholder = "Type a message...", disabled = false, hideAttachmentsAndEmojis = false }) {
  const [text, setText] = useState('');
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);

  // Contact form state
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  // Hidden File Input Refs
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const docInputRef = useRef(null);
  const audioInputRef = useRef(null);

  // Root Container Ref for Outside Click Detection
  const containerRef = useRef(null);

  // Close attachment menu, emoji picker, and sticker picker on click anywhere outside on screen
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowAttachMenu(false);
        setShowEmojiPicker(false);
        setShowStickerPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!text.trim() || disabled) return;
    onSendMessage(text, null);
    setText('');
    setShowEmojiPicker(false);
    setShowAttachMenu(false);
    setShowStickerPicker(false);
  };

  // 1. Photo Upload
  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      onSendMessage(text || `📷 Photo: ${file.name}`, {
        mediaType: 'image',
        mediaUrl: evt.target.result,
        fileName: file.name,
        fileSize: (file.size / 1024).toFixed(1) + ' KB'
      });
      setText('');
      setShowAttachMenu(false);
    };
    reader.readAsDataURL(file);
  };

  // 2. Video Upload
  const handleVideoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      onSendMessage(text || `🎥 Video: ${file.name}`, {
        mediaType: 'video',
        mediaUrl: evt.target.result,
        fileName: file.name,
        fileSize: (file.size / (1024 * 1024)).toFixed(1) + ' MB'
      });
      setText('');
      setShowAttachMenu(false);
    };
    reader.readAsDataURL(file);
  };

  // 3. Document / PDF Upload
  const handleDocSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      onSendMessage(text || `📄 Document: ${file.name}`, {
        mediaType: 'document',
        mediaUrl: evt.target.result,
        fileName: file.name,
        fileSize: (file.size / 1024).toFixed(1) + ' KB'
      });
      setText('');
      setShowAttachMenu(false);
    };
    reader.readAsDataURL(file);
  };

  // 4. Audio Upload
  const handleAudioSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      onSendMessage(text || `🎙️ Voice Note / Audio`, {
        mediaType: 'audio',
        mediaUrl: evt.target.result,
        fileName: file.name,
        fileSize: (file.size / 1024).toFixed(1) + ' KB'
      });
      setText('');
      setShowAttachMenu(false);
    };
    reader.readAsDataURL(file);
  };

  // 5. Send Contact
  const handleSendContact = (e) => {
    e.preventDefault();
    if (!contactName.trim() || !contactPhone.trim()) return;
    onSendMessage(`📇 Contact: ${contactName}`, {
      mediaType: 'contact',
      contactName: contactName.trim(),
      contactPhone: contactPhone.trim()
    });
    setContactName('');
    setContactPhone('');
    setShowContactModal(false);
    setShowAttachMenu(false);
  };

  // 6. Send Sticker
  const handleSendSticker = (sticker) => {
    onSendMessage(sticker.text, {
      mediaType: 'sticker',
      stickerText: sticker.text,
      stickerBg: sticker.bg,
      stickerColor: sticker.color
    });
    setShowStickerPicker(false);
    setShowAttachMenu(false);
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>

      {/* Hidden File Inputs */}
      <input type="file" accept="image/*" ref={imageInputRef} style={{ display: 'none' }} onChange={handlePhotoSelect} />
      <input type="file" accept="video/*" ref={videoInputRef} style={{ display: 'none' }} onChange={handleVideoSelect} />
      <input type="file" accept=".pdf,.doc,.docx,.txt,.zip" ref={docInputRef} style={{ display: 'none' }} onChange={handleDocSelect} />
      <input type="file" accept="audio/*" ref={audioInputRef} style={{ display: 'none' }} onChange={handleAudioSelect} />

      {/* ── EMOJI PICKER POPUP ────────────────────────────────────────── */}
      {showEmojiPicker && (
        <div style={{
          position: 'absolute', bottom: '65px', left: '10px', width: '310px', background: '#ffffff',
          border: '1px solid #e2e8f0', borderRadius: '16px', boxShadow: '0 10px 30px rgba(15,23,42,0.15)',
          padding: '0.85rem', zIndex: 100
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: '800', color: '#64748b' }}>EMOJIS</span>
            <button onClick={() => setShowEmojiPicker(false)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}><X size={15} color="#94a3b8" /></button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px', maxHeight: '180px', overflowY: 'auto' }}>
            {EMOJI_LIST.map((emoji, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => { setText(prev => prev + emoji); setShowEmojiPicker(false); }}
                style={{ fontSize: '1.25rem', background: 'none', border: 'none', cursor: 'pointer', padding: '4px', borderRadius: '6px' }}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── STICKER PICKER POPUP ──────────────────────────────────────── */}
      {showStickerPicker && (
        <div style={{
          position: 'absolute', bottom: '65px', left: '40px', width: '320px', background: '#ffffff',
          border: '1px solid #e2e8f0', borderRadius: '18px', boxShadow: '0 10px 30px rgba(15,23,42,0.15)',
          padding: '1rem', zIndex: 100
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#0f172a' }}>🏷️ CAREONIX STICKERS</span>
            <button onClick={() => setShowStickerPicker(false)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}><X size={15} color="#94a3b8" /></button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
            {STICKERS_LIST.map(st => (
              <button
                key={st.id}
                type="button"
                onClick={() => handleSendSticker(st)}
                style={{
                  background: st.bg, color: st.color, border: '1px solid #cbd5e1', borderRadius: '10px',
                  padding: '0.65rem', fontSize: '0.78rem', fontWeight: '800', cursor: 'pointer', textAlign: 'center'
                }}
              >
                {st.text}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── ATTACHMENT MENU POPUP (WhatsApp Style) ────────────────────── */}
      {showAttachMenu && (
        <div style={{
          position: 'absolute', bottom: '65px', left: '45px', background: '#ffffff',
          border: '1px solid #e2e8f0', borderRadius: '20px', boxShadow: '0 15px 35px rgba(15,23,42,0.18)',
          padding: '0.75rem', zIndex: 100, display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '200px'
        }}>
          <button
            type="button"
            onClick={() => imageInputRef.current?.click()}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0.6rem 0.85rem', borderRadius: '12px', border: 'none', background: '#f8fafc', cursor: 'pointer', fontSize: '0.84rem', fontWeight: '700', color: '#0f172a', textAlign: 'left' }}
          >
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ImageIcon size={16} /></div>
            <span>Photo / Image</span>
          </button>

          <button
            type="button"
            onClick={() => videoInputRef.current?.click()}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0.6rem 0.85rem', borderRadius: '12px', border: 'none', background: '#f8fafc', cursor: 'pointer', fontSize: '0.84rem', fontWeight: '700', color: '#0f172a', textAlign: 'left' }}
          >
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><VideoIcon size={16} /></div>
            <span>Video Clip</span>
          </button>

          <button
            type="button"
            onClick={() => docInputRef.current?.click()}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0.6rem 0.85rem', borderRadius: '12px', border: 'none', background: '#f8fafc', cursor: 'pointer', fontSize: '0.84rem', fontWeight: '700', color: '#0f172a', textAlign: 'left' }}
          >
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#e0e7ff', color: '#4338ca', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FileText size={16} /></div>
            <span>Document / PDF</span>
          </button>

          <button
            type="button"
            onClick={() => audioInputRef.current?.click()}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0.6rem 0.85rem', borderRadius: '12px', border: 'none', background: '#f8fafc', cursor: 'pointer', fontSize: '0.84rem', fontWeight: '700', color: '#0f172a', textAlign: 'left' }}
          >
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#fae8ff', color: '#a855f7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Mic size={16} /></div>
            <span>Audio / Voice</span>
          </button>

          <button
            type="button"
            onClick={() => { setShowContactModal(true); setShowAttachMenu(false); }}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0.6rem 0.85rem', borderRadius: '12px', border: 'none', background: '#f8fafc', cursor: 'pointer', fontSize: '0.84rem', fontWeight: '700', color: '#0f172a', textAlign: 'left' }}
          >
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><UserCheck size={16} /></div>
            <span>Share Contact</span>
          </button>

          <button
            type="button"
            onClick={() => { setShowStickerPicker(true); setShowAttachMenu(false); }}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0.6rem 0.85rem', borderRadius: '12px', border: 'none', background: '#f8fafc', cursor: 'pointer', fontSize: '0.84rem', fontWeight: '700', color: '#0f172a', textAlign: 'left' }}
          >
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><StickerIcon size={16} /></div>
            <span>Stickers</span>
          </button>
        </div>
      )}

      {/* ── SHARE CONTACT MODAL ────────────────────────────────────────── */}
      {showContactModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: '1rem' }}>
          <div style={{ width: '380px', background: '#ffffff', borderRadius: '20px', padding: '1.5rem', boxShadow: '0 20px 50px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '800', color: '#0f172a' }}>📇 Share Contact Card</h4>
              <button onClick={() => setShowContactModal(false)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}><X size={18} color="#94a3b8" /></button>
            </div>
            <form onSubmit={handleSendContact} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label style={{ fontSize: '0.76rem', fontWeight: '700', color: '#64748b', display: 'block', marginBottom: '4px' }}>Contact Name</label>
                <input
                  type="text"
                  placeholder="e.g. Hariom Rai"
                  value={contactName}
                  onChange={e => setContactName(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  required
                />
              </div>
              <div>
                <label style={{ fontSize: '0.76rem', fontWeight: '700', color: '#64748b', display: 'block', marginBottom: '4px' }}>Phone Number</label>
                <input
                  type="text"
                  placeholder="e.g. +91 98765 43210"
                  value={contactPhone}
                  onChange={e => setContactPhone(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  required
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
                <button type="button" onClick={() => setShowContactModal(false)} style={{ padding: '0.55rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', color: '#334155', fontWeight: '700' }}>Cancel</button>
                <button type="submit" style={{ padding: '0.55rem 1.15rem', borderRadius: '8px', background: '#4f46e5', color: '#fff', border: 'none', fontWeight: '800' }}>Share Contact</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MAIN INPUT BAR (WhatsApp Style) ─────────────────────────────── */}
      <form onSubmit={handleSubmit} style={{ padding: '0.85rem 1.25rem', background: '#ffffff', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
        
        {/* Emoji Button */}
        {!hideAttachmentsAndEmojis && (
          <button
            type="button"
            disabled={disabled}
            onClick={() => { setShowEmojiPicker(!showEmojiPicker); setShowAttachMenu(false); setShowStickerPicker(false); }}
            style={{ background: 'none', border: 'none', cursor: disabled ? 'not-allowed' : 'pointer', padding: '6px', color: '#64748b', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title="Emojis"
          >
            <Smile size={22} color={showEmojiPicker ? '#4f46e5' : '#64748b'} />
          </button>
        )}

        {/* Paperclip Button */}
        {!hideAttachmentsAndEmojis && (
          <button
            type="button"
            disabled={disabled}
            onClick={() => { setShowAttachMenu(!showAttachMenu); setShowEmojiPicker(false); setShowStickerPicker(false); }}
            style={{ background: 'none', border: 'none', cursor: disabled ? 'not-allowed' : 'pointer', padding: '6px', color: '#64748b', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title="Attach Media / File"
          >
            <Paperclip size={20} color={showAttachMenu ? '#4f46e5' : '#64748b'} />
          </button>
        )}

        {/* Text Input */}
        <input
          type="text"
          placeholder={placeholder}
          value={text}
          disabled={disabled}
          onChange={e => setText(e.target.value)}
          style={{ flex: 1, padding: '0.75rem 1.15rem', borderRadius: '24px', border: '1px solid #cbd5e1', fontSize: '0.88rem', outline: 'none', background: '#f8fafc' }}
        />

        {/* Send Button */}
        <button
          type="submit"
          disabled={disabled || !text.trim()}
          style={{
            padding: '0.75rem 1.25rem',
            background: disabled || !text.trim() ? '#cbd5e1' : 'linear-gradient(135deg, #4f46e5, #3730a3)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '24px',
            fontWeight: '800',
            fontSize: '0.88rem',
            cursor: disabled || !text.trim() ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            boxShadow: disabled || !text.trim() ? 'none' : '0 4px 14px rgba(79,70,229,0.3)'
          }}
        >
          <Send size={15} /> <span>Send</span>
        </button>
      </form>
    </div>
  );
}

// ── RICH MESSAGE CONTENT BUBBLE RENDERER (WhatsApp Style) ──────────────────
export function WhatsAppMessageBubble({ msg, isOwn }) {
  if (!msg) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxWidth: '100%' }}>
      
      {/* 1. PHOTO MESSAGE */}
      {msg.mediaType === 'image' && (
        <div style={{ borderRadius: '14px', overflow: 'hidden', border: '1px solid #e2e8f0', marginBottom: '4px', background: '#000' }}>
          <img src={msg.mediaUrl} alt={msg.fileName || 'Photo'} style={{ maxWidth: '280px', maxHeight: '240px', objectFit: 'cover', display: 'block' }} />
          {msg.fileName && <div style={{ fontSize: '0.7rem', color: '#fff', padding: '4px 8px', background: 'rgba(0,0,0,0.6)' }}>{msg.fileName} ({msg.fileSize})</div>}
        </div>
      )}

      {/* 2. VIDEO MESSAGE */}
      {msg.mediaType === 'video' && (
        <div style={{ borderRadius: '14px', overflow: 'hidden', border: '1px solid #e2e8f0', marginBottom: '4px' }}>
          <video controls src={msg.mediaUrl} style={{ maxWidth: '280px', maxHeight: '220px', display: 'block', borderRadius: '12px' }} />
          {msg.fileName && <div style={{ fontSize: '0.7rem', color: '#64748b', padding: '4px 8px' }}>{msg.fileName}</div>}
        </div>
      )}

      {/* 3. AUDIO MESSAGE */}
      {msg.mediaType === 'audio' && (
        <div style={{ background: isOwn ? 'rgba(255,255,255,0.15)' : '#f1f5f9', padding: '0.65rem', borderRadius: '14px', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Mic size={20} color={isOwn ? '#fff' : '#4f46e5'} />
          <audio controls src={msg.mediaUrl} style={{ height: '32px', maxWidth: '220px' }} />
        </div>
      )}

      {/* 4. DOCUMENT MESSAGE */}
      {msg.mediaType === 'document' && (
        <div style={{ background: isOwn ? 'rgba(255,255,255,0.15)' : '#f8fafc', border: `1px solid ${isOwn ? 'rgba(255,255,255,0.3)' : '#cbd5e1'}`, padding: '0.75rem 1rem', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <FileText size={24} color={isOwn ? '#fff' : '#4f46e5'} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <strong style={{ fontSize: '0.84rem', color: isOwn ? '#fff' : '#0f172a', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{msg.fileName || 'Document.pdf'}</strong>
            <span style={{ fontSize: '0.72rem', color: isOwn ? '#e0e7ff' : '#64748b' }}>{msg.fileSize || 'Document'}</span>
          </div>
          <a href={msg.mediaUrl} download={msg.fileName || 'document.pdf'} style={{ background: isOwn ? '#ffffff' : '#4f46e5', color: isOwn ? '#4f46e5' : '#ffffff', padding: '5px 10px', borderRadius: '8px', fontSize: '0.74rem', fontWeight: '800', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Download size={13} /> Download
          </a>
        </div>
      )}

      {/* 5. CONTACT MESSAGE */}
      {msg.mediaType === 'contact' && (
        <div style={{ background: isOwn ? 'rgba(255,255,255,0.15)' : '#f0fdf4', border: `1px solid ${isOwn ? 'rgba(255,255,255,0.3)' : '#bbf7d0'}`, padding: '0.85rem 1.15rem', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '4px', width: '220px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#22c55e', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '0.85rem' }}>
              {(msg.contactName || 'C').charAt(0).toUpperCase()}
            </div>
            <div>
              <strong style={{ fontSize: '0.86rem', color: isOwn ? '#fff' : '#0f172a', display: 'block' }}>{msg.contactName}</strong>
              <span style={{ fontSize: '0.72rem', color: isOwn ? '#dcfce7' : '#16a34a', fontWeight: '700' }}>Contact Card</span>
            </div>
          </div>
          <a href={`tel:${msg.contactPhone}`} style={{ background: '#22c55e', color: '#fff', padding: '5px 0', borderRadius: '8px', fontSize: '0.76rem', fontWeight: '800', textAlign: 'center', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginTop: '4px' }}>
            <Phone size={13} /> {msg.contactPhone}
          </a>
        </div>
      )}

      {/* 6. STICKER MESSAGE */}
      {msg.mediaType === 'sticker' && (
        <div style={{ background: msg.stickerBg || '#dcfce7', color: msg.stickerColor || '#15803d', border: '1px solid #cbd5e1', padding: '0.75rem 1.25rem', borderRadius: '20px', fontWeight: '900', fontSize: '0.95rem', boxShadow: '0 4px 12px rgba(0,0,0,0.06)', marginBottom: '4px', textAlign: 'center' }}>
          {msg.stickerText}
        </div>
      )}

      {/* 7. TEXT MESSAGE BODY */}
      {msg.text && (
        <div style={{ whiteSpace: 'pre-line', wordBreak: 'break-word' }}>
          {msg.text}
        </div>
      )}

    </div>
  );
}
