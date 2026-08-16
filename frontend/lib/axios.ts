import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: '',
  timeout: 30000,
  withCredentials: true
});

export default axiosInstance;
