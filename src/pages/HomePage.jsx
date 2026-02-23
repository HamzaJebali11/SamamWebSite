import { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import logoMOI from "../assets/MoI.jpg";
import imgCCTV from "../assets/cctv.jpg";
import imgGuards from "../assets/Security-Guard.jpg";
import imgDrone from "../assets/DJI-Matrice-M400.jpg";

const CLIENTS = [
  { id: 1, name: "Ministry of Interior", logo: logoMOI },
  { id: 2, name: "Ministry of Interior", logo: logoMOI },
  { id: 3, name: "Ministry of Interior", logo: logoMOI },
  { id: 4, name: "Ministry of Interior", logo: logoMOI },
  { id: 5, name: "Ministry of Interior", logo: logoMOI },
  { id: 6, name: "Ministry of Interior", logo: logoMOI },
  { id: 7, name: "Ministry of Interior", logo: logoMOI },
  { id: 8, name: "Ministry of Interior", logo: logoMOI },
  { id: 9, name: "Ministry of Interior", logo: logoMOI },
  { id: 10, name: "Ministry of Interior", logo: logoMOI },
];

const SERVICES = [
  {
    id: 0, tag: "Surveillance", label: "CCTV Systems", icon: "📡", image: imgCCTV,
    desc: "AI-powered camera networks with real-time monitoring, intelligent threat detection, and instant alert systems across your entire facility.",
    stat: "99.8% uptime", path: "/services/cctv",
  },
  {
    id: 1, tag: "On-Site Security", label: "Security Guards", icon: "🛡️", image: imgGuards,
    desc: "Rigorously trained professionals providing on-site protection for corporate campuses, events, and high-value residences around the clock.",
    stat: "24/7 coverage", path: "/services/guards",
  },
  {
    id: 2, tag: "Aerial Patrol", label: "Drone Surveillance", icon: "🚁", image: imgDrone,
    desc: "Autonomous aerial patrols covering wide perimeters with thermal imaging, live feeds, and rapid incident response capabilities.",
    stat: "Unmanned Aerial Systems", path: "/services/drones",
  },
];

const DYNAMIC_WORDS = ["PROTECTION", "EXCELLENCE", "PRECISION", "RESULTS"];

const STATS = [
  { label: "Client Satisfaction", suffix: "%", target: 99, duration: 2000 },
  { label: "Clients Served", suffix: "+", target: 500, duration: 2200 },
  { label: "Years of Experience", suffix: "yr", target: 15, duration: 1800 },
];

const WHY_US = [
  { icon: "⚡", title: "Rapid Response", desc: "Average 4-minute response time to any security alert across all monitored sites." },
  { icon: "🧠", title: "AI-Powered", desc: "Smart systems that learn and adapt to your environment for intelligent, proactive protection." },
  { icon: "📞", title: "24/7 Support", desc: "Round-the-clock operations center staffed by experienced security professionals." },
];

const PROCESS = [
  { num: "01", title: "Assessment", desc: "We conduct a thorough on-site risk assessment to identify vulnerabilities and security gaps." },
  { num: "02", title: "Custom Plan", desc: "Our experts design a tailored security solution that fits your needs and budget." },
  { num: "03", title: "Deployment", desc: "Swift, professional installation and deployment with minimal disruption to operations." },
  { num: "04", title: "Monitoring", desc: "Continuous 24/7 monitoring with regular reports and ongoing system optimization." },
];

// ── COUNTER ──────────────────────────────────────────────────
function Counter({ target, suffix, label, duration }) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef(null);
  const startTime = useRef(null);
  const rafRef = useRef(null);
const finalTarget = useRef(Math.round(target));
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setStarted(true); observer.disconnect(); } },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    const final = finalTarget.current;
    startTime.current = null;
    cancelAnimationFrame(rafRef.current);
    const animate = (timestamp) => {
      if (!startTime.current) startTime.current = timestamp;
      const elapsed = timestamp - startTime.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * final));
      if (progress < 1) rafRef.current = requestAnimationFrame(animate);
      else setCount(final);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [started, duration]);

  return (
    <div className="stat-counter-item" ref={ref}>
      <div className="stat-counter-num">{count}<span>{suffix}</span></div>
      <div className="stat-counter-label">{label}</div>
    </div>
  );
}

