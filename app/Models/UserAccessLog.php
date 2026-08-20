<?php

namespace App\Models;

use Database\Factories\UserAccessLogFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int|null $user_id
 * @property string $event
 * @property string|null $method
 * @property string|null $url
 * @property string|null $route_name
 * @property string|null $ip_address
 * @property string|null $user_agent
 * @property array<string, mixed>|null $payload
 * @property Carbon|null $created_at
 */
#[Fillable([
    'user_id',
    'event',
    'method',
    'url',
    'route_name',
    'ip_address',
    'user_agent',
    'payload',
    'created_at',
])]
class UserAccessLog extends Model
{
    /** @use HasFactory<UserAccessLogFactory> */
    use HasFactory;

    public $timestamps = false;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'payload' => 'array',
            'created_at' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return array{
     *     id: int,
     *     event: string,
     *     method: string|null,
     *     url: string|null,
     *     route_name: string|null,
     *     ip_address: string|null,
     *     user_agent: string|null,
     *     payload: array<string, mixed>|null,
     *     created_at: string|null
     * }
     */
    public function toAdminArray(): array
    {
        return [
            'id' => $this->id,
            'event' => $this->event,
            'method' => $this->method,
            'url' => $this->url,
            'route_name' => $this->route_name,
            'ip_address' => $this->ip_address,
            'user_agent' => $this->user_agent,
            'payload' => $this->payload,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
