import axios from 'axios'

const api = axios.create({
    baseURL: '/api', // все запросы будут начинаться с /api, и благодаря прокси в vite.config.js они будут отправляться на http://backend:3000
});

export default api;