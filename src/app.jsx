import { useState, useRef, useEffect } from "react";

const SPECIALISTS = {
  head: {
    name: "Marcus",
    title: "Head Coach",
    short: "HC",
    color: "#c8a96e",
    avatar: "M",
    personality: `You are Marcus, the Head Coach and performance director. You've worked in elite sport for 20 years — rugby, triathlon, now private athlete coaching. You're calm, authoritative, and integrative. You listen to all your specialists, weigh their input, and give the athlete one clear direction. You don't hedge. You're not harsh but you don't sugarcoat either. You speak like someone who's seen it all and still gives a damn. You run the board meeting, synthesise the specialists' input, and deliver the final recommendation. Format: brief acknowledgment of the check-in, then "The panel said:" followed by 2-3 key specialist insights in your own words, then "My call:" with your specific recommendation for the next 24-48 hours.`,
  },
  strength: {
    name: "Davo",
    title: "Strength Coach",
    short: "SC",
    color: "#e84a2e",
    avatar: "D",
    personality: `You are Davo, strength and conditioning coach. Ex-powerlifter, coached athletes for 15 years. You're direct, a little blunt, occasionally dry. You care about load management and progressive overload — you hate junk volume and you hate skipped sessions equally. You speak in plain terms. No fluff. If the numbers are good you say so. If they're skipping too much or overreaching you call it. You look at: training load, weights logged, session RPE, frequency, recovery between sessions.`,
  },
  diet: {
    name: "Priya",
    title: "Dietician",
    short: "RD",
    color: "#2eb87a",
    avatar: "P",
    personality: `You are Priya, sports dietician. You're measured, evidence-based, and quietly passionate about food as fuel. You don't moralize about what people eat — you just connect dots between nutrition and performance. You notice patterns. You're warm but precise. You flag under-fuelling, poor timing, and micronutrient gaps without being preachy. You look at: what they ate, when they ate, energy levels relative to food intake, hydration mentions.`,
  },
  sleep: {
    name: "Jonah",
    title: "Sleep Coach",
    short: "ZZ",
    color: "#6e8ee8",
    avatar: "J",
    personality: `You are Jonah, sleep and recovery specialist. You're calm, almost annoyingly so. You've studied sleep science for a decade and you know that most athletes underestimate how much it affects everything. You're not judgmental about bad nights — life happens — but you're relentless about patterns. You flag sleep debt, poor sleep quality, and the downstream effects on training and mood. You look at: hours slept, sleep quality mentioned, time of training relative to sleep, stress or mental load mentions.`,
  },
  running: {
    name: "Kai",
    title: "Running Coach",
    short: "RC",
    color: "#e8c42e",
    avatar: "K",
    personality: `You are Kai, running and conditioning coach. You're enthusiastic without being annoying about it. Trail runner, former competitive middle-distance athlete. You geek out on effort zones, terrain, and the mental side of running. You encourage the trails and driveway work, help calibrate effort, and push for consistency over intensity. You look at: any running or conditioning logged, effort level, terrain, duration.`,
  },
  padel: {
    name: "Sofia",
    title: "Padel Coach",
    short: "PC",
    color: "#e86eb8",
    avatar: "S",
    personality: `You are Sofia, padel coach. You played on the European circuit for 8 years before coaching. You're competitive, fun, and strategic. You think about padel holistically — not just technique but how physical condition, fatigue, and movement quality affect play. You flag when they're going into a game under-recovered and when they should prioritise padel over a gym session. You look at: any padel mentioned, energy/fatigue state relative to games, movement quality mentions.`,
  },
  yoga: {
    name: "Ren",
    title: "Yoga & Mobility",
    short: "YM",
    color: "#a06ee8",
    avatar: "R",
    personality: `You are Ren, yoga and mobility specialist. You're grounded, a little philosophical, but never preachy. You believe movement quality underpins everything and that most athletes neglect it until something breaks. You're patient. You flag tightness, missed mobility work, and stress held in the body. You gently advocate for the 5-min mobility finishes and rest days. You look at: any mobility or yoga mentioned, stress or tension cues, training density.`,
  },
  science: {
    name: "Dr. Ellis",
    title: "Sports Scientist",
    short: "SS",
    color: "#4ecdc4",
    avatar: "E",
    personality: `You are Dr. Ellis, sports scientist. You're precise, analytical, and occasionally nerdy in the best way. You look at patterns across the whole dataset — training load, sleep, nutrition, HRV if available — and identify trends the others might miss. You speak in slightly more technical terms but always translate to practical meaning. You're the one who spots overtraining before it happens, or notices the correlation between bad sleep and poor session RPE. You look at: overall patterns, load trends, recovery indicators, consistency data.`,
  },
};

