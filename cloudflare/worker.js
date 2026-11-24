/* shubham.imutechz.in: the static site plus the API that used to be FastAPI
   (frontend/api/index.py). The model is the same one, run by Workers AI. */
import { MAX_MSG, cleanReply, guard, offline, retrieve, site } from "./sasy.js";

const MODEL = "@cf/openai/gpt-oss-20b";
const json = (body, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } });
const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/* counted in D1, so it holds across Workers. The address itself is not kept. */
async function limited(request, env, bucket, max, windowSec) {
  const ip = request.headers.get("cf-connecting-ip") || "unknown";
  const slot = Math.floor(Date.now() / 1000 / windowSec);
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`${bucket}|${slot}|${ip}`));
  const key = [...new Uint8Array(bytes).slice(0, 12)].map((b) => b.toString(16).padStart(2, "0")).join("");
  const until = (slot + 1) * windowSec;
  const r = await env.DB.prepare("insert into hits (key, n, until) values (?, 1, ?) on conflict(key) do update set n = n + 1 returning n").bind(key, until).first();
  if (Math.random() < 0.02) await env.DB.prepare("delete from hits where until < ?").bind(Math.floor(Date.now() / 1000)).run();
  return (r?.n || 0) > max;
}

async function askModel(env, msg, history, ctx) {
  const messages = [{ role: "system", content: `${site.system}\n\nSHUBHAM'S PROFILE (the only source of truth):\n${site.digest}\n\nSITE NOTES (retrieved for this question):\n${ctx}` }];
  for (const h of history.slice(-6)) if (h && (h.role === "user" || h.role === "assistant") && h.content) messages.push({ role: h.role, content: String(h.content).slice(0, MAX_MSG * 3) });
  messages.push({ role: "user", content: msg });
  try {
    const r = await Promise.race([
      env.AI.run(MODEL, { messages, temperature: 0.3, max_tokens: 750, reasoning_effort: "low" }),
      new Promise((_, no) => setTimeout(() => no(new Error("timeout")), 15_000)),
    ]);
    return cleanReply(r?.choices?.[0]?.message?.content || r?.response || "");
  } catch (e) { console.error(`[ai] ${String(e?.message || e).slice(0, 150)}`); return ""; }
}

async function chat(request, env, ctx) {
  if (await limited(request, env, "chat", 20, 60)) return json({ reply: "You're sending messages quickly. Please wait a minute and try again.", error: "rate_limited" }, 429);
  const b = await request.json().catch(() => ({})) || {};
  const msg = String(b.message || "").trim();
  if (!msg) return json({ reply: "Ask me anything about Shubham: his work, projects, skills or how to reach him." });
  if (msg.length > MAX_MSG) return json({ reply: `That message is a bit long. Please keep it under ${MAX_MSG} characters.`, error: "too_long" }, 413);
  const session = String(b.session || "").slice(0, 64) || null;
  let reply = guard(msg);
  if (!reply) {
    const hits = retrieve(msg);
    let notes = hits.length ? hits.map((h) => `[${h.meta}]\n${h.text}`).join("\n\n") : "(none)";
    if (session) {
      const past = await env.DB.prepare("select role, text from chats where session = ? order by id desc limit 14").bind(session).all().catch(() => null);
      const memory = (past?.results || []).reverse().map((d) => `${d.role}: ${d.text}`).join("\n");
      if (memory) notes += "\n\nEARLIER IN THIS VISITOR'S CHATS (context only, not facts):\n" + memory.slice(-2000);
    }
    reply = await askModel(env, msg, Array.isArray(b.history) ? b.history : [], notes) || offline(msg, hits);
  }
  const now = new Date().toISOString();
  const add = env.DB.prepare("insert into chats (at, session, role, text) values (?,?,?,?)");
  ctx.waitUntil(env.DB.batch([add.bind(now, session || "anon", "user", msg), add.bind(now, session || "anon", "assistant", reply)]).catch(() => {}));
  return json({ reply });
}

