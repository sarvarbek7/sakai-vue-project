import http from '@/clients/axios-setup';

export class AuthService {
    endpoint = 'auth';

    updateCred(credential){
        return http.put(
            `${this.endpoint}/credentials`,
            credential
        ).then(response => response.data);
    }
}