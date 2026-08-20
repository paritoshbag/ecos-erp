<?php

namespace App\Http\Controllers\Users;

use App\Actions\Users\CreateUserAction;
use App\Actions\Users\RecordUserAccessLogAction;
use App\Actions\Users\SendUserPasswordResetAction;
use App\Actions\Users\ToggleUserDisabledAction;
use App\Actions\Users\UpdateUserAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Users\SendUserPasswordResetRequest;
use App\Http\Requests\Users\StoreUserRequest;
use App\Http\Requests\Users\ToggleUserDisabledRequest;
use App\Http\Requests\Users\UpdateUserRequest;
use App\Models\User;
use App\Models\UserAccessLog;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', User::class);

        $actor = $request->user();
        abort_unless($actor instanceof User, 403);

        $users = User::query()
            ->latest('id')
            ->get()
            ->map(fn (User $user): array => [
                ...$user->toAdminArray(),
                'can_disable' => $actor->can('disable', $user),
                'can_reset_password' => $actor->can('resetPassword', $user) && ! $user->is_disabled,
            ])
            ->values();

        return Inertia::render('users/index', [
            'users' => $users,
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', User::class);

        return Inertia::render('users/create', [
            'passwordRules' => Password::defaults()->toPasswordRulesString(),
        ]);
    }

    public function store(StoreUserRequest $request, CreateUserAction $create): RedirectResponse
    {
        $user = $create->handle([
            'name' => (string) $request->validated('name'),
            'email' => (string) $request->validated('email'),
            'password' => (string) $request->validated('password'),
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('User created.')]);

        return to_route('users.show', $user);
    }

    public function show(Request $request, User $user): Response
    {
        $this->authorize('view', $user);

        $actor = $request->user();
        abort_unless($actor instanceof User, 403);

        $accessLogs = $user->accessLogs()
            ->latest('id')
            ->paginate(25)
            ->withQueryString()
            ->through(fn (UserAccessLog $log): array => $log->toAdminArray());

        return Inertia::render('users/show', [
            'user' => [
                ...$user->toAdminArray(),
                'can_disable' => $actor->can('disable', $user),
                'can_reset_password' => $actor->can('resetPassword', $user) && ! $user->is_disabled,
                'can_upload_avatar' => $actor->can('uploadAvatar', $user),
            ],
            'accessLogs' => $accessLogs,
        ]);
    }

    public function update(UpdateUserRequest $request, User $user, UpdateUserAction $update): RedirectResponse
    {
        $update->handle($user, [
            'name' => (string) $request->validated('name'),
            'email' => (string) $request->validated('email'),
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('User updated.')]);

        return to_route('users.show', $user);
    }

    public function toggleDisabled(
        ToggleUserDisabledRequest $request,
        User $user,
        ToggleUserDisabledAction $toggle,
    ): RedirectResponse {
        $user = $toggle->handle($user);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => $user->is_disabled
                ? __('User disabled.')
                : __('User enabled.'),
        ]);

        return back();
    }

    public function sendPasswordReset(
        SendUserPasswordResetRequest $request,
        User $user,
        SendUserPasswordResetAction $send,
        RecordUserAccessLogAction $recorder,
    ): RedirectResponse {
        $send->handle($user);

        $actor = $request->user();

        if ($actor instanceof User) {
            $recorder->handle(
                user: $actor,
                event: 'password_reset_sent',
                method: $request->method(),
                url: $request->fullUrl(),
                routeName: $request->route()?->getName(),
                ipAddress: $request->ip(),
                userAgent: $request->userAgent(),
                payload: ['target_user_id' => $user->id],
            );
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Password reset email sent.')]);

        return back();
    }
}
