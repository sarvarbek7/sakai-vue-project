import { defineStore } from 'pinia';
import http from '@/clients/axios-setup';
import router from '@/router';
import Swal from 'sweetalert2';

export const useAuthStore = defineStore('session', {
    state: () => ({
        _isLogged: !!localStorage.getItem('accessToken'),
        _user: JSON.parse(localStorage.getItem("user")),
        _role: localStorage.getItem('role'),
        _expireAt: localStorage.getItem('expiryAt'),
    }),
    getters: {
        isLogged: (state) => state._isLogged,
        isSuperAdmin: (state) => state._isLogged && state._role.toLowerCase() == 'superadmin',
        isAdmin: (state) => state._isLogged && state._role.toLowerCase() == 'admin',
        expireAt: (state) => state._expireAt,
        user: (state) => state._user,
        role: (state) => state._role
    },
    actions: {
        login(loginDetails) {
            http.post('auth/login', loginDetails).then((response) => {
                this._isLogged = true;
                this._user = response.data['user'];
                this._role = response.data['role'].toLowerCase()
                this._expireAt = response.data['expiryAt'];
                this._user["login"] = response.data['login'];

                if (this.role === 'admin') {
                    router.push({ name:  'organizations-admin'});
                }
                else {
                    router.push({ path: '/' });
                }

                localStorage.setItem('user', JSON.stringify(this._user));
                localStorage.setItem('role', this._role);
                localStorage.setItem('accessToken', `Bearer ${response.data['token']}`);
                localStorage.setItem('expiryAt');
            })
                .catch((err) => {
                    if (err.code === 'ERR_BAD_REQUEST') {
                        if (err.response.status === 401) {
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
                this._isLogged = false;

                this._user = null;
                this._role = null;
                this._expireAt = null;
                localStorage.removeItem('user');
                localStorage.removeItem('role');
                localStorage.removeItem('expiryAt');
                localStorage.setItem('accessToken', `Bearer ${response.data['token']}`);
            });
        }
    }
});
