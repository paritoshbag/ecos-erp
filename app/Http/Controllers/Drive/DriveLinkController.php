<?php

namespace App\Http\Controllers\Drive;

use App\Actions\Drive\CreateDriveLinkAction;
use App\Actions\Drive\RevokeDriveLinkAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Drive\StoreDriveLinkRequest;
use App\Models\DriveItem;
use App\Models\DriveLink;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Carbon;
use Inertia\Inertia;

class DriveLinkController extends Controller
{
    public function store(StoreDriveLinkRequest $request, DriveItem $item, CreateDriveLinkAction $action): RedirectResponse
    {
        $user = $request->user();
        abort_unless($user instanceof User, 403);

        $expiresAt = $request->validated('expires_at');

        $action->handle(
            $item,
            $user,
            is_string($expiresAt) ? Carbon::parse($expiresAt) : null,
        );

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Public link created.')]);

        return back();
    }

    public function destroy(DriveLink $link, RevokeDriveLinkAction $action): RedirectResponse
    {
        $link->load('item');

        $this->authorize('share', $link->item);

        $action->handle($link);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Public link revoked.')]);

        return back();
    }
}
