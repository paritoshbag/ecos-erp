<?php

namespace App\Support;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;

class AccessLogSanitizer
{
    /**
     * @var list<string>
     */
    private const SENSITIVE_KEYS = [
        'password',
        'password_confirmation',
        'current_password',
        'current_token',
        '_token',
        'token',
        'secret',
        'two_factor_secret',
        'two_factor_code',
        'two_factor_recovery_code',
        'two_factor_recovery_codes',
        'recovery_code',
        'recovery_codes',
    ];

    private const MAX_DEPTH = 6;

    private const MAX_STRING = 2000;

    private const MAX_ITEMS = 40;

    public function sanitize(mixed $value, int $depth = 0): mixed
    {
        if ($depth >= self::MAX_DEPTH) {
            return '[truncated]';
        }

        if ($value instanceof UploadedFile) {
            return [
                'filename' => $value->getClientOriginalName(),
                'size' => $value->getSize(),
                'mime' => $value->getClientMimeType(),
            ];
        }

        if (is_array($value)) {
            return $this->sanitizeArray($value, $depth);
        }

        if (is_string($value)) {
            return Str::limit($value, self::MAX_STRING, '');
        }

        if (is_scalar($value) || $value === null) {
            return $value;
        }

        return class_basename($value);
    }

    /**
     * @param  array<mixed>  $value
     * @return array<mixed>
     */
    private function sanitizeArray(array $value, int $depth): array
    {
        $sanitized = [];
        $count = 0;

        foreach ($value as $key => $item) {
            if ($count >= self::MAX_ITEMS) {
                $sanitized['_truncated'] = true;

                break;
            }

            $count++;

            if (is_string($key) && $this->isSensitiveKey($key)) {
                $sanitized[$key] = '[redacted]';

                continue;
            }

            $sanitized[$key] = $this->sanitize($item, $depth + 1);
        }

        return $sanitized;
    }

    private function isSensitiveKey(string $key): bool
    {
        $normalized = Str::lower($key);

        if (in_array($normalized, self::SENSITIVE_KEYS, true)) {
            return true;
        }

        return Str::contains($normalized, ['password', 'secret', 'token', 'recovery']);
    }
}
