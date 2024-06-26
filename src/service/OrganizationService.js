import http from '@/clients/axios-setup';

export class OrganizationService {
    endpoint = 'organizations';

    getOrganizations(queryParams) {
        return http.get(this.endpoint, { params: queryParams })
            .then((res) => res.data);
    };

    getOrganizationById(id) {
        return http.get(`${this.endpoint}/${id}`)
            .then((res) => res.data);
    }

    createOrganization(organization) {
        if (organization.primaryOrganizationId === 0){
            organization.primaryOrganizationId = null;
        }
        return http.post(this.endpoint, organization)
            .then((res) => res.data);
    }

    updateOrganization(organization) {
        if (organization.primaryOrganizationId === 0){
            organization.primaryOrganizationId = null;
        }
        
        return http.put(this.endpoint, organization)
            .then((res) => res.data);
    }

    deleteOrganization(id) {
        return http.delete(`${this.endpoint}/${id}`)
            .then((res) => res.data);
    }

    getAuditDetailsById(id){
        return http.get(`${this.endpoint}/${id}/audit`)
            .then((res) => res.data);
    }
}