const SPECIALIST_ORDER = ["strength", "diet", "sleep", "running", "padel", "yoga", "science"];

const STORAGE_KEY = "boardroom_logs";

function loadLogs() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
}
function saveLogs(logs) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(logs)); } catch {}
}

function MeetingCard({ specialist, response, isNew }) {
  const [expanded, setExpanded] = useState(isNew);
  const sp = SPECIALISTS[specialist];
  return (
    <div
      style={{
        background: "#0a0a0a",
        border: `1px solid ${sp.color}22`,
        borderLeft: `3px solid ${sp.color}`,
        borderRadius: "10px",
        marginBottom: "8px",
        overflow: "hidden",
        animation: isNew ? "slideIn 0.3s ease" : "none",
      }}
    >
      <button
        onClick={() => setExpanded(e => !e)}
        style={{
          width: "100%", background: "none", border: "none", padding: "12px 14px",
          display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", textAlign: "left",
        }}
      >
        <div style={{
          width: "32px", height: "32px", borderRadius: "50%",
          background: `${sp.color}22`, border: `1px solid ${sp.color}44`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "12px", fontWeight: "800", color: sp.color, flexShrink: 0,
        }}>{sp.avatar}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "13px", fontWeight: "700", color: "#e8e8e8" }}>{sp.name}</div>
          <div style={{ fontSize: "10px", color: sp.color, textTransform: "uppercase", letterSpacing: "0.1em" }}>{sp.title}</div>
        </div>
        <div style={{ color: "#333", fontSize: "16px", transform: expanded ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>↓</div>
      </button>
      {expanded && (
        <div style={{ padding: "0 14px 14px", fontSize: "13px", color: "#aaa", lineHeight: "1.6", borderTop: "1px solid #111", paddingTop: "12px" }}>
          {response}
        </div>
      )}
    </div>
  );
}

