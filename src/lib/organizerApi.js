import { apiGet, apiPost, apiPatch } from './api';

export const listAllEvents = () => apiGet('/admin/events');
export const createEvent = (data) => apiPost('/events', data);
export const updateEvent = (id, data) => apiPatch(`/events/${id}`, data);
export const createCategory = (eventId, data) => apiPost(`/events/${eventId}/categories`, data);
export const eventSales = (id) => apiGet(`/events/${id}/sales`);
export const refundOrder = (orderId) => apiPost(`/orders/${orderId}/refund`, {});
