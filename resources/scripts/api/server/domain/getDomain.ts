import http from '@/api/http';
import { ServerDomainData } from './types';

export default (uuid: string): Promise<ServerDomainData> => {
    return new Promise((resolve, reject) => {
        http.get(`/api/client/servers/${uuid}/domain`)
            .then(({ data }) => resolve(data.data))
            .catch(reject);
    });
};
