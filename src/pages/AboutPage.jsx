import { useState, useRef, useEffect, useMemo } from "react";
import { motion, useMotionValue, useAnimationFrame, useTransform } from "motion/react";

// ── SHINY TEXT (reused from site) ────────────────────────────
function ShinyText({ text, speed = 2, color = '#b5b5b5', shineColor = '#ffffff', spread = 120 }) {
  const progress = useMotionValue(0);
  const elapsedRef = useRef(0);
  const lastTimeRef = useRef(null);
  const animationDuration = speed * 1000;
  useAnimationFrame(time => {
    if (lastTimeRef.current === null) { lastTimeRef.current = time; return; }
    elapsedRef.current += time - lastTimeRef.current;
    lastTimeRef.current = time;
    const p = (elapsedRef.current % animationDuration) / animationDuration * 100;
    progress.set(p);
  });
  const backgroundPosition = useTransform(progress, p => `${150 - p * 2}% center`);
  return (
    <motion.span style={{
      backgroundImage: `linear-gradient(${spread}deg, ${color} 0%, ${color} 35%, ${shineColor} 50%, ${color} 65%, ${color} 100%)`,
      backgroundSize: '200% auto', WebkitBackgroundClip: 'text', backgroundClip: 'text',
      WebkitTextFillColor: 'transparent', display: 'inline-block', backgroundPosition
    }}>{text}</motion.span>
  );
}

// ── BLUR TEXT (reused from site) ─────────────────────────────
const buildKeyframes = (from, steps) => {
  const keys = new Set([...Object.keys(from), ...steps.flatMap(s => Object.keys(s))]);
  const keyframes = {};
  keys.forEach(k => { keyframes[k] = [from[k], ...steps.map(s => s[k])]; });
  return keyframes;
};

function BlurText({ text = '', delay = 200, className = '', direction = 'bottom', stepDuration = 0.35 }) {
  const elements = text.split(' ');
  const [inView, setInView] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); observer.unobserve(ref.current); } },
      { threshold: 0.1 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  const defaultFrom = useMemo(() => ({ filter: 'blur(10px)', opacity: 0, y: direction === 'top' ? -50 : 50 }), [direction]);
  const defaultTo = useMemo(() => [
    { filter: 'blur(5px)', opacity: 0.5, y: direction === 'top' ? 5 : -5 },
    { filter: 'blur(0px)', opacity: 1, y: 0 }
  ], [direction]);
  const stepCount = 3;
  const totalDuration = stepDuration * 2;
  const times = [0, 0.5, 1];
  return (
    <p ref={ref} className={className} style={{ display: 'flex', flexWrap: 'wrap', margin: 0 }}>
      {elements.map((segment, index) => {
        const animateKeyframes = buildKeyframes(defaultFrom, defaultTo);
        return (
          <motion.span key={index} style={{ display: 'inline-block', willChange: 'transform, filter, opacity' }}
            initial={defaultFrom} animate={inView ? animateKeyframes : defaultFrom}
            transition={{ duration: totalDuration, times, delay: (index * delay) / 1000 }}
          >
            {segment}{index < elements.length - 1 && '\u00A0'}
          </motion.span>
        );
      })}
    </p>
  );
}

// ── DATA ─────────────────────────────────────────────────────
const PARTNERS = [
  {
    name: "Partner Name",
    title: "Co-Founder & CEO",
    bio: "Qatari national with extensive background in security operations and enterprise technology. Leads SAMAM's strategic vision and client relationships across Qatar.",
    avatar: null,
  },
  {
    name: "Partner Name",
    title: "Co-Founder & COO",
    bio: "Expert in physical security systems and manpower operations. Oversees day-to-day operations, ensuring service excellence across all SAMAM divisions.",
    avatar: null,
  },
  {
    name: "Partner Name",
    title: "Co-Founder & CTO",
    bio: "Specialist in digital security infrastructure, drone technology, and smart systems integration. Drives SAMAM's technology roadmap and DJI partnership.",
    avatar: null,
  },
];

