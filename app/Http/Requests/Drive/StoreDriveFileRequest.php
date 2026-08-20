<?php

namespace App\Http\Requests\Drive;

use App\Models\DriveItem;
use App\Support\DriveName;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class StoreDriveFileRequest extends FormRequest
{
    use ResolvesDriveParent;

    public function authorize(): bool
    {
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
            'file' => ['required', 'file', 'max:'.config('drive.max_upload_kilobytes')],
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

                $file = $this->file('file');

                if ($file === null) {
                    return;
                }

                $name = DriveName::display($file->getClientOriginalName());

                if (DriveName::isTaken($name, $parent?->id)) {
                    $validator->errors()->add('file', 'A file or folder with this name already exists here.');
                }
            },
        ];
    }
}
