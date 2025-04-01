import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const API_URL = 'http://localhost:8999/v1/auth';

// Add response interceptor to handle auth errors
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, log out user
      logout();
    }
    return Promise.reject(error);
  }
);

const register = async (username, email, password) => {
  try {
    const response = await axios.post(`${API_URL}/register`, {
      username,
      email,
      password,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

const login = async (username, password) => {
  try {
    const response = await axios.post(`${API_URL}/login`, {
      username,
      password,
    });
    if (response.data.token) {
      const token = response.data.token;
      localStorage.setItem('token', token);
      
      const decodedToken = jwtDecode(token);
      // Store role with ROLE_ prefix if not present
      const role = decodedToken.iss.startsWith('ROLE_') ? decodedToken.iss : `ROLE_${decodedToken.iss}`;
      localStorage.setItem('role', role);
      localStorage.setItem('userId', decodedToken.userId);
    }
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  localStorage.removeItem('userId');
  // Clear any cached auth state
  window.location.href = '/login';
};

const getCurrentUser = () => {
  try {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      
      if (decodedToken.exp <= currentTime) {
        logout();
        return null;
      }

      // Ensure role has ROLE_ prefix
      const role = decodedToken.iss.startsWith('ROLE_') ? decodedToken.iss : `ROLE_${decodedToken.iss}`;
      
      return {
        userId: decodedToken.userId,
        username: decodedToken.sub,
        role: role
      };
    }
  } catch (error) {
    console.error('Error getting current user:', error);
    logout();
  }
  return null;
};

const isAuthenticated = () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return false;
    
    const decodedToken = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decodedToken.exp > currentTime;
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
};

const hasRole = (requiredRole) => {
  const user = getCurrentUser();
  if (!user) return false;
  
  // Ensure both roles have ROLE_ prefix for comparison
  const userRole = user.role.startsWith('ROLE_') ? user.role : `ROLE_${user.role}`;
  const required = requiredRole.startsWith('ROLE_') ? requiredRole : `ROLE_${requiredRole}`;
  
  return userRole === required;
};

const authService = {
  register,
  login,
  logout,
  getCurrentUser,
  isAuthenticated,
  hasRole,
};

export default authService;
