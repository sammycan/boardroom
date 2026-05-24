import { useState, useRef, useEffect } from "react";

const SPECIALISTS = {
  head: {
    name: "Marcus",
    title: "Head Coach",
    color: "#000000",
    avatar: "M",
    personality: `You are Marcus, the Head Coach and performance director. You've worked in elite sport for 20 years — rugby, triathlon, now private athlete coaching. You're calm, authoritative, and integrative. You listen to all your specialists, weigh their input, and give the athlete one clear direction. You don't hedge. You're not harsh but you don't sugarcoat either. You speak like someone who's seen it all and still gives a damn. You run the board meeting, synthesise the specialists' input, and deliver the final recommendation. Format: brief acknowledgment of the check-in, then "The panel said:" followed by 2-3 key specialist insights in your own words, then "My call:" with your specific recommendation for the next 24-48 hours.`,
  },
  strength: {
    name: "Davo",
    title: "Strength Coach",
    avatar: "D",
    color: "#111",
    personality: `You are Davo, strength and conditioning coach. Ex-powerlifter, coached athletes for 15 years. You're direct, a little blunt, occasionally dry. You care about load management and progressive overload — you hate junk volume and you hate skipped sessions equally. You speak in plain terms. No fluff. If the numbers are good you say so. If they're skipping too much or overreaching you call it. You look at: training load, weights logged, session RPE, frequency, recovery between sessions.`,
  },
  diet: {
    name: "Priya",
    title: "Dietician",
    avatar: "P",
    color: "#111",
    personality: `You are Priya, sports dietician. You're measured, evidence-based, and quietly passionate about food as fuel. You don't moralize about what people eat — you just connect dots between nutrition and performance. You notice patterns. You're warm but precise. You flag under-fuelling, poor timing, and micronutrient gaps without being preachy. You look at: what they ate, when they ate, energy levels relative to food intake, hydration mentions.`,
  },
  sleep: {
    name: "Jonah",
    title: "Sleep Coach",
    avatar: "J",
    color: "#111",
    personality: `You are Jonah, sleep and recovery specialist. You're calm, almost annoyingly so. You've studied sleep science for a decade and you know that most athletes underestimate how much it affects everything. You're not judgmental about bad nights — life happens — but you're relentless about patterns. You flag sleep debt, poor sleep quality, and the downstream effects on training and mood. You look at: hours slept, sleep quality mentioned, time of training relative to sleep, stress or mental load mentions.`,
  },
  running: {
    name: "Kai",
    title: "Running Coach",
    avatar: "K",
    color: "#111",
    personality: `You are Kai, running and conditioning coach. You're enthusiastic without being annoying about it. Trail runner, former competitive middle-distance athlete. You geek out on effort zones, terrain, and the mental side of running. You encourage the trails and driveway work, help calibrate effort, and push for consistency over intensity. You look at: any running or conditioning logged, effort level, terrain, duration.`,
  },
  padel: {
    name: "Sofia",
    title: "Padel Coach",
    avatar: "S",
    color: "#111",
    personality: `You are Sofia, padel coach. You played on the European circuit for 8 years before coaching. You're competitive, fun, and strategic. You think about padel holistically — not just technique but how physical condition, fatigue, and movement quality affect play. You flag when they're going into a game under-recovered and when they should prioritise padel over a gym session. You look at: any padel mentioned, energy/fatigue state relative to games, movement quality mentions.`,
  },
  yoga: {
    name: "Ren",
    title: "Mobility & Yoga",
    avatar: "R",
    color: "#111",
    personality: `You are Ren, yoga and mobility specialist. You're grounded, a little philosophical, but never preachy. You believe movement quality underpins everything and that most athletes neglect it until something breaks. You're patient. You flag tightness, missed mobility work, and stress held in the body. You gently advocate for the 5-min mobility finishes and rest days. You look at: any mobility or yoga mentioned, stress or tension cues, training density.`,
  },
  science: {
    name: "Dr. Ellis",
    title: "Sports Scientist",
    avatar: "E",
    color: "#111",
    personality: `You are Dr. Ellis, sports scientist. You're precise, analytical, and occasionally nerdy in the best way. You look at patterns across the whole dataset — training load, sleep, nutrition, HRV if available — and identify trends the others might miss. You speak in slightly more technical terms but always translate to practical meaning. You're the one who spots overtraining before it happens, or notices the correlation between bad sleep and poor session RPE. You look at: overall patterns, load trends, recovery indicators, consistency data.`,
  },
};

