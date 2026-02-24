import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { motion, useMotionValue, useAnimationFrame, useTransform, AnimatePresence } from "motion/react";
import emailjs from "@emailjs/browser";
import m4 from "../assets/m4.jpg";
import fc100 from "../assets/fc100.jpg"
import dock3 from "../assets/dock3.jpg";
import m400 from "../assets/DJI-Matrice-M400.jpg";

// ── EMAILJS CONFIG ─────────────────────────────────────────────
const EMAILJS_SERVICE_ID  = "service_ab9t908";
const EMAILJS_TEMPLATE_ID = "template_8v3i59e";
const EMAILJS_PUBLIC_KEY  = "9-v28BIq4M3L7xxbk";

// ── HERO SLIDES ───────────────────────────────────────────────
const HERO_SLIDES = [
  {
    img: m4,
    code: "M4",
    name: "Matrice 4T",
    tag: "NEW ARRIVAL · 2025",
    role: "Multi-Mission Platform",
    specs: ["45 min flight", "20 km range", "IP55 rated"],
  },
  {
    img: fc100,
    code: "FC100",
    name: "FlyCart 100",
    tag: "IN STOCK · 2024",
    role: "Cargo & Delivery",
    specs: ["100kg payload", "10km range", "Auto winch"],
  },
  {
    img: dock3,
    code: "DOCK 3",
    name: "Dock Station 3",
    tag: "FEATURED · 2025",
    role: "Autonomous Charging Hub",
    specs: ["Auto-launch", "4G/5G link", "IP55 enclosure"],
  },
  {
    img: m400,
    code: "M400",
    name: "Matrice 400",
    tag: "BESTSELLER · 2024",
    role: "Heavy Surveillance",
    specs: ["55 min flight", "15 km range", "2.7 kg payload"],
  },
];

// ── SHOWCASE DATA ─────────────────────────────────────────────
const SHOWCASE = [
  {
    img: m4, code: "M4", name: "Matrice 4T", tag: "NEW ARRIVAL", year: "2025",
    role: "Multi-Mission Platform", specs: ["45 min flight", "20km range", "IP55 rated"],
    desc: "The next evolution in DJI's enterprise lineup. Modular payload system supports thermal, LiDAR, and multispectral sensors for any mission profile.",
  },
  {
    img: fc100, code: "FC100", name: "FlyCart 100", tag: "IN STOCK", year: "2024",
    role: "Precision Autopilot", specs: ["RTK accuracy", "Dual IMU", "Failsafe AI"],
    desc: "Heavy-lift cargo drone rated for 100kg payloads. The FlyCart 100 redefines aerial logistics — from emergency resupply to industrial transport in GPS-denied zones.",
  },
  {
    img: dock3, code: "DOCK 3", name: "Dock Station 3", tag: "FEATURED", year: "2025",
    role: "Autonomous Charging Hub", specs: ["Auto-launch", "4G/5G link", "IP55 enclosure"],
    desc: "Deploy fully autonomous drone operations 24/7. The Dock 3 handles charging, storage, mission dispatch, and live transmission without human intervention.",
  },
  {
    img: m400, code: "M400", name: "Matrice 400", tag: "BESTSELLER", year: "2024",
    role: "Heavy Surveillance", specs: ["55 min flight", "15km range", "2.7kg payload"],
    desc: "Qatar's most deployed enterprise drone. The M400 delivers unmatched endurance and payload capacity for perimeter security and infrastructure inspection.",
  },
];

// ── BLUR TEXT ─────────────────────────────────────────────────
const buildKeyframes = (from, steps) => {
  const keys = new Set([...Object.keys(from), ...steps.flatMap(s => Object.keys(s))]);
  const keyframes = {};
  keys.forEach(k => { keyframes[k] = [from[k], ...steps.map(s => s[k])]; });
  return keyframes;
};

function BlurText({ text = '', delay = 200, className = '', animateBy = 'words', direction = 'top', threshold = 0.1, rootMargin = '0px', onAnimationComplete, stepDuration = 0.35 }) {
  const elements = animateBy === 'words' ? text.split(' ') : text.split('');
  const [inView, setInView] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); observer.unobserve(ref.current); } },
      { threshold, rootMargin }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);
  const defaultFrom = useMemo(() =>
    direction === 'top' ? { filter: 'blur(10px)', opacity: 0, y: -50 } : { filter: 'blur(10px)', opacity: 0, y: 50 },
    [direction]
  );
  const defaultTo = useMemo(() => [
    { filter: 'blur(5px)', opacity: 0.5, y: direction === 'top' ? 5 : -5 },
    { filter: 'blur(0px)', opacity: 1, y: 0 }
  ], [direction]);
  const stepCount = defaultTo.length + 1;
  const totalDuration = stepDuration * (stepCount - 1);
  const times = Array.from({ length: stepCount }, (_, i) => stepCount === 1 ? 0 : i / (stepCount - 1));
  return (
    <p ref={ref} className={className} style={{ display: 'flex', flexWrap: 'wrap', margin: 0 }}>
      {elements.map((segment, index) => {
        const animateKeyframes = buildKeyframes(defaultFrom, defaultTo);
        return (
          <motion.span key={index} style={{ display: 'inline-block', willChange: 'transform, filter, opacity' }}
            initial={defaultFrom} animate={inView ? animateKeyframes : defaultFrom}
            transition={{ duration: totalDuration, times, delay: (index * delay) / 1000 }}
            onAnimationComplete={index === elements.length - 1 ? onAnimationComplete : undefined}
          >
            {segment === ' ' ? '\u00A0' : segment}
            {animateBy === 'words' && index < elements.length - 1 && '\u00A0'}
          </motion.span>
        );
      })}
    </p>
  );
}

// ── SHINY TEXT ────────────────────────────────────────────────
function ShinyText({ text, disabled = false, speed = 2, className = '', color = '#b5b5b5', shineColor = '#ffffff', spread = 120, yoyo = false, pauseOnHover = false, direction = 'left', delay = 0 }) {
  const [isPaused, setIsPaused] = useState(false);
  const progress = useMotionValue(0);
  const elapsedRef = useRef(0);
  const lastTimeRef = useRef(null);
  const directionRef = useRef(direction === 'left' ? 1 : -1);
  const animationDuration = speed * 1000;
  const delayDuration = delay * 1000;
  useAnimationFrame(time => {
    if (disabled || isPaused) { lastTimeRef.current = null; return; }
    if (lastTimeRef.current === null) { lastTimeRef.current = time; return; }
    const deltaTime = time - lastTimeRef.current; lastTimeRef.current = time; elapsedRef.current += deltaTime;
    const cycleDuration = animationDuration + delayDuration;
    if (yoyo) {
      const fullCycle = cycleDuration * 2; const cycleTime = elapsedRef.current % fullCycle;
      if (cycleTime < animationDuration) { progress.set(directionRef.current === 1 ? (cycleTime / animationDuration) * 100 : 100 - (cycleTime / animationDuration) * 100); }
      else if (cycleTime < cycleDuration) { progress.set(directionRef.current === 1 ? 100 : 0); }
      else if (cycleTime < cycleDuration + animationDuration) { const p = 100 - ((cycleTime - cycleDuration) / animationDuration) * 100; progress.set(directionRef.current === 1 ? p : 100 - p); }
      else { progress.set(directionRef.current === 1 ? 0 : 100); }
    } else {
      const cycleTime = elapsedRef.current % cycleDuration;
      if (cycleTime < animationDuration) { const p = (cycleTime / animationDuration) * 100; progress.set(directionRef.current === 1 ? p : 100 - p); }
      else { progress.set(directionRef.current === 1 ? 100 : 0); }
    }
  });
  useEffect(() => { directionRef.current = direction === 'left' ? 1 : -1; elapsedRef.current = 0; progress.set(0); }, [direction]);
  const backgroundPosition = useTransform(progress, p => `${150 - p * 2}% center`);
  const handleMouseEnter = useCallback(() => { if (pauseOnHover) setIsPaused(true); }, [pauseOnHover]);
  const handleMouseLeave = useCallback(() => { if (pauseOnHover) setIsPaused(false); }, [pauseOnHover]);
  return (
    <motion.span className={className}
      style={{ backgroundImage: `linear-gradient(${spread}deg, ${color} 0%, ${color} 35%, ${shineColor} 50%, ${color} 65%, ${color} 100%)`, backgroundSize: '200% auto', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'inline-block', backgroundPosition }}
      onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}
    >{text}</motion.span>
  );
}

