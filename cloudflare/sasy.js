/* SASY's answers without a model: a port of frontend/api/index.py. */
import site from "./site.json" with { type: "json" };

const { profile: p, projects: projs, skills } = site;
export const TO = "founder@imutechz.in";
export const MAX_MSG = 500;
const words = (s) => s.split(" ");
const STOP = new Set(words("a an the and or of to in for with on is are be this that his her you your our we i my me as at by from it its about he she they them can will do does did has have what who whom which where when why how tell show give shubham shubham's mallick him would could should please know any some there their thing things"));
const stem = (w) => { for (const x of ["ing", "es", "s"]) if (w.length > 4 && w.endsWith(x)) return w.slice(0, -x.length); return w; };
const tokens = (t) => (String(t || "").toLowerCase().match(/[a-z0-9+#]+/g) || []).filter((w) => !STOP.has(w) && w.length > 1).map(stem);
const corpus = site.corpus.map((d) => ({ ...d, toks: new Set(tokens(d.text)) }));

export function retrieve(query, k = 6) {
  const q = new Set(tokens(query));
  if (!q.size) return [];
  return corpus.map((d) => {
    const overlap = [...q].filter((w) => d.toks.has(w)).length;
    return { text: d.text, meta: d.meta, overlap, score: overlap / q.size + 0.15 * overlap - d.toks.size / 4000 };
  }).filter((d) => d.overlap).sort((a, b) => b.score - a.score).slice(0, k);
}

const INJECTION = /ignore (all |any |the |your |my )?(previous|prior|above|earlier|system|instructions|rules)|disregard (the|your|all|any)|system prompt|your (instructions|prompt|rules|guidelines)|reveal (your|the) |developer mode|jailbreak|\bdan mode\b|you are now|act as (?!his)|pretend (to be|you)|roleplay|role-play|new instructions|override|forget (everything|your|all)/i;
const OFFTOPIC = /\b(write|compose|generate|draft|make) (me )?(a |an |some |the )?(poem|essay|story|song|code|script|program|function|letter|cover letter|joke|haiku)|\bweather\b|\bcapital of\b|\brecipe\b|\btranslate\b|\bhomework\b|\bsolve\b|\bstock (price|market)\b|\bnews\b|\bcricket\b|\bfootball\b|\bmovie\b|\bbitcoin\b|\b(fix|debug) (my|this)\b|\bwho (won|is the (president|prime minister|ceo))\b|\bmeaning of life\b|\bhow (do|can|to) (i|you) (make|cook|install python|lose)\b|\b\d+ ?[-+*/x] ?\d+\b/i;
const ABOUT_HIM = /shubham|\bhe\b|\bhis\b|\bhim\b|imurun|imutechz|learnify|hosteler|sasy/i;
export function guard(m) {
  if (INJECTION.test(m)) return "I can't change or share my instructions. I'm here to answer questions about Shubham: his work, projects, skills, education or how to reach him.";
  if (OFFTOPIC.test(m) && !ABOUT_HIM.test(m)) return "That's outside what I can help with here: I only answer questions about Shubham and his work. Try asking about his projects, skills, experience or how to reach him.";
  return null;
}

const sentences = (t) => t.split(/(?<=[.!?])\s+/);
function first(text, n = 2, limit = 360) {
  const out = sentences(text.trim().replace(/^[^:]{0,90}: /, "")).slice(0, n).join(" ").trim();
  if (out.length <= limit) return out;
  const cut = out.slice(0, limit);
  return cut.slice(0, cut.lastIndexOf(" ")) + "…";
}
const third = (s) => [[/\bI'm\b/g, "Shubham is"], [/\bI am\b/g, "Shubham is"], [/\bI've\b/g, "Shubham has"], [/\bI\b/g, "Shubham"], [/\bmy\b/g, "his"], [/\bMy\b/g, "His"], [/\bme\b/g, "him"]].reduce((x, [a, b]) => x.replace(a, b), s);
const proj = (name) => projs.find((x) => (x.title || "").toLowerCase().includes(name)) || null;
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

export function offline(message, hits) {
  const canned = guard(message || "");
  if (canned) return canned;
  const m = " " + String(message || "").toLowerCase().replace(/[^a-z0-9+#.&' ]/g, " ") + " ";
  const c = p.contact || {};
  const has = (...ks) => ks.some((k) => m.includes(k));

  if (has(" hi ", " hello", " hey ", "namaste", "good morning", "good evening") && m.length < 32) return "Hello! I'm SASY, Shubham's assistant. Ask me about his work, projects, skills, education or how to reach him.";
  if (has("who are you", "what are you", " sasy", "are you a bot", "are you ai", "are you human", "are you real")) return `I'm SASY, Shubham's assistant on this site. I answer questions about his work, projects, skills and education, using only what's on the site; for anything else, write to ${TO}.`;
  if (has("hire", "hiring", "open to work", "open for work", "available", "availability", "freelance", "opportunit", "collaborat", "recruit", "looking for a job", "looking for work", "job offer", "work with him", "work together", "open to")) return `No, Shubham isn't looking for a new role right now: he is an AI Developer intern at Potion Labs AI Technologies in Kolkata (on-site, since Oct 2026). He is open to collaborations and open-source contributions, so write to ${TO}.`;
  if (has("contact", "email", "e-mail", "reach", " mail", "linkedin", "connect", "talk to", "message him", "phone", "github")) return `You can email Shubham at **${c.email}**, or ${c.imutechz_email} for ImuTechz. He is also on ${c.linkedin} and ${c.github}, and /contact.html has a message form.`;
  if (has("imurun", "imu cli", "fish", "local first", "local-first", " imu ")) {
    const x = proj("imurun") || {}, about = p.imurun || "";
    const inst = about.match(/Install: ([^.]+)\./);
    let out = `**IMURUN**${x.version ? ` (${x.version})` : ""}: ${x.desc || first(about, 1)}`;
    if (inst) out += ` Install with ${inst[1].trim().replace(/^(\S+ install \S+)/, "`$1`")}.`;
    const docs = (x.docs || "").replace("https://", "").replace("www.", "");
    if (docs) out += ` Docs: ${docs}.`;
    return has(" cli", "terminal", "command line", "command-line") ? "No, IMURUN is a local-first AI chat app, not a CLI. " + out : out;
  }
  if (has("agents", "skills directory", "directory")) {
    const x = proj("agents");
    return (x ? x.desc || "" : "The ImuTechz Agents & Skills directory has over 10,000 open-source entries.") + " It lives at imutechz.in/agents.";
  }
  if (has("hosteler")) return "Shubham founded Hosteler India and ran it as Founder & Managing Director from Aug to Oct 2026 (now concluded): e-commerce for hostel students with essentials, wishlist, cart, student discounts and free pan-India delivery, at hosteler.shop.";
  if (has("imutechz", "organisation", "organization", "studio", "agency", "company", "founded", "founder", "r&d") && !has("learnify", "veda", "check & mate", "check and mate", "innova")) return "**ImuTechz** (imutechz.in) is the open-source research & development organisation Shubham founded in Oct 2026. It builds IMURUN, the FISH inference engine, the Agents & Skills directory and imutechz.in, in public, with contributors welcome.";
  if (has("veda")) {
    const x = proj("learnify") || {};
    let f = sentences(x.detail || "").find((t) => t.includes("Veda, a multilingual")) || "";
    if (f) {
      f = f.replace("Learnify's first version", "**Veda** was part of Learnify's first version:").replace("built around Veda, a multilingual AI assistant that", "built around Veda, its multilingual AI assistant, which").replace(": was ", ": ");
      return f + " Learnify was a team project for the Innova 5.0 competition, with Shubham as lead developer; today it is Check & Mate, a learning-management portal.";
    }
  }
  if (has("learnify", "check & mate", "check and mate", "checkmate", "innova", " lms")) {
    const x = proj("learnify") || {}, site = (x.link || "").replace("https://", "").replace(/\/+$/, "");
    let desc = x.desc || "";
    desc = desc.startsWith("Learnify") ? desc.replace("Learnify", "**Learnify**") : `**Learnify**: ${desc}`;
    let lead = "";
    if (has("founder", "found ", "founded", "owner", "own it")) lead = "No, Shubham wasn't Learnify's founder: it's a team project, and he was its lead developer. ";
    else if (has("role", "position", "what did he do", "lead", "team")) lead = "Shubham was the lead developer on the Learnify team. ";
    return lead + desc + (site ? ` Live at ${site}.` : "");
  }
  for (const k of ["chhaya", "reciprocity", "grbs", "imutechz-web"]) if (m.includes(k)) { const x = proj(k); if (x) return `**${x.title}**: ${x.desc || ""} Link: ${x.link || ""}`; }
  if (has(" know ", " use ", " used ", "familiar", "experience with", "worked with", " work with", "good at", "can he")) {
    const generic = new Set(words("does do did he shubham know use used uses familiar with experience worked work any have has can the a an is in of and or about good at how well much his him"));
    const terms = (m.match(/[a-z0-9+#.]+/g) || []).filter((w) => !generic.has(w) && w.length > 1).map((w) => w.replace(/^\.+|\.+$/g, ""));
    const hay = site.digest.toLowerCase();
    const missing = terms.find((w) => !hay.includes(w));
    if (terms.length && missing !== undefined) return `${cap(missing)} isn't listed in Shubham's skills or projects, so I can't say he has used it. His core stack is Python, FastAPI, SQL/PostgreSQL, RAG and LLM agents; for anything else, ask at ${TO}.`;
    if (terms.length) {
      const names = new Map();
      for (const s of skills) for (const i of s.items || []) names.set((i.name || "").toLowerCase(), i.name || "");
      for (const x of projs) for (const t of x.stack || []) if (!names.has(t.toLowerCase())) names.set(t.toLowerCase(), t);
      return `Yes, ${terms.map((t) => names.get(t) || t).join(" and ")} is in Shubham's listed skills or projects. /about.html shows how deep each skill goes.`;
    }
  }
  if (has("potion", "autom8x", "swot", " now", "current", "currently", "working on", "doing these days", " job", "employ", "work at", "works at", "intern", "work for", "works for")) return "Right now Shubham is:\n- **AI Developer intern** at Potion Labs AI Technologies, Kolkata (on-site, Oct 2026 – now)\n- **Founder** of ImuTechz, an open-source R&D organisation (Oct 2026 – now)\n- **AI Intern** at Autom8x / SWOT Management, US (remote, Jul 2026 – now)";
  if (has("gdg", "google developer")) return "Yes. Shubham has been a member of Google Developer Groups On Campus, Kolkata since Jun 2026: technical workshops, developer events and community-driven learning.";
  if (has(" ncc", "cadet")) return "Shubham was a cadet in the National Cadet Corps, 6 Bengal Battalion (May 2022 – Dec 2023), and earned the A-grade certificate.";
  if (has("motto", "tagline")) return `Shubham's motto: "${p.motto || "Shipped, not just built."}"`;
  if (has("experience", "work history", "career", "path", "timeline", "roles")) return "Shubham's path so far:\n- " + (p.experience || []).slice(0, 5).map((e) => `${e.role}, ${e.org} (${e.when})`).join("\n- ") + "\n\nThe full timeline is at /experience.html.";
  if (has("educat", "study", "studies", "studying", "college", "university", "degree", "makaut", "b.tech", "btech", "school", "jnv", "navodaya", "semester", "student", "qualification")) {
    const e = p.education || [];
    if (e.length > 1) return `Shubham is studying **${e[0].what}** at MAKAUT, West Bengal (${e[0].when}), currently in Semester 3. Before that he completed ${e[1].what} at ${e[1].where} (${e[1].when}).`;
  }
  if (has("skill", "stack", "tech", "language", "python", "fastapi", " rag", "llm", "tools")) {
    const top = skills.map((s) => [s.cat, (s.items || []).filter((i) => (i.level || 0) >= 75).slice(0, 4).map((i) => i.name)]).filter(([, x]) => x.length).map(([a, x]) => `${a}: ${x.join(", ")}`);
    return "Shubham's core stack:\n- " + top.slice(0, 5).join("\n- ");
  }
  if (has("project", "built", "build", "portfolio", " work", "ship", "made")) return "Shubham's projects include " + projs.map((x) => x.title).slice(0, 7).join(", ") + ". Details and live links are on /work.html.";
  if (has("certif", "course")) return "Shubham's certifications: " + (p.certifications || []).join(", ") + ".";
  if (has("speak", "languages")) return "Shubham speaks " + (p.languages || []).join(" and ") + ".";
  if (has("where", "location", "based", " live", "city", " from ")) return `Shubham is based in ${p.location || "West Bengal, India"}`;
  if (has("goal", "mission", "future", " plan", " aim", "dream")) return p.mission || "";
  if (has("who is", "who's", "about him", "about shubham", "summary", "profile", "resume", " cv ", "introduce", "tell me about")) return "**Shubham Mallick** is a Python backend and applied-AI developer and the founder of ImuTechz, an open-source R&D organisation. He is an AI Developer intern at Potion Labs AI Technologies in Kolkata and studies B.Tech CSE (AI) at MAKAUT.";
  const h = hits || retrieve(message), q = new Set(tokens(message));
  if (h.length && q.size && h[0].overlap >= Math.max(2, Math.floor((q.size + 1) / 2))) return "From his site: " + third(first(h[0].text));
  return `His site doesn't say, so I'd rather not guess. You can ask Shubham directly at ${TO}.`;
}

export const cleanReply = (t) => String(t || "").replace(/<think>[\s\S]*?<\/think>/g, "").trim().replace(/^#{1,6}\s*/gm, "").slice(0, 1400).trim();
export { site };
