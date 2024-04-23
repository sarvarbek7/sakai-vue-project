import { defineStore } from 'pinia';
import http from '@/clients/axios-setup';
import router from '@/router';
import Swal from 'sweetalert2';

export const useAuthStore = defineStore('session', {
    state: () => ({
        _isLogged: !!localStorage.getItem('accessToken'),
        _userId: localStorage.getItem('userId'),
        _organizationId: localStorage.getItem('organizationId'),
        _role: localStorage.getItem('role')
    }),
    getters: {
        isLogged: (state) => state._isLogged,
        isSuperAdmin: (state) => state._role == 'superAdmin',
        userId: (state) => state._userId,
        organizationId: (state) => state._organizationId,
        role: (state) => state._role
    },
    actions: {
        login(loginDetails) {
            http.post('auth/login', loginDetails).then((response) => {
                this._isLogged = true;
                this._userId = response.data['userId'];
                this._organizationId = response.data['organizationId'];
                this._role = response.data['role'];

                router.push({ path: '/' });

                localStorage.setItem('userId', `${this.userId}`);
                localStorage.setItem('organizationId', this._organizationId);
                localStorage.setItem('role', this._role);
                localStorage.setItem('accessToken', `Bearer ${response.data['accessToken']}`);
            })
            .catch((err) => {
                if (err.code === 'ERR_BAD_REQUEST')
                {
                    if (err.response.data === 'Invalid login attempt.'){
                        Swal.fire({
                            icon: "error",
                            title: "Kechirasiz...",
                            text: "Ma'lumotlar topilmadi."
                        });
                    }
                }
            });
        },
        logout() {
            http.get('auth/logout').then((response) => {
                console.log(response.data);
                router.push({ path: '/' });
                this._userId = null;
                this._organizationId = null;
                this._role = null;
                this._isLogged = false;
                localStorage.removeItem('accessToken');
                localStorage.removeItem('userId');
                localStorage.removeItem('organizationId');
                localStorage.removeItem('role');
            });
        }
    }
});
