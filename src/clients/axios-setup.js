import router from "@/router";
import axios from "axios";
import Swal from 'sweetalert2';

const instance = axios.create({
    baseURL: 'https://localhost:7164/api',
})

instance.interceptors.request.use(function (config) {
    // Do something before request is sent
    const token = localStorage.getItem('accessToken');
    config.headers.Authorization = token;

    return config;
}, function (error) {
    return Promise.reject(error);
});

instance.interceptors.response.use(function (response) {
    return response;
}, function (error) {
    if (error.code === `ERR_NETWORK`) {
        Swal.fire({
            icon: "error",
            title: "Kechirasiz...",
            text: "Serverga ulanishda xatolik yuz berdi."
        });
    }

if (error.request.status === 401) {
    router.push({ name: 'accessDenied' });
}

return Promise.reject(error);
});

export default instance;