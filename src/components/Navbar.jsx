import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "../assets/samam.png";

const NAV_LINKS = [
  { label: "Services", path: "/services", hasDropdown: true },
  { label: "About", path: "/about" },
  { label: "Projects", path: "/projects" },
  { label: "Contact", path: "/contact" },
];

const SERVICES_DROPDOWN = [
  {
    tag: "Surveillance",
    title: "CCTV Systems",
    desc: "AI-powered camera networks with real-time monitoring.",
    path: "/services/cctv",
    icon: "📡",
  },
  {
    tag: "On-Site Security",
    title: "Security Guards",
    desc: "Rigorously trained professionals for on-site protection.",
    path: "/services/guards",
    icon: "🛡️",
  },
  {
    tag: "Aerial Patrol",
    title: "Drone Surveillance",
    desc: "Autonomous aerial patrols with thermal imaging.",
    path: "/services/drones",
    icon: "🚁",
  },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [time, setTime] = useState(new Date());
  const dropdownRef = useRef(null);
  const dropdownTimeout = useRef(null);
  const location = useLocation();

  // Scroll handler — scrolled state + progress bar
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 60);
      const el = document.documentElement;
      const progress = (window.scrollY / (el.scrollHeight - el.clientHeight)) * 100;
      setScrollProgress(Math.min(progress, 100));
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Clock
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setDropdownOpen(false);
    setMenuOpen(false);
  }, [location]);

  // Click outside to close dropdown
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const timeStr = time.toLocaleTimeString("en-US", { hour12: false });

  const handleDropdownEnter = () => {
    clearTimeout(dropdownTimeout.current);
    setDropdownOpen(true);
  };
  const handleDropdownLeave = () => {
    dropdownTimeout.current = setTimeout(() => setDropdownOpen(false), 120);
  };

  const isActive = (path) => {
    if (path === "/services") return location.pathname.startsWith("/services");
    return location.pathname === path;
  };

  return (
    <>
      <style>{`
        /* ── BASE ── */
        .navbar {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 100;
          height: 68px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 48px;
          background: rgba(255,255,255,0.97);
          border-bottom: 1px solid rgba(0,0,0,0.07);
          transition: height 0.4s ease, box-shadow 0.4s ease, background 0.4s ease;
        }
        .navbar.scrolled {
          height: 60px;
          background: rgba(255,255,255,0.96);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(0,0,0,0.09);
          box-shadow: 0 1px 24px rgba(0,0,0,0.06);
        }

        /* ── SCROLL PROGRESS BAR ── */
        .nav-progress {
          position: absolute;
          bottom: 0; left: 0;
          height: 2px;
          background: #c8102e;
          transition: width 0.1s linear;
          z-index: 10;
        }

        /* ── LOGO ── */
        .nav-logo {
          display: flex; align-items: center;
          text-decoration: none; flex-shrink: 0;
        }
        .nav-logo-img {
          height: 52px; width: auto; object-fit: contain;
          transition: height 0.4s ease, opacity 0.3s;
        }
        .navbar.scrolled .nav-logo-img { height: 42px; }
        .nav-logo-img:hover { opacity: 0.8; }

        /* ── CENTER LINKS ── */
        .nav-center {
          position: absolute; left: 50%; transform: translateX(-50%);
          display: flex; align-items: center; gap: 48px;
        }
        .nav-link {
          font-family: var(--mono); font-size: 10px; letter-spacing: 2.5px;
          color: #555; text-decoration: none; text-transform: uppercase;
          position: relative; transition: color 0.2s; padding: 4px 0;
          white-space: nowrap; background: none; border: none; cursor: pointer;
          display: flex; align-items: center; gap: 5px;
        }
        .nav-link::after {
          content: ''; position: absolute; bottom: -2px; left: 0;
          width: 0; height: 1px; background: #c8102e; transition: width 0.3s ease;
        }
        .nav-link:hover { color: #111; }
        .nav-link:hover::after,
        .nav-link.active::after { width: 100%; }
        .nav-link.active { color: #111; }

        /* active dot indicator */
        .nav-link.active::before {
          content: '';
          position: absolute; top: -18px; left: 50%; transform: translateX(-50%);
          width: 3px; height: 3px; border-radius: 50%; background: #c8102e;
        }

        .nav-link-caret {
          font-size: 7px; opacity: 0.5;
          transition: transform 0.25s ease, opacity 0.25s;
          display: inline-block;
        }
        .nav-link.dropdown-open .nav-link-caret {
          transform: rotate(180deg); opacity: 1;
        }

        /* ── DROPDOWN ── */
        .nav-dropdown-wrap { position: relative; }
        .nav-dropdown {
          position: absolute; top: calc(100% + 16px); left: 50%;
          transform: translateX(-50%) translateY(-6px);
          background: #fff;
          border: 1px solid rgba(0,0,0,0.08);
          box-shadow: 0 8px 24px rgba(0,0,0,0.08);
          min-width: 180px;
          padding: 4px 0;
          opacity: 0; visibility: hidden; pointer-events: none;
          transition: opacity 0.2s ease, transform 0.2s ease, visibility 0.2s;
        }
        .nav-dropdown.open {
          opacity: 1; visibility: visible; pointer-events: auto;
          transform: translateX(-50%) translateY(0);
        }
        .nav-dropdown::before {
          content: '';
          position: absolute; top: -5px; left: 50%;
          width: 8px; height: 8px; background: #fff;
          border-left: 1px solid rgba(0,0,0,0.08);
          border-top: 1px solid rgba(0,0,0,0.08);
          transform: translateX(-50%) rotate(45deg);
        }
        .nav-dropdown-item {
          display: flex; align-items: center; gap: 10px;
          padding: 11px 20px;
          text-decoration: none;
          border-left: 2px solid transparent;
          transition: background 0.15s, border-color 0.15s;
        }
        .nav-dropdown-item:hover {
          background: #fafafa;
          border-left-color: #c8102e;
        }
        .nav-dropdown-title {
          font-family: var(--mono); font-size: 10px; letter-spacing: 2px;
          color: #555; text-transform: uppercase; transition: color 0.15s;
        }
        .nav-dropdown-item:hover .nav-dropdown-title { color: #111; }

        /* ── RIGHT SIDE ── */
        .nav-right {
          display: flex; align-items: center; gap: 20px; flex-shrink: 0;
        }
        .nav-divider { width: 1px; height: 16px; background: rgba(0,0,0,0.1); }
        .nav-time {
          font-family: var(--mono); font-size: 10px; letter-spacing: 1.5px;
          color: #aaa; user-select: none; min-width: 72px;
        }
        .nav-cta-btn {
          font-family: var(--mono); font-size: 9px; letter-spacing: 2.5px;
          text-transform: uppercase; color: #fff; background: #111;
          border: none; padding: 9px 20px; cursor: pointer;
          transition: background 0.25s, transform 0.15s; white-space: nowrap;
        }
        .nav-cta-btn:hover { background: #c8102e; transform: translateY(-1px); }
        .nav-cta-btn:active { transform: translateY(0); }

        /* ── STATUS DOT ── */
        .nav-status {
          display: flex; align-items: center; gap: 7px;
          font-family: var(--mono); font-size: 9px; letter-spacing: 1.5px;
          color: #aaa; text-transform: uppercase;
        }
        .nav-status-dot {
          width: 5px; height: 5px; border-radius: 50%;
          background: #22c55e; animation: navPulse 2.5s infinite; flex-shrink: 0;
        }
        @keyframes navPulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(34,197,94,0.4); }
          50% { opacity: 0.7; box-shadow: 0 0 0 4px rgba(34,197,94,0); }
        }

        /* ── HAMBURGER ── */
        .hamburger {
          display: none; flex-direction: column; gap: 5px;
          cursor: pointer; background: none; border: none;
          padding: 6px; margin-left: 8px;
        }
        .hamburger span {
          display: block; width: 22px; height: 1.5px; background: #333;
          transition: transform 0.3s ease, opacity 0.3s ease;
        }
        .hamburger.open span:nth-child(1) { transform: translateY(6.5px) rotate(45deg); }
        .hamburger.open span:nth-child(2) { opacity: 0; }
        .hamburger.open span:nth-child(3) { transform: translateY(-6.5px) rotate(-45deg); }

        /* ── MOBILE MENU ── */
        .mobile-menu {
          position: fixed; top: 68px; left: 0; right: 0;
          background: #fff; border-bottom: 1px solid rgba(0,0,0,0.08);
          padding: 0 32px; z-index: 99;
          max-height: 0; overflow: hidden;
          transition: max-height 0.4s ease, padding 0.4s ease;
          display: flex; flex-direction: column;
        }
        .mobile-menu.open { max-height: 500px; padding: 32px; }
        .mobile-nav-link {
          font-family: var(--mono); font-size: 11px; letter-spacing: 3px;
          color: #333; text-decoration: none; text-transform: uppercase;
          padding: 14px 0; border-bottom: 1px solid rgba(0,0,0,0.05);
          transition: color 0.2s;
        }
        .mobile-nav-link:last-of-type { border-bottom: none; }
        .mobile-nav-link:hover,
        .mobile-nav-link.active { color: #c8102e; }
        .mobile-divider {
          font-family: var(--mono); font-size: 8px; letter-spacing: 3px;
          color: #ccc; text-transform: uppercase; padding: 12px 0 8px;
        }
        .mobile-sub-link {
          font-family: var(--mono); font-size: 10px; letter-spacing: 2px;
          color: #666; text-decoration: none; text-transform: uppercase;
          padding: 10px 0 10px 12px; border-bottom: 1px solid rgba(0,0,0,0.04);
          display: flex; align-items: center; gap: 10px; transition: color 0.2s;
        }
        .mobile-sub-link:hover { color: #c8102e; }
        .mobile-cta {
          margin-top: 24px; font-family: var(--mono); font-size: 9px;
          letter-spacing: 2px; text-transform: uppercase; color: #fff;
          background: #111; border: none; padding: 12px 24px;
          cursor: pointer; width: fit-content; transition: background 0.2s;
        }
        .mobile-cta:hover { background: #c8102e; }

        /* ── RESPONSIVE ── */
        @media (max-width: 960px) {
          .nav-center { display: none; }
          .hamburger { display: flex; }
        }
        @media (max-width: 600px) {
          .navbar { padding: 0 20px; }
          .nav-status, .nav-time, .nav-divider { display: none; }
          .mobile-menu.open { padding: 24px 20px; }
        }
      `}</style>

      <nav className={`navbar${scrolled ? " scrolled" : ""}`}>
        {/* SCROLL PROGRESS BAR */}
        <div className="nav-progress" style={{ width: `${scrollProgress}%` }}/>

        {/* LOGO */}
        <Link to="/" className="nav-logo">
          <img src={logo} alt="SAMAM" className="nav-logo-img"/>
        </Link>

        {/* CENTER NAV LINKS */}
        <div className="nav-center">
          {NAV_LINKS.map(l => l.hasDropdown ? (
            <div
              key={l.label}
              className="nav-dropdown-wrap"
              ref={dropdownRef}
              onMouseEnter={handleDropdownEnter}
              onMouseLeave={handleDropdownLeave}
            >
              <button className={`nav-link${isActive(l.path) ? " active" : ""}${dropdownOpen ? " dropdown-open" : ""}`}>
                {l.label}
                <span className="nav-link-caret">▼</span>
              </button>
              <div className={`nav-dropdown${dropdownOpen ? " open" : ""}`}>
                {SERVICES_DROPDOWN.map(s => (
<Link key={s.path} to={s.path} className="nav-dropdown-item" onClick={() => setDropdownOpen(false)} tabIndex={0}>                    <span className="nav-dropdown-title">{s.title}</span>
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <Link key={l.label} to={l.path} className={`nav-link${isActive(l.path) ? " active" : ""}`}>
              {l.label}
            </Link>
          ))}
        </div>

        {/* RIGHT SIDE */}
        <div className="nav-right">
          <div className="nav-status">
            <span className="nav-status-dot"/>
            <span>Live</span>
          </div>
          <div className="nav-divider"/>
          <span className="nav-time">{timeStr}</span>
          <div className="nav-divider"/>
          <button className="nav-cta-btn">Get Protected</button>
          <button className={`hamburger${menuOpen ? " open" : ""}`} onClick={() => setMenuOpen(o => !o)}>
            <span/><span/><span/>
          </button>
        </div>
      </nav>

      {/* MOBILE MENU */}
      <div className={`mobile-menu${menuOpen ? " open" : ""}`}>
        {NAV_LINKS.map(l => l.hasDropdown ? (
          <div key={l.label}>
            <span className="mobile-nav-link" style={{ cursor: "default", color: "#aaa" }}>{l.label}</span>
            <div className="mobile-divider">Services</div>
            {SERVICES_DROPDOWN.map(s => (
              <Link key={s.path} to={s.path} className="mobile-sub-link" onClick={() => setMenuOpen(false)}>
                <span>{s.icon}</span>{s.title}
              </Link>
            ))}
          </div>
        ) : (
          <Link key={l.label} to={l.path}
            className={`mobile-nav-link${isActive(l.path) ? " active" : ""}`}
            onClick={() => setMenuOpen(false)}>
            {l.label}
          </Link>
        ))}
        <button className="mobile-cta" onClick={() => setMenuOpen(false)}>Get Protected</button>
      </div>
    </>
  );
}