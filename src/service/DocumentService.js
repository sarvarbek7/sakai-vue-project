import http from '@/clients/axios-setup';

export class DocumentService{
    endpoint = 'documents';
    
    getDocumentTypes() {
        return http.get(`${this.endpoint}/types`)
        .then((res) => res.data);
    }

    uploadDocuments(request){
        return http.post(
            `${this.endpoint}`,
            request,
            {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }
        ).then(res => res.data);
    }

    getOrganizationDocuments(id, paramaters) {
        return http.get(
            `${this.endpoint}`,
            {
                params: {
                    organizationId: id,
                    limit: paramaters.limit
                }
            }
        ).then(response => response.data);
    }
}