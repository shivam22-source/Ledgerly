import axiosInstance from './axiosInstance';

export const transactionApi = {
  getTransactions: async () => {
    const response = await axiosInstance.get('/api/transaction-view');
    return response.data; // Expected: Array of transaction objects
  },

  createTransaction: async (data) => {
    const response = await axiosInstance.post('/api/transaction', data);
    return response.data;
  }
};
