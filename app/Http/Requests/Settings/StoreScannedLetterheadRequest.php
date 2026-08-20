<?php

namespace App\Http\Requests\Settings;

use App\Enums\PaperSize;
use App\Models\Letterhead;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class StoreScannedLetterheadRequest extends FormRequest
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
        return [
            'file' => [
                'required',
                'file',
                'mimes:'.implode(',', $this->allowedMimes()),
                'max:'.(int) config('letterheads.max_scan_kilobytes'),
            ],
            'paper_size' => ['nullable', 'string', Rule::enum(PaperSize::class)],
            'name' => ['nullable', 'string', 'max:100'],
        ];
    }

    public function paperSize(): PaperSize
    {
        $value = $this->validated('paper_size');

        return is_string($value) ? PaperSize::from($value) : PaperSize::A4;
    }

    public function letterheadName(): string
    {
        $name = $this->validated('name');

        if (is_string($name) && $name !== '') {
            return $name;
        }

        $file = $this->file('file');
        $original = pathinfo($file?->getClientOriginalName() ?? 'Scanned letterhead', PATHINFO_FILENAME);

        return Str::limit($original !== '' ? $original : 'Scanned letterhead', 100, '');
    }

    /**
     * @return list<string>
     */
    private function allowedMimes(): array
    {
        /** @var list<string> $mimes */
        $mimes = config('letterheads.scan_mimes');

        return $mimes;
    }
}
