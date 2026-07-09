import { apiGet } from './api';

export const getHealth = () => apiGet('/health');
