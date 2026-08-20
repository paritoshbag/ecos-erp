<?php

namespace App\Http\Requests\Settings;

use App\Models\Organization;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;

class UpdateOrganizationRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->can('viewAny', Organization::class) ?? false;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'company_name' => ['sometimes', 'required', 'string', 'max:255'],
            'gst' => ['sometimes', 'required', 'string', 'size:15', 'regex:/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/'],
            'pan' => ['sometimes', 'required', 'string', 'size:10', 'regex:/^[A-Z]{5}[0-9]{4}[A-Z]$/'],
            'address' => ['sometimes', 'required', 'string', 'max:2000'],
            'email' => ['sometimes', 'required', 'string', 'email', 'max:255'],
            'website' => ['sometimes', 'nullable', 'string', 'max:255', 'url'],
            'mobile' => ['sometimes', 'required', 'digits:10'],
            'secondary_mobile' => ['sometimes', 'nullable', 'digits:10'],
            'company_type' => ['sometimes', 'nullable', 'string', 'max:100'],
            'vendor_code' => ['sometimes', 'required', 'string', 'max:50'],
            'field1' => ['sometimes', 'nullable', 'string', 'max:255'],
            'field2' => ['sometimes', 'nullable', 'string', 'max:255'],
            'field3' => ['sometimes', 'nullable', 'string', 'max:255'],
            'field4' => ['sometimes', 'nullable', 'string', 'max:255'],
            'field5' => ['sometimes', 'nullable', 'string', 'max:255'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'gst.size' => 'GSTIN must be exactly 15 characters.',
            'gst.regex' => 'Enter a valid 15-character GSTIN.',
            'pan.size' => 'PAN must be exactly 10 characters.',
            'pan.regex' => 'Enter a valid 10-character PAN.',
            'mobile.digits' => 'Enter a 10-digit mobile number.',
            'secondary_mobile.digits' => 'Enter a 10-digit secondary mobile number.',
        ];
    }

    protected function prepareForValidation(): void
    {
        $normalized = [];

        if ($this->exists('gst')) {
            $normalized['gst'] = $this->normalizeTaxCode($this->input('gst'));
        }

        if ($this->exists('pan')) {
            $normalized['pan'] = $this->normalizeTaxCode($this->input('pan'));
        }

        if ($normalized !== []) {
            $this->merge($normalized);
        }
    }

    private function normalizeTaxCode(mixed $value): mixed
    {
        if (! is_string($value)) {
            return $value;
        }

        return Str::upper((string) preg_replace('/[^A-Za-z0-9]/', '', $value));
    }
}
