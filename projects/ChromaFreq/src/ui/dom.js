export function $(selector, root = document) {
  const element = root.querySelector(selector);
  if (!element) {
    throw new Error(`Missing required element: ${selector}`);
  }
  return element;
}

export function $all(selector, root = document) {
  return Array.from(root.querySelectorAll(selector));
}

export function formatFrequency(value) {
  if (!value || !Number.isFinite(value)) return "0 Hz";
  if (value >= 1000) return `${(value / 1000).toFixed(2)} kHz`;
  return `${Math.round(value)} Hz`;
}

export function formatDuration(seconds) {
  if (!Number.isFinite(seconds) || seconds <= 0) return "Live";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${remainingSeconds}`;
}

export function formatPercent(value) {
  return `${Math.round((Number(value) || 0) * 100)}%`;
}
