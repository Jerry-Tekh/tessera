import { ApiError } from './api';

const MESSAGES = {
  SOLD_OUT: 'Not enough tickets available.',
  EXCEEDS_LIMIT: 'That exceeds the per-customer limit.',
  SALES_CLOSED: 'Sales are not open for this category.',
  EVENT_NOT_BUYABLE: 'This event is not currently on sale.',
  RESERVATION_EXPIRED: 'Your hold expired. Please start again.',
  ORDER_ALREADY_EXISTS: 'An order already exists for this hold.',
  VALIDATION_ERROR: 'Please check the form and try again.',
};

export function messageFor(e) {
  if (e instanceof ApiError) return MESSAGES[e.code] ?? e.message;
  return 'Something went wrong. Please try again.';
}