const SPECIALIST_ORDER = ["strength", "diet", "sleep", "running", "padel", "yoga", "science"];
const STORAGE_KEY = "boardroom_v2_logs";

function loadLogs() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
}
function saveLogs(logs) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(logs)); } catch {}
}

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=SF+Pro+Display:wght@300;400;500;600&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #ffffff; }
  .app {
    font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif;
    background: #ffffff;
    color: #000000;
    min-height: 100vh;
    max-width: 720px;
    margin: 0 auto;
  }
  .header {
    padding: 48px 40px 32px;
    border-bottom: 0.5px solid #e5e5e5;
  }
  .header-label {
    font-size: 11px;
    font-weight: 500;
    color: #999;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    margin-bottom: 8px;
  }
  .header-title {
    font-size: 36px;
    font-weight: 300;
    color: #000;
    letter-spacing: -0.02em;
    line-height: 1;
  }
  .header-sub {
    font-size: 13px;
    color: #bbb;
    margin-top: 6px;
    font-weight: 400;
  }
  .nav {
    display: flex;
    border-bottom: 0.5px solid #e5e5e5;
    padding: 0 40px;
  }
  .nav-btn {
    background: none;
    border: none;
    border-bottom: 1.5px solid transparent;
    padding: 16px 0;
    margin-right: 32px;
    font-size: 13px;
    font-weight: 500;
    color: #bbb;
    cursor: pointer;
    letter-spacing: 0.04em;
    font-family: inherit;
    transition: color 0.15s, border-color 0.15s;
  }
  .nav-btn.active {
    color: #000;
    border-bottom-color: #000;
  }
  .content {
    padding: 40px;
  }
  .section-label {
    font-size: 11px;
    font-weight: 500;
    color: #bbb;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    margin-bottom: 16px;
  }
  .intro-text {
    font-size: 15px;
    color: #666;
    line-height: 1.7;
    margin-bottom: 32px;
    max-width: 520px;
  }
  .example-block {
    background: #f9f9f9;
    border: 0.5px solid #e5e5e5;
    border-radius: 12px;
    padding: 20px 24px;
    margin-bottom: 32px;
    font-size: 13px;
    color: #999;
    line-height: 1.7;
    font-style: italic;
    max-width: 520px;
  }
  .textarea {
    width: 100%;
    background: #f9f9f9;
    border: 0.5px solid #e5e5e5;
    border-radius: 12px;
    padding: 20px 24px;
    color: #000;
    font-size: 15px;
    line-height: 1.7;
    resize: none;
    font-family: inherit;
    outline: none;
    transition: border-color 0.15s;
    min-height: 140px;
  }
  .textarea:focus { border-color: #000; background: #fff; }
  .textarea::placeholder { color: #ccc; }
  .cta-btn {
    width: 100%;
    margin-top: 12px;
    background: #000;
    color: #fff;
    border: none;
    border-radius: 12px;
    padding: 16px 24px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    letter-spacing: 0.04em;
    font-family: inherit;
    transition: opacity 0.15s;
  }
  .cta-btn:disabled { background: #f0f0f0; color: #ccc; cursor: default; }
  .cta-btn:not(:disabled):hover { opacity: 0.8; }
  .panel-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 40px;
  }
  .panel-chip {
    display: flex;
    align-items: center;
    gap: 8px;
    background: #f9f9f9;
    border: 0.5px solid #e5e5e5;
    border-radius: 100px;
    padding: 6px 14px 6px 8px;
  }
  .avatar-sm {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: #000;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    font-weight: 600;
    flex-shrink: 0;
  }
  .chip-name {
    font-size: 12px;
    color: #666;
    font-weight: 500;
  }
  .marcus-card {
    background: #000;
    border-radius: 16px;
    padding: 28px 32px;
    margin-bottom: 24px;
  }
  .marcus-label {
    font-size: 11px;
    font-weight: 500;
    color: #666;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    margin-bottom: 12px;
  }
  .marcus-name {
    font-size: 16px;
    font-weight: 500;
    color: #fff;
    margin-bottom: 16px;
  }
  .marcus-text {
    font-size: 15px;
    color: #ccc;
    line-height: 1.75;
  }
  .specialist-card {
    border: 0.5px solid #e5e5e5;
    border-radius: 12px;
    overflow: hidden;
    margin-bottom: 8px;
    transition: border-color 0.15s;
  }
  .specialist-card:hover { border-color: #ccc; }
  .specialist-header {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 16px 20px;
    cursor: pointer;
    background: #fff;
    border: none;
    width: 100%;
    text-align: left;
  }
  .avatar-md {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: #f0f0f0;
    color: #000;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 600;
    flex-shrink: 0;
  }
  .specialist-info { flex: 1; }
  .specialist-name {
    font-size: 14px;
    font-weight: 500;
    color: #000;
    font-family: inherit;
  }
  .specialist-title {
    font-size: 12px;
    color: #999;
    margin-top: 1px;
    font-family: inherit;
  }
  .chevron {
    font-size: 12px;
    color: #ccc;
    transition: transform 0.2s;
    font-family: inherit;
  }
  .chevron.open { transform: rotate(180deg); }
  .specialist-body {
    padding: 0 20px 20px;
    border-top: 0.5px solid #f0f0f0;
    font-size: 14px;
    color: #555;
    line-height: 1.7;
    padding-top: 16px;
  }
  .checkin-quote {
    font-size: 13px;
    color: #999;
    font-style: italic;
    line-height: 1.6;
    margin-bottom: 24px;
    padding-bottom: 24px;
    border-bottom: 0.5px solid #f0f0f0;
  }
  .loading-row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 16px 0;
    font-size: 13px;
    color: #bbb;
  }
  .loading-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #000;
    animation: pulse 1.4s ease-in-out infinite;
  }
  @keyframes pulse {
    0%, 100% { opacity: 0.2; transform: scale(0.8); }
    50% { opacity: 1; transform: scale(1); }
  }
  .history-item {
    border: 0.5px solid #e5e5e5;
    border-radius: 12px;
    overflow: hidden;
    margin-bottom: 8px;
  }
  .history-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    cursor: pointer;
    background: none;
    border: none;
    width: 100%;
    text-align: left;
  }
  .history-date {
    font-size: 12px;
    color: #999;
    margin-bottom: 3px;
    font-family: inherit;
  }
  .history-preview {
    font-size: 14px;
    color: #000;
    font-family: inherit;
  }
  .history-body {
    padding: 0 20px 20px;
    border-top: 0.5px solid #f0f0f0;
    padding-top: 16px;
  }
  .empty-state {
    font-size: 14px;
    color: #ccc;
    text-align: center;
    padding: 60px 0;
  }
  .meeting-date {
    font-size: 12px;
    color: #bbb;
    margin-bottom: 24px;
    font-weight: 400;
  }
  .no-meeting {
    font-size: 14px;
    color: #ccc;
    text-align: center;
    padding: 80px 0;
  }
  .panel-section-label {
    font-size: 11px;
    font-weight: 500;
    color: #ccc;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    margin-bottom: 12px;
    margin-top: 8px;
  }
  input:focus, button:focus { outline: none; }
