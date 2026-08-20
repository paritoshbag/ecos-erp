<?php

namespace App\Http\Controllers\Drive;

use App\Actions\Drive\EmptyDriveTrashAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Drive\EmptyDriveTrashRequest;
use App\Http\Resources\DriveItemResource;
use App\Models\DriveItem;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Number;
use Inertia\Inertia;
use Inertia\Response;

class DriveController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', DriveItem::class);

        return $this->browse($request, null);
    }

    public function show(Request $request, DriveItem $folder): Response
    {
        abort_unless($folder->isFolder(), 404);

        $this->authorize('view', $folder);

        return $this->browse($request, $folder);
    }

    public function trash(Request $request): Response
    {
        $this->authorize('viewAny', DriveItem::class);

        $user = $request->user();
        abort_unless($user instanceof User, 403);

        $items = DriveItem::onlyTrashed()
            ->with(['owner', 'shares.user', 'links'])
            ->withCount(['children', 'shares', 'links'])
            ->orderByDesc('deleted_at')
            ->get()
            ->filter(fn (DriveItem $item): bool => $user->can('restore', $item))
            ->values();

        return Inertia::render('drive/trash', [
            'items' => $items->map(fn (DriveItem $item): array => DriveItemResource::make($item, $user))->all(),
            'storage' => $this->storagePayload(),
        ]);
    }

    public function emptyTrash(EmptyDriveTrashRequest $request, EmptyDriveTrashAction $action): RedirectResponse
    {
        $user = $request->user();
        abort_unless($user instanceof User, 403);

        $action->handle($user);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Trash emptied.')]);

        return back();
    }

    private function browse(Request $request, ?DriveItem $folder): Response
    {
        $user = $request->user();
        abort_unless($user instanceof User, 403);

        $search = trim((string) $request->string('q'));

        $query = DriveItem::query()
            ->with(['owner', 'shares.user', 'links'])
            ->withCount(['children', 'shares', 'links']);

        if ($search !== '') {
            $query->where('name', 'like', '%'.addcslashes($search, '%_\\').'%');
        } else {
            $query->inFolder($folder?->id);
        }

        $items = $query
            ->orderByRaw("case when type = 'folder' then 0 else 1 end")
            ->orderBy('name')
            ->get();

        $canCreate = $folder === null
            ? $user->can('create', DriveItem::class)
            : $user->can('create', [DriveItem::class, $folder]);

        return Inertia::render('drive/index', [
            'folder' => DriveItemResource::folderSummary($folder),
            'breadcrumbs' => DriveItemResource::breadcrumbs($folder),
            'items' => $items->map(fn (DriveItem $item): array => DriveItemResource::make($item, $user))->all(),
            'folders' => $this->writableFolders($user),
            'storage' => $this->storagePayload(),
            'can_create' => $canCreate,
            'query' => $search,
        ]);
    }

    /**
     * @return list<array{id: int|null, label: string}>
     */
    private function writableFolders(User $user): array
    {
        $folders = DriveItem::query()->folders()->orderBy('path')->get();
        $byId = $folders->keyBy('id');

        $options = [
            ['id' => null, 'label' => 'Company drive'],
        ];

        foreach ($folders as $folder) {
            if (! $user->can('update', $folder)) {
                continue;
            }

            $label = collect($folder->ancestorIds())
                ->map(fn (int $id): ?string => $byId->get($id)?->name)
                ->filter()
                ->implode(' / ');

            $options[] = [
                'id' => $folder->id,
                'label' => $label !== '' ? $label : $folder->name,
            ];
        }

        return $options;
    }

    /**
     * @return array{used_bytes: int, used_label: string}
     */
    private function storagePayload(): array
    {
        $used = (int) DriveItem::query()->files()->sum('size');

        return [
            'used_bytes' => $used,
            'used_label' => Number::fileSize($used),
        ];
    }
}
