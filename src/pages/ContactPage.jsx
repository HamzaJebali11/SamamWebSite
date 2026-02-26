import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import emailjs from "@emailjs/browser";

const EMAILJS_SERVICE_ID  = "service_ab9t908";
const EMAILJS_TEMPLATE_ID = "template_8v3i59e";
const EMAILJS_PUBLIC_KEY  = "9-v28BIq4M3L7xxbk";
const PLUS_CODE  = "7G89+4F Doha, Qatar";
const MAPS_QUERY = "7G89%2B4F+Doha%2C+Qatar";

const REASONS = [
  {
    num: "01",
    title: "24 / 7 Response",
    desc: "Our team is available around the clock for emergencies. Critical security situations don't wait — and neither do we.",
    icon: (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>),
  },
  {
    num: "02",
    title: "DJI Enterprise Certified",
    desc: "Authorized DJI Enterprise distributor in Qatar. Get expert advice on the right drone for your mission — direct from the source.",
    icon: (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>),
  },
  {
    num: "03",
    title: "Local Qatari Expertise",
    desc: "Owned and operated by Qatari nationals since 2014. We know the market, regulations, and terrain better than anyone.",
    icon: (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22s-8-4.5-8-11.8A8 8 0 0112 2a8 8 0 018 8.2c0 7.3-8 11.8-8 11.8z"/><circle cx="12" cy="10" r="3"/></svg>),
  },
  {
    num: "04",
    title: "Full-Spectrum Services",
    desc: "From CCTV and access control to drone surveys and manpower — one partner for every security need across Qatar.",
    icon: (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>),
  },
  {
    num: "05",
    title: "Fast Delivery & AMC",
    desc: "We don't just sell — we install, commission, train, and maintain. Annual maintenance contracts ensure your systems stay mission-ready.",
    icon: (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>),
  },
];

function useCountUp(target, duration = 1800, active = false) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) return;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setVal(Math.floor(ease * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [active, target, duration]);
  return val;
}

function StatItem({ value, suffix, label, delay, active }) {
  const num = useCountUp(parseInt(value), 1600, active);
  return (
    <motion.div className="cp-stat"
      initial={{ opacity: 0, y: 20 }} animate={active ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay }}>
      <div className="cp-stat-val">{num}{suffix}</div>
      <div className="cp-stat-label">{label}</div>
    </motion.div>
  );
}

