import { useState, useRef, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_KEY
);

function getUserId() {
  let id = localStorage.getItem("br_user_id");
  if (!id) { id = "user_" + Math.random().toString(36).slice(2, 11); localStorage.setItem("br_user_id", id); }
  return id;
}

// ── PROGRAM ───────────────────────────────────────────────────────────────────
const PROGRAM = {
  A: { name: "Session A", label: "Lower Strength", exercises: [
    { id: "squat", name: "Squat", sets: 4, reps: 5, note: "Heavy but not max" },
    { id: "rdl", name: "Romanian Deadlift", sets: 3, reps: 8, note: "" },
    { id: "goblet", name: "KB Goblet Squat", sets: 3, reps: 12, note: "Slow, pause at bottom" },
    { id: "abwheel", name: "Ab Wheel", sets: 3, reps: 9, note: "" },
    { id: "hillwalk", name: "Driveway Hill Walk", sets: 3, reps: null, note: "KB at chest" },
  ]},
  B: { name: "Session B", label: "Upper Strength", exercises: [
    { id: "bench", name: "Bench Press", sets: 4, reps: 5, note: "" },
    { id: "row", name: "Barbell Row", sets: 4, reps: 6, note: "" },
    { id: "ohp", name: "Overhead Press", sets: 3, reps: 8, note: "" },
    { id: "halo", name: "KB Halo", sets: 3, reps: 10, note: "Each direction" },
    { id: "abwheel2", name: "Ab Wheel", sets: 3, reps: 8, note: "" },
  ]},
  C: { name: "Session C", label: "Conditioning", exercises: [
    { id: "trail", name: "Trail Run", sets: 1, reps: null, note: "20–30 min easy pace" },
    { id: "mobility", name: "Mobility", sets: 1, reps: null, note: "5 min: hip flexors, thoracic, hamstrings" },
  ]},
};

const WEEKLY = { Mon: "A", Tue: "C", Wed: "B" };

// ── SPECIALISTS ───────────────────────────────────────────────────────────────
const SPECIALISTS = {
  marcus: {
    name: "Marcus", title: "Head Coach", avatar: "M", color: "#000",
    personality: `You are Marcus, Head Coach and performance director. 20 years in elite sport. Calm, authoritative, integrative. You only speak when you have something important to add — a pattern across what others said, a decision that needs making, or a conflict to resolve. You synthesise, you don't narrate. When you do speak, be direct. Format: "My call:" followed by one clear recommendation. Never more than 4 sentences.`,
    triggers: ["decision", "conflict", "pattern", "overall", "summary", "what should", "confused", "not sure"],
  },
  davo: {
    name: "Davo", title: "Strength Coach", avatar: "D", color: "#111",
    personality: `You are Davo, strength and conditioning coach. Ex-powerlifter, 15 years coaching. Direct, blunt, occasionally dry. You care about load management and progressive overload. You question the athlete when you need more info — if they mention training tomorrow, ask what time so you can advise on nutrition timing. If they mention feeling weak, ask about sleep and food. Reference specific weights when available. Progression: +2.5kg/week if RPE 7-8, hold if RPE 9, drop 10% if missed reps. You respond to: training, weights, strength, gym, session, workout, tired, weak, sore, recovery.`,
    triggers: ["train", "session", "gym", "squat", "bench", "lift", "workout", "sore", "weak", "tired", "weights", "reps", "sets"],
  },
  priya: {
    name: "Priya", title: "Dietician", avatar: "P", color: "#111",
    personality: `You are Priya, sports dietician. Measured, evidence-based, warm but precise. You are proactive — if someone mentions a meal, you respond with specific weights, macros, and timing recommendations without being asked. If they mention training tomorrow, you tell them exactly what and when to eat tonight and in the morning. You ask follow-up questions when you need timing or context. You flag under-fuelling immediately. Never preachy — just precise and helpful.`,
    triggers: ["eat", "food", "meal", "breakfast", "lunch", "dinner", "drink", "coffee", "hungry", "snack", "protein", "carb", "lamb", "chicken", "eggs", "cook", "nutrition", "diet"],
  },
  jonah: {
    name: "Jonah", title: "Sleep Coach", avatar: "J", color: "#111",
    personality: `You are Jonah, sleep and recovery specialist. Calm, quietly relentless. You connect sleep to everything — training performance, mood, food choices, cognitive function. You ask follow-up questions: what time did you wake, did you wake during the night, what time is training tomorrow. You spot patterns others miss. If someone mentions feeling flat or tired, you're the first to investigate.`,
    triggers: ["sleep", "tired", "wake", "woke", "bed", "rest", "fatigue", "flat", "exhausted", "nap", "night", "morning", "groggy", "energy"],
  },
  kai: {
    name: "Kai", title: "Running Coach", avatar: "K", color: "#111",
    personality: `You are Kai, running and conditioning coach. Enthusiastic trail runner, former competitive middle-distance athlete. You geek out on effort zones, terrain, and pacing. You ask about conditions, distance, and how the body felt. You connect trail running to overall conditioning. You're encouraging but precise about effort calibration.`,
    triggers: ["run", "trail", "jog", "cardio", "conditioning", "driveway", "sprint", "walk", "pace", "hills", "forest"],
  },
  sofia: {
    name: "Sofia", title: "Padel Coach", avatar: "S", color: "#111",
    personality: `You are Sofia, padel coach. 8 years on the European circuit. Competitive, fun, strategic. You think about padel holistically — physical condition, fatigue, recovery, movement. If they mention a padel match coming up, you ask about their recovery state and give specific pre-match advice. You flag when they're going in under-recovered and when to prioritise padel over gym.`,
    triggers: ["padel", "match", "court", "game", "play", "partner", "tournament"],
  },
  ren: {
    name: "Ren", title: "Mobility & Yoga", avatar: "R", color: "#111",
    personality: `You are Ren, yoga and mobility specialist. Grounded, never preachy. You see what others miss — the tightness in the hips after a heavy squat day, the shoulder tension from desk work, the stress held in the body. You give specific, practical mobility cues. You ask about how the body feels, not just performance numbers. You advocate quietly but consistently for the work nobody wants to do.`,
    triggers: ["tight", "stiff", "mobility", "stretch", "yoga", "flexible", "hip", "shoulder", "back", "tension", "body", "ache", "pain"],
  },
  ellis: {
    name: "Dr. Ellis", title: "Sports Scientist", avatar: "E", color: "#111",
    personality: `You are Dr. Ellis, sports scientist. Precise, analytical, the one who sees patterns across the whole dataset. You connect training load to recovery to nutrition to sleep and spot trends before they become problems. You occasionally go slightly nerdy but always bring it back to practical meaning. You question inconsistencies in the data — if someone says they feel great but their training data shows declining RPE, you say so.`,
    triggers: ["pattern", "trend", "data", "progress", "weeks", "month", "consistent", "performance", "results", "improving", "declining"],
  },
  carla: {
    name: "Carla", title: "Business Coach", avatar: "C", color: "#111",
    personality: `You are Carla, executive and business coach. Sharp, direct, no corporate fluff. You understand that running a business is a physical and mental sport. You look at work stress, decision fatigue, team dynamics, and how professional pressure bleeds into recovery and performance. You reference Furniq specifically when relevant. You ask direct questions about what's actually happening at work when stress signals appear. You connect work patterns to physical performance without being reductive about it.`,
    triggers: ["work", "furniq", "team", "meeting", "tender", "client", "stress", "busy", "deadline", "decision", "tired", "overwhelm", "pressure", "business"],
  },
  noah: {
    name: "Dr. Noah", title: "Psychologist", avatar: "N", color: "#111",
    personality: `You are Dr. Noah, performance psychologist. Warm, perceptive, quietly incisive. You read between the lines — what people say and what they mean are often different. You notice emotional undercurrents in how people describe their day. You ask one precise question when you sense something beneath the surface. You never project or catastrophise. You connect mental state to physical performance in specific, practical ways. You speak like a thoughtful human, not a therapist.`,
    triggers: ["feel", "feeling", "mood", "anxious", "worried", "frustrated", "happy", "down", "motivated", "unmotivated", "mindset", "mental", "stress", "overwhelm", "doubt"],
  },
  sara: {
    name: "Dr. Sara", title: "Endocrinologist", avatar: "SA", color: "#111",
    personality: `You are Dr. Sara, endocrinologist specialising in performance and hormonal health. You look at the whole hormonal picture — cortisol, testosterone, thyroid, insulin, adrenaline — and how they interact with training, sleep, stress, and nutrition. You connect dots nobody else does: why someone stalls in training despite doing everything right, why energy crashes at specific times, why stress affects recovery more than expected. You're precise and evidence-based but speak plainly. You ask about energy patterns, libido, recovery rate, mood cycles when they're relevant.`,
    triggers: ["energy", "crash", "hormone", "cortisol", "stress", "recovery", "stall", "plateau", "mood", "libido", "inflammation", "adrenal", "thyroid"],
  },
  marco: {
    name: "Chef Marco", title: "Performance Chef", avatar: "MC", color: "#111",
    personality: `You are Chef Marco, performance nutritionist and meal strategist. Different to Priya — she handles the science, you handle the plate. You take what Priya recommends and make it real and practical. If someone mentions a meal, you give specific prep advice, ingredient swaps, cooking methods that preserve nutrients. If they mention lamb, you tell them exactly how to cook it, what to serve it with, portion sizes, timing. You make performance eating feel like good food, not a chore. You occasionally reference specific cuisines or techniques. You ask what's in the fridge when you need to.`,
    triggers: ["cook", "recipe", "meal", "dinner", "lunch", "breakfast", "lamb", "chicken", "fish", "vegetables", "prepare", "fridge", "eat", "food"],
  },
};

