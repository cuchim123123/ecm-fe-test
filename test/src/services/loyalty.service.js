import apiClient from './config';

export const getMyLoyaltyInfo = async () => {
  return apiClient.get('/loyalty/me');
};

export const getMyCoinTransactions = async (limit = 50) => {
  return apiClient.get('/loyalty/points', { params: { limit } });
};

export const getLoyaltyHistory = async () => {
  return apiClient.get('/loyalty/history');
};

export const redeemCoins = async (amount) => {
  return apiClient.post('/loyalty/redeem', { amount });
};
