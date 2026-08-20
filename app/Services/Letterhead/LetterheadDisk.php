<?php

namespace App\Services\Letterhead;

use Illuminate\Filesystem\FilesystemAdapter;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\StreamedResponse;

class LetterheadDisk
{
    public function filesystem(): FilesystemAdapter
    {
        return Storage::disk((string) config('letterheads.disk'));
    }

    /**
     * @return array{disk: string, key: string, mime_type: string}
     */
    public function store(UploadedFile $file, string $kind): array
    {
        $disk = (string) config('letterheads.disk');
        $uuid = (string) Str::uuid();
        $extension = $file->guessExtension() ?: $file->getClientOriginalExtension() ?: 'bin';
        $filename = $kind.'.'.$extension;
        $key = $uuid.'/'.$filename;

        $file->storeAs($uuid, $filename, $disk);

        return [
            'disk' => $disk,
            'key' => $key,
            'mime_type' => $file->getMimeType() ?: 'application/octet-stream',
        ];
    }

    public function copy(string $fromKey): string
    {
        $uuid = (string) Str::uuid();
        $toKey = $uuid.'/'.basename($fromKey);

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

    public function inline(string $key, ?string $mime, string $downloadName): StreamedResponse
    {
        return $this->filesystem()->response(
            $key,
            $downloadName,
            [
                'Content-Type' => $mime ?? 'application/octet-stream',
            ],
            'inline',
        );
    }
}
