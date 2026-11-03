// bilgecagaydogdu.com — static site + one API route that saves contact-form
// submissions to D1. Static assets are served automatically by the platform;
// this Worker only runs for requests that don't match a file in /public.

const APPLICATIONS = new Set([
  "Displacement", "Migration", "Crisis preparedness", "Early warning",
  "Population distribution and mobility statistics", "Crisis response",
  "Other / Not sure yet",
]);
const OBSTACLES = new Set([
  "Access to data", "Technical capacity and expertise",
  "Privacy and legal considerations", "Uncertainty about possible use cases",
  "Costs and institutional resources", "Not applicable / Other",
]);
const ORG_TYPES = new Set([
  "Government / public authority", "International organization / NGO",
  "Research / academia", "Private sector", "Other",
]);
const INTERESTS = new Set([
  "Yes, I have a concrete use case", "Possibly, I'd like to learn more",
  "Not at the moment",
]);

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });

const clean = (v, max) =>
  typeof v === "string" ? v.replace(/\u0000/g, "").trim().slice(0, max) : "";

const pickList = (v, allowed) =>
  Array.isArray(v) ? [...new Set(v.filter((x) => allowed.has(x)))] : [];

async function handleContact(request, env) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: "Invalid request." }, 400);
  }

  // Honeypot: real users leave this empty; bots fill every field.
  if (clean(body.website, 100)) return json({ ok: true });

  const org_type = ORG_TYPES.has(body.org_type) ? body.org_type : "";
  const applications = pickList(body.applications, APPLICATIONS);
  const obstacles = pickList(body.obstacles, OBSTACLES);
  const interest = INTERESTS.has(body.interest) ? body.interest : "";
  const message = clean(body.message, 5000);
  const contact_name = clean(body.contact_name, 200);
  const contact_email = clean(body.contact_email, 320);
  const contact_org = clean(body.contact_org, 300);
  const consent = body.consent === true || body.consent === 1 ? 1 : 0;
  const source = clean(body.source, 120);

  // Require at least something meaningful.
  if (!org_type && !applications.length && !obstacles.length && !interest &&
      !message && !contact_email) {
    return json({ ok: false, error: "Please fill in at least one field." }, 400);
  }
  // Basic email sanity + consent gate for follow-up.
  if (contact_email) {
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(contact_email)) {
      return json({ ok: false, error: "That email address looks off." }, 400);
    }
    if (!consent) {
      return json({ ok: false, error: "Please tick the consent box so I may reply." }, 400);
    }
  }

  try {
    await env.DB.prepare(
      `INSERT INTO submissions
       (created_at, org_type, applications, obstacles, interest, message,
        contact_name, contact_email, contact_org, consent, source, country, user_agent)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`
    ).bind(
      new Date().toISOString(),
      org_type || null,
      applications.length ? JSON.stringify(applications) : null,
      obstacles.length ? JSON.stringify(obstacles) : null,
      interest || null,
      message || null,
      contact_name || null,
      contact_email || null,
      contact_org || null,
      consent,
      source || null,
      request.headers.get("cf-ipcountry") || null,
      clean(request.headers.get("user-agent") || "", 400) || null,
    ).run();
  } catch (err) {
    return json({ ok: false, error: "Could not save — please try again." }, 500);
  }

  return json({ ok: true });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/contact") {
      if (request.method === "POST") return handleContact(request, env);
      return json({ ok: false, error: "Method not allowed." }, 405);
    }
    // Everything else is a static asset (or the 404 page).
    return env.ASSETS.fetch(request);
  },
};
