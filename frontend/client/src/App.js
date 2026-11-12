import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from "recharts";
import { EM, ICON, COURSES, ADAPT_LESSONS, weekData, emDist, studentRows } from "./constants";

/* ═══════════════════════════════════════════════
   STYLES
═══════════════════════════════════════════════ */
const G = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&family=JetBrains+Mono:wght@400;500;600&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg:#040d1a; --bg2:#071428; --bg3:#0a1f3a; --sur:#0d1f3c; --sur2:#122645;
      --bdr:rgba(0,212,255,.15); --blue:#00d4ff; --blue2:#0088cc;
      --green:#00ff88; --orange:#ff8c00; --red:#ff3366; --purple:#9d4edd; --yellow:#ffd60a;
      --tx:#e8f4fd; --tx2:#8ab4d4; --tx3:#4a7fa5;
      --fd:'Orbitron',monospace; --fb:'DM Sans',sans-serif; --fm:'JetBrains Mono',monospace;
    }
    body{background:var(--bg);color:var(--tx);font-family:var(--fb);overflow-x:hidden}
    ::-webkit-scrollbar{width:5px} ::-webkit-scrollbar-track{background:var(--bg2)} ::-webkit-scrollbar-thumb{background:var(--blue2);border-radius:3px}
    .card{background:var(--sur);border:1px solid var(--bdr);border-radius:16px;padding:22px;position:relative;overflow:hidden;transition:all .3s}
    .card::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,var(--blue),transparent);opacity:.4}
    .card:hover{border-color:rgba(0,212,255,.3);transform:translateY(-1px)}
    .btn{border:none;cursor:pointer;font-family:var(--fb);transition:all .3s;display:inline-flex;align-items:center;gap:8px}
    .btn-p{background:linear-gradient(135deg,var(--blue),var(--blue2));color:#fff;padding:11px 26px;border-radius:10px;font-weight:600;font-size:14px}
    .btn-p:hover{transform:translateY(-2px);box-shadow:0 8px 25px rgba(0,212,255,.4)}
    .btn-p:disabled{opacity:.5;cursor:not-allowed;transform:none}
    .btn-o{background:transparent;color:var(--blue);border:1px solid var(--blue);padding:10px 22px;border-radius:10px;font-size:14px}
    .btn-o:hover{background:rgba(0,212,255,.1)}
    .btn-g{background:rgba(255,255,255,.04);color:var(--tx2);border:1px solid rgba(255,255,255,.08);padding:9px 18px;border-radius:10px;font-size:13px}
    .btn-g:hover{background:rgba(255,255,255,.09);color:var(--tx)}
    .inp{width:100%;background:rgba(255,255,255,.04);border:1px solid rgba(0,212,255,.2);border-radius:10px;padding:11px 15px;color:var(--tx);font-family:var(--fb);font-size:14px;outline:none;transition:all .3s}
    .inp:focus{border-color:var(--blue);background:rgba(0,212,255,.05);box-shadow:0 0 0 3px rgba(0,212,255,.1)}
    .inp::placeholder{color:var(--tx3)}
    .nav-i{display:flex;align-items:center;gap:11px;padding:11px 18px;border-radius:10px;margin:2px 8px;cursor:pointer;transition:all .2s;color:var(--tx2);font-size:14px;font-weight:500;border:1px solid transparent}
    .nav-i:hover{background:rgba(0,212,255,.08);color:var(--tx)}
    .nav-i.act{background:rgba(0,212,255,.12);color:var(--blue);border-color:rgba(0,212,255,.2)}
    .badge{display:inline-flex;align-items:center;gap:5px;padding:3px 11px;border-radius:20px;font-size:11px;font-weight:700;letter-spacing:.5px}
    .b-blue{background:rgba(0,212,255,.15);color:var(--blue);border:1px solid rgba(0,212,255,.3)}
    .b-green{background:rgba(0,255,136,.15);color:var(--green);border:1px solid rgba(0,255,136,.3)}
    .b-orange{background:rgba(255,140,0,.15);color:var(--orange);border:1px solid rgba(255,140,0,.3)}
    .b-red{background:rgba(255,51,102,.15);color:var(--red);border:1px solid rgba(255,51,102,.3)}
    .b-purple{background:rgba(157,78,221,.15);color:var(--purple);border:1px solid rgba(157,78,221,.3)}
    .sec{font-family:var(--fd);font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:var(--blue);margin-bottom:14px}
    .stat-v{font-family:var(--fd);font-size:28px;font-weight:700;background:linear-gradient(135deg,var(--blue),var(--green));-webkit-background-clip:text;-webkit-text-fill-color:transparent}
    .pbar{background:rgba(255,255,255,.07);border-radius:99px;overflow:hidden}
    .pfill{height:5px;border-radius:99px;transition:width 1s ease}
    .sidebar{width:232px;min-height:100vh;background:var(--bg2);border-right:1px solid var(--bdr);display:flex;flex-direction:column;position:fixed;left:0;top:0;z-index:100}
    .tab-bar{display:flex;gap:3px;background:rgba(255,255,255,.04);border-radius:10px;padding:4px;border:1px solid var(--bdr)}
    .tab-i{padding:7px 16px;border-radius:7px;font-size:13px;font-weight:500;cursor:pointer;transition:all .2s;color:var(--tx3);white-space:nowrap}
    .tab-i.act{background:rgba(0,212,255,.15);color:var(--blue)}
    .toggle{width:42px;height:22px;border-radius:11px;background:rgba(255,255,255,.1);position:relative;cursor:pointer;transition:background .3s;border:1px solid var(--bdr);flex-shrink:0}
    .toggle.on{background:rgba(0,212,255,.3);border-color:var(--blue)}
    .tthumb{position:absolute;top:2px;left:2px;width:16px;height:16px;border-radius:50%;background:white;transition:left .3s}
    .toggle.on .tthumb{left:22px;background:var(--blue)}
    .av{width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;flex-shrink:0}
    @keyframes pulse-ring{0%{transform:scale(1);opacity:1}100%{transform:scale(1.5);opacity:0}}
    @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
    @keyframes scan{0%{top:0}100%{top:100%}}
    @keyframes spin{to{transform:rotate(360deg)}}
    @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
    @keyframes blink{0%,100%{opacity:1}50%{opacity:.3}}
    .fade-up{animation:fadeUp .4s ease forwards}
    .float-a{animation:float 3s ease-in-out infinite}
    .spin-a{animation:spin .8s linear infinite}
    .blink-a{animation:blink 1.2s ease-in-out infinite}
    .ml-pulse{position:absolute;inset:-6px;border-radius:50%;border:2px solid var(--em-color,#00ff88);animation:pulse-ring 1.8s ease-out infinite;opacity:.5}
    .scanline{position:absolute;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,var(--green),transparent);animation:scan 2.2s linear infinite;opacity:.5}
    .face-box{position:absolute;border:2px solid var(--green);border-radius:3px;box-shadow:0 0 12px rgba(0,255,136,.4)}
    .face-box::before,.face-box::after{content:'';position:absolute;width:10px;height:10px;border-color:var(--blue);border-style:solid}
    .face-box::before{top:-2px;left:-2px;border-width:2px 0 0 2px}
    .face-box::after{bottom:-2px;right:-2px;border-width:0 2px 2px 0}
    .dt{width:100%;border-collapse:collapse}
    .dt th{padding:11px 14px;text-align:left;font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:var(--tx3);border-bottom:1px solid var(--bdr);font-family:var(--fm)}
    .dt td{padding:13px 14px;font-size:13px;color:var(--tx2);border-bottom:1px solid rgba(255,255,255,.04);transition:all .2s}
    .dt tr:hover td{background:rgba(0,212,255,.03);color:var(--tx)}
    .neural-bg{position:fixed;inset:0;z-index:0;overflow:hidden;pointer-events:none}
    .toast{position:fixed;bottom:22px;right:22px;background:var(--sur2);border:1px solid var(--bdr);border-radius:12px;padding:13px 18px;display:flex;align-items:center;gap:10px;font-size:13px;z-index:9999;animation:fadeUp .3s ease;box-shadow:0 8px 32px rgba(0,0,0,.5);max-width:300px}
    .ml-log{display:flex;flex-direction:column;gap:6px;max-height:220px;overflow-y:auto}
    .ml-entry{display:flex;align-items:center;gap:8px;padding:7px 10px;background:rgba(255,255,255,.03);border-radius:8px;font-size:12px;font-family:var(--fm)}
    .confidence-bar{height:8px;border-radius:4px;transition:width .6s ease}
  `}</style>
);

/* ═══════════════════════════════════════════════
   NEURAL BG CANVAS
═══════════════════════════════════════════════ */
const NeuralBG = () => {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d");
    c.width = window.innerWidth; c.height = window.innerHeight;
    const nodes = Array.from({ length: 55 }, () => ({
      x: Math.random() * c.width, y: Math.random() * c.height,
      vx: (Math.random() - .5) * .25, vy: (Math.random() - .5) * .25, r: Math.random() * 1.8 + .8
    }));
    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, c.width, c.height);
      nodes.forEach(n => {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > c.width) n.vx *= -1;
        if (n.y < 0 || n.y > c.height) n.vy *= -1;
      });
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 110) {
            ctx.strokeStyle = `rgba(0,212,255,${.12 * (1 - d / 110)})`;
            ctx.lineWidth = .5; ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y); ctx.lineTo(nodes[j].x, nodes[j].y); ctx.stroke();
          }
        }
        ctx.fillStyle = "rgba(0,212,255,.45)"; ctx.beginPath();
        ctx.arc(nodes[i].x, nodes[i].y, nodes[i].r, 0, Math.PI * 2); ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    const r = () => { c.width = window.innerWidth; c.height = window.innerHeight; };
    window.addEventListener("resize", r);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", r); };
  }, []);
  return <div className="neural-bg"><canvas ref={ref} style={{ opacity: .25 }} /></div>;
};

/* ═══════════════════════════════════════════════
   DATA / CONSTANTS (Imported from ./constants)
═══════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════
   api emotion model local fer2013
═══════════════════════════════════════════════ */
const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";

async function analyzeFrameWithAI(base64Frame, sessionId) {
  const token = localStorage.getItem("emotilearn_token");
  const headers = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}/api/emotion/predict`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      frame: base64Frame,
      session_id: sessionId
    })
  });
  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || `Backend returned status ${response.status}`);
  }
  const data = await response.json();
  return {
    detected_face: (data.face_count || 0) > 0,
    face_box: data.face_box,
    emotion: data.emotion,
    confidence: data.confidence,
    all_probs: data.all_probs,
    facial_cues: ["CNN model analyzing face", "FER2013 trained detector"],
    adaptive_tip: data.message || "Adapting content to your emotion..."
  };
}
/* ═══════════════════════════════════════════════
   AUTH SCREEN
═══════════════════════════════════════════════ */
const AuthScreen = ({ onLogin }) => {
  const [mode, setMode] = useState("login");
  const [f, setF] = useState({ name:"", email:"", password:"", role:"student" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (customPayload) => {
    setError("");
    setLoading(true);
    const payload = customPayload || f;
    const endpoint = mode === "register" ? "/api/auth/register" : "/api/auth/login";
    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Authentication failed");
      }
      onLogin(data.user, data.token);
    } catch (err) {
      setError(err.message || "Failed to authenticate with server");
    } finally {
      setLoading(false);
    }
  };

  const loginAsDemo = (role) => {
    const isStudent = role === "student";
    submit({
      email: isStudent ? "student@emotilearn.ai" : "admin@emotilearn.ai",
      password: "password123",
      name: isStudent ? "Alex Chen" : "Dr. Sarah Kim",
      role: role
    });
  };

  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", position:"relative", zIndex:10 }}>
      <div style={{ width:"100%", maxWidth:420, padding:"0 20px" }}>
        <div style={{ textAlign:"center", marginBottom:36 }}>
          <div className="float-a" style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", width:68, height:68, borderRadius:"18px", background:"linear-gradient(135deg,rgba(0,212,255,.2),rgba(0,255,136,.1))", border:"1px solid rgba(0,212,255,.3)", marginBottom:18, fontSize:30 }}>🧠</div>
          <h1 style={{ fontFamily:"var(--fd)", fontSize:20, fontWeight:900, letterSpacing:3, color:"var(--blue)", marginBottom:4 }}>EMOTILEARN</h1>
          <p style={{ color:"var(--tx3)", fontSize:11, letterSpacing:2 }}>AI-POWERED ADAPTIVE LEARNING PLATFORM</p>
        </div>

        <div className="card" style={{ padding:32 }}>
          <div className="tab-bar" style={{ marginBottom:24 }}>
            {["login","register"].map(m => (
              <div key={m} className={`tab-i ${mode===m?"act":""}`} style={{ flex:1, textAlign:"center", textTransform:"capitalize" }} onClick={() => { setMode(m); setError(""); }}>
                {m==="login"?"Sign In":"Register"}
              </div>
            ))}
          </div>

          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            {error && (
              <div style={{ color:"var(--red)", fontSize:12, padding:"9px 12px", background:"rgba(255,51,102,.1)", borderRadius:8, border:"1px solid rgba(255,51,102,.3)" }}>
                {error}
              </div>
            )}
            {mode==="register" && (
              <div>
                <label style={{ fontSize:11, color:"var(--tx3)", fontWeight:700, letterSpacing:1, textTransform:"uppercase", display:"block", marginBottom:6 }}>Full Name</label>
                <input className="inp" placeholder="Your name" value={f.name} onChange={e=>setF({...f,name:e.target.value})} />
              </div>
            )}
            <div>
              <label style={{ fontSize:11, color:"var(--tx3)", fontWeight:700, letterSpacing:1, textTransform:"uppercase", display:"block", marginBottom:6 }}>Email</label>
              <input className="inp" type="email" placeholder="you@example.com" value={f.email} onChange={e=>setF({...f,email:e.target.value})} />
            </div>
            <div>
              <label style={{ fontSize:11, color:"var(--tx3)", fontWeight:700, letterSpacing:1, textTransform:"uppercase", display:"block", marginBottom:6 }}>Password</label>
              <input className="inp" type="password" placeholder="••••••••" value={f.password} onChange={e=>setF({...f,password:e.target.value})} />
            </div>
            {mode==="register" && (
              <div>
                <label style={{ fontSize:11, color:"var(--tx3)", fontWeight:700, letterSpacing:1, textTransform:"uppercase", display:"block", marginBottom:6 }}>Role</label>
                <select className="inp" value={f.role} onChange={e=>setF({...f,role:e.target.value})} style={{ cursor:"pointer" }}>
                  <option value="student">Student</option>
                  <option value="admin">Instructor / Admin</option>
                </select>
              </div>
            )}

            <button className="btn btn-p" onClick={() => submit()} disabled={loading} style={{ width:"100%", padding:"13px", justifyContent:"center", marginTop:6, fontSize:14, letterSpacing:.5 }}>
              {loading
                ? <><span style={{ width:15,height:15,border:"2px solid rgba(255,255,255,.3)",borderTopColor:"#fff",borderRadius:"50%",display:"inline-block" }} className="spin-a" /> Authenticating...</>
                : mode==="login" ? "Sign In →" : "Create Account →"
              }
            </button>
          </div>

          <div style={{ display:"flex", gap:8, justifyContent:"center", marginTop:20 }}>
            {[{role:"student",label:"Demo Student"},{role:"admin",label:"Demo Admin"}].map(d => (
              <button key={d.role} className="btn btn-g" disabled={loading} onClick={() => loginAsDemo(d.role)}>
                {d.label}
              </button>
            ))}
          </div>
        </div>

        <p style={{ textAlign:"center", color:"var(--tx3)", fontSize:11, marginTop:16, letterSpacing:.5 }}>
          🔒 JWT Auth · AES-256 · MongoDB Atlas
        </p>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════
   SIDEBAR
═══════════════════════════════════════════════ */
const Sidebar = ({ user, page, setPage, onLogout }) => {
  const nav = user.role==="admin"
    ? [["dashboard","dashboard","Dashboard"],["analytics","analytics","Analytics"],["admin","admin","Student Monitor"],["settings","settings","Settings"]]
    : [["dashboard","dashboard","Dashboard"],["learn","learn","My Courses"],["emotion","emotion","Emotion Studio"],["analytics","analytics","Progress"],["settings","settings","Settings"]];

  return (
    <div className="sidebar">
      <div style={{ padding:"22px 18px", borderBottom:"1px solid var(--bdr)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:9 }}>
          <div style={{ width:34,height:34,borderRadius:9,background:"linear-gradient(135deg,rgba(0,212,255,.3),rgba(0,255,136,.1))",border:"1px solid rgba(0,212,255,.4)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:17 }}>🧠</div>
          <div>
            <div style={{ fontFamily:"var(--fd)", fontSize:11, fontWeight:700, color:"var(--blue)", letterSpacing:2.5 }}>EMOTILEARN</div>
            <div style={{ fontSize:9, color:"var(--tx3)", letterSpacing:1.5 }}>{user.role==="admin"?"INSTRUCTOR":"LEARNER"}</div>
          </div>
        </div>
      </div>

      <div style={{ padding:"14px 18px", borderBottom:"1px solid var(--bdr)", display:"flex", alignItems:"center", gap:9 }}>
        <div className="av" style={{ background:"linear-gradient(135deg,#00d4ff,#00ff88)", color:"#040d1a" }}>{user.name.charAt(0)}</div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:13, fontWeight:600, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{user.name}</div>
          <div style={{ fontSize:10, color:"var(--tx3)" }}>{user.role==="admin"?"Administrator":"Level 7 Learner"}</div>
        </div>
        <div style={{ width:7,height:7,borderRadius:"50%",background:"var(--green)",boxShadow:"0 0 8px rgba(0,255,136,.6)",flexShrink:0 }} />
      </div>

      <nav style={{ flex:1, padding:"10px 0" }}>
        {nav.map(([id,icon,label]) => (
          <div key={id} className={`nav-i ${page===id?"act":""}`} onClick={() => setPage(id)}>
            {ICON[icon]}<span>{label}</span>
          </div>
        ))}
      </nav>

      <div style={{ padding:"10px 0", borderTop:"1px solid var(--bdr)" }}>
        {user.role==="student" && (
          <div style={{ margin:"6px 10px 14px", padding:"12px 14px", background:"rgba(0,255,136,.06)", borderRadius:12, border:"1px solid rgba(0,255,136,.15)" }}>
            <div style={{ fontSize:10, color:"var(--green)", fontWeight:700, letterSpacing:1.5, marginBottom:5 }}>🏆 STREAK</div>
            <div style={{ fontFamily:"var(--fd)", fontSize:22, color:"var(--tx)", fontWeight:700 }}>14 <span style={{ fontSize:11, color:"var(--tx3)", fontFamily:"var(--fb)", fontWeight:400 }}>days</span></div>
            <div className="pbar" style={{ marginTop:5 }}><div className="pfill" style={{ width:"70%", background:"linear-gradient(90deg,var(--green),#00d4ff)" }} /></div>
          </div>
        )}
        <div className="nav-i" onClick={onLogout}>{ICON.logout}<span>Sign Out</span></div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════
   TOPBAR
═══════════════════════════════════════════════ */
const Topbar = ({ title, sub, emotion }) => {
  const [t, setT] = useState(new Date());
  useEffect(() => { const id=setInterval(()=>setT(new Date()),1000); return()=>clearInterval(id); }, []);
  const em = emotion ? EM[emotion] : null;
  return (
    <div style={{ height:64,background:"rgba(7,20,40,.96)",borderBottom:"1px solid var(--bdr)",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 26px",backdropFilter:"blur(20px)",position:"sticky",top:0,zIndex:50 }}>
      <div>
        <h2 style={{ fontFamily:"var(--fd)", fontSize:14, fontWeight:700, letterSpacing:1 }}>{title}</h2>
        {sub && <p style={{ fontSize:11, color:"var(--tx3)", marginTop:1 }}>{sub}</p>}
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:14 }}>
        {em && (
          <div style={{ display:"flex", alignItems:"center", gap:7, padding:"5px 13px", background:"rgba(0,212,255,.08)", borderRadius:20, border:"1px solid rgba(0,212,255,.2)" }}>
            <span style={{ fontSize:15 }}>{em.emoji}</span>
            <span style={{ fontSize:11, color:em.color, fontWeight:700, letterSpacing:.5 }}>{em.label}</span>
            <span className="blink-a" style={{ width:6,height:6,borderRadius:"50%",background:em.color }} />
          </div>
        )}
        <div style={{ fontFamily:"var(--fm)", fontSize:12, color:"var(--tx2)", padding:"5px 12px", background:"rgba(255,255,255,.04)", borderRadius:8, border:"1px solid var(--bdr)" }}>
          {t.toLocaleTimeString()}
        </div>
        <div style={{ position:"relative", cursor:"pointer", color:"var(--tx2)" }}>
          {ICON.bell}
          <div style={{ position:"absolute", top:-3, right:-3, width:7, height:7, borderRadius:"50%", background:"var(--red)" }} />
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════
   REAL ML EMOTION STUDIO — Heart of the project
═══════════════════════════════════════════════ */
const EmotionStudio = ({ emotion, setEmotion }) => {
  const videoRef    = useRef(null);
  const canvasRef   = useRef(null);
  const intervalRef = useRef(null);
  const timeoutRef  = useRef(null);
  const streamRef   = useRef(null);

  const [active,     setActive]     = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [result,     setResult]     = useState(null);
  const [history,    setHistory]    = useState([]);
  const [mlLogs,     setMlLogs]     = useState([]);
  const [faceBox,    setFaceBox]    = useState(null);
  const [apiStatus,  setApiStatus]  = useState("idle"); // idle | detecting | error
  const [frameCount, setFrameCount] = useState(0);
  const [camError,   setCamError]   = useState("");

  const em = EM[emotion];
  // Unique session ID per studio mount — avoids all logs sharing "session_001"
  const sessionId = useMemo(() => crypto.randomUUID(), []);

  const captureFrame = useCallback(() => {
    const video  = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) return null;
    const w = video.videoWidth  || 640;
    const h = video.videoHeight || 480;
    canvas.width  = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, w, h);
    return canvas.toDataURL("image/jpeg", 0.7);
  }, []);

  const runDetection = useCallback(async () => {
    const frameB64 = captureFrame();
    if (!frameB64) return;

    setApiStatus("detecting");
    setFrameCount(n => n + 1);

    const t0 = performance.now();
    try {
      const res = await analyzeFrameWithAI(frameB64, sessionId);
      const latency = Math.round(performance.now() - t0);

      if (res.detected_face) {
        setEmotion(res.emotion);
        setResult(res);
        if (res.face_box && videoRef.current) {
          const [fx, fy, fw, fh] = res.face_box;
          const vw = videoRef.current.videoWidth || 640;
          const vh = videoRef.current.videoHeight || 480;
          // <video> is mirrored with transform: scaleX(-1), so flip x in display space
          const leftPct = Math.max(0, Math.min(100, ((vw - fx - fw) / vw) * 100));
          const topPct = Math.max(0, Math.min(100, (fy / vh) * 100));
          const widthPct = Math.max(4, Math.min(100, (fw / vw) * 100));
          const heightPct = Math.max(4, Math.min(100, (fh / vh) * 100));
          setFaceBox({
            top: `${topPct.toFixed(1)}%`,
            left: `${leftPct.toFixed(1)}%`,
            width: `${widthPct.toFixed(1)}%`,
            height: `${heightPct.toFixed(1)}%`,
          });
        } else {
          setFaceBox({ top:"18%", left:"26%", width:"48%", height:"56%" });
        }

        const entry = {
          emotion:    res.emotion,
          confidence: Math.round(res.confidence * 100),
          facial_cues: res.facial_cues || [],
          tip:        res.adaptive_tip || em.tip,
          time:       new Date().toLocaleTimeString(),
          latency,
        };
        setHistory(h => [entry, ...h].slice(0, 10));
        setMlLogs(l => [`[${entry.time}] CNN → ${res.emotion} (${entry.confidence}%) | ${latency}ms`, ...l].slice(0, 12));
      } else {
        setFaceBox(null);
        setMlLogs(l => [`[${new Date().toLocaleTimeString()}] No face detected`, ...l].slice(0, 12));
      }
      setApiStatus("idle");
    } catch (e) {
      setApiStatus("error");
      const errMsg = e.message.includes("Failed to fetch")
        ? "Backend offline! Start Flask on port 5000"
        : e.message;
      setMlLogs(l => [`[ERR] ${errMsg}`, ...l].slice(0, 12));
    }
  }, [captureFrame, setEmotion, em.tip, sessionId]);

  const startSession = async () => {
    setLoading(true);
    setCamError("");
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video:{ width:640, height:480 } });
      streamRef.current = s;
      if (videoRef.current) {
        videoRef.current.srcObject = s;
      }
      setActive(true);
      setLoading(false);

      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);

      // Start detection after camera activates, repeat every 3s
      timeoutRef.current = setTimeout(() => {
        runDetection();
        intervalRef.current = setInterval(runDetection, 3000);
      }, 1000);
    } catch (err) {
      setLoading(false);
      setActive(false);
      const msg = err.name === "NotAllowedError" || err.name === "PermissionDeniedError"
        ? "Camera permission denied. Please allow camera access in your browser."
        : "Webcam not detected or unavailable.";
      setCamError(msg);
      setMlLogs(l => [`[CAMERA] ❌ ${msg}`, ...l].slice(0, 12));
    }
  };

  const stopSession = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setActive(false);
    setFaceBox(null);
    setApiStatus("idle");
  };

  // Only cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
    };
  }, []);

  const allProbs = result?.all_probs || {};

  return (
    <div style={{ padding:26 }}>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:22 }}>

        {/* ── LEFT: Camera + logs */}
        <div>
          {/* Camera */}
          <div style={{ position:"relative", borderRadius:14, overflow:"hidden", border:`2px solid ${active ? em.color+"60" : "var(--bdr)"}`, background:"#000", aspectRatio:"4/3", transition:"border-color .5s" }}>
            <video ref={videoRef} autoPlay muted playsInline style={{ width:"100%", height:"100%", objectFit:"cover", transform:"scaleX(-1)", display:active?"block":"none" }} />
            <canvas ref={canvasRef} style={{ display:"none" }} />

            {!active && (
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:"100%", gap:14, padding:20, textAlign:"center" }}>
                <div style={{ width:72,height:72,borderRadius:"50%",background:"rgba(0,212,255,.08)",border:"2px dashed rgba(0,212,255,.25)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28 }}>📷</div>
                <p style={{ color:"var(--tx3)", fontSize:13 }}>Start session to enable webcam</p>
                {camError && (
                  <div style={{ color:"var(--red)", fontSize:12, padding:"8px 14px", background:"rgba(255,51,102,.1)", borderRadius:8, border:"1px solid rgba(255,51,102,.3)", maxWidth:320 }}>
                    ⚠️ {camError}
                  </div>
                )}
              </div>
            )}

            {active && (
              <>
                {faceBox && (
                  <div className="face-box" style={{ top:faceBox.top, left:faceBox.left, width:faceBox.width, height:faceBox.height, borderColor:em.color, boxShadow:`0 0 14px ${em.color}50` }} />
                )}
                <div className="scanline" />

                {/* Corner HUD markers */}
                {[{t:10,l:10,bw:"2px 0 0 2px"},{t:10,r:10,bw:"2px 2px 0 0"},{b:10,l:10,bw:"0 0 2px 2px"},{b:10,r:10,bw:"0 2px 2px 0"}].map((c,i)=>(
                  <div key={i} style={{ position:"absolute", width:18,height:18, borderColor:"var(--blue)",borderStyle:"solid",opacity:.6, top:c.t,bottom:c.b,left:c.l,right:c.r, borderWidth:c.bw }} />
                ))}

                {/* Status HUD */}
                <div style={{ position:"absolute", top:10, left:12, display:"flex", alignItems:"center", gap:6 }}>
                  <div style={{ width:7,height:7,borderRadius:"50%",background: apiStatus==="detecting"?"var(--orange)":"var(--green)", boxShadow:`0 0 8px ${apiStatus==="detecting"?"var(--orange)":"var(--green)"}` }} className={apiStatus==="detecting"?"blink-a":""} />
                  <span style={{ fontFamily:"var(--fm)", fontSize:10, color:"var(--green)", letterSpacing:1 }}>
                    {apiStatus==="detecting"?"AI ANALYZING...":"LIVE DETECTION"}
                  </span>
                </div>

                {/* Bottom overlay */}
                <div style={{ position:"absolute", bottom:0, left:0, right:0, background:"linear-gradient(transparent,rgba(0,0,0,.85))", padding:"20px 14px 12px" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end" }}>
                    <div>
                      <div style={{ fontFamily:"var(--fd)", fontSize:18, color:em.color, fontWeight:700, letterSpacing:1 }}>
                        {em.emoji} {em.label.toUpperCase()}
                      </div>
                      {result?.facial_cues?.map((cue,i) => (
                        <div key={i} style={{ fontSize:10, color:"rgba(255,255,255,.55)", fontFamily:"var(--fm)", marginTop:2 }}>▸ {cue}</div>
                      ))}
                    </div>
                    <div style={{ textAlign:"right" }}>
                      <div style={{ fontSize:10, color:"var(--tx3)", fontFamily:"var(--fm)", letterSpacing:1 }}>CONFIDENCE</div>
                      <div style={{ fontFamily:"var(--fd)", fontSize:26, color:"var(--blue)", fontWeight:700 }}>
                        {result ? Math.round(result.confidence*100) : "--"}%
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Controls */}
          <div style={{ display:"flex", gap:10, marginTop:14 }}>
            {!active
              ? <button className="btn btn-p" onClick={startSession} disabled={loading} style={{ flex:1, justifyContent:"center" }}>
                  {loading ? <><span className="spin-a" style={{ width:14,height:14,border:"2px solid rgba(255,255,255,.3)",borderTopColor:"#fff",borderRadius:"50%" }} />Starting...</> : <>{ICON.camera} Start Real-Time Detection</>}
                </button>
              : <>
                  <button className="btn btn-p" onClick={runDetection} disabled={apiStatus==="detecting"} style={{ flex:1, justifyContent:"center" }}>
                    {apiStatus==="detecting" ? "Analyzing..." : "⚡ Detect Now"}
                  </button>
                  <button className="btn btn-g" onClick={stopSession} style={{ flex:1, justifyContent:"center" }}>⏹ Stop Session</button>
                </>
            }
          </div>

          {/* Frames processed */}
          {active && (
            <div style={{ marginTop:10, padding:"10px 14px", background:"rgba(0,212,255,.05)", borderRadius:10, border:"1px solid rgba(0,212,255,.15)", display:"flex", justifyContent:"space-between", fontSize:12, fontFamily:"var(--fm)" }}>
              <span style={{ color:"var(--tx3)" }}>Frames Analyzed</span>
              <span style={{ color:"var(--blue)", fontWeight:600 }}>{frameCount}</span>
            </div>
          )}

          {/* ML API Console Logs */}
          <div className="card" style={{ marginTop:14, padding:"16px 18px" }}>
            <div className="sec" style={{ marginBottom:10, display:"flex", alignItems:"center", gap:8 }}>
              {ICON.brain} ML INFERENCE LOG
            </div>
            {mlLogs.length === 0
              ? <p style={{ color:"var(--tx3)", fontSize:12, fontFamily:"var(--fm)" }}>Waiting for detection...</p>
              : <div className="ml-log">
                  {mlLogs.map((log,i) => (
                    <div key={i} className="ml-entry" style={{ color: log.startsWith("[ERR]") ? "var(--red)" : i===0 ? "var(--green)" : "var(--tx3)", opacity: 1-(i*0.08) }}>
                      {log}
                    </div>
                  ))}
                </div>
            }
          </div>
        </div>

        {/* ── RIGHT: AI Result Dashboard */}
        <div style={{ display:"flex", flexDirection:"column", gap:18 }}>

          {/* Main Emotion Display */}
          <div className="card" style={{ textAlign:"center", padding:"28px 20px", borderColor:`${em.color}40`, background:`linear-gradient(160deg,rgba(4,13,26,.98),${em.color}06)` }}>
            <div className="sec" style={{ marginBottom:16 }}>🧠 REAL-TIME AI PREDICTION</div>
            <div style={{ position:"relative", display:"inline-flex", marginBottom:18 }}>
              <div style={{ width:110,height:110,borderRadius:"50%",background:`radial-gradient(circle,${em.color}1a,transparent)`,border:`3px solid ${em.color}50`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:46,boxShadow:`0 0 28px ${em.color}35` }}>
                {em.emoji}
              </div>
              {active && <div className="ml-pulse" style={{ "--em-color":em.color }} />}
            </div>
            <h2 style={{ fontFamily:"var(--fd)", fontSize:22, fontWeight:700, color:em.color, marginBottom:8, letterSpacing:1 }}>{em.label.toUpperCase()}</h2>
            <p style={{ color:"var(--tx2)", fontSize:13, lineHeight:1.65, marginBottom:20 }}>
              {result?.adaptive_tip || em.tip}
            </p>

            {/* Probability bars — populated by real AI output */}
            <div style={{ display:"flex", flexDirection:"column", gap:8, textAlign:"left" }}>
              {Object.keys(EM).map(k => {
                const prob = allProbs[k] ?? 0;
                const pct  = Math.round(prob * 100);
                return (
                  <div key={k} style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <span style={{ width:20, fontSize:14, flexShrink:0 }}>{EM[k].emoji}</span>
                    <div style={{ flex:1, background:"rgba(255,255,255,.06)", borderRadius:4, height:7, overflow:"hidden" }}>
                      <div className="confidence-bar" style={{ width:`${pct}%`, background:EM[k].color, height:"100%" }} />
                    </div>
                    <span style={{ fontFamily:"var(--fm)", fontSize:11, color:k===emotion?EM[k].color:"var(--tx3)", width:34, textAlign:"right", fontWeight:k===emotion?700:400 }}>{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Facial Cues */}
          {result?.facial_cues?.length > 0 && (
            <div className="card" style={{ padding:"16px 18px" }}>
              <div className="sec" style={{ fontSize:10 }}>FACIAL FEATURE ANALYSIS</div>
              <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
                {result.facial_cues.map((cue,i) => (
                  <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:8, fontSize:13, color:"var(--tx2)", lineHeight:1.5 }}>
                    <span style={{ color:"var(--blue)", fontSize:12, marginTop:1 }}>▸</span>
                    {cue}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Detection History */}
          <div className="card" style={{ padding:"16px 18px", flex:1 }}>
            <div className="sec" style={{ fontSize:10, marginBottom:10 }}>DETECTION HISTORY</div>
            {history.length === 0
              ? <p style={{ color:"var(--tx3)", fontSize:12, padding:"14px 0", textAlign:"center" }}>Start detection to build history...</p>
              : <div style={{ display:"flex", flexDirection:"column", gap:7, maxHeight:220, overflowY:"auto" }}>
                  {history.map((h,i) => (
                    <div key={i} style={{ display:"flex", alignItems:"center", gap:9, padding:"8px 10px", background:"rgba(255,255,255,.03)", borderRadius:8, fontSize:12, opacity:1-(i*.07) }}>
                      <span style={{ fontSize:16 }}>{EM[h.emotion].emoji}</span>
                      <span style={{ flex:1, color:EM[h.emotion].color, fontWeight:600 }}>{EM[h.emotion].label}</span>
                      <span style={{ fontFamily:"var(--fm)", color:"var(--tx3)", fontSize:11 }}>{h.confidence}%</span>
                      <span style={{ fontFamily:"var(--fm)", color:"var(--tx3)", fontSize:10 }}>{h.time}</span>
                      <span style={{ fontFamily:"var(--fm)", color:"rgba(0,212,255,.5)", fontSize:10 }}>{h.latency}ms</span>
                    </div>
                  ))}
                </div>
            }
          </div>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════
   DASHBOARD
═══════════════════════════════════════════════ */
const Dashboard = ({ user, emotion, setPage }) => {
  const em = EM[emotion];
  const stats = user.role==="admin"
    ? [["Active Students","248","👥","#00d4ff","+12"],["Avg Engagement","78%","⚡","#00ff88","+5%"],["Completion","64%","✅","#9d4edd","-2%"],["Courses","18","📚","#ffd60a","+3"]]
    : [["Focus Score","87%","🎯","#00ff88","+14%"],["Lessons Done","48","✅","#00d4ff","+5"],["Study Hours","32h","⏱️","#9d4edd","+3h"],["Avg Score","91%","🏆","#ffd60a","+8%"]];

  return (
    <div style={{ padding:26 }}>
      {/* Banner */}
      <div className="card" style={{ marginBottom:22, padding:"24px 28px", background:"linear-gradient(135deg,rgba(0,20,50,.95),rgba(0,40,80,.8))", borderColor:"rgba(0,212,255,.3)" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:14 }}>
          <div>
            <p style={{ fontSize:11, color:"var(--tx3)", letterSpacing:2, marginBottom:5 }}>GOOD {new Date().getHours()<12?"MORNING":new Date().getHours()<17?"AFTERNOON":"EVENING"}</p>
            <h1 style={{ fontFamily:"var(--fd)", fontSize:22, fontWeight:700, marginBottom:7 }}>{user.name} 👋</h1>
            <p style={{ color:"var(--tx2)", fontSize:13 }}>
              {user.role==="admin" ? "3 students currently need attention." : <>Emotion detected: <span style={{ color:em.color, fontWeight:700 }}>{em.emoji} {em.label}</span> — {em.tip}</>}
            </p>
          </div>
          <div style={{ display:"flex", gap:10 }}>
            {user.role==="student" && <button className="btn btn-p" onClick={()=>setPage("emotion")}>{ICON.camera} Open Studio</button>}
            <button className="btn btn-o" onClick={()=>setPage("analytics")}>View Analytics</button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:22 }}>
        {stats.map(([label,val,icon,col,change],i) => (
          <div className="card" key={i} style={{ padding:"18px 20px" }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
              <span style={{ fontSize:22 }}>{icon}</span>
              <span style={{ fontSize:11, color:col, background:`${col}18`, padding:"2px 8px", borderRadius:20, fontWeight:700 }}>↑ {change}</span>
            </div>
            <div className="stat-v" style={{ fontSize:26, marginBottom:3 }}>{val}</div>
            <div style={{ fontSize:12, color:"var(--tx3)" }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:18 }}>
        {/* Courses */}
        <div className="card">
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
            <div className="sec" style={{ margin:0 }}>ACTIVE COURSES</div>
            <button className="btn btn-g" style={{ padding:"5px 10px", fontSize:11 }} onClick={()=>setPage("learn")}>View All</button>
          </div>
          {COURSES.slice(0,3).map(c => (
            <div key={c.id} style={{ display:"flex", alignItems:"center", gap:12, padding:"11px 12px", background:"rgba(255,255,255,.03)", borderRadius:11, border:"1px solid rgba(255,255,255,.05)", marginBottom:10, cursor:"pointer" }}>
              <div style={{ width:38,height:38,borderRadius:9,background:`${c.color}18`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,border:`1px solid ${c.color}35`,flexShrink:0 }}>{c.icon}</div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:12, fontWeight:600, marginBottom:5, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{c.title}</div>
                <div className="pbar"><div className="pfill" style={{ width:`${c.progress}%`, background:`linear-gradient(90deg,${c.color},${c.color}88)` }} /></div>
              </div>
              <span style={{ fontFamily:"var(--fm)", fontSize:12, color:c.color, fontWeight:700, flexShrink:0 }}>{c.progress}%</span>
            </div>
          ))}
        </div>

        {/* Emotion Pie */}
        <div className="card">
          <div className="sec">EMOTION DISTRIBUTION</div>
          <div style={{ height:175 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart><Pie data={emDist} cx="50%" cy="50%" innerRadius={48} outerRadius={75} paddingAngle={3} dataKey="value">
                {emDist.map((e,i)=><Cell key={i} fill={e.color} opacity={.9}/>)}
              </Pie><Tooltip contentStyle={{ background:"var(--sur2)",border:"1px solid var(--bdr)",borderRadius:8,color:"var(--tx)",fontSize:11 }} /></PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginTop:6 }}>
            {emDist.map(e=>(
              <div key={e.name} style={{ display:"flex", alignItems:"center", gap:5, fontSize:11, color:"var(--tx2)" }}>
                <div style={{ width:7,height:7,borderRadius:2,background:e.color }} />{e.name} {e.value}%
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Weekly chart */}
      <div className="card" style={{ marginTop:18 }}>
        <div className="sec">WEEKLY ENGAGEMENT</div>
        <div style={{ height:190 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weekData}>
              <defs>
                <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#00d4ff" stopOpacity={.3}/><stop offset="95%" stopColor="#00d4ff" stopOpacity={0}/></linearGradient>
                <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#00ff88" stopOpacity={.3}/><stop offset="95%" stopColor="#00ff88" stopOpacity={0}/></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.04)"/>
              <XAxis dataKey="day" tick={{fill:"#4a7fa5",fontSize:11}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:"#4a7fa5",fontSize:11}} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{ background:"var(--sur2)",border:"1px solid var(--bdr)",borderRadius:8,color:"var(--tx)",fontSize:11 }}/>
              <Area type="monotone" dataKey="engagement" stroke="#00d4ff" strokeWidth={2} fill="url(#ag)" name="Engagement"/>
              <Area type="monotone" dataKey="completion" stroke="#00ff88" strokeWidth={2} fill="url(#cg)" name="Completion"/>
              <Area type="monotone" dataKey="score" stroke="#9d4edd" strokeWidth={1.5} fill="none" strokeDasharray="4 4" name="Score"/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════
   LEARN (Adaptive Content Engine)
═══════════════════════════════════════════════ */
const Learn = ({ emotion }) => {
  const em = EM[emotion];
  const lessons = ADAPT_LESSONS[emotion];
  return (
    <div style={{ padding:26 }}>
      {/* Adaptive Banner */}
      <div className="card" style={{ marginBottom:22, borderColor:`${em.color}40`, background:`linear-gradient(135deg,rgba(4,13,26,.97),${em.color}07)`, padding:"18px 22px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
          <div style={{ width:50,height:50,borderRadius:"50%",background:`${em.color}20`,border:`2px solid ${em.color}50`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0 }}>{em.emoji}</div>
          <div>
            <div style={{ fontFamily:"var(--fd)", fontSize:11, color:em.color, letterSpacing:2, marginBottom:3 }}>⚡ ADAPTIVE ENGINE ACTIVE</div>
            <p style={{ fontSize:13, color:"var(--tx2)" }}><strong style={{color:"var(--tx)"}}>Emotion: {em.label}</strong> — {em.tip}</p>
          </div>
          <div style={{ marginLeft:"auto", color:"rgba(0,212,255,.3)" }}>{ICON.brain}</div>
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 300px", gap:22 }}>
        <div>
          <div className="sec">RECOMMENDED FOR {em.label.toUpperCase()}</div>
          <div style={{ display:"flex", flexDirection:"column", gap:12, marginBottom:26 }}>
            {lessons.map((l,i) => (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:14, padding:"18px 20px", background:"var(--sur)", borderRadius:13, border:`1px solid ${i===0?em.color+"50":"var(--bdr)"}`, cursor:"pointer", transition:"all .2s" }}
                onMouseEnter={e=>e.currentTarget.style.borderColor=em.color+"80"}
                onMouseLeave={e=>e.currentTarget.style.borderColor=i===0?em.color+"50":"var(--bdr)"}>
                <div style={{ width:48,height:48,borderRadius:11,background:`${em.color}12`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,border:`1px solid ${em.color}25`,flexShrink:0 }}>{l.icon}</div>
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:4 }}>
                    <span style={{ fontSize:14, fontWeight:600 }}>{l.title}</span>
                    {i===0 && <span style={{ fontSize:9, background:"rgba(0,212,255,.15)", color:"var(--blue)", padding:"2px 7px", borderRadius:9, fontWeight:700, letterSpacing:.5 }}>BEST MATCH</span>}
                  </div>
                  <div style={{ fontSize:11, color:"var(--tx3)", display:"flex", gap:12 }}>
                    <span>📁 {l.type}</span><span>⏱ {l.time}</span><span>{"⭐".repeat(l.diff)}{"☆".repeat(5-l.diff)}</span>
                  </div>
                </div>
                <button className="btn btn-p" style={{ padding:"9px 18px", fontSize:12, flexShrink:0 }}>{ICON.play} Start</button>
              </div>
            ))}
          </div>

          {/* All Courses Grid */}
          <div className="sec">ALL COURSES</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:13 }}>
            {COURSES.map(c => (
              <div className="card" key={c.id} style={{ padding:"18px 18px", cursor:"pointer" }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
                  <div style={{ width:40,height:40,borderRadius:10,background:`${c.color}15`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,border:`1px solid ${c.color}30` }}>{c.icon}</div>
                  <span style={{ fontSize:10, color:"var(--tx3)", fontFamily:"var(--fm)" }}>{c.duration}</span>
                </div>
                <div style={{ fontSize:13, fontWeight:600, marginBottom:4, lineHeight:1.4 }}>{c.title}</div>
                <div style={{ fontSize:11, color:"var(--tx3)", marginBottom:10 }}>{c.subject} · {c.lessons} lessons</div>
                <div className="pbar"><div className="pfill" style={{ width:`${c.progress}%`, background:`linear-gradient(90deg,${c.color},${c.color}88)` }} /></div>
                <div style={{ display:"flex", justifyContent:"space-between", marginTop:5, fontSize:10 }}>
                  <span style={{ color:"var(--tx3)" }}>Progress</span>
                  <span style={{ color:c.color, fontWeight:700 }}>{c.progress}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div className="card" style={{ padding:"16px 18px" }}>
            <div className="sec" style={{ fontSize:10 }}>ADAPTIVE PARAMS</div>
            {[
              ["Mode",        em.label,                                                     em.color],
              ["Difficulty",  emotion==="focused"?"Advanced":emotion==="confused"?"Simplified":emotion==="bored"?"Challenging":"Standard", null],
              ["Pace",        emotion==="focused"?"Accelerated":emotion==="confused"?"Slower":"Normal", null],
              ["Media",       emotion==="bored"?"Interactive":emotion==="confused"?"Visual":"Mixed", null],
              ["Hint Level",  emotion==="frustrated"?"Maximum":emotion==="confused"?"High":"Minimal", null],
            ].map(([k,v,col]) => (
              <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"9px 0", borderBottom:"1px solid rgba(255,255,255,.04)", fontSize:13 }}>
                <span style={{ color:"var(--tx3)" }}>{k}</span>
                <span style={{ color:col||"var(--tx)", fontWeight:600 }}>{v}</span>
              </div>
            ))}
          </div>

          <div className="card" style={{ padding:"16px 18px", background:`linear-gradient(135deg,rgba(0,212,255,.07),rgba(0,255,136,.04))`, borderColor:"rgba(0,212,255,.25)" }}>
            <div className="sec" style={{ fontSize:10 }}>🤖 AI TUTOR</div>
            <p style={{ fontSize:13, color:"var(--tx2)", lineHeight:1.65, marginBottom:14 }}>
              {emotion==="confused" && "I see you're finding this challenging. Let me break it down step by step with clearer examples!"}
              {emotion==="bored"    && "You seem ready for more! Want a fun challenge or an advanced topic to explore?"}
              {emotion==="focused"  && "You're in the zone! Perfect time to tackle the most complex material."}
              {emotion==="happy"    && "Great energy! You're learning at an optimal pace — let's keep the momentum going!"}
              {emotion==="frustrated" && "Take a breath — everyone gets stuck. Let's revisit the fundamentals together."}
            </p>
            <button className="btn btn-p" style={{ width:"100%", justifyContent:"center", fontSize:12 }}>💬 Ask AI Tutor</button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════
   ANALYTICS
═══════════════════════════════════════════════ */
const Analytics = () => (
  <div style={{ padding:26 }}>
    <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:22 }}>
      {[["Study Hours","128h","⏱️","#00d4ff"],["Avg Focus","84%","🎯","#00ff88"],["Lessons","198","✅","#9d4edd"],["Certificates","4","🏅","#ffd60a"]].map(([l,v,ic,col],i)=>(
        <div className="card" key={i} style={{ padding:"18px 20px" }}>
          <div style={{ fontSize:20, marginBottom:8 }}>{ic}</div>
          <div style={{ fontFamily:"var(--fd)", fontSize:24, color:col, fontWeight:700, marginBottom:3 }}>{v}</div>
          <div style={{ fontSize:12, fontWeight:600, marginBottom:1 }}>{l}</div>
        </div>
      ))}
    </div>
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:18, marginBottom:18 }}>
      <div className="card">
        <div className="sec">EMOTION OVER SESSION</div>
        <div style={{ height:210 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={[{t:"9:00",f:80,h:65,c:10},{t:"9:15",f:70,h:55,c:20},{t:"9:30",f:55,h:40,c:35},{t:"9:45",f:75,h:70,c:15},{t:"10:00",f:85,h:80,c:5},{t:"10:15",f:60,h:50,c:10},{t:"10:30",f:78,h:72,c:8}]}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.04)"/>
              <XAxis dataKey="t" tick={{fill:"#4a7fa5",fontSize:10}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:"#4a7fa5",fontSize:10}} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{ background:"var(--sur2)",border:"1px solid var(--bdr)",borderRadius:8,color:"var(--tx)",fontSize:11 }}/>
              <Line type="monotone" dataKey="f" stroke="#00ff88" strokeWidth={2} dot={false} name="Focused"/>
              <Line type="monotone" dataKey="h" stroke="#00d4ff" strokeWidth={2} dot={false} name="Happy"/>
              <Line type="monotone" dataKey="c" stroke="#ff8c00" strokeWidth={2} dot={false} strokeDasharray="4 3" name="Confused"/>
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="card">
        <div className="sec">WEEKLY PERFORMANCE</div>
        <div style={{ height:210 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weekData} barSize={16}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.04)"/>
              <XAxis dataKey="day" tick={{fill:"#4a7fa5",fontSize:10}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:"#4a7fa5",fontSize:10}} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{ background:"var(--sur2)",border:"1px solid var(--bdr)",borderRadius:8,color:"var(--tx)",fontSize:11 }}/>
              <Bar dataKey="engagement" fill="#00d4ff" opacity={.8} radius={[3,3,0,0]} name="Engagement"/>
              <Bar dataKey="score" fill="#00ff88" opacity={.8} radius={[3,3,0,0]} name="Score"/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
    <div className="card">
      <div className="sec">COURSE PROGRESS</div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14 }}>
        {COURSES.map(c=>(
          <div key={c.id} style={{ padding:"14px", background:"rgba(255,255,255,.03)", borderRadius:11, border:"1px solid rgba(255,255,255,.05)" }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:9 }}>
              <span style={{ fontSize:17 }}>{c.icon}</span>
              <span style={{ fontFamily:"var(--fd)", fontSize:13, color:c.color, fontWeight:700 }}>{c.progress}%</span>
            </div>
            <div style={{ fontSize:12, fontWeight:600, lineHeight:1.3, marginBottom:8 }}>{c.title}</div>
            <div className="pbar"><div className="pfill" style={{ width:`${c.progress}%`, background:`linear-gradient(90deg,${c.color},${c.color}88)` }} /></div>
            <div style={{ fontSize:10, color:"var(--tx3)", marginTop:5 }}>{Math.round(c.lessons*c.progress/100)}/{c.lessons} lessons</div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

/* ═══════════════════════════════════════════════
   ADMIN
═══════════════════════════════════════════════ */
const Admin = () => {
  const [search, setSearch] = useState("");
  const rows = studentRows.filter(r => r.name.toLowerCase().includes(search.toLowerCase()));
  return (
    <div style={{ padding:26 }}>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:13, marginBottom:22 }}>
        {[["Total Students","248","👥","#00d4ff"],["Online Now","142","🟢","#00ff88"],["Need Help","18","⚠️","#ff8c00"],["Frustrated","7","🚨","#ff3366"],["Avg Score","76%","📊","#9d4edd"]].map(([l,v,ic,col],i)=>(
          <div className="card" key={i} style={{ padding:"15px 16px", borderColor:col+"30" }}>
            <span style={{ fontSize:19 }}>{ic}</span>
            <div style={{ fontFamily:"var(--fd)", fontSize:22, color:col, fontWeight:700, margin:"7px 0 2px" }}>{v}</div>
            <div style={{ fontSize:11, color:"var(--tx3)" }}>{l}</div>
          </div>
        ))}
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:18, marginBottom:18 }}>
        <div className="card">
          <div className="sec">ENGAGEMENT TREND</div>
          <div style={{ height:190 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weekData}>
                <defs><linearGradient id="tg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#00d4ff" stopOpacity={.35}/><stop offset="95%" stopColor="#00d4ff" stopOpacity={0}/></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.04)"/>
                <XAxis dataKey="day" tick={{fill:"#4a7fa5",fontSize:10}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fill:"#4a7fa5",fontSize:10}} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={{ background:"var(--sur2)",border:"1px solid var(--bdr)",borderRadius:8,color:"var(--tx)",fontSize:11 }}/>
                <Area type="monotone" dataKey="engagement" stroke="#00d4ff" strokeWidth={2} fill="url(#tg)" name="Engagement %"/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card">
          <div className="sec">CLASS EMOTION MAP</div>
          <div style={{ height:190 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart><Pie data={emDist} cx="50%" cy="50%" outerRadius={75} paddingAngle={4} dataKey="value" label={({name,value})=>`${name} ${value}%`} labelLine={{stroke:"rgba(255,255,255,.15)"}}>
                {emDist.map((e,i)=><Cell key={i} fill={e.color}/>)}
              </Pie><Tooltip contentStyle={{ background:"var(--sur2)",border:"1px solid var(--bdr)",borderRadius:8,color:"var(--tx)",fontSize:11 }}/></PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <div className="card">
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18, flexWrap:"wrap", gap:10 }}>
          <div className="sec" style={{ margin:0 }}>STUDENT MONITOR</div>
          <input className="inp" placeholder="Search students..." value={search} onChange={e=>setSearch(e.target.value)} style={{ width:220, padding:"8px 13px", fontSize:12 }} />
        </div>
        <div style={{ overflowX:"auto" }}>
          <table className="dt">
            <thead><tr><th>Student</th><th>Emotion</th><th>Status</th><th>Course</th><th>Time</th><th>Score</th><th>Action</th></tr></thead>
            <tbody>
              {rows.map((s,i) => (
                <tr key={i}>
                  <td><div style={{ display:"flex", alignItems:"center", gap:9 }}>
                    <div className="av" style={{ background:`${EM[s.emotion].color}25`, color:EM[s.emotion].color, fontSize:12 }}>{s.name.charAt(0)}</div>
                    <span style={{ color:"var(--tx)", fontWeight:500, fontSize:13 }}>{s.name}</span>
                  </div></td>
                  <td><span className={`badge ${EM[s.emotion].badge}`}>{EM[s.emotion].emoji} {EM[s.emotion].label}</span></td>
                  <td><div style={{ display:"flex", alignItems:"center", gap:5, fontSize:12 }}>
                    <div style={{ width:6,height:6,borderRadius:"50%", background:s.status==="Online"?"var(--green)":s.status==="Away"?"var(--orange)":"var(--tx3)" }} />{s.status}
                  </div></td>
                  <td style={{ fontSize:12 }}>{s.course}</td>
                  <td style={{ fontFamily:"var(--fm)", fontSize:11 }}>{s.time}</td>
                  <td><span style={{ fontFamily:"var(--fm)", color:s.score>=85?"var(--green)":s.score>=65?"var(--blue)":"var(--red)", fontWeight:700, fontSize:13 }}>{s.score}%</span></td>
                  <td>{(s.emotion==="confused"||s.emotion==="frustrated")&&<button className="btn btn-o" style={{ fontSize:11, padding:"5px 11px" }}>Send Help</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════
   SETTINGS
═══════════════════════════════════════════════ */
const Settings = ({ user }) => {
  const [t, setT] = useState({ emotion:true, adaptive:true, notif:true, dark:true, share:false, sound:true });
  const Tog = ({ label, desc, k }) => (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 0", borderBottom:"1px solid rgba(255,255,255,.04)" }}>
      <div>
        <div style={{ fontSize:13, fontWeight:500, marginBottom:1 }}>{label}</div>
        {desc && <div style={{ fontSize:11, color:"var(--tx3)" }}>{desc}</div>}
      </div>
      <div className={`toggle ${t[k]?"on":""}`} onClick={()=>setT(p=>({...p,[k]:!p[k]}))}>
        <div className="tthumb"/>
      </div>
    </div>
  );
  return (
    <div style={{ padding:26, maxWidth:760 }}>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:18 }}>
        <div className="card">
          <div className="sec">PROFILE</div>
          <div style={{ display:"flex", flexDirection:"column", gap:13 }}>
            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:4 }}>
              <div className="av" style={{ width:50,height:50,fontSize:20,background:"linear-gradient(135deg,#00d4ff,#00ff88)",color:"#040d1a" }}>{user.name.charAt(0)}</div>
              <div>
                <div style={{ fontSize:14, fontWeight:600 }}>{user.name}</div>
                <div style={{ fontSize:11, color:"var(--tx3)" }}>{user.role==="admin"?"Instructor":"Student"} · Level 7</div>
              </div>
            </div>
            <div><label style={{ fontSize:10, color:"var(--tx3)", fontWeight:700, letterSpacing:1, textTransform:"uppercase", display:"block", marginBottom:5 }}>Display Name</label><input className="inp" defaultValue={user.name}/></div>
            <div><label style={{ fontSize:10, color:"var(--tx3)", fontWeight:700, letterSpacing:1, textTransform:"uppercase", display:"block", marginBottom:5 }}>Email</label><input className="inp" defaultValue="alex@emotilearn.ai"/></div>
            <button className="btn btn-p" style={{ justifyContent:"center" }}>Save Changes</button>
          </div>
        </div>
        <div className="card">
          <div className="sec">PREFERENCES</div>
          <Tog label="Emotion Detection" desc="Webcam-based real-time analysis" k="emotion"/>
          <Tog label="Adaptive Content"  desc="Auto-adjust lessons to emotion"  k="adaptive"/>
          <Tog label="Notifications"     desc="Assignment push alerts"           k="notif"/>
          <Tog label="Dark Mode"         desc="Eye-friendly interface"           k="dark"/>
          <Tog label="Analytics Sharing" desc="Share data for research"          k="share"/>
          <Tog label="Sound Effects"     desc="Audio feedback"                   k="sound"/>
        </div>
        <div className="card">
          <div className="sec">SYSTEM</div>
          {[["Version","v2.4.1"],["ML Model","EmotionNet CNN v3"],["Dataset","FER2013 (35k imgs)"],["Accuracy","94.2% test acc"],["Backend","Node.js + Flask"],["Database","MongoDB Atlas"],["API Status","✅ Online"]].map(([k,v])=>(
            <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"9px 0", borderBottom:"1px solid rgba(255,255,255,.04)", fontSize:12 }}>
              <span style={{ color:"var(--tx3)" }}>{k}</span>
              <span style={{ fontFamily:"var(--fm)", fontSize:11 }}>{v}</span>
            </div>
          ))}
        </div>
        <div className="card">
          <div className="sec">SECURITY</div>
          {["🔑 Change Password","🔐 Enable 2FA","📱 Manage Sessions","📊 Download My Data"].map(l=>(
            <button key={l} className="btn btn-g" style={{ width:"100%", justifyContent:"space-between", padding:"11px 14px", marginBottom:8, fontSize:12 }}>
              <span>{l}</span><span style={{ color:"var(--blue)" }}>→</span>
            </button>
          ))}
          <div style={{ padding:"11px 14px", background:"rgba(255,51,102,.06)", borderRadius:9, border:"1px solid rgba(255,51,102,.15)", marginTop:4 }}>
            <button style={{ color:"var(--red)", background:"transparent", border:"none", cursor:"pointer", fontSize:12, width:"100%", textAlign:"left" }}>🗑️ Delete Account</button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════
   ROOT APP
═══════════════════════════════════════════════ */
export default function App() {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("emotilearn_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [page,    setPage]    = useState("dashboard");
  const [emotion, setEmotion] = useState("focused");
  const [toast,   setToast]   = useState(null);

  const showToast = useCallback((msg, col="#00d4ff") => {
    setToast({ msg, col });
    setTimeout(() => setToast(null), 3000);
  }, []);

  useEffect(() => {
    if (user) showToast(`Welcome, ${user.name}! 🎉`);
  }, [user, showToast]);

  const handleLogin = (u, token) => {
    if (token) localStorage.setItem("emotilearn_token", token);
    localStorage.setItem("emotilearn_user", JSON.stringify(u));
    setUser(u);
    setPage("dashboard");
  };

  const handleLogout = () => {
    localStorage.removeItem("emotilearn_user");
    localStorage.removeItem("emotilearn_token");
    setUser(null);
    setPage("dashboard");
  };

  const PAGE = {
    dashboard: ["Dashboard",    "Overview of your learning journey"],
    learn:     ["My Courses",   "Adaptive content — powered by real emotion AI"],
    emotion:   ["Emotion Studio","Real-time CNN-based facial emotion detection"],
    analytics: ["Analytics",    "Learning progress & insights"],
    admin:     ["Student Monitor","Real-time classroom emotion overview"],
    settings:  ["Settings",     "Customise your EmotiLearn experience"],
  };

  return (
    <>
      <G />
      <div style={{ position:"relative" }}>
        <NeuralBG />
        {!user
          ? <AuthScreen onLogin={handleLogin} />
          : (
            <div style={{ display:"flex", position:"relative", zIndex:10 }}>
              <Sidebar user={user} page={page} setPage={setPage} onLogout={handleLogout} />
              <div style={{ marginLeft:232, flex:1, minHeight:"100vh" }}>
                <Topbar title={PAGE[page]?.[0]} sub={PAGE[page]?.[1]} emotion={user.role==="student"?emotion:null} />
                <main>
                  {page==="dashboard" && <Dashboard user={user} emotion={emotion} setPage={setPage} />}
                  {page==="learn"     && <Learn emotion={emotion} />}
                  {page==="emotion"   && <EmotionStudio emotion={emotion} setEmotion={setEmotion} />}
                  {page==="analytics" && <Analytics />}
                  {page==="admin"     && <Admin />}
                  {page==="settings"  && <Settings user={user} />}
                </main>
              </div>
            </div>
          )
        }
        {toast && (
          <div className="toast">
            <span style={{ fontSize:17 }}>✅</span>
            <span style={{ color:"var(--tx)" }}>{toast.msg}</span>
          </div>
        )}
      </div>
    </>
  );
}
