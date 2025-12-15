import axios from 'axios';

window.axios = axios.create({
    baseURL: 'http://localhost:8000',
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    },    
});

console.log('axios настроен без кук (только токены)');