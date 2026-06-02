(function () {
  "use strict";

  const config = window.PORTFOLIO_ANALYTICS_CONFIG || {};
  const EVENT_ENDPOINT = stringOrEmpty(config.endpoint);
  const SITE_ID = stringOrEmpty(config.siteId);
  const SOURCE = stringOrEmpty(config.source) || "portfolio";
  const MAX_METADATA_KEYS = 12;
  const MAX_METADATA_VALUE_LENGTH = 120;
  const LOCAL_HOSTS = new Set(["", "localhost", "127.0.0.1", "::1"]);
  let lastTrackedPageKey = "";

  function stringOrEmpty(value) {
    return typeof value === "string" ? value.trim() : "";
  }

  function isEnabledFlag(value) {
    return value === true || value === "true" || value === "1";
  }

  function debugLog(...args) {
    if (isEnabledFlag(config.debug)) {
      console.info("[analytics]", ...args);
    }
  }

  function shouldTrack() {
    if (!isEnabledFlag(config.enabled) || !EVENT_ENDPOINT || !SITE_ID) {
      return false;
    }

    if (config.respectDoNotTrack !== false) {
      const dnt = navigator.doNotTrack || window.doNotTrack || navigator.msDoNotTrack;
      if (dnt === "1" || dnt === "yes") {
        return false;
      }
    }

    if (LOCAL_HOSTS.has(window.location.hostname) && !isEnabledFlag(config.trackLocalhost)) {
      return false;
    }

    return true;
  }

  function safeText(value, maxLength) {
    if (typeof value !== "string") {
      return "";
    }

    return value
      .replace(/[\u0000-\u001f\u007f]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, maxLength);
  }

  function currentPath() {
    return window.location.pathname || "/";
  }

  function pageKey() {
    return `${currentPath()}|${document.title}`;
  }

  function referrerDomain() {
    if (!document.referrer) {
      return "";
    }

    try {
      const url = new URL(document.referrer);
      if (url.hostname === window.location.hostname) {
        return "";
      }
      return url.hostname.replace(/^www\./, "").slice(0, 120);
    } catch (_error) {
      return "";
    }
  }

  function getUtmParam(name) {
    const value = new URLSearchParams(window.location.search).get(name);
    return value ? safeText(value, 80) : "";
  }

  function viewportWidthBucket() {
    const width = window.innerWidth || document.documentElement.clientWidth || 0;
    if (width < 480) return "lt_480";
    if (width < 768) return "480_767";
    if (width < 1024) return "768_1023";
    if (width < 1440) return "1024_1439";
    return "gte_1440";
  }

  function deviceType() {
    const ua = navigator.userAgent || "";
    if (/ipad|tablet|playbook|silk/i.test(ua)) return "tablet";
    if (/mobile|iphone|ipod|android.*mobile|windows phone/i.test(ua)) return "mobile";
    return "desktop";
  }

  function browserFamily() {
    const ua = navigator.userAgent || "";
    if (/edg\//i.test(ua)) return "edge";
    if (/firefox|fxios/i.test(ua)) return "firefox";
    if (/safari/i.test(ua) && !/chrome|chromium|crios|android/i.test(ua)) return "safari";
    if (/chrome|chromium|crios/i.test(ua)) return "chrome";
    return "unknown";
  }

  function osFamily() {
    const ua = navigator.userAgent || "";
    if (/iphone|ipad|ipod/i.test(ua)) return "ios";
    if (/android/i.test(ua)) return "android";
    if (/windows/i.test(ua)) return "windows";
    if (/mac os|macintosh/i.test(ua)) return "macos";
    if (/linux/i.test(ua)) return "linux";
    return "unknown";
  }

  function safeMetadata(metadata) {
    if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
      return {};
    }

    return Object.entries(metadata).slice(0, MAX_METADATA_KEYS).reduce((result, [key, value]) => {
      const safeKey = safeText(key, 40);
      if (!safeKey) {
        return result;
      }

      if (typeof value === "string") {
        result[safeKey] = safeText(value, MAX_METADATA_VALUE_LENGTH);
      } else if (typeof value === "number" && Number.isFinite(value)) {
        result[safeKey] = value;
      } else if (typeof value === "boolean") {
        result[safeKey] = value;
      }

      return result;
    }, {});
  }

  function buildPayload(eventName, metadata) {
    return {
      event_name: eventName,
      site_id: SITE_ID,
      source: SOURCE,
      path: currentPath(),
      page_title: safeText(document.title, 160),
      referrer_domain: referrerDomain(),
      utm_source: getUtmParam("utm_source"),
      utm_medium: getUtmParam("utm_medium"),
      utm_campaign: getUtmParam("utm_campaign"),
      device_type: deviceType(),
      browser_family: browserFamily(),
      os_family: osFamily(),
      viewport_width_bucket: viewportWidthBucket(),
      language: safeText(navigator.language || "", 32),
      timezone_offset_minutes: new Date().getTimezoneOffset(),
      metadata: safeMetadata(metadata)
    };
  }

  function sendEvent(eventName, metadata) {
    if (!shouldTrack()) {
      return;
    }

    const body = JSON.stringify(buildPayload(eventName, metadata));

    try {
      if (navigator.sendBeacon) {
        const blob = new Blob([body], { type: "text/plain;charset=UTF-8" });
        if (navigator.sendBeacon(EVENT_ENDPOINT, blob)) {
          debugLog("sent beacon", eventName);
          return;
        }
      }

      fetch(EVENT_ENDPOINT, {
        method: "POST",
        mode: "cors",
        keepalive: true,
        headers: { "Content-Type": "application/json" },
        body
      }).catch(() => {});
      debugLog("sent fetch", eventName);
    } catch (_error) {
      // Analytics must never affect the portfolio experience.
    }
  }

  function projectSlugFromPath(path) {
    const cleanPath = path.replace(/\/$/, "");
    const parts = cleanPath.split("/").filter(Boolean);
    const lastPart = parts[parts.length - 1] || "home";
    return lastPart.replace(/\.html$/i, "");
  }

  function trackPageView() {
    const key = pageKey();
    if (key === lastTrackedPageKey) {
      return;
    }

    lastTrackedPageKey = key;
    const path = currentPath();
    sendEvent("page_view");

    if (/^\/projects\//i.test(path) || /^\/WA\/wa14\.html$/i.test(path)) {
      sendEvent("project_view", {
        projectSlug: projectSlugFromPath(path)
      });
    }
  }

  function hrefInfo(anchor) {
    const rawHref = anchor.getAttribute("href") || "";
    if (!rawHref) {
      return null;
    }

    try {
      return {
        rawHref,
        url: new URL(rawHref, window.location.href)
      };
    } catch (_error) {
      return null;
    }
  }

  function isExternal(url) {
    return url.protocol === "http:" || url.protocol === "https:"
      ? url.hostname !== window.location.hostname
      : false;
  }

  function linkLabel(anchor, eventName) {
    if (eventName === "contact_click" && /^mailto:/i.test(anchor.getAttribute("href") || "")) {
      return "Email";
    }

    const label = anchor.getAttribute("aria-label") || anchor.textContent || "";
    return safeText(label.replace(/\S+@\S+/g, "email"), 80);
  }

  function classifyLink(anchor, info) {
    const rawHref = info.rawHref.toLowerCase();
    const host = info.url.hostname.toLowerCase();
    const path = info.url.pathname.toLowerCase();
    const hash = info.url.hash.toLowerCase();

    if (rawHref.startsWith("mailto:") || rawHref.startsWith("tel:") || hash === "#contact") {
      return "contact_click";
    }

    if (path.includes("resume") || path.endsWith(".pdf")) {
      return "resume_click";
    }

    if (host.includes("github.com")) {
      return "github_click";
    }

    if (host.includes("linkedin.com")) {
      return "linkedin_click";
    }

    if (!isExternal(info.url) && (/^\/projects\//i.test(info.url.pathname) || /^\/WA\/wa14\.html$/i.test(info.url.pathname))) {
      return "project_click";
    }

    if (isExternal(info.url)) {
      return anchor.closest(".portfolio, .project-hero, .project-content, .project-cta")
        ? "outbound_project_click"
        : "outbound_click";
    }

    return null;
  }

  function clickMetadata(anchor, info, eventName) {
    const metadata = {
      linkText: linkLabel(anchor, eventName)
    };

    if (eventName === "contact_click" && /^mailto:/i.test(info.rawHref)) {
      metadata.linkType = "email";
      return metadata;
    }

    if (isExternal(info.url)) {
      metadata.targetDomain = info.url.hostname.replace(/^www\./, "");
      metadata.targetPath = safeText(info.url.pathname || "/", 120);
    } else {
      metadata.targetPath = safeText(info.url.pathname || "/", 120);
    }

    if (eventName === "project_click" || eventName === "outbound_project_click") {
      metadata.projectSlug = projectSlugFromPath(info.url.pathname || currentPath());
    }

    return metadata;
  }

  function bindEvents() {
    document.addEventListener("click", (event) => {
      const anchor = event.target.closest ? event.target.closest("a[href]") : null;
      if (!anchor) {
        return;
      }

      const info = hrefInfo(anchor);
      if (!info) {
        return;
      }

      const eventName = classifyLink(anchor, info);
      if (eventName) {
        sendEvent(eventName, clickMetadata(anchor, info, eventName));
      }
    }, { capture: true });

    document.addEventListener("submit", (event) => {
      const form = event.target;
      if (form && form.matches && form.matches("#contact-form, .contact__form")) {
        sendEvent("contact_submit", { form: "contact" });
      }
    }, { capture: true });

    window.addEventListener("popstate", trackPageView);
  }

  function init() {
    trackPageView();
    bindEvents();
    window.portfolioAnalytics = {
      track: sendEvent
    };
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
