<?php

namespace App\Http\Requests\Drive;

use App\Models\DriveItem;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class CopyDriveItemRequest extends FormRequest
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
                $parent = $this->parentFolder();

                if ($parent !== null && $parent->isFile()) {
                    $validator->errors()->add('parent_id', 'Files cannot contain other items.');
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
