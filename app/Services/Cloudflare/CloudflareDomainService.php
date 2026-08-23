<?php

namespace Pterodactyl\Services\Cloudflare;

use Exception;
use Pterodactyl\Models\Server;
use Pterodactyl\Models\DomainPool;
use Pterodactyl\Models\ServerDomain;
use Pterodactyl\Contracts\Repository\SettingsRepositoryInterface;

class CloudflareDomainService
{
    protected array $reservedSubdomains = [
        'admin', 'administrator', 'panel', 'cpanel', 'api', 'app', 'mail', 'webmail',
        'smtp', 'pop', 'imap', 'ftp', 'sftp', 'ssh', 'ns1', 'ns2', 'ns3', 'ns4',
        'dns', 'root', 'www', 'ssl', 'autodiscover', 'autoconfig', 'status', 'billing',
        'support', 'node', 'nodes', 'daemon', 'wings', 'pterodactyl', 'cloud', 'vpn',
    ];

    public function __construct(
        private SettingsRepositoryInterface $settings
    ) {
    }

    /**
     * Get Cloudflare API token.
     */
    public function getGlobalApiToken(): ?string
    {
        return $this->settings->get('settings::cloudflare:api_token', config('services.cloudflare.api_token'));
    }

    /**
     * Validate subdomain format.
     */
    public function validateSubdomainName(string $subdomain): void
    {
        $subdomain = strtolower(trim($subdomain));

        if (strlen($subdomain) < 2 || strlen($subdomain) > 63) {
            throw new Exception('Nama subdomain harus memiliki panjang antara 2 hingga 63 karakter.');
        }

        if (!preg_match('/^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/', $subdomain)) {
            throw new Exception('Subdomain hanya boleh mengandung huruf kecil (a-z), angka (0-9), dan tanda hubung (-).');
        }

        if (in_array($subdomain, $this->reservedSubdomains, true)) {
            throw new Exception("Nama subdomain '{$subdomain}' telah direservasi dan tidak dapat digunakan.");
        }
    }