function MapModal({ onClose }) {
  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", h); document.body.style.overflow = ""; };
  }, []);
  return (
    <motion.div className="cp-map-overlay"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={(e) => { if (e.target.classList.contains("cp-map-overlay")) onClose(); }}>
      <motion.div className="cp-map-box"
        initial={{ opacity: 0, scale: 0.94, y: 24 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}>
        <div className="cp-map-header">
          <div>
            <p className="cp-map-eyebrow">Our Location</p>
            <h3 className="cp-map-title">{PLUS_CODE}</h3>
          </div>
          <div style={{ display:"flex", gap:10, alignItems:"center" }}>
            <a href={`https://maps.google.com/?q=${MAPS_QUERY}`} target="_blank" rel="noopener noreferrer" className="cp-map-open-btn">
              Open in Google Maps ↗
            </a>
            <button className="cp-map-close" onClick={onClose}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>
        <div className="cp-map-frame-wrap">
          <iframe title="SAMAM Location"
            src={`https://www.google.com/maps?q=${MAPS_QUERY}&output=embed&z=17`}
            width="100%" height="100%" style={{ border:0 }}
            allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"/>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function ContactPage() {
  const [form,    setForm]    = useState({ from_name:"", from_email:"", phone:"", subject:"", message:"" });
  const [status,  setStatus]  = useState("idle");
  const [mapOpen, setMapOpen] = useState(false);
  const [statsActive, setStatsActive] = useState(false);
  const statsRef = useRef(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setStatsActive(true); obs.disconnect(); } }, { threshold: 0.3 });
    if (statsRef.current) obs.observe(statsRef.current);
    return () => obs.disconnect();
  }, []);

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("sending");
    try {
      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
        from_name: form.from_name, from_email: form.from_email,
        phone: form.phone || "Not provided", service: form.subject || "General Inquiry",
        message: form.message, to_email: "hamzajebali2002@gmail.com",
      }, EMAILJS_PUBLIC_KEY);
      setStatus("success");
    } catch { setStatus("error"); }
  };
  const handleReset = () => {
    setForm({ from_name:"", from_email:"", phone:"", subject:"", message:"" });
    setStatus("idle");
  };

  return (
    <>
      <style>{`
        .contact-page { background: #060a12; min-height: 100vh; font-family: var(--body, sans-serif); }


        /* ── SECTION SEPARATORS ── */
        .cp-section-sep {
          height: 1px;
          background: linear-gradient(to right, transparent, rgba(255,255,255,0.06) 20%, rgba(255,255,255,0.06) 80%, transparent);
          position: relative; z-index: 3;
          box-shadow: 0 1px 12px rgba(0,0,0,0.25);
        }

        /* ── HERO ── */
        .cp-hero {
          min-height: 56vh;
          display: flex; flex-direction: column; justify-content: flex-end;
          padding: 120px 72px 72px;
          position: relative; overflow: hidden;
          background: #060a12;
          box-shadow: 0 8px 40px rgba(0,0,0,0.4);
          z-index: 2;
        }
        .cp-hero-grid {
          position: absolute; inset: 0;
          background: linear-gradient(rgba(200,16,46,0.03) 1px,transparent 1px),
                      linear-gradient(90deg,rgba(200,16,46,0.03) 1px,transparent 1px);
          background-size: 64px 64px; animation: cpGrid 28s linear infinite;
        }
        @keyframes cpGrid { to { background-position: 64px 64px; } }
        .cp-hero-top-line {
          position: absolute; top:0; left:0; right:0; height:2px;
          background: linear-gradient(to right,transparent,#c8102e 30%,#c8102e 70%,transparent);
          opacity:0.55;
        }
        .cp-hero-orb {
          position: absolute; width:600px; height:600px; border-radius:50%;
          background: radial-gradient(ellipse,rgba(200,16,46,0.05) 0%,transparent 65%);
          bottom:-250px; right:-80px; pointer-events:none;
        }
        .cp-hero-content { position:relative; z-index:2; max-width:900px; }
        .cp-hero-eyebrow {
          font-family: var(--mono); font-size:9px; letter-spacing:5px; color:#c8102e;
          text-transform:uppercase; margin-bottom:24px;
          display:flex; align-items:center; gap:14px;
        }
        .cp-hero-eyebrow::before { content:''; width:28px; height:1px; background:#c8102e; display:block; }
        .cp-hero-title {
          font-family: var(--display); font-size: clamp(56px,9vw,130px);
          line-height: 0.85; letter-spacing: 1px; color: #f0f0f0; margin-bottom: 36px;
        }
        .cp-hero-title .outline {
          color:transparent; -webkit-text-stroke:1px rgba(240,240,240,0.15);
        }
        .cp-hero-meta {
          display: flex; align-items: center; gap: 40px;
          border-top: 1px solid rgba(255,255,255,0.07); padding-top: 28px;
        }
        .cp-hero-meta-item {
          font-family:var(--mono); font-size:9px; letter-spacing:2px;
          color:rgba(255,255,255,0.25); text-transform:uppercase;
        }
        .cp-hero-meta-item strong {
          display:block; font-family:var(--mono); font-size:13px;
          color:rgba(255,255,255,0.6); letter-spacing:1px; margin-bottom:4px; font-weight:400;
        }
        .cp-hero-meta-sep { width:1px; height:32px; background:rgba(255,255,255,0.08); }

        /* ── STATS BAR ── */
        .cp-stats-bar {
          display: grid; grid-template-columns: repeat(4,1fr);
          border-top: 1px solid rgba(255,255,255,0.05);
          border-bottom: 1px solid rgba(255,255,255,0.05);
          background: #08111f;
          box-shadow: 0 4px 24px rgba(0,0,0,0.3), 0 -4px 24px rgba(0,0,0,0.2);
          position: relative; z-index: 1;
        }
        .cp-stat {
          padding: 36px 40px; border-right: 1px solid rgba(255,255,255,0.05);
          position: relative; overflow: hidden;
        }
        .cp-stat:last-child { border-right: none; }
        .cp-stat::before {
          content:''; position:absolute; top:0; left:0; right:0; height:2px;
          background: linear-gradient(to right,#c8102e,transparent);
          transform: scaleX(0); transform-origin:left; transition: transform 0.6s ease;
        }
        .cp-stat:hover::before { transform: scaleX(1); }
        .cp-stat-val {
          font-family: var(--display); font-size: clamp(36px,4vw,52px);
          color: #f0f0f0; letter-spacing: 2px; line-height: 1; margin-bottom: 8px;
        }
        .cp-stat-label {
          font-family:var(--mono); font-size:8px; letter-spacing:3px;
          color:rgba(255,255,255,0.25); text-transform:uppercase;
        }

        /* ── BODY ── */
        .cp-body {
          display: grid; grid-template-columns: 1fr 1fr;
          border-top: 1px solid rgba(255,255,255,0.04);
        }

        /* ── LEFT — WHY US ── */
        .cp-why-side {
          background: #070d18; padding: 72px 64px;
          border-right: 1px solid rgba(255,255,255,0.05);
          position: relative; overflow: hidden;
          box-shadow: inset -1px 0 0 rgba(255,255,255,0.03), 4px 0 20px rgba(0,0,0,0.3);
        }
        .cp-why-bg-num {
          position: absolute; right: -20px; bottom: -40px;
          font-family: var(--display); font-size: 220px; letter-spacing: -8px;
          color: rgba(255,255,255,0.018); line-height:1; pointer-events:none; user-select:none;
        }
        .cp-why-eyebrow {
          font-family:var(--mono); font-size:9px; letter-spacing:4px; color:#c8102e;
          text-transform:uppercase; margin-bottom:16px; display:flex; align-items:center; gap:10px;
        }
        .cp-why-eyebrow::before { content:''; width:20px; height:1px; background:#c8102e; display:block; }
        .cp-why-title {
          font-family: var(--display); font-size: clamp(28px,3vw,44px);
          letter-spacing:2px; color:#f0f0f0; margin-bottom:48px; line-height:1;
        }
        .cp-reasons { display:flex; flex-direction:column; gap:2px; }
        .cp-reason {
          display:grid; grid-template-columns:48px 1fr;
          padding:22px 0; border-bottom:1px solid rgba(255,255,255,0.045);
          position:relative; overflow:hidden; cursor:default;
          transition: background 0.25s;
        }
        .cp-reason:last-child { border-bottom:none; }
        .cp-reason::before {
          content:''; position:absolute; left:0; top:0; bottom:0; width:2px;
          background:#c8102e; transform:scaleY(0); transform-origin:bottom;
          transition:transform 0.3s ease;
        }
        .cp-reason:hover { background: rgba(255,255,255,0.02); }
        .cp-reason:hover::before { transform:scaleY(1); }
        .cp-reason-left {
          display:flex; flex-direction:column; align-items:center;
          padding-top:4px; gap:12px;
        }
        .cp-reason-num {
          font-family:var(--mono); font-size:7px; letter-spacing:2px;
          color:rgba(200,16,46,0.5); text-transform:uppercase;
        }
        .cp-reason-icon { color:rgba(200,16,46,0.45); transition:color 0.25s; }
        .cp-reason:hover .cp-reason-icon { color:#c8102e; }
        .cp-reason-body { padding-left:16px; }
        .cp-reason-title {
          font-family:var(--display); font-size:16px; letter-spacing:2px;
          color:rgba(255,255,255,0.75); margin-bottom:6px; line-height:1.1;
          transition:color 0.25s;
        }
        .cp-reason:hover .cp-reason-title { color:#f0f0f0; }
        .cp-reason-desc {
          font-size:12px; color:rgba(255,255,255,0.28); line-height:1.75; font-weight:300;
          transition:color 0.25s;
        }
        .cp-reason:hover .cp-reason-desc { color:rgba(255,255,255,0.45); }

        .cp-response-badge {
          margin-top:40px; padding:18px 22px;
          border:1px solid rgba(200,16,46,0.2);
          background:rgba(200,16,46,0.04);
          display:flex; align-items:center; gap:16px;
        }
        .cp-response-dot {
          width:8px; height:8px; border-radius:50%; background:#c8102e; flex-shrink:0;
          animation: pulseDot 1.6s ease-in-out infinite;
        }
        @keyframes pulseDot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.55;transform:scale(1.5)} }
        .cp-response-text {
          font-family:var(--mono); font-size:9px; letter-spacing:2px;
          color:rgba(200,16,46,0.7); text-transform:uppercase;
        }
        .cp-response-text strong { color:#c8102e; }

        /* ── RIGHT — FORM ── */
        .cp-form-side {
          background: #fff; padding: 72px 64px;
          display: flex; flex-direction: column;
          box-shadow: inset 4px 0 20px rgba(0,0,0,0.2);
        }
        .cp-form-eyebrow {
          font-family:var(--mono); font-size:9px; letter-spacing:4px; color:#c8102e;
          text-transform:uppercase; margin-bottom:16px; display:flex; align-items:center; gap:10px;
        }
        .cp-form-eyebrow::before { content:''; width:20px; height:1px; background:#c8102e; display:block; }
        .cp-form-title {
          font-family:var(--display); font-size:clamp(28px,2.5vw,42px);
          letter-spacing:2px; color:#111; margin-bottom:8px; line-height:0.95;
        }
        .cp-form-sub { font-size:13px; color:#999; margin-bottom:48px; font-weight:300; line-height:1.8; }
        .cp-form  { display:flex; flex-direction:column; gap:20px; flex:1; }
        .cp-row   { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
        .cp-field { display:flex; flex-direction:column; gap:8px; }
        .cp-label { font-family:var(--mono); font-size:8px; letter-spacing:2px; color:#aaa; text-transform:uppercase; }
        .cp-input {
          font-family:var(--mono); font-size:12px; color:#111; background:#fafafa;
          border:1px solid #e8e8e8; padding:13px 15px; outline:none;
          transition:border-color 0.2s,background 0.2s; width:100%; box-sizing:border-box;
        }
        .cp-input:focus { border-color:#c8102e; background:#fff; }
        .cp-input::placeholder { color:#ccc; }
        .cp-select {
          cursor:pointer; appearance:none;
          background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' fill='none'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23999' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E");
          background-repeat:no-repeat; background-position:right 14px center; padding-right:36px;
        }
        .cp-textarea { resize:vertical; min-height:120px; font-family:var(--mono); }
        .cp-error {
          font-family:var(--mono); font-size:10px; color:#c8102e;
          padding:12px 14px; border:1px solid rgba(200,16,46,0.2); background:rgba(200,16,46,0.04);
        }
        .cp-actions { display:flex; justify-content:space-between; align-items:center; padding-top:8px; }
        .cp-actions-note { font-family:var(--mono); font-size:8px; letter-spacing:1.5px; color:#ccc; text-transform:uppercase; }
        .cp-submit {
          font-family:var(--mono); font-size:10px; letter-spacing:2px; text-transform:uppercase;
          background:#111; color:#fff; border:none; padding:14px 36px; cursor:pointer;
          transition:background 0.2s; display:flex; align-items:center; gap:8px;
        }
        .cp-submit:hover:not(:disabled) { background:#c8102e; }
        .cp-submit:disabled { opacity:0.6; cursor:not-allowed; }
        .cp-spinner {
          width:14px; height:14px; border:2px solid rgba(255,255,255,0.3);
          border-top-color:#fff; border-radius:50%; animation:cpSpin 0.7s linear infinite;
        }
        @keyframes cpSpin { to { transform:rotate(360deg); } }
        .cp-success {
          flex:1; display:flex; flex-direction:column; align-items:center;
          justify-content:center; text-align:center; gap:16px; padding:40px 0;
        }
        .cp-success-icon {
          width:64px; height:64px; border-radius:50%; background:rgba(200,16,46,0.08);
          display:flex; align-items:center; justify-content:center;
          font-size:24px; color:#c8102e; font-weight:bold;
        }
        .cp-success-title { font-family:var(--display); font-size:28px; letter-spacing:2px; color:#111; }
        .cp-success-sub   { font-size:13px; color:#888; line-height:1.8; max-width:280px; }
        .cp-success-btn   {
          margin-top:8px; font-family:var(--mono); font-size:10px; letter-spacing:2px;
          text-transform:uppercase; background:#111; color:#fff; border:none;
          padding:12px 32px; cursor:pointer; transition:background 0.2s;
        }
        .cp-success-btn:hover { background:#c8102e; }

        /* ── MAP MODAL ── */
        .cp-map-overlay {
          position:fixed; inset:0; z-index:300; background:rgba(0,0,0,0.65);
          backdrop-filter:blur(8px); display:flex; align-items:center; justify-content:center; padding:24px;
        }
        .cp-map-box {
          background:#0a0f1a; width:100%; max-width:900px; height:min(80vh,620px);
          display:flex; flex-direction:column; border:1px solid rgba(255,255,255,0.08);
          box-shadow:0 40px 100px rgba(0,0,0,0.5); overflow:hidden;
        }
        .cp-map-header {
          padding:20px 28px; border-bottom:1px solid rgba(255,255,255,0.07);
          display:flex; align-items:center; justify-content:space-between;
          flex-shrink:0; background:#0d1220;
        }
        .cp-map-eyebrow { font-family:var(--mono); font-size:7px; letter-spacing:3px; color:#c8102e; text-transform:uppercase; margin-bottom:5px; }
        .cp-map-title   { font-family:var(--display); font-size:18px; letter-spacing:2px; color:#f0f0f0; }
        .cp-map-open-btn {
          font-family:var(--mono); font-size:8px; letter-spacing:2px; text-transform:uppercase;
          color:rgba(255,255,255,0.35); border:1px solid rgba(255,255,255,0.12);
          padding:8px 16px; text-decoration:none; transition:all 0.2s;
        }
        .cp-map-open-btn:hover { color:#fff; border-color:rgba(255,255,255,0.4); }
        .cp-map-close {
          background:none; border:1px solid rgba(255,255,255,0.12); padding:8px; cursor:pointer;
          color:rgba(255,255,255,0.4); transition:all 0.2s;
          display:flex; align-items:center; justify-content:center; margin-left:12px;
        }
        .cp-map-close:hover { border-color:rgba(255,255,255,0.5); color:#fff; }
        .cp-map-frame-wrap { flex:1; overflow:hidden; }
        .cp-map-frame-wrap iframe { display:block; }

        /* ── BOTTOM STRIP ── */
        .cp-bottom-strip {
          background:#111; border-top:1px solid rgba(255,255,255,0.06);
          display:grid; grid-template-columns:repeat(4,1fr);
          box-shadow: 0 -8px 40px rgba(0,0,0,0.12);
          position: relative; z-index: 2;
        }
        .cp-strip-item {
          padding:36px 40px; border-right:1px solid rgba(255,255,255,0.06);
          transition:background 0.25s; position:relative; overflow:hidden;
        }
        .cp-strip-item::after {
          content:''; position:absolute; bottom:0; left:0; right:0; height:1px;
          background:#c8102e; transform:scaleX(0); transform-origin:left; transition:transform 0.35s;
        }
        .cp-strip-item:hover::after { transform:scaleX(1); }
        .cp-strip-item:last-child { border-right:none; }
        .cp-strip-item:hover { background:rgba(255,255,255,0.03); }
        .cp-strip-label { font-family:var(--mono); font-size:7px; letter-spacing:3px; color:rgba(255,255,255,0.2); text-transform:uppercase; margin-bottom:8px; }
        .cp-strip-val   { font-family:var(--mono); font-size:12px; color:rgba(255,255,255,0.55); line-height:1.6; }
        .cp-strip-val a { color:inherit; text-decoration:none; transition:color 0.2s; }
        .cp-strip-val a:hover { color:#c8102e; }

        /* ── RESPONSIVE ── */
        @media (max-width:1024px) {
          .cp-hero { padding:100px 32px 64px; }
          .cp-body { grid-template-columns:1fr; }
          .cp-why-side { border-right:none; border-bottom:1px solid rgba(255,255,255,0.045); }
          .cp-stats-bar { grid-template-columns:repeat(2,1fr); }
          .cp-stat:nth-child(2) { border-right:none; }
          .cp-stat:nth-child(n+3) { border-top:1px solid rgba(255,255,255,0.05); }
          .cp-bottom-strip { grid-template-columns:repeat(2,1fr); }
          .cp-strip-item:nth-child(2)   { border-right:none; }
          .cp-strip-item:nth-child(n+3) { border-top:1px solid rgba(255,255,255,0.06); }
        }
        @media (max-width:768px) {
          .cp-hero { padding:90px 24px 56px; }
          .cp-hero-meta { flex-wrap:wrap; gap:24px; }
          .cp-why-side { padding:56px 24px; }
          .cp-form-side { padding:56px 24px; }
          .cp-row { grid-template-columns:1fr; }
          .cp-stats-bar { grid-template-columns:1fr 1fr; }
          .cp-bottom-strip { grid-template-columns:1fr; }
          .cp-strip-item { border-right:none; border-bottom:1px solid rgba(255,255,255,0.06); }
          .cp-strip-item:last-child { border-bottom:none; }
        }
      `}</style>

      <div className="contact-page">

        {/* HERO */}
        <div className="cp-hero">
          <div className="cp-hero-top-line"/>
          <div className="cp-hero-grid"/>
          <div className="cp-hero-orb"/>
          <div className="cp-hero-content">
            <motion.p className="cp-hero-eyebrow"
              initial={{opacity:0,x:-20}} animate={{opacity:1,x:0}} transition={{duration:0.5}}>
              Contact SAMAM
            </motion.p>
            <motion.h1 className="cp-hero-title"
              initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} transition={{duration:0.65,delay:0.1}}>
              LET'S BUILD<br/><span className="outline">SOMETHING</span><br/>SECURE
            </motion.h1>
            <motion.div className="cp-hero-meta"
              initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{duration:0.5,delay:0.28}}>
              <div className="cp-hero-meta-item">
                <strong>info@samam.qa</strong>Email
              </div>
              <div className="cp-hero-meta-sep"/>
              <div className="cp-hero-meta-item">
                <strong>+974 XXXX XXXX</strong>Phone
              </div>
              <div className="cp-hero-meta-sep"/>
              <div className="cp-hero-meta-item">
                <strong>Doha, Qatar</strong>Location
              </div>
              <div className="cp-hero-meta-sep"/>
              <div className="cp-hero-meta-item">
                <strong>&lt; 24 hrs</strong>Response Time
              </div>
            </motion.div>
          </div>
        </div>

      

        <div className="cp-section-sep"/>
        {/* BODY */}
        <div className="cp-body">

          {/* LEFT */}
          <motion.div className="cp-why-side"
            initial={{opacity:0,x:-24}} animate={{opacity:1,x:0}} transition={{duration:0.7,delay:0.2}}>
            <div className="cp-why-bg-num">WHY</div>
            <p className="cp-why-eyebrow">Why Work With Us</p>
            <h2 className="cp-why-title">5 Reasons to<br/>Choose SAMAM</h2>
            <div className="cp-reasons">
              {REASONS.map((r, i) => (
                <motion.div key={i} className="cp-reason"
                  initial={{opacity:0,x:-16}} whileInView={{opacity:1,x:0}}
                  viewport={{once:true,amount:0.3}} transition={{duration:0.45,delay:i*0.08}}>
                  <div className="cp-reason-left">
                    <span className="cp-reason-num">{r.num}</span>
                    <span className="cp-reason-icon">{r.icon}</span>
                  </div>
                  <div className="cp-reason-body">
                    <div className="cp-reason-title">{r.title}</div>
                    <p className="cp-reason-desc">{r.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="cp-response-badge">
              <div className="cp-response-dot"/>
              <div className="cp-response-text">
                Average response time: <strong>&nbsp;&lt; 24 hours&nbsp;</strong> during business hours
              </div>
            </div>
          </motion.div>

          {/* RIGHT */}
          <motion.div className="cp-form-side"
            initial={{opacity:0,x:32}} animate={{opacity:1,x:0}} transition={{duration:0.7,delay:0.3}}>
            <p className="cp-form-eyebrow">Send a Message</p>
            <h2 className="cp-form-title">Start the<br/>Conversation</h2>
            <p className="cp-form-sub">Fill out the form and our team will get back to you within 24 hours.</p>
            <AnimatePresence mode="wait">
              {status === "success" ? (
                <motion.div key="success" className="cp-success"
                  initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.4}}>
                  <div className="cp-success-icon">✓</div>
                  <h3 className="cp-success-title">Message Sent!</h3>
                  <p className="cp-success-sub">Thank you for reaching out. Our team will respond within 24 hours.</p>
                  <button className="cp-success-btn" onClick={handleReset}>Send Another →</button>
                </motion.div>
              ) : (
                <motion.form key="form" className="cp-form" onSubmit={handleSubmit}
                  initial={{opacity:0}} animate={{opacity:1}} transition={{duration:0.3}}>
                  <div className="cp-row">
                    <div className="cp-field">
                      <label className="cp-label">Full Name *</label>
                      <input className="cp-input" type="text" name="from_name" placeholder="Your full name" value={form.from_name} onChange={handleChange} required/>
                    </div>
                    <div className="cp-field">
                      <label className="cp-label">Email Address *</label>
                      <input className="cp-input" type="email" name="from_email" placeholder="your@email.com" value={form.from_email} onChange={handleChange} required/>
                    </div>
                  </div>
                  <div className="cp-row">
                    <div className="cp-field">
                      <label className="cp-label">Phone Number</label>
                      <input className="cp-input" type="tel" name="phone" placeholder="+974 XXXX XXXX" value={form.phone} onChange={handleChange}/>
                    </div>
                    <div className="cp-field">
                      <label className="cp-label">Subject</label>
                      <select className="cp-input cp-select" name="subject" value={form.subject} onChange={handleChange}>
                        <option value="">Select a topic...</option>
                        <option value="Drone Services">Drone Services</option>
                        <option value="Security Systems">Security Systems</option>
                        <option value="Smart Systems">Smart Systems</option>
                        <option value="Manpower & Guarding">Manpower & Guarding</option>
                        <option value="Partnership">Partnership</option>
                        <option value="General Inquiry">General Inquiry</option>
                      </select>
                    </div>
                  </div>
                  <div className="cp-field">
                    <label className="cp-label">Message *</label>
                    <textarea className="cp-input cp-textarea" name="message"
                      placeholder="Tell us about your project, requirements, or question..."
                      value={form.message} onChange={handleChange} required rows={5}/>
                  </div>
                  {status === "error" && <p className="cp-error">Something went wrong. Please try again or email us directly.</p>}
                  <div className="cp-actions">
                    <span className="cp-actions-note">Response within 24 hrs</span>
                    <button type="submit" className="cp-submit" disabled={status === "sending"}>
                      {status === "sending" ? <span className="cp-spinner"/> : "Send Message →"}
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* BOTTOM STRIP */}
        <div className="cp-bottom-strip">
          {[
            { label:"Email",         val:<a href="mailto:info@samam.qa">info@samam.qa</a> },
            { label:"Phone",         val:<a href="tel:+97400000000">+974 XXXX XXXX</a> },
            { label:"Location",      val:<>7G89+4F<br/>Doha, Qatar</> },
            { label:"Working Hours", val:<>Sun – Thu: 8am – 4pm<br/>Sat: 8am – 2pm<br/>24/7 for emergencies</> },
          ].map((item, i) => (
            <motion.div key={i} className="cp-strip-item"
              initial={{opacity:0,y:16}} whileInView={{opacity:1,y:0}}
              viewport={{once:true}} transition={{duration:0.4,delay:i*0.08}}>
              <div className="cp-strip-label">{item.label}</div>
              <div className="cp-strip-val">{item.val}</div>
            </motion.div>
          ))}
        </div>

      </div>

      <AnimatePresence>
        {mapOpen && <MapModal onClose={() => setMapOpen(false)}/>}
      </AnimatePresence>
    </>
  );
}