// ── QUOTE MODAL ───────────────────────────────────────────────
function QuoteModal({ isOpen, onClose, preselectedService = "" }) {
  const [form, setForm] = useState({ from_name: "", from_email: "", phone: "", service: preselectedService, message: "" });
  const [status, setStatus] = useState("idle");
  const overlayRef = useRef(null);
  useEffect(() => { setForm(f => ({ ...f, service: preselectedService })); }, [preselectedService]);
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);
  useEffect(() => { document.body.style.overflow = isOpen ? "hidden" : ""; return () => { document.body.style.overflow = ""; }; }, [isOpen]);
  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.from_name || !form.from_email || !form.message) return;
    setStatus("sending");
    try {
      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, { from_name: form.from_name, from_email: form.from_email, phone: form.phone || "Not provided", service: form.service || "General Inquiry", message: form.message, to_email: "hamzajebali2002@gmail.com" }, EMAILJS_PUBLIC_KEY);
      setStatus("success");
    } catch { setStatus("error"); }
  };
  const handleReset = () => { setForm({ from_name: "", from_email: "", phone: "", service: preselectedService, message: "" }); setStatus("idle"); };
  if (!isOpen) return null;
  return (
    <div className="modal-overlay" ref={overlayRef} onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}>
      <motion.div className="modal-box" initial={{ opacity: 0, y: 32, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 16, scale: 0.98 }} transition={{ duration: 0.28, ease: "easeOut" }}>
        <div className="modal-header">
          <div><p className="modal-eyebrow">Drone Services</p><h2 className="modal-title">Request a Quote</h2></div>
          <button className="modal-close" onClick={onClose}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
        </div>
        {status === "success" ? (
          <div className="modal-success">
            <div className="modal-success-icon">✓</div>
            <h3 className="modal-success-title">Quote Request Sent!</h3>
            <p className="modal-success-sub">Our team will get back to you within 24 hours.</p>
            <button className="modal-success-btn" onClick={() => { handleReset(); onClose(); }}>Done</button>
          </div>
        ) : (
          <form className="modal-form" onSubmit={handleSubmit}>
            <div className="modal-row">
              <div className="modal-field"><label className="modal-label">Full Name *</label><input className="modal-input" type="text" name="from_name" placeholder="John Smith" value={form.from_name} onChange={handleChange} required/></div>
              <div className="modal-field"><label className="modal-label">Email Address *</label><input className="modal-input" type="email" name="from_email" placeholder="john@company.com" value={form.from_email} onChange={handleChange} required/></div>
            </div>
            <div className="modal-row">
              <div className="modal-field"><label className="modal-label">Phone Number</label><input className="modal-input" type="tel" name="phone" placeholder="+974 XXXX XXXX" value={form.phone} onChange={handleChange}/></div>
              <div className="modal-field">
                <label className="modal-label">Service Required</label>
                <select className="modal-input modal-select" name="service" value={form.service} onChange={handleChange}>
                  <option value="">Select a service...</option>
                  <option value="Drone Supply">Drone Supply</option>
                  <option value="Drone Repair">Drone Repair</option>
                  <option value="Spare Parts">Spare Parts</option>
                  <option value="Maintenance">Maintenance Program</option>
                  <option value="General Inquiry">General Inquiry</option>
                </select>
              </div>
            </div>
            <div className="modal-field"><label className="modal-label">Message *</label><textarea className="modal-input modal-textarea" name="message" placeholder="Tell us about your requirements — fleet size, use case, timeline..." value={form.message} onChange={handleChange} required rows={4}/></div>
            {status === "error" && <p className="modal-error">Something went wrong. Please try again or email us directly.</p>}
            <div className="modal-actions">
              <button type="button" className="modal-cancel" onClick={onClose}>Cancel</button>
              <button type="submit" className="modal-submit" disabled={status === "sending"}>{status === "sending" ? <span className="modal-spinner"/> : "Send Request →"}</button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}

// ── DATA ─────────────────────────────────────────────────────
const SERVICES = [
  { num: "01", tag: "Enterprise Solutions", title: "Drone Supply", desc: "We provide top-tier enterprise-grade unmanned aerial systems for surveillance, inspection, and security operations. From compact scouts to heavy-lift platforms — fully configured and ready to deploy.", features: ["DJI Enterprise Series", "Custom configurations", "Fleet management systems", "Regulatory compliance support"] },
  { num: "02", tag: "Technical Services", title: "Drone Repair", desc: "Certified technicians handle everything from crash damage to motor replacements, firmware issues, and sensor calibration. Fast turnaround with genuine parts and a service warranty on every repair.", features: ["Crash & impact damage", "Motor & ESC replacement", "Camera & gimbal repair", "Firmware & calibration"] },
  { num: "03", tag: "Parts & Components", title: "Spare Parts", desc: "Full inventory of genuine and OEM-compatible spare parts. Propellers, batteries, sensors, controllers — everything you need to keep your fleet operational without downtime.", features: ["Genuine OEM parts", "Batteries & chargers", "Propellers & motors", "Controllers & accessories"] },
  { num: "04", tag: "Support Programs", title: "Maintenance", desc: "Scheduled maintenance plans that extend drone lifespan and ensure peak performance. Monthly, quarterly, or annual contracts with priority response and detailed service reports.", features: ["Scheduled inspections", "Preventive care plans", "Priority response SLA", "Detailed service reports"] },
];

const SPECS = [
  { label: "Max Range", value: "15", unit: "km" },
  { label: "Flight Time", value: "55", unit: "min" },
  { label: "Payload", value: "2.7", unit: "kg" },
  { label: "Wind Resistance", value: "12", unit: "m/s" },
];

// ── DATASHEETS ─────────────────────────────────────────────────
// Place PDF files in your /public/datasheets/ folder:
//   /public/datasheets/matrice-400-datasheet.pdf
//   /public/datasheets/matrice-4t-datasheet.pdf
//   /public/datasheets/flycart-100-datasheet.pdf
const FLEET = [
  { name: "Matrice 400", role: "Heavy Surveillance", desc: "Long-range enterprise platform with multi-sensor payload, 55-min flight time, and 15km transmission range.", datasheet: "/datasheets/matrice-400-datasheet.pdf", video: "/videos/matrice-400.mp4" },
  { name: "Matrice 4T", role: "Thermal & Visual", desc: "Quad-sensor payload with 4K visual + radiometric thermal. Engineered for perimeter security and night operations.", datasheet: "/datasheets/matrice-4t-datasheet.pdf", video: "/videos/matrice-4t.mp4" },
  { name: "FlyCart 100", role: "Cargo & Delivery", desc: "Heavy-lift delivery drone rated for 100kg payload. Ideal for logistics, emergency response, and remote resupply.", datasheet: "/datasheets/flycart-100-datasheet.pdf", video: "/videos/flycart-100.mp4" },
];

// ── SPEC COUNTER ──────────────────────────────────────────────
function SpecCounter({ value, unit, label }) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef(null);
  const rafRef = useRef(null);
  const startTime = useRef(null);
  const isFloat = value.includes(".");
  const numVal = parseFloat(value);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setStarted(true); observer.disconnect(); } }, { threshold: 0.4 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!started) return;
    startTime.current = null;
    const animate = (ts) => {
      if (!startTime.current) startTime.current = ts;
      const progress = Math.min((ts - startTime.current) / 1800, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = eased * numVal;
      setCount(isFloat ? current.toFixed(1) : Math.floor(current));
      if (progress < 1) rafRef.current = requestAnimationFrame(animate);
      else setCount(isFloat ? numVal.toFixed(1) : numVal);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [started]);
  return (
    <div className="spec-item" ref={ref}>
      <div className="spec-value">{count}<span>{unit}</span></div>
      <div className="spec-label">{label}</div>
    </div>
  );
}