    /**
     * Activate / Update Subdomain for a server.
     */
    public function activateSubdomain(Server $server, DomainPool $pool, string $subdomain): ServerDomain
    {
        $this->validateSubdomainName($subdomain);
        $subdomain = strtolower(trim($subdomain));
        $fullSubdomain = "{$subdomain}.{$pool->domain}";

        // Check if taken by another server
        $existing = ServerDomain::where('full_subdomain', $fullSubdomain)
            ->where('server_id', '!=', $server->id)
            ->where('is_active', true)
            ->first();

        if ($existing) {
            throw new Exception("Subdomain '{$fullSubdomain}' sudah digunakan oleh server lain.");
        }

        // Get or create server domain record
        $serverDomain = ServerDomain::firstOrNew(['server_id' => $server->id]);

        // Cleanup previous custom domain/tunnel if active
        if ($serverDomain->mode === 'custom' && $serverDomain->is_active) {
            $this->stopTunnelProcess($server);
        }

        // Delete old DNS record on Cloudflare if exists
        if ($serverDomain->dns_record_id && $serverDomain->domain_pool_id) {
            $oldPool = DomainPool::find($serverDomain->domain_pool_id);
            if ($oldPool) {
                $this->deleteCloudflareDnsRecord($oldPool->zone_id, $serverDomain->dns_record_id, $oldPool->api_token);
            }
        }
        if ($serverDomain->srv_record_id && $serverDomain->domain_pool_id) {
            $oldPool = DomainPool::find($serverDomain->domain_pool_id);
            if ($oldPool) {
                $this->deleteCloudflareDnsRecord($oldPool->zone_id, $serverDomain->srv_record_id, $oldPool->api_token);
            }
        }

        // Get server primary allocation info
        $server->loadMissing('allocation', 'node');
        $allocation = $server->allocation;
        if (!$allocation) {
            throw new Exception('Server tidak memiliki allocation/port utama yang aktif.');
        }

        $targetIp = $allocation->ip;
        $targetPort = $allocation->port;
        $targetAlias = $allocation->ip_alias ?: ($server->node ? $server->node->fqdn : null);

        $apiToken = $pool->api_token ?: $this->getGlobalApiToken();
        if (empty($apiToken)) {
            throw new Exception('Cloudflare API Token belum dikonfigurasi oleh Admin.');
        }

        // Create DNS Record (A or CNAME)
        $dnsRecordId = null;
        $srvRecordId = null;

        if (filter_var($targetIp, FILTER_VALIDATE_IP)) {
            // A Record
            $dnsRecordId = $this->createCloudflareDnsRecord(
                $pool->zone_id,
                'A',
                $subdomain,
                $targetIp,
                1,
                false, // Must not be proxied for game ports
                $apiToken
            );
        } elseif (!empty($targetAlias)) {
            // CNAME Record
            $dnsRecordId = $this->createCloudflareDnsRecord(
                $pool->zone_id,
                'CNAME',
                $subdomain,
                $targetAlias,
                1,
                false,
                $apiToken
            );
        } else {
            throw new Exception('Gagal mendeteksi IP atau FQDN valid dari node server.');
        }

        // Create SRV Record for Minecraft / Game servers
        try {
            $srvRecordId = $this->createCloudflareSrvRecord(
                $pool->zone_id,
                '_minecraft',
                '_tcp',
                $subdomain,
                0,
                5,
                $targetPort,
                $fullSubdomain,
                $apiToken
            );
        } catch (Exception $e) {
            // Non-fatal if SRV fails
        }

        $serverDomain->mode = 'subdomain';
        $serverDomain->domain_pool_id = $pool->id;
        $serverDomain->subdomain = $subdomain;
        $serverDomain->full_subdomain = $fullSubdomain;
        $serverDomain->dns_record_id = $dnsRecordId;
        $serverDomain->srv_record_id = $srvRecordId;
        $serverDomain->is_active = true;
        $serverDomain->last_log = "Subdomain {$fullSubdomain} aktif terhubung ke {$targetIp}:{$targetPort}";
        $serverDomain->save();

        return $serverDomain;
    }

    /**
     * Activate / Update Custom Domain with Cloudflare Tunnel.
     */
    public function activateCustomDomain(Server $server, string $customDomain, string $tunnelToken): ServerDomain
    {
        $customDomain = strtolower(trim($customDomain));
        $tunnelToken = trim($tunnelToken);

        if (empty($customDomain) || !preg_match('/^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/', $customDomain)) {
            throw new Exception('Format nama domain kustom tidak valid.');
        }

        $serverDomain = ServerDomain::firstOrNew(['server_id' => $server->id]);

        $finalToken = !empty($tunnelToken) ? $tunnelToken : $serverDomain->tunnel_token;
        if (empty($finalToken)) {
            throw new Exception('Cloudflare Tunnel Token wajib diisi.');
        }

        // Decode Tunnel Token to extract account_id & tunnel_id
        $decoded = $this->decodeTunnelToken($finalToken);
        $accountId = $decoded['a'] ?? null;
        $tunnelId = $decoded['t'] ?? null;

        // Cleanup previous subdomain if was active
        if ($serverDomain->mode === 'subdomain' && $serverDomain->dns_record_id && $serverDomain->domain_pool_id) {
            $pool = DomainPool::find($serverDomain->domain_pool_id);
            if ($pool) {
                $this->deleteCloudflareDnsRecord($pool->zone_id, $serverDomain->dns_record_id, $pool->api_token);
                if ($serverDomain->srv_record_id) {
                    $this->deleteCloudflareDnsRecord($pool->zone_id, $serverDomain->srv_record_id, $pool->api_token);
                }
            }
            $serverDomain->dns_record_id = null;
            $serverDomain->srv_record_id = null;
        }

        // Start cloudflared docker container for this server
        $this->startTunnelProcess($server, $finalToken);

        $serverDomain->mode = 'custom';
        $serverDomain->custom_domain = $customDomain;
        $serverDomain->tunnel_token = $finalToken;
        $serverDomain->tunnel_id = $tunnelId;
        $serverDomain->tunnel_account_id = $accountId;
        $serverDomain->is_active = true;
        $serverDomain->last_log = "Custom Domain {$customDomain} aktif melalui Cloudflare Tunnel";
        $serverDomain->save();

        return $serverDomain;
    }

