<?php

namespace App\Http\Controllers\Users;

use App\Actions\Users\DeleteUserAvatarAction;
use App\Actions\Users\StoreUserAvatarAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Users\DestroyUserAvatarRequest;
use App\Http\Requests\Users\StoreUserAvatarRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\UploadedFile;
use Inertia\Inertia;

class UserAvatarController extends Controller
{
    public function store(
        StoreUserAvatarRequest $request,
        User $user,
        StoreUserAvatarAction $store,
    ): RedirectResponse {
        $file = $request->file('avatar');
        abort_unless($file instanceof UploadedFile, 422);

        $store->handle($user, $file);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Avatar updated.')]);

        return back();
    }

    public function destroy(
        DestroyUserAvatarRequest $request,
        User $user,
        DeleteUserAvatarAction $delete,
    ): RedirectResponse {
        $delete->handle($user);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Avatar removed.')]);

        return back();
    }
}
