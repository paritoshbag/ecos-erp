<?php

namespace App\Actions\Users;

use App\Models\User;
use App\Models\UserAccessLog;
use App\Support\AccessLogSanitizer;
use Illuminate\Support\Str;

class RecordUserAccessLogAction
{
    public function __construct(private AccessLogSanitizer $sanitizer) {}

    /**
     * @param  array<string, mixed>|null  $payload
     */
    public function handle(
        ?User $user,
        string $event,
        ?string $method = null,
        ?string $url = null,
        ?string $routeName = null,
        ?string $ipAddress = null,
        ?string $userAgent = null,
        ?array $payload = null,
    ): void {
        if ($user === null) {
            return;
        }

        $attributes = [
            'user_id' => $user->id,
            'event' => $event,
            'method' => $method,
            'url' => $url !== null ? Str::limit($url, 2048, '') : null,
            'route_name' => $routeName,
            'ip_address' => $ipAddress,
            'user_agent' => $userAgent !== null ? Str::limit($userAgent, 512, '') : null,
            'payload' => $payload !== null ? $this->sanitizer->sanitize($payload) : null,
            'created_at' => now(),
        ];

        defer(fn () => UserAccessLog::query()->create($attributes));
    }
}
