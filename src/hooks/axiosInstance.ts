// src/axiosInstance.ts

import axios, { AxiosInstance } from 'axios';

const axiosInstance: AxiosInstance = axios.create({
  baseURL: 'http://127.0.0.1:3000/',
  headers: {
    'Content-Type': 'application/json',
  },
});



export default axiosInstance;