const MILESTONES = [
  { year: "2014", label: "Founded", desc: "Established in Doha by Qatari nationals to meet the growing demand for integrated security services." },
  { year: "2017", label: "DJI Partnership", desc: "Became an authorized distributor for DJI Enterprise Drones in Qatar — the first of its kind in the region." },
  { year: "2020", label: "Expansion", desc: "Extended operations to include full drone services, training, inspection, and surveying across the State of Qatar." },
  { year: "2024", label: "Today", desc: "Serving Qatar's most prestigious projects with a full-spectrum security, drone, and smart systems portfolio." },
];

const VALUES = [
  { num: "01", title: "Excellence", desc: "We source only world-class products and back them with professional expertise — from design to commissioning and beyond." },
  { num: "02", title: "Innovation", desc: "As an authorized DJI Enterprise distributor, we stay at the forefront of drone technology and cutting-edge security solutions." },
  { num: "03", title: "Integrity", desc: "Owned and operated by Qatari nationals, we are committed to building long-term trust with every client we serve." },
  { num: "04", title: "Service", desc: "From 24/7 alarm monitoring to AMC contracts, our clients' safety and uptime is always our highest priority." },
];

const STATS = [
  { value: "10+", label: "Years in Qatar" },
  { value: "100+", label: "Projects Delivered" },
  { value: "24/7", label: "Support Coverage" },
  { value: "3", label: "Partner Founders" },
];

// ── COUNT-UP STAT ─────────────────────────────────────────────
function StatItem({ value, label }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.4 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <motion.div ref={ref} className="ap-stat"
      initial={{ opacity: 0, y: 20 }} animate={visible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}>
      <div className="ap-stat-value">{value}</div>
      <div className="ap-stat-label">{label}</div>
    </motion.div>
  );
}

// ── PARTNER CARD ──────────────────────────────────────────────
function PartnerCard({ partner, index }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <motion.div ref={ref} className="ap-partner-card"
      initial={{ opacity: 0, y: 40 }}
      animate={visible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay: index * 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}>
      <div className="ap-partner-img-wrap">
        {partner.avatar ? (
          <img src={partner.avatar} alt={partner.name} className="ap-partner-img" />
        ) : (
          <div className="ap-partner-avatar">
            <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="40" cy="30" r="16" stroke="rgba(200,16,46,0.4)" strokeWidth="1.5"/>
              <path d="M12 68c0-15.464 12.536-28 28-28s28 12.536 28 28" stroke="rgba(200,16,46,0.4)" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
        )}
        <div className="ap-partner-img-overlay"/>
        <div className="ap-partner-num">0{index + 1}</div>
      </div>
      <div className="ap-partner-info">
        <div className="ap-partner-title">{partner.title}</div>
        <div className="ap-partner-name">{partner.name}</div>
        <div className="ap-partner-divider"/>
        <p className="ap-partner-bio">{partner.bio}</p>
      </div>
    </motion.div>
  );
}