// ── SERVICES CAROUSEL ────────────────────────────────────────
function ServicesCarousel() {
  const [active, setActive] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [dir, setDir] = useState(1);
  const navigate = useNavigate();

  const goTo = (index, d) => {
    if (animating) return;
    setDir(d); setAnimating(true);
    setTimeout(() => { setActive(index); setAnimating(false); }, 180);
  };
  const prev = () => goTo((active - 1 + SERVICES.length) % SERVICES.length, -1);
  const next = () => goTo((active + 1) % SERVICES.length, 1);
  const s = SERVICES[active];
  const handleLearnMore = () => { if (s.path) navigate(s.path); };

  return (
    <section className="svc-section">
      <div className={`svc-card ${animating ? (dir > 0 ? "svc-exit-left" : "svc-exit-right") : "svc-enter"}`}>
        <div className="svc-bg">
          {s.image
            ? <img src={s.image} alt={s.label} className="svc-bg-img" />
            : <><span className="svc-bg-icon">{s.icon}</span><span className="svc-bg-hint">Add image here</span></>
          }
        </div>
        <div className="svc-overlay"/>
        <button className="svc-arrow svc-arrow-left" onClick={prev}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div className="svc-content">
          <span className="svc-tag">{s.tag}</span>
          <h2 className="svc-title">{s.label}</h2>
          <p className="svc-desc">{s.desc}</p>
          <div className="svc-bottom">
            <div className="svc-stat-pill">{s.stat}</div>
            <button className="svc-learn-btn" onClick={handleLearnMore}>Learn More →</button>
          </div>
        </div>
        <button className="svc-arrow svc-arrow-right" onClick={next}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>
      <div className="svc-dots-row">
        {SERVICES.map((_, i) => (
          <button key={i} className={`svc-dot${i === active ? " svc-dot-active" : ""}`}
            onClick={() => goTo(i, i > active ? 1 : -1)}/>
        ))}
      </div>
    </section>
  );
}

// ── WORD MORPH ───────────────────────────────────────────────
function WordMorphSection() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => { setIndex(i => (i + 1) % DYNAMIC_WORDS.length); setVisible(true); }, 300);
    }, 1600);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="morph-section">
      <div className="morph-content">
        <p className="morph-eyebrow">Our Promise</p>
        <div className="morph-text">
          <span className="morph-static">WE DELIVER</span>
          <span className={`morph-dynamic ${visible ? "morph-in" : "morph-out"}`}>{DYNAMIC_WORDS[index]}</span>
        </div>
        <p className="morph-sub">Every deployment, every patrol, every system we install is backed by our unwavering commitment to excellence and your peace of mind.</p>
        <div className="stat-counters">
          {STATS.map((s, i) => <Counter key={i} {...s} />)}
        </div>
      </div>
    </section>
  );
}

