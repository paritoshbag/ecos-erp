<?php

namespace App\Http\Requests\Settings;

use App\Enums\LetterheadLayout;
use App\Enums\PaperSize;
use App\Models\Letterhead;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class UpdateLetterheadRequest extends FormRequest
{
    public function authorize(): bool
    {
        $letterhead = $this->route('letterhead');

        return $letterhead instanceof Letterhead
            && ($this->user()?->can('update', $letterhead) ?? false);
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'max:100'],
            'paper_size' => ['sometimes', 'string', Rule::enum(PaperSize::class)],
            'header' => ['sometimes', 'array'],
            'header.layout' => ['required_with:header', 'string', Rule::enum(LetterheadLayout::class)],
            'header.lines' => ['required_with:header', 'array', 'max:12'],
            'header.lines.*' => ['string', 'max:200'],
            'footer' => ['sometimes', 'array'],
            'footer.lines' => ['required_with:footer', 'array', 'max:12'],
            'footer.lines.*' => ['string', 'max:200'],
            'writable_top' => ['sometimes', 'numeric', 'min:0', 'max:90'],
            'writable_left' => ['sometimes', 'numeric', 'min:0', 'max:90'],
            'writable_width' => ['sometimes', 'numeric', 'min:10', 'max:100'],
            'writable_height' => ['sometimes', 'numeric', 'min:10', 'max:100'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $fields = ['writable_top', 'writable_left', 'writable_width', 'writable_height'];
        $rounded = [];

        foreach ($fields as $field) {
            if (! $this->has($field) || ! is_numeric($this->input($field))) {
                continue;
            }

            $rounded[$field] = round((float) $this->input($field), 2);
        }

        if ($rounded === []) {
            return;
        }

        $top = $rounded['writable_top'] ?? 0.0;
        $left = $rounded['writable_left'] ?? 0.0;
        $width = $rounded['writable_width'] ?? 10.0;
        $height = $rounded['writable_height'] ?? 10.0;

        $top = min(90.0, max(0.0, $top));
        $left = min(90.0, max(0.0, $left));
        $width = min(round(100 - $left, 2), max(10.0, $width));
        $height = min(round(100 - $top, 2), max(10.0, $height));

        $this->merge([
            'writable_top' => $top,
            'writable_left' => $left,
            'writable_width' => $width,
            'writable_height' => $height,
        ]);
    }

    /**
     * @return array<int, callable>
     */
    public function after(): array
    {
        return [
            function (Validator $validator): void {
                $top = $this->input('writable_top');
                $left = $this->input('writable_left');
                $width = $this->input('writable_width');
                $height = $this->input('writable_height');

                if (! is_numeric($top) || ! is_numeric($left) || ! is_numeric($width) || ! is_numeric($height)) {
                    return;
                }

                if (round((float) $top + (float) $height, 2) > 100) {
                    $validator->errors()->add('writable_height', 'The writable area must stay on the page.');
                }

                if (round((float) $left + (float) $width, 2) > 100) {
                    $validator->errors()->add('writable_width', 'The writable area must stay on the page.');
                }
            },
        ];
    }
}
