import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { motion, useMotionValue, useAnimationFrame, useTransform } from "motion/react";
import emailjs from "@emailjs/browser";
import m4 from "../assets/m4.jpg";
import fc100 from "../assets/fc100.jpg"
import dock3 from "../assets/dock3.jpg";
import m400 from "../assets/DJI-Matrice-M400.jpg";

// ── EMAILJS CONFIG — replace with your actual IDs ─────────────
const EMAILJS_SERVICE_ID  = "service_ab9t908";
const EMAILJS_TEMPLATE_ID = "template_8v3i59e";
const EMAILJS_PUBLIC_KEY  = "9-v28BIq4M3L7xxbk";

// ── BLUR TEXT (inlined) ───────────────────────────────────────
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
          <motion.span
            key={index}
            style={{ display: 'inline-block', willChange: 'transform, filter, opacity' }}
            initial={defaultFrom}
            animate={inView ? animateKeyframes : defaultFrom}
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

// ── SHINY TEXT (inlined) ──────────────────────────────────────
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
    const deltaTime = time - lastTimeRef.current;
    lastTimeRef.current = time;
    elapsedRef.current += deltaTime;
    const cycleDuration = animationDuration + delayDuration;
    if (yoyo) {
      const fullCycle = cycleDuration * 2;
      const cycleTime = elapsedRef.current % fullCycle;
      if (cycleTime < animationDuration) {
        progress.set(directionRef.current === 1 ? (cycleTime / animationDuration) * 100 : 100 - (cycleTime / animationDuration) * 100);
      } else if (cycleTime < cycleDuration) {
        progress.set(directionRef.current === 1 ? 100 : 0);
      } else if (cycleTime < cycleDuration + animationDuration) {
        const p = 100 - ((cycleTime - cycleDuration) / animationDuration) * 100;
        progress.set(directionRef.current === 1 ? p : 100 - p);
      } else {
        progress.set(directionRef.current === 1 ? 0 : 100);
      }
    } else {
      const cycleTime = elapsedRef.current % cycleDuration;
      if (cycleTime < animationDuration) {
        const p = (cycleTime / animationDuration) * 100;
        progress.set(directionRef.current === 1 ? p : 100 - p);
      } else {
        progress.set(directionRef.current === 1 ? 100 : 0);
      }
    }
  });

  useEffect(() => {
    directionRef.current = direction === 'left' ? 1 : -1;
    elapsedRef.current = 0;
    progress.set(0);
  }, [direction]);

  const backgroundPosition = useTransform(progress, p => `${150 - p * 2}% center`);
  const handleMouseEnter = useCallback(() => { if (pauseOnHover) setIsPaused(true); }, [pauseOnHover]);
  const handleMouseLeave = useCallback(() => { if (pauseOnHover) setIsPaused(false); }, [pauseOnHover]);

  return (
    <motion.span
      className={className}
      style={{
        backgroundImage: `linear-gradient(${spread}deg, ${color} 0%, ${color} 35%, ${shineColor} 50%, ${color} 65%, ${color} 100%)`,
        backgroundSize: '200% auto',
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        display: 'inline-block',
        backgroundPosition,
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {text}
    </motion.span>
  );
}

// ── QUOTE MODAL ───────────────────────────────────────────────
function QuoteModal({ isOpen, onClose, preselectedService = "" }) {
  const [form, setForm] = useState({
    from_name: "", from_email: "", phone: "", service: preselectedService, message: ""
  });
  const [status, setStatus] = useState("idle"); // idle | sending | success | error
  const overlayRef = useRef(null);

  // Update service when preselected changes
  useEffect(() => {
    setForm(f => ({ ...f, service: preselectedService }));
  }, [preselectedService]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.from_name || !form.from_email || !form.message) return;
    setStatus("sending");
    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          from_name:  form.from_name,
          from_email: form.from_email,
          phone:      form.phone || "Not provided",
          service:    form.service || "General Inquiry",
          message:    form.message,
          to_email:   "hamzajebali2002@gmail.com",
        },
        EMAILJS_PUBLIC_KEY
      );
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  const handleReset = () => {
    setForm({ from_name: "", from_email: "", phone: "", service: preselectedService, message: "" });
    setStatus("idle");
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <motion.div
        className="modal-box"
        initial={{ opacity: 0, y: 32, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.98 }}
        transition={{ duration: 0.28, ease: "easeOut" }}
      >
        {/* HEADER */}
        <div className="modal-header">
          <div>
            <p className="modal-eyebrow">Drone Services</p>
            <h2 className="modal-title">Request a Quote</h2>
          </div>
          <button className="modal-close" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* SUCCESS STATE */}
        {status === "success" ? (
          <div className="modal-success">
            <div className="modal-success-icon">✓</div>
            <h3 className="modal-success-title">Quote Request Sent!</h3>
            <p className="modal-success-sub">Our team will get back to you within 24 hours.</p>
            <button className="modal-success-btn" onClick={() => { handleReset(); onClose(); }}>
              Done
            </button>
          </div>
        ) : (
          <form className="modal-form" onSubmit={handleSubmit}>
            <div className="modal-row">
              <div className="modal-field">
                <label className="modal-label">Full Name *</label>
                <input
                  className="modal-input"
                  type="text"
                  name="from_name"
                  placeholder="John Smith"
                  value={form.from_name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="modal-field">
                <label className="modal-label">Email Address *</label>
                <input
                  className="modal-input"
                  type="email"
                  name="from_email"
                  placeholder="john@company.com"
                  value={form.from_email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="modal-row">
              <div className="modal-field">
                <label className="modal-label">Phone Number</label>
                <input
                  className="modal-input"
                  type="tel"
                  name="phone"
                  placeholder="+974 XXXX XXXX"
                  value={form.phone}
                  onChange={handleChange}
                />
              </div>
              <div className="modal-field">
                <label className="modal-label">Service Required</label>
                <select
                  className="modal-input modal-select"
                  name="service"
                  value={form.service}
                  onChange={handleChange}
                >
                  <option value="">Select a service...</option>
                  <option value="Drone Supply">Drone Supply</option>
                  <option value="Drone Repair">Drone Repair</option>
                  <option value="Spare Parts">Spare Parts</option>
                  <option value="Maintenance">Maintenance Program</option>
                  <option value="General Inquiry">General Inquiry</option>
                </select>
              </div>
            </div>
            <div className="modal-field">
              <label className="modal-label">Message *</label>
              <textarea
                className="modal-input modal-textarea"
                name="message"
                placeholder="Tell us about your requirements — fleet size, use case, timeline..."
                value={form.message}
                onChange={handleChange}
                required
                rows={4}
              />
            </div>

            {status === "error" && (
              <p className="modal-error">Something went wrong. Please try again or email us directly.</p>
            )}

            <div className="modal-actions">
              <button type="button" className="modal-cancel" onClick={onClose}>Cancel</button>
              <button type="submit" className="modal-submit" disabled={status === "sending"}>
                {status === "sending" ? (
                  <span className="modal-spinner"/>
                ) : "Send Request →"}
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}

// ── DATA ─────────────────────────────────────────────────────
const SERVICES = [
  {
    num: "01", tag: "Enterprise Solutions", title: "Drone Supply",
    desc: "We provide top-tier enterprise-grade unmanned aerial systems for surveillance, inspection, and security operations. From compact scouts to heavy-lift platforms — fully configured and ready to deploy.",
    features: ["DJI Enterprise Series", "Custom configurations", "Fleet management systems", "Regulatory compliance support"],
  },
  {
    num: "02", tag: "Technical Services", title: "Drone Repair",
    desc: "Certified technicians handle everything from crash damage to motor replacements, firmware issues, and sensor calibration. Fast turnaround with genuine parts and a service warranty on every repair.",
    features: ["Crash & impact damage", "Motor & ESC replacement", "Camera & gimbal repair", "Firmware & calibration"],
  },
  {
    num: "03", tag: "Parts & Components", title: "Spare Parts",
    desc: "Full inventory of genuine and OEM-compatible spare parts. Propellers, batteries, sensors, controllers — everything you need to keep your fleet operational without downtime.",
    features: ["Genuine OEM parts", "Batteries & chargers", "Propellers & motors", "Controllers & accessories"],
  },
  {
    num: "04", tag: "Support Programs", title: "Maintenance",
    desc: "Scheduled maintenance plans that extend drone lifespan and ensure peak performance. Monthly, quarterly, or annual contracts with priority response and detailed service reports.",
    features: ["Scheduled inspections", "Preventive care plans", "Priority response SLA", "Detailed service reports"],
  },
];

const SPECS = [
  { label: "Max Range", value: "15", unit: "km" },
  { label: "Flight Time", value: "55", unit: "min" },
  { label: "Payload", value: "2.7", unit: "kg" },
  { label: "Wind Resistance", value: "12", unit: "m/s" },
];

const FLEET = [
  { name: "Matrice 400", role: "Heavy Surveillance", desc: "Long-range enterprise platform with multi-sensor payload and 55-min flight time." },
  { name: "Matrice 30T", role: "Thermal Inspection", desc: "Dual visual + thermal camera system for perimeter monitoring and threat detection." },
  { name: "Mavic 3E", role: "Rapid Deployment", desc: "Compact and fast — ideal for quick aerial assessments and mobile operations." },
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
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setStarted(true); observer.disconnect(); } },
      { threshold: 0.4 }
    );
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

// ── PAGE ─────────────────────────────────────────────────────
export default function DronePage() {
  const [activeService, setActiveService] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [preselectedService, setPreselectedService] = useState("");

  const openModal = (service = "") => {
    setPreselectedService(service);
    setModalOpen(true);
  };

  return (
    <>
      <style>{`
        .drone-page { background: #fff; }

        /* ── HERO ── */
        .dp-hero {
          min-height: 100vh; background: #0f1623;
          position: relative; display: flex;
          flex-direction: column; justify-content: flex-end;
          padding: 0 64px 96px; overflow: hidden;
        }
        .dp-hero-grid {
          position: absolute; inset: 0;
          background:
            linear-gradient(rgba(200,16,46,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(200,16,46,0.03) 1px, transparent 1px);
          background-size: 64px 64px;
          animation: dpGrid 20s linear infinite;
        }
        @keyframes dpGrid { to { background-position: 64px 64px; } }
        .dp-hero-glow {
          position: absolute; inset: 0;
          background: radial-gradient(ellipse 70% 60% at 70% 30%, rgba(200,16,46,0.07) 0%, transparent 60%),
                      linear-gradient(to bottom, transparent 40%, #0f1623 100%);
        }
        .dp-drone-float {
          position: absolute; right: 64px; bottom: 160px; z-index: 2;
          font-size: 140px; opacity: 0.05;
          animation: dpFloat 4s ease-in-out infinite;
        }
        @keyframes dpFloat {
          0%, 100% { transform: translateY(0) rotate(-5deg); }
          50% { transform: translateY(-24px) rotate(5deg); }
        }
        .dp-hero-badge {
          position: absolute; top: 96px; right: 64px; z-index: 2;
          display: flex; flex-direction: column; gap: 28px; text-align: right;
        }
        .dp-badge-num { font-family: var(--display); font-size: 38px; color: #f0f0f0; letter-spacing: 2px; line-height: 1; }
        .dp-badge-num span { color: #c8102e; }
        .dp-badge-label { font-family: var(--mono); font-size: 9px; letter-spacing: 2px; color: rgba(255,255,255,0.25); text-transform: uppercase; margin-top: 4px; }
        .dp-hero-tag {
          position: relative; z-index: 2;
          font-family: var(--mono); font-size: 9px; letter-spacing: 5px;
          color: #c8102e; text-transform: uppercase;
          display: flex; align-items: center; gap: 14px; margin-bottom: 24px;
        }
        .dp-hero-tag::before { content: ''; display: block; width: 28px; height: 1px; background: #c8102e; }
        .dp-hero-title {
          position: relative; z-index: 2;
          font-family: var(--display); font-size: clamp(56px, 9vw, 120px);
          line-height: 0.88; letter-spacing: 1px; color: #f0f0f0; margin-bottom: 32px;
        }
        .dp-hero-title .outline { color: transparent; -webkit-text-stroke: 1px rgba(240,240,240,0.3); }
        .dp-hero-sub {
          position: relative; z-index: 2;
          font-size: 15px; font-weight: 300; color: rgba(255,255,255,0.45);
          max-width: 480px; line-height: 1.9; margin-bottom: 48px;
        }
        .dp-hero-actions { position: relative; z-index: 2; display: flex; gap: 16px; align-items: center; }
        .dp-ghost-btn {
          font-family: var(--mono); font-size: 10px; letter-spacing: 2px;
          text-transform: uppercase; background: transparent;
          color: rgba(255,255,255,0.45); border: 1px solid rgba(255,255,255,0.15);
          padding: 10px 24px; cursor: pointer; transition: all 0.2s;
        }
        .dp-ghost-btn:hover { border-color: rgba(255,255,255,0.4); color: #fff; }

        /* ── INTRO ── */
        .dp-intro {
          padding: 80px 64px; background: #fff; border-bottom: 1px solid #ebebeb;
          display: flex; align-items: center; justify-content: space-between; gap: 64px;
        }
        .dp-intro-left { max-width: 560px; }
        .dp-intro-eyebrow { font-family: var(--mono); font-size: 9px; letter-spacing: 4px; color: #c8102e; text-transform: uppercase; margin-bottom: 20px; }
        .dp-intro-title { font-family: var(--display); font-size: clamp(28px, 3.5vw, 48px); letter-spacing: 2px; color: #111; line-height: 1.05; }
        .dp-intro-right { max-width: 400px; flex-shrink: 0; font-size: 14px; color: #666; line-height: 1.9; font-weight: 300; }

        /* ── SPECS ── */
        .dp-specs { background: #0f1623; padding: 72px 64px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 0; }
        .spec-item { padding: 32px 40px; border-right: 1px solid rgba(255,255,255,0.05); text-align: center; }
        .spec-item:last-child { border-right: none; }
        .spec-value { font-family: var(--display); font-size: clamp(40px, 5vw, 64px); color: #f0f0f0; letter-spacing: 2px; line-height: 1; margin-bottom: 8px; }
        .spec-value span { color: #c8102e; font-size: 0.5em; vertical-align: super; }
        .spec-label { font-family: var(--mono); font-size: 9px; letter-spacing: 3px; color: rgba(255,255,255,0.25); text-transform: uppercase; }

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
        .dp-fleet { padding: 96px 64px; background: #fff; border-top: 1px solid #ebebeb; }
        .dp-fleet-header { margin-bottom: 56px; }
        .dp-fleet-eyebrow { font-family: var(--mono); font-size: 9px; letter-spacing: 4px; color: #c8102e; text-transform: uppercase; margin-bottom: 16px; }
        .dp-fleet-title { font-family: var(--display); font-size: clamp(28px, 3vw, 44px); letter-spacing: 1px; color: #111; }
        .dp-fleet-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px; border: 1px solid #ebebeb; }
        .dp-fleet-card { padding: 40px 36px; border-right: 1px solid #ebebeb; transition: background 0.25s; position: relative; overflow: hidden; }
        .dp-fleet-card:last-child { border-right: none; }
        .dp-fleet-card:hover { background: #fafafa; }
        .dp-fleet-card::after { content: ''; position: absolute; bottom: 0; left: 0; width: 0; height: 2px; background: #c8102e; transition: width 0.4s ease; }
        .dp-fleet-card:hover::after { width: 100%; }
        .dp-fleet-name { font-family: var(--display); font-size: 24px; letter-spacing: 2px; color: #111; margin-bottom: 6px; }
        .dp-fleet-role { font-family: var(--mono); font-size: 9px; letter-spacing: 3px; color: #c8102e; text-transform: uppercase; margin-bottom: 20px; }
        .dp-fleet-desc { font-size: 13px; color: #777; line-height: 1.7; font-weight: 300; }

        /* ── CTA ── */
        .dp-cta { padding: 96px 64px; background: #0f1623; display: flex; align-items: center; justify-content: center; text-align: center; }
        .dp-cta-inner { max-width: 580px; }
        .dp-cta-eyebrow { font-family: var(--mono); font-size: 9px; letter-spacing: 4px; color: rgba(255,255,255,0.25); text-transform: uppercase; margin-bottom: 24px; }
        .dp-cta-title { font-family: var(--display); font-size: clamp(32px, 4vw, 56px); letter-spacing: 2px; color: #fff; margin-bottom: 20px; line-height: 1; }
        .dp-cta-sub { font-size: 14px; color: rgba(255,255,255,0.35); line-height: 1.9; margin-bottom: 44px; }
        .dp-cta-actions { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }
        .dp-cta-ghost { font-family: var(--mono); font-size: 10px; letter-spacing: 2px; text-transform: uppercase; background: transparent; color: rgba(255,255,255,0.4); border: 1px solid rgba(255,255,255,0.15); padding: 10px 24px; cursor: pointer; transition: all 0.2s; }
        .dp-cta-ghost:hover { border-color: rgba(255,255,255,0.5); color: #fff; }

        /* ── MODAL ── */
        .modal-overlay {
          position: fixed; inset: 0; z-index: 200;
          background: rgba(0,0,0,0.55);
          backdrop-filter: blur(4px);
          display: flex; align-items: center; justify-content: center;
          padding: 24px;
        }
        .modal-box {
          background: #fff;
          width: 100%; max-width: 600px;
          max-height: 90vh; overflow-y: auto;
          border: 1px solid #e8e8e8;
          box-shadow: 0 32px 80px rgba(0,0,0,0.2);
        }
        .modal-header {
          display: flex; align-items: flex-start; justify-content: space-between;
          padding: 36px 40px 28px;
          border-bottom: 1px solid #f0f0f0;
        }
        .modal-eyebrow {
          font-family: var(--mono); font-size: 8px; letter-spacing: 4px;
          color: #c8102e; text-transform: uppercase; margin-bottom: 8px;
        }
        .modal-title {
          font-family: var(--display); font-size: 28px;
          letter-spacing: 2px; color: #111; line-height: 1;
        }
        .modal-close {
          background: none; border: 1px solid #e8e8e8; padding: 8px;
          cursor: pointer; color: #999; transition: all 0.2s; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
        }
        .modal-close:hover { border-color: #111; color: #111; }
        .modal-form { padding: 32px 40px 40px; display: flex; flex-direction: column; gap: 20px; }
        .modal-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .modal-field { display: flex; flex-direction: column; gap: 8px; }
        .modal-label { font-family: var(--mono); font-size: 9px; letter-spacing: 2px; color: #888; text-transform: uppercase; }
        .modal-input {
          font-family: var(--mono); font-size: 12px; letter-spacing: 0.5px;
          color: #111; background: #fafafa;
          border: 1px solid #e8e8e8; padding: 12px 14px;
          outline: none; transition: border-color 0.2s;
          width: 100%; box-sizing: border-box;
        }
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
          .dp-hero-badge, .dp-drone-float { display: none; }
          .dp-intro { flex-direction: column; gap: 32px; padding: 56px 24px; }
          .dp-intro-right { max-width: 100%; }
          .dp-specs { grid-template-columns: repeat(2, 1fr); padding: 48px 24px; }
          .dp-service-panel { grid-template-columns: 1fr; }
          .dp-service-left, .dp-service-right { padding: 40px 24px; }
          .dp-services-header { flex-direction: column; align-items: flex-start; gap: 24px; padding: 48px 24px 0; }
          .dp-tabs { flex-wrap: wrap; }
          .dp-fleet-grid { grid-template-columns: 1fr; }
          .dp-fleet-card { border-right: none; border-bottom: 1px solid #ebebeb; }
          .dp-fleet, .dp-cta { padding: 72px 24px; }
          .modal-row { grid-template-columns: 1fr; }
          .modal-header, .modal-form { padding-left: 24px; padding-right: 24px; }
        }
      `}</style>

      <div className="drone-page">

        {/* ── HERO ── */}
        <section className="dp-hero">
          <div className="dp-hero-grid"/>
          <div className="dp-hero-glow"/>
          <div className="dp-drone-float">🚁</div>
          <div className="dp-hero-badge">
            <div><div className="dp-badge-num">15<span>km</span></div><div className="dp-badge-label">Max Range</div></div>
            <div><div className="dp-badge-num">55<span>min</span></div><div className="dp-badge-label">Flight Time</div></div>
            <div><div className="dp-badge-num">24<span>/7</span></div><div className="dp-badge-label">Support</div></div>
          </div>
          <p className="dp-hero-tag">Aerial Security Division</p>
          <h1 className="dp-hero-title">DRONE<br/><span className="outline">SOLUTIONS</span></h1>
          <p className="dp-hero-sub">Enterprise-grade unmanned aerial systems for surveillance, security, and beyond. Supply, repair, parts, and full maintenance — all under one roof.</p>
          <div className="dp-hero-actions">
            <button className="btn-primary" onClick={() => openModal()}>Request a Quote</button>
            <button className="dp-ghost-btn">View Fleet</button>
          </div>
        </section>

        {/* ── INTRO ── */}
        <section className="dp-intro">
          <div className="dp-intro-left">
            <p className="dp-intro-eyebrow">What We Do</p>
            <BlurText
              text="Complete Drone Services for the Modern Enterprise"
              delay={80}
              animateBy="words"
              direction="bottom"
              className="dp-intro-title"
              stepDuration={0.4}
            />
          </div>
          <div className="dp-intro-right">
            <ShinyText
              text="From procurement to post-flight maintenance, SAMAM is Qatar's trusted partner for enterprise drone operations. Our certified technicians and genuine parts inventory ensure your fleet stays airborne."
              speed={6}
              color="#555"
              shineColor="#111"
              spread={80}
            />
          </div>
        </section>

        {/* ── SPECS ── */}
        <div className="dp-specs">
          {SPECS.map((s, i) => <SpecCounter key={i} {...s} />)}
        </div>

        {/* ── SERVICES ── */}
        <section className="dp-services">
          <div className="dp-services-header">
            <div>
              <p className="dp-services-eyebrow">Our Drone Services</p>
              <h2 className="dp-services-title">Everything Your Fleet Needs</h2>
            </div>
            <div className="dp-tabs">
              {SERVICES.map((s, i) => (
                <button key={i} className={`dp-tab${activeService === i ? " active" : ""}`} onClick={() => setActiveService(i)}>
                  {s.title}
                </button>
              ))}
            </div>
          </div>
          <motion.div
            key={activeService}
            className="dp-service-panel"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <div className="dp-service-left">
              <div className="dp-service-num">{SERVICES[activeService].num}</div>
              <span className="dp-service-tag">{SERVICES[activeService].tag}</span>
              <h3 className="dp-service-name">{SERVICES[activeService].title}</h3>
              <p className="dp-service-desc">{SERVICES[activeService].desc}</p>
              <button className="btn-primary" onClick={() => openModal(SERVICES[activeService].title)}>
                Get a Quote
              </button>
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
        <section className="dp-fleet">
          <div className="dp-fleet-header">
            <p className="dp-fleet-eyebrow">Our Fleet</p>
            <h2 className="dp-fleet-title">Platforms We Work With</h2>
          </div>
          <div className="dp-fleet-grid">
            {FLEET.map((drone, i) => (
              <motion.div
                key={i}
                className="dp-fleet-card"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
              >
                <div className="dp-fleet-name">{drone.name}</div>
                <div className="dp-fleet-role">{drone.role}</div>
                <p className="dp-fleet-desc">{drone.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="dp-cta">
          <div className="dp-cta-inner">
            <p className="dp-cta-eyebrow">Ready to Elevate Your Security?</p>
            <h2 className="dp-cta-title">
              <ShinyText text="Let's Get Your Fleet Flying" speed={4} color="rgba(255,255,255,0.6)" shineColor="#ffffff" spread={90}/>
            </h2>
            <p className="dp-cta-sub">Talk to our drone specialists and get a tailored proposal for your surveillance and operations needs.</p>
            <div className="dp-cta-actions">
              <button className="btn-primary" onClick={() => openModal()}>Book a Consultation</button>
              <button className="dp-cta-ghost">Download Brochure</button>
            </div>
          </div>
        </section>

      </div>

      {/* ── QUOTE MODAL ── */}
      <QuoteModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        preselectedService={preselectedService}
      />
    </>
  );
}