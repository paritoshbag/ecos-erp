<?php

namespace App\Http\Controllers\Drive;

use App\Actions\Drive\CopyDriveItemAction;
use App\Actions\Drive\MoveDriveItemAction;
use App\Actions\Drive\PurgeDriveItemAction;
use App\Actions\Drive\RenameDriveItemAction;
use App\Actions\Drive\RestoreDriveItemAction;
use App\Actions\Drive\TrashDriveItemAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Drive\CopyDriveItemRequest;
use App\Http\Requests\Drive\MoveDriveItemRequest;
use App\Http\Requests\Drive\UpdateDriveItemRequest;
use App\Models\DriveItem;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;

class DriveItemController extends Controller
{
    public function update(UpdateDriveItemRequest $request, DriveItem $item, RenameDriveItemAction $action): RedirectResponse
    {
        $action->handle($item, $request->validated('name'));

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Renamed.')]);

        return back();
    }

    public function destroy(DriveItem $item, TrashDriveItemAction $action): RedirectResponse
    {
        $this->authorize('delete', $item);

        $action->handle($item);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Moved to trash.')]);

        return back();
    }

    public function restore(DriveItem $item, RestoreDriveItemAction $action): RedirectResponse
    {
        $this->authorize('restore', $item);

        $action->handle($item);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Restored.')]);

        return back();
    }

    public function purge(DriveItem $item, PurgeDriveItemAction $action): RedirectResponse
    {
        $this->authorize('forceDelete', $item);

        $action->handle($item);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Permanently deleted.')]);

        return back();
    }

    public function move(MoveDriveItemRequest $request, DriveItem $item, MoveDriveItemAction $action): RedirectResponse
    {
        $action->handle($item, $request->parentFolder());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Moved.')]);

        return back();
    }

    public function copy(CopyDriveItemRequest $request, DriveItem $item, CopyDriveItemAction $action): RedirectResponse
    {
        $user = $request->user();
        abort_unless($user instanceof User, 403);

        $action->handle($item, $user, $request->parentFolder());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Copied.')]);

        return back();
    }
}
