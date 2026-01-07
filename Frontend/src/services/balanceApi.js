import axiosInstance from './axiosInstance';

export const balanceApi = {
  getCurrentBalance: async () => {
    const response = await axiosInstance.get('/api/balance');
    return response.data; // Expected: { balance: number }
  },

  getMonthlySummary: async (month) => {
    // month param format optional based on backend, common is YYYY-MM
    const response = await axiosInstance.get('/api/balance-month', {
      params: { month }
    });
    return response.data; // Expected: { debit: number, credit: number }
  }
};
