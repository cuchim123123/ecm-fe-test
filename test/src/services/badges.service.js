import apiClient from './config';

export const getAllBadges = async () => {
  const response = await apiClient.get('/badges');
  return response;
};

export const createBadge = async (data) => {
  const response = await apiClient.post('/badges', data);
  return response;
};

export const updateBadge = async (id, data) => {
  const response = await apiClient.put(`/badges/${id}`, data);
  return response;
};

export const deleteBadge = async (id) => {
  const response = await apiClient.delete(`/badges/${id}`);
  return response;
};

export const getMyBadges = async () => {
  const response = await apiClient.get('/badges/my');
  return response;
};

export default {
  getAllBadges,
  createBadge,
  updateBadge,
  deleteBadge,
  getMyBadges,
};
