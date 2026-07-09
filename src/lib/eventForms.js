export const EVENT_STATUSES = ['draft', 'published', 'paused', 'cancelled', 'completed', 'archived'];

export function toDateTimeLocal(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

export function fromDateTimeLocal(value) {
  return value ? new Date(value).toISOString() : undefined;
}

export function optionalText(value) {
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}
