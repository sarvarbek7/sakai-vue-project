import http from '@/clients/axios-setup';

export class UserService {
    endpoint = 'users';

    getUsers(queryParams) {
        return http.get(this.endpoint, { params: queryParams })
            .then((res) => res.data);
    };

    getUserByDetails(id) {
        return http.get(`${this.endpoint}/${id}`)
            .then((res) => res.data);
    }

    getUserAssignedOrganizationsById(userId) {
        return http.get(`${this.endpoint}/${userId}/assigned-organizations`)
            .then((res) => res.data);
    }

    getUserById(id) {
        return http.get(`${this.endpoint}/${id}`)
            .then((res) => res.data);
    }

    createUser(user) {
        return http.post(this.endpoint, user)
            .then((res) => res.data);
    }

    updateUser(user) {
        return http.put(this.endpoint, user)
            .then((res) => res.data);
    }

    deleteUser(id) {
        return http.delete(`${this.endpoint}/${id}`)
            .then((res) => res.data);
    }

    assignRoleToUser(userId, assignedUserRole) {
        return http.post(`${this.endpoint}/${userId}/assign-role`, assignedUserRole)
            .then((res) => res.data);
    }

    unAssignRole(id) {
        return http.delete(`${this.endpoint}/unAssign-role/${id}`)
            .then((res) => res.data);
    }
}