// ── WHY US ───────────────────────────────────────────────────
function WhyUsSection() {
  return (
    <section className="why-section">
      <div className="why-header">
        <p className="why-eyebrow">Why SAMAM</p>
        <h2 className="why-title">Security You Can Count On</h2>
        <p className="why-sub">Trusted by hundreds of businesses across Qatar for reliable, professional, and technology-driven security.</p>
      </div>
      <div className="why-grid">
        {WHY_US.map((item, i) => (
          <div className="why-card" key={i}>
            <div className="why-icon">{item.icon}</div>
            <h3 className="why-card-title">{item.title}</h3>
            <p className="why-card-desc">{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── PROCESS ──────────────────────────────────────────────────
function ProcessSection() {
  return (
    <section className="process-section">
      <div className="process-header">
        <p className="process-eyebrow">How It Works</p>
        <h2 className="process-title">From Assessment to Protection</h2>
      </div>
      <div className="process-steps">
        {PROCESS.map((step, i) => (
          <div className="process-step" key={i}>
            <div className="process-num">{step.num}</div>
            <div className="process-body">
              <h3 className="process-step-title">{step.title}</h3>
              <p className="process-step-desc">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── CTA BANNER ───────────────────────────────────────────────
function CTABanner() {
  return (
    <section className="cta-section">
      <div className="cta-content">
        <p className="cta-eyebrow">Ready to Get Protected?</p>
        <h2 className="cta-title">Let's Secure Your World</h2>
        <p className="cta-sub">Book a free consultation and our experts will design the perfect security plan for your needs.</p>
        <div className="cta-actions">
          <button className="btn-primary">Book Free Consultation</button>
          <button className="cta-btn-ghost">Call Us Now</button>
        </div>
      </div>
    </section>
  );
}

// ── CLIENT CAROUSEL ──────────────────────────────────────────
function ClientCarousel() {
  const trackRef = useRef(null);
  const viewportRef = useRef(null);
  const posRef = useRef(0);
  const rafRef = useRef(null);
  const speed = 0.6;
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragStartPos = useRef(0);

  useEffect(() => {
    const track = trackRef.current;
    const viewport = viewportRef.current;
    if (!track || !viewport) return;
    const halfWidth = track.scrollWidth / 2;
    const animate = () => {
      if (!isDragging.current) {
        posRef.current += speed;
        if (posRef.current >= halfWidth) posRef.current = 0;
        if (posRef.current < 0) posRef.current = halfWidth - 1;
        track.style.transform = `translateX(-${posRef.current}px)`;
      }
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    const onMouseDown = (e) => { isDragging.current = true; dragStartX.current = e.clientX; dragStartPos.current = posRef.current; };
    const onMouseMove = (e) => {
      if (!isDragging.current) return;
      const delta = dragStartX.current - e.clientX;
      let newPos = dragStartPos.current + delta;
      if (newPos >= halfWidth) newPos -= halfWidth;
      if (newPos < 0) newPos += halfWidth;
      posRef.current = newPos;
      track.style.transform = `translateX(-${posRef.current}px)`;
    };
    const onMouseUp = () => { isDragging.current = false; };
    const onTouchStart = (e) => { isDragging.current = true; dragStartX.current = e.touches[0].clientX; dragStartPos.current = posRef.current; };
    const onTouchMove = (e) => {
      if (!isDragging.current) return;
      const delta = dragStartX.current - e.touches[0].clientX;
      let newPos = dragStartPos.current + delta;
      if (newPos >= halfWidth) newPos -= halfWidth;
      if (newPos < 0) newPos += halfWidth;
      posRef.current = newPos;
      track.style.transform = `translateX(-${posRef.current}px)`;
    };
    const onTouchEnd = () => { isDragging.current = false; };
    viewport.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    viewport.addEventListener("touchstart", onTouchStart, { passive: true });
    viewport.addEventListener("touchmove", onTouchMove, { passive: true });
    viewport.addEventListener("touchend", onTouchEnd);
    return () => {
      cancelAnimationFrame(rafRef.current);
      viewport.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      viewport.removeEventListener("touchstart", onTouchStart);
      viewport.removeEventListener("touchmove", onTouchMove);
      viewport.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  return (
    <section className="carousel-section">
      <p className="carousel-eyebrow">Trusted By Our Clients</p>
      <div className="carousel-viewport" ref={viewportRef}>
        <div className="carousel-fade-left"/>
        <div className="carousel-fade-right"/>
        <div className="carousel-track" ref={trackRef}>
          {[...CLIENTS, ...CLIENTS].map((client, i) => (
            <div className="carousel-item" key={i}>
              <div className="carousel-logo-placeholder">
                {client.logo
                  ? <img src={client.logo} alt={client.name} className="carousel-logo-img" />
                  : <><span className="carousel-logo-icon">🏢</span><span className="carousel-logo-name">{client.name}</span></>
                }
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── HOME PAGE ────────────────────────────────────────────────
export default function HomePage() {
  return (
    <>
      <style>{`

        /* ── GLOBAL PAGE BACKGROUND ── */
        .home-page {
          background: #fff;
        }

        /* ── SECTION SEPARATOR (used on all light sections) ── */
        .section-sep {
          box-shadow: 0 1px 0 0 rgba(0,0,0,0.06), 0 -1px 0 0 rgba(0,0,0,0.04);
        }

        /* ── HERO — stays dark, it's intentional ── */
        .hero {
          position: relative; min-height: 100vh;
          display: flex; flex-direction: column; justify-content: flex-end;
          padding: 0 64px 96px; overflow: hidden;
          background: #ffffff;
          box-shadow: 0 4px 24px rgba(0,0,0,0.12);
        }
        .hero-bg {
          position: absolute; inset: 0;
          background:
            linear-gradient(rgba(200,16,46,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(200,16,46,0.025) 1px, transparent 1px);
          background-size: 72px 72px;
          animation: gridScroll 24s linear infinite;
        }
        @keyframes gridScroll { 0% { background-position: 0 0; } 100% { background-position: 72px 72px; } }
        .hero-bg-overlay {
          position: absolute; inset: 0;
          background:
            radial-gradient(ellipse 60% 50% at 65% 35%, rgba(200,16,46,0.05) 0%, transparent 65%),
            linear-gradient(to bottom, transparent 40%, #0f1623 100%);
        }
        .hero-scanlines {
          position: absolute; inset: 0;
          background: repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.06) 3px, rgba(0,0,0,0.06) 4px);
          pointer-events: none;
        }
        .corner { position: absolute; width: 32px; height: 32px; }
        .corner-tl { top: 88px; left: 64px; border-top: 1px solid rgba(200,16,46,0.5); border-left: 1px solid rgba(200,16,46,0.5); }
        .corner-tr { top: 88px; right: 64px; border-top: 1px solid rgba(200,16,46,0.5); border-right: 1px solid rgba(200,16,46,0.5); }
        .corner-bl { bottom: 96px; left: 64px; border-bottom: 1px solid rgba(200,16,46,0.5); border-left: 1px solid rgba(200,16,46,0.5); }
        .corner-br { bottom: 96px; right: 64px; border-bottom: 1px solid rgba(200,16,46,0.5); border-right: 1px solid rgba(200,16,46,0.5); }
        .hero-status {
          position: absolute; top: 92px; left: 50%; transform: translateX(-50%);
          display: flex; gap: 24px; align-items: center;
          font-family: var(--mono); font-size: 9px; letter-spacing: 2px;
          color: rgb(0, 0, 0); text-transform: uppercase;
        }
        .status-dot {
          display: inline-block; width: 5px; height: 5px; background: #c8102e;
          border-radius: 50%; animation: pulse 2s infinite; margin-right: 5px;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(200,16,46,0.4); }
          50% { opacity: 0.6; box-shadow: 0 0 0 5px rgba(200,16,46,0); }
        }
        .hero-content { position: relative; z-index: 2; max-width: 800px; }
        .hero-eyebrow {
          font-family: var(--mono); font-size: 10px; letter-spacing: 5px;
          color: #c8102e; text-transform: uppercase; margin-bottom: 24px;
          display: flex; align-items: center; gap: 14px;
        }
        .hero-eyebrow::before { content: ''; display: block; width: 28px; height: 1px; background: #c8102e; }
        .hero-title {
          font-family: var(--display); font-size: clamp(60px, 9vw, 118px);
          line-height: 0.88; letter-spacing: 1px; color: #000000; margin-bottom: 28px;
        }
        .hero-title .outline { color: transparent; -webkit-text-stroke: 1px rgb(255, 0, 0); }
        .hero-sub {
          font-size: 15px; font-weight: 300; color: rgb(255, 255, 255);
          max-width: 440px; line-height: 1.8; margin-bottom: 48px;
        }
        .hero-actions { display: flex; align-items: center; gap: 16px; }
        .hero-ghost-btn {
          font-family: var(--mono); font-size: 11px; letter-spacing: 2px;
          text-transform: uppercase; background: transparent; color: rgba(255,255,255,0.5);
          border: 1px solid rgba(255,255,255,0.15); padding: 10px 24px; cursor: pointer;
          transition: border-color 0.2s, color 0.2s;
        }
        .hero-ghost-btn:hover { border-color: rgba(255,255,255,0.4); color: #fff; }
        .hero-stats {
          position: absolute; right: 64px; bottom: 96px;
          display: flex; flex-direction: column; gap: 28px; z-index: 2; text-align: right;
        }
        .stat-num { font-family: var(--display); font-size: 40px; line-height: 1; color: #f0f0f0; letter-spacing: 2px; }
        .stat-num span { color: #c8102e; }
        .stat-label { font-family: var(--mono); font-size: 9px; letter-spacing: 2px; color: rgba(255,255,255,0.3); text-transform: uppercase; margin-top: 4px; }

        /* ── SERVICES CAROUSEL — image-based, stays dark inside ── */
        .svc-section {
          width: 100%; background: #fff;
          padding-bottom: 40px;
          box-shadow: 0 1px 0 rgba(0,0,0,0.07);
        }
        .svc-card {
          position: relative; width: 100%; height: 580px;
          overflow: hidden; display: flex; align-items: flex-end;
          transition: opacity 0.40s ease;
        }
        .svc-exit-left  { opacity: 0; }
        .svc-exit-right { opacity: 0; }
        .svc-enter      { opacity: 1; }
        .svc-bg {
          position: absolute; inset: 0; background: #1c2333;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center; gap: 12px;
        }
        .svc-bg-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: center; }
        .svc-bg-icon { font-size: 96px; opacity: 0.08; position: relative; z-index: 1; }
        .svc-bg-hint { font-family: var(--mono); font-size: 9px; letter-spacing: 3px; color: rgba(255,255,255,0.15); text-transform: uppercase; position: relative; z-index: 1; }
        .svc-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to top, rgba(10,12,18,0.92) 0%, rgba(10,12,18,0.5) 40%, rgba(10,12,18,0.1) 100%);
          z-index: 1;
        }
        .svc-arrow {
          position: absolute; top: 50%; transform: translateY(-50%); z-index: 3;
          width: 48px; height: 48px; border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.25); background: rgba(255,255,255,0.08);
          backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: #fff; transition: background 0.2s, border-color 0.2s;
        }
        .svc-arrow:hover { background: #c8102e; border-color: #c8102e; }
        .svc-arrow-left  { left: 32px; }
        .svc-arrow-right { right: 32px; }
        .svc-content { position: relative; z-index: 2; padding: 48px 64px; width: 100%; max-width: 680px; }
        .svc-tag { font-family: var(--mono); font-size: 9px; letter-spacing: 4px; text-transform: uppercase; color: #c8102e; margin-bottom: 12px; display: block; }
        .svc-title { font-family: var(--display); font-size: clamp(32px, 4vw, 56px); letter-spacing: 2px; color: #fff; margin-bottom: 14px; line-height: 1; }
        .svc-desc { font-size: 14px; color: rgba(255,255,255,0.6); line-height: 1.8; font-weight: 300; max-width: 440px; margin-bottom: 24px; }
        .svc-bottom { display: flex; align-items: center; gap: 20px; }
        .svc-stat-pill {
          font-family: var(--mono); font-size: 10px; letter-spacing: 2px;
          color: rgba(255,255,255,0.7); background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.15);
          padding: 6px 14px; border-radius: 2px; text-transform: uppercase; backdrop-filter: blur(4px);
        }
        .svc-learn-btn {
          font-family: var(--mono); font-size: 10px; letter-spacing: 2px;
          text-transform: uppercase; background: transparent;
          color: rgba(255,255,255,0.5); border: none; cursor: pointer; transition: color 0.2s; padding: 0;
        }
        .svc-learn-btn:hover { color: #fff; }
        .svc-dots-row { display: flex; align-items: center; justify-content: center; gap: 10px; padding: 24px 0 0; }
        .svc-dot { width: 7px; height: 7px; border-radius: 50%; background: #ddd; border: none; cursor: pointer; transition: background 0.3s, transform 0.3s; padding: 0; }
        .svc-dot-active { background: #c8102e; transform: scale(1.4); }

        /* ── WORD MORPH — white background ── */
        .morph-section {
          padding: 112px 64px; background: #fff;
          display: flex; align-items: center; justify-content: center; text-align: center;
          box-shadow: 0 1px 0 rgba(0,0,0,0.06), 0 -1px 0 rgba(0,0,0,0.04);
        }
        .morph-content { max-width: 820px; width: 100%; }
        .morph-eyebrow {
          font-family: var(--mono); font-size: 9px; letter-spacing: 5px;
          color: #c8102e; text-transform: uppercase; margin-bottom: 36px;
        }
        .morph-text { display: flex; flex-direction: column; align-items: center; gap: 4px; margin-bottom: 28px; }
        .morph-static {
          font-family: var(--display); font-size: clamp(32px, 5.5vw, 68px);
          letter-spacing: 8px; color: #111; line-height: 1;
        }
        .morph-dynamic {
          font-family: var(--display); font-size: clamp(32px, 5.5vw, 68px);
          letter-spacing: 8px; color: #c8102e; line-height: 1; display: block;
          transition: opacity 0.3s ease, filter 0.3s ease, transform 0.3s ease;
        }
        .morph-in  { opacity: 1; filter: blur(0px);  transform: scale(1); }
        .morph-out { opacity: 0; filter: blur(14px); transform: scale(0.9); }
        .morph-sub {
          font-size: 14px; font-weight: 300; color: #888;
          line-height: 1.9; max-width: 480px; margin: 0 auto 72px;
        }
        .stat-counters {
          display: flex; justify-content: center; gap: 80px;
          border-top: 1px solid #ebebeb; padding-top: 56px;
        }
        .stat-counter-item { text-align: center; }
        .stat-counter-num {
          font-family: var(--display); font-size: clamp(44px, 5vw, 72px);
          line-height: 1; color: #111; letter-spacing: 2px;
        }
        .stat-counter-num span { color: #c8102e; font-size: 0.55em; vertical-align: super; }
        .stat-counter-label {
          font-family: var(--mono); font-size: 9px; letter-spacing: 3px;
          color: #bbb; text-transform: uppercase; margin-top: 10px;
        }

        /* ── WHY US — white ── */
        .why-section {
          padding: 96px 64px; background: #fff;
          box-shadow: 0 1px 0 rgba(0,0,0,0.06), 0 -1px 0 rgba(0,0,0,0.04);
        }
        .why-header { max-width: 500px; margin-bottom: 64px; }
        .why-eyebrow { font-family: var(--mono); font-size: 9px; letter-spacing: 4px; color: #c8102e; text-transform: uppercase; margin-bottom: 16px; }
        .why-title { font-family: var(--display); font-size: clamp(28px, 3vw, 44px); letter-spacing: 1px; color: #111; margin-bottom: 16px; line-height: 1.1; }
        .why-sub { font-size: 14px; color: #888; line-height: 1.8; font-weight: 300; }
        .why-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0; border: 1px solid #ebebeb; }
        .why-card { padding: 40px 32px; border-right: 1px solid #ebebeb; transition: background 0.25s; }
        .why-card:last-child { border-right: none; }
        .why-card:hover { background: #fafafa; }
        .why-icon { font-size: 28px; margin-bottom: 20px; display: block; }
        .why-card-title { font-family: var(--display); font-size: 20px; letter-spacing: 1px; color: #111; margin-bottom: 10px; }
        .why-card-desc { font-size: 13px; color: #888; line-height: 1.7; font-weight: 300; }

        /* ── PROCESS — very light grey tint ── */
        .process-section {
          padding: 96px 64px; background: #fafafa;
          box-shadow: 0 1px 0 rgba(0,0,0,0.06), 0 -1px 0 rgba(0,0,0,0.04);
        }
        .process-header { text-align: center; margin-bottom: 72px; }
        .process-eyebrow { font-family: var(--mono); font-size: 9px; letter-spacing: 4px; color: #c8102e; text-transform: uppercase; margin-bottom: 16px; }
        .process-title { font-family: var(--display); font-size: clamp(28px, 3vw, 44px); letter-spacing: 1px; color: #111; }
        .process-steps { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0; position: relative; }
        .process-step { padding: 0 32px; position: relative; text-align: center; }
        .process-step:not(:last-child)::after { content: ''; position: absolute; top: 28px; right: 0; width: 1px; height: 60px; background: #e0e0e0; }
        .process-num { font-family: var(--display); font-size: 48px; color: #e8e8e8; letter-spacing: 2px; line-height: 1; margin-bottom: 20px; }
        .process-step:hover .process-num { color: #c8102e; transition: color 0.3s; }
        .process-step-title { font-family: var(--display); font-size: 20px; letter-spacing: 1px; color: #111; margin-bottom: 10px; }
        .process-step-desc { font-size: 13px; color: #888; line-height: 1.7; font-weight: 300; }

        /* ── CTA — white with red accent border top ── */
        .cta-section {
          padding: 96px 64px; background: #fff;
          display: flex; align-items: center; justify-content: center; text-align: center;
          border-top: 2px solid #c8102e;
          box-shadow: 0 -1px 0 rgba(0,0,0,0.04);
        }
        .cta-content { max-width: 600px; }
        .cta-eyebrow { font-family: var(--mono); font-size: 9px; letter-spacing: 4px; color: #c8102e; text-transform: uppercase; margin-bottom: 20px; }
        .cta-title { font-family: var(--display); font-size: clamp(32px, 4vw, 56px); letter-spacing: 2px; color: #111; margin-bottom: 16px; line-height: 1; }
        .cta-sub { font-size: 14px; color: #888; line-height: 1.8; margin-bottom: 40px; }
        .cta-actions { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }
        .cta-btn-ghost {
          font-family: var(--mono); font-size: 11px; letter-spacing: 2px;
          text-transform: uppercase; background: transparent; color: #000000;
          border: 1px solid #ddd; padding: 10px 24px; cursor: pointer; transition: all 0.2s;
        }
        .cta-btn-ghost:hover { border-color: #111; color: #111; }

        /* ── CLIENT CAROUSEL — white ── */
        .carousel-section {
          padding: 64px 0; background: #fff; overflow: hidden;
          box-shadow: 0 -1px 0 rgba(0,0,0,0.06);
        }
        .carousel-eyebrow { font-family: var(--mono); font-size: 9px; letter-spacing: 4px; color: #000000; text-transform: uppercase; text-align: center; margin-bottom: 40px; }
        .carousel-viewport { position: relative; overflow: hidden; width: 100%; cursor: grab; user-select: none; }
        .carousel-viewport:active { cursor: grabbing; }
        .carousel-fade-left, .carousel-fade-right { position: absolute; top: 0; bottom: 0; width: 100px; z-index: 2; pointer-events: none; }
        .carousel-fade-left  { left: 0;  background: linear-gradient(to right, #fff, transparent); }
        .carousel-fade-right { right: 0; background: linear-gradient(to left,  #fff, transparent); }
        .carousel-track { display: flex; align-items: center; gap: 24px; width: max-content; will-change: transform; padding: 8px 0; }
        .carousel-item { flex-shrink: 0; }
        .carousel-logo-placeholder { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; width: 150px; height: 72px; border: 1px solid #ebebeb; border-radius: 4px; background: #fff; pointer-events: none; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,0.05); }
        .carousel-logo-icon { font-size: 20px; opacity: 0.4; }
        .carousel-logo-name { font-family: var(--mono); font-size: 9px; letter-spacing: 2px; color: #ccc; text-transform: uppercase; }
        .carousel-logo-img { width: 100%; height: 100%; object-fit: contain; padding: 12px; }

        /* ── ANIMATIONS ── */
        @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        .hero-eyebrow { animation: fadeUp 0.6s ease both; }
        .hero-title   { animation: fadeUp 0.7s 0.1s ease both; }
        .hero-sub     { animation: fadeUp 0.7s 0.2s ease both; }
        .hero-actions { animation: fadeUp 0.7s 0.3s ease both; }
        .hero-stats   { animation: fadeUp 0.7s 0.4s ease both; }

        /* ── RESPONSIVE ── */
        @media (max-width: 1024px) {
          .why-grid { grid-template-columns: repeat(2, 1fr); }
          .why-card { border-bottom: 1px solid #ebebeb; }
          .process-steps { grid-template-columns: repeat(2, 1fr); gap: 32px; }
          .process-step::after { display: none; }
        }
        @media (max-width: 900px) {
          .hero { padding: 0 24px 72px; }
          .corner-tr, .corner-br { right: 24px; }
          .corner-tl, .corner-bl { left: 24px; }
          .hero-status, .hero-stats { display: none; }
          .svc-card { height: 480px; }
          .svc-content { padding: 32px 24px; }
          .svc-arrow-left  { left: 12px; }
          .svc-arrow-right { right: 12px; }
          .svc-arrow { width: 40px; height: 40px; }
          .morph-section, .why-section, .process-section, .cta-section { padding: 72px 24px; }
          .stat-counters { gap: 40px; }
        }
        @media (max-width: 560px) {
          .hero-actions { flex-direction: column; align-items: flex-start; }
          .stat-counters { flex-direction: column; gap: 32px; }
          .why-grid { grid-template-columns: 1fr; }
          .process-steps { grid-template-columns: 1fr; }
        }
      `}</style>
        <ServicesCarousel />

      <div className="home-page">
        {/* HERO — intentionally dark */}
        <header className="hero">
          <div className="hero-bg"/>
          <div className="hero-bg-overlay"/>
          <div className="hero-scanlines"/>
          <div className="corner corner-tl"/><div className="corner corner-tr"/>
          <div className="corner corner-bl"/><div className="corner corner-br"/>
          <div className="hero-status">
            <span><span className="status-dot"/></span>
            <span>24 / 7 Active</span>
            <span>Doha, Qatar</span>
          </div>
          <div className="hero-content">
            <p className="hero-eyebrow">Advanced Security Solutions</p>
            <h1 className="hero-title">GUARD<br/><span className="outline">THE WORLD</span></h1>
            <p className="hero-sub">Elite security personnel, intelligent CCTV infrastructure, and autonomous drone surveillance — unified to protect what matters most.</p>
            <div className="hero-actions">
              <button className="btn-primary">Request a Consultation</button>
              <button className="hero-ghost-btn">View Services</button>
            </div>
          </div>
          <div className="hero-stats">
            <div><div className="stat-num">500<span>+</span></div><div className="stat-label">Clients Protected</div></div>
            <div><div className="stat-num">24<span>/7</span></div><div className="stat-label">Monitoring Active</div></div>
            <div><div className="stat-num">15<span>yr</span></div><div className="stat-label">In Operation</div></div>
          </div>
        </header>

        <WordMorphSection />
        <WhyUsSection />
        <ProcessSection />
        <CTABanner />
        <ClientCarousel />
      </div>
    </>
  );
}