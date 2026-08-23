export interface DomainPool {
    id: number;
    domain: string;
    record_type: string;
    protocol: string;
}

export interface ServerAllocation {
    ip: string;
    port: number;
    alias: string | null;
}

export interface ServerDomainData {
    mode: 'none' | 'subdomain' | 'custom';
    is_active: boolean;
    subdomain: string | null;
    full_subdomain: string | null;
    domain_pool_id: number | null;
    custom_domain: string | null;
    tunnel_id: string | null;
    has_tunnel_token: boolean;
    last_log: string | null;
    available_pools: DomainPool[];
    allocation: ServerAllocation | null;
}
