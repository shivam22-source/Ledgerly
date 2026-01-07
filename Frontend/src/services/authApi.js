import axiosInstance from './axiosInstance';

export const authApi = {
  login: async (email, password) => {
    const response = await axiosInstance.post('/api/auth/login', { email, password });
    if (response.data.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      localStorage.setItem('userEmail', email);
    }
    return response.data;
  },

  register: async (email, password) => {
    const response = await axiosInstance.post('/api/auth/register', { email, password });
    return response.data;
  }
};