// ── PAGE ─────────────────────────────────────────────────────
export default function AboutPage() {
  const [activeValue, setActiveValue] = useState(0);

  return (
    <>
      <style>{`
        .about-page { background: #fff; }

        /* ── HERO ── */
        .ap-hero {
          min-height: 80vh; background: #0a0f1a; position: relative;
          display: flex; flex-direction: column; justify-content: flex-end;
          padding: 0 64px 96px; overflow: hidden;
        }
        .ap-hero-grid {
          position: absolute; inset: 0;
          background:
            linear-gradient(rgba(200,16,46,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(200,16,46,0.025) 1px, transparent 1px);
          background-size: 64px 64px;
          animation: apGrid 24s linear infinite;
        }
        @keyframes apGrid { to { background-position: 64px 64px; } }
        .ap-hero-vignette {
          position: absolute; inset: 0;
          background: radial-gradient(ellipse at 20% 80%, rgba(200,16,46,0.06) 0%, transparent 60%),
                      linear-gradient(to top, rgba(10,15,26,0.98) 0%, transparent 60%);
        }
        .ap-hero-year {
          position: absolute; top: 64px; right: 64px;
          font-family: var(--display); font-size: 200px; letter-spacing: -8px;
          color: rgba(255,255,255,0.02); line-height: 1; pointer-events: none;
          user-select: none;
        }
        .ap-hero-content { position: relative; z-index: 2; }
        .ap-hero-eyebrow {
          font-family: var(--mono); font-size: 9px; letter-spacing: 5px;
          color: #c8102e; text-transform: uppercase; margin-bottom: 24px;
          display: flex; align-items: center; gap: 14px;
        }
        .ap-hero-eyebrow::before { content: ''; width: 28px; height: 1px; background: #c8102e; display: block; }
        .ap-hero-title {
          font-family: var(--display); font-size: clamp(48px, 8vw, 110px);
          line-height: 0.88; letter-spacing: 1px; color: #f0f0f0; margin-bottom: 40px;
        }
        .ap-hero-title .outline { color: transparent; -webkit-text-stroke: 1px rgba(240,240,240,0.2); }
        .ap-hero-desc {
          font-size: 15px; font-weight: 300; color: rgba(255,255,255,0.4);
          max-width: 560px; line-height: 1.9;
        }
        .ap-hero-scroll {
          position: absolute; bottom: 40px; right: 64px; z-index: 2;
          display: flex; align-items: center; gap: 12px;
          font-family: var(--mono); font-size: 8px; letter-spacing: 3px;
          color: rgba(255,255,255,0.2); text-transform: uppercase;
        }
        .ap-hero-scroll-line {
          width: 1px; height: 40px; background: linear-gradient(to bottom, transparent, rgba(200,16,46,0.5));
          animation: scrollPulse 2s ease-in-out infinite;
        }
        @keyframes scrollPulse { 0%,100% { opacity: 0.4; } 50% { opacity: 1; } }

        /* ── MISSION STRIP ── */
        .ap-mission {
          background: #fff; border-bottom: 1px solid #ebebeb;
          display: grid; grid-template-columns: 1fr 1px 1fr 1px 1fr; gap: 0;
        }
        .ap-mission-item {
          padding: 64px 56px; position: relative;
        }
        .ap-mission-divider { background: linear-gradient(to bottom, transparent, #ddd 30%, #ddd 70%, transparent); }
        .ap-mission-tag {
          font-family: var(--mono); font-size: 8px; letter-spacing: 4px;
          color: #c8102e; text-transform: uppercase; margin-bottom: 20px;
          display: flex; align-items: center; gap: 10px;
        }
        .ap-mission-tag::before { content: ''; width: 16px; height: 1px; background: #c8102e; display: block; }
        .ap-mission-heading {
          font-family: var(--display); font-size: clamp(20px, 2vw, 28px);
          letter-spacing: 2px; color: #111; margin-bottom: 16px; line-height: 1.1;
        }
        .ap-mission-text { font-size: 13px; color: #777; line-height: 1.85; font-weight: 300; }

        /* ── ABOUT INTRO ── */
        .ap-intro {
          padding: 104px 64px; background: #fff;
          display: grid; grid-template-columns: 1fr 1fr; gap: 96px; align-items: center;
        }
        .ap-intro-left {}
        .ap-intro-eyebrow {
          font-family: var(--mono); font-size: 9px; letter-spacing: 4px;
          color: #c8102e; text-transform: uppercase; margin-bottom: 24px;
          display: flex; align-items: center; gap: 12px;
        }
        .ap-intro-eyebrow::before { content: ''; width: 20px; height: 1px; background: #c8102e; display: block; }
        .ap-intro-title {
          font-family: var(--display); font-size: clamp(28px, 3.5vw, 52px);
          letter-spacing: 2px; color: #111; line-height: 1.0; margin-bottom: 0;
        }
        .ap-intro-right {}
        .ap-intro-text { font-size: 14px; color: #666; line-height: 1.95; font-weight: 300; margin-bottom: 24px; }
        .ap-intro-highlight {
          padding: 24px 28px; border-left: 2px solid #c8102e;
          background: #fafafa; margin-top: 32px;
        }
        .ap-intro-highlight p { font-family: var(--mono); font-size: 11px; letter-spacing: 1px; color: #444; line-height: 1.7; margin: 0; }

        /* ── STATS ── */
        .ap-stats {
          background: #0f1623; padding: 72px 64px;
          display: grid; grid-template-columns: repeat(4, 1fr); gap: 0;
          border-top: 1px solid rgba(255,255,255,0.04);
        }
        .ap-stat {
          padding: 32px 40px; border-right: 1px solid rgba(255,255,255,0.05);
          text-align: center;
        }
        .ap-stat:last-child { border-right: none; }
        .ap-stat-value {
          font-family: var(--display); font-size: clamp(40px, 5vw, 64px);
          color: #f0f0f0; letter-spacing: 2px; line-height: 1; margin-bottom: 10px;
        }
        .ap-stat-label {
          font-family: var(--mono); font-size: 9px; letter-spacing: 3px;
          color: rgba(255,255,255,0.25); text-transform: uppercase;
        }

        /* ── TIMELINE ── */
        .ap-timeline { padding: 104px 64px; background: #f7f8f9; border-top: 1px solid #ebebeb; }
        .ap-timeline-header { margin-bottom: 72px; display: flex; align-items: flex-end; justify-content: space-between; }
        .ap-timeline-eyebrow {
          font-family: var(--mono); font-size: 9px; letter-spacing: 4px;
          color: #c8102e; text-transform: uppercase; margin-bottom: 16px;
          display: flex; align-items: center; gap: 10px;
        }
        .ap-timeline-eyebrow::before { content: ''; width: 20px; height: 1px; background: #c8102e; display: block; }
        .ap-timeline-title {
          font-family: var(--display); font-size: clamp(28px, 3vw, 44px);
          letter-spacing: 1px; color: #111;
        }
        .ap-timeline-established {
          font-family: var(--mono); font-size: 10px; letter-spacing: 2px;
          color: #bbb; text-transform: uppercase;
        }
        .ap-timeline-track {
          display: grid; grid-template-columns: repeat(4, 1fr);
          border-top: 1px solid #e0e0e0; position: relative;
        }
        .ap-timeline-track::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(to right, #c8102e, rgba(200,16,46,0.1));
        }
        .ap-timeline-item {
          padding: 40px 32px 40px 0; border-right: 1px solid #e8e8e8;
          padding-right: 40px; position: relative; cursor: default;
        }
        .ap-timeline-item:last-child { border-right: none; }
        .ap-timeline-dot {
          width: 8px; height: 8px; border-radius: 50%; background: #c8102e;
          position: absolute; top: -4px; left: 0;
        }
        .ap-timeline-year {
          font-family: var(--display); font-size: 40px; letter-spacing: 2px;
          color: #ebebeb; line-height: 1; margin-bottom: 8px; padding-left: 0;
        }
        .ap-timeline-label {
          font-family: var(--mono); font-size: 8px; letter-spacing: 3px;
          color: #c8102e; text-transform: uppercase; margin-bottom: 14px;
          padding-left: 0;
        }
        .ap-timeline-desc {
          font-size: 13px; color: #777; line-height: 1.75; font-weight: 300;
        }

        /* ── PARTNERS ── */
        .ap-partners { padding: 104px 64px; background: #0a0f1a; }
        .ap-partners-header { margin-bottom: 72px; display: flex; align-items: flex-end; justify-content: space-between; }
        .ap-partners-eyebrow {
          font-family: var(--mono); font-size: 9px; letter-spacing: 4px;
          color: #c8102e; text-transform: uppercase; margin-bottom: 16px;
          display: flex; align-items: center; gap: 10px;
        }
        .ap-partners-eyebrow::before { content: ''; width: 20px; height: 1px; background: #c8102e; display: block; }
        .ap-partners-title {
          font-family: var(--display); font-size: clamp(28px, 3vw, 44px);
          letter-spacing: 1px; color: #f0f0f0;
        }
        .ap-partners-sub {
          font-family: var(--mono); font-size: 10px; letter-spacing: 2px;
          color: rgba(255,255,255,0.2); text-transform: uppercase;
        }
        .ap-partners-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px; }

        /* partner card */
        .ap-partner-card {
          background: #0d1220; position: relative; overflow: hidden;
          transition: transform 0.3s ease;
        }
        .ap-partner-card:hover { transform: translateY(-4px); }
        .ap-partner-img-wrap {
          position: relative; height: 320px; overflow: hidden;
          background: #111827;
        }
        .ap-partner-img { width: 100%; height: 100%; object-fit: cover; object-position: top; filter: grayscale(20%); transition: transform 0.6s ease; }
        .ap-partner-card:hover .ap-partner-img { transform: scale(1.04); }
        .ap-partner-avatar {
          width: 100%; height: 100%;
          display: flex; align-items: center; justify-content: center;
          background: linear-gradient(135deg, #111827 0%, #0a0f1a 100%);
        }
        .ap-partner-avatar svg { width: 100px; height: 100px; opacity: 0.5; }
        .ap-partner-img-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to top, rgba(10,15,26,0.95) 0%, transparent 60%);
        }
        .ap-partner-num {
          position: absolute; top: 16px; right: 16px;
          font-family: var(--display); font-size: 56px; letter-spacing: 2px;
          color: rgba(255,255,255,0.04); line-height: 1; pointer-events: none;
        }
        .ap-partner-info { padding: 28px 28px 32px; }
        .ap-partner-title {
          font-family: var(--mono); font-size: 8px; letter-spacing: 3px;
          color: #c8102e; text-transform: uppercase; margin-bottom: 8px;
        }
        .ap-partner-name {
          font-family: var(--display); font-size: 22px; letter-spacing: 2px;
          color: #f0f0f0; line-height: 1.1;
        }
        .ap-partner-divider {
          width: 28px; height: 1px; background: rgba(200,16,46,0.4);
          margin: 16px 0;
        }
        .ap-partner-bio { font-size: 13px; color: rgba(255,255,255,0.35); line-height: 1.8; font-weight: 300; }

        /* ── VALUES ── */
        .ap-values { padding: 104px 64px; background: #fff; border-top: 1px solid #ebebeb; }
        .ap-values-header { margin-bottom: 72px; }
        .ap-values-eyebrow {
          font-family: var(--mono); font-size: 9px; letter-spacing: 4px;
          color: #c8102e; text-transform: uppercase; margin-bottom: 16px;
          display: flex; align-items: center; gap: 10px;
        }
        .ap-values-eyebrow::before { content: ''; width: 20px; height: 1px; background: #c8102e; display: block; }
        .ap-values-title {
          font-family: var(--display); font-size: clamp(28px, 3vw, 44px);
          letter-spacing: 1px; color: #111;
        }
        .ap-values-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 2px; }
        .ap-value-item {
          padding: 48px 44px; border: 1px solid #ebebeb;
          cursor: pointer; transition: background 0.25s, box-shadow 0.25s;
          position: relative; overflow: hidden;
        }
        .ap-value-item:hover { background: #fafafa; }
        .ap-value-item.active { background: #0a0f1a; }
        .ap-value-item::after {
          content: ''; position: absolute; bottom: 0; left: 0;
          width: 0; height: 2px; background: #c8102e;
          transition: width 0.4s ease;
        }
        .ap-value-item:hover::after, .ap-value-item.active::after { width: 100%; }
        .ap-value-num {
          font-family: var(--display); font-size: 56px; letter-spacing: 2px;
          color: #f5f5f5; line-height: 1; margin-bottom: -4px;
          transition: color 0.3s;
        }
        .ap-value-item.active .ap-value-num { color: rgba(255,255,255,0.06); }
        .ap-value-title {
          font-family: var(--display); font-size: clamp(22px, 2vw, 30px);
          letter-spacing: 2px; color: #111; margin-bottom: 16px; line-height: 1;
          transition: color 0.3s;
        }
        .ap-value-item.active .ap-value-title { color: #f0f0f0; }
        .ap-value-desc { font-size: 13px; color: #777; line-height: 1.8; font-weight: 300; transition: color 0.3s; }
        .ap-value-item.active .ap-value-desc { color: rgba(255,255,255,0.4); }

        /* ── CLIENTS STRIP ── */
        .ap-clients { padding: 80px 64px; background: #f7f8f9; border-top: 1px solid #ebebeb; }
        .ap-clients-eyebrow {
          font-family: var(--mono); font-size: 9px; letter-spacing: 4px;
          color: #c8102e; text-transform: uppercase; margin-bottom: 48px;
          display: flex; align-items: center; gap: 10px;
        }
        .ap-clients-eyebrow::before { content: ''; width: 20px; height: 1px; background: #c8102e; display: block; }
        .ap-clients-logos {
          display: flex; gap: 0; border: 1px solid #e8e8e8; overflow: hidden;
        }
        .ap-client {
          flex: 1; padding: 32px 24px; border-right: 1px solid #e8e8e8;
          display: flex; align-items: center; justify-content: center;
          font-family: var(--display); font-size: 14px; letter-spacing: 2px;
          color: #bbb; text-transform: uppercase; text-align: center;
          transition: color 0.2s, background 0.2s;
        }
        .ap-client:last-child { border-right: none; }
        .ap-client:hover { color: #111; background: #fff; }

        /* ── CTA ── */
        .ap-cta {
          padding: 104px 64px; background: #fff; border-top: 1px solid #ebebeb;
          display: flex; align-items: center; justify-content: center; text-align: center;
        }
        .ap-cta-inner {
          max-width: 640px;
          padding: 72px 64px;
          box-shadow: 0 8px 48px rgba(0,0,0,0.07), 0 2px 12px rgba(200,16,46,0.05), 0 0 0 1px rgba(0,0,0,0.04);
        }
        .ap-cta-eyebrow {
          font-family: var(--mono); font-size: 9px; letter-spacing: 4px;
          color: #c8102e; text-transform: uppercase; margin-bottom: 24px;
        }
        .ap-cta-title {
          font-family: var(--display); font-size: clamp(28px, 4vw, 52px);
          letter-spacing: 2px; color: #111; margin-bottom: 20px; line-height: 1;
        }
        .ap-cta-sub { font-size: 14px; color: #888; line-height: 1.9; margin-bottom: 44px; }
        .ap-cta-actions { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }
        .ap-ghost-btn {
          font-family: var(--mono); font-size: 10px; letter-spacing: 2px;
          text-transform: uppercase; background: transparent;
          color: #999; border: 1px solid #ddd;
          padding: 10px 24px; cursor: pointer; transition: all 0.2s;
        }
        .ap-ghost-btn:hover { border-color: #111; color: #111; }

        /* ── RESPONSIVE ── */
        @media (max-width: 1024px) {
          .ap-intro { grid-template-columns: 1fr; gap: 48px; }
          .ap-values-layout { grid-template-columns: 1fr; }
        }
        @media (max-width: 900px) {
          .ap-hero { padding: 0 24px 72px; min-height: 60vh; }
          .ap-hero-year { font-size: 100px; top: 24px; right: 24px; }
          .ap-hero-scroll { display: none; }
          .ap-mission { grid-template-columns: 1fr; }
          .ap-mission-divider { display: none; }
          .ap-mission-item { padding: 48px 24px; border-bottom: 1px solid #ebebeb; }
          .ap-mission-item:last-child { border-bottom: none; }
          .ap-intro { padding: 64px 24px; }
          .ap-stats { grid-template-columns: repeat(2,1fr); padding: 48px 24px; }
          .ap-timeline { padding: 72px 24px; }
          .ap-timeline-track { grid-template-columns: 1fr; }
          .ap-timeline-header { flex-direction: column; align-items: flex-start; gap: 8px; }
          .ap-timeline-item { border-right: none; border-bottom: 1px solid #e8e8e8; padding: 32px 0; }
          .ap-partners { padding: 72px 24px; }
          .ap-partners-grid { grid-template-columns: 1fr; }
          .ap-partners-header { flex-direction: column; align-items: flex-start; gap: 16px; }
          .ap-values { padding: 72px 24px; }
          .ap-clients { padding: 56px 24px; }
          .ap-clients-logos { flex-wrap: wrap; }
          .ap-client { flex: none; width: 50%; border-bottom: 1px solid #e8e8e8; }
          .ap-cta { padding: 72px 24px; }
          .ap-cta-inner { padding: 48px 24px; }
        }
        @media (max-width: 540px) {
          .ap-timeline-track { grid-template-columns: 1fr; }
          .ap-hero-title { font-size: clamp(40px, 12vw, 80px); }
        }
      `}</style>

      <div className="about-page">

        {/* ── HERO ── */}
        <section className="ap-hero">
          <div className="ap-hero-grid"/>
          <div className="ap-hero-vignette"/>
          <div className="ap-hero-year">2014</div>

          <div className="ap-hero-content">
            <motion.p className="ap-hero-eyebrow"
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
              Established in Doha, Qatar
            </motion.p>
            <motion.h1 className="ap-hero-title"
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}>
              WHO<br/><span className="outline">WE ARE</span>
            </motion.h1>
            <motion.p className="ap-hero-desc"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.25 }}>
              <ShinyText
                text="Samam Special Security Services WLL — a Qatari-owned enterprise delivering world-class security, drone, and smart system solutions since 2014."
                speed={7} color="rgba(255,255,255,0.38)" shineColor="rgba(255,255,255,0.7)" spread={80}
              />
            </motion.p>
          </div>

          <div className="ap-hero-scroll">
            <div className="ap-hero-scroll-line"/>
            Scroll
          </div>
        </section>

        {/* ── MISSION / VISION / VALUES STRIP ── */}
        <section className="ap-mission">
          {[
            {
              tag: "Our Mission",
              heading: "Security Through Innovation",
              text: "To provide protection and security to our clients through a bespoke service tailored to their specific needs. The safety of clients' staff, premises, assets, and the general public is our highest priority."
            },
            null,
            {
              tag: "Our Vision",
              heading: "Leading Edge Technology",
              text: "To become a leading name in cutting-edge security and drone technologies by providing world-class products from globally recognized sources, backed by hassle-free, expert support."
            },
            null,
            {
              tag: "Our Commitment",
              heading: "Qatari — Built to Last",
              text: "Owned and operated by Qatari nationals since 2014, SAMAM is built on experience, commitment, innovation, and follow-through. We invest in our people to exceed every client expectation."
            }
          ].map((item, i) =>
            item === null
              ? <div key={i} className="ap-mission-divider"/>
              : (
                <motion.div key={i} className="ap-mission-item"
                  initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.55, delay: (i / 2) * 0.12 }}>
                  <div className="ap-mission-tag">{item.tag}</div>
                  <div className="ap-mission-heading">{item.heading}</div>
                  <p className="ap-mission-text">{item.text}</p>
                </motion.div>
              )
          )}
        </section>

        {/* ── ABOUT INTRO ── */}
        <section className="ap-intro">
          <div className="ap-intro-left">
            <p className="ap-intro-eyebrow">About SAMAM</p>
            <BlurText
              text="A Decade of Securing Qatar's Most Prestigious Projects"
              delay={70} direction="bottom"
              className="ap-intro-title" stepDuration={0.45}
            />
          </div>
          <div className="ap-intro-right">
            <p className="ap-intro-text">
              Samam Special Security Services WLL was established in 2014 and is owned and operated by Qatari nationals to accomplish the growing demand for security services and products in Qatar's fast-growing market.
            </p>
            <p className="ap-intro-text">
              We offer all types of digital security and communication solutions — IP cameras, wireless remote monitors, CCTV, access control, intrusion alarms, IPTV, digital signage, and smart homes and offices. We source quality products from industry-leading manufacturers to deliver high-quality systems and solutions.
            </p>
            <p className="ap-intro-text">
              As an <strong style={{color:'#111', fontWeight:500}}>authorized distributor for DJI Enterprise Drones in Qatar</strong>, SAMAM provides comprehensive drone services across the State of Qatar — covering the entire spectrum from hardware and software to training, servicing, inspection, and surveying.
            </p>
            <div className="ap-intro-highlight">
              <p>"We understand that digital security services using information technology and networking are critical to today's world security infrastructure — and it is our resolve to ensure the solutions we provide incorporate the highest standards and technologies available."</p>
            </div>
          </div>
        </section>

        {/* ── STATS ── */}
        <div className="ap-stats">
          {STATS.map((s, i) => <StatItem key={i} {...s}/>)}
        </div>

        {/* ── TIMELINE ── */}
        <section className="ap-timeline">
          <div className="ap-timeline-header">
            <div>
              <p className="ap-timeline-eyebrow">Our Journey</p>
              <h2 className="ap-timeline-title">A Decade of Growth</h2>
            </div>
            <div className="ap-timeline-established">Est. 2014 · Doha, Qatar</div>
          </div>
          <div className="ap-timeline-track">
            {MILESTONES.map((m, i) => (
              <motion.div key={i} className="ap-timeline-item"
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.55, delay: i * 0.12 }}>
                <div className="ap-timeline-dot"/>
                <div className="ap-timeline-year">{m.year}</div>
                <div className="ap-timeline-label">{m.label}</div>
                <p className="ap-timeline-desc">{m.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── PARTNERS ── */}
        <section className="ap-partners">
          <div className="ap-partners-header">
            <div>
              <p className="ap-partners-eyebrow">Leadership</p>
              <h2 className="ap-partners-title">The Founding Partners</h2>
            </div>
            <div className="ap-partners-sub">Qatari Owned & Operated</div>
          </div>
          <div className="ap-partners-grid">
            {PARTNERS.map((p, i) => <PartnerCard key={i} partner={p} index={i}/>)}
          </div>
        </section>

        {/* ── VALUES ── */}
        <section className="ap-values">
          <div className="ap-values-header">
            <p className="ap-values-eyebrow">Core Values</p>
            <h2 className="ap-values-title">What Drives Us</h2>
          </div>
          <div className="ap-values-layout">
            {VALUES.map((v, i) => (
              <motion.div key={i}
                className={`ap-value-item${activeValue === i ? " active" : ""}`}
                onClick={() => setActiveValue(i)}
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.5, delay: i * 0.1 }}>
                <div className="ap-value-num">{v.num}</div>
                <div className="ap-value-title">{v.title}</div>
                <p className="ap-value-desc">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── CLIENTS ── */}
        <section className="ap-clients">
          <div className="ap-clients-eyebrow">Trusted By</div>
          <div className="ap-clients-logos">
            {["Qatar Rail", "Thales", "Ministry of Interior", "Ashghal", "Lusail City", "QP Energy"].map((c, i) => (
              <div key={i} className="ap-client">{c}</div>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="ap-cta">
          <div className="ap-cta-inner">
            <p className="ap-cta-eyebrow">Work With Us</p>
            <h2 className="ap-cta-title">
              <ShinyText text="Let's Secure Your Future" speed={4} color="#333" shineColor="#c8102e" spread={90}/>
            </h2>
            <p className="ap-cta-sub">
              Whether you need enterprise drones, integrated security systems, or a trusted manpower partner in Qatar — SAMAM is ready to deliver.
            </p>
            <div className="ap-cta-actions">
              <button className="btn-primary">Get in Touch</button>
              <button className="ap-ghost-btn">View Services</button>
            </div>
          </div>
        </section>

      </div>
    </>
  );
}