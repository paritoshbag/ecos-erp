<?php

namespace App\Http\Middleware;

use App\Actions\Users\RecordUserAccessLogAction;
use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class RecordUserAccess
{
    /**
     * @var list<string>
     */
    private const SKIP_ROUTE_PATTERNS = [
        'login*',
        'logout',
        'password.*',
        'two-factor.*',
        'register*',
        'passkeys.*',
        'user.passkeys.*',
        'drive.items.download',
        'drive.items.preview',
        'drive.public.*',
        'letterhead.background',
        'letterhead.logo.show',
    ];

    public function __construct(private RecordUserAccessLogAction $recorder) {}

    /**
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        if ($this->shouldRecord($request, $response)) {
            $this->record($request);
        }

        return $response;
    }

    private function shouldRecord(Request $request, Response $response): bool
    {
        $user = $request->user();

        if (! $user instanceof User) {
            return false;
        }

        if ($response instanceof BinaryFileResponse || $response instanceof StreamedResponse) {
            return false;
        }

        if ($request->routeIs(self::SKIP_ROUTE_PATTERNS)) {
            return false;
        }

        if ($request->headers->has('X-Inertia-Partial-Data')) {
            return false;
        }

        if ($request->isMethod('GET')) {
            return $request->header('X-Inertia') === 'true';
        }

        return in_array($request->method(), ['POST', 'PUT', 'PATCH', 'DELETE'], true);
    }

    private function record(Request $request): void
    {
        $user = $request->user();

        if (! $user instanceof User) {
            return;
        }

        $isVisit = $request->isMethod('GET');

        $this->recorder->handle(
            user: $user,
            event: $isVisit ? 'http.visit' : 'http.request',
            method: $request->method(),
            url: $request->fullUrl(),
            routeName: $request->route()?->getName(),
            ipAddress: $request->ip(),
            userAgent: $request->userAgent(),
            payload: $isVisit ? $request->query() : $request->all(),
        );
    }
}
