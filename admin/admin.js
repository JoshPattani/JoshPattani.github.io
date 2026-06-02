import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const config = window.PORTFOLIO_ANALYTICS_CONFIG || {};
const supabaseUrl = stringOrEmpty(config.supabaseUrl);
const supabaseKey = stringOrEmpty(config.supabasePublishableKey || config.supabaseAnonKey);
const analyticsTable = "portfolio_events";

const elements = {
  configWarning: document.getElementById("config-warning"),
  authView: document.getElementById("auth-view"),
  dashboardView: document.getElementById("dashboard-view"),
  authStatus: document.getElementById("auth-status"),
  loginForm: document.getElementById("login-form"),
  authMessage: document.getElementById("auth-message"),
  dashboardMessage: document.getElementById("dashboard-message"),
  dateRange: document.getElementById("date-range"),
  refreshButton: document.getElementById("refresh-button"),
  logoutButton: document.getElementById("logout-button"),
  totalEvents: document.getElementById("total-events"),
  pageViews: document.getElementById("page-views"),
  projectViews: document.getElementById("project-views"),
  contactResumeClicks: document.getElementById("contact-resume-clicks"),
  dailyBars: document.getElementById("daily-bars"),
  topPagesBody: document.getElementById("top-pages-body"),
  topReferrersBody: document.getElementById("top-referrers-body"),
  recentEventsBody: document.getElementById("recent-events-body")
};

let supabase = null;
let currentSession = null;
const numberFormat = new Intl.NumberFormat();
const dateTimeFormat = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short"
});

function stringOrEmpty(value) {
  return typeof value === "string" ? value.trim() : "";
}

function show(element, shouldShow) {
  if (element) {
    element.hidden = !shouldShow;
  }
}

function setText(element, value) {
  if (element) {
    element.textContent = value;
  }
}

function setLoading(isLoading) {
  elements.refreshButton.disabled = isLoading;
  elements.dateRange.disabled = isLoading;
}

function getRangeStart() {
  const now = Date.now();
  const value = elements.dateRange.value;
  if (value === "24h") return new Date(now - 24 * 60 * 60 * 1000);
  if (value === "7d") return new Date(now - 7 * 24 * 60 * 60 * 1000);
  if (value === "30d") return new Date(now - 30 * 24 * 60 * 60 * 1000);
  return null;
}

function eventDeviceLabel(event) {
  return [event.device_type, event.browser_family].filter(Boolean).join(" / ") || "unknown";
}

function createCell(value, options = {}) {
  const cell = document.createElement("td");
  if (options.strong) {
    const strong = document.createElement("strong");
    strong.textContent = value;
    cell.append(strong);
  } else {
    cell.textContent = value;
  }
  if (options.className) {
    cell.className = options.className;
  }
  return cell;
}

function appendRow(tbody, cells) {
  const row = document.createElement("tr");
  cells.forEach((cell) => row.append(createCell(cell.value, cell.options)));
  tbody.append(row);
}

function appendEmptyRow(tbody, colspan, message) {
  const row = document.createElement("tr");
  const cell = createCell(message, { className: "empty-cell" });
  cell.colSpan = colspan;
  row.append(cell);
  tbody.append(row);
}

function groupCounts(rows, keyFn) {
  return rows.reduce((map, row) => {
    const key = keyFn(row);
    if (!key) return map;
    map.set(key, (map.get(key) || 0) + 1);
    return map;
  }, new Map());
}

function sortedCounts(countMap, limit) {
  return Array.from(countMap.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit);
}

