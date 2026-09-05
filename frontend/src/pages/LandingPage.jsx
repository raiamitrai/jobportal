import React, { useState, useEffect, useRef } from 'react';
import heroWoman from '../assets/hero-woman.jpg';
import careonixLogo from '../assets/careonix-brand-logo.png';

// ── Animated Counter Hook ────────────────────────────────────────────────────
function useCounter(target, duration = 2000, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const step = (ts) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);
  return count;
}

// ── Intersection Observer Hook ───────────────────────────────────────────────
function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setInView(true); obs.disconnect(); }
    }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

export default function LandingPage({ onLogin, onSignup }) {
  const [statsRef, statsInView] = useInView();
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  const c1 = useCounter(12400, 2000, statsInView);
  const c2 = useCounter(3800, 2200, statsInView);
  const c3 = useCounter(97, 1800, statsInView);
  const c4 = useCounter(420, 2400, statsInView);

  useEffect(() => {
    const handler = (e) => {
      setMousePos({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100
      });
    };
    window.addEventListener('mousemove', handler);
    return () => window.removeEventListener('mousemove', handler);
  }, []);

  const dm = false;
  const purple = '#7c3aed';
  const purpleLight = '#a78bfa';

  const bg = dm
    ? `radial-gradient(ellipse at ${mousePos.x}% ${mousePos.y}%, #1e1040 0%, #0d0d1a 60%, #050510 100%)`
    : `radial-gradient(ellipse at ${mousePos.x}% ${mousePos.y}%, #f5f0ff 0%, #ffffff 55%, #f0f4ff 100%)`;

  return (
    <div style={{
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      minHeight: '100vh',
      background: bg,
      color: dm ? '#f1f5f9' : '#0f172a',
      transition: 'background 0.6s ease, color 0.3s ease',
      overflowX: 'hidden',
    }}>

      {/* ── ANIMATED BG ORBS ── */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', width: 600, height: 600,
          borderRadius: '50%',
          background: dm
            ? 'radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(124,58,237,0.10) 0%, transparent 70%)',
          top: '-10%', right: '-5%',
          animation: 'orbFloat1 8s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', width: 400, height: 400,
          borderRadius: '50%',
          background: dm
            ? 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 70%)',
          bottom: '10%', left: '-5%',
          animation: 'orbFloat2 10s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', width: 300, height: 300,
          borderRadius: '50%',
          background: dm
            ? 'radial-gradient(circle, rgba(167,139,250,0.10) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(196,181,253,0.12) 0%, transparent 70%)',
          top: '40%', left: '30%',
          animation: 'orbFloat3 12s ease-in-out infinite',
        }} />
      </div>

      <style>{`
        @keyframes orbFloat1 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-30px,20px) scale(1.05)} }
        @keyframes orbFloat2 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(20px,-30px) scale(1.08)} }
        @keyframes orbFloat3 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-15px,15px)} }
        @keyframes cardFloat { 0%,100%{transform:translateY(0px) rotate(0deg)} 50%{transform:translateY(-8px) rotate(0.5deg)} }
        @keyframes cardFloat2 { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-6px)} }
        @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.7;transform:scale(1.05)} }
        @keyframes spinSlow { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes gradShift {
          0%{background-position:0% 50%}
          50%{background-position:100% 50%}
          100%{background-position:0% 50%}
        }
        .nav-btn:hover { transform:translateY(-1px); }
        .cta-primary:hover { transform:translateY(-3px) !important; box-shadow:0 14px 36px rgba(124,58,237,0.5) !important; }
        .cta-secondary:hover { border-color:#7c3aed !important; color:#7c3aed !important; background:rgba(124,58,237,0.05) !important; }
        .stat-card:hover { transform:translateY(-4px) scale(1.02); }
        .feature-card:hover { transform:translateY(-5px); box-shadow:0 20px 50px rgba(124,58,237,0.15) !important; border-color:#7c3aed !important; }
        .testimonial-card:hover { transform:translateY(-4px); }

        @media (max-width: 900px) {
          nav {
            padding: 0 1.25rem !important;
            height: 64px !important;
          }
          section[style*="minHeight: 'calc(100vh - 72px)'"],
          section[style*="min-height: calc(100vh - 72px)"] {
            flex-direction: column !important;
            padding: 2.5rem 1.25rem 2rem !important;
            min-height: auto !important;
            text-align: center !important;
            gap: 2rem !important;
          }
          div[style*="flex: '0 0 48%'"],
          div[style*="flex: 0 0 48%"] {
            flex: 1 1 100% !important;
            max-width: 100% !important;
          }
          div[style*="display: 'flex', gap: '1rem', flexWrap: 'wrap'"],
          div[style*="display: flex; gap: 1rem; flex-wrap: wrap"] {
            justify-content: center !important;
          }
          div[style*="gridTemplateColumns: 'repeat(4, 1fr)'"],
          div[style*="grid-template-columns: repeat(4, 1fr)"] {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 1rem !important;
          }
          div[style*="gridTemplateColumns: 'repeat(3, 1fr)'"],
          div[style*="grid-template-columns: repeat(3, 1fr)"] {
            grid-template-columns: 1fr !important;
            gap: 1.25rem !important;
          }
          footer {
            padding: 1.5rem 1.25rem !important;
            flex-direction: column !important;
            text-align: center !important;
            gap: 1rem !important;
          }
        }

        @media (max-width: 480px) {
          div[style*="gridTemplateColumns: 'repeat(4, 1fr)'"],
          div[style*="grid-template-columns: repeat(4, 1fr)"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 4rem', height: '72px',
        background: dm
          ? 'rgba(10,10,20,0.8)'
          : 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${dm ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
        position: 'sticky', top: 0, zIndex: 100,
        boxShadow: dm ? '0 1px 30px rgba(0,0,0,0.4)' : '0 1px 20px rgba(0,0,0,0.05)',
        transition: 'all 0.3s ease',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
          <img
            src={careonixLogo}
            alt="CAREONIX"
            style={{
              height: 46, width: 'auto', objectFit: 'contain',
              mixBlendMode: dm ? 'normal' : 'multiply',
              filter: dm ? 'brightness(1.3) invert(1)' : 'none',
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <button
            onClick={onLogin}
            className="nav-btn"
            style={{
              background: 'none',
              border: `1.5px solid ${dm ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'}`,
              padding: '0.5rem 1.35rem', borderRadius: 10, cursor: 'pointer',
              fontWeight: 600, fontSize: '0.875rem',
              color: dm ? '#e2e8f0' : '#0f172a',
              fontFamily: 'inherit', transition: 'all 0.2s',
              letterSpacing: '0.01em',
            }}
          >
            Log in
          </button>

          <button
            onClick={onSignup}
            style={{
              background: 'linear-gradient(135deg, #5b21b6, #7c3aed, #8b5cf6)',
              backgroundSize: '200% 200%',
              animation: 'gradShift 4s ease infinite',
              border: 'none', padding: '0.55rem 1.45rem', borderRadius: 10,
              cursor: 'pointer', fontWeight: 700, fontSize: '0.875rem', color: 'white',
              fontFamily: 'inherit',
              boxShadow: '0 4px 15px rgba(124,58,237,0.4)',
              transition: 'all 0.25s', letterSpacing: '0.02em',
            }}
            className="nav-btn"
          >
            Get Started →
          </button>
        </div>
      </nav>

      {/* ── HERO SECTION ── */}
      <section style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '5rem 4rem 4rem',
        maxWidth: '1320px', margin: '0 auto',
        minHeight: 'calc(100vh - 72px)',
        gap: '3rem',
        position: 'relative', zIndex: 1,
      }}>
        {/* LEFT CONTENT */}
        <div style={{ flex: '0 0 48%', maxWidth: 560, animation: 'fadeUp 0.7s ease both' }}>

          {/* Announcement badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: dm ? 'rgba(124,58,237,0.15)' : 'rgba(124,58,237,0.08)',
            border: `1px solid ${dm ? 'rgba(124,58,237,0.4)' : 'rgba(124,58,237,0.2)'}`,
            borderRadius: 50, padding: '0.4rem 1.1rem', marginBottom: '2rem',
            fontSize: '0.82rem', fontWeight: 700,
            color: dm ? '#c4b5fd' : '#5b21b6',
            backdropFilter: 'blur(10px)',
          }}>
            <span style={{
              width: 8, height: 8, borderRadius: '50%', background: '#7c3aed',
              animation: 'pulse 2s infinite', display: 'inline-block', flexShrink: 0
            }} />
            🚀 India's fastest growing job platform — Now Live
          </div>

          {/* Headline */}
          <h1 style={{
            fontSize: 'clamp(2.6rem, 4vw, 3.8rem)',
            fontWeight: 900,
            lineHeight: 1.1,
            letterSpacing: '-2px',
            marginBottom: '1.5rem',
          }}>
            <span style={{ color: dm ? '#f8fafc' : '#0f172a', display: 'block' }}>Find Your Next</span>
            <span style={{
              background: 'linear-gradient(135deg, #5b21b6 0%, #7c3aed 40%, #a855f7 70%, #ec4899 100%)',
              backgroundSize: '200% auto',
              animation: 'shimmer 4s linear infinite',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              display: 'block',
            }}>
              Dream Career
            </span>
            <span style={{ color: dm ? '#f8fafc' : '#0f172a', display: 'block' }}>with CAREONIX</span>
          </h1>

          {/* Subtext */}
          <p style={{
            fontSize: '1.08rem',
            color: dm ? '#94a3b8' : '#64748b',
            lineHeight: 1.75,
            marginBottom: '2.5rem',
            maxWidth: 420,
          }}>
            Connect with <strong style={{ color: dm ? '#c4b5fd' : '#5b21b6' }}>top recruiters</strong>, explore 
            verified job openings, and take control of your career journey — all in one intelligent platform.
          </p>

          {/* CTA Buttons */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '3rem' }}>
            <button
              onClick={onSignup}
              className="cta-primary"
              style={{
                display: 'flex', alignItems: 'center', gap: '0.6rem',
                background: 'linear-gradient(135deg, #5b21b6, #7c3aed)',
                color: 'white', border: 'none', padding: '0.95rem 2rem',
                borderRadius: 12, fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer',
                fontFamily: 'inherit', boxShadow: '0 8px 24px rgba(124,58,237,0.4)',
                transition: 'all 0.25s', letterSpacing: '0.02em',
              }}
            >
              Start For Free
              <span style={{ fontSize: '1.1rem' }}>✨</span>
            </button>

            <button
              onClick={onLogin}
              className="cta-secondary"
              style={{
                display: 'flex', alignItems: 'center', gap: '0.6rem',
                background: dm ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)',
                color: dm ? '#e2e8f0' : '#0f172a',
                border: `1.5px solid ${dm ? 'rgba(255,255,255,0.12)' : '#e2e8f0'}`,
                padding: '0.95rem 1.85rem', borderRadius: 12,
                fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer',
                fontFamily: 'inherit', transition: 'all 0.25s',
                backdropFilter: 'blur(10px)',
              }}
            >
              Sign In →
            </button>
          </div>

          {/* Social Proof Row */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '1.5rem',
            flexWrap: 'wrap',
          }}>
            {/* Avatars */}
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {['👩‍💼','👨‍💻','👩‍🔬','👨‍🎨','👩‍💻'].map((a, i) => (
                <div key={i} style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: `hsl(${260 + i * 20}, 70%, ${dm ? 35 : 75}%)`,
                  border: `2.5px solid ${dm ? '#0d0d1a' : '#fff'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1rem', marginLeft: i === 0 ? 0 : -10,
                  zIndex: 5 - i, position: 'relative',
                }}>
                  {a}
                </div>
              ))}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '3px', marginBottom: '2px' }}>
                {[1,2,3,4,5].map(s => (
                  <span key={s} style={{ color: '#f59e0b', fontSize: '0.85rem' }}>★</span>
                ))}
              </div>
              <div style={{ fontSize: '0.8rem', color: dm ? '#94a3b8' : '#64748b', fontWeight: 600 }}>
                Trusted by <strong style={{ color: dm ? '#c4b5fd' : '#5b21b6' }}>12,400+</strong> professionals
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT — IMAGE SECTION */}
        <div style={{
          flex: '0 0 50%', position: 'relative',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          minHeight: 540,
          animation: 'fadeUp 0.9s ease 0.2s both',
        }}>
          {/* Outer glow ring */}
          <div style={{
            position: 'absolute',
            width: '88%', height: '88%',
            borderRadius: '50%',
            background: dm
              ? 'radial-gradient(circle, rgba(124,58,237,0.25) 0%, rgba(91,33,182,0.08) 60%, transparent 100%)'
              : 'radial-gradient(circle, rgba(196,181,253,0.7) 0%, rgba(237,233,254,0.4) 60%, transparent 100%)',
            animation: 'orbFloat1 6s ease-in-out infinite',
          }} />

          {/* Rotating dashed ring */}
          <div style={{
            position: 'absolute',
            width: '95%', height: '95%',
            borderRadius: '50%',
            border: `2px dashed ${dm ? 'rgba(124,58,237,0.25)' : 'rgba(124,58,237,0.12)'}`,
            animation: 'spinSlow 30s linear infinite',
          }} />

          {/* Dot grid */}
          <div style={{ position: 'absolute', top: '2%', right: '2%', zIndex: 1, opacity: dm ? 0.3 : 0.2 }}>
            {[...Array(5)].map((_, row) => (
              <div key={row} style={{ display: 'flex', gap: 7, marginBottom: 7 }}>
                {[...Array(6)].map((_, col) => (
                  <div key={col} style={{ width: 4, height: 4, borderRadius: '50%', background: '#7c3aed' }} />
                ))}
              </div>
            ))}
          </div>
          <div style={{ position: 'absolute', bottom: '5%', left: '2%', zIndex: 1, opacity: dm ? 0.25 : 0.15 }}>
            {[...Array(4)].map((_, row) => (
              <div key={row} style={{ display: 'flex', gap: 7, marginBottom: 7 }}>
                {[...Array(5)].map((_, col) => (
                  <div key={col} style={{ width: 4, height: 4, borderRadius: '50%', background: '#a855f7' }} />
                ))}
              </div>
            ))}
          </div>

          {/* Hero Image Circle */}
          <div style={{
            position: 'relative', zIndex: 2,
            width: '72%', maxWidth: 420,
            borderRadius: '50%', aspectRatio: '1/1',
            overflow: 'hidden',
            background: dm
              ? 'radial-gradient(circle, #2e1065, #1e1b4b)'
              : 'radial-gradient(circle, #ede9fe, #ddd6fe)',
            boxShadow: dm
              ? '0 0 0 6px rgba(124,58,237,0.2), 0 0 0 12px rgba(124,58,237,0.08), 0 30px 80px rgba(91,33,182,0.4)'
              : '0 0 0 6px rgba(255,255,255,0.9), 0 0 0 14px rgba(196,181,253,0.3), 0 30px 70px rgba(109,40,217,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <img src={heroWoman} alt="Professional" style={{
              width: '125%', height: '125%',
              objectFit: 'cover', objectPosition: 'center 10%',
              mixBlendMode: dm ? 'luminosity' : 'multiply',
            }} />
          </div>

          {/* Floating Card 1 — Smart Matching */}
          <GlassCard
            style={{ top: '5%', left: '-2%', animationDelay: '0s' }}
            dark={dm}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12,
                background: 'linear-gradient(135deg, #ede9fe, #ddd6fe)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', flexShrink: 0,
              }}>👥</div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.84rem', color: dm ? '#f1f5f9' : '#0f172a', marginBottom: 2 }}>Smart Matching</div>
                <div style={{ fontSize: '0.72rem', color: dm ? '#94a3b8' : '#64748b' }}>AI-powered role fit</div>
              </div>
            </div>
          </GlassCard>

          {/* Floating Card 2 — Job Posted */}
          <GlassCard
            style={{ top: '3%', right: '-4%', animationDelay: '1s' }}
            dark={dm}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12,
                background: 'linear-gradient(135deg, #dcfce7, #bbf7d0)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', flexShrink: 0,
              }}>✅</div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.84rem', color: dm ? '#f1f5f9' : '#0f172a', marginBottom: 2 }}>Verified Jobs</div>
                <div style={{ fontSize: '0.72rem', color: dm ? '#94a3b8' : '#64748b' }}>Only real openings</div>
              </div>
            </div>
          </GlassCard>

          {/* Floating Card 3 — Applications */}
          <GlassCard
            style={{ bottom: '8%', left: '-4%', animationDelay: '0.5s' }}
            dark={dm}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12,
                background: 'linear-gradient(135deg, #eff6ff, #bfdbfe)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', flexShrink: 0,
              }}>📋</div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.84rem', color: dm ? '#f1f5f9' : '#0f172a', marginBottom: 2 }}>Application Tracker</div>
                <div style={{ fontSize: '0.72rem', color: dm ? '#94a3b8' : '#64748b' }}>Real-time status</div>
              </div>
            </div>
          </GlassCard>

          {/* Floating Card 4 — Growth */}
          <GlassCard
            style={{ bottom: '6%', right: '-3%', animationDelay: '1.5s' }}
            dark={dm}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12,
                background: 'linear-gradient(135deg, #fff7ed, #fed7aa)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', flexShrink: 0,
              }}>📈</div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.84rem', color: dm ? '#f1f5f9' : '#0f172a', marginBottom: 2 }}>Career Growth</div>
                <div style={{ fontSize: '0.72rem', color: dm ? '#94a3b8' : '#64748b' }}>Track your progress</div>
              </div>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* ── STATS SECTION ── */}
      <section
        ref={statsRef}
        style={{
          position: 'relative', zIndex: 1,
          padding: '0 4rem 5rem',
          maxWidth: '1320px', margin: '0 auto',
        }}
      >
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem',
        }}>
          {[
            { count: c1, suffix: '+', label: 'Active Candidates', icon: '👥', color: '#7c3aed' },
            { count: c2, suffix: '+', label: 'Jobs Posted', icon: '💼', color: '#0ea5e9' },
            { count: c3, suffix: '%', label: 'Success Rate', icon: '🏆', color: '#10b981' },
            { count: c4, suffix: '+', label: 'Top Recruiters', icon: '🏢', color: '#f59e0b' },
          ].map((stat, i) => (
            <div
              key={i}
              className="stat-card"
              style={{
                background: dm
                  ? 'rgba(255,255,255,0.04)'
                  : 'rgba(255,255,255,0.9)',
                border: `1px solid ${dm ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
                borderRadius: 20,
                padding: '1.75rem 1.5rem',
                textAlign: 'center',
                backdropFilter: 'blur(20px)',
                boxShadow: dm
                  ? '0 8px 30px rgba(0,0,0,0.3)'
                  : '0 8px 30px rgba(0,0,0,0.06)',
                transition: 'all 0.3s ease',
                cursor: 'default',
              }}
            >
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{stat.icon}</div>
              <div style={{
                fontSize: '2.4rem', fontWeight: 900,
                background: `linear-gradient(135deg, ${stat.color}, ${stat.color}bb)`,
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                backgroundClip: 'text', lineHeight: 1, marginBottom: '0.4rem',
              }}>
                {stat.count.toLocaleString()}{stat.suffix}
              </div>
              <div style={{ fontSize: '0.85rem', color: dm ? '#94a3b8' : '#64748b', fontWeight: 600 }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES SECTION ── */}
      <section style={{
        position: 'relative', zIndex: 1,
        padding: '4rem 4rem',
        maxWidth: '1320px', margin: '0 auto',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: dm ? 'rgba(124,58,237,0.15)' : '#f5f3ff',
            border: `1px solid ${dm ? 'rgba(124,58,237,0.3)' : '#ddd6fe'}`,
            borderRadius: 50, padding: '0.35rem 1rem', marginBottom: '1.25rem',
            fontSize: '0.8rem', fontWeight: 700, color: dm ? '#c4b5fd' : '#5b21b6',
          }}>
            ⚡ Platform Features
          </div>
          <h2 style={{
            fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', fontWeight: 900,
            letterSpacing: '-1px', marginBottom: '1rem',
            color: dm ? '#f1f5f9' : '#0f172a',
          }}>
            Everything you need to{' '}
            <span style={{
              background: 'linear-gradient(135deg, #5b21b6, #7c3aed)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>
              land your dream job
            </span>
          </h2>
          <p style={{ color: dm ? '#94a3b8' : '#64748b', fontSize: '1rem', maxWidth: 500, margin: '0 auto', lineHeight: 1.7 }}>
            Built for job seekers and recruiters alike — powerful tools, simple interface.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
          {[
            {
              icon: '🤖', title: 'AI-Powered Matching',
              desc: 'Our intelligent algorithm matches your skills and experience with the most relevant job openings in real time.',
              color: '#7c3aed', gradient: 'linear-gradient(135deg, #ede9fe, #ddd6fe)',
            },
            {
              icon: '🛡️', title: 'Verified Recruiters',
              desc: 'Every recruiter is manually verified by our admin team — zero spam, zero fake postings, only real opportunities.',
              color: '#0ea5e9', gradient: 'linear-gradient(135deg, #e0f2fe, #bae6fd)',
            },
            {
              icon: '📊', title: 'Real-Time Analytics',
              desc: 'Track your application status, profile views, and recruiter interest — all in a beautiful, intuitive dashboard.',
              color: '#10b981', gradient: 'linear-gradient(135deg, #dcfce7, #bbf7d0)',
            },
            {
              icon: '💬', title: 'Direct Messaging',
              desc: 'Chat directly with recruiters and hiring managers without leaving the platform. Fast, secure, real-time.',
              color: '#f59e0b', gradient: 'linear-gradient(135deg, #fef9c3, #fef08a)',
            },
            {
              icon: '⚡', title: 'One-Click Apply',
              desc: 'Apply to multiple jobs with a single click using your saved profile. Streamline your job search like never before.',
              color: '#ec4899', gradient: 'linear-gradient(135deg, #fce7f3, #fbcfe8)',
            },
            {
              icon: '🔔', title: 'Smart Notifications',
              desc: 'Get instant alerts when recruiters view your profile, shortlist you, or when new matching jobs are posted.',
              color: '#8b5cf6', gradient: 'linear-gradient(135deg, #f3e8ff, #e9d5ff)',
            },
          ].map((feat, i) => (
            <div
              key={i}
              className="feature-card"
              style={{
                background: dm ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.95)',
                border: `1px solid ${dm ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'}`,
                borderRadius: 20, padding: '1.75rem',
                backdropFilter: 'blur(20px)',
                boxShadow: dm ? '0 4px 20px rgba(0,0,0,0.2)' : '0 4px 20px rgba(0,0,0,0.04)',
                transition: 'all 0.3s ease',
                cursor: 'default',
              }}
            >
              <div style={{
                width: 52, height: 52, borderRadius: 16,
                background: feat.gradient,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.6rem', marginBottom: '1.1rem',
              }}>
                {feat.icon}
              </div>
              <h3 style={{
                fontSize: '1.05rem', fontWeight: 800,
                color: dm ? '#f1f5f9' : '#0f172a',
                marginBottom: '0.6rem', letterSpacing: '-0.3px',
              }}>
                {feat.title}
              </h3>
              <p style={{
                fontSize: '0.875rem', color: dm ? '#94a3b8' : '#64748b',
                lineHeight: 1.65,
              }}>
                {feat.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS SECTION ── */}
      <section style={{
        position: 'relative', zIndex: 1,
        padding: '4rem 4rem 5rem',
        maxWidth: '1320px', margin: '0 auto',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{
            fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', fontWeight: 900,
            letterSpacing: '-1px', marginBottom: '0.75rem',
            color: dm ? '#f1f5f9' : '#0f172a',
          }}>
            Real stories from{' '}
            <span style={{
              background: 'linear-gradient(135deg, #5b21b6, #a855f7)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>
              real people
            </span>
          </h2>
          <p style={{ color: dm ? '#94a3b8' : '#64748b', fontSize: '0.95rem' }}>
            Join thousands who found their next opportunity on CAREONIX
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
          {[
            {
              name: 'Priya Sharma', role: 'Software Engineer at TCS',
              avatar: '👩‍💻', stars: 5,
              text: '"CAREONIX helped me land my dream job in just 3 weeks! The AI matching was spot on — every suggestion felt tailor-made for me."',
              color: '#7c3aed',
            },
            {
              name: 'Rahul Mehta', role: 'HR Manager at Infosys',
              avatar: '👨‍💼', stars: 5,
              text: '"As a recruiter, the verified candidate pool is incredible. We filled 6 positions in a month. The dashboard is clean and very intuitive."',
              color: '#0ea5e9',
            },
            {
              name: 'Ananya Gupta', role: 'Data Analyst at Wipro',
              avatar: '👩‍🔬', stars: 5,
              text: '"The application tracker feature is a game changer. I always knew exactly where I stood with each company. Highly recommend CAREONIX!"',
              color: '#10b981',
            },
          ].map((t, i) => (
            <div
              key={i}
              className="testimonial-card"
              style={{
                background: dm ? 'rgba(255,255,255,0.04)' : '#ffffff',
                border: `1px solid ${dm ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'}`,
                borderRadius: 20, padding: '1.75rem',
                backdropFilter: 'blur(20px)',
                boxShadow: dm ? '0 4px 20px rgba(0,0,0,0.2)' : '0 4px 20px rgba(0,0,0,0.05)',
                transition: 'all 0.3s ease',
              }}
            >
              <div style={{ display: 'flex', marginBottom: '0.75rem', gap: '3px' }}>
                {[...Array(t.stars)].map((_, si) => (
                  <span key={si} style={{ color: '#f59e0b', fontSize: '0.9rem' }}>★</span>
                ))}
              </div>
              <p style={{
                fontSize: '0.9rem', color: dm ? '#cbd5e1' : '#475569',
                lineHeight: 1.7, marginBottom: '1.25rem', fontStyle: 'italic',
              }}>
                {t.text}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: 42, height: 42, borderRadius: '50%',
                  background: `linear-gradient(135deg, ${t.color}33, ${t.color}55)`,
                  border: `2px solid ${t.color}44`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.3rem',
                }}>
                  {t.avatar}
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem', color: dm ? '#f1f5f9' : '#0f172a' }}>
                    {t.name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: dm ? '#94a3b8' : '#64748b' }}>
                    {t.role}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FINAL CTA SECTION ── */}
      <section style={{
        position: 'relative', zIndex: 1,
        padding: '0 4rem 6rem',
        maxWidth: '1320px', margin: '0 auto',
      }}>
        <div style={{
          background: dm
            ? 'linear-gradient(135deg, rgba(91,33,182,0.3) 0%, rgba(124,58,237,0.2) 50%, rgba(168,85,247,0.15) 100%)'
            : 'linear-gradient(135deg, #5b21b6 0%, #7c3aed 50%, #a855f7 100%)',
          borderRadius: 28,
          padding: '4rem 3rem',
          textAlign: 'center',
          border: dm ? '1px solid rgba(124,58,237,0.3)' : 'none',
          backdropFilter: dm ? 'blur(20px)' : 'none',
          position: 'relative', overflow: 'hidden',
          boxShadow: dm
            ? '0 20px 60px rgba(91,33,182,0.2)'
            : '0 20px 60px rgba(91,33,182,0.4)',
        }}>
          {/* BG orbs inside CTA */}
          <div style={{
            position: 'absolute', width: 300, height: 300, borderRadius: '50%',
            background: 'rgba(255,255,255,0.06)', top: '-80px', right: '-60px',
            pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', width: 200, height: 200, borderRadius: '50%',
            background: 'rgba(255,255,255,0.04)', bottom: '-50px', left: '-40px',
            pointerEvents: 'none',
          }} />

          <div style={{
            fontSize: '0.85rem', fontWeight: 700, color: 'rgba(255,255,255,0.75)',
            textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem',
          }}>
            🚀 Join 12,400+ Professionals
          </div>
          <h2 style={{
            fontSize: 'clamp(1.8rem, 3vw, 2.8rem)',
            fontWeight: 900, color: '#ffffff', letterSpacing: '-1px',
            marginBottom: '1rem', lineHeight: 1.15,
          }}>
            Your next chapter starts here.
          </h2>
          <p style={{
            color: 'rgba(255,255,255,0.75)', fontSize: '1.05rem',
            maxWidth: 480, margin: '0 auto 2.5rem auto', lineHeight: 1.7,
          }}>
            Create your free account today and discover thousands of verified opportunities waiting for you.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={onSignup}
              style={{
                background: '#ffffff',
                color: '#5b21b6',
                border: 'none', padding: '1rem 2.25rem', borderRadius: 12,
                fontWeight: 800, fontSize: '1rem', cursor: 'pointer',
                fontFamily: 'inherit',
                boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
                transition: 'all 0.25s',
                letterSpacing: '0.01em',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.25)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.2)'; }}
            >
              Create Free Account ✨
            </button>
            <button
              onClick={onLogin}
              style={{
                background: 'rgba(255,255,255,0.12)',
                color: '#ffffff', backdropFilter: 'blur(10px)',
                border: '1.5px solid rgba(255,255,255,0.25)',
                padding: '1rem 2rem', borderRadius: 12,
                fontWeight: 700, fontSize: '1rem', cursor: 'pointer',
                fontFamily: 'inherit', transition: 'all 0.25s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.18)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              Already have account? Login →
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        borderTop: `1px solid ${dm ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
        padding: '1.75rem 4rem',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: '1rem',
        background: dm ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.6)',
        backdropFilter: 'blur(10px)',
        position: 'relative', zIndex: 1,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <img src={careonixLogo} alt="CAREONIX" style={{
            height: 32, width: 'auto', objectFit: 'contain',
            mixBlendMode: dm ? 'normal' : 'multiply',
            filter: dm ? 'brightness(1.2) invert(1)' : 'none',
          }} />
          <span style={{ fontSize: '0.8rem', color: dm ? '#64748b' : '#94a3b8', fontWeight: 500 }}>
            © 2026 Careonix. All rights reserved.
          </span>
        </div>
        <div style={{ display: 'flex', gap: '2rem', fontSize: '0.82rem', color: dm ? '#64748b' : '#94a3b8', fontWeight: 500 }}>
          {['Privacy Policy', 'Terms of Service', 'Contact Us'].map(link => (
            <span key={link} style={{ cursor: 'pointer', transition: 'color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.color = purple}
              onMouseLeave={e => e.currentTarget.style.color = dm ? '#64748b' : '#94a3b8'}
            >
              {link}
            </span>
          ))}
        </div>
      </footer>
    </div>
  );
}

// ── Glassmorphism Floating Card ───────────────────────────────────────────────
function GlassCard({ children, style, dark }) {
  return (
    <div style={{
      position: 'absolute',
      background: dark
        ? 'rgba(15,15,30,0.85)'
        : 'rgba(255,255,255,0.92)',
      border: `1px solid ${dark ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.9)'}`,
      borderRadius: 16, padding: '0.85rem 1.1rem',
      boxShadow: dark
        ? '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)'
        : '0 8px 32px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.8)',
      backdropFilter: 'blur(16px)',
      minWidth: 170,
      animation: 'cardFloat 4s ease-in-out infinite',
      animationDelay: style?.animationDelay || '0s',
      zIndex: 3,
      ...style,
    }}>
      {children}
    </div>
  );
}
