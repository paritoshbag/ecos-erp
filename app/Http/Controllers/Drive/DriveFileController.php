<?php

namespace App\Http\Controllers\Drive;

use App\Actions\Drive\UploadFileAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Drive\StoreDriveFileRequest;
use App\Models\DriveItem;
use App\Models\User;
use App\Services\Drive\DriveDisk;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\UploadedFile;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\StreamedResponse;

class DriveFileController extends Controller
{
    public function store(StoreDriveFileRequest $request, UploadFileAction $action): RedirectResponse
    {
        $file = $request->file('file');
        abort_unless($file instanceof UploadedFile, 422);

        $user = $request->user();
        abort_unless($user instanceof User, 403);

        $action->handle(
            $user,
            $file,
            $request->parentFolder(),
        );

        Inertia::flash('toast', ['type' => 'success', 'message' => __('File uploaded.')]);

        return back();
    }

    public function download(DriveItem $item, DriveDisk $disk): StreamedResponse
    {
        abort_unless($item->isFile(), 404);

        $this->authorize('view', $item);

        return $disk->download($item);
    }

    public function preview(DriveItem $item, DriveDisk $disk): StreamedResponse
    {
        abort_unless($item->isFile() && $item->isPreviewable(), 404);

        $this->authorize('view', $item);

        return $disk->inline($item);
    }
}
