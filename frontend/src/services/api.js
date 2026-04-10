import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Request interceptor to automatically add the JWT token if available
api.interceptors.request.use(
  (config) => {
    // Check both user and employee storage
    const userInfoStr = localStorage.getItem('userInfo');
    const empInfoStr = localStorage.getItem('employeeInfo');
    const token =
      (userInfoStr ? JSON.parse(userInfoStr)?.token : null) ||
      (empInfoStr ? JSON.parse(empInfoStr)?.token : null);
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Only set application/json if not sending FormData (otherwise boundary fails)
    if (!(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle global errors like token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.error('Unauthorized access. Proceeding to logout flow.');
      localStorage.removeItem('token');
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