const SPECIALIST_ORDER = ["marcus", "davo", "priya", "jonah", "kai", "sofia", "ren", "ellis", "carla", "noah", "sara", "marco"];
const ACTIVE_SPECIALISTS = ["davo", "priya", "jonah", "kai", "sofia", "ren", "ellis", "carla", "noah", "sara", "marco"];


// ── ONBOARDING ────────────────────────────────────────────────────────────────
const ONBOARDING_STEPS = [
  {
    id: "name",
    question: "What should the panel call you?",
    placeholder: "First name",
    type: "text",
    optional: false,
  },
  {
    id: "age_gender_weight",
    question: "A few basics",
    type: "multi",
    fields: [
      { id: "age", label: "Age", placeholder: "32", keyboard: "numeric" },
      { id: "gender", label: "Gender", placeholder: "Male / Female / Other" },
      { id: "weight", label: "Weight (kg)", placeholder: "82", keyboard: "numeric" },
    ],
    optional: false,
  },
  {
    id: "work",
    question: "What do you do for work?",
    placeholder: "I run a small business, lead a team of 8, mostly operations and client work…",
    type: "textarea",
    optional: false,
  },
  {
    id: "training",
    question: "What\'s your training setup?",
    placeholder: "Home gym with squat rack and barbells, train 3 mornings a week, been lifting for 2 years…",
    type: "textarea",
    optional: false,
  },
  {
    id: "goal",
    question: "What do you most want to improve?",
    type: "chips",
    options: ["Overall health", "Strength & muscle", "Fat loss", "Energy & sleep", "Mental clarity", "Sport performance", "Mobility & flexibility", "Stress management"],
    optional: false,
  },
  {
    id: "context",
    question: "Anything else worth knowing?",
    placeholder: "Injuries, health conditions, sports you play, dietary restrictions, big life stressors… (optional)",
    type: "textarea",
    optional: true,
  },
];