    /**
     * Disable all active network routes (deletes live DNS & stops tunnel)
     * but PRESERVES configuration values in database so user doesn't have to re-type.
     */
    public function disableDomain(Server $server): bool
    {
        $serverDomain = ServerDomain::where('server_id', $server->id)->first();
        if (!$serverDomain) {
            return true;
        }

        // 1. If subdomain mode was active, delete Cloudflare DNS records
        if ($serverDomain->dns_record_id && $serverDomain->domain_pool_id) {
            $pool = DomainPool::find($serverDomain->domain_pool_id);
            if ($pool) {
                $this->deleteCloudflareDnsRecord($pool->zone_id, $serverDomain->dns_record_id, $pool->api_token);
                if ($serverDomain->srv_record_id) {
                    $this->deleteCloudflareDnsRecord($pool->zone_id, $serverDomain->srv_record_id, $pool->api_token);
                }
            }
        }

        // 2. If custom tunnel mode was active, stop and remove container
        $this->stopTunnelProcess($server);

        // 3. Mark inactive but PRESERVE user configuration
        $serverDomain->dns_record_id = null;
        $serverDomain->srv_record_id = null;
        $serverDomain->is_active = false;
        $serverDomain->last_log = 'Konfigurasi dinonaktifkan (DNS/Tunnel dihapus dari jaringan, pengaturan tetap tersimpan).';
        $serverDomain->save();

        return true;
    }

    /**
     * Check live health / connectivity status for a server's domain.
     */
    public function checkDomainHealth(Server $server): array
    {
        $serverDomain = ServerDomain::where('server_id', $server->id)->first();
        if (!$serverDomain || !$serverDomain->is_active) {
            return [
                'connected' => false,
                'status' => 'inactive',
                'message' => 'Domain saat ini dalam keadaan nonaktif.',
            ];
        }

        $server->loadMissing('allocation');
        $port = $server->allocation ? $server->allocation->port : 25565;

        if ($serverDomain->mode === 'subdomain') {
            $domain = $serverDomain->full_subdomain;
            $resolvedIp = gethostbyname($domain);
            $dnsResolved = ($resolvedIp !== $domain);

            // Test TCP socket ping to port
            $portOpen = false;
            $startTime = microtime(true);
            $socket = @fsockopen($resolvedIp, $port, $errno, $errstr, 2);
            $latency = round((microtime(true) - $startTime) * 1000);

            if ($socket) {
                $portOpen = true;
                fclose($socket);
            }

            return [
                'connected' => $dnsResolved,
                'status' => $dnsResolved ? 'connected' : 'propagating',
                'mode' => 'subdomain',
                'domain' => $domain,
                'resolved_ip' => $resolvedIp,
                'dns_resolved' => $dnsResolved,
                'port_open' => $portOpen,
                'latency_ms' => $latency,
                'message' => $dnsResolved ? "DNS telah terpropagasi ke {$resolvedIp} (Latency: {$latency}ms)" : "DNS masih dalam proses propagasi Cloudflare.",
            ];
        }

        if ($serverDomain->mode === 'custom') {
            $containerName = "cloudflared_{$server->uuid}";
            exec("docker inspect -f '{{.State.Running}}' " . escapeshellarg($containerName) . " 2>/dev/null", $output, $returnCode);
            $containerRunning = ($returnCode === 0 && isset($output[0]) && trim($output[0]) === 'true');

            return [
                'connected' => $containerRunning,
                'status' => $containerRunning ? 'connected' : 'stopped',
                'mode' => 'custom',
                'domain' => $serverDomain->custom_domain,
                'container_running' => $containerRunning,
                'message' => $containerRunning ? 'Konektor Cloudflare Tunnel aktif dan berjalan normal.' : 'Konektor Cloudflare Tunnel sedang berhenti.',
            ];
        }

        return [
            'connected' => false,
            'status' => 'none',
            'message' => 'Tidak ada domain yang dikonfigurasi.',
        ];
    }

