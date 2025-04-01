import axios from 'axios';

const API_URL = 'http://localhost:8998/v1/user';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return { headers: { Authorization: `Bearer ${token}` } };
};

export const userService = {
  getAllUsers: async () => {
    try {
      const response = await axios.get(`${API_URL}/getAll`, getAuthHeader());
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  createUser: async (userData) => {
    try {
      const response = await axios.post(`${API_URL}/save`, userData, getAuthHeader());
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  updateUser: async (userData) => {
    try {
      const response = await axios.put(`${API_URL}/update`, userData, getAuthHeader());
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  deleteUser: async (id) => {
    try {
      await axios.delete(`${API_URL}/deleteUserById/${id}`, getAuthHeader());
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};