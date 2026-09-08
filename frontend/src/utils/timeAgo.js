import { useState, useEffect } from 'react';

/**
 * Safely extracts a numeric epoch timestamp (milliseconds) from various input formats:
 * - Object with createdAt, timestamp, date, sentAt, or id
 * - ISO date string
 * - Numeric epoch string or number
 * - ID strings formatted like 'notif_1725849600000_abcd' or 'EML-1725849600000-...'
 */
export function extractTimestamp(input) {
  if (!input) return null;

  // 1. Direct number
  if (typeof input === 'number' && !isNaN(input)) {
    return input < 1e11 ? input * 1000 : input;
  }

  // 2. Date instance
  if (input instanceof Date && !isNaN(input.getTime())) {
    return input.getTime();
  }

  // 3. Object with properties
  if (typeof input === 'object') {
    if (input.createdAt) {
      const parsed = extractTimestamp(input.createdAt);
      if (parsed) return parsed;
    }
    if (input.timestamp) {
      const parsed = extractTimestamp(input.timestamp);
      if (parsed) return parsed;
    }
    if (input.date) {
      const parsed = extractTimestamp(input.date);
      if (parsed) return parsed;
    }
    if (input.sentAt) {
      const parsed = extractTimestamp(input.sentAt);
      if (parsed) return parsed;
    }
    if (input.id) {
      const parsed = extractTimestamp(input.id);
      if (parsed) return parsed;
    }
    return null;
  }

  // 4. String format
  if (typeof input === 'string') {
    const trimmed = input.trim();
    if (!trimmed) return null;

    // Pure numeric string
    if (/^\d{10,13}$/.test(trimmed)) {
      const num = Number(trimmed);
      return num < 1e11 ? num * 1000 : num;
    }

    // ID string with embedded epoch: notif_1725849600000_xyz or EML-1725849600000-...
    const idMatch = trimmed.match(/(?:notif_|EML-|msg_|app_)?(\d{12,13})/i);
    if (idMatch) {
      const num = Number(idMatch[1]);
      if (!isNaN(num) && num > 1500000000000 && num < 2500000000000) {
        return num;
      }
    }

    // Standard date parsing (ISO 8601, RFC2822, etc.)
    const parsed = new Date(trimmed).getTime();
    if (!isNaN(parsed) && parsed > 0) {
      return parsed;
    }
  }

  return null;
}

/**
 * Formats a notification item or timestamp into real-time relative string:
 * - < 45s: "Just now"
 * - 45s - 89s: "1 minute ago"
 * - 90s - 54m: "X minutes ago"
 * - 55m - 89m: "1 hour ago"
 * - 90m - 23h: "X hours ago"
 * - 24h - 35h: "1 day ago"
 * - 36h - 6d: "X days ago"
 * - 7d - 13d: "1 week ago"
 * - 14d - 27d: "X weeks ago"
 * - 28d - 59d: "1 month ago"
 * - 60d - 364d: "X months ago"
 * - 365d - 729d: "1 year ago"
 * - >= 730d: "X years ago"
 */
export function formatRelativeTime(input, fallback = 'Recently') {
  const ts = extractTimestamp(input);
  if (!ts) {
    if (typeof input === 'string' && input.trim() && input !== 'Just now') return input;
    if (typeof input?.time === 'string' && input.time.trim() && input.time !== 'Just now') return input.time;
    return fallback;
  }

  const now = Date.now();
  const diffSec = Math.floor((now - ts) / 1000);

  // Future or clock skew up to 45 seconds
  if (diffSec < 45) return 'Just now';
  if (diffSec < 90) return '1 minute ago';

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 55) return `${diffMin} minutes ago`;
  if (diffMin < 90) return '1 hour ago';

  const diffHours = Math.floor(diffSec / 3600);
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffHours < 36) return '1 day ago';

  const diffDays = Math.floor(diffSec / 86400);
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 14) return '1 week ago';

  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks < 4) return `${diffWeeks} weeks ago`;

  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) return diffMonths <= 1 ? '1 month ago' : `${diffMonths} months ago`;

  const diffYears = Math.floor(diffDays / 365);
  return diffYears <= 1 ? '1 year ago' : `${diffYears} years ago`;
}

/**
 * Formats timestamp into full readable date & time for hover tooltips.
 * Example: "Sep 2, 2026, 1:20 PM"
 */
export function formatExactDateTime(input) {
  const ts = extractTimestamp(input);
  if (!ts) return '';
  return new Date(ts).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

/**
 * Custom hook to trigger periodic re-render every intervalMs (default: 30s)
 * so displayed relative times transition dynamically without refreshing the page.
 */
export function useRelativeTimeTick(intervalMs = 30000) {
  const [, setTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTick(prev => prev + 1);
    }, intervalMs);

    return () => clearInterval(timer);
  }, [intervalMs]);
}
