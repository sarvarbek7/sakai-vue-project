import http from '@/clients/axios-setup';

export class DocumentService{
    getDocumentTypes() {
        return http.get('documentTypes')
        .then((res) => res.data);
    }

    uploadDocuments(request){
        return http.post(
            'documents',
            request,
            {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }
        ).then(res => res.data);
    }
}