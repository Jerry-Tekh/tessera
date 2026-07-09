import { apiGet, apiPost } from './api';

export const getReservation = (id) => apiGet(`/reservations/${id}`);
export const cancelReservation = (id) => apiPost(`/reservations/${id}/cancel`, {});
