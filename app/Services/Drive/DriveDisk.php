<?php

namespace App\Services\Drive;

use App\Models\DriveItem;
use App\Support\DriveName;
use Illuminate\Filesystem\FilesystemAdapter;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\StreamedResponse;

class DriveDisk
{
    public function filesystem(): FilesystemAdapter
    {
        return Storage::disk((string) config('drive.disk'));
    }

    /**
     * @return array{disk: string, key: string, mime_type: string, size: int}
     */
    public function store(UploadedFile $file): array
    {
        $disk = (string) config('drive.disk');
        $uuid = (string) Str::uuid();
        $filename = DriveName::storage($file->getClientOriginalName());
        $directory = 'drive/'.$uuid;
        $key = $directory.'/'.$filename;

        $file->storeAs($directory, $filename, $disk);

        return [
            'disk' => $disk,
            'key' => $key,
            'mime_type' => $file->getMimeType() ?: 'application/octet-stream',
            'size' => (int) $file->getSize(),
        ];
    }

    public function copy(string $fromKey): string
    {
        $uuid = (string) Str::uuid();
        $toKey = 'drive/'.$uuid.'/'.basename($fromKey);

        $this->filesystem()->copy($fromKey, $toKey);

        return $toKey;
    }

    public function delete(?string $key): void
    {
        if ($key === null || $key === '') {
            return;
        }

        $this->filesystem()->delete($key);
    }

    public function exists(?string $key): bool
    {
        if ($key === null || $key === '') {
            return false;
        }

        return $this->filesystem()->exists($key);
    }

    public function download(DriveItem $item): StreamedResponse
    {
        return $this->filesystem()->download($item->key, $item->name);
    }

    public function inline(DriveItem $item): StreamedResponse
    {
        return $this->filesystem()->response(
            $item->key,
            $item->name,
            [
                'Content-Type' => $item->mime_type ?? 'application/octet-stream',
            ],
            'inline',
        );
    }
}