function LogEntry({ log }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: "10px", marginBottom: "8px", overflow: "hidden" }}>
      <button onClick={() => setOpen(o => !o)} style={{
        width: "100%", background: "none", border: "none", padding: "12px 14px",
        display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer",
      }}>
        <div style={{ textAlign: "left" }}>
          <div style={{ fontSize: "12px", color: "#555", marginBottom: "2px" }}>{log.date}</div>
          <div style={{ fontSize: "13px", color: "#ccc", lineHeight: "1.4" }}>{log.input.slice(0, 60)}{log.input.length > 60 ? "…" : ""}</div>
        </div>
        <div style={{ color: "#333", fontSize: "16px" }}>{open ? "↑" : "↓"}</div>
      </button>
      {open && (
        <div style={{ borderTop: "1px solid #111", padding: "12px 14px" }}>
          <div style={{ fontSize: "12px", color: "#555", marginBottom: "8px", fontStyle: "italic" }}>"{log.input}"</div>
          {log.headCoach && (
            <div style={{ background: `${SPECIALISTS.head.color}11`, border: `1px solid ${SPECIALISTS.head.color}33`, borderRadius: "8px", padding: "10px", marginBottom: "10px" }}>
              <div style={{ fontSize: "10px", color: SPECIALISTS.head.color, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "6px" }}>Marcus · Head Coach</div>
              <div style={{ fontSize: "12px", color: "#bbb", lineHeight: "1.5" }}>{log.headCoach}</div>
            </div>
          )}
          {log.specialists && Object.entries(log.specialists).map(([key, val]) => (
            <MeetingCard key={key} specialist={key} response={val} isNew={false} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [logs, setLogs] = useState(loadLogs);
  const [view, setView] = useState("checkin"); // checkin | meeting | history
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [currentMeeting, setCurrentMeeting] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentMeeting, loading]);

  async function callSpecialist(key, userInput, recentLogs) {
    const sp = SPECIALISTS[key];
    const history = recentLogs.slice(-5).map(l => `[${l.date}] ${l.input}`).join("\n");
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: `${sp.personality}\n\nYou are one of several specialists reviewing this athlete's daily check-in. Respond only from your domain. Be specific, be yourself. 3-5 sentences max. No bullet points — speak naturally.\n\nRecent check-in history:\n${history || "No prior history yet."}`,
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

    const res = await fetch("https://api.anthropic.com/v1/messages", {
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
    setCurrentMeeting({ input: userInput, specialists: {}, headCoach: null, date: new Date().toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) });

    const specialistResponses = {};

    for (const key of SPECIALIST_ORDER) {
      setLoadingStep(`${SPECIALISTS[key].name} is reviewing...`);
      try {
        const response = await callSpecialist(key, userInput, logs);
        specialistResponses[key] = response;
        setCurrentMeeting(prev => ({ ...prev, specialists: { ...prev.specialists, [key]: response } }));
      } catch {
        specialistResponses[key] = "Couldn't connect right now.";
      }
    }

    setLoadingStep("Marcus is calling it...");
    let headCoach = "";
    try {
      headCoach = await callHeadCoach(userInput, specialistResponses, logs);
    } catch {
      headCoach = "Couldn't reach Marcus right now.";
    }

    const finalLog = {
      id: Date.now(),
      date: new Date().toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }),
      input: userInput,
      specialists: specialistResponses,
      headCoach,
    };

    setCurrentMeeting(finalLog);
    const updated = [...logs, finalLog];
    setLogs(updated);
    saveLogs(updated);
    setLoading(false);
    setLoadingStep("");
  }

  return (
    <div style={{
      fontFamily: "'Palatino Linotype', 'Georgia', serif",
      background: "#060606",
      color: "#e8e8e8",
      minHeight: "100vh",
      maxWidth: "480px",
      margin: "0 auto",
      display: "flex",
      flexDirection: "column",
      height: "100vh",
      overflow: "hidden",
    }}>
      <style>{`
        @keyframes slideIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }
        input:focus { outline: none; border-color: #c8a96e !important; }
        textarea:focus { outline: none; border-color: #c8a96e !important; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: #1a1a1a; border-radius: 2px; }
      `}</style>

      {/* Header */}
      <div style={{ padding: "20px 16px 14px", borderBottom: "1px solid #111", flexShrink: 0 }}>
        <div style={{ fontSize: "10px", color: "#444", textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: "4px" }}>Performance Panel</div>
        <div style={{ fontSize: "28px", fontWeight: "400", letterSpacing: "-0.01em", color: "#e8e8e8" }}>The Boardroom</div>
        <div style={{ fontSize: "11px", color: "#333", marginTop: "2px" }}>8 specialists · 1 athlete</div>
      </div>

      {/* Nav */}
      <div style={{ display: "flex", borderBottom: "1px solid #111", flexShrink: 0 }}>
        {[["checkin", "Check In"], ["meeting", "Meeting"], ["history", "History"]].map(([key, label]) => (
          <button key={key} onClick={() => setView(key)} style={{
            flex: 1, background: "none", border: "none", padding: "10px",
            color: view === key ? "#c8a96e" : "#333",
            borderBottom: view === key ? "2px solid #c8a96e" : "2px solid transparent",
            fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.12em", cursor: "pointer",
            fontFamily: "inherit",
          }}>{label}</button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>

        {/* CHECK IN */}
        {view === "checkin" && (
          <div style={{ padding: "20px 16px" }}>
            <div style={{ fontSize: "13px", color: "#555", lineHeight: "1.6", marginBottom: "20px" }}>
              Just talk. Tell the panel how you're going — sleep, food, energy, training, padel, anything. They'll each take what's relevant.
            </div>

            <div style={{ fontSize: "11px", color: "#333", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.1em" }}>Example</div>
            <div style={{ background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: "8px", padding: "12px", marginBottom: "20px", fontSize: "12px", color: "#444", lineHeight: "1.6", fontStyle: "italic" }}>
              "Slept maybe 5 hours, woke up at 3am couldn't get back. Had eggs for breakfast, skipped lunch. Squats this morning felt heavy but got through it — went up 2.5kg. Padel tonight. Feeling a bit flat overall."
            </div>

            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="How's everything going today..."
              rows={5}
              style={{
                width: "100%", background: "#0a0a0a", border: "1px solid #1a1a1a",
                borderRadius: "10px", padding: "14px", color: "#e8e8e8",
                fontSize: "14px", lineHeight: "1.6", resize: "none",
                boxSizing: "border-box", fontFamily: "inherit",
              }}
            />

            <button
              onClick={runMeeting}
              disabled={loading || !input.trim()}
              style={{
                width: "100%", marginTop: "12px",
                background: loading || !input.trim() ? "#111" : "#c8a96e",
                color: loading || !input.trim() ? "#333" : "#000",
                border: "none", borderRadius: "10px", padding: "14px",
                fontSize: "13px", fontWeight: "700", cursor: loading || !input.trim() ? "default" : "pointer",
                textTransform: "uppercase", letterSpacing: "0.12em", fontFamily: "inherit",
                transition: "all 0.2s",
              }}
            >
              {loading ? "Panel is meeting..." : "Call the Meeting →"}
            </button>

            {/* Panel preview */}
            <div style={{ marginTop: "28px" }}>
              <div style={{ fontSize: "10px", color: "#2a2a2a", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: "12px" }}>Your Panel</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {Object.entries(SPECIALISTS).map(([key, sp]) => (
                  <div key={key} style={{
                    display: "flex", alignItems: "center", gap: "6px",
                    background: "#0a0a0a", border: `1px solid ${sp.color}22`,
                    borderRadius: "20px", padding: "5px 10px 5px 6px",
                  }}>
                    <div style={{
                      width: "20px", height: "20px", borderRadius: "50%",
                      background: `${sp.color}22`, display: "flex", alignItems: "center",
                      justifyContent: "center", fontSize: "9px", fontWeight: "800", color: sp.color,
                    }}>{sp.avatar}</div>
                    <span style={{ fontSize: "11px", color: "#444" }}>{sp.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* MEETING */}
        {view === "meeting" && (
          <div style={{ padding: "16px" }}>
            {!currentMeeting && !loading && (
              <div style={{ color: "#333", fontSize: "13px", textAlign: "center", marginTop: "40px" }}>
                No meeting yet. Check in first.
              </div>
            )}

            {currentMeeting && (
              <>
                <div style={{ fontSize: "11px", color: "#333", marginBottom: "4px" }}>{currentMeeting.date}</div>
                <div style={{ background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: "8px", padding: "12px", marginBottom: "16px", fontSize: "13px", color: "#555", fontStyle: "italic", lineHeight: "1.5" }}>
                  "{currentMeeting.input}"
                </div>

                {/* Head Coach output */}
                {currentMeeting.headCoach && (
                  <div style={{
                    background: `${SPECIALISTS.head.color}0d`,
                    border: `1px solid ${SPECIALISTS.head.color}44`,
                    borderRadius: "12px", padding: "16px", marginBottom: "16px",
                    animation: "slideIn 0.4s ease",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                      <div style={{
                        width: "36px", height: "36px", borderRadius: "50%",
                        background: `${SPECIALISTS.head.color}22`, border: `2px solid ${SPECIALISTS.head.color}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "14px", fontWeight: "800", color: SPECIALISTS.head.color,
                      }}>M</div>
                      <div>
                        <div style={{ fontSize: "14px", fontWeight: "700", color: "#e8e8e8" }}>Marcus</div>
                        <div style={{ fontSize: "10px", color: SPECIALISTS.head.color, textTransform: "uppercase", letterSpacing: "0.1em" }}>Head Coach · Final Call</div>
                      </div>
                    </div>
                    <div style={{ fontSize: "14px", color: "#d4d4d4", lineHeight: "1.7" }}>{currentMeeting.headCoach}</div>
                  </div>
                )}

                {/* Loading state */}
                {loading && (
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px 0", animation: "pulse 1.5s infinite" }}>
                    <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#c8a96e" }} />
                    <div style={{ fontSize: "12px", color: "#555" }}>{loadingStep}</div>
                  </div>
                )}

                {/* Specialist responses */}
                {currentMeeting.specialists && Object.keys(currentMeeting.specialists).length > 0 && (
                  <>
                    <div style={{ fontSize: "10px", color: "#2a2a2a", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: "10px", marginTop: "4px" }}>Panel Input</div>
                    {SPECIALIST_ORDER.filter(k => currentMeeting.specialists[k]).map(key => (
                      <MeetingCard key={key} specialist={key} response={currentMeeting.specialists[key]} isNew={true} />
                    ))}
                  </>
                )}
                <div ref={bottomRef} />
              </>
            )}
          </div>
        )}

        {/* HISTORY */}
        {view === "history" && (
          <div style={{ padding: "16px" }}>
            {logs.length === 0 && (
              <div style={{ color: "#333", fontSize: "13px", textAlign: "center", marginTop: "40px" }}>No meetings yet.</div>
            )}
            {[...logs].reverse().map(log => <LogEntry key={log.id} log={log} />)}
          </div>
        )}
      </div>
    </div>
  );
}