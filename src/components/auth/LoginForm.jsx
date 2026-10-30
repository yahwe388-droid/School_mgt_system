import React, { useState, useRef, useEffect } from 'react';
import { Lock, User, Eye, EyeOff, ArrowRight, ShieldCheck, HelpCircle, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

/* ═══════════════════════════════════════════════════════
   The student photo is pre-processed as students.png
   with a transparent background (Pillow BFS removal).
   We just render it as a plain img — no canvas needed.
═══════════════════════════════════════════════════════ */


/* ═══════════════════════════════════════════════
   Theme-aware constellation background canvas
═══════════════════════════════════════════════ */
const ConstellationBg = ({ isDark }) => {
  const canvasRef = useRef(null);
  const animRef   = useRef(null);
  const mouseRef  = useRef({ x: -9999, y: -9999 });
  const darkRef   = useRef(isDark);
  useEffect(() => { darkRef.current = isDark; }, [isDark]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H, nodes;

    const resize = () => {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
      nodes = Array.from({ length: 88 }, () => ({
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 1.7 + 0.9, p: Math.random() * Math.PI * 2,
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      const dk  = darkRef.current;
      /* Dark mode: bright blue lines. Light mode: dim blue lines on white */
      const eA  = dk ? 0.30 : 0.18;  /* edge max-alpha */
      const nA  = dk ? 0.85 : 0.65;  /* node alpha */
      const eR  = dk ? '80,125,255'  : '50,90,200';
      const nR  = dk ? '190,210,255' : '60,100,210';
      const MAX = 155, MR = 180;

      for (const n of nodes) {
        n.p += 0.02; n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > W) n.vx *= -1;
        if (n.y < 0 || n.y > H) n.vy *= -1;
        const dx = n.x - mouseRef.current.x, dy = n.y - mouseRef.current.y;
        const d  = Math.hypot(dx, dy);
        if (d < MR && d > 0) {
          const f = ((MR - d) / MR) * 0.5;
          n.vx += (dx / d) * f * 0.08; n.vy += (dy / d) * f * 0.08;
          const s = Math.hypot(n.vx, n.vy);
          if (s > 1.7) { n.vx *= 1.7 / s; n.vy *= 1.7 / s; }
        }
      }

      for (let i = 0; i < nodes.length; i++)
        for (let j = i + 1; j < nodes.length; j++) {
          const d = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
          if (d < MAX) {
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(${eR},${(1 - d / MAX) * eA})`;
            ctx.lineWidth = 0.8; ctx.stroke();
          }
        }

      for (const n of nodes) {
        const a = (0.45 + 0.35 * Math.sin(n.p)) * nA;
        const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 5);
        g.addColorStop(0, `rgba(${nR},${a})`);
        g.addColorStop(1, `rgba(${nR},0)`);
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r * 5, 0, Math.PI * 2);
        ctx.fillStyle = g; ctx.fill();
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${nR},${a})`; ctx.fill();
      }

      animRef.current = requestAnimationFrame(draw);
    };

    const onMouse = e => { mouseRef.current = { x: e.clientX, y: e.clientY }; };
    const onLeave = () => { mouseRef.current = { x: -9999, y: -9999 }; };
    window.addEventListener('resize',     resize);
    window.addEventListener('mousemove',  onMouse);
    window.addEventListener('mouseleave', onLeave);
    resize(); draw();
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize',     resize);
      window.removeEventListener('mousemove',  onMouse);
      window.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  return (
    <canvas ref={canvasRef} style={{
      position: 'fixed', inset: 0,
      width: '100vw', height: '100vh',
      display: 'block', pointerEvents: 'none', zIndex: 0,
    }} />
  );
};

/* ═══════════════════════════════════════════════
   Twinkling stars (dark mode only)
═══════════════════════════════════════════════ */
const STARS = Array.from({ length: 52 }, (_, i) => ({
  id: i,
  left: Math.random() * 100, top: Math.random() * 100,
  s: Math.random() * 1.8 + 0.4, dl: Math.random() * 6, dr: Math.random() * 4 + 3,
}));

/* ═══════════════════════════════════════════════
   Main LoginForm
═══════════════════════════════════════════════ */
export const LoginForm = () => {
  const { login, theme, toggleTheme } = useAuth();
  const isDark = theme === 'dark';

  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password,        setPassword]        = useState('');
  const [showPassword,    setShowPassword]    = useState(false);
  const [error,           setError]           = useState('');
  const [submitting,      setSubmitting]      = useState(false);
  const [showForgot,      setShowForgot]      = useState(false);
  const [focused,         setFocused]         = useState('');
  const isRef = useRef(false);

  const handleLogin = async e => {
    if (e) e.preventDefault();
    if (isRef.current || submitting) return;
    if (!usernameOrEmail.trim() || !password) {
      setError('Please provide both username/email and password.'); return;
    }
    isRef.current = true; setSubmitting(true); setError('');
    try {
      const res = await login(usernameOrEmail.trim(), password);
      if (!res.success) setError(res.message || 'Invalid credentials. Please try again.');
    } catch { setError('Authentication failed. Please try again.'); }
    finally { isRef.current = false; setSubmitting(false); }
  };

  /* ─── Design tokens ─── */
  const dk = isDark;

  /* Page */
  const pageBg = dk
    ? 'linear-gradient(160deg,#04091a 0%,#060e28 50%,#04091e 100%)'
    : '#ffffff';

  /* Card */
  const cardBg   = dk ? '#131c2e'              : '#ffffff';
  const cardBdr  = dk ? 'rgba(255,255,255,.07)': 'rgba(0,0,0,0.1)';
  const cardSh   = dk
    ? '0 32px 80px rgba(0,0,0,.65), inset 0 0 0 1px rgba(255,255,255,.04)'
    : '0 4px 24px rgba(0,0,0,.1)';

  /* Text */
  const title    = dk ? '#f1f5f9'              : '#0f172a';
  const sub      = dk ? 'rgba(148,163,184,.7)' : 'rgba(71,85,105,.7)';
  const label    = dk ? 'rgba(148,163,184,.85)': 'rgba(51,65,85,.85)';
  const footer   = dk ? 'rgba(100,116,139,.8)' : 'rgba(71,85,105,.8)';
  const forgot   = dk ? 'rgba(130,150,255,.9)' : 'rgba(37,99,235,.9)';
  const divClr   = dk ? 'rgba(255,255,255,.07)': 'rgba(0,0,0,.08)';
  const brand    = dk ? '#e2e8f0'              : '#0f172a';
  const brandSub = dk ? 'rgba(148,163,184,.7)' : 'rgba(71,85,105,.7)';

  /* Input */
  const iBg    = dk ? 'rgba(255,255,255,.06)': '#ffffff';
  const iBdr   = dk ? 'rgba(255,255,255,.1)' : 'rgba(203,213,225,1)';
  const iColor = dk ? '#e2e8f0'              : '#0f172a';
  const iPh    = dk ? 'rgba(148,163,184,.55)': 'rgba(148,163,184,.8)';

  /* Icons */
  const iconFocused  = dk ? '#818cf8' : '#2563eb';
  const iconDefault  = dk ? 'rgba(100,116,139,.7)': 'rgba(148,163,184,.9)';
  const moonClr  = dk ? 'rgba(200,215,255,.65)': 'rgba(51,65,85,.7)';
  const moonBdr  = dk ? 'rgba(255,255,255,.15)' : 'rgba(0,0,0,.12)';

  /* Logo ring */
  const logoBdr  = dk ? 'rgba(99,130,255,.38)' : 'rgba(37,99,235,.28)';
  const logoBg   = dk ? 'rgba(99,130,255,.12)' : 'rgba(37,99,235,.08)';
  const logoSh   = dk ? '0 0 22px rgba(80,110,245,.28)': '0 0 14px rgba(37,99,235,.15)';

  /* Modal */
  const modalBg  = dk ? '#0d1526' : '#ffffff';
  const modalBdr = dk ? 'rgba(99,130,255,.22)' : 'rgba(0,0,0,.1)';
  const mText    = dk ? '#f1f5f9' : '#0f172a';
  const mSub     = dk ? 'rgba(148,163,184,.85)': 'rgba(51,65,85,.85)';
  const mInfo    = dk ? '#cbd5e1'  : '#334155';
  const mClose   = dk ? 'rgba(255,255,255,.06)' : 'rgba(0,0,0,.05)';
  const mCloseBdr= dk ? 'rgba(255,255,255,.1)'  : 'rgba(0,0,0,.1)';
  const mCloseC  = dk ? 'rgba(148,163,184,.8)'  : 'rgba(71,85,105,.8)';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@700;800&display=swap');

        @keyframes sTwinkle { 0%,100%{opacity:.1;transform:scale(1)} 50%{opacity:.88;transform:scale(1.7)} }
        @keyframes cardIn   { from{opacity:0;transform:translateX(24px)} to{opacity:1;transform:translateX(0)} }
        @keyframes photoIn  { from{opacity:0;transform:translateX(-18px)} to{opacity:1;transform:translateX(0)} }
        @keyframes logoFloat{ 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        @keyframes spinRing { to{transform:rotate(360deg)} }
        @keyframes shake    {
          0%,100%{transform:translateX(0)} 20%{transform:translateX(-7px)}
          40%{transform:translateX(7px)} 60%{transform:translateX(-4px)} 80%{transform:translateX(4px)}
        }
        @keyframes popIn {
          from{opacity:0;transform:scale(.93) translateY(10px)}
          to{opacity:1;transform:scale(1) translateY(0)}
        }

        .lf { box-sizing:border-box; }
        .lf * { box-sizing:border-box; }

        .lf-inp {
          width:100%;
          padding:.64rem .88rem .64rem 2.4rem;
          border-radius:8px;
          font-size:.855rem;
          font-family:'Inter',sans-serif;
          outline:none;
          transition:border-color .2s,box-shadow .2s,background .2s;
        }
        .lf-inp:focus {
          border-color:rgba(37,99,235,.7) !important;
          box-shadow:0 0 0 3px rgba(37,99,235,.15);
        }
        .lf-inp:disabled { opacity:.5; cursor:not-allowed; }

        .lf-btn {
          width:100%; padding:.78rem 1rem;
          background:linear-gradient(135deg,#2563eb 0%,#1d4ed8 100%);
          border:none; border-radius:8px; color:#fff;
          font-size:.9rem; font-weight:700; font-family:'Inter',sans-serif;
          cursor:pointer; display:flex; align-items:center; justify-content:center; gap:.5rem;
          transition:all .2s; box-shadow:0 4px 16px rgba(37,99,235,.4);
          position:relative; overflow:hidden; letter-spacing:.01em;
        }
        .lf-btn::before {
          content:''; position:absolute; inset:0;
          background:linear-gradient(135deg,rgba(255,255,255,.14),transparent 55%);
          opacity:0; transition:opacity .2s;
        }
        .lf-btn:hover:not(:disabled)::before { opacity:1; }
        .lf-btn:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 8px 24px rgba(37,99,235,.5); }
        .lf-btn:active:not(:disabled) { transform:translateY(0); }
        .lf-btn:disabled { opacity:.6; cursor:not-allowed; }

        @media (max-width:760px) {
          .lf-photo { display:none !important; }
          .lf-row   { justify-content:center !important; padding:0 1.5rem !important; }
        }
      `}</style>

      {/* ── Page shell ── */}
      <div className="lf" style={{
        position: 'fixed', inset: 0, overflow: 'hidden',
        background: pageBg,
        fontFamily: "'Inter',system-ui,sans-serif",
        transition: 'background .3s',
      }}>

        {/* Constellation canvas */}
        <ConstellationBg isDark={isDark} />

        {/* Stars — dark mode only */}
        {isDark && STARS.map(s => (
          <div key={s.id} style={{
            position: 'fixed', left: s.left + '%', top: s.top + '%',
            width: s.s + 'px', height: s.s + 'px', borderRadius: '50%',
            background: 'rgba(200,220,255,0.85)',
            animation: `sTwinkle ${s.dr}s ${s.dl}s ease-in-out infinite`,
            pointerEvents: 'none', zIndex: 0,
          }} />
        ))}

        {/* ── Topbar ── */}
        <div style={{
          position: 'relative', zIndex: 10,
          display: 'flex', alignItems: 'flex-start',
          justifyContent: 'space-between',
          padding: '1rem 1.5rem 0',
        }}>
          {/* Brand */}
          <div>
            <div style={{
              color: brand, fontWeight: 700, fontSize: '.92rem',
              fontFamily: "'Outfit',sans-serif", lineHeight: 1.25,
            }}>
              EduCore
            </div>
            <div style={{ color: brandSub, fontSize: '.68rem', lineHeight: 1.3 }}>
              Student portal
            </div>
          </div>

          {/* Theme toggle button only */}
          <button
            onClick={toggleTheme}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            style={{
              width: 30, height: 30, borderRadius: '50%',
              border: '1px solid ' + moonBdr,
              background: 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: moonClr, cursor: 'pointer', transition: 'all .2s',
            }}
          >
            {isDark ? (
              /* Sun icon */
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/>
                <line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            ) : (
              /* Moon icon */
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
          </button>
        </div>

        {/* ══════════════════════════════════════════════
            MAIN CONTENT ROW
            Photo (left, large, transparent bg) + Card (right)
            Both vertically centred in viewport
        ══════════════════════════════════════════════ */}
        <div className="lf-row" style={{
          position: 'absolute', inset: 0, top: '52px',
          display: 'flex', flexDirection: 'row',
          alignItems: 'center', justifyContent: 'center',
          padding: '0 4vw 1rem',
          gap: '2.5vw', zIndex: 5,
        }}>

          {/* ── LEFT: Student photo (AI transparent PNG via rembg) ── */}
          <div className="lf-photo" style={{
            flex: '0 0 auto',
            width: 'clamp(260px,45vw,580px)',
            display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
            animation: 'photoIn .6s ease both',
            background: 'transparent',
          }}>
            <img
              src="/students.png"
              alt="Students studying"
              style={{
                width: '100%', height: 'auto', display: 'block',
                background: 'transparent',
              }}
            />
          </div>

          {/* ── RIGHT: Login card ── */}
          <div style={{
            flex: '0 0 auto',
            width: 'clamp(290px,27vw,355px)',
            animation: 'cardIn .45s .08s ease both',
          }}>
            <div style={{
              background: cardBg,
              border: '1px solid ' + cardBdr,
              borderRadius: '14px',
              padding: '1.6rem 1.5rem',
              boxShadow: cardSh,
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              transition: 'background .3s, border-color .3s',
            }}>

              {/* Header: logo + title */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '.85rem', marginBottom: '1.2rem' }}>
                <div style={{
                  width: 50, height: 50, borderRadius: '50%',
                  border: '2px solid ' + logoBdr,
                  background: logoBg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, overflow: 'hidden',
                  animation: 'logoFloat 4s ease-in-out infinite',
                  boxShadow: logoSh,
                }}>
                  <img src="/logo.png" alt="Logo"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                    onError={e => {
                      e.currentTarget.style.display = 'none';
                      if (e.currentTarget.parentElement)
                        e.currentTarget.parentElement.innerHTML =
                          "<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='#2563eb' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M22 10v6M2 10l10-5 10 5-10 5z'/><path d='M6 12v5c3 3 9 3 12 0v-5'/></svg>";
                    }}
                  />
                </div>
                <div>
                  <h2 style={{
                    fontFamily: "'Outfit',sans-serif", fontSize: '1.18rem',
                    fontWeight: 700, color: title, margin: 0, lineHeight: 1.2,
                  }}>
                    Student sign in
                  </h2>
                  <p style={{ color: sub, fontSize: '.7rem', margin: '.18rem 0 0' }}>
                    EduCore School Management System
                  </p>
                </div>
              </div>

              {/* Error banner */}
              {error && (
                <div style={{
                  background: 'rgba(239,68,68,.12)',
                  border: '1px solid rgba(239,68,68,.4)',
                  borderRadius: '8px', padding: '.58rem .85rem', marginBottom: '.95rem',
                  display: 'flex', alignItems: 'center', gap: '.45rem',
                  animation: 'shake .38s ease',
                }}>
                  <span style={{ color: '#ef4444', fontSize: '.9rem' }}>⚠</span>
                  <span style={{ color: dk ? '#fca5a5' : '#b91c1c', fontSize: '.77rem', lineHeight: 1.45, flex: 1 }}>{error}</span>
                  <button onClick={() => setError('')} style={{
                    background: 'none', border: 'none',
                    color: 'rgba(239,68,68,.6)', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', padding: '2px', flexShrink: 0,
                  }}><X size={13} /></button>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '.8rem' }}>

                {/* Username */}
                <div>
                  <label style={{
                    display: 'block', fontSize: '.765rem', fontWeight: 600,
                    color: label, marginBottom: '.28rem',
                  }}>
                    Username
                  </label>
                  <div style={{ position: 'relative' }}>
                    <User size={14} style={{
                      position: 'absolute', left: '.78rem', top: '50%', transform: 'translateY(-50%)',
                      color: focused === 'user' ? iconFocused : iconDefault,
                      transition: 'color .2s',
                    }} />
                    <input
                      id="usernameOrEmail" type="text" required disabled={submitting}
                      className="lf-inp"
                      style={{ background: iBg, border: '1.5px solid ' + iBdr, color: iColor }}
                      placeholder="Enter your username"
                      value={usernameOrEmail} onChange={e => setUsernameOrEmail(e.target.value)}
                      onFocus={() => setFocused('user')} onBlur={() => setFocused('')}
                      autoComplete="username"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label style={{
                    display: 'block', fontSize: '.765rem', fontWeight: 600,
                    color: label, marginBottom: '.28rem',
                  }}>
                    Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={14} style={{
                      position: 'absolute', left: '.78rem', top: '50%', transform: 'translateY(-50%)',
                      color: focused === 'pass' ? iconFocused : iconDefault,
                      transition: 'color .2s',
                    }} />
                    <input
                      id="password" type={showPassword ? 'text' : 'password'}
                      required disabled={submitting} className="lf-inp"
                      style={{ background: iBg, border: '1.5px solid ' + iBdr, color: iColor, paddingRight: '2.4rem' }}
                      placeholder="Enter your password"
                      value={password} onChange={e => setPassword(e.target.value)}
                      onFocus={() => setFocused('pass')} onBlur={() => setFocused('')}
                      autoComplete="current-password"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} style={{
                      position: 'absolute', right: '.78rem', top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', color: iconDefault,
                      cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '2px',
                    }}>
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                {/* Sign In button */}
                <button type="submit" disabled={submitting} className="lf-btn" style={{ marginTop: '.08rem' }}>
                  {submitting ? (
                    <>
                      <div style={{
                        width: 15, height: 15,
                        border: '2px solid rgba(255,255,255,.3)',
                        borderTopColor: '#fff', borderRadius: '50%',
                        animation: 'spinRing .7s linear infinite',
                      }} />
                      Signing in…
                    </>
                  ) : <>Sign in <ArrowRight size={15} /></>}
                </button>
              </form>

              {/* Forgot password */}
              <div style={{ marginTop: '.62rem', textAlign: 'right' }}>
                <button type="button" onClick={() => setShowForgot(true)} style={{
                  background: 'none', border: 'none', color: forgot,
                  fontSize: '.72rem', fontWeight: 600, cursor: 'pointer',
                  padding: 0, fontFamily: 'inherit',
                }}>
                  Forgot Password?
                </button>
              </div>

              {/* Security footer */}
              <div style={{
                marginTop: '.95rem', paddingTop: '.78rem',
                borderTop: '1px solid ' + divClr,
                display: 'flex', alignItems: 'flex-start', gap: '.42rem',
                fontSize: '.69rem', color: footer, lineHeight: 1.55,
              }}>
                <ShieldCheck size={13} color={dk ? '#4f63f0' : '#2563eb'} style={{ flexShrink: 0, marginTop: '1px' }} />
                <span>
                  Your session is protected. For account access issues, contact your campus support desk.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Forgot Password Modal ─── */}
      {showForgot && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,.55)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: '1rem',
        }} onClick={() => setShowForgot(false)}>
          <div style={{
            background: modalBg,
            border: '1px solid ' + modalBdr,
            borderRadius: '14px', width: '100%', maxWidth: '390px',
            padding: '1.875rem', position: 'relative',
            boxShadow: '0 28px 60px rgba(0,0,0,.5)',
            animation: 'popIn .22s ease',
          }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowForgot(false)} style={{
              position: 'absolute', top: '.875rem', right: '.875rem',
              background: mClose, border: '1px solid ' + mCloseBdr,
              borderRadius: '50%', width: 28, height: 28,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: mCloseC, cursor: 'pointer',
            }}>
              <X size={13} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '.7rem', marginBottom: '.9rem' }}>
              <div style={{
                width: 38, height: 38, borderRadius: '50%',
                background: 'rgba(37,99,235,.12)', border: '1px solid rgba(37,99,235,.28)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <HelpCircle size={18} color="#2563eb" />
              </div>
              <h3 style={{ fontFamily: "'Outfit',sans-serif", fontSize: '1.1rem', color: mText, margin: 0 }}>
                Password Reset
              </h3>
            </div>

            <p style={{ fontSize: '.855rem', color: mSub, lineHeight: 1.65, marginBottom: '1.1rem' }}>
              Self-service password reset is disabled for security. Please contact the school{' '}
              <strong style={{ color: mText }}>System Administrator</strong> to obtain a temporary password.
            </p>

            <div style={{
              background: 'rgba(37,99,235,.07)', border: '1px solid rgba(37,99,235,.18)',
              borderRadius: '9px', padding: '.8rem 1rem',
              fontSize: '.79rem', color: mInfo,
              marginBottom: '1.35rem', lineHeight: 1.65,
            }}>
              <strong style={{ color: mText }}>Contact Admin:</strong> admin@school.com<br />
              <strong style={{ color: mText }}>Administration Office:</strong> Ext. 101 / Room 100
            </div>

            <button type="button" className="lf-btn" onClick={() => setShowForgot(false)}>
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};
