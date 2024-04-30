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

    getOrganizationDocuments(id, queryParams) {
        return http.get(
            `${this.endpoint}`,
            {
                params: {
                    limit: queryParams.limit,
                    page: queryParams.page,
                    organizationId: id,
                    documentTypeId: queryParams.documentTypeId,
                    title: queryParams.title,
                    registerNumber: queryParams.registeredNumber,
                    startDate: queryParams.startDate,
                    endDate: queryParams.endDate,
                    orderBy: queryParams.orderBy,
                    isDescending: queryParams.isDescending
                }
            }
        ).then(response => response.data);
    }

    getDocumentById(id) {
        return http.get(`${this.endpoint}/${id}`)
            .then((res) => {
                return res.data;
            });
    }

    deleteDocumentById(id) {
        return http.delete(`${this.endpoint}/${id}`)
            .then((res) => res.data);
    }

    editDocument(document) {
        return http.put(
            `${this.endpoint}`, document
        ).then(res => res.data);
    }
}