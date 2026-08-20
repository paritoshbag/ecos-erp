<?php

namespace App\Http\Requests\Drive;

use App\Models\DriveItem;
use App\Rules\UniqueDriveName;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateDriveItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        $item = $this->routeItem();

        return $item !== null && $this->user()->can('update', $item);
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $item = $this->routeItem();

        return [
            'name' => [
                'required',
                'string',
                'max:255',
                new UniqueDriveName($item?->parent_id, $item?->id),
            ],
        ];
    }

    public function routeItem(): ?DriveItem
    {
        $item = $this->route('item');

        return $item instanceof DriveItem ? $item : null;
    }
}
