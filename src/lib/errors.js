import { ApiError } from './api';

const MESSAGES = {
  SOLD_OUT: 'Not enough tickets available.',
  EXCEEDS_LIMIT: 'That exceeds the per-customer limit.',
  SALES_CLOSED: 'Sales are not open for this category.',
  EVENT_NOT_BUYABLE: 'This event is not currently on sale.',
  RESERVATION_EXPIRED: 'Your hold expired. Please start again.',
  ORDER_ALREADY_EXISTS: 'An order already exists for this hold.',
  VALIDATION_ERROR: 'Please check the form and try again.',
  // Gate scanner outcomes.
  TICKET_ALREADY_USED: 'Already scanned — this ticket has been used.',
  TICKET_REVOKED: 'Revoked — this ticket was refunded and is not valid.',
  WRONG_EVENT: 'Wrong event — this ticket is for a different event.',
  TICKET_NOT_FOUND: 'Not found — no ticket matches this code.',
  INVALID_QR: 'Invalid code — the QR signature did not verify.',
};

export function messageFor(e) {
  if (e instanceof ApiError) return MESSAGES[e.code] ?? e.message;
  return 'Something went wrong. Please try again.';
}
