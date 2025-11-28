import apiClient from './config';

// --- Admin ---
export const getAllVouchers = async (params = {}) => {
  const response = await apiClient.get('/vouchers', { params });
  return response;
};

export const createVoucher = async (data) => {
  const response = await apiClient.post('/vouchers', data);
  return response;
};

export const updateVoucher = async (id, data) => {
  const response = await apiClient.put(`/vouchers/${id}`, data);
  return response;
};

export const deleteVoucher = async (id) => {
  const response = await apiClient.delete(`/vouchers/${id}`);
  return response;
};

// --- User ---
export const getUsableVouchers = async () => {
  const response = await apiClient.get('/vouchers/usable');
  return response;
};

export const getCollectableVouchers = async () => {
  const response = await apiClient.get('/vouchers/collectable');
  return response;
};

export const collectVoucher = async (voucherId) => {
  const response = await apiClient.post('/vouchers/collect', { voucherId });
  return response;
};

export const getMyVouchers = async () => {
  const response = await apiClient.get('/vouchers/mine');
  return response;
};

// --- Voucher collection (if separate service is enabled) ---
export const collectEventVoucher = async (voucherId) => {
  // Some deployments expose /voucher-collection; keep compatibility
  const response = await apiClient.post(`/voucher-collection/collect/${voucherId}`);
  return response;
};

export const getCollectedVouchers = async () => {
  const response = await apiClient.get('/voucher-collection/my');
  return response;
};

export const checkCollectedVoucher = async (voucherId) => {
  const response = await apiClient.get(`/voucher-collection/check/${voucherId}`);
  return response;
};

export default {
  getAllVouchers,
  createVoucher,
  updateVoucher,
  deleteVoucher,
  getUsableVouchers,
  collectVoucher,
  getMyVouchers,
  collectEventVoucher,
  getCollectedVouchers,
  checkCollectedVoucher,
};
