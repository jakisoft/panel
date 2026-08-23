import http from '@/api/http';

export default (uuid: string, domainPoolId: number, subdomain: string): Promise<{ success: boolean; message: string }> => {
    return new Promise((resolve, reject) => {
        http.post(`/api/client/servers/${uuid}/domain/subdomain`, {
            domain_pool_id: domainPoolId,
            subdomain,
        })
            .then(({ data }) => resolve(data))
            .catch(reject);
    });
};