`;

function SpecialistCard({ specialist, response, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  const sp = SPECIALISTS[specialist];
  return (
    <div className="specialist-card">
      <button className="specialist-header" onClick={() => setOpen(o => !o)}>
        <div className="avatar-md">{sp.avatar}</div>
        <div className="specialist-info">
          <div className="specialist-name">{sp.name}</div>
          <div className="specialist-title">{sp.title}</div>
        </div>
        <span className={`chevron ${open ? "open" : ""}`}>▾</span>
      </button>
      {open && <div className="specialist-body">{response}</div>}
    </div>
  );
}

function HistoryItem({ log }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="history-item">
      <button className="history-header" onClick={() => setOpen(o => !o)}>
        <div>
          <div className="history-date">{log.date}</div>
          <div className="history-preview">{log.input.slice(0, 70)}{log.input.length > 70 ? "…" : ""}</div>
        </div>
        <span className="chevron" style={{ marginLeft: 12 }}>▾</span>
      </button>
      {open && (
        <div className="history-body">
          <div className="checkin-quote">"{log.input}"</div>
          {log.headCoach && (
            <div className="marcus-card" style={{ marginBottom: 16 }}>
              <div className="marcus-label">Marcus · Head Coach</div>
              <div className="marcus-text">{log.headCoach}</div>
            </div>
          )}
          {log.specialists && SPECIALIST_ORDER.filter(k => log.specialists[k]).map(k => (
            <SpecialistCard key={k} specialist={k} response={log.specialists[k]} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [logs, setLogs] = useState(loadLogs);
  const [view, setView] = useState("checkin");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [currentMeeting, setCurrentMeeting] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentMeeting, loadingStep]);

  async function callSpecialist(key, userInput, recentLogs) {
    const sp = SPECIALISTS[key];
    const history = recentLogs.slice(-5).map(l => `[${l.date}] ${l.input}`).join("\n");
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: `${sp.personality}\n\nYou are one specialist in a panel reviewing this athlete's daily check-in. Respond only from your domain. Be specific, be yourself. 3-5 sentences max. No bullet points — speak naturally.\n\nRecent history:\n${history || "No prior history."}`,
        messages: [{ role: "user", content: `Athlete check-in: "${userInput}"` }],
      }),
    });
    const data = await res.json();
    return data.content?.find(b => b.type === "text")?.text || "";
  }

  async function callHeadCoach(userInput, specialistResponses, recentLogs) {
    const history = recentLogs.slice(-5).map(l => `[${l.date}] ${l.input} → ${l.headCoach || ""}`).join("\n");
    const panel = Object.entries(specialistResponses)
      .map(([key, val]) => `${SPECIALISTS[key].name} (${SPECIALISTS[key].title}): ${val}`)
      .join("\n\n");
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: `${SPECIALISTS.head.personality}\n\nRecent history:\n${history || "No prior history."}`,
        messages: [{ role: "user", content: `Athlete check-in: "${userInput}"\n\nPanel input:\n${panel}` }],
      }),
    });
    const data = await res.json();
    return data.content?.find(b => b.type === "text")?.text || "";
  }

  async function runMeeting() {
    if (!input.trim() || loading) return;
    const userInput = input.trim();
    setInput("");
    setLoading(true);
    setView("meeting");
    const date = new Date().toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
    setCurrentMeeting({ input: userInput, specialists: {}, headCoach: null, date });

    const specialistResponses = {};
    for (const key of SPECIALIST_ORDER) {
      setLoadingStep(`${SPECIALISTS[key].name} is reviewing…`);
      try {
        const response = await callSpecialist(key, userInput, logs);
        specialistResponses[key] = response;
        setCurrentMeeting(prev => ({ ...prev, specialists: { ...prev.specialists, [key]: response } }));
      } catch {
        specialistResponses[key] = "Couldn't connect right now.";
      }
    }

    setLoadingStep("Marcus is calling it…");
    let headCoach = "";
    try { headCoach = await callHeadCoach(userInput, specialistResponses, logs); }
    catch { headCoach = "Couldn't reach Marcus right now."; }

    const finalLog = { id: Date.now(), date, input: userInput, specialists: specialistResponses, headCoach };
    setCurrentMeeting(finalLog);
    const updated = [...logs, finalLog];
    setLogs(updated);
    saveLogs(updated);
    setLoading(false);
    setLoadingStep("");
  }

  return (
    <>
      <style>{styles}</style>
      <div className="app">
        <div className="header">
          <div className="header-label">Performance Panel</div>
          <div className="header-title">The Boardroom</div>
          <div className="header-sub">8 specialists · 1 athlete · {logs.length} session{logs.length !== 1 ? "s" : ""} logged</div>
        </div>

        <div className="nav">
          {[["checkin", "Check In"], ["meeting", "Meeting"], ["history", "History"]].map(([k, label]) => (
            <button key={k} className={`nav-btn ${view === k ? "active" : ""}`} onClick={() => setView(k)}>{label}</button>
          ))}
        </div>

        <div className="content">

          {view === "checkin" && (
            <>
              <p className="intro-text">Just talk. Tell the panel how you're going — sleep, food, energy, training, padel, anything. They'll each take what's relevant.</p>
              <div className="section-label">Example</div>
              <div className="example-block">
                "Slept maybe 5 hours, woke at 3am couldn't get back. Had eggs for breakfast, skipped lunch. Squats this morning felt heavy but got through it — went up 2.5kg. Padel tonight. Feeling a bit flat overall."
              </div>
              <textarea
                className="textarea"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="How's everything going today…"
                rows={5}
              />
              <button className="cta-btn" onClick={runMeeting} disabled={loading || !input.trim()}>
                {loading ? "Panel is meeting…" : "Call the Meeting"}
              </button>

              <div style={{ marginTop: 48 }}>
                <div className="section-label">Your Panel</div>
                <div className="panel-grid">
                  {Object.entries(SPECIALISTS).map(([key, sp]) => (
                    <div className="panel-chip" key={key}>
                      <div className="avatar-sm">{sp.avatar}</div>
                      <span className="chip-name">{sp.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {view === "meeting" && (
            <>
              {!currentMeeting && !loading && (
                <div className="no-meeting">No meeting yet. Check in first.</div>
              )}
              {currentMeeting && (
                <>
                  <div className="meeting-date">{currentMeeting.date}</div>
                  <div className="checkin-quote">"{currentMeeting.input}"</div>

                  {currentMeeting.headCoach && (
                    <div className="marcus-card">
                      <div className="marcus-label">Marcus · Head Coach</div>
                      <div className="marcus-text">{currentMeeting.headCoach}</div>
                    </div>
                  )}

                  {loading && (
                    <div className="loading-row">
                      <div className="loading-dot" />
                      <span>{loadingStep}</span>
                    </div>
                  )}

                  {currentMeeting.specialists && Object.keys(currentMeeting.specialists).length > 0 && (
                    <>
                      <div className="panel-section-label" style={{ marginTop: 24 }}>Panel Input</div>
                      {SPECIALIST_ORDER.filter(k => currentMeeting.specialists[k]).map(k => (
                        <SpecialistCard key={k} specialist={k} response={currentMeeting.specialists[k]} defaultOpen={false} />
                      ))}
                    </>
                  )}
                  <div ref={bottomRef} />
                </>
              )}
            </>
          )}

          {view === "history" && (
            <>
              {logs.length === 0 && <div className="empty-state">No meetings yet.</div>}
              {[...logs].reverse().map(log => <HistoryItem key={log.id} log={log} />)}
            </>
          )}

        </div>
      </div>
    </>
  );
}