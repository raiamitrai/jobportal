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

    // ID string with embedded epoch: notif_1725849600000_xyz, msg-1725849600000-..., etc.
    const idMatch = trimmed.match(/(?:notif_|EML-|msg_|app_|msg-|m-init-)?(\d{12,13})/i);
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

/**
 * Calculates calendar day difference between target timestamp and now:
 * 0 = Today
 * 1 = Yesterday
 * 2..6 = 2 to 6 days ago (same week)
 * >= 7 = 1 week or older
 */
export function getCalendarDayDiff(targetTimestamp, now = Date.now()) {
  const ts = extractTimestamp(targetTimestamp);
  if (!ts) return 0;
  const targetDate = new Date(ts);
  const nowDate = new Date(now);

  const targetMidnight = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate()).getTime();
  const nowMidnight = new Date(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate()).getTime();

  return Math.round((nowMidnight - targetMidnight) / (24 * 60 * 60 * 1000));
}

/**
 * WhatsApp-style timestamp for conversation list / thread sidebar:
 * - Today: "10:15 AM"
 * - Yesterday: "Yesterday"
 * - 2-6 days ago: "Sunday", "Monday", "Tuesday", etc.
 * - >= 7 days: "DD/MM/YYYY" (e.g. 02/09/2026)
 */
export function formatWhatsAppChatListTime(timestamp, fallbackTime = '') {
  const ts = extractTimestamp(timestamp);
  if (!ts) return fallbackTime;

  const diffDays = getCalendarDayDiff(ts);
  const targetDate = new Date(ts);

  if (diffDays <= 0) {
    if (fallbackTime && fallbackTime.includes(':') && !fallbackTime.includes('-')) {
      return fallbackTime;
    }
    return targetDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  if (diffDays === 1) {
    return 'Yesterday';
  }
  if (diffDays >= 2 && diffDays <= 6) {
    return targetDate.toLocaleDateString('en-US', { weekday: 'long' });
  }
  const d = String(targetDate.getDate()).padStart(2, '0');
  const m = String(targetDate.getMonth() + 1).padStart(2, '0');
  const y = targetDate.getFullYear();
  return `${d}/${m}/${y}`;
}

/**
 * WhatsApp-style date separator badge (pill) between days in chat stream:
 * - Today: "TODAY"
 * - Yesterday: "YESTERDAY"
 * - 2-6 days ago: "SUNDAY", "MONDAY", etc.
 * - >= 7 days: "2 September 2026"
 */
export function formatWhatsAppDateSeparator(timestamp) {
  const ts = extractTimestamp(timestamp);
  if (!ts) return 'TODAY';

  const diffDays = getCalendarDayDiff(ts);
  const targetDate = new Date(ts);

  if (diffDays <= 0) return 'TODAY';
  if (diffDays === 1) return 'YESTERDAY';
  if (diffDays >= 2 && diffDays <= 6) {
    return targetDate.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
  }
  return targetDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

/**
 * WhatsApp-style message timestamp for individual message bubbles:
 * - Today: "02:05 PM"
 * - Yesterday: "Yesterday, 02:05 PM"
 * - 2-6 days ago: "Sun, 02:05 PM"
 * - >= 7 days: "02/09/2026, 02:05 PM"
 */
export function formatWhatsAppMessageTime(msg) {
  const ts = extractTimestamp(msg?.timestamp) || extractTimestamp(msg?.id) || extractTimestamp(msg);
  const rawTime = msg?.time;
  const timeStr = rawTime && rawTime.includes(':') && !rawTime.includes('-')
    ? rawTime
    : (ts ? new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '');

  if (!ts) return timeStr || rawTime || '';

  const diffDays = getCalendarDayDiff(ts);
  const targetDate = new Date(ts);

  if (diffDays <= 0) {
    return timeStr;
  }
  if (diffDays === 1) {
    return `Yesterday, ${timeStr}`;
  }
  if (diffDays >= 2 && diffDays <= 6) {
    const day = targetDate.toLocaleDateString('en-US', { weekday: 'short' });
    return `${day}, ${timeStr}`;
  }
  const d = String(targetDate.getDate()).padStart(2, '0');
  const m = String(targetDate.getMonth() + 1).padStart(2, '0');
  const y = targetDate.getFullYear();
  return `${d}/${m}/${y}, ${timeStr}`;
}
