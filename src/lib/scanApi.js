import { apiGet, apiPost } from './api';

export const listScannableEvents = () => apiGet('/staff/events');

// Validate a scanned QR token at the gate for an event. Resolves with
// { result: 'accepted', ... } or throws an ApiError carrying the rejection code.
export const scanTicket = (eventId, token) => apiPost(`/events/${eventId}/scan`, { token });
