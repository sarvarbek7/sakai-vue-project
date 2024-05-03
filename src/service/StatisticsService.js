import http from '@/clients/axios-setup'

export class StatisticsService{
    endpoint = 'statistics';

    getGeneralStatistics(){
        return http.get(`${this.endpoint}/general`)
        .then(res => res.data);
    }

    getAnnualReport(year) {
        return http.get(`${this.endpoint}/annual`, {
            params: {
                year: year
            }
        })
        .then(res => res.data);
    }

    getOrganizationStatistics(organizationId){
        return http.get(`${this.endpoint}/organizationStatistics`, {
            params: {
                organizationId: organizationId
            }
        }).then(res => res.data);
    }
}