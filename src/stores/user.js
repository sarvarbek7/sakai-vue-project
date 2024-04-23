import http from '@/clients/axios-setup';
import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
    state: () => ({
        _users: [],
        _user: null,
        _totalUsersCount: 0,
        _pageSize: 0,
        _pageToken: 0
    }),
    getters: {
        users: (state) => state._users,
        user: (state) => state._user,
        totalUsersCount: (state) => state._totalUsersCount,
        pageSize: (state) => state._pageSize,
        pageToken: (state) => state._pageToken
    },
    actions: {
        getUsers(queryParams) {
            return http
                .get('users', {
                    params: queryParams
                })
                .then((response) => {
                    const data = response.data;

                    this._users = data.users;
                    this._pageSize = data.pageSize;
                    this._pageToken = data.pageToken;
                    this._totalUsersCount = data.totalUsersCount;
                });
        },
        getUserById(id) {
            return http.get(`users/${id}`).then((response) => {
                this._user = response.data;
            });
        }
    }
});
