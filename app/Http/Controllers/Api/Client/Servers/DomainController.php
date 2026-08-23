<?php

namespace Pterodactyl\Http\Controllers\Api\Client\Servers;

use Exception;
use Illuminate\Http\Request;
use Pterodactyl\Models\Server;
use Illuminate\Http\JsonResponse;
use Pterodactyl\Models\DomainPool;
use Pterodactyl\Facades\Activity;
use Pterodactyl\Services\Cloudflare\CloudflareDomainService;
use Pterodactyl\Http\Controllers\Api\Client\ClientApiController;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

class DomainController extends ClientApiController
{
    public function __construct(
        private CloudflareDomainService $domainService
    ) {
        parent::__construct();
    }

    /**
     * Check if domain feature is enabled for this server.
     */
    private function validateServerFeature(Server $server): void
    {
        if (!$server->domain_feature_enabled) {
            throw new AccessDeniedHttpException('Fitur domain tidak diizinkan oleh administrator untuk server ini.');
        }
    }

    /**
     * Get domain configuration, available master domains, and server allocation.
     */
    public function index(Request $request, Server $server): JsonResponse
    {
        $server->loadMissing('allocation', 'node', 'domain.domainPool');

        $domain = $server->domain;
        $domainPools = DomainPool::where('is_active', true)->get(['id', 'domain', 'record_type', 'protocol']);

        return new JsonResponse([
            'data' => [
                'feature_enabled' => (bool) $server->domain_feature_enabled,
                'mode' => $domain ? $domain->mode : 'none',
                'is_active' => $domain ? (bool) $domain->is_active : false,
                'subdomain' => $domain ? $domain->subdomain : null,
                'full_subdomain' => $domain ? $domain->full_subdomain : null,
                'domain_pool_id' => $domain ? $domain->domain_pool_id : null,
                'custom_domain' => $domain ? $domain->custom_domain : null,
                'tunnel_id' => $domain ? $domain->tunnel_id : null,
                'has_tunnel_token' => $domain ? !empty($domain->tunnel_token) : false,
                'last_log' => $domain ? $domain->last_log : null,
                'available_pools' => $domainPools,
                'allocation' => $server->allocation ? [
                    'ip' => $server->allocation->ip,
                    'port' => $server->allocation->port,
                    'alias' => $server->allocation->ip_alias ?: ($server->node ? $server->node->fqdn : null),
                ] : null,
            ],
        ]);
    }

    /**
     * Activate or update Subdomain.
     */
    public function setSubdomain(Request $request, Server $server): JsonResponse
    {
        $this->validateServerFeature($server);

        $request->validate([
            'domain_pool_id' => 'required|integer|exists:domain_pools,id',
            'subdomain' => 'required|string|min:2|max:63',
        ]);

        $pool = DomainPool::findOrFail($request->input('domain_pool_id'));

        try {
            $domain = $this->domainService->activateSubdomain(
                $server,
                $pool,
                $request->input('subdomain')
            );

            Activity::event('server:domain.subdomain')
                ->property(['subdomain' => $domain->full_subdomain])
                ->log();

            return new JsonResponse([
                'success' => true,
                'message' => "Subdomain {$domain->full_subdomain} berhasil diaktifkan!",
                'data' => $domain,
            ]);
        } catch (Exception $e) {
            throw new BadRequestHttpException($e->getMessage());
        }
    }

    /**
     * Activate or update Custom Domain with Cloudflare Tunnel.
     */
    public function setCustomDomain(Request $request, Server $server): JsonResponse
    {
        $this->validateServerFeature($server);

        $request->validate([
            'custom_domain' => 'required|string|min:4|max:191',
            'tunnel_token' => 'nullable|string',
        ]);

        try {
            $domain = $this->domainService->activateCustomDomain(
                $server,
                $request->input('custom_domain'),
                $request->input('tunnel_token', '')
            );

            Activity::event('server:domain.custom')
                ->property(['custom_domain' => $domain->custom_domain])
                ->log();

            return new JsonResponse([
                'success' => true,
                'message' => "Custom Domain {$domain->custom_domain} berhasil diaktifkan dengan Cloudflare Tunnel!",
                'data' => $domain,
            ]);
        } catch (Exception $e) {
            throw new BadRequestHttpException($e->getMessage());
        }
    }

    /**
     * Disable all domain configurations (preserves saved inputs in DB).
     */
    public function disable(Request $request, Server $server): JsonResponse
    {
        try {
            $this->domainService->disableDomain($server);

            Activity::event('server:domain.disable')->log();

            return new JsonResponse([
                'success' => true,
                'message' => 'Konfigurasi domain dinonaktifkan (DNS/Tunnel dihapus dari jaringan, data tetap tersimpan).',
            ]);
        } catch (Exception $e) {
            throw new BadRequestHttpException($e->getMessage());
        }
    }

    /**
     * Check live health and DNS/Tunnel connectivity.
     */
    public function health(Request $request, Server $server): JsonResponse
    {
        $health = $this->domainService->checkDomainHealth($server);

        return new JsonResponse($health);
    }

    /**
     * Fetch live logs from cloudflared tunnel.
     */
    public function logs(Request $request, Server $server): JsonResponse
    {
        $logs = $this->domainService->getTunnelLogs($server);

        return new JsonResponse([
            'logs' => $logs,
        ]);
    }
}
