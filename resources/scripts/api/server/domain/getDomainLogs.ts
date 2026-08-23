import http from '@/api/http';

export default (uuid: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        http.get(`/api/client/servers/${uuid}/domain/logs`)
            .then(({ data }) => resolve(data.logs))
            .catch(reject);
    });
};
