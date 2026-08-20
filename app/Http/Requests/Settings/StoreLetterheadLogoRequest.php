<?php

namespace App\Http\Requests\Settings;

use App\Models\Letterhead;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreLetterheadLogoRequest extends FormRequest
{
    public function authorize(): bool
    {
        $letterhead = $this->route('letterhead');

        return $letterhead instanceof Letterhead
            && $letterhead->isDesigned()
            && $letterhead->is_custom
            && ($this->user()?->can('update', $letterhead) ?? false);
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'logo' => [
                'required',
                'file',
                'mimes:'.implode(',', $this->allowedMimes()),
                'max:'.(int) config('letterheads.max_logo_kilobytes'),
            ],
        ];
    }

    /**
     * @return list<string>
     */
    private function allowedMimes(): array
    {
        /** @var list<string> $mimes */
        $mimes = config('letterheads.logo_mimes');

        return $mimes;
    }
}
