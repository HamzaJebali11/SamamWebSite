// When you have a company photo, add:
// import companyImg from "../assets/company.jpg";

export default function Footer() {
  return (
    <>
      <style>{`
        .footer {
          background: #0f1623;
        }

        /* ── LOGO BANNER ── */
        .footer-banner {
          width: 100%;
          padding: 64px 56px;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          overflow: hidden;
        }
        /* subtle background pattern */
        .footer-banner::before {
          content: '';
          position: absolute; inset: 0;
          background:
            linear-gradient(rgba(200,16,46,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(200,16,46,0.03) 1px, transparent 1px);
          background-size: 48px 48px;
        }
        .footer-banner-logo {
          position: relative;
          z-index: 1;
          height: 80px;
          width: auto;
          object-fit: contain;
          object-position: left center;
          filter: brightness(0) invert(1);
          opacity: 0.9;
        }
        .footer-banner-right {
          position: relative;
          z-index: 1;
          text-align: right;
        }
        .footer-banner-name {
          font-family: var(--display);
          font-size: clamp(32px, 5vw, 64px);
          letter-spacing: 6px;
          color: #fff;
          line-height: 1;
          opacity: 0.08;
          user-select: none;
        }
        .footer-banner-tagline {
          font-family: var(--mono);
          font-size: 9px;
          letter-spacing: 3px;
          color: rgba(255,255,255,0.3);
          text-transform: uppercase;
          margin-top: 12px;
        }

        /* ── RED DIVIDER ── */
        .footer-rule {
          height: 1px;
          background: linear-gradient(to right, transparent, rgba(200,16,46,0.5), transparent);
        }

        /* ── MAIN GRID ── */
        .footer-top {
          display: grid;
          grid-template-columns: 1.8fr 1fr 1fr 1fr;
          gap: 0;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .footer-col {
          padding: 48px 40px;
          border-right: 1px solid rgba(255,255,255,0.04);
        }
        .footer-col:last-child { border-right: none; }
        .footer-col:first-child { padding-left: 56px; }
        .footer-col:last-child  { padding-right: 56px; }
        .footer-col-title {
          font-family: var(--mono);
          font-size: 8px;
          letter-spacing: 4px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.2);
          margin-bottom: 28px;
          padding-bottom: 16px;
          border-bottom: 1px solid rgba(255,255,255,0.04);
        }

        /* BRAND COL */
        .footer-tagline {
          font-size: 13px;
          color: rgba(255,255,255,0.35);
          line-height: 1.9;
          font-weight: 300;
          margin-bottom: 32px;
          max-width: 240px;
        }
        .footer-contact-list { display: flex; flex-direction: column; gap: 12px; }
        .footer-contact-item {
          display: flex;
          align-items: center;
          gap: 12px;
          font-family: var(--mono);
          font-size: 10px;
          color: rgba(255,255,255,0.35);
          letter-spacing: 0.5px;
          transition: color 0.2s;
          text-decoration: none;
        }
        .footer-contact-item:hover { color: rgba(255,255,255,0.7); }
        .footer-contact-icon {
          width: 28px; height: 28px;
          border: 1px solid rgba(255,255,255,0.07);
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; flex-shrink: 0;
          transition: border-color 0.2s;
        }
        .footer-contact-item:hover .footer-contact-icon { border-color: rgba(200,16,46,0.4); }

        /* LINK COLS */
        .footer-links { list-style: none; display: flex; flex-direction: column; gap: 0; }
        .footer-links li a {
          display: flex;
          align-items: center;
          font-size: 12px;
          color: rgba(255,255,255,0.35);
          text-decoration: none;
          font-weight: 300;
          padding: 9px 0;
          border-bottom: 1px solid rgba(255,255,255,0.03);
          transition: color 0.2s;
          letter-spacing: 0.3px;
        }
        .footer-links li:last-child a { border-bottom: none; }
        .footer-links li a::before {
          content: '';
          width: 0; height: 1px;
          background: #c8102e;
          transition: width 0.25s ease, margin-right 0.25s ease;
          display: inline-block;
          margin-right: 0; flex-shrink: 0;
        }
        .footer-links li a:hover { color: rgba(255,255,255,0.8); }
        .footer-links li a:hover::before { width: 12px; margin-right: 8px; }

        /* ── MAP ── */
        .footer-map-section { border-bottom: 1px solid rgba(255,255,255,0.05); }
        .footer-map-inner { padding: 0 56px 32px; }
        .footer-map-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 28px 0 20px;
        }
        .footer-map-label {
          font-family: var(--mono); font-size: 8px; letter-spacing: 4px;
          text-transform: uppercase; color: rgba(255,255,255,0.2);
        }
        .footer-directions {
          display: inline-flex; align-items: center; gap: 6px;
          font-family: var(--mono); font-size: 9px; letter-spacing: 2px;
          color: #c8102e; text-decoration: none; text-transform: uppercase;
          transition: opacity 0.2s;
        }
        .footer-directions:hover { opacity: 0.65; }
        .footer-map {
          width: 100%; overflow: hidden;
          border: 1px solid rgba(255,255,255,0.06); border-radius: 2px;
        }
        .footer-map iframe { display: block; }

        /* ── BOTTOM ── */
        .footer-bottom {
          display: flex; align-items: center; justify-content: space-between;
          padding: 18px 56px;
        }
        .footer-copy {
          font-family: var(--mono); font-size: 9px;
          color: rgba(255,255,255,0.15); letter-spacing: 0.5px;
        }
        .footer-bottom-links { display: flex; gap: 32px; }
        .footer-bottom-links a {
          font-family: var(--mono); font-size: 9px;
          color: rgba(255,255,255,0.15); text-decoration: none;
          letter-spacing: 0.5px; transition: color 0.2s;
        }
        .footer-bottom-links a:hover { color: rgba(255,255,255,0.5); }

        /* ── RESPONSIVE ── */
        @media (max-width: 1024px) {
          .footer-top { grid-template-columns: 1fr 1fr; }
          .footer-col { border-bottom: 1px solid rgba(255,255,255,0.04); }
          .footer-col:nth-child(2) { border-right: none; }
        }
        @media (max-width: 768px) {
          .footer-banner { padding: 40px 24px; flex-direction: column; align-items: flex-start; gap: 24px; }
          .footer-banner-right { text-align: left; }
          .footer-banner-logo { height: 56px; }
          .footer-top { grid-template-columns: 1fr; }
          .footer-col { padding: 36px 24px; border-right: none; }
          .footer-col:first-child { padding-left: 24px; }
          .footer-map-inner { padding: 0 24px 28px; }
          .footer-bottom { flex-direction: column; gap: 12px; padding: 16px 24px; text-align: center; }
          .footer-bottom-links { flex-wrap: wrap; justify-content: center; gap: 16px; }
        }
      `}</style>

      <footer className="footer">

        {/* LOGO BANNER */}
        <div className="footer-banner">
          <div className="footer-banner-right">
            <div className="footer-banner-name">SAMAM SPECIAL SECURITY SERVICES</div>
            <p className="footer-banner-tagline">Protecting Qatar since 2013</p>
          </div>
        </div>

        <div className="footer-rule"/>

        {/* MAIN GRID */}
        <div className="footer-top">
          <div className="footer-col">
            <p className="footer-col-title">About</p>
            <p className="footer-tagline">Providing world-class security solutions through advanced technology and expert personnel across Qatar.</p>
            <div className="footer-contact-list">
              <a href="tel:+97444146655" className="footer-contact-item">
                <div className="footer-contact-icon">📞</div>
                <span>+974 44 146 655</span>
              </a>
              <a href="mailto:info@samamsecurity.com" className="footer-contact-item">
                <div className="footer-contact-icon">✉</div>
                <span>info@samamsecurity.com</span>
              </a>
              <a href="#" className="footer-contact-item">
                <div className="footer-contact-icon">📍</div>
                <span>Doha, Qatar</span>
              </a>
            </div>
          </div>

          <div className="footer-col">
            <p className="footer-col-title">Services</p>
            <ul className="footer-links">
              <li><a href="#">Security Guards</a></li>
              <li><a href="#">CCTV Installation</a></li>
              <li><a href="#">Drone Surveillance</a></li>
              <li><a href="#">Risk Assessment</a></li>
              <li><a href="#">Emergency Response</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <p className="footer-col-title">Company</p>
            <ul className="footer-links">
              <li><a href="#">About Us</a></li>
              <li><a href="#">Our Team</a></li>
              <li><a href="#">Certifications</a></li>
              <li><a href="#">Careers</a></li>
              <li><a href="#">News</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <p className="footer-col-title">Support</p>
            <ul className="footer-links">
              <li><a href="#">Contact</a></li>
              <li><a href="#">Emergency Line</a></li>
              <li><a href="#">Client Portal</a></li>
              <li><a href="#">Documentation</a></li>
              <li><a href="#">FAQ</a></li>
            </ul>
          </div>
        </div>

        {/* MAP */}
        <div className="footer-map-section">
          <div className="footer-map-inner">
            <div className="footer-map-header">
              <span className="footer-map-label">Our Location — Doha, Qatar</span>
              <a className="footer-directions" href="https://maps.app.goo.gl/YLbRyDu7GYigHwUi8" target="_blank" rel="noopener noreferrer">
                ↗ Get Directions
              </a>
            </div>
            <div className="footer-map">
              <iframe
                title="SAMAM Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3607!2d51.52!3d25.285!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2s7G89%2B4F+Doha!5e0!3m2!1sen!2sqa!4v1"
                width="100%" height="200"
                style={{ border: 0 }}
                allowFullScreen loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>

        {/* BOTTOM */}
        <div className="footer-bottom">
          <span className="footer-copy">© 2026 SAMAM Special Security Services WLL. All rights reserved.</span>
          <div className="footer-bottom-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Cookie Policy</a>
          </div>
        </div>

      </footer>
    </>
  );
}