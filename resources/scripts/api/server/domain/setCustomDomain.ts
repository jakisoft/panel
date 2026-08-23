import http from '@/api/http';

export default (uuid: string, customDomain: string, tunnelToken: string): Promise<{ success: boolean; message: string }> => {
    return new Promise((resolve, reject) => {
        http.post(`/api/client/servers/${uuid}/domain/custom`, {
            custom_domain: customDomain,
            tunnel_token: tunnelToken,
        })
            .then(({ data }) => resolve(data))
            .catch(reject);
    });
};
