import { useState, useRef, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

// ── SUPABASE ─────────────────────────────────────────────────────────────────
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_KEY
);

// Simple device ID for identifying the user across devices
function getUserId() {
  let id = localStorage.getItem("br_user_id");
  if (!id) {
    id = "user_" + Math.random().toString(36).slice(2, 11);
    localStorage.setItem("br_user_id", id);
  }
  return id;
}

// ── PROGRAM ───────────────────────────────────────────────────────────────────
const PROGRAM = {
  A: {
    name: "Session A", label: "Lower Strength",
    exercises: [
      { id: "squat", name: "Squat", sets: 4, reps: 5, note: "Heavy but not max" },
      { id: "rdl", name: "Romanian Deadlift", sets: 3, reps: 8, note: "" },
      { id: "goblet", name: "KB Goblet Squat", sets: 3, reps: 12, note: "Slow, pause at bottom" },
      { id: "abwheel", name: "Ab Wheel", sets: 3, reps: 9, note: "" },
      { id: "hillwalk", name: "Driveway Hill Walk", sets: 3, reps: null, note: "KB at chest" },
    ],
  },
  B: {
    name: "Session B", label: "Upper Strength",
    exercises: [
      { id: "bench", name: "Bench Press", sets: 4, reps: 5, note: "" },
      { id: "row", name: "Barbell Row", sets: 4, reps: 6, note: "" },
      { id: "ohp", name: "Overhead Press", sets: 3, reps: 8, note: "" },
      { id: "halo", name: "KB Halo", sets: 3, reps: 10, note: "Each direction" },
      { id: "abwheel2", name: "Ab Wheel", sets: 3, reps: 8, note: "" },
    ],
  },
  C: {
    name: "Session C", label: "Conditioning",
    exercises: [
      { id: "trail", name: "Trail Run", sets: 1, reps: null, note: "20–30 min easy pace" },
      { id: "mobility", name: "Mobility", sets: 1, reps: null, note: "5 min: hip flexors, thoracic, hamstrings" },
    ],
  },
};

const WEEKLY = { Mon: "A", Tue: "C", Wed: "B" };

// ── SPECIALISTS ───────────────────────────────────────────────────────────────
const SPECIALISTS = {
  head: {
    name: "Marcus", title: "Head Coach", avatar: "M",
    personality: `You are Marcus, the Head Coach and performance director. You've worked in elite sport for 20 years. You're calm, authoritative, and integrative. You synthesise all specialist input and give the athlete one clear direction. You don't hedge. Format: brief acknowledgment, then "The panel said:" with 2-3 key insights, then "My call:" with specific recommendation for next 24-48 hours.`,
  },
  strength: {
    name: "Davo", title: "Strength Coach", avatar: "D",
    personality: `You are Davo, strength and conditioning coach. Ex-powerlifter, 15 years coaching. Direct, blunt, occasionally dry. You care about load management and progressive overload. When training data is provided, reference the specific numbers. Progression: add 2.5kg/week if RPE 7-8, hold if RPE 9, drop 10% if missed reps.`,
  },
  diet: {
    name: "Priya", title: "Dietician", avatar: "P",
    personality: `You are Priya, sports dietician. Measured, evidence-based, warm but precise. You connect dots between nutrition and performance. You flag under-fuelling, poor timing, micronutrient gaps without being preachy.`,
  },
  sleep: {
    name: "Jonah", title: "Sleep Coach", avatar: "J",
    personality: `You are Jonah, sleep and recovery specialist. Calm, relentless about patterns. You flag sleep debt, poor quality, downstream effects on training and mood.`,
  },
  running: {
    name: "Kai", title: "Running Coach", avatar: "K",
    personality: `You are Kai, running and conditioning coach. Enthusiastic trail runner, former competitive middle-distance athlete. You geek out on effort zones and terrain.`,
  },
  padel: {
    name: "Sofia", title: "Padel Coach", avatar: "S",
    personality: `You are Sofia, padel coach. 8 years on the European circuit. Competitive, fun, strategic. You flag when they're going into a game under-recovered.`,
  },
  yoga: {
    name: "Ren", title: "Mobility & Yoga", avatar: "R",
    personality: `You are Ren, yoga and mobility specialist. Grounded, never preachy. You believe movement quality underpins everything. You flag tightness, missed mobility work, stress held in the body.`,
  },
  science: {
    name: "Dr. Ellis", title: "Sports Scientist", avatar: "E",
    personality: `You are Dr. Ellis, sports scientist. Precise, analytical, pattern spotter. When training data is provided, analyse load trends, recovery indicators, consistency. Flag overtraining before it happens.`,
  },
};

