import axios from 'axios';
import { getMessage } from '../utils/getMessage';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

function getStoredToken(): string | null {
  try {
    return localStorage.getItem('token');
  } catch {
    return null;
  }
}

apiClient.interceptors.request.use(
  (config) => {
    const token = getStoredToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const backendError: unknown = error.response?.data?.error;
    if (backendError) {
      if (backendError instanceof Error) {
        return Promise.reject(backendError);
      }
      const message = getMessage(backendError, 'Error en la solicitud.');
      const details =
        typeof backendError === 'object' && backendError !== null
          ? backendError
          : { cause: backendError };
      return Promise.reject(Object.assign(new Error(message), details));
    }
    return Promise.reject(
      Object.assign(new Error('No se pudo conectar al servidor.'), { code: 'NETWORK_ERROR' }),
    );
  }
);
