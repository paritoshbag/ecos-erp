<?php

namespace App\Http\Requests\Drive;

use App\Models\DriveItem;
use App\Support\DriveName;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class MoveDriveItemRequest extends FormRequest
{
    use ResolvesDriveParent;

    public function authorize(): bool
    {
        $item = $this->routeItem();

        if ($item === null || ! $this->user()->can('update', $item)) {
            return false;
        }

        $parent = $this->parentFolder();

        if ($parent === null) {
            return $this->user()->can('create', DriveItem::class);
        }

        return $this->user()->can('create', [DriveItem::class, $parent]);
    }

    protected function prepareForValidation(): void
    {
        $this->prepareParentId();
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'parent_id' => ['nullable', 'integer', 'exists:drive_items,id'],
        ];
    }

    /**
     * @return array<int, callable>
     */
    public function after(): array
    {
        return [
            function (Validator $validator): void {
                $item = $this->routeItem();
                $parent = $this->parentFolder();

                if ($item === null) {
                    return;
                }

                if ($parent !== null && $parent->isFile()) {
                    $validator->errors()->add('parent_id', 'Files cannot contain other items.');
                }

                if ($item->parent_id === $parent?->id) {
                    return;
                }

                if (DriveName::isTaken($item->name, $parent?->id, $item->id)) {
                    $validator->errors()->add('parent_id', 'A file or folder with this name already exists here.');
                }
            },
        ];
    }

    public function routeItem(): ?DriveItem
    {
        $item = $this->route('item');

        return $item instanceof DriveItem ? $item : null;
    }
}
