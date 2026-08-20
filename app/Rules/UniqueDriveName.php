<?php

namespace App\Rules;

use App\Support\DriveName;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Translation\PotentiallyTranslatedString;

class UniqueDriveName implements ValidationRule
{
    public function __construct(
        private ?int $parentId,
        private ?int $ignoreId = null,
    ) {}

    /**
     * Run the validation rule.
     *
     * @param  Closure(string, ?string=): PotentiallyTranslatedString  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! is_string($value) || $value === '') {
            return;
        }

        if (DriveName::isTaken($value, $this->parentId, $this->ignoreId)) {
            $fail('A file or folder with this name already exists here.');
        }
    }
}