// ── SHOWCASE SECTION ──────────────────────────────────────────
function ShowcaseSection({ openModal }) {
  const cardRefs = useRef([]);
  useEffect(() => {
    const observers = cardRefs.current.map((el, i) => {
      if (!el) return null;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) { el.style.transitionDelay = `${i * 0.13}s`; el.classList.add("visible"); obs.disconnect(); } },
        { threshold: 0.12 }
      );
      obs.observe(el);
      return obs;
    });
    return () => observers.forEach(o => o && o.disconnect());
  }, []);
  return (
    <section className="dp-showcase">
      <div className="dp-showcase-header">
        <div>
          <p className="dp-showcase-eyebrow">What's New</p>
          <h2 className="dp-showcase-title">LATEST FLEET<br/><span style={{ color: "transparent", WebkitTextStroke: "1px rgba(240,240,240,0.18)" }}>{"& EQUIPMENT"}</span></h2>
        </div>
        <div className="dp-showcase-sub">Updated Q1 2025</div>
      </div>
      <div className="dp-showcase-track">
        {SHOWCASE.map((item, i) => (
          <div key={i} className="dp-sc-card" ref={el => cardRefs.current[i] = el}>
            <div className="dp-sc-img-wrap">
              <img src={item.img} alt={item.name} />
              <div className="dp-sc-overlay" />
              <span className="dp-sc-tag">{item.tag}</span>
              <span className="dp-sc-year">{item.year}</span>
              <div className="dp-sc-code">{item.code}</div>
            </div>
            <div className="dp-sc-info">
              <div className="dp-sc-role">{item.role}</div>
              <div className="dp-sc-name">{item.name}</div>
              <p className="dp-sc-desc">{item.desc}</p>
              <div className="dp-sc-specs">{item.specs.map((s, j) => <div key={j} className="dp-sc-spec">{s}</div>)}</div>
            </div>
            <div className="dp-sc-bottom-bar">
              <button className="dp-sc-learn" onClick={() => openModal(item.name)}>Request Info</button>
              <div className="dp-sc-arrow" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── FLEET CARD WITH VIDEO ─────────────────────────────────────
function FleetCard({ drone, index }) {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  const togglePlay = (e) => {
    e.preventDefault();
    const vid = videoRef.current;
    if (!vid) return;
    if (playing) {
      vid.pause();
      setPlaying(false);
    } else {
      vid.play().then(() => setPlaying(true)).catch(() => {});
    }
  };

  return (
    <motion.div
      className={`dp-fleet-card${playing ? " playing" : ""}`}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, delay: index * 0.12 }}
    >
      {/* Idle dark bg */}
      <div className="dp-fleet-card-bg"/>
      <div className="dp-fleet-card-idle-num">0{index + 1}</div>

      {/* Video */}
      <video
        ref={videoRef}
        className="dp-fleet-video"
        src={drone.video}
        muted
        loop
        playsInline
        preload="metadata"
      />

      {/* Overlay gradient */}
      <div className="dp-fleet-card-overlay"/>

      {/* Hover hint */}
      <div className="dp-fleet-video-hint">▶ Play</div>

      {/* Content */}
      <div className="dp-fleet-card-content">
        <div className="dp-fleet-card-num">0{index + 1} / 0{3}</div>
        <div className="dp-fleet-name">{drone.name}</div>
        <div className="dp-fleet-role">{drone.role}</div>
        <p className="dp-fleet-desc">{drone.desc}</p>
        <div className="dp-fleet-card-footer">
          <a
            className="dp-fleet-cta"
            href={drone.datasheet}
            download
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            ↓ Datasheet
          </a>
          <button
            className="dp-fleet-play-btn"
            onClick={togglePlay}
            aria-label={playing ? "Pause video" : "Play video"}
          >
            <div className="dp-fleet-play-icon"/>
            <div className="dp-fleet-pause-icon">
              <span/><span/>
            </div>
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ── PAGE ─────────────────────────────────────────────────────
export default function DronePage() {
  const [activeService, setActiveService] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [preselectedService, setPreselectedService] = useState("");
  const [slide, setSlide] = useState(0);
  const [prevSlide, setPrevSlide] = useState(null);
  const [direction, setDirection] = useState(1);
  const timerRef = useRef(null);

  const goToSlide = useCallback((idx) => {
    setDirection(idx > slide ? 1 : -1);
    setPrevSlide(slide);
    setSlide(idx);
  }, [slide]);

  // Auto-advance
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setSlide(s => {
        const next = (s + 1) % HERO_SLIDES.length;
        setDirection(1);
        setPrevSlide(s);
        return next;
      });
    }, 5000);
    return () => clearInterval(timerRef.current);
  }, []);

  const openModal = (service = "") => { setPreselectedService(service); setModalOpen(true); };

  const current = HERO_SLIDES[slide];

  return (
    <>
      <style>{`
        .drone-page { background: #fff; }

        /* ── HERO ── */
        .dp-hero {
          min-height: 100vh; position: relative;
          display: flex; flex-direction: column; justify-content: flex-end;
          padding: 0 64px 80px; overflow: hidden;
        }

        /* Background slides */
        .dp-hero-bg {
          position: absolute; inset: 0; z-index: 0;
        }
        .dp-hero-bg-slide {
          position: absolute; inset: 0;
          background-size: cover; background-position: center;
          transition: opacity 1.2s cubic-bezier(0.4,0,0.2,1);
          opacity: 0;
        }
        .dp-hero-bg-slide.active {
          opacity: 1;
        }
        .dp-hero-bg-slide.prev {
          opacity: 0;
        }
        /* Ken Burns zoom on active slide */
        .dp-hero-bg-slide.active::after {
          content: '';
          position: absolute; inset: -5%;
          background: inherit;
          background-size: cover; background-position: center;
          animation: kenBurns 5s ease-out forwards;
        }
        @keyframes kenBurns {
          from { transform: scale(1.08); }
          to   { transform: scale(1); }
        }

        /* Dark overlays */
        .dp-hero-vignette {
          position: absolute; inset: 0; z-index: 1;
          background:
            linear-gradient(to right, rgba(10,14,22,0.85) 0%, rgba(10,14,22,0.45) 60%, rgba(10,14,22,0.2) 100%),
            linear-gradient(to top, rgba(10,14,22,0.9) 0%, transparent 50%);
        }
        .dp-hero-grid {
          position: absolute; inset: 0; z-index: 2;
          background:
            linear-gradient(rgba(200,16,46,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(200,16,46,0.025) 1px, transparent 1px);
          background-size: 64px 64px;
          animation: dpGrid 20s linear infinite;
        }
        @keyframes dpGrid { to { background-position: 64px 64px; } }

        /* Content layer */
        .dp-hero-content {
          position: relative; z-index: 3;
          display: flex; flex-direction: column;
        }
        .dp-hero-tag {
          font-family: var(--mono); font-size: 9px; letter-spacing: 5px;
          color: #c8102e; text-transform: uppercase;
          display: flex; align-items: center; gap: 14px; margin-bottom: 24px;
        }
        .dp-hero-tag::before { content: ''; display: block; width: 28px; height: 1px; background: #c8102e; }
        .dp-hero-title {
          font-family: var(--display); font-size: clamp(56px, 9vw, 120px);
          line-height: 0.88; letter-spacing: 1px; color: #f0f0f0; margin-bottom: 32px;
        }
        .dp-hero-title .outline { color: transparent; -webkit-text-stroke: 1px rgba(240,240,240,0.3); }
        .dp-hero-sub {
          font-size: 15px; font-weight: 300; color: rgba(255,255,255,0.45);
          max-width: 480px; line-height: 1.9; margin-bottom: 48px;
        }
        .dp-hero-actions { display: flex; gap: 16px; align-items: center; }
        .dp-ghost-btn {
          font-family: var(--mono); font-size: 10px; letter-spacing: 2px;
          text-transform: uppercase; background: transparent;
          color: rgba(255,255,255,0.45); border: 1px solid rgba(255,255,255,0.15);
          padding: 10px 24px; cursor: pointer; transition: all 0.2s;
        }
        .dp-ghost-btn:hover { border-color: rgba(255,255,255,0.4); color: #fff; }

        /* Slide info panel — bottom right */
        .dp-hero-panel {
          position: absolute; z-index: 3;
          bottom: 80px; right: 64px;
          width: 280px;
          border-left: 1px solid rgba(200,16,46,0.4);
          padding-left: 24px;
        }
        .dp-hero-panel-tag {
          font-family: var(--mono); font-size: 8px; letter-spacing: 3px;
          color: #c8102e; text-transform: uppercase; margin-bottom: 10px;
        }
        .dp-hero-panel-name {
          font-family: var(--display); font-size: 22px; letter-spacing: 2px;
          color: #f0f0f0; margin-bottom: 4px; line-height: 1.1;
        }
        .dp-hero-panel-role {
          font-family: var(--mono); font-size: 9px; letter-spacing: 2px;
          color: rgba(255,255,255,0.3); text-transform: uppercase; margin-bottom: 16px;
        }
        .dp-hero-panel-specs {
          display: flex; flex-direction: column; gap: 6px;
        }
        .dp-hero-panel-spec {
          font-family: var(--mono); font-size: 9px; letter-spacing: 1px;
          color: rgba(255,255,255,0.4); text-transform: uppercase;
          display: flex; align-items: center; gap: 8px;
        }
        .dp-hero-panel-spec::before { content: '—'; color: rgba(200,16,46,0.6); }

        /* Slide nav — dots + counter bottom center */
        .dp-hero-nav {
          position: absolute; z-index: 3;
          bottom: 40px; left: 50%; transform: translateX(-50%);
          display: flex; align-items: center; gap: 20px;
        }
        .dp-hero-dots { display: flex; gap: 8px; }
        .dp-hero-dot {
          width: 28px; height: 2px;
          background: rgba(255,255,255,0.15);
          border: none; cursor: pointer; padding: 0;
          transition: background 0.3s ease, width 0.35s ease;
          position: relative; overflow: hidden;
        }
        .dp-hero-dot.active {
          width: 48px; background: rgba(255,255,255,0.2);
        }
        .dp-hero-dot.active::after {
          content: '';
          position: absolute; inset: 0;
          background: #c8102e;
          animation: dotFill 5s linear forwards;
          transform-origin: left;
        }
        @keyframes dotFill {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }
        .dp-hero-counter {
          font-family: var(--mono); font-size: 10px; letter-spacing: 2px;
          color: rgba(255,255,255,0.2);
        }
        .dp-hero-counter span { color: rgba(255,255,255,0.5); }

        /* Progress bar top */
        .dp-hero-progress {
          position: absolute; top: 0; left: 0; right: 0; z-index: 4;
          height: 1px; background: rgba(255,255,255,0.05);
        }
        .dp-hero-progress-bar {
          height: 100%; background: #c8102e;
          animation: progressFill 5s linear forwards;
        }
        @keyframes progressFill {
          from { width: 0%; }
          to   { width: 100%; }
        }

        /* ── INTRO ── */
        .dp-intro { padding: 96px 64px; background: #fff; border-bottom: 1px solid #ebebeb; display: grid; grid-template-columns: 1fr 1px 1fr; gap: 64px; align-items: center; }
        .dp-intro-divider { width: 1px; height: 100%; background: linear-gradient(to bottom, transparent, #ddd 30%, #ddd 70%, transparent); align-self: stretch; }
        .dp-intro-left { max-width: 520px; }
        .dp-intro-eyebrow { font-family: var(--mono); font-size: 9px; letter-spacing: 4px; color: #c8102e; text-transform: uppercase; margin-bottom: 20px; display: flex; align-items: center; gap: 12px; }
        .dp-intro-eyebrow::before { content: ''; display: block; width: 20px; height: 1px; background: #c8102e; }
        .dp-intro-title { font-family: var(--display); font-size: clamp(28px, 3.5vw, 48px); letter-spacing: 2px; color: #111; line-height: 1.05; }
        .dp-intro-right { font-size: 14px; color: #666; line-height: 1.9; font-weight: 300; padding-left: 16px; }
        .dp-intro-right p { margin-bottom: 28px; }
        .dp-intro-stat { display: flex; align-items: baseline; gap: 8px; margin-top: 32px; padding-top: 32px; border-top: 1px solid #f0f0f0; }
        .dp-intro-stat-num { font-family: var(--display); font-size: 36px; color: #111; letter-spacing: 2px; line-height: 1; }
        .dp-intro-stat-unit { font-family: var(--mono); font-size: 9px; letter-spacing: 2px; color: #c8102e; text-transform: uppercase; }
        .dp-intro-stat-label { font-family: var(--mono); font-size: 9px; letter-spacing: 2px; color: #aaa; text-transform: uppercase; margin-left: 4px; }

        /* ── SPECS ── */
        .dp-specs { background: #0f1623; padding: 72px 64px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 0; }
        .spec-item { padding: 32px 40px; border-right: 1px solid rgba(255,255,255,0.05); text-align: center; }
        .spec-item:last-child { border-right: none; }
        .spec-value { font-family: var(--display); font-size: clamp(40px, 5vw, 64px); color: #f0f0f0; letter-spacing: 2px; line-height: 1; margin-bottom: 8px; }
        .spec-value span { color: #c8102e; font-size: 0.5em; vertical-align: super; }
        .spec-label { font-family: var(--mono); font-size: 9px; letter-spacing: 3px; color: rgba(255,255,255,0.25); text-transform: uppercase; }

        /* ── SHOWCASE ── */
        .dp-showcase { background: #0a0f1a; padding: 96px 0 0; overflow: hidden; }
        .dp-showcase-header { padding: 0 64px 64px; display: flex; align-items: flex-end; justify-content: space-between; }
        .dp-showcase-eyebrow { font-family: var(--mono); font-size: 9px; letter-spacing: 5px; color: #c8102e; text-transform: uppercase; margin-bottom: 16px; display: flex; align-items: center; gap: 12px; }
        .dp-showcase-eyebrow::before { content: ''; width: 20px; height: 1px; background: #c8102e; display: block; }
        .dp-showcase-title { font-family: var(--display); font-size: clamp(32px, 4vw, 56px); letter-spacing: 2px; color: #f0f0f0; line-height: 1; }
        .dp-showcase-sub { font-family: var(--mono); font-size: 10px; letter-spacing: 2px; color: rgba(255,255,255,0.2); text-transform: uppercase; }
        .dp-showcase-track { display: grid; grid-template-columns: repeat(4, 1fr); border-top: 1px solid rgba(255,255,255,0.05); }
        .dp-sc-card { position: relative; overflow: hidden; border-right: 1px solid rgba(255,255,255,0.05); cursor: pointer; opacity: 0; transform: translateY(48px); transition: opacity 0.7s ease, transform 0.7s ease; }
        .dp-sc-card.visible { opacity: 1; transform: translateY(0); }
        .dp-sc-card:last-child { border-right: none; }
        .dp-sc-img-wrap { position: relative; height: 340px; overflow: hidden; }
        .dp-sc-img-wrap img { width: 100%; height: 100%; object-fit: cover; object-position: center; transition: transform 0.8s cubic-bezier(0.25,0.46,0.45,0.94), filter 0.6s ease; filter: brightness(0.5) saturate(0.6); }
        .dp-sc-card:hover .dp-sc-img-wrap img { transform: scale(1.09); filter: brightness(0.72) saturate(1.1); }
        .dp-sc-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(10,15,26,0.97) 0%, rgba(10,15,26,0.25) 55%, transparent 100%); }
        .dp-sc-tag { position: absolute; top: 18px; left: 18px; font-family: var(--mono); font-size: 8px; letter-spacing: 3px; color: #c8102e; text-transform: uppercase; border: 1px solid rgba(200,16,46,0.45); padding: 5px 10px; background: rgba(10,15,26,0.65); backdrop-filter: blur(6px); }
        .dp-sc-year { position: absolute; top: 20px; right: 18px; font-family: var(--mono); font-size: 9px; letter-spacing: 2px; color: rgba(255,255,255,0.2); }
        .dp-sc-code { position: absolute; bottom: 16px; right: 16px; font-family: var(--display); font-size: 52px; letter-spacing: 1px; color: rgba(255,255,255,0.05); line-height: 1; pointer-events: none; transition: color 0.5s ease; }
        .dp-sc-card:hover .dp-sc-code { color: rgba(200,16,46,0.1); }
        .dp-sc-info { padding: 26px 26px 22px; border-top: 1px solid rgba(255,255,255,0.05); }
        .dp-sc-role { font-family: var(--mono); font-size: 8px; letter-spacing: 3px; color: rgba(255,255,255,0.22); text-transform: uppercase; margin-bottom: 9px; }
        .dp-sc-name { font-family: var(--display); font-size: 19px; letter-spacing: 2px; color: #f0f0f0; margin-bottom: 14px; line-height: 1.1; }
        .dp-sc-desc { font-size: 12px; color: rgba(255,255,255,0.32); line-height: 1.8; font-weight: 300; margin-bottom: 18px; max-height: 0; overflow: hidden; opacity: 0; transition: max-height 0.55s cubic-bezier(0.4,0,0.2,1), opacity 0.4s ease 0.05s; }
        .dp-sc-card:hover .dp-sc-desc { max-height: 100px; opacity: 1; }
        .dp-sc-specs { display: flex; flex-direction: column; gap: 7px; }
        .dp-sc-spec { display: flex; align-items: center; gap: 10px; font-family: var(--mono); font-size: 9px; letter-spacing: 1.5px; color: rgba(255,255,255,0.25); text-transform: uppercase; transition: color 0.3s; }
        .dp-sc-spec::before { content: '—'; color: rgba(200,16,46,0.45); flex-shrink: 0; }
        .dp-sc-card:hover .dp-sc-spec { color: rgba(255,255,255,0.48); }
        .dp-sc-bottom-bar { padding: 18px 26px; border-top: 1px solid rgba(255,255,255,0.04); display: flex; align-items: center; justify-content: space-between; }
        .dp-sc-learn { font-family: var(--mono); font-size: 8px; letter-spacing: 3px; color: rgba(255,255,255,0.18); text-transform: uppercase; background: none; border: none; padding: 0; cursor: pointer; transition: color 0.25s; }
        .dp-sc-card:hover .dp-sc-learn { color: #c8102e; }
        .dp-sc-arrow { width: 24px; height: 1px; background: rgba(255,255,255,0.1); position: relative; transition: width 0.35s ease, background 0.35s ease; }
        .dp-sc-arrow::after { content: ''; position: absolute; right: -1px; top: -3px; width: 7px; height: 7px; border-top: 1px solid rgba(255,255,255,0.1); border-right: 1px solid rgba(255,255,255,0.1); transform: rotate(45deg); transition: border-color 0.35s ease; }
        .dp-sc-card:hover .dp-sc-arrow { width: 40px; background: #c8102e; }
        .dp-sc-card:hover .dp-sc-arrow::after { border-color: #c8102e; }

        /* ── SERVICES ── */
        .dp-services { background: #f7f8f9; border-top: 1px solid #ebebeb; }
        .dp-services-header { padding: 72px 64px 0; display: flex; align-items: flex-end; justify-content: space-between; border-bottom: 1px solid #ebebeb; }
        .dp-services-eyebrow { font-family: var(--mono); font-size: 9px; letter-spacing: 4px; color: #c8102e; text-transform: uppercase; margin-bottom: 16px; }
        .dp-services-title { font-family: var(--display); font-size: clamp(28px, 3vw, 44px); letter-spacing: 1px; color: #111; line-height: 1; }
        .dp-tabs { display: flex; }
        .dp-tab { font-family: var(--mono); font-size: 9px; letter-spacing: 3px; text-transform: uppercase; color: #aaa; padding: 16px 28px; border: none; background: transparent; cursor: pointer; border-bottom: 2px solid transparent; transition: color 0.2s, border-color 0.2s; }
        .dp-tab:hover { color: #333; }
        .dp-tab.active { color: #111; border-bottom-color: #c8102e; }
        .dp-service-panel { display: grid; grid-template-columns: 1fr 1fr; min-height: 420px; }
        .dp-service-left { padding: 64px; background: #fff; border-right: 1px solid #ebebeb; }
        .dp-service-num { font-family: var(--display); font-size: 80px; color: #f0f0f0; letter-spacing: 2px; line-height: 1; }
        .dp-service-tag { font-family: var(--mono); font-size: 9px; letter-spacing: 4px; color: #c8102e; text-transform: uppercase; margin-bottom: 16px; display: block; }
        .dp-service-name { font-family: var(--display); font-size: clamp(28px, 3vw, 44px); letter-spacing: 2px; color: #111; margin-bottom: 20px; line-height: 1; }
        .dp-service-desc { font-size: 14px; color: #666; line-height: 1.9; font-weight: 300; margin-bottom: 36px; max-width: 420px; }
        .dp-service-right { padding: 64px; background: #f7f8f9; display: flex; flex-direction: column; justify-content: center; }
        .dp-features-title { font-family: var(--mono); font-size: 8px; letter-spacing: 4px; color: #aaa; text-transform: uppercase; margin-bottom: 28px; padding-bottom: 16px; border-bottom: 1px solid #ebebeb; }
        .dp-features-list { list-style: none; display: flex; flex-direction: column; }
        .dp-features-list li { display: flex; align-items: center; gap: 16px; padding: 16px 0; border-bottom: 1px solid #ebebeb; font-size: 14px; color: #444; font-weight: 300; transition: color 0.2s; }
        .dp-features-list li:last-child { border-bottom: none; }
        .dp-features-list li::before { content: ''; width: 20px; height: 1px; background: #c8102e; flex-shrink: 0; }
        .dp-features-list li:hover { color: #111; }

        /* ── FLEET ── */
        .dp-fleet { padding: 96px 64px; background: #0a0f1a; border-top: 1px solid rgba(255,255,255,0.04); }
        .dp-fleet-header { margin-bottom: 56px; display: flex; align-items: flex-end; justify-content: space-between; }
        .dp-fleet-eyebrow { font-family: var(--mono); font-size: 9px; letter-spacing: 4px; color: #c8102e; text-transform: uppercase; margin-bottom: 16px; display: flex; align-items: center; gap: 10px; }
        .dp-fleet-eyebrow::before { content: ''; display: block; width: 20px; height: 1px; background: #c8102e; }
        .dp-fleet-title { font-family: var(--display); font-size: clamp(28px, 3vw, 44px); letter-spacing: 1px; color: #f0f0f0; }
        .dp-fleet-count { font-family: var(--mono); font-size: 10px; letter-spacing: 2px; color: rgba(255,255,255,0.2); text-transform: uppercase; }
        .dp-fleet-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px; }

        .dp-fleet-card { position: relative; overflow: hidden; height: 500px; cursor: pointer; background: #0d1220; }

        /* video */
        .dp-fleet-video { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: center; opacity: 0; transition: opacity 0.7s ease; filter: saturate(0.7) brightness(0.5); }
        .dp-fleet-card.playing .dp-fleet-video { opacity: 1; }
        .dp-fleet-card.playing:hover .dp-fleet-video { filter: saturate(1) brightness(0.65); }

        /* idle state: dark gradient bg */
        .dp-fleet-card-bg {
          position: absolute; inset: 0;
          background: linear-gradient(135deg, #111827 0%, #0a0f1a 100%);
          transition: opacity 0.7s ease;
        }
        .dp-fleet-card.playing .dp-fleet-card-bg { opacity: 0; }

        /* idle number watermark */
        .dp-fleet-card-idle-num {
          position: absolute; right: -10px; bottom: -20px;
          font-family: var(--display); font-size: 160px; letter-spacing: -4px;
          color: rgba(255,255,255,0.03); line-height: 1; pointer-events: none;
          transition: opacity 0.5s;
        }
        .dp-fleet-card.playing .dp-fleet-card-idle-num { opacity: 0; }

        /* gradient overlay over video */
        .dp-fleet-card-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to top, rgba(5,8,16,0.96) 0%, rgba(5,8,16,0.5) 45%, rgba(5,8,16,0.1) 100%);
          z-index: 1;
        }

        /* red accent line left */
        .dp-fleet-card::before {
          content: ''; position: absolute; left: 0; top: 15%; bottom: 15%;
          width: 2px; background: linear-gradient(to bottom, transparent, #c8102e, transparent);
          z-index: 2; opacity: 0; transition: opacity 0.4s ease;
        }
        .dp-fleet-card:hover::before { opacity: 1; }

        /* content */
        .dp-fleet-card-content {
          position: absolute; inset: 0; z-index: 2;
          display: flex; flex-direction: column; justify-content: flex-end;
          padding: 32px 28px;
        }
        .dp-fleet-card-num {
          font-family: var(--display); font-size: 11px; letter-spacing: 4px;
          color: rgba(255,255,255,0.2); text-transform: uppercase; margin-bottom: 16px;
        }
        .dp-fleet-name {
          font-family: var(--display); font-size: clamp(20px, 2vw, 26px);
          letter-spacing: 2px; color: #f0f0f0; margin-bottom: 6px; line-height: 1.1;
        }
        .dp-fleet-role {
          font-family: var(--mono); font-size: 8px; letter-spacing: 3px;
          color: #c8102e; text-transform: uppercase; margin-bottom: 14px;
        }
        .dp-fleet-desc {
          font-size: 12px; color: rgba(255,255,255,0.38); line-height: 1.75;
          font-weight: 300; margin-bottom: 24px;
          max-height: 0; overflow: hidden; opacity: 0;
          transition: max-height 0.5s ease, opacity 0.4s ease;
        }
        .dp-fleet-card:hover .dp-fleet-desc { max-height: 80px; opacity: 1; }

        .dp-fleet-card-footer {
          display: flex; align-items: center; justify-content: space-between;
          padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.08);
        }
        .dp-fleet-cta {
          font-family: var(--mono); font-size: 8px; letter-spacing: 2px;
          color: rgba(255,255,255,0.3); text-transform: uppercase;
          background: none; border: none; cursor: pointer; padding: 0;
          transition: color 0.2s; text-decoration: none;
          display: inline-flex; align-items: center; gap: 6px;
        }
        .dp-fleet-card:hover .dp-fleet-cta { color: #c8102e; }

        /* play/pause indicator */
        .dp-fleet-play-btn {
          width: 28px; height: 28px; border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.15);
          background: rgba(255,255,255,0.05);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: border-color 0.2s, background 0.2s;
          flex-shrink: 0;
        }
        .dp-fleet-card:hover .dp-fleet-play-btn { border-color: rgba(200,16,46,0.5); background: rgba(200,16,46,0.08); }
        .dp-fleet-play-icon {
          width: 0; height: 0;
          border-top: 5px solid transparent; border-bottom: 5px solid transparent;
          border-left: 8px solid rgba(255,255,255,0.4);
          margin-left: 2px; transition: border-left-color 0.2s;
        }
        .dp-fleet-pause-icon {
          display: none; gap: 3px;
        }
        .dp-fleet-pause-icon span {
          width: 2px; height: 9px; background: rgba(255,255,255,0.4);
          border-radius: 1px; display: block;
        }
        .dp-fleet-card.playing .dp-fleet-play-icon { display: none; }
        .dp-fleet-card.playing .dp-fleet-pause-icon { display: flex; }
        .dp-fleet-card:hover .dp-fleet-play-icon { border-left-color: #c8102e; }
        .dp-fleet-card:hover .dp-fleet-pause-icon span { background: #c8102e; }

        /* video hint badge */
        .dp-fleet-video-hint {
          position: absolute; top: 16px; right: 16px; z-index: 3;
          font-family: var(--mono); font-size: 7px; letter-spacing: 2px;
          color: rgba(255,255,255,0.3); text-transform: uppercase;
          border: 1px solid rgba(255,255,255,0.1); padding: 4px 8px;
          background: rgba(0,0,0,0.3); backdrop-filter: blur(4px);
          opacity: 1; transition: opacity 0.4s;
        }
        .dp-fleet-card.playing .dp-fleet-video-hint { opacity: 0; }

        /* ── CTA ── */
        .dp-cta { padding: 96px 64px; background: #ffffff; display: flex; align-items: center; justify-content: center; text-align: center; border-top: 1px solid #ebebeb; }
        .dp-cta-inner {
          max-width: 620px;
          background: #fff;
          padding: 64px 56px;
          box-shadow: 0 8px 48px rgba(0,0,0,0.08), 0 2px 12px rgba(200,16,46,0.06), 0 0 0 1px rgba(0,0,0,0.04);
          border-radius: 2px;
        }
        .dp-cta-eyebrow { font-family: var(--mono); font-size: 9px; letter-spacing: 4px; color: #c8102e; text-transform: uppercase; margin-bottom: 24px; }
        .dp-cta-title { font-family: var(--display); font-size: clamp(32px, 4vw, 56px); letter-spacing: 2px; color: #111; margin-bottom: 20px; line-height: 1; }
        .dp-cta-sub { font-size: 14px; color: #888; line-height: 1.9; margin-bottom: 44px; }
        .dp-cta-actions { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }
        .dp-cta-ghost { font-family: var(--mono); font-size: 10px; letter-spacing: 2px; text-transform: uppercase; background: transparent; color: #999; border: 1px solid #ddd; padding: 10px 24px; cursor: pointer; transition: all 0.2s; }
        .dp-cta-ghost:hover { border-color: #111; color: #111; }

        /* ── MODAL ── */
        .modal-overlay { position: fixed; inset: 0; z-index: 200; background: rgba(0,0,0,0.55); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; padding: 24px; }
        .modal-box { background: #fff; width: 100%; max-width: 600px; max-height: 90vh; overflow-y: auto; border: 1px solid #e8e8e8; box-shadow: 0 32px 80px rgba(0,0,0,0.2); }
        .modal-header { display: flex; align-items: flex-start; justify-content: space-between; padding: 36px 40px 28px; border-bottom: 1px solid #f0f0f0; }
        .modal-eyebrow { font-family: var(--mono); font-size: 8px; letter-spacing: 4px; color: #c8102e; text-transform: uppercase; margin-bottom: 8px; }
        .modal-title { font-family: var(--display); font-size: 28px; letter-spacing: 2px; color: #111; line-height: 1; }
        .modal-close { background: none; border: 1px solid #e8e8e8; padding: 8px; cursor: pointer; color: #999; transition: all 0.2s; flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
        .modal-close:hover { border-color: #111; color: #111; }
        .modal-form { padding: 32px 40px 40px; display: flex; flex-direction: column; gap: 20px; }
        .modal-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .modal-field { display: flex; flex-direction: column; gap: 8px; }
        .modal-label { font-family: var(--mono); font-size: 9px; letter-spacing: 2px; color: #888; text-transform: uppercase; }
        .modal-input { font-family: var(--mono); font-size: 12px; letter-spacing: 0.5px; color: #111; background: #fafafa; border: 1px solid #e8e8e8; padding: 12px 14px; outline: none; transition: border-color 0.2s; width: 100%; box-sizing: border-box; }
        .modal-input:focus { border-color: #c8102e; background: #fff; }
        .modal-input::placeholder { color: #ccc; }
        .modal-select { cursor: pointer; appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' fill='none'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23999' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 14px center; padding-right: 36px; }
        .modal-textarea { resize: vertical; min-height: 100px; font-family: var(--mono); }
        .modal-error { font-family: var(--mono); font-size: 10px; letter-spacing: 1px; color: #c8102e; padding: 12px 14px; border: 1px solid rgba(200,16,46,0.2); background: rgba(200,16,46,0.04); }
        .modal-actions { display: flex; justify-content: flex-end; gap: 12px; padding-top: 8px; }
        .modal-cancel { font-family: var(--mono); font-size: 10px; letter-spacing: 2px; text-transform: uppercase; background: transparent; color: #999; border: 1px solid #e8e8e8; padding: 10px 20px; cursor: pointer; transition: all 0.2s; }
        .modal-cancel:hover { border-color: #333; color: #333; }
        .modal-submit { font-family: var(--mono); font-size: 10px; letter-spacing: 2px; text-transform: uppercase; background: #111; color: #fff; border: none; padding: 10px 28px; cursor: pointer; transition: background 0.2s; display: flex; align-items: center; gap: 8px; }
        .modal-submit:hover:not(:disabled) { background: #c8102e; }
        .modal-submit:disabled { opacity: 0.6; cursor: not-allowed; }
        .modal-spinner { width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .modal-success { padding: 60px 40px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 16px; }
        .modal-success-icon { width: 56px; height: 56px; border-radius: 50%; background: rgba(200,16,46,0.08); display: flex; align-items: center; justify-content: center; font-size: 22px; color: #c8102e; font-weight: bold; }
        .modal-success-title { font-family: var(--display); font-size: 24px; letter-spacing: 2px; color: #111; }
        .modal-success-sub { font-size: 14px; color: #888; line-height: 1.7; max-width: 300px; }
        .modal-success-btn { margin-top: 8px; font-family: var(--mono); font-size: 10px; letter-spacing: 2px; text-transform: uppercase; background: #111; color: #fff; border: none; padding: 12px 32px; cursor: pointer; transition: background 0.2s; }
        .modal-success-btn:hover { background: #c8102e; }

        /* ── RESPONSIVE ── */
        @media (max-width: 900px) {
          .dp-hero { padding: 0 24px 72px; }
          .dp-hero-panel { right: 24px; bottom: 72px; width: 220px; }
          .dp-intro { grid-template-columns: 1fr; gap: 40px; padding: 56px 24px; }
          .dp-intro-divider { display: none; }
          .dp-intro-right { padding-left: 0; }
          .dp-specs { grid-template-columns: repeat(2, 1fr); padding: 48px 24px; }
          .dp-showcase-header { flex-direction: column; align-items: flex-start; gap: 16px; padding: 0 24px 48px; }
          .dp-showcase-track { grid-template-columns: 1fr 1fr; }
          .dp-sc-img-wrap { height: 220px; }
          .dp-showcase { padding-top: 72px; }
          .dp-service-panel { grid-template-columns: 1fr; }
          .dp-service-left, .dp-service-right { padding: 40px 24px; }
          .dp-services-header { flex-direction: column; align-items: flex-start; gap: 24px; padding: 48px 24px 0; }
          .dp-tabs { flex-wrap: wrap; }
          .dp-fleet-grid { grid-template-columns: 1fr; }
          .dp-fleet-header { flex-direction: column; align-items: flex-start; gap: 8px; }
          .dp-fleet-card { height: 420px; }
          .dp-fleet { padding: 72px 24px; }
          .dp-cta { padding: 72px 24px; }
          .modal-row { grid-template-columns: 1fr; }
          .modal-header, .modal-form { padding-left: 24px; padding-right: 24px; }
        }
        @media (max-width: 540px) {
          .dp-showcase-track { grid-template-columns: 1fr; }
          .dp-hero-panel { display: none; }
        }
      `}</style>

      <div className="drone-page">

        {/* ── HERO ── */}
        <section className="dp-hero">

          {/* Background slideshow */}
          <div className="dp-hero-bg">
            {HERO_SLIDES.map((s, i) => (
              <div
                key={i}
                className={`dp-hero-bg-slide${i === slide ? " active" : ""}`}
                style={{ backgroundImage: `url(${s.img})` }}
              />
            ))}
          </div>

          {/* Top progress bar */}
          <div className="dp-hero-progress">
            <div key={slide} className="dp-hero-progress-bar" />
          </div>

          <div className="dp-hero-vignette" />
          <div className="dp-hero-grid" />

          {/* Main copy */}
          <div className="dp-hero-content">
            <p className="dp-hero-tag">Aerial Security Division</p>
            <h1 className="dp-hero-title">DRONE<br/><span className="outline">SOLUTIONS</span></h1>
            <p className="dp-hero-sub">Enterprise-grade unmanned aerial systems for surveillance, security, and beyond. Supply, repair, parts, and full maintenance — all under one roof.</p>
            <div className="dp-hero-actions">
              <button className="btn-primary" onClick={() => openModal()}>Request a Quote</button>
              <button className="dp-ghost-btn" onClick={() => { const el = document.getElementById("fleet-section"); if(el) el.scrollIntoView({behavior:"smooth"}); }}>View Fleet</button>
            </div>
          </div>

          {/* Slide info panel — bottom right */}
          <AnimatePresence mode="wait">
            <motion.div
              key={slide}
              className="dp-hero-panel"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <div className="dp-hero-panel-tag">{current.tag}</div>
              <div className="dp-hero-panel-name">{current.name}</div>
              <div className="dp-hero-panel-role">{current.role}</div>
              <div className="dp-hero-panel-specs">
                {current.specs.map((s, i) => (
                  <div key={i} className="dp-hero-panel-spec">{s}</div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Dot nav + counter */}
          <div className="dp-hero-nav">
            <div className="dp-hero-dots">
              {HERO_SLIDES.map((_, i) => (
                <button
                  key={i}
                  className={`dp-hero-dot${i === slide ? " active" : ""}`}
                  onClick={() => goToSlide(i)}
                />
              ))}
            </div>
            <div className="dp-hero-counter">
              <span>{String(slide + 1).padStart(2, "0")}</span> / {String(HERO_SLIDES.length).padStart(2, "0")}
            </div>
          </div>

        </section>

        {/* ── INTRO ── */}
        <section className="dp-intro">
          <div className="dp-intro-left">
            <p className="dp-intro-eyebrow">What We Do</p>
            <BlurText text="Complete Drone Services for the Modern Enterprise" delay={80} animateBy="words" direction="bottom" className="dp-intro-title" stepDuration={0.4}/>
          </div>
          <div className="dp-intro-divider"/>
          <div className="dp-intro-right">
            <p>
              <ShinyText text="From procurement to post-flight maintenance, SAMAM is Qatar's trusted partner for enterprise drone operations." speed={6} color="#555" shineColor="#111" spread={80}/>
            </p>
            <p style={{color:"#999", fontSize:"13px", lineHeight:"1.9"}}>Our certified technicians and genuine parts inventory ensure your fleet stays airborne — 24/7, mission-ready.</p>
            <div className="dp-intro-stat">
              <span className="dp-intro-stat-num">24</span><span className="dp-intro-stat-unit">/7</span>
              <span className="dp-intro-stat-label">Operational Support</span>
              <span style={{margin:"0 16px", color:"#eee"}}>|</span>
              <span className="dp-intro-stat-num">100<span style={{fontSize:"0.5em",color:"#c8102e",verticalAlign:"super"}}>+</span></span>
              <span className="dp-intro-stat-label">Drones Deployed</span>
            </div>
          </div>
        </section>

        {/* ── SPECS ── */}
        <div className="dp-specs">
          {SPECS.map((s, i) => <SpecCounter key={i} {...s} />)}
        </div>

        {/* ── WHAT'S NEW SHOWCASE ── */}
        <ShowcaseSection openModal={openModal} />

        {/* ── SERVICES ── */}
        <section className="dp-services">
          <div className="dp-services-header">
            <div>
              <p className="dp-services-eyebrow">Our Drone Services</p>
              <h2 className="dp-services-title">Everything Your Fleet Needs</h2>
            </div>
            <div className="dp-tabs">
              {SERVICES.map((s, i) => (
                <button key={i} className={`dp-tab${activeService === i ? " active" : ""}`} onClick={() => setActiveService(i)}>{s.title}</button>
              ))}
            </div>
          </div>
          <motion.div key={activeService} className="dp-service-panel" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: "easeOut" }}>
            <div className="dp-service-left">
              <div className="dp-service-num">{SERVICES[activeService].num}</div>
              <span className="dp-service-tag">{SERVICES[activeService].tag}</span>
              <h3 className="dp-service-name">{SERVICES[activeService].title}</h3>
              <p className="dp-service-desc">{SERVICES[activeService].desc}</p>
              <button className="btn-primary" onClick={() => openModal(SERVICES[activeService].title)}>Get a Quote</button>
            </div>
            <div className="dp-service-right">
              <p className="dp-features-title">What's Included</p>
              <ul className="dp-features-list">
                {SERVICES[activeService].features.map((f, i) => <li key={i}>{f}</li>)}
              </ul>
            </div>
          </motion.div>
        </section>

        {/* ── FLEET ── */}
        <section className="dp-fleet" id="fleet-section">
          <div className="dp-fleet-header">
            <div>
              <p className="dp-fleet-eyebrow">Our Fleet</p>
              <h2 className="dp-fleet-title">Platforms We Work With</h2>
            </div>
            <div className="dp-fleet-count">{FLEET.length} platforms available</div>
          </div>
          <div className="dp-fleet-grid">
            {FLEET.map((drone, i) => (
              <FleetCard key={i} drone={drone} index={i} />
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="dp-cta">
          <div className="dp-cta-inner">
            <p className="dp-cta-eyebrow">Ready to Elevate Your Security?</p>
            <h2 className="dp-cta-title"><ShinyText text="Let's Get Your Fleet Flying" speed={4} color="#333" shineColor="#c8102e" spread={90}/></h2>
            <p className="dp-cta-sub">Talk to our drone specialists and get a tailored proposal for your surveillance and operations needs.</p>
            <div className="dp-cta-actions">
              <button className="btn-primary" onClick={() => openModal()}>Book a Consultation</button>
              <button className="dp-cta-ghost">Download Brochure</button>
            </div>
          </div>
        </section>

      </div>

      <QuoteModal isOpen={modalOpen} onClose={() => setModalOpen(false)} preselectedService={preselectedService}/>
    </>
  );
}