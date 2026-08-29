// Shared App Health Dashboard tracking snippet.
// See https://github.com/douimet2/app-health-dashboard/tree/main/snippets
const APP_ID = "portfolio";
const TRACK_URL = "https://app-health-ingest.vercel.app/api/track";

function sessionId() {
  let id = sessionStorage.getItem("_ahd_sid");
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem("_ahd_sid", id);
  }
  return id;
}

export function track(eventType, meta) {
  if (typeof window === "undefined") return;
  const payload = JSON.stringify({
    app_id: APP_ID,
    event_type: eventType,
    path: window.location.pathname,
    session_id: sessionId(),
    meta,
  });
  // No sendBeacon (it always sends credentials cross-origin, no way to opt
  // out) and no `keepalive: true` either — Chromium has a long-standing bug
  // where fetch() with keepalive ignores credentials: "omit" and sends them
  // anyway. Either one gets rejected by a wildcard Access-Control-Allow-Origin
  // (which /api/track must use, since any app's origin may call it).
  fetch(TRACK_URL, {
    method: "POST",
    body: payload,
    headers: { "Content-Type": "application/json" },
    credentials: "omit",
  }).catch(() => {});
}
