<?php

namespace Pterodactyl\Models;

use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property string $domain
 * @property string $zone_id
 * @property string|null $api_token
 * @property string $record_type
 * @property string $protocol
 * @property bool $is_active
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property \Illuminate\Database\Eloquent\Collection|\Pterodactyl\Models\ServerDomain[] $serverDomains
 */
class DomainPool extends Model
{
    /**
     * The table associated with the model.
     */
    protected $table = 'domain_pools';

    /**
     * Fields that are not mass assignable.
     */
    protected $guarded = ['id', 'created_at', 'updated_at'];

    /**
     * Default values for specific fields in the database.
     */
    protected $casts = [
        'id' => 'int',
        'is_active' => 'bool',
    ];

    /**
     * Rules verifying that the data being stored matches the expectations of the database.
     */
    public static array $validationRules = [
        'domain' => 'required|string|max:191|unique:domain_pools,domain',
        'zone_id' => 'required|string|max:191',
        'api_token' => 'nullable|string|max:191',
        'record_type' => 'required|string|in:CNAME,A,SRV',
        'protocol' => 'required|string|in:tcp,udp,http',
        'is_active' => 'sometimes|boolean',
    ];

    public function serverDomains(): HasMany
    {
        return $this->hasMany(ServerDomain::class);
    }
}
