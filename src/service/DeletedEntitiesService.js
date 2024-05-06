import http from '@/clients/axios-setup'
export class DeletedEntitiesService{
    getAllDeletedUsers(queryParams){
        return http.get('users/deleted', {
            params: queryParams
        }).then(res => res.data);
    }

    restoreUser(id){
        return http.get(`users/restore/${id}`)
            .then(res => res);
    }

    getDeletedUserAuditInfo(id){
        return http.get(`users/${id}/deleted-audit`)
        .then(res => res.data);
    }

    getAllDeletedOrganizations(queryParams){
        return http.get('organizations/deleted', {
            params: queryParams
        }).then(res => res.data);
    }

    restoreOrganization(id){
        return http.get(`organizations/restore/${id}`)
            .then(res => res);
    }
    getDeletedOrganizationAuditInfo(id){
        return http.get(`organizations/${id}/deleted-audit`)
        .then(res => res.data);
    }

    getAllDeletedDocuments(queryParams){
        return http.get('documents/deleted', {
            params: queryParams
        }).then(res => res.data);
    }

    restoreDocument(id){
        return http.get(`documents/restore/${id}`)
            .then(res => res);
    }

    getDeletedDocumentAuditInfo(id){
        return http.get(`documents/${id}/deleted-audit`)
        .then(res => res.data);
    }
}