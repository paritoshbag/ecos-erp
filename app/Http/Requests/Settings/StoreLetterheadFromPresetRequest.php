<?php

namespace App\Http\Requests\Settings;

use App\Models\Letterhead;
use App\Services\Letterhead\LetterheadService;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreLetterheadFromPresetRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', Letterhead::class) ?? false;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $keys = array_keys(app(LetterheadService::class)->presets());

        return [
            'preset' => ['required', 'string', Rule::in($keys)],
            'duplicate' => ['sometimes', 'boolean'],
        ];
    }
}