async function contact(request, env) {
  const b = await request.json().catch(() => null);
  if (!b || ["name", "email", "message"].some((k) => typeof b[k] !== "string")) return json({ ok: false, detail: "All fields are required." }, 422);
  const name = b.name.trim(), email = b.email.trim(), message = b.message.trim();
  if (!name || !email || !message) return json({ ok: false, detail: "All fields are required." }, 422);
  if (name.length > 120 || email.length > 254 || message.length > 5000) return json({ ok: false, detail: "That's too long: keep the name under 120 characters and the message under 5,000." }, 422);
  if (!EMAIL.test(email)) return json({ ok: false, detail: "Invalid email address." }, 422);
  if (await limited(request, env, "contact", 5, 600)) return json({ ok: false, detail: "Too many messages in a short time. Please try again later, or email shubham.mallick1440@gmail.com." }, 429);
  /* a message that cannot be stored must not look sent */
  try { await env.DB.prepare("insert into messages (at, name, email, message) values (?,?,?,?)").bind(new Date().toISOString(), name, email, message).run(); } catch {
    return json({ ok: false, detail: "Your message could not be saved. Please email shubham.mallick1440@gmail.com." }, 503);
  }
  return json({ ok: true });
}

async function api(request, env, ctx, url) {
  const m = request.method;
  if (url.pathname === "/api/chat" && m === "POST") return chat(request, env, ctx);
  if (url.pathname === "/api/contact" && m === "POST") return contact(request, env);
  if (m !== "GET") return json({ detail: "not found" }, 404);
  if (url.pathname === "/api/projects") { const n = await directorySize(env); return json(n ? JSON.parse(JSON.stringify(site.projects).replaceAll(WROTE, n)) : site.projects); }
  if (url.pathname === "/api/skills") return json(site.skills);
  if (url.pathname === "/api/visits") {
    const inc = url.searchParams.get("inc") !== "false" && !(await limited(request, env, "visit", 10, 3600));
    if (inc) await env.DB.prepare("insert into visits (day, n) values (?, 1) on conflict(day) do update set n = n + 1").bind(new Date().toISOString().slice(0, 10)).run();
    const r = await env.DB.prepare("select sum(n) as n from visits").first();
    return json({ count: r?.n || 0 });
  }
  return json({ detail: "not found" }, 404);
}

/* the directory's size as it is now, in the pages that mention it */
const WROTE = "10,631";
let known = { n: null, at: 0 };
async function directorySize(env) {
  if (Date.now() - known.at < 300_000) return known.n;
  const r = await env.CATALOG.prepare("select sum(n) as n from catalog_counts").first().catch(() => null);
  known = { n: r?.n ? Number(r.n).toLocaleString("en-US") : null, at: Date.now() };
  return known.n;
}
async function page(env, request) {
  const headers = new Headers(request.headers);
  headers.delete("if-none-match");
  const res = await env.ASSETS.fetch(new Request(request.url, { method: request.method, headers }));
  const n = res.ok && request.method === "GET" ? await directorySize(env) : null;
  if (!n) return res;
  const out = new Headers(res.headers);
  out.delete("etag");
  out.delete("content-length");
  return new Response((await res.text()).replaceAll(WROTE, n), { status: res.status, headers: out });
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === "/api" || url.pathname.startsWith("/api/")) {
      try { return await api(request, env, ctx, url); } catch (e) { console.error(`[api] ${String(e?.message || e).slice(0, 150)}`); return json({ detail: "error" }, 500); }
    }
    if (/^\/(all-)?projects(\.html)?$/.test(url.pathname)) return Response.redirect(new URL("/work.html", url.origin), 301);
    if (request.method !== "GET" && request.method !== "HEAD") return json({ detail: "not found" }, 404);
    /* same addresses as before: /work and /work.html both answer, nothing redirects */
    if (url.pathname !== "/" && !url.pathname.slice(1).includes("/") && !url.pathname.includes(".")) {
      url.pathname += ".html";
      return page(env, new Request(url, request));
    }
    if (url.pathname.endsWith("/")) { url.pathname = "/index.html"; return page(env, new Request(url, request)); }
    return url.pathname.endsWith(".html") ? page(env, request) : env.ASSETS.fetch(request);
  },
};