const SPECIALIST_ORDER = ["strength", "diet", "sleep", "running", "padel", "yoga", "science"];

// ── HELPERS ───────────────────────────────────────────────────────────────────
function getLastWeight(sessions, exerciseId) {
  for (let i = sessions.length - 1; i >= 0; i--) {
    const ex = sessions[i].exercises?.find(e => e.id === exerciseId);
    if (ex?.weight) return ex.weight;
  }
  return "";
}

function buildTrainingContext(sessions) {
  if (!sessions || sessions.length === 0) return "";
  const recent = sessions.slice(-5);
  const lines = recent.map(s => {
    const prog = PROGRAM[s.type];
    const exLines = s.exercises
      ?.filter(e => e.weight || e.rpe)
      .map(e => `${e.name}: ${e.weight ? e.weight + "kg" : "BW"} ${e.sets}x${e.reps || "—"}${e.rpe ? ` RPE ${e.rpe}` : ""}`)
      .join(", ");
    return `[${s.date}] ${prog?.name} (${prog?.label})${exLines ? ": " + exLines : ""}`;
  });
  return `\n\nRecent training data:\n${lines.join("\n")}`;
}

// ── STYLES ────────────────────────────────────────────────────────────────────
const CSS = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #fff; }
  .app { font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif; background: #fff; color: #000; min-height: 100vh; max-width: 720px; margin: 0 auto; }
  .header { padding: 48px 40px 28px; border-bottom: 0.5px solid #e5e5e5; }
  .header-label { font-size: 11px; font-weight: 500; color: #999; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 8px; }
  .header-title { font-size: 36px; font-weight: 300; color: #000; letter-spacing: -0.02em; line-height: 1; }
  .header-sub { font-size: 13px; color: #bbb; margin-top: 6px; }
  .nav { display: flex; border-bottom: 0.5px solid #e5e5e5; padding: 0 40px; }
  .nav-btn { background: none; border: none; border-bottom: 1.5px solid transparent; padding: 14px 0; margin-right: 28px; font-size: 13px; font-weight: 500; color: #bbb; cursor: pointer; letter-spacing: 0.04em; font-family: inherit; transition: color 0.15s, border-color 0.15s; }
  .nav-btn.active { color: #000; border-bottom-color: #000; }
  .content { padding: 36px 40px; }
  .section-label { font-size: 11px; font-weight: 500; color: #bbb; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 14px; }
  .card { background: #fff; border: 0.5px solid #e5e5e5; border-radius: 12px; overflow: hidden; margin-bottom: 8px; transition: border-color 0.15s; }
  .card:hover { border-color: #ccc; }
  .card-header { display: flex; align-items: center; gap: 14px; padding: 16px 20px; cursor: pointer; background: none; border: none; width: 100%; text-align: left; }
  .avatar { width: 36px; height: 36px; border-radius: 50%; background: #f0f0f0; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 600; color: #000; flex-shrink: 0; }
  .card-info { flex: 1; }
  .card-name { font-size: 14px; font-weight: 500; color: #000; font-family: inherit; }
  .card-sub { font-size: 12px; color: #999; margin-top: 1px; font-family: inherit; }
  .chevron { font-size: 11px; color: #ccc; transition: transform 0.2s; }
  .chevron.open { transform: rotate(180deg); }
  .card-body { padding: 14px 20px 18px; border-top: 0.5px solid #f0f0f0; font-size: 14px; color: #555; line-height: 1.7; }
  .marcus-card { background: #000; border-radius: 14px; padding: 26px 28px; margin-bottom: 20px; }
  .marcus-label { font-size: 11px; font-weight: 500; color: #555; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 10px; }
  .marcus-text { font-size: 15px; color: #ddd; line-height: 1.75; }
  .textarea { width: 100%; background: #f9f9f9; border: 0.5px solid #e5e5e5; border-radius: 12px; padding: 18px 22px; color: #000; font-size: 15px; line-height: 1.7; resize: none; font-family: inherit; outline: none; transition: border-color 0.15s, background 0.15s; min-height: 130px; }
  .textarea:focus { border-color: #000; background: #fff; }
  .textarea::placeholder { color: #ccc; }
  .btn-primary { width: 100%; margin-top: 10px; background: #000; color: #fff; border: none; border-radius: 12px; padding: 15px 24px; font-size: 14px; font-weight: 500; cursor: pointer; letter-spacing: 0.04em; font-family: inherit; transition: opacity 0.15s; }
  .btn-primary:disabled { background: #f0f0f0; color: #ccc; cursor: default; }
  .btn-primary:not(:disabled):hover { opacity: 0.8; }
  .loading-row { display: flex; align-items: center; gap: 10px; padding: 14px 0; font-size: 13px; color: #bbb; }
  .loading-dot { width: 6px; height: 6px; border-radius: 50%; background: #000; animation: pulse 1.4s ease-in-out infinite; }
  @keyframes pulse { 0%,100%{opacity:0.2;transform:scale(0.8)} 50%{opacity:1;transform:scale(1)} }
  .quote { font-size: 13px; color: #999; font-style: italic; line-height: 1.6; margin-bottom: 22px; padding-bottom: 22px; border-bottom: 0.5px solid #f0f0f0; }
  .empty { font-size: 14px; color: #ccc; text-align: center; padding: 60px 0; }
  .tag { display: inline-block; background: #f0f0f0; border-radius: 6px; padding: 3px 8px; font-size: 11px; color: #666; font-weight: 500; margin-right: 4px; margin-bottom: 4px; }
  .session-btn { background: #f9f9f9; border: 0.5px solid #e5e5e5; border-radius: 12px; padding: 16px 20px; width: 100%; text-align: left; cursor: pointer; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center; font-family: inherit; transition: border-color 0.15s; }
  .session-btn:hover { border-color: #000; }
  .session-btn.suggested { border-color: #000; background: #fff; }
  .input-row { display: flex; gap: 8px; margin-top: 10px; }
  .input-field { flex: 1; background: #f9f9f9; border: 0.5px solid #e5e5e5; border-radius: 8px; padding: 10px 12px; color: #000; font-size: 14px; outline: none; font-family: inherit; transition: border-color 0.15s; }
  .input-field:focus { border-color: #000; background: #fff; }
  .input-field::placeholder { color: #ccc; }
  .input-sm { width: 70px; flex: none; }
  .ex-card { background: #f9f9f9; border: 0.5px solid #e5e5e5; border-radius: 10px; padding: 14px 16px; margin-bottom: 8px; }
  .ex-name { font-size: 14px; font-weight: 500; color: #000; margin-bottom: 3px; }
  .ex-note { font-size: 12px; color: #bbb; margin-bottom: 10px; }
  .panel-chips { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 36px; }
  .chip { display: flex; align-items: center; gap: 7px; background: #f9f9f9; border: 0.5px solid #e5e5e5; border-radius: 100px; padding: 5px 12px 5px 7px; }
  .chip-avatar { width: 22px; height: 22px; border-radius: 50%; background: #000; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 9px; font-weight: 700; }
  .chip-name { font-size: 12px; color: #666; font-weight: 500; }
  .divider { height: 0.5px; background: #f0f0f0; margin: 24px 0; }
  .stat-row { display: flex; gap: 16px; margin-bottom: 24px; }
  .stat { flex: 1; background: #f9f9f9; border-radius: 10px; padding: 14px 16px; }
  .stat-val { font-size: 22px; font-weight: 300; color: #000; }
  .stat-label { font-size: 11px; color: #bbb; margin-top: 2px; text-transform: uppercase; letter-spacing: 0.08em; }
  .context-banner { background: #f9f9f9; border: 0.5px solid #e5e5e5; border-radius: 10px; padding: 12px 16px; margin-bottom: 20px; font-size: 12px; color: #888; line-height: 1.5; }
  .context-banner strong { color: #555; font-weight: 500; }
  .sync-badge { font-size: 11px; color: #bbb; display: flex; align-items: center; gap: 5px; margin-top: 4px; }
  .sync-dot { width: 5px; height: 5px; border-radius: 50%; background: #22c55e; }
  input:focus, button:focus { outline: none; }
`;

// ── SPECIALIST CARD ───────────────────────────────────────────────────────────
function SpecialistCard({ id, response }) {
  const [open, setOpen] = useState(false);
  const sp = SPECIALISTS[id];
  return (
    <div className="card">
      <button className="card-header" onClick={() => setOpen(o => !o)}>
        <div className="avatar">{sp.avatar}</div>
        <div className="card-info">
          <div className="card-name">{sp.name}</div>
          <div className="card-sub">{sp.title}</div>
        </div>
        <span className={`chevron ${open ? "open" : ""}`}>▾</span>
      </button>
      {open && <div className="card-body">{response}</div>}
    </div>
  );
}

// ── LOG SESSION ───────────────────────────────────────────────────────────────
function LogSession({ sessionType, trainingSessions, onSave, onBack }) {
  const prog = PROGRAM[sessionType];
  const [weights, setWeights] = useState(() => {
    const w = {};
    prog.exercises.forEach(ex => { w[ex.id] = getLastWeight(trainingSessions, ex.id); });
    return w;
  });
  const [rpe, setRpe] = useState({});
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    const session = {
      id: Date.now(),
      date: new Date().toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short" }),
      date_raw: new Date().toISOString(),
      type: sessionType,
      exercises: prog.exercises.map(ex => ({
        id: ex.id, name: ex.name, sets: ex.sets, reps: ex.reps,
        weight: weights[ex.id] || null, rpe: rpe[ex.id] || null,
      })),
    };
    await onSave(session);
    setSaving(false);
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: "#bbb", fontSize: 20, cursor: "pointer", padding: 0 }}>←</button>
        <div>
          <div style={{ fontSize: 11, color: "#999", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 500 }}>{prog.label}</div>
          <div style={{ fontSize: 20, fontWeight: 300 }}>{prog.name}</div>
        </div>
      </div>
      {prog.exercises.map(ex => (
        <div className="ex-card" key={ex.id}>
          <div className="ex-name">{ex.name}</div>
          <div className="ex-note">{ex.sets}×{ex.reps || "—"}{ex.note ? ` · ${ex.note}` : ""}</div>
          {ex.reps && (
            <div className="input-row">
              <input className="input-field" type="number" value={weights[ex.id]} onChange={e => setWeights(w => ({ ...w, [ex.id]: e.target.value }))} placeholder={weights[ex.id] ? `Last: ${weights[ex.id]}kg` : "Weight (kg)"} />
              <input className="input-field input-sm" type="number" min="1" max="10" value={rpe[ex.id] || ""} onChange={e => setRpe(r => ({ ...r, [ex.id]: e.target.value }))} placeholder="RPE" />
            </div>
          )}
        </div>
      ))}
      <button className="btn-primary" onClick={handleSave} disabled={saving} style={{ marginTop: 16 }}>
        {saving ? "Saving…" : "Save Session"}
      </button>
    </div>
  );
}

// ── TRAINING TAB ──────────────────────────────────────────────────────────────
function TrainingTab({ trainingSessions, onLogSession }) {
  const [logging, setLogging] = useState(null);
  const today = new Date().toLocaleDateString("en-AU", { weekday: "long" }).slice(0, 3);
  const suggested = WEEKLY[today] || null;
  const thisWeek = trainingSessions.filter(s => {
    const d = new Date(s.date_raw);
    return (new Date() - d) < 7 * 24 * 60 * 60 * 1000;
  }).length;

  if (logging) {
    return (
      <LogSession
        sessionType={logging}
        trainingSessions={trainingSessions}
        onSave={async session => { await onLogSession(session); setLogging(null); }}
        onBack={() => setLogging(null)}
      />
    );
  }

  return (
    <div>
      <div className="stat-row">
        <div className="stat"><div className="stat-val">{trainingSessions.length}</div><div className="stat-label">Total sessions</div></div>
        <div className="stat"><div className="stat-val">{thisWeek}</div><div className="stat-label">This week</div></div>
      </div>

      {suggested && (
        <>
          <div className="section-label">Today · {today}</div>
          <button className="session-btn suggested" onClick={() => setLogging(suggested)}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{PROGRAM[suggested].name}</div>
              <div style={{ fontSize: 12, color: "#999", marginTop: 2 }}>{PROGRAM[suggested].label}</div>
            </div>
            <span style={{ fontSize: 18, color: "#bbb" }}>→</span>
          </button>
          <div className="divider" />
        </>
      )}

      <div className="section-label">Log a Session</div>
      {Object.entries(PROGRAM).map(([key, prog]) => (
        <button key={key} className="session-btn" onClick={() => setLogging(key)}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>{prog.name}</div>
            <div style={{ fontSize: 12, color: "#999", marginTop: 2 }}>{prog.label}</div>
          </div>
          <span style={{ fontSize: 18, color: "#bbb" }}>→</span>
        </button>
      ))}

      {trainingSessions.length > 0 && (
        <>
          <div className="divider" />
          <div className="section-label">Recent</div>
          {[...trainingSessions].reverse().slice(0, 5).map(s => (
            <div key={s.id} style={{ marginBottom: 8, padding: "12px 16px", background: "#f9f9f9", borderRadius: 10, border: "0.5px solid #e5e5e5" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{PROGRAM[s.type]?.name}</div>
                <div style={{ fontSize: 12, color: "#bbb" }}>{s.date}</div>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap" }}>
                {s.exercises?.filter(e => e.weight).map(e => (
                  <span key={e.id} className="tag">{e.name} {e.weight}kg{e.rpe ? ` · RPE ${e.rpe}` : ""}</span>
                ))}
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

// ── CHECK IN TAB ──────────────────────────────────────────────────────────────
function CheckInTab({ trainingSessions, onSubmit, loading }) {
  const [input, setInput] = useState("");
  const recentTraining = trainingSessions.slice(-3);

  return (
    <div>
      <p style={{ fontSize: 15, color: "#666", lineHeight: 1.7, marginBottom: 24, maxWidth: 520 }}>
        Just talk. Tell the panel how you're going — sleep, food, energy, padel, anything. Your recent training feeds in automatically.
      </p>
      {recentTraining.length > 0 && (
        <div className="context-banner">
          <strong>Panel will also see:</strong> {recentTraining.map(s => `${PROGRAM[s.type]?.name} (${s.date})`).join(", ")}
        </div>
      )}
      <textarea className="textarea" value={input} onChange={e => setInput(e.target.value)} placeholder="How's everything going today…" rows={5} />
      <button className="btn-primary" onClick={() => onSubmit(input)} disabled={loading || !input.trim()}>
        {loading ? "Panel is meeting…" : "Call the Meeting"}
      </button>
      <div className="panel-chips">
        {Object.entries(SPECIALISTS).map(([key, sp]) => (
          <div className="chip" key={key}>
            <div className="chip-avatar">{sp.avatar}</div>
            <span className="chip-name">{sp.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── MEETING TAB ───────────────────────────────────────────────────────────────
function MeetingTab({ meeting, loading, loadingStep }) {
  const bottomRef = useRef(null);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [meeting, loadingStep]);

  if (!meeting && !loading) return <div className="empty">No meeting yet. Check in first.</div>;

  return (
    <div>
      {meeting && (
        <>
          <div style={{ fontSize: 12, color: "#bbb", marginBottom: 20 }}>{meeting.date}</div>
          <div className="quote">"{meeting.input}"</div>
          {meeting.head_coach && (
            <div className="marcus-card">
              <div className="marcus-label">Marcus · Head Coach</div>
              <div className="marcus-text">{meeting.head_coach}</div>
            </div>
          )}
          {loading && (
            <div className="loading-row">
              <div className="loading-dot" />
              <span>{loadingStep}</span>
            </div>
          )}
          {meeting.specialists && Object.keys(meeting.specialists).length > 0 && (
            <>
              <div className="section-label" style={{ marginTop: 20 }}>Panel Input</div>
              {SPECIALIST_ORDER.filter(k => meeting.specialists[k]).map(k => (
                <SpecialistCard key={k} id={k} response={meeting.specialists[k]} />
              ))}
            </>
          )}
        </>
      )}
      <div ref={bottomRef} />
    </div>
  );
}

// ── HISTORY TAB ───────────────────────────────────────────────────────────────
function HistoryTab({ meetings }) {
  if (meetings.length === 0) return <div className="empty">No meetings yet.</div>;
  return (
    <div>
      {[...meetings].reverse().map(m => {
        const [open, setOpen] = useState(false);
        return (
          <div className="card" key={m.id}>
            <button className="card-header" onClick={() => setOpen(o => !o)}>
              <div className="card-info">
                <div style={{ fontSize: 12, color: "#bbb", marginBottom: 2 }}>{m.date}</div>
                <div className="card-name" style={{ fontWeight: 400 }}>{m.input?.slice(0, 65)}{m.input?.length > 65 ? "…" : ""}</div>
              </div>
              <span className={`chevron ${open ? "open" : ""}`}>▾</span>
            </button>
            {open && (
              <div className="card-body">
                <div className="quote">"{m.input}"</div>
                {m.head_coach && (
                  <div className="marcus-card" style={{ marginBottom: 16 }}>
                    <div className="marcus-label">Marcus · Head Coach</div>
                    <div className="marcus-text">{m.head_coach}</div>
                  </div>
                )}
                {m.specialists && SPECIALIST_ORDER.filter(k => m.specialists[k]).map(k => (
                  <SpecialistCard key={k} id={k} response={m.specialists[k]} />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── MAIN APP ──────────────────────────────────────────────────────────────────
export default function App() {
  const userId = getUserId();
  const [trainingSessions, setTrainingSessions] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [view, setView] = useState("checkin");
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [currentMeeting, setCurrentMeeting] = useState(null);
  const [syncing, setSyncing] = useState(true);

  // Load data from Supabase on mount
  useEffect(() => {
    async function loadData() {
      setSyncing(true);
      const [{ data: sessions }, { data: meets }] = await Promise.all([
        supabase.from("sessions").select("*").eq("user_id", userId).order("date_raw", { ascending: true }),
        supabase.from("meetings").select("*").eq("user_id", userId).order("created_at", { ascending: true }),
      ]);
      if (sessions) setTrainingSessions(sessions);
      if (meets) setMeetings(meets);
      setSyncing(false);
    }
    loadData();
  }, []);

  async function handleLogSession(session) {
    const row = { id: session.id, user_id: userId, date: session.date, date_raw: session.date_raw, type: session.type, exercises: session.exercises };
    await supabase.from("sessions").insert(row);
    setTrainingSessions(prev => [...prev, row]);
  }

  async function callSpecialist(key, userInput, trainingContext) {
    const sp = SPECIALISTS[key];
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 1000,
        system: `${sp.personality}\n\nYou are one specialist in a performance panel. Respond only from your domain. Be specific and natural. 3-5 sentences. No bullet points.${trainingContext}`,
        messages: [{ role: "user", content: `Athlete check-in: "${userInput}"` }],
      }),
    });
    const data = await res.json();
    return data.content?.find(b => b.type === "text")?.text || "";
  }

  async function callHeadCoach(userInput, specialistResponses, trainingContext) {
    const panel = Object.entries(specialistResponses).map(([key, val]) => `${SPECIALISTS[key].name} (${SPECIALISTS[key].title}): ${val}`).join("\n\n");
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 1000,
        system: `${SPECIALISTS.head.personality}${trainingContext}`,
        messages: [{ role: "user", content: `Athlete check-in: "${userInput}"\n\nPanel input:\n${panel}` }],
      }),
    });
    const data = await res.json();
    return data.content?.find(b => b.type === "text")?.text || "";
  }

  async function runMeeting(userInput) {
    if (!userInput.trim() || loading) return;
    setLoading(true);
    setView("meeting");
    const date = new Date().toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
    const trainingContext = buildTrainingContext(trainingSessions);
    setCurrentMeeting({ input: userInput, specialists: {}, head_coach: null, date });

    const specialistResponses = {};
    for (const key of SPECIALIST_ORDER) {
      setLoadingStep(`${SPECIALISTS[key].name} is reviewing…`);
      try {
        const response = await callSpecialist(key, userInput, trainingContext);
        specialistResponses[key] = response;
        setCurrentMeeting(prev => ({ ...prev, specialists: { ...prev.specialists, [key]: response } }));
      } catch {
        specialistResponses[key] = "Couldn't connect right now.";
      }
    }

    setLoadingStep("Marcus is calling it…");
    let headCoach = "";
    try { headCoach = await callHeadCoach(userInput, specialistResponses, trainingContext); }
    catch { headCoach = "Couldn't reach Marcus right now."; }

    const finalMeeting = { id: Date.now(), user_id: userId, date, input: userInput, specialists: specialistResponses, head_coach: headCoach };
    setCurrentMeeting(finalMeeting);

    await supabase.from("meetings").insert(finalMeeting);
    setMeetings(prev => [...prev, finalMeeting]);
    setLoading(false);
    setLoadingStep("");
  }

  return (
    <>
      <style>{CSS}</style>
      <div className="app">
        <div className="header">
          <div className="header-label">Performance Panel</div>
          <div className="header-title">The Boardroom</div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 6 }}>
            <div className="header-sub">8 specialists · {trainingSessions.length} sessions · {meetings.length} meetings</div>
            {!syncing && <div className="sync-badge"><div className="sync-dot" />Synced</div>}
            {syncing && <div className="sync-badge">Syncing…</div>}
          </div>
        </div>

        <div className="nav">
          {[["checkin", "Check In"], ["meeting", "Meeting"], ["training", "Training"], ["history", "History"]].map(([k, label]) => (
            <button key={k} className={`nav-btn ${view === k ? "active" : ""}`} onClick={() => setView(k)}>{label}</button>
          ))}
        </div>

        <div className="content">
          {view === "checkin" && <CheckInTab trainingSessions={trainingSessions} onSubmit={runMeeting} loading={loading} />}
          {view === "meeting" && <MeetingTab meeting={currentMeeting} loading={loading} loadingStep={loadingStep} />}
          {view === "training" && <TrainingTab trainingSessions={trainingSessions} onLogSession={handleLogSession} />}
          {view === "history" && <HistoryTab meetings={meetings} />}
        </div>
      </div>
    </>
  );
}