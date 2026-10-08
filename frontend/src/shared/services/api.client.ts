import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    if (globalThis.window !== undefined) {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
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
    if (error.response && error.response.data && error.response.data.error) {
      const apiError = error.response.data.error as { code?: string; message?: string };
      return Promise.reject(
        Object.assign(new Error(apiError.message ?? 'Error de la API'), {
          code: apiError.code ?? 'API_ERROR',
        }),
      );
    }
    const networkError = new Error('No se pudo conectar al servidor.');
    (networkError as Error & { code: string }).code = 'NETWORK_ERROR';
    return Promise.reject(networkError);
  }
);
