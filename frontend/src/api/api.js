import axios from 'axios'

const api = axios.create({
    baseURL: '/api', // все запросы будут начинаться с /api, и благодаря прокси в vite.config.js они будут отправляться на http://backend:PORT
});

api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');

    if (token) config.headers.Authorization = `Bearer ${token}`;
    
    return config;
})

export default api;