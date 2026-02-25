import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import emailjs from "@emailjs/browser";
import * as THREE from "three";

// ── EMAILJS CONFIG ────────────────────────────────────────────
const EMAILJS_SERVICE_ID  = "service_ab9t908";
const EMAILJS_TEMPLATE_ID = "template_8v3i59e";
const EMAILJS_PUBLIC_KEY  = "9-v28BIq4M3L7xxbk";

// ── OFFICE LOCATION ───────────────────────────────────────────
const OFFICE_LAT =  25.2867;
const OFFICE_LNG =  51.5270;
const PLUS_CODE  = "7G89+4F Doha, Qatar";
const MAPS_QUERY = "7G89%2B4F+Doha%2C+Qatar";

function latLngToVec3(lat, lng, radius = 1) {
  const phi   = (90 - lat)  * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
     radius * Math.cos(phi),
     radius * Math.sin(phi) * Math.sin(theta)
  );
}

// ── 3D GLOBE ─────────────────────────────────────────────────
function Globe({ onQatarClick }) {
  const mountRef = useRef(null);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    let cleanup;
    (async () => {
    const el = mountRef.current;
    if (!el) return;

    const W = el.clientWidth;
    const H = el.clientHeight;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    renderer.setClearColor(0x000000, 0);
    el.appendChild(renderer.domElement);

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 100);
    camera.position.z = 2.6;

    scene.add(new THREE.AmbientLight(0x112244, 0.4));
    const sun = new THREE.DirectionalLight(0xffeedd, 1.4);
    sun.position.set(5, 3, 5);
    scene.add(sun);
    const rim = new THREE.DirectionalLight(0x1144aa, 0.3);
    rim.position.set(-5, -2, -3);
    scene.add(rim);

    // ── Real Earth textures loaded from CDN ──
    const loader = new THREE.TextureLoader();
    const loadTex = (url) => new Promise((res) => {
      loader.load(url, res, undefined, () => res(null));
    });

    const [texture, specularMap, bumpMap, cloudsMap] = await Promise.all([
      loadTex("https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg"),
      loadTex("https://unpkg.com/three-globe/example/img/earth-water.png"),
      loadTex("https://unpkg.com/three-globe/example/img/earth-topology.png"),
      loadTex("https://unpkg.com/three-globe/example/img/earth-clouds.png"),
    ]);

    const globe = new THREE.Mesh(
      new THREE.SphereGeometry(1, 64, 64),
      new THREE.MeshPhongMaterial({
        map: texture,
        specularMap: specularMap || undefined,
        bumpMap: bumpMap || undefined,
        bumpScale: 0.05,
        shininess: 25,
        specular: new THREE.Color(0x226688),
      })
    );
    scene.add(globe);

    // Clouds layer
    if (cloudsMap) {
      const clouds = new THREE.Mesh(
        new THREE.SphereGeometry(1.012, 64, 64),
        new THREE.MeshPhongMaterial({
          map: cloudsMap, transparent: true, opacity: 0.35,
          depthWrite: false, blending: THREE.AdditiveBlending,
        })
      );
      scene.add(clouds);
      // Slow cloud rotation stored for animation
      globe.userData.clouds = clouds;
    }

    scene.add(new THREE.Mesh(
      new THREE.SphereGeometry(1.035, 64, 64),
      new THREE.MeshPhongMaterial({ color: 0x0a2550, transparent: true, opacity: 0.18, blending: THREE.AdditiveBlending, depthWrite: false })
    ));
    scene.add(new THREE.Mesh(
      new THREE.SphereGeometry(1.07, 64, 64),
      new THREE.MeshPhongMaterial({ color: 0xc8102e, transparent: true, opacity: 0.04, side: THREE.BackSide, blending: THREE.AdditiveBlending, depthWrite: false })
    ));

    // ── Pin group ──
    const pinGroup = new THREE.Group();
    const pinWorldPos = latLngToVec3(OFFICE_LAT, OFFICE_LNG, 1.0);
    pinGroup.position.copy(latLngToVec3(OFFICE_LAT, OFFICE_LNG, 1.01));
    pinGroup.lookAt(new THREE.Vector3(0, 0, 0));
    pinGroup.rotateX(Math.PI);

    // Spike
    const spike = new THREE.Mesh(
      new THREE.ConeGeometry(0.014, 0.07, 8),
      new THREE.MeshBasicMaterial({ color: 0xc8102e })
    );
    spike.position.y = -0.035;
    pinGroup.add(spike);

    // Head (larger, easier to click)
    const headMat = new THREE.MeshBasicMaterial({ color: 0xff2244 });
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.028, 16, 16), headMat);
    head.position.y = 0.03;
    pinGroup.add(head);

    // Invisible hit-sphere for easier clicking (much larger)
    const hitSphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.09, 8, 8),
      new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
    );
    hitSphere.position.y = 0.01;
    hitSphere.userData.isQatarPin = true;
    pinGroup.add(hitSphere);

    // Pulse ring 1
    const pulseMat1 = new THREE.MeshBasicMaterial({ color: 0xff2244, transparent: true, opacity: 0.8, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false });
    const pulse1 = new THREE.Mesh(new THREE.RingGeometry(0.03, 0.048, 32), pulseMat1);
    pulse1.rotation.x = Math.PI / 2;
    pinGroup.add(pulse1);

    // Pulse ring 2 (offset phase)
    const pulseMat2 = new THREE.MeshBasicMaterial({ color: 0xc8102e, transparent: true, opacity: 0.5, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false });
    const pulse2 = new THREE.Mesh(new THREE.RingGeometry(0.03, 0.048, 32), pulseMat2);
    pulse2.rotation.x = Math.PI / 2;
    pinGroup.add(pulse2);

    globe.add(pinGroup);

    // ── Raycaster — hits pin directly ──
    const raycaster  = new THREE.Raycaster();
    const mouse      = new THREE.Vector2();
    let   isDragging = false;

    // Collect all pin meshes for direct raycasting
    const pinMeshes  = [head, hitSphere, spike];

    const getPinHit = (e) => {
      const rect = el.getBoundingClientRect();
      mouse.x =  ((e.clientX - rect.left) / rect.width)  * 2 - 1;
      mouse.y = -((e.clientY - rect.top)  / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      // First try hitting the pin meshes directly (most reliable)
      const pinHits = raycaster.intersectObjects(pinMeshes, true);
      if (pinHits.length) return "pin";
      // Fallback: check if globe hit is near Qatar lat/lng
      const globeHits = raycaster.intersectObject(globe);
      if (!globeHits.length) return null;
      const uv  = globeHits[0].uv;
      const lat = 90 - uv.y * 180;
      const lng = uv.x * 360 - 180;
      const dist = Math.sqrt((lng - OFFICE_LNG) ** 2 + (lat - OFFICE_LAT) ** 2);
      return dist < 5 ? "pin" : "globe";
    };

    const onMove = (e) => {
      if (isDragging) return;
      const hit = getPinHit(e);
      const near = hit === "pin";
      setHovered(near);
      el.style.cursor = near ? "pointer" : "grab";
      // Scale pin head on hover for feedback
      const scale = near ? 1.4 : 1;
      head.scale.setScalar(scale);
      headMat.color.set(near ? 0xff4466 : 0xff2244);
    };

    let mouseDownPos = { x: 0, y: 0 };
    const onMouseDown = (e) => { mouseDownPos = { x: e.clientX, y: e.clientY }; };

    const onClick = (e) => {
      // Ignore if user was dragging
      const moved = Math.sqrt((e.clientX - mouseDownPos.x)**2 + (e.clientY - mouseDownPos.y)**2);
      if (moved > 5) return;
      const hit = getPinHit(e);
      if (hit === "pin") {
        // Flash the pin red before opening
        headMat.color.set(0xffffff);
        setTimeout(() => { headMat.color.set(0xff2244); onQatarClick?.(); }, 120);
      }
    };

    el.addEventListener("mousemove", onMove);
    el.addEventListener("mousedown", onMouseDown);
    el.addEventListener("click", onClick);

    // Drag
    let prevX = 0, velX = 0, autoRotate = true;
    const onDown = (e) => { isDragging = true; autoRotate = false; prevX = e.clientX; el.style.cursor = "grabbing"; };
    const onUp   = ()  => { isDragging = false; setTimeout(() => { autoRotate = true; }, 2500); };
    const onDrag = (e) => { if (!isDragging) return; const dx = (e.clientX - prevX) * 0.005; velX = dx; globe.rotation.y += dx; prevX = e.clientX; };
    el.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    el.addEventListener("mousemove", onDrag);

    let tx = 0;
    el.addEventListener("touchstart", (e) => { tx = e.touches[0].clientX; autoRotate = false; });
    el.addEventListener("touchmove",  (e) => { globe.rotation.y += (e.touches[0].clientX - tx) * 0.005; tx = e.touches[0].clientX; });
    el.addEventListener("touchend",   ()  => { setTimeout(() => { autoRotate = true; }, 2500); });

    globe.rotation.y = -(OFFICE_LNG * Math.PI / 180) - Math.PI;

    let raf, pulseT = 0;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      if (autoRotate) globe.rotation.y += 0.0015;
      else { globe.rotation.y += velX * 0.92; velX *= 0.92; }
      // Pulse ring 1
      pulseT = (pulseT + 0.022) % 1;
      const ps1 = 1 + pulseT * 3;
      pulse1.scale.set(ps1, ps1, ps1);
      pulseMat1.opacity = 0.8 * (1 - pulseT);
      // Pulse ring 2 (offset by half phase)
      const t2 = (pulseT + 0.5) % 1;
      const ps2 = 1 + t2 * 3;
      pulse2.scale.set(ps2, ps2, ps2);
      pulseMat2.opacity = 0.5 * (1 - t2);
      // Pin head bob
      head.position.y = 0.03 + Math.sin(Date.now() * 0.002) * 0.006;
      if (globe.userData.clouds) globe.userData.clouds.rotation.y += 0.0004;
      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      const w = el.clientWidth, h = el.clientHeight;
      camera.aspect = w / h; camera.updateProjectionMatrix(); renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    cleanup = () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mouseup", onUp);
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("click", onClick);
      el.removeEventListener("mousedown", onDown);
      el.removeEventListener("mousedown", onMouseDown);
      el.removeEventListener("mousemove", onDrag);
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
    })();
    return () => cleanup?.();
  }, []);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <div ref={mountRef} style={{ width: "100%", height: "100%" }}/>
      {hovered && <div className="cp-globe-tooltip">📍 {PLUS_CODE} — Click to open map</div>}
    </div>
  );
}

