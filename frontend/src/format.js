// Shared display formatting, so every page shows dates, times and prices the same way.
// Dates come from the API as ISO strings in UTC; these show them in the user's local time.

// "Fri, Nov 13"
export function formatShortDate(value) {
  return toDate(value)?.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }) ?? "";
}

// "Friday, November 13"
export function formatLongDate(value) {
  return toDate(value)?.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }) ?? "";
}

// "4:30 PM"
export function formatTime(value) {
  return toDate(value)?.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) ?? "";
}

// 15 -> "$15", 12.5 -> "$12.50"
export function formatPrice(value) {
  const amount = Number(value);
  if (value === null || value === undefined || value === "" || Number.isNaN(amount)) return "";
  return `$${Number.isInteger(amount) ? amount : amount.toFixed(2)}`;
}

function toDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}
