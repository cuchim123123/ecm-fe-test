import apiClient from './config';

export const sendChatMessage = async (message, history = []) => {
  const response = await apiClient.post('/chat/gemini', { message, history });
  return response;
};

export default {
  sendChatMessage,
};
