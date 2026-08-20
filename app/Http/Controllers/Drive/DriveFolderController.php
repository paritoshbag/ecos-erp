<?php

namespace App\Http\Controllers\Drive;

use App\Actions\Drive\CreateFolderAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Drive\StoreDriveFolderRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;

class DriveFolderController extends Controller
{
    public function store(StoreDriveFolderRequest $request, CreateFolderAction $action): RedirectResponse
    {
        $user = $request->user();
        abort_unless($user instanceof User, 403);

        $action->handle(
            $user,
            $request->validated('name'),
            $request->parentFolder(),
        );

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Folder created.')]);

        return back();
    }
}
