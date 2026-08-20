<?php

namespace App\Http\Requests\Drive;

use App\Models\DriveItem;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class EmptyDriveTrashRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('viewAny', DriveItem::class) ?? false;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'confirmation' => ['required', 'string', Rule::in(['CONFIRM'])],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'confirmation.in' => 'Type CONFIRM to permanently empty trash.',
        ];
    }
}