    /**
     * Test Master Domain / Zone status with Cloudflare API.
     */
    public function checkMasterDomain(DomainPool $pool): array
    {
        $token = $pool->api_token ?: $this->getGlobalApiToken();
        if (empty($token)) {
            return [
                'success' => false,
                'message' => 'API Token belum dikonfigurasi.',
            ];
        }

        $url = "https://api.cloudflare.com/client/v4/zones/{$pool->zone_id}";

        $startTime = microtime(true);
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 5);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            "Authorization: Bearer {$token}",
            'Content-Type: application/json',
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $latency = round((microtime(true) - $startTime) * 1000);
        curl_close($ch);

        $data = json_decode($response, true);

        if ($httpCode === 200 && isset($data['result']['name'])) {
            return [
                'success' => true,
                'zone_name' => $data['result']['name'],
                'zone_status' => $data['result']['status'] ?? 'active',
                'nameservers' => $data['result']['name_servers'] ?? [],
                'latency_ms' => $latency,
                'message' => "Zone {$data['result']['name']} terverifikasi Aktif di Cloudflare ({$latency}ms).",
            ];
        }

        $errorMsg = $data['errors'][0]['message'] ?? "HTTP Status $httpCode";
        return [
            'success' => false,
            'message' => "Gagal menghubungi Cloudflare: {$errorMsg}",
        ];
    }

    /**
     * Test Global Cloudflare API Token validity.
     */
    public function testGlobalApiToken(?string $token = null): array
    {
        $apiToken = $token ?: $this->getGlobalApiToken();
        if (empty($apiToken)) {
            return [
                'success' => false,
                'message' => 'Token API Cloudflare kosong.',
            ];
        }

        $url = 'https://api.cloudflare.com/client/v4/user/tokens/verify';

        $startTime = microtime(true);
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 5);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            "Authorization: Bearer {$apiToken}",
            'Content-Type: application/json',
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $latency = round((microtime(true) - $startTime) * 1000);
        curl_close($ch);

        $data = json_decode($response, true);

        if ($httpCode === 200 && ($data['result']['status'] ?? '') === 'active') {
            return [
                'success' => true,
                'message' => "API Token Cloudflare valid & aktif! (Respon: {$latency}ms)",
            ];
        }

        $errorMsg = $data['errors'][0]['message'] ?? 'Token tidak valid atau otorisasi ditolak.';
        return [
            'success' => false,
            'message' => "Validasi Token Gagal: {$errorMsg}",
        ];
    }

    /**
     * Fetch live logs for cloudflared container.
     */
    public function getTunnelLogs(Server $server): string
    {
        $containerName = "cloudflared_{$server->uuid}";
        $cmd = "docker logs --tail 60 " . escapeshellarg($containerName) . " 2>&1";
        exec($cmd, $output, $returnCode);

        if ($returnCode !== 0 || empty($output)) {
            return "Tidak ada log aktif untuk tunnel ini (Container: {$containerName}).";
        }

        return implode("\n", $output);
    }

    /**
     * Decode Base64 Cloudflare Tunnel Token.
     */
    public function decodeTunnelToken(string $token): array
    {
        $clean = trim($token);
        $json = base64_decode($clean, true);
        if ($json === false) {
            return [];
        }

        $data = json_decode($json, true);
        return is_array($data) ? $data : [];
    }

    /**
     * Start Docker container for cloudflared.
     */
    protected function startTunnelProcess(Server $server, string $token): void
    {
        $containerName = "cloudflared_{$server->uuid}";
        exec("docker rm -f " . escapeshellarg($containerName) . " >/dev/null 2>&1");

        $runCmd = sprintf(
            'docker run -d --name %s --restart unless-stopped --network host cloudflare/cloudflared:latest tunnel run --token %s 2>&1',
            escapeshellarg($containerName),
            escapeshellarg($token)
        );

        exec($runCmd, $output, $returnCode);
    }

    /**
     * Stop Docker container for cloudflared.
     */
    protected function stopTunnelProcess(Server $server): void
    {
        $containerName = "cloudflared_{$server->uuid}";
        exec("docker rm -f " . escapeshellarg($containerName) . " >/dev/null 2>&1");
    }

    /**
     * Create DNS Record via Cloudflare API.
     */
    protected function createCloudflareDnsRecord(
        string $zoneId,
        string $type,
        string $name,
        string $content,
        int $ttl = 1,
        bool $proxied = false,
        ?string $apiToken = null
    ): string {
        $token = $apiToken ?: $this->getGlobalApiToken();
        $url = "https://api.cloudflare.com/client/v4/zones/{$zoneId}/dns_records";

        $body = [
            'type' => $type,
            'name' => $name,
            'content' => $content,
            'ttl' => $ttl,
            'proxied' => $proxied,
        ];

        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            "Authorization: Bearer {$token}",
            'Content-Type: application/json',
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        $data = json_decode($response, true);

        if ($httpCode >= 200 && $httpCode < 300 && isset($data['result']['id'])) {
            return $data['result']['id'];
        }

        $errorMsg = $data['errors'][0]['message'] ?? 'Gagal membuat DNS record di Cloudflare.';
        throw new Exception("Cloudflare API Error: {$errorMsg}");
    }

    /**
     * Create SRV Record via Cloudflare API.
     */
    protected function createCloudflareSrvRecord(
        string $zoneId,
        string $service,
        string $proto,
        string $name,
        int $priority,
        int $weight,
        int $port,
        string $target,
        ?string $apiToken = null
    ): string {
        $token = $apiToken ?: $this->getGlobalApiToken();
        $url = "https://api.cloudflare.com/client/v4/zones/{$zoneId}/dns_records";

        $body = [
            'type' => 'SRV',
            'data' => [
                'service' => $service,
                'proto' => $proto,
                'name' => $name,
                'priority' => $priority,
                'weight' => $weight,
                'port' => $port,
                'target' => $target,
            ],
            'ttl' => 1,
        ];

        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            "Authorization: Bearer {$token}",
            'Content-Type: application/json',
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        $data = json_decode($response, true);

        if ($httpCode >= 200 && $httpCode < 300 && isset($data['result']['id'])) {
            return $data['result']['id'];
        }

        $errorMsg = $data['errors'][0]['message'] ?? 'Gagal membuat SRV record di Cloudflare.';
        throw new Exception("Cloudflare SRV Error: {$errorMsg}");
    }

    /**
     * Delete DNS Record via Cloudflare API.
     */
    public function deleteCloudflareDnsRecord(string $zoneId, string $recordId, ?string $apiToken = null): bool
    {
        $token = $apiToken ?: $this->getGlobalApiToken();
        if (empty($token) || empty($zoneId) || empty($recordId)) {
            return false;
        }

        $url = "https://api.cloudflare.com/client/v4/zones/{$zoneId}/dns_records/{$recordId}";

        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'DELETE');
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            "Authorization: Bearer {$token}",
            'Content-Type: application/json',
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        return $httpCode >= 200 && $httpCode < 300;
    }
}
