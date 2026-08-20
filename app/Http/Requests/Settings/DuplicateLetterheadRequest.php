<?php

namespace App\Http\Requests\Settings;

use App\Models\Letterhead;
use Illuminate\Foundation\Http\FormRequest;

class DuplicateLetterheadRequest extends FormRequest
{
    public function authorize(): bool
    {
        $letterhead = $this->route('letterhead');

        return $letterhead instanceof Letterhead
            && ($this->user()?->can('update', $letterhead) ?? false);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [];
    }
}