// ── MAP MODAL ─────────────────────────────────────────────────
function MapModal({ onClose }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", handler); document.body.style.overflow = ""; };
  }, []);

  return (
    <motion.div className="cp-map-overlay"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={(e) => { if (e.target.classList.contains("cp-map-overlay")) onClose(); }}>
      <motion.div className="cp-map-box"
        initial={{ opacity: 0, scale: 0.94, y: 24 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }} transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}>
        <div className="cp-map-header">
          <div>
            <p className="cp-map-eyebrow">Our Location</p>
            <h3 className="cp-map-title">{PLUS_CODE}</h3>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
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
          <iframe
            title="SAMAM Location"
            src={`https://www.google.com/maps?q=${MAPS_QUERY}&output=embed&z=17`}
            width="100%" height="100%" style={{ border: 0 }}
            allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── CONTACT PAGE ──────────────────────────────────────────────
export default function ContactPage() {
  const [form,    setForm]    = useState({ from_name: "", from_email: "", phone: "", subject: "", message: "" });
  const [status,  setStatus]  = useState("idle");
  const [mapOpen, setMapOpen] = useState(false);

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
  const handleReset = () => { setForm({ from_name: "", from_email: "", phone: "", subject: "", message: "" }); setStatus("idle"); };

  return (
    <>
      <style>{`
        .contact-page { background: #060a12; min-height: 100vh; }

        /* HEADER */
        .cp-header { padding: 80px 64px 0; position: relative; overflow: hidden; }
        .cp-header-grid {
          position: absolute; inset: 0;
          background: linear-gradient(rgba(200,16,46,0.03) 1px,transparent 1px),
                      linear-gradient(90deg,rgba(200,16,46,0.03) 1px,transparent 1px);
          background-size: 64px 64px; animation: cpGrid 28s linear infinite;
        }
        @keyframes cpGrid { to { background-position: 64px 64px; } }
        .cp-header-top-line { position:absolute; top:0; left:0; right:0; height:2px; background:linear-gradient(to right,transparent,#c8102e 30%,#c8102e 70%,transparent); opacity:0.5; }
        .cp-header-content { position:relative; z-index:2; padding-bottom:64px; }
        .cp-header-eyebrow { font-family:var(--mono); font-size:9px; letter-spacing:5px; color:#c8102e; text-transform:uppercase; margin-bottom:24px; display:flex; align-items:center; gap:14px; }
        .cp-header-eyebrow::before { content:''; width:28px; height:1px; background:#c8102e; display:block; }
        .cp-header-title { font-family:var(--display); font-size:clamp(52px,8vw,110px); line-height:0.88; letter-spacing:1px; color:#f0f0f0; margin-bottom:32px; }
        .cp-header-title .outline { color:transparent; -webkit-text-stroke:1px rgba(240,240,240,0.18); }
        .cp-header-sub { font-size:14px; color:rgba(255,255,255,0.35); max-width:440px; line-height:1.9; font-weight:300; }

        /* BODY */
        .cp-body { display:grid; grid-template-columns:1fr 1fr; min-height:80vh; border-top:1px solid rgba(255,255,255,0.05); }

        /* GLOBE SIDE */
        .cp-globe-side { background:#060a12; position:relative; display:flex; flex-direction:column; border-right:1px solid rgba(255,255,255,0.05); overflow:hidden; }
        .cp-globe-orb { position:absolute; width:500px; height:500px; border-radius:50%; background:radial-gradient(ellipse,rgba(200,16,46,0.07) 0%,transparent 70%); top:50%; left:50%; transform:translate(-50%,-50%); pointer-events:none; }
        .cp-globe-wrap { flex:1; min-height:520px; position:relative; z-index:1; }
        .cp-globe-info { padding:32px 48px 48px; position:relative; z-index:1; }
        .cp-globe-hint { font-family:var(--mono); font-size:8px; letter-spacing:3px; color:rgba(255,255,255,0.2); text-transform:uppercase; display:flex; align-items:center; gap:8px; margin-bottom:24px; }
        .cp-globe-hint-dot { width:6px; height:6px; border-radius:50%; background:#c8102e; animation:pulseDot 1.8s ease-in-out infinite; }
        @keyframes pulseDot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(1.4)} }
        .cp-globe-details { display:grid; grid-template-columns:1fr 1fr; gap:1px; border:1px solid rgba(255,255,255,0.06); }
        .cp-globe-detail { padding:20px 22px; background:rgba(255,255,255,0.02); border-right:1px solid rgba(255,255,255,0.05); }
        .cp-globe-detail:nth-child(2n) { border-right:none; }
        .cp-globe-detail:nth-child(n+3) { border-top:1px solid rgba(255,255,255,0.05); }
        .cp-globe-detail-label { font-family:var(--mono); font-size:7px; letter-spacing:3px; color:rgba(255,255,255,0.2); text-transform:uppercase; margin-bottom:6px; }
        .cp-globe-detail-val   { font-family:var(--mono); font-size:11px; letter-spacing:0.5px; color:rgba(255,255,255,0.6); line-height:1.5; }
        .cp-globe-tooltip { position:absolute; bottom:16px; left:50%; transform:translateX(-50%); background:rgba(200,16,46,0.9); color:#fff; font-family:var(--mono); font-size:9px; letter-spacing:2px; padding:8px 16px; white-space:nowrap; pointer-events:none; z-index:10; animation:tooltipIn 0.3s ease-out; }
        @keyframes tooltipIn { from{opacity:0;transform:translateX(-50%) translateY(6px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }

        /* FORM SIDE */
        .cp-form-side { background:#fff; padding:64px; display:flex; flex-direction:column; }
        .cp-form-eyebrow { font-family:var(--mono); font-size:9px; letter-spacing:4px; color:#c8102e; text-transform:uppercase; margin-bottom:16px; display:flex; align-items:center; gap:10px; }
        .cp-form-eyebrow::before { content:''; width:20px; height:1px; background:#c8102e; display:block; }
        .cp-form-title { font-family:var(--display); font-size:clamp(28px,2.5vw,40px); letter-spacing:2px; color:#111; margin-bottom:8px; line-height:1; }
        .cp-form-sub   { font-size:13px; color:#999; margin-bottom:48px; font-weight:300; line-height:1.7; }
        .cp-form  { display:flex; flex-direction:column; gap:20px; flex:1; }
        .cp-row   { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
        .cp-field { display:flex; flex-direction:column; gap:8px; }
        .cp-label { font-family:var(--mono); font-size:8px; letter-spacing:2px; color:#aaa; text-transform:uppercase; }
        .cp-input { font-family:var(--mono); font-size:12px; color:#111; background:#fafafa; border:1px solid #e8e8e8; padding:13px 15px; outline:none; transition:border-color 0.2s,background 0.2s; width:100%; box-sizing:border-box; }
        .cp-input:focus { border-color:#c8102e; background:#fff; }
        .cp-input::placeholder { color:#ccc; }
        .cp-select { cursor:pointer; appearance:none; background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' fill='none'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23999' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E"); background-repeat:no-repeat; background-position:right 14px center; padding-right:36px; }
        .cp-textarea { resize:vertical; min-height:120px; font-family:var(--mono); }
        .cp-error { font-family:var(--mono); font-size:10px; color:#c8102e; padding:12px 14px; border:1px solid rgba(200,16,46,0.2); background:rgba(200,16,46,0.04); }
        .cp-actions { display:flex; justify-content:space-between; align-items:center; padding-top:8px; }
        .cp-actions-note { font-family:var(--mono); font-size:8px; letter-spacing:1.5px; color:#ccc; text-transform:uppercase; }
        .cp-submit { font-family:var(--mono); font-size:10px; letter-spacing:2px; text-transform:uppercase; background:#111; color:#fff; border:none; padding:13px 32px; cursor:pointer; transition:background 0.2s; display:flex; align-items:center; gap:8px; }
        .cp-submit:hover:not(:disabled) { background:#c8102e; }
        .cp-submit:disabled { opacity:0.6; cursor:not-allowed; }
        .cp-spinner { width:14px; height:14px; border:2px solid rgba(255,255,255,0.3); border-top-color:#fff; border-radius:50%; animation:cpSpin 0.7s linear infinite; }
        @keyframes cpSpin { to { transform:rotate(360deg); } }
        .cp-success { flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; gap:16px; padding:40px 0; }
        .cp-success-icon { width:64px; height:64px; border-radius:50%; background:rgba(200,16,46,0.08); display:flex; align-items:center; justify-content:center; font-size:24px; color:#c8102e; font-weight:bold; }
        .cp-success-title { font-family:var(--display); font-size:28px; letter-spacing:2px; color:#111; }
        .cp-success-sub   { font-size:13px; color:#888; line-height:1.8; max-width:280px; }
        .cp-success-btn   { margin-top:8px; font-family:var(--mono); font-size:10px; letter-spacing:2px; text-transform:uppercase; background:#111; color:#fff; border:none; padding:12px 32px; cursor:pointer; transition:background 0.2s; }
        .cp-success-btn:hover { background:#c8102e; }

        /* MAP MODAL */
        .cp-map-overlay { position:fixed; inset:0; z-index:300; background:rgba(0,0,0,0.7); backdrop-filter:blur(8px); display:flex; align-items:center; justify-content:center; padding:24px; }
        .cp-map-box { background:#0a0f1a; width:100%; max-width:900px; height:min(80vh,620px); display:flex; flex-direction:column; border:1px solid rgba(255,255,255,0.08); box-shadow:0 40px 100px rgba(0,0,0,0.5); overflow:hidden; }
        .cp-map-header { padding:20px 28px; border-bottom:1px solid rgba(255,255,255,0.07); display:flex; align-items:center; justify-content:space-between; flex-shrink:0; background:#0d1220; }
        .cp-map-eyebrow { font-family:var(--mono); font-size:7px; letter-spacing:3px; color:#c8102e; text-transform:uppercase; margin-bottom:5px; }
        .cp-map-title   { font-family:var(--display); font-size:18px; letter-spacing:2px; color:#f0f0f0; }
        .cp-map-open-btn { font-family:var(--mono); font-size:8px; letter-spacing:2px; text-transform:uppercase; color:rgba(255,255,255,0.35); border:1px solid rgba(255,255,255,0.12); padding:8px 16px; text-decoration:none; transition:all 0.2s; }
        .cp-map-open-btn:hover { color:#fff; border-color:rgba(255,255,255,0.4); }
        .cp-map-close { background:none; border:1px solid rgba(255,255,255,0.12); padding:8px; cursor:pointer; color:rgba(255,255,255,0.4); transition:all 0.2s; display:flex; align-items:center; justify-content:center; margin-left:12px; }
        .cp-map-close:hover { border-color:rgba(255,255,255,0.5); color:#fff; }
        .cp-map-frame-wrap { flex:1; overflow:hidden; }
        .cp-map-frame-wrap iframe { display:block; }

        /* BOTTOM STRIP */
        .cp-bottom-strip { background:#0a0f1a; border-top:1px solid rgba(255,255,255,0.05); display:grid; grid-template-columns:repeat(4,1fr); }
        .cp-strip-item { padding:36px 40px; border-right:1px solid rgba(255,255,255,0.05); transition:background 0.25s; }
        .cp-strip-item:last-child { border-right:none; }
        .cp-strip-item:hover { background:rgba(255,255,255,0.02); }
        .cp-strip-label { font-family:var(--mono); font-size:7px; letter-spacing:3px; color:rgba(255,255,255,0.2); text-transform:uppercase; margin-bottom:8px; }
        .cp-strip-val   { font-family:var(--mono); font-size:12px; color:rgba(255,255,255,0.55); line-height:1.6; }
        .cp-strip-val a { color:inherit; text-decoration:none; transition:color 0.2s; }
        .cp-strip-val a:hover { color:#c8102e; }

        /* RESPONSIVE */
        @media (max-width:1024px) {
          .cp-body { grid-template-columns:1fr; }
          .cp-globe-side { border-right:none; border-bottom:1px solid rgba(255,255,255,0.05); }
          .cp-globe-wrap { min-height:400px; }
          .cp-bottom-strip { grid-template-columns:repeat(2,1fr); }
          .cp-strip-item:nth-child(2)  { border-right:none; }
          .cp-strip-item:nth-child(n+3){ border-top:1px solid rgba(255,255,255,0.05); }
        }
        @media (max-width:768px) {
          .cp-header { padding:64px 24px 0; }
          .cp-form-side { padding:48px 24px; }
          .cp-globe-info { padding:24px 24px 36px; }
          .cp-row { grid-template-columns:1fr; }
          .cp-bottom-strip { grid-template-columns:1fr; }
          .cp-strip-item { border-right:none; border-bottom:1px solid rgba(255,255,255,0.05); }
          .cp-strip-item:last-child { border-bottom:none; }
        }
      `}</style>

      <div className="contact-page">

        {/* HEADER */}
        <div className="cp-header">
          <div className="cp-header-top-line"/>
          <div className="cp-header-grid"/>
          <div className="cp-header-content">
            <motion.p className="cp-header-eyebrow" initial={{opacity:0,x:-20}} animate={{opacity:1,x:0}} transition={{duration:0.5}}>
              Reach Out
            </motion.p>
            <motion.h1 className="cp-header-title" initial={{opacity:0,y:24}} animate={{opacity:1,y:0}} transition={{duration:0.6,delay:0.1}}>
              GET IN<br/><span className="outline">TOUCH</span>
            </motion.h1>
            <motion.p className="cp-header-sub" initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{duration:0.5,delay:0.22}}>
              Whether you need enterprise drones, integrated security systems, or a full-service partner in Qatar — we're ready to help.
            </motion.p>
          </div>
        </div>

        {/* BODY */}
        <div className="cp-body">

          {/* Globe */}
          <motion.div className="cp-globe-side" initial={{opacity:0}} animate={{opacity:1}} transition={{duration:0.8,delay:0.2}}>
            <div className="cp-globe-orb"/>
            <div className="cp-globe-wrap">
              <Globe onQatarClick={() => setMapOpen(true)}/>
            </div>
            <div className="cp-globe-info">
              <div className="cp-globe-hint">
                <div className="cp-globe-hint-dot"/>
                Click the red pin on Qatar to open map
              </div>
              <div className="cp-globe-details">
                <div className="cp-globe-detail">
                  <div className="cp-globe-detail-label">Country</div>
                  <div className="cp-globe-detail-val">State of Qatar</div>
                </div>
                <div className="cp-globe-detail">
                  <div className="cp-globe-detail-label">City</div>
                  <div className="cp-globe-detail-val">Doha</div>
                </div>
                <div className="cp-globe-detail">
                  <div className="cp-globe-detail-label">Plus Code</div>
                  <div className="cp-globe-detail-val">7G89+4F</div>
                </div>
                <div className="cp-globe-detail">
                  <div className="cp-globe-detail-label">Coordinates</div>
                  <div className="cp-globe-detail-val">25.2867° N<br/>51.5270° E</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Form */}
          <motion.div className="cp-form-side" initial={{opacity:0,x:32}} animate={{opacity:1,x:0}} transition={{duration:0.7,delay:0.3}}>
            <p className="cp-form-eyebrow">Send a Message</p>
            <h2 className="cp-form-title">Let's Start a Conversation</h2>
            <p className="cp-form-sub">Fill out the form and our team will respond within 24 hours.</p>

            <AnimatePresence mode="wait">
              {status === "success" ? (
                <motion.div key="success" className="cp-success" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.4}}>
                  <div className="cp-success-icon">✓</div>
                  <h3 className="cp-success-title">Message Sent!</h3>
                  <p className="cp-success-sub">Thank you for reaching out. Our team will get back to you within 24 hours.</p>
                  <button className="cp-success-btn" onClick={handleReset}>Send Another →</button>
                </motion.div>
              ) : (
                <motion.form key="form" className="cp-form" onSubmit={handleSubmit} initial={{opacity:0}} animate={{opacity:1}} transition={{duration:0.3}}>
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
                    <textarea className="cp-input cp-textarea" name="message" placeholder="Tell us about your project, requirements, or question..." value={form.message} onChange={handleChange} required rows={5}/>
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
            { label: "Email",         val: <a href="mailto:info@samam.qa">info@samam.qa</a> },
            { label: "Phone",         val: <a href="tel:+97400000000">+974 XXXX XXXX</a> },
            { label: "Location",      val: <>7G89+4F<br/>Doha, Qatar</> },
            { label: "Working Hours", val: <>Sun – Thu: 8am – 6pm<br/>24/7 for emergencies</> },
          ].map((item, i) => (
            <motion.div key={i} className="cp-strip-item"
              initial={{opacity:0,y:16}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:0.4,delay:i*0.08}}>
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