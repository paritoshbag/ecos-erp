<?php

namespace App\Http\Requests\Drive;

use App\Models\DriveItem;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreDriveLinkRequest extends FormRequest
{
    public function authorize(): bool
    {
        $item = $this->routeItem();

        return $item !== null && $this->user()->can('share', $item);
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'expires_at' => ['nullable', 'date', 'after:now'],
        ];
    }

    public function routeItem(): ?DriveItem
    {
        $item = $this->route('item');

        return $item instanceof DriveItem ? $item : null;
    }
}
