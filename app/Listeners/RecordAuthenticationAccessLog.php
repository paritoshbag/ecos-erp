<?php

namespace App\Listeners;

use App\Actions\Users\RecordUserAccessLogAction;
use App\Models\User;
use Illuminate\Auth\Events\Failed;
use Illuminate\Auth\Events\Login;
use Illuminate\Auth\Events\Logout;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Events\Dispatcher;

class RecordAuthenticationAccessLog
{
    public function __construct(private RecordUserAccessLogAction $recorder) {}

    public function subscribe(Dispatcher $events): void
    {
        $events->listen(Login::class, [self::class, 'handleLogin']);
        $events->listen(Logout::class, [self::class, 'handleLogout']);
        $events->listen(Failed::class, [self::class, 'handleFailed']);
        $events->listen(PasswordReset::class, [self::class, 'handlePasswordReset']);
    }

    public function handleLogin(Login $event): void
    {
        if (! $event->user instanceof User) {
            return;
        }

        $this->record($event->user, 'login');
    }

    public function handleLogout(Logout $event): void
    {
        if (! $event->user instanceof User) {
            return;
        }

        $this->record($event->user, 'logout');
    }

    public function handleFailed(Failed $event): void
    {
        $user = $event->user instanceof User
            ? $event->user
            : $this->userFromCredentials($event->credentials);

        if ($user === null) {
            return;
        }

        $this->record($user, 'login_failed', [
            'reason' => 'invalid_credentials',
        ]);
    }

    public function handlePasswordReset(PasswordReset $event): void
    {
        if (! $event->user instanceof User) {
            return;
        }

        $this->record($event->user, 'password_reset');
    }

    /**
     * @param  array<string, mixed>|null  $payload
     */
    private function record(User $user, string $event, ?array $payload = null): void
    {
        $request = request();

        $this->recorder->handle(
            user: $user,
            event: $event,
            method: $request->method(),
            url: $request->fullUrl(),
            routeName: $request->route()?->getName(),
            ipAddress: $request->ip(),
            userAgent: $request->userAgent(),
            payload: $payload,
        );
    }

    /**
     * @param  array<string, mixed>  $credentials
     */
    private function userFromCredentials(array $credentials): ?User
    {
        $email = $credentials['email'] ?? null;

        if (! is_string($email) || $email === '') {
            return null;
        }

        return User::query()->where('email', $email)->first();
    }
}
