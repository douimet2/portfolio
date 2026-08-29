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
  // credentials: "omit" is required — a wildcard Access-Control-Allow-Origin
  // (which /api/track uses, since any app's origin may call it) is rejected
  // by browsers if the request carries credentials, and sendBeacon() sends
  // credentials cross-origin with no way to opt out, so plain fetch it is.
  fetch(TRACK_URL, {
    method: "POST",
    body: payload,
    headers: { "Content-Type": "application/json" },
    credentials: "omit",
    keepalive: true,
  }).catch(() => {});
}
