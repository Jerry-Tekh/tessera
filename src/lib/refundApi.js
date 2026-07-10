import { apiGet, apiPost } from './api';

export const requestRefund = (orderId, reason) => apiPost(`/orders/${orderId}/refund-requests`, { reason });
export const listMyRefundRequests = () => apiGet('/refund-requests');
