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

    getUserOrganizations(id) {
        return http.get(`${this.endpoint}/${id}/organizations`)
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

    assignOrganization(userId, assignedOrganizationIds) {
        return http.post(`${this.endpoint}/${userId}/assign-organizations`, assignedOrganizationIds)
            .then((res) => res.data);
    }

    unAssignOrganization(userId, organizationId) {
        return http.delete(`${this.endpoint}/${userId}/unassign-organization/${organizationId}`)
            .then((res) => res.data);
    }
}
