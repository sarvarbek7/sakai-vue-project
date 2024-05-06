import http from '@/clients/axios-setup';

export class DocumentService{
    endpoint = 'documents';
    apiendpoint = `${http.defaults.baseURL}/${this.endpoint}`;
    getDocumentTypes() {
        return http.get(`${this.endpoint}/types`)
        .then((res) => res.data);
    }

    getDocuments(queryParams){
        return http.get(
            `${this.endpoint}`,
            {
                params: {
                    limit: queryParams.limit,
                    page: queryParams.page,
                    organizationId: queryParams.organizationId,
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

    uploadDocuments(request){
        return http.post(
            `${this.endpoint}`,
            request,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Organization-Id': request.organizationId
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

    deleteDocumentById(id, organizationId) {
        return http.delete(`${this.endpoint}/${id}`, {
            headers: {
                "Organization-Id": organizationId
            }
        })
            .then((res) => res.data);
    }

    editDocument(document) {
        return http.put(
            `${this.endpoint}`, document, {
                headers: {
                    "Organization-Id": document.organizationId
                }
            }
        ).then(res => res.data);
    }

    download(id) {
        return http.get(
            `${this.endpoint}/download`,
            {
                params: {
                    id: id
                }
            }
        ).then((res) => res.data);
    }

    getAuditDetailsById(id){
        return http.get(`${this.endpoint}/${id}/audit`)
            .then((res) => res.data);
    }
}