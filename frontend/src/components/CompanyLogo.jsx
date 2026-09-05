import React from 'react';

// Accepts:
//   company   - company name string (for built-in logos)
//   logoUrl   - base64 or URL of a custom uploaded logo
//   size      - optional size in px (default 48)
export default function CompanyLogo({ company, logoUrl, size = 48 }) {
  const s = size;
  const radius = Math.round(s * 0.22);
  const iconSize = Math.round(s * 0.48);

  const wrapStyle = {
    width: `${s}px`,
    height: `${s}px`,
    borderRadius: `${radius}px`,
    background: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 10px rgba(0,0,0,0.09)',
    border: '1px solid #e2e8f0',
    flexShrink: 0,
    overflow: 'hidden'
  };

  // ── Custom uploaded logo (base64 or URL) ──────────────────────────────
  if (logoUrl) {
    return (
      <div style={wrapStyle}>
        <img
          src={logoUrl}
          alt={company || 'Company Logo'}
          style={{ width: `${iconSize + 8}px`, height: `${iconSize + 8}px`, objectFit: 'contain' }}
        />
      </div>
    );
  }

  const comp = (company || '').toLowerCase();

  // ── Microsoft ─────────────────────────────────────────────────────────
  if (comp.includes('microsoft')) {
    const sq = Math.round(iconSize * 0.45);
    return (
      <div style={wrapStyle}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px', width: `${sq * 2 + 3}px`, height: `${sq * 2 + 3}px` }}>
          <div style={{ background: '#f25022', borderRadius: '1px' }} />
          <div style={{ background: '#7fba00', borderRadius: '1px' }} />
          <div style={{ background: '#00a4ef', borderRadius: '1px' }} />
          <div style={{ background: '#ffb900', borderRadius: '1px' }} />
        </div>
      </div>
    );
  }

  // ── Amazon ────────────────────────────────────────────────────────────
  if (comp.includes('amazon')) {
    return (
      <div style={{ ...wrapStyle, position: 'relative' }}>
        <span style={{ fontWeight: '900', color: '#131921', fontSize: `${iconSize * 0.7}px`, fontFamily: 'Arial, sans-serif', lineHeight: 1 }}>a</span>
        <div style={{ position: 'absolute', bottom: `${s * 0.17}px`, width: `${iconSize * 0.65}px`, height: `${s * 0.08}px`, borderBottom: '2px solid #ff9900', borderRadius: '50%' }} />
      </div>
    );
  }

  // ── Google ────────────────────────────────────────────────────────────
  if (comp.includes('google')) {
    return (
      <div style={wrapStyle}>
        <svg width={iconSize} height={iconSize} viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
        </svg>
      </div>
    );
  }

  // ── Meta / Facebook ───────────────────────────────────────────────────
  if (comp.includes('meta') || comp.includes('facebook')) {
    return (
      <div style={wrapStyle}>
        <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="#0866FF">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      </div>
    );
  }

  // ── Apple ─────────────────────────────────────────────────────────────
  if (comp.includes('apple')) {
    return (
      <div style={{ ...wrapStyle, background: '#000000' }}>
        <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="white">
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98l-.09.06c-.22.14-2.2 1.28-2.18 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
        </svg>
      </div>
    );
  }

  // ── Infosys ───────────────────────────────────────────────────────────
  if (comp.includes('infosys')) {
    return (
      <div style={wrapStyle}>
        <span style={{ fontWeight: '900', color: '#007CC3', fontSize: `${iconSize * 0.55}px`, fontFamily: 'Arial, sans-serif', letterSpacing: '-1px' }}>in</span>
      </div>
    );
  }

  // ── TCS ───────────────────────────────────────────────────────────────
  if (comp.includes('tcs') || comp.includes('tata consultancy')) {
    return (
      <div style={{ ...wrapStyle, background: '#003087' }}>
        <span style={{ fontWeight: '900', color: 'white', fontSize: `${iconSize * 0.42}px`, fontFamily: 'Arial, sans-serif' }}>TCS</span>
      </div>
    );
  }

  // ── Wipro ─────────────────────────────────────────────────────────────
  if (comp.includes('wipro')) {
    return (
      <div style={wrapStyle}>
        <span style={{ fontWeight: '900', color: '#5F259F', fontSize: `${iconSize * 0.42}px`, fontFamily: 'Arial, sans-serif' }}>W</span>
      </div>
    );
  }

  // ── Default: colored initial ──────────────────────────────────────────
  const colors = [
    ['#e0e7ff', '#4f46e5'], // indigo
    ['#d1fae5', '#059669'], // green
    ['#fef3c7', '#d97706'], // amber
    ['#fce7f3', '#db2777'], // pink
    ['#dbeafe', '#2563eb'], // blue
    ['#f3e8ff', '#7c3aed'], // purple
  ];
  const idx = (company || 'C').charCodeAt(0) % colors.length;
  const [bg, fg] = colors[idx];

  return (
    <div style={{ ...wrapStyle, background: bg, border: `1px solid ${fg}22` }}>
      <span style={{ fontWeight: '800', color: fg, fontSize: `${iconSize * 0.55}px`, fontFamily: 'Inter, sans-serif' }}>
        {(company || 'C').charAt(0).toUpperCase()}
      </span>
    </div>
  );
}