function renderSummary(rows) {
  const pageViews = rows.filter((row) => row.event_name === "page_view").length;
  const projectViews = rows.filter((row) => {
    return row.event_name === "project_view" ||
      (row.event_name === "page_view" && /^\/projects\//i.test(row.path || ""));
  }).length;
  const contactResumeClicks = rows.filter((row) => {
    return ["contact_click", "contact_submit", "resume_click"].includes(row.event_name);
  }).length;

  setText(elements.totalEvents, numberFormat.format(rows.length));
  setText(elements.pageViews, numberFormat.format(pageViews));
  setText(elements.projectViews, numberFormat.format(projectViews));
  setText(elements.contactResumeClicks, numberFormat.format(contactResumeClicks));
}

function renderDailyBars(rows) {
  elements.dailyBars.replaceChildren();
  const byDay = groupCounts(rows, (row) => {
    const date = new Date(row.created_at);
    return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
  });
  const counts = sortedCounts(byDay, 60).sort((a, b) => a[0].localeCompare(b[0]));
  const maxCount = Math.max(1, ...counts.map((entry) => entry[1]));

  if (!counts.length) {
    const empty = document.createElement("p");
    empty.className = "empty-cell";
    empty.textContent = "No events yet.";
    elements.dailyBars.append(empty);
    return;
  }

  counts.forEach(([day, count]) => {
    const bar = document.createElement("div");
    bar.className = "daily-bar";

    const value = document.createElement("div");
    value.className = "daily-bar__value";
    value.textContent = numberFormat.format(count);

    const track = document.createElement("div");
    track.className = "daily-bar__track";

    const fill = document.createElement("div");
    fill.className = "daily-bar__fill";
    fill.style.height = `${Math.max(4, Math.round((count / maxCount) * 100))}%`;
    track.append(fill);

    const label = document.createElement("div");
    label.className = "daily-bar__label";
    label.textContent = day.slice(5);

    bar.append(value, track, label);
    elements.dailyBars.append(bar);
  });
}

function renderTopPages(rows) {
  elements.topPagesBody.replaceChildren();
  const pageRows = rows.filter((row) => row.event_name === "page_view");
  const counts = groupCounts(pageRows, (row) => `${row.path || "/"}|${row.page_title || ""}`);
  const topPages = sortedCounts(counts, 10);

  if (!topPages.length) {
    appendEmptyRow(elements.topPagesBody, 3, "No page views yet.");
    return;
  }

  topPages.forEach(([key, count]) => {
    const [path, title] = key.split("|");
    appendRow(elements.topPagesBody, [
      { value: path, options: { strong: true } },
      { value: title || "Untitled" },
      { value: numberFormat.format(count) }
    ]);
  });
}

function renderTopReferrers(rows) {
  elements.topReferrersBody.replaceChildren();
  const counts = groupCounts(rows, (row) => row.referrer_domain || "");
  const referrers = sortedCounts(counts, 10);

  if (!referrers.length) {
    appendEmptyRow(elements.topReferrersBody, 2, "No referrers yet.");
    return;
  }

  referrers.forEach(([domain, count]) => {
    appendRow(elements.topReferrersBody, [
      { value: domain, options: { strong: true } },
      { value: numberFormat.format(count) }
    ]);
  });
}

function renderRecentEvents(rows) {
  elements.recentEventsBody.replaceChildren();
  const recentRows = rows.slice(0, 50);

  if (!recentRows.length) {
    appendEmptyRow(elements.recentEventsBody, 5, "No events yet.");
    return;
  }

  recentRows.forEach((event) => {
    const createdAt = new Date(event.created_at);
    appendRow(elements.recentEventsBody, [
      { value: Number.isNaN(createdAt.getTime()) ? "" : dateTimeFormat.format(createdAt) },
      { value: event.event_name || "" },
      { value: event.path || "/" },
      { value: event.referrer_domain || "direct" },
      { value: eventDeviceLabel(event) }
    ]);
  });
}

function renderDashboard(rows) {
  renderSummary(rows);
  renderDailyBars(rows);
  renderTopPages(rows);
  renderTopReferrers(rows);
  renderRecentEvents(rows);
}

async function loadEvents() {
  if (!supabase || !currentSession) {
    return;
  }

  setLoading(true);
  setText(elements.dashboardMessage, "Loading analytics...");

  let query = supabase
    .from(analyticsTable)
    .select("created_at,event_name,path,page_title,referrer_domain,device_type,browser_family,os_family,viewport_width_bucket,metadata")
    .order("created_at", { ascending: false })
    .limit(2000);

  const rangeStart = getRangeStart();
  if (rangeStart) {
    query = query.gte("created_at", rangeStart.toISOString());
  }

  const { data, error } = await query;
  setLoading(false);

  if (error) {
    setText(elements.dashboardMessage, error.message);
    renderDashboard([]);
    return;
  }

  const rows = Array.isArray(data) ? data : [];
  setText(elements.dashboardMessage, rows.length ? "" : "No analytics events found for this range.");
  renderDashboard(rows);
}

function renderAuthState() {
  const signedIn = Boolean(currentSession);
  show(elements.authView, !signedIn);
  show(elements.dashboardView, signedIn);
  setText(elements.authStatus, signedIn ? "Signed in" : "Signed out");

  if (signedIn) {
    loadEvents();
  }
}

async function handleLogin(event) {
  event.preventDefault();
  const formData = new FormData(elements.loginForm);
  const email = stringOrEmpty(formData.get("email"));
  if (!email) {
    return;
  }

  setText(elements.authMessage, "Sending sign-in link...");
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/admin/`
    }
  });

  setText(
    elements.authMessage,
    error ? error.message : "Check your email for the sign-in link."
  );
}

async function handleLogout() {
  await supabase.auth.signOut();
  currentSession = null;
  renderAuthState();
}

async function init() {
  if (!supabaseUrl || !supabaseKey) {
    show(elements.configWarning, true);
    show(elements.authView, false);
    show(elements.dashboardView, false);
    setText(elements.authStatus, "Config missing");
    return;
  }

  supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  });

  elements.loginForm.addEventListener("submit", handleLogin);
  elements.logoutButton.addEventListener("click", handleLogout);
  elements.refreshButton.addEventListener("click", loadEvents);
  elements.dateRange.addEventListener("change", loadEvents);

  supabase.auth.onAuthStateChange((_event, session) => {
    currentSession = session;
    renderAuthState();
  });

  const { data, error } = await supabase.auth.getSession();
  if (error) {
    setText(elements.authMessage, error.message);
  }
  currentSession = data.session;
  renderAuthState();
}

init();
