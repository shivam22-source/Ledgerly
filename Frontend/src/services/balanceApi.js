import axiosInstance from "./axiosInstance";

export const balanceApi = {
  getCurrentBalance: async () => {
    const response = await axiosInstance.get("/api/balance");
    return response.data; // { balance }
  },

  getMonthlySummary: async ({ year, month }) => {
    const response = await axiosInstance.get("/api/balance-month", {
      params: { year, month }
    });
    return response.data; // { debit, credit }
  }
};
