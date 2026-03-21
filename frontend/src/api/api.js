import axios from 'axios'

const api = axios.create({
    baseURL: '/api', // все запросы будут начинаться с /api, и благодаря прокси в vite.config.js они будут отправляться на VITE_API_URL
});

// REQUEST interceptor (добавляем токен)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
})

let isHandlingUnauthorized = false;

// RESPONSE interceptor (ловим ошибки)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !isHandlingUnauthorized) {
      isHandlingUnauthorized = true;

      window.dispatchEvent(new Event("unauthorized"));
    }

    return Promise.reject(error);
  }
);

export default api;