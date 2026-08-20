<?php

namespace App\Http\Controllers\Drive;

use App\Http\Controllers\Controller;
use App\Models\DriveItem;
use App\Models\DriveLink;
use App\Services\Drive\DriveDisk;
use Illuminate\Http\Request;
use Illuminate\Support\Number;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class PublicDriveController extends Controller
{
    public function show(Request $request, string $token): Response
    {
        [$link, $root, $current] = $this->resolve($token, $request->integer('item') ?: null);

        $items = $current->isFolder()
            ? $current->children()->with(['owner'])->withCount(['children'])->orderByRaw("case when type = 'folder' then 0 else 1 end")->orderBy('name')->get()
            : collect();

        return Inertia::render('drive/public', [
            'token' => $link->token,
            'root' => [
                'id' => $root->id,
                'name' => $root->name,
                'type' => $root->type->value,
            ],
            'current' => [
                'id' => $current->id,
                'name' => $current->name,
                'type' => $current->type->value,
                'mime_type' => $current->mime_type,
                'size_label' => $current->size !== null ? Number::fileSize($current->size) : null,
                'can_preview' => $current->isPreviewable(),
            ],
            'breadcrumbs' => $this->publicBreadcrumbs($link->token, $root, $current),
            'items' => $items->map(fn (DriveItem $item): array => [
                'id' => $item->id,
                'type' => $item->type->value,
                'name' => $item->name,
                'mime_type' => $item->mime_type,
                'size_label' => $item->size !== null ? Number::fileSize($item->size) : null,
                'items_count' => $item->children_count,
                'can_preview' => $item->isPreviewable(),
            ])->all(),
        ]);
    }

    public function download(Request $request, string $token, DriveDisk $disk): StreamedResponse
    {
        [, , $current] = $this->resolve($token, $request->integer('item') ?: null);

        abort_unless($current->isFile(), 404);

        return $disk->download($current);
    }

    public function preview(Request $request, string $token, DriveDisk $disk): StreamedResponse
    {
        [, , $current] = $this->resolve($token, $request->integer('item') ?: null);

        abort_unless($current->isFile() && $current->isPreviewable(), 404);

        return $disk->inline($current);
    }

    /**
     * @return array{0: DriveLink, 1: DriveItem, 2: DriveItem}
     */
    private function resolve(string $token, ?int $currentId): array
    {
        $link = DriveLink::query()->where('token', $token)->firstOrFail();

        abort_unless($link->isAccessible(), 404);

        $root = $link->item;

        if ($currentId === null || $currentId === $root->id) {
            return [$link, $root, $root];
        }

        $current = DriveItem::query()->findOrFail($currentId);

        abort_unless($root->isAncestorOf($current), 404);

        return [$link, $root, $current];
    }

    /**
     * @return list<array{title: string, href: string}>
     */
    private function publicBreadcrumbs(string $token, DriveItem $root, DriveItem $current): array
    {
        $crumbs = [
            [
                'title' => $root->name,
                'href' => route('drive.public.show', $token),
            ],
        ];

        if ($current->is($root)) {
            return $crumbs;
        }

        foreach ($current->breadcrumbTrail() as $crumb) {
            if (! $root->isAncestorOf($crumb) && ! $crumb->is($root)) {
                continue;
            }

            if ($crumb->is($root)) {
                continue;
            }

            $crumbs[] = [
                'title' => $crumb->name,
                'href' => route('drive.public.show', ['token' => $token, 'item' => $crumb->id]),
            ];
        }

        return $crumbs;
    }
}
