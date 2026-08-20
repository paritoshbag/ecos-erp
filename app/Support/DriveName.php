<?php

namespace App\Support;

use App\Models\DriveItem;
use Illuminate\Support\Str;

final class DriveName
{
    public static function display(string $original): string
    {
        $name = Str::of($original)
            ->replace(['/', '\\'], '')
            ->trim()
            ->substr(0, 255)
            ->toString();

        return $name !== '' ? $name : 'Untitled';
    }

    public static function storage(string $original): string
    {
        $basename = basename($original);
        $sanitized = preg_replace('/[^A-Za-z0-9._-]+/', '_', $basename) ?? 'file';
        $sanitized = trim($sanitized, '._');

        if ($sanitized === '') {
            $sanitized = 'file';
        }

        return Str::limit($sanitized, 100, '');
    }

    public static function isTaken(string $name, ?int $parentId, ?int $ignoreId = null): bool
    {
        return DriveItem::query()
            ->when(
                $parentId === null,
                fn ($query) => $query->whereNull('parent_id'),
                fn ($query) => $query->where('parent_id', $parentId),
            )
            ->when($ignoreId !== null, fn ($query) => $query->where('id', '!=', $ignoreId))
            ->whereRaw('LOWER(name) = ?', [Str::lower($name)])
            ->exists();
    }

    public static function available(string $name, ?int $parentId, ?int $ignoreId = null): string
    {
        if (! self::isTaken($name, $parentId, $ignoreId)) {
            return $name;
        }

        $extension = pathinfo($name, PATHINFO_EXTENSION);
        $base = pathinfo($name, PATHINFO_FILENAME);
        $suffix = $extension !== '' ? '.'.$extension : '';

        $candidate = $base.' copy'.$suffix;
        $i = 2;

        while (self::isTaken($candidate, $parentId, $ignoreId)) {
            $candidate = $base.' copy '.$i.$suffix;
            $i++;
        }

        return $candidate;
    }
}