function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [value, setValue] = useState("");
  const [multiValues, setMultiValues] = useState({});
  const [selectedChips, setSelectedChips] = useState([]);
  const [building, setBuilding] = useState(false);

  const current = ONBOARDING_STEPS[step];
  const isLast = step === ONBOARDING_STEPS.length - 1;
  const progress = (step / ONBOARDING_STEPS.length) * 100;

  function canProceed() {
    if (current.optional) return true;
    if (current.type === "multi") return Object.values(multiValues).some(v => v.trim());
    if (current.type === "chips") return selectedChips.length > 0;
    return value.trim().length > 0;
  }

  async function handleNext() {
    let updatedAnswers = { ...answers };
    if (current.type === "multi") {
      updatedAnswers[current.id] = current.fields.map(f => `${f.label}: ${multiValues[f.id] || "not provided"}`).join(", ");
      updatedAnswers = { ...updatedAnswers, ...multiValues };
    } else if (current.type === "chips") {
      updatedAnswers[current.id] = selectedChips.join(", ");
    } else {
      updatedAnswers[current.id] = value;
    }
    setAnswers(updatedAnswers);

    if (isLast) {
      setBuilding(true);
      const profile = await buildProfileFromAnswers(updatedAnswers);
      onComplete(updatedAnswers.name || "there", profile);
    } else {
      setStep(s => s + 1);
      const next = ONBOARDING_STEPS[step + 1];
      if (next.type === "multi") setMultiValues({});
      else if (next.type === "chips") setSelectedChips(updatedAnswers[next.id] ? updatedAnswers[next.id].split(", ") : []);
      else setValue(updatedAnswers[next.id] || "");
    }
  }

  function handleBack() {
    const prev = ONBOARDING_STEPS[step - 1];
    setStep(s => s - 1);
    if (prev.type === "multi") {
      const vals = {};
      prev.fields.forEach(f => { vals[f.id] = answers[f.id] || ""; });
      setMultiValues(vals);
    } else if (prev.type === "chips") {
      setSelectedChips(answers[prev.id] ? answers[prev.id].split(", ") : []);
    } else {
      setValue(answers[prev.id] || "");
    }
  }

  async function buildProfileFromAnswers(ans) {
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-5",
          max_tokens: 800,
          system: `You are building an initial profile for a new member of The Panel — a 12-specialist life and performance optimisation system. Based on their onboarding answers, create a structured profile with these sections: IDENTITY, WORK & LIFE, TRAINING SETUP, GOALS, HEALTH & BODY, MIND & MOTIVATION, PATTERNS & OBSERVATIONS. Keep it factual, specific, under 500 words. Use their exact words where possible. End PATTERNS & OBSERVATIONS with "Profile building — panel learning from first conversation." Output only the profile text.`,
          messages: [{ role: "user", content: `Name: ${ans.name}\nAge: ${ans.age || "not provided"}\nGender: ${ans.gender || "not provided"}\nWeight: ${ans.weight || "not provided"}kg\nWork: ${ans.work}\nTraining: ${ans.training}\nGoals: ${ans.goal}\nContext: ${ans.context || "Nothing additional."}` }],
        }),
      });
      const data = await res.json();
      return data.content?.find(b => b.type === "text")?.text || buildFallbackProfile(ans);
    } catch { return buildFallbackProfile(ans); }
  }

  function buildFallbackProfile(ans) {
    return `IDENTITY\n${ans.name}${ans.age ? ", " + ans.age : ""}${ans.gender ? ", " + ans.gender : ""}${ans.weight ? ", " + ans.weight + "kg" : ""}\n\nWORK & LIFE\n${ans.work}\n\nTRAINING SETUP\n${ans.training}\n\nGOALS\n${ans.goal}\n\nHEALTH & BODY\n${ans.context || "Nothing recorded yet."}\n\nMIND & MOTIVATION\nNothing recorded yet.\n\nPATTERNS & OBSERVATIONS\nProfile building — panel learning from first conversation.`;
  }

  if (building) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: 32, fontFamily: "-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif", background: "#fff" }}>
        <div style={{ fontSize: 13, color: "#bbb", marginBottom: 20, textAlign: "center" }}>Building your profile…<br /><span style={{ fontSize: 11, color: "#ddd", marginTop: 4, display: "block" }}>Your panel is getting ready</span></div>
        <div style={{ display: "flex", gap: 8 }}>
          {[0,1,2].map(i => <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: "#000", animation: `pulse 1.4s ease-in-out ${i * 0.2}s infinite` }} />)}
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif", background: "#fff", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:0.2;transform:scale(0.8)} 50%{opacity:1;transform:scale(1)} }
        .ob-input { width: 100%; background: #f7f7f7; border: 0.5px solid #e8e8e8; border-radius: 14px; padding: 16px 18px; font-size: 16px; color: #000; font-family: inherit; outline: none; -webkit-appearance: none; }
        .ob-input:focus { border-color: #000; background: #fff; }
        .ob-textarea { width: 100%; background: #f7f7f7; border: 0.5px solid #e8e8e8; border-radius: 14px; padding: 16px 18px; font-size: 15px; color: #000; font-family: inherit; outline: none; resize: none; line-height: 1.6; -webkit-appearance: none; }
        .ob-textarea:focus { border-color: #000; background: #fff; }
        .ob-input::placeholder, .ob-textarea::placeholder { color: #ccc; }
        .chip-option { border: 0.5px solid #e5e5e5; border-radius: 100px; padding: 10px 18px; font-size: 14px; color: #666; background: #f9f9f9; cursor: pointer; font-family: inherit; transition: all 0.15s; white-space: nowrap; }
        .chip-option.selected { background: #000; color: #fff; border-color: #000; }
      `}</style>

      {/* Safe area top */}
      <div style={{ paddingTop: "env(safe-area-inset-top, 20px)" }} />

      {/* Header */}
      <div style={{ padding: "24px 28px 20px", flexShrink: 0 }}>
        <div style={{ fontSize: 11, color: "#bbb", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 4 }}>Optimal Human</div>
        <div style={{ fontSize: 24, fontWeight: 300, letterSpacing: "-0.02em" }}>The Panel</div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 1, background: "#f0f0f0", margin: "0 28px", borderRadius: 1, flexShrink: 0 }}>
        <div style={{ height: 1, background: "#000", width: `${progress}%`, transition: "width 0.4s ease", borderRadius: 1 }} />
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "32px 28px 0", display: "flex", flexDirection: "column" }}>

        <div style={{ fontSize: 11, color: "#bbb", marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.1em" }}>
          {step + 1} of {ONBOARDING_STEPS.length}
        </div>

        <div style={{ fontSize: 22, fontWeight: 300, color: "#000", letterSpacing: "-0.01em", lineHeight: 1.3, marginBottom: 28 }}>
          {current.question}
        </div>

        {/* Text input */}
        {current.type === "text" && (
          <input
            autoFocus
            className="ob-input"
            value={value}
            onChange={e => setValue(e.target.value)}
            onKeyDown={e => e.key === "Enter" && canProceed() && handleNext()}
            placeholder={current.placeholder}
          />
        )}

        {/* Textarea */}
        {current.type === "textarea" && (
          <textarea
            autoFocus
            className="ob-textarea"
            value={value}
            onChange={e => setValue(e.target.value)}
            placeholder={current.placeholder}
            rows={4}
          />
        )}

        {/* Multi fields */}
        {current.type === "multi" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {current.fields.map(f => (
              <div key={f.id}>
                <div style={{ fontSize: 11, color: "#bbb", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>{f.label}</div>
                <input
                  className="ob-input"
                  type={f.keyboard === "numeric" ? "number" : "text"}
                  inputMode={f.keyboard || "text"}
                  value={multiValues[f.id] || ""}
                  onChange={e => setMultiValues(v => ({ ...v, [f.id]: e.target.value }))}
                  placeholder={f.placeholder}
                />
              </div>
            ))}
          </div>
        )}

        {/* Chips */}
        {current.type === "chips" && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {current.options.map(opt => (
              <button
                key={opt}
                className={`chip-option ${selectedChips.includes(opt) ? "selected" : ""}`}
                onClick={() => setSelectedChips(prev => prev.includes(opt) ? prev.filter(c => c !== opt) : [...prev, opt])}
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        {current.optional && (
          <div style={{ fontSize: 12, color: "#ccc", marginTop: 12 }}>Optional — tap Continue to skip</div>
        )}

        <div style={{ flex: 1, minHeight: 32 }} />
      </div>

      {/* Fixed bottom buttons */}
      <div style={{ padding: "16px 28px", paddingBottom: "calc(16px + env(safe-area-inset-bottom, 0px))", borderTop: "0.5px solid #f5f5f5", background: "#fff", flexShrink: 0 }}>
        <div style={{ display: "flex", gap: 10 }}>
          {step > 0 && (
            <button onClick={handleBack} style={{ flex: 1, background: "#f5f5f5", color: "#000", border: "none", borderRadius: 14, padding: "16px", fontSize: 15, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}>
              ←
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={!canProceed()}
            style={{ flex: 4, background: canProceed() ? "#000" : "#f0f0f0", color: canProceed() ? "#fff" : "#ccc", border: "none", borderRadius: 14, padding: "16px", fontSize: 15, fontWeight: 500, cursor: canProceed() ? "pointer" : "default", fontFamily: "inherit", transition: "all 0.15s" }}
          >
            {isLast ? "Meet your panel →" : "Continue →"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── SEED PROFILE ──────────────────────────────────────────────────────────────
const SEED_PROFILE = `IDENTITY
Sam. Runs Furniq, a procurement and fit-out company. Leads a small team. Hands-on operational role — tenders, team management, procurement decisions, day-to-day operations. Based in Australia.

TRAINING SETUP
Squat rack, bench press, barbells, 8kg kettlebells, ab wheel, steep driveway, forest trails at back of property. Trains Mon/Tue/Wed mornings reliably. Weekends when possible.

PROGRAM
Session A (Lower Strength): Squat 4x5, RDL 3x8, KB Goblet Squat 3x12, Ab Wheel 3x9, Driveway Hill Walk
Session B (Upper Strength): Bench Press 4x5, Barbell Row 4x6, OHP 3x8, KB Halo 3x10, Ab Wheel 3x8
Session C (Conditioning): Trail run 20-30min easy pace or driveway hill sprints x8-10, 5min mobility finish
Progression rule: +2.5kg/week if RPE 7-8, hold if RPE 9, drop 10% if missed reps. Sub-max effort — target 7/10.

BACKGROUND
Previously trained hard with a PT 12 months ago. Struggles to push to limit solo. Goal is overall health and mobility, not chasing PRs.

HEALTH & BODY
Nothing recorded yet.

WORK & STRESS
Runs Furniq. Team management and procurement focus. Stress patterns not yet established.

MIND & MOTIVATION
Nothing recorded yet.

PATTERNS & OBSERVATIONS
Profile building — panel learning Sam from first conversation.`;

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
    const exLines = s.exercises?.filter(e => e.weight || e.rpe).map(e => `${e.name}: ${e.weight ? e.weight + "kg" : "BW"} ${e.sets}x${e.reps || "—"}${e.rpe ? ` RPE ${e.rpe}` : ""}`).join(", ");
    return `[${s.date}] ${prog?.name} (${prog?.label})${exLines ? ": " + exLines : ""}`;
  });
  return `\n\nRecent training:\n${lines.join("\n")}`;
}

function getLeadAndSupport(message) {
  const lower = message.toLowerCase();
  // Find all relevant specialists
  const relevant = ACTIVE_SPECIALISTS.filter(key => {
    const sp = SPECIALISTS[key];
    return sp.triggers.some(t => lower.includes(t));
  });
  if (relevant.length === 0) {
    return { lead: "noah", support: ["carla", "ellis"] };
  }
  // Lead is the first most relevant, support are the rest (max 3)
  const lead = relevant[0];
  const support = relevant.slice(1, 4);
  // Always add noah as support if not already there and not lead
  if (lead !== "noah" && !support.includes("noah")) support.push("noah");
  return { lead, support: [...new Set(support)].slice(0, 3) };
}

// ── STYLES ────────────────────────────────────────────────────────────────────
const CSS = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #fff; }
  .app { font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif; background: #fff; color: #000; min-height: 100vh; max-width: 720px; margin: 0 auto; display: flex; flex-direction: column; height: 100vh; }
  .header { padding: 32px 40px 20px; border-bottom: 0.5px solid #e5e5e5; flex-shrink: 0; }
  .header-label { font-size: 11px; font-weight: 500; color: #999; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 6px; }
  .header-title { font-size: 30px; font-weight: 300; color: #000; letter-spacing: -0.02em; line-height: 1; }
  .header-sub { font-size: 12px; color: #bbb; margin-top: 4px; }
  .nav { display: flex; border-bottom: 0.5px solid #e5e5e5; padding: 0 40px; flex-shrink: 0; overflow-x: auto; }
  .nav-btn { background: none; border: none; border-bottom: 1.5px solid transparent; padding: 12px 0; margin-right: 24px; font-size: 12px; font-weight: 500; color: #bbb; cursor: pointer; letter-spacing: 0.04em; font-family: inherit; transition: color 0.15s, border-color 0.15s; white-space: nowrap; flex-shrink: 0; }
  .nav-btn.active { color: #000; border-bottom-color: #000; }
  .content { flex: 1; overflow-y: auto; min-height: 0; }
  .section-label { font-size: 11px; font-weight: 500; color: #bbb; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 12px; }
  .card { background: #fff; border: 0.5px solid #e5e5e5; border-radius: 12px; overflow: hidden; margin-bottom: 8px; }
  .card:hover { border-color: #ccc; }
  .card-header { display: flex; align-items: center; gap: 12px; padding: 14px 18px; cursor: pointer; background: none; border: none; width: 100%; text-align: left; }
  .avatar { width: 32px; height: 32px; border-radius: 50%; background: #f0f0f0; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; color: #000; flex-shrink: 0; }
  .avatar-black { background: #000; color: #fff; }
  .card-info { flex: 1; }
  .card-name { font-size: 13px; font-weight: 500; color: #000; font-family: inherit; }
  .card-sub { font-size: 11px; color: #999; margin-top: 1px; font-family: inherit; }
  .chevron { font-size: 10px; color: #ccc; transition: transform 0.2s; }
  .chevron.open { transform: rotate(180deg); }
  .card-body { padding: 12px 18px 16px; border-top: 0.5px solid #f0f0f0; font-size: 13px; color: #555; line-height: 1.7; }
  .marcus-bubble { background: #000; border-radius: 14px; padding: 18px 22px; margin-bottom: 12px; }
  .marcus-label { font-size: 10px; font-weight: 500; color: #555; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 8px; }
  .marcus-text { font-size: 14px; color: #ddd; line-height: 1.75; }
  .btn-primary { width: 100%; margin-top: 10px; background: #000; color: #fff; border: none; border-radius: 12px; padding: 14px 24px; font-size: 13px; font-weight: 500; cursor: pointer; letter-spacing: 0.04em; font-family: inherit; transition: opacity 0.15s; }
  .btn-primary:disabled { background: #f0f0f0; color: #ccc; cursor: default; }
  .btn-primary:not(:disabled):hover { opacity: 0.8; }
  .loading-dot { width: 5px; height: 5px; border-radius: 50%; background: #ccc; animation: pulse 1.4s ease-in-out infinite; display: inline-block; margin-right: 3px; }
  @keyframes pulse { 0%,100%{opacity:0.2;transform:scale(0.8)} 50%{opacity:1;transform:scale(1)} }
  .empty { font-size: 14px; color: #ccc; text-align: center; padding: 60px 0; }
  .tag { display: inline-block; background: #f0f0f0; border-radius: 6px; padding: 2px 7px; font-size: 11px; color: #666; font-weight: 500; margin-right: 4px; margin-bottom: 4px; }
  .session-btn { background: #f9f9f9; border: 0.5px solid #e5e5e5; border-radius: 12px; padding: 14px 18px; width: 100%; text-align: left; cursor: pointer; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center; font-family: inherit; transition: border-color 0.15s; }
  .session-btn:hover { border-color: #000; }
  .session-btn.suggested { border-color: #000; background: #fff; }
  .input-row { display: flex; gap: 8px; margin-top: 8px; }
  .input-field { flex: 1; background: #f9f9f9; border: 0.5px solid #e5e5e5; border-radius: 8px; padding: 10px 12px; color: #000; font-size: 13px; outline: none; font-family: inherit; transition: border-color 0.15s; }
  .input-field:focus { border-color: #000; background: #fff; }
  .input-field::placeholder { color: #ccc; }
  .input-sm { width: 65px; flex: none; }
  .ex-card { background: #f9f9f9; border: 0.5px solid #e5e5e5; border-radius: 10px; padding: 12px 14px; margin-bottom: 8px; }
  .ex-name { font-size: 13px; font-weight: 500; color: #000; margin-bottom: 2px; }
  .ex-note { font-size: 11px; color: #bbb; margin-bottom: 8px; }
  .divider { height: 0.5px; background: #f0f0f0; margin: 20px 0; }
  .stat-row { display: flex; gap: 12px; margin-bottom: 20px; }
  .stat { flex: 1; background: #f9f9f9; border-radius: 10px; padding: 12px 14px; }
  .stat-val { font-size: 20px; font-weight: 300; color: #000; }
  .stat-label { font-size: 10px; color: #bbb; margin-top: 2px; text-transform: uppercase; letter-spacing: 0.08em; }
  .sync-badge { font-size: 11px; color: #bbb; display: flex; align-items: center; gap: 4px; }
  .sync-dot { width: 5px; height: 5px; border-radius: 50%; background: #22c55e; }

  /* Chat styles */
  .chat-container { display: flex; flex-direction: column; height: 100%; }
  .chat-messages { flex: 1; overflow-y: auto; padding: 20px 24px; display: flex; flex-direction: column; gap: 16px; min-height: 0; }
  .chat-input-area { padding: 12px 24px 20px; border-top: 0.5px solid #f0f0f0; flex-shrink: 0; }
  .user-bubble { align-self: flex-end; background: #000; color: #fff; border-radius: 18px 18px 4px 18px; padding: 10px 16px; font-size: 14px; line-height: 1.5; max-width: 80%; }
  .specialist-group { display: flex; flex-direction: column; gap: 8px; }
  .specialist-bubble { background: #f7f7f7; border-radius: 4px 18px 18px 18px; padding: 12px 16px; font-size: 13px; line-height: 1.65; color: #222; max-width: 90%; position: relative; }
  .specialist-bubble.marcus { background: #000; color: #ddd; border-radius: 12px; padding: 16px 20px; max-width: 100%; }
  .specialist-name-tag { font-size: 10px; font-weight: 600; color: #999; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 5px; display: flex; align-items: center; gap: 6px; }
  .sp-avatar { width: 18px; height: 18px; border-radius: 50%; background: #e5e5e5; display: flex; align-items: center; justify-content: center; font-size: 8px; font-weight: 700; color: #666; flex-shrink: 0; }
  .sp-avatar.black { background: #000; color: #fff; }
  .loading-indicator { display: flex; align-items: center; gap: 6px; padding: 8px 0; font-size: 12px; color: #ccc; }
  .chat-textarea { width: 100%; background: #f5f5f5; border: 0.5px solid #e5e5e5; border-radius: 20px; padding: 12px 50px 12px 18px; color: #000; font-size: 14px; line-height: 1.5; resize: none; font-family: inherit; outline: none; transition: border-color 0.15s; max-height: 120px; min-height: 44px; overflow-y: auto; }
  .chat-textarea:focus { border-color: #000; background: #fff; }
  .chat-textarea::placeholder { color: #ccc; }
  .send-btn { position: absolute; right: 8px; bottom: 8px; width: 32px; height: 32px; border-radius: 50%; background: #000; border: none; color: #fff; font-size: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
  .send-btn:disabled { background: #e5e5e5; cursor: default; }
  .chat-input-wrapper { position: relative; }
  .panel-chips { display: flex; flex-wrap: wrap; gap: 6px; padding: 8px 24px 12px; border-top: 0.5px solid #f5f5f5; flex-shrink: 0; }
  .chip { display: flex; align-items: center; gap: 5px; background: #f5f5f5; border-radius: 100px; padding: 3px 10px 3px 5px; }
  .chip-av { width: 18px; height: 18px; border-radius: 50%; background: #000; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 7px; font-weight: 700; }
  .chip-name { font-size: 11px; color: #888; }
  input:focus, button:focus, textarea:focus { outline: none; }

  .content-padded { padding: 28px 40px; }
`;

// ── SPECIALIST CARD (for history) ─────────────────────────────────────────────
function SpecialistCard({ id, response }) {
  const [open, setOpen] = useState(false);
  const sp = SPECIALISTS[id];
  if (!sp || !response) return null;
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
  const [weights, setWeights] = useState(() => { const w = {}; prog.exercises.forEach(ex => { w[ex.id] = getLastWeight(trainingSessions, ex.id); }); return w; });
  const [rpe, setRpe] = useState({});
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    await onSave({ id: Date.now(), date: new Date().toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short" }), date_raw: new Date().toISOString(), type: sessionType, exercises: prog.exercises.map(ex => ({ id: ex.id, name: ex.name, sets: ex.sets, reps: ex.reps, weight: weights[ex.id] || null, rpe: rpe[ex.id] || null })) });
    setSaving(false);
  }

  return (
    <div className="content-padded">
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
      <button className="btn-primary" onClick={handleSave} disabled={saving} style={{ marginTop: 16 }}>{saving ? "Saving…" : "Save Session"}</button>
    </div>
  );
}

// ── TRAINING TAB ──────────────────────────────────────────────────────────────
function TrainingTab({ trainingSessions, onLogSession }) {
  const [logging, setLogging] = useState(null);
  const today = new Date().toLocaleDateString("en-AU", { weekday: "long" }).slice(0, 3);
  const suggested = WEEKLY[today] || null;
  const thisWeek = trainingSessions.filter(s => (new Date() - new Date(s.date_raw)) < 7 * 24 * 60 * 60 * 1000).length;

  if (logging) return <LogSession sessionType={logging} trainingSessions={trainingSessions} onSave={async s => { await onLogSession(s); setLogging(null); }} onBack={() => setLogging(null)} />;

  return (
    <div className="content-padded">
      <div className="stat-row">
        <div className="stat"><div className="stat-val">{trainingSessions.length}</div><div className="stat-label">Total sessions</div></div>
        <div className="stat"><div className="stat-val">{thisWeek}</div><div className="stat-label">This week</div></div>
      </div>
      {suggested && (<><div className="section-label">Today · {today}</div><button className="session-btn suggested" onClick={() => setLogging(suggested)}><div><div style={{ fontSize: 13, fontWeight: 500 }}>{PROGRAM[suggested].name}</div><div style={{ fontSize: 12, color: "#999", marginTop: 2 }}>{PROGRAM[suggested].label}</div></div><span style={{ fontSize: 18, color: "#bbb" }}>→</span></button><div className="divider" /></>)}
      <div className="section-label">Log a Session</div>
      {Object.entries(PROGRAM).map(([key, prog]) => (
        <button key={key} className="session-btn" onClick={() => setLogging(key)}><div><div style={{ fontSize: 13, fontWeight: 500 }}>{prog.name}</div><div style={{ fontSize: 12, color: "#999", marginTop: 2 }}>{prog.label}</div></div><span style={{ fontSize: 18, color: "#bbb" }}>→</span></button>
      ))}
      {trainingSessions.length > 0 && (<><div className="divider" /><div className="section-label">Recent</div>{[...trainingSessions].reverse().slice(0, 5).map(s => (<div key={s.id} style={{ marginBottom: 8, padding: "10px 14px", background: "#f9f9f9", borderRadius: 10, border: "0.5px solid #e5e5e5" }}><div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}><div style={{ fontSize: 13, fontWeight: 500 }}>{PROGRAM[s.type]?.name}</div><div style={{ fontSize: 11, color: "#bbb" }}>{s.date}</div></div><div style={{ display: "flex", flexWrap: "wrap" }}>{s.exercises?.filter(e => e.weight).map(e => (<span key={e.id} className="tag">{e.name} {e.weight}kg{e.rpe ? ` RPE ${e.rpe}` : ""}</span>))}</div></div>))}</>)}
    </div>
  );
}

// ── HISTORY TAB ───────────────────────────────────────────────────────────────
function HistoryTab({ conversations }) {
  if (!conversations || conversations.length === 0) return <div className="content-padded"><div className="empty">No conversations yet.</div></div>;
  return (
    <div className="content-padded">
      {[...conversations].reverse().map(conv => {
        const [open, setOpen] = useState(false);
        const preview = conv.messages?.find(m => m.role === "user")?.content || "";
        return (
          <div className="card" key={conv.id}>
            <button className="card-header" onClick={() => setOpen(o => !o)}>
              <div className="card-info">
                <div style={{ fontSize: 11, color: "#bbb", marginBottom: 2 }}>{conv.date}</div>
                <div className="card-name" style={{ fontWeight: 400 }}>{preview.slice(0, 70)}{preview.length > 70 ? "…" : ""}</div>
              </div>
              <span className={`chevron ${open ? "open" : ""}`}>▾</span>
            </button>
            {open && (
              <div className="card-body">
                {conv.messages?.map((m, i) => (
                  <div key={i} style={{ marginBottom: 12 }}>
                    {m.role === "user" ? (
                      <div style={{ fontSize: 12, color: "#000", fontWeight: 500, marginBottom: 2 }}>You</div>
                    ) : (
                      <div style={{ fontSize: 12, color: "#999", marginBottom: 2 }}>{SPECIALISTS[m.specialist]?.name || m.specialist}</div>
                    )}
                    <div style={{ fontSize: 13, color: m.role === "user" ? "#333" : "#555", lineHeight: 1.6 }}>{m.content}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── PROFILE TAB ───────────────────────────────────────────────────────────────
function ProfileTab({ profile, onAddNote }) {
  const [note, setNote] = useState("");
  return (
    <div className="content-padded">
      <p style={{ fontSize: 13, color: "#999", marginBottom: 16, lineHeight: 1.6 }}>What your panel knows about you. Updates after every conversation. Add anything you want them to know.</p>
      <div style={{ background: "#f9f9f9", border: "0.5px solid #e5e5e5", borderRadius: 12, padding: "18px 20px", marginBottom: 20, fontSize: 13, color: "#444", lineHeight: 1.9, whiteSpace: "pre-wrap", fontFamily: "inherit" }}>
        {profile || "No profile yet."}
      </div>
      <div className="section-label">Add a note</div>
      <textarea className="input-field" value={note} onChange={e => setNote(e.target.value)} placeholder="Injury history, goals, context, life events…" rows={3} style={{ width: "100%", resize: "none", borderRadius: 10, padding: "12px 14px", minHeight: 80 }} />
      <button className="btn-primary" onClick={() => { if (note.trim()) { onAddNote(note.trim()); setNote(""); } }} disabled={!note.trim()}>Add to Profile</button>
    </div>
  );
}

// ── MAIN CHAT TAB ─────────────────────────────────────────────────────────────
function ChatTab({ messages, onSend, loading, loadingSpecialists }) {
  const [input, setInput] = useState("");
  const [directed, setDirected] = useState(null); // null = general, key = specific specialist
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  function handleSend() {
    if (!input.trim() || loading) return;
    onSend(input.trim(), directed);
    setInput("");
    setDirected(null);
    if (textareaRef.current) textareaRef.current.style.height = "44px";
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }

  function handleInput(e) {
    setInput(e.target.value);
    e.target.style.height = "44px";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  }

  const today = new Date().toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div className="chat-container">
      <div className="chat-messages">
        {messages.length === 0 && (
          <div style={{ textAlign: "center", paddingTop: 40 }}>
            <div style={{ fontSize: 13, color: "#ccc", lineHeight: 1.8 }}>
              {today}<br />
              Just talk. Your panel is listening.
            </div>
            <div style={{ marginTop: 24, display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
              {["Slept well last night", "Training this morning", "Stressed about work", "Having lamb for dinner", "Padel match tonight"].map(s => (
                <button key={s} onClick={() => onSend(s, null)} style={{ background: "#f5f5f5", border: "0.5px solid #e5e5e5", borderRadius: 20, padding: "6px 14px", fontSize: 12, color: "#666", cursor: "pointer", fontFamily: "inherit" }}>{s}</button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i}>
            {msg.role === "user" && (
              <div style={{ display: "flex", justifyContent: "flex-end", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                {msg.directed && (
                  <div style={{ fontSize: 10, color: "#bbb", marginRight: 4 }}>
                    → {SPECIALISTS[msg.directed]?.name}
                  </div>
                )}
                <div className="user-bubble">{msg.content}</div>
              </div>
            )}
            {msg.role === "specialist" && (
              <div className="specialist-group">
                <div className={`specialist-bubble ${msg.specialist === "marcus" ? "marcus" : ""}`}>
                  <div className="specialist-name-tag">
                    <div className={`sp-avatar ${msg.specialist === "marcus" ? "black" : ""}`}>{SPECIALISTS[msg.specialist]?.avatar}</div>
                    {SPECIALISTS[msg.specialist]?.name} · {SPECIALISTS[msg.specialist]?.title}
                  </div>
                  {msg.content}
                </div>
              </div>
            )}
          </div>
        ))}

        {loading && loadingSpecialists.length > 0 && (
          <div className="specialist-bubble" style={{ opacity: 0.6, alignSelf: "flex-start" }}>
            <div className="specialist-name-tag">
              <div className="sp-avatar">{SPECIALISTS[loadingSpecialists[0]]?.avatar}</div>
              {SPECIALISTS[loadingSpecialists[0]]?.name} is thinking
              <div className="loading-dot" style={{ marginLeft: 4 }} />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Direct selector */}
      <div style={{ padding: "8px 16px 4px", borderTop: "0.5px solid #f5f5f5", flexShrink: 0 }}>
        <div style={{ fontSize: 10, color: "#ccc", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>
          {directed ? `Directing to ${SPECIALISTS[directed]?.name} — tap to clear` : "Direct to a specialist"}
        </div>
        <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4 }}>
          {ACTIVE_SPECIALISTS.map(key => {
            const sp = SPECIALISTS[key];
            const isSelected = directed === key;
            return (
              <button
                key={key}
                onClick={() => setDirected(isSelected ? null : key)}
                style={{
                  display: "flex", alignItems: "center", gap: 5,
                  background: isSelected ? "#000" : "#f5f5f5",
                  border: isSelected ? "none" : "0.5px solid #e8e8e8",
                  borderRadius: 100, padding: "5px 10px 5px 6px",
                  cursor: "pointer", flexShrink: 0, transition: "all 0.15s",
                  fontFamily: "inherit",
                }}
              >
                <div style={{
                  width: 20, height: 20, borderRadius: "50%",
                  background: isSelected ? "#fff" : "#e0e0e0",
                  color: isSelected ? "#000" : "#666",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 8, fontWeight: 700, flexShrink: 0,
                }}>{sp.avatar}</div>
                <span style={{ fontSize: 11, color: isSelected ? "#fff" : "#888", fontWeight: isSelected ? 600 : 400 }}>{sp.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="chat-input-area">
        <div className="chat-input-wrapper">
          <textarea
            ref={textareaRef}
            className="chat-textarea"
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder={directed ? `Message ${SPECIALISTS[directed]?.name}…` : "Talk to your panel…"}
            rows={1}
          />
          <button className="send-btn" onClick={handleSend} disabled={loading || !input.trim()}>→</button>
        </div>
      </div>
    </div>
  );
}

// ── MAIN APP ──────────────────────────────────────────────────────────────────
export default function App() {
  const userId = getUserId();
  const [onboarded, setOnboarded] = useState(() => !!localStorage.getItem("br_onboarded"));
  const [userName, setUserName] = useState(() => localStorage.getItem("br_name") || "");
  const [trainingSessions, setTrainingSessions] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [profile, setProfile] = useState(SEED_PROFILE);
  const [messages, setMessages] = useState([]);
  const [view, setView] = useState("chat");
  const [loading, setLoading] = useState(false);
  const [loadingSpecialists, setLoadingSpecialists] = useState([]);
  const [syncing, setSyncing] = useState(true);

  useEffect(() => {
    if (!onboarded) return;
    async function loadData() {
      setSyncing(true);
      const [{ data: sessions }, { data: convs }, { data: prof }] = await Promise.all([
        supabase.from("sessions").select("*").eq("user_id", userId).order("date_raw", { ascending: true }),
        supabase.from("conversations").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(20),
        supabase.from("profiles").select("*").eq("user_id", userId).single(),
      ]);
      if (sessions) setTrainingSessions(sessions);
      if (convs) setConversations(convs);
      if (prof?.content) setProfile(prof.content);
      setSyncing(false);
    }
    loadData();
  }, [onboarded]);

  async function handleOnboardingComplete(name, generatedProfile) {
    setUserName(name);
    setProfile(generatedProfile);
    setOnboarded(true);
    localStorage.setItem("br_onboarded", "true");
    localStorage.setItem("br_name", name);
    await supabase.from("profiles").upsert({ user_id: userId, content: generatedProfile, updated_at: new Date().toISOString() });
  }

  if (!onboarded) return <Onboarding onComplete={handleOnboardingComplete} />;

  async function getSupportInsights(supportKeys, userMessage, conversationHistory, trainingContext) {
    // Silently gather insights from support specialists
    const insights = [];
    for (const key of supportKeys) {
      const sp = SPECIALISTS[key];
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "claude-sonnet-4-5",
            max_tokens: 200,
            system: `${sp.personality}\n\nATHLETE PROFILE:\n${profile}${trainingContext}\n\nProvide a brief insight (1-2 sentences max) from your specific domain only. This will be shared with the lead specialist to inform their response. Be specific and concise.`,
            messages: [{ role: "user", content: userMessage }],
          }),
        });
        const data = await res.json();
        const text = data.content?.find(b => b.type === "text")?.text || "";
        if (text) insights.push({ specialist: key, name: sp.name, title: sp.title, insight: text });
      } catch { /* silent */ }
    }
    return insights;
  }

  async function getLeadResponse(leadKey, userMessage, conversationHistory, trainingContext, supportInsights, directed) {
    const sp = SPECIALISTS[leadKey];
    const historyMessages = conversationHistory.slice(-8).map(m => ({
      role: m.role === "user" ? "user" : "assistant",
      content: m.role === "specialist" ? m.content : m.content,
    }));

    const insightsText = supportInsights.length > 0
      ? `\n\nYour colleagues have flagged:\n${supportInsights.map(i => `${i.name} (${i.title}): ${i.insight}`).join("\n")}`
      : "";

    const directedNote = directed ? "" : `\n\nYou are the lead responder for this message. Integrate relevant insights from colleagues naturally where it adds value — don't just list them. Speak as yourself but with the full picture.`;

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 300,
        system: `${sp.personality}\n\nATHLETE PROFILE:\n${profile}${trainingContext}${insightsText}${directedNote}\n\nBe conversational, specific, and direct. 2-4 sentences. No bullet points. Ask one follow-up question only if genuinely needed.`,
        messages: [...historyMessages, { role: "user", content: userMessage }],
      }),
    });
    const data = await res.json();
    return data.content?.find(b => b.type === "text")?.text || "";
  }

  async function checkMarcus(userMessage, leadResponse, conversationHistory, trainingContext) {
    // Marcus only speaks for big picture patterns or important decisions
    const recentUserMessages = conversationHistory.filter(m => m.role === "user").slice(-5);
    const triggerWords = SPECIALISTS.marcus.triggers;
    const hasTrigger = triggerWords.some(t => userMessage.toLowerCase().includes(t));
    const conversationLength = conversationHistory.length;
    // Marcus weighs in occasionally on patterns, not every message
    if (!hasTrigger && conversationLength % 8 !== 0) return null;

    const historyStr = conversationHistory.slice(-6).map(m =>
      m.role === "user" ? `User: ${m.content}` : `${SPECIALISTS[m.specialist]?.name}: ${m.content}`
    ).join("\n");

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 200,
        system: `${SPECIALISTS.marcus.personality}\n\nATHLETE PROFILE:\n${profile}${trainingContext}\n\nOnly respond if there is a genuinely important pattern, conflict, or decision. If not, respond with exactly: PASS`,
        messages: [{ role: "user", content: `Recent conversation:\n${historyStr}\n\nLatest response from panel: ${leadResponse}\n\nAnything important to add?` }],
      }),
    });
    const data = await res.json();
    const text = data.content?.find(b => b.type === "text")?.text || "";
    return text.startsWith("PASS") ? null : text;
  }

  async function updateProfile(allMessages) {
    const recentStr = allMessages.slice(-4).map(m =>
      m.role === "user" ? `User: ${m.content}` : `${SPECIALISTS[m.specialist]?.name}: ${m.content}`
    ).join("\n");
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-5",
          max_tokens: 800,
          system: `Maintain a living profile. Update with new observations. Factual and specific. Preserve existing info unless superseded. Under 600 words. Same section structure. Output only the profile text.`,
          messages: [{ role: "user", content: `CURRENT PROFILE:\n${profile}\n\nRECENT CONVERSATION:\n${recentStr}\n\nUpdate with anything new.` }],
        }),
      });
      const data = await res.json();
      const updated = data.content?.find(b => b.type === "text")?.text;
      if (updated) {
        setProfile(updated);
        await supabase.from("profiles").upsert({ user_id: userId, content: updated, updated_at: new Date().toISOString() });
      }
    } catch { /* silent */ }
  }

  async function handleSend(userInput, directed = null) {
    if (!userInput.trim() || loading) return;
    setLoading(true);

    const userMsg = { role: "user", content: userInput, directed };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);

    const trainingContext = buildTrainingContext(trainingSessions);

    let leadKey, supportKeys;
    if (directed) {
      leadKey = directed;
      supportKeys = [];
    } else {
      const routing = getLeadAndSupport(userInput);
      leadKey = routing.lead;
      supportKeys = routing.support;
    }

    setLoadingSpecialists([leadKey]);

    // Get support insights silently in background
    const supportInsights = await getSupportInsights(supportKeys, userInput, newMessages, trainingContext);

    // Get lead response with support context
    let leadResponse = "";
    try {
      leadResponse = await getLeadResponse(leadKey, userInput, newMessages, trainingContext, supportInsights, directed);
    } catch { leadResponse = "Give me a moment — try again."; }

    const leadMsg = { role: "specialist", specialist: leadKey, content: leadResponse };
    const allMessages = [...newMessages, leadMsg];
    setMessages(allMessages);
    setLoadingSpecialists([]);

    // Check if Marcus should weigh in
    const marcusResponse = await checkMarcus(userInput, leadResponse, allMessages, trainingContext);
    let finalMessages = allMessages;
    if (marcusResponse) {
      const marcusMsg = { role: "specialist", specialist: "marcus", content: marcusResponse };
      finalMessages = [...allMessages, marcusMsg];
      setMessages(finalMessages);
    }

    // Save conversation
    const conv = { id: Date.now(), user_id: userId, date: new Date().toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }), messages: finalMessages, created_at: new Date().toISOString() };
    await supabase.from("conversations").insert(conv);
    setConversations(prev => [conv, ...prev]);

    // Update profile silently
    updateProfile(finalMessages);

    setLoading(false);
  }

  async function handleLogSession(session) {
    const row = { id: session.id, user_id: userId, date: session.date, date_raw: session.date_raw, type: session.type, exercises: session.exercises };
    await supabase.from("sessions").insert(row);
    setTrainingSessions(prev => [...prev, row]);
  }

  async function handleAddNote(note) {
    const updated = profile + "\n\nNOTE FROM SAM\n" + note;
    setProfile(updated);
    await supabase.from("profiles").upsert({ user_id: userId, content: updated, updated_at: new Date().toISOString() });
  }

  return (
    <>
      <style>{CSS}</style>
      <div className="app">
        <div className="header">
          <div className="header-label">Optimal Human</div>
          <div className="header-title">The Panel</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4 }}>
            <div className="header-sub">{userName ? `${userName} · ` : ""}12 specialists · always on</div>
            {!syncing && <div className="sync-badge"><div className="sync-dot" />Synced</div>}
            {syncing && <div className="sync-badge">Syncing…</div>}
          </div>
        </div>

        <div className="nav">
          {[["chat", "Talk"], ["training", "Training"], ["history", "History"], ["profile", "Profile"]].map(([k, label]) => (
            <button key={k} className={`nav-btn ${view === k ? "active" : ""}`} onClick={() => setView(k)}>{label}</button>
          ))}
        </div>

        <div className="content">
          {view === "chat" && <ChatTab messages={messages} onSend={handleSend} loading={loading} loadingSpecialists={loadingSpecialists} />}
          {view === "training" && <TrainingTab trainingSessions={trainingSessions} onLogSession={handleLogSession} />}
          {view === "history" && <HistoryTab conversations={conversations} />}
          {view === "profile" && <ProfileTab profile={profile} onAddNote={handleAddNote} />}
        </div>
      </div>
    </>
  );
}