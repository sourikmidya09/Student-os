import { format, isToday, isYesterday, startOfWeek, endOfWeek, isWithinInterval, parseISO, differenceInDays } from 'date-fns';

export function formatDate(dateStr) {
  const d = parseISO(dateStr);
  if (isToday(d)) return 'Today';
  if (isYesterday(d)) return 'Yesterday';
  return format(d, 'MMM d');
}

export function formatTime(dateStr) {
  return format(parseISO(dateStr), 'h:mm a');
}

export function formatDateTime(dateStr) {
  const d = parseISO(dateStr);
  if (isToday(d)) return `Today at ${format(d, 'h:mm a')}`;
  if (isYesterday(d)) return `Yesterday at ${format(d, 'h:mm a')}`;
  return format(d, 'MMM d, h:mm a');
}

export function isThisWeek(dateStr) {
  const d = parseISO(dateStr);
  const now = new Date();
  return isWithinInterval(d, { start: startOfWeek(now), end: endOfWeek(now) });
}

export function getDayName(offset = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return format(d, 'EEE');
}

export function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export function formatDuration(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export function getStudyStreak(sessions) {
  if (!sessions.length) return 0;
  const sorted = [...sessions].sort((a, b) => new Date(b.date) - new Date(a.date));
  let streak = 0;
  let checkDate = new Date();
  checkDate.setHours(0, 0, 0, 0);

  for (const session of sorted) {
    const sessionDate = parseISO(session.date);
    sessionDate.setHours(0, 0, 0, 0);
    const diff = differenceInDays(checkDate, sessionDate);
    if (diff === 0 || diff === streak) {
      streak++;
      checkDate = sessionDate;
    } else {
      break;
    }
  }
  return streak;
}