<?php

namespace App\Http\Controllers\Drive;

use App\Actions\Drive\ShareDriveItemAction;
use App\Actions\Drive\UnshareDriveItemAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Drive\StoreDriveShareRequest;
use App\Models\DriveItem;
use App\Models\DriveShare;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;

class DriveShareController extends Controller
{
    public function store(StoreDriveShareRequest $request, DriveItem $item, ShareDriveItemAction $action): RedirectResponse
    {
        $grantee = $request->grantee();
        abort_unless($grantee instanceof User, 403);

        $action->handle($item, $grantee);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Editor access granted.')]);

        return back();
    }

    public function destroy(DriveShare $share, UnshareDriveItemAction $action): RedirectResponse
    {
        $share->load('item');

        $this->authorize('share', $share->item);

        $action->handle($share);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Access removed.')]);

        return back();
    }
}
