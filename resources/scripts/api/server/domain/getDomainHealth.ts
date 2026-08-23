import http from '@/api/http';

export interface DomainHealthResult {
    connected: boolean;
    status: string;
    mode?: string;
    domain?: string;
    resolved_ip?: string;
    dns_resolved?: boolean;
    port_open?: boolean;
    latency_ms?: number;
    container_running?: boolean;
    message: string;
}

export default (uuid: string): Promise<DomainHealthResult> => {
    return new Promise((resolve, reject) => {
        http.get(`/api/client/servers/${uuid}/domain/health`)
            .then(({ data }) => resolve(data))
            .catch(reject);
    });
};
