<?php

namespace Pterodactyl\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $server_id
 * @property string $mode
 * @property int|null $domain_pool_id
 * @property string|null $subdomain
 * @property string|null $full_subdomain
 * @property string|null $dns_record_id
 * @property string|null $srv_record_id
 * @property string|null $custom_domain
 * @property string|null $tunnel_token
 * @property string|null $tunnel_id
 * @property string|null $tunnel_account_id
 * @property bool $is_active
 * @property string|null $last_log
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property \Pterodactyl\Models\Server $server
 * @property \Pterodactyl\Models\DomainPool|null $domainPool
 */
class ServerDomain extends Model
{
    /**
     * The table associated with the model.
     */
    protected $table = 'server_domains';

    /**
     * Fields that are not mass assignable.
     */
    protected $guarded = ['id', 'created_at', 'updated_at'];

    /**
     * Default values for specific fields in the database.
     */
    protected $casts = [
        'id' => 'int',
        'server_id' => 'int',
        'domain_pool_id' => 'int',
        'is_active' => 'bool',
    ];

    /**
     * Rules verifying that the data being stored matches the expectations of the database.
     */
    public static array $validationRules = [
        'server_id' => 'required|numeric|exists:servers,id',
        'mode' => 'required|string|in:none,subdomain,custom',
        'domain_pool_id' => 'nullable|numeric|exists:domain_pools,id',
        'subdomain' => 'nullable|string|max:64',
        'full_subdomain' => 'nullable|string|max:191',
        'custom_domain' => 'nullable|string|max:191',
        'tunnel_token' => 'nullable|string',
        'is_active' => 'sometimes|boolean',
    ];

    public function server(): BelongsTo
    {
        return $this->belongsTo(Server::class);
    }

    public function domainPool(): BelongsTo
    {
        return $this->belongsTo(DomainPool::class);
    }
}
