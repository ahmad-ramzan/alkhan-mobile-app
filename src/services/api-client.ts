import axios from 'axios';

import { API_BASE_URL } from '@/constants/config';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

apiClient.interceptors.request.use((request) => {
  console.log(`--- API REQUEST: ${request.baseURL}${request.url}`);
  return request;
});

apiClient.interceptors.response.use(
  (response) => {
    console.log(`--- API RESPONSE: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.log(`--- API ERROR: ${error.message}`);
    return Promise.reject(error);
  }
);
