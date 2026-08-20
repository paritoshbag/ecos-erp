<?php

namespace App\Http\Requests;

use App\Models\PurchaseOrder;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StorePurchaseOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', PurchaseOrder::class) ?? false;
    }

    protected function prepareForValidation(): void
    {
        $nullable = ['memo_number', 'memo_date', 'project_id', 'order_no', 'reference_no'];
        $merge = [];

        foreach ($nullable as $field) {
            if ($this->input($field) === '') {
                $merge[$field] = null;
            }
        }

        if ($this->has('ccc') && is_string($this->input('ccc'))) {
            $merge['ccc'] = Str::upper(trim($this->input('ccc')));
        }

        if ($merge !== []) {
            $this->merge($merge);
        }
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
                'mimes:pdf',
                'max:'.(int) config('purchase-orders.max_upload_kilobytes'),
            ],
            'po_number' => ['required', 'string', 'max:40', Rule::unique((new PurchaseOrder)->getTable(), 'po_number')],
            'po_date' => ['required', 'date'],
            'order_type' => ['required', 'integer', 'min:1', 'max:255'],
            'ccc' => ['required', 'string', 'max:10'],
            'description' => ['required', 'string'],
            'po_amount' => ['required', 'numeric', 'min:0'],
            'memo_number' => ['nullable', 'string', 'max:40'],
            'memo_date' => ['nullable', 'date'],
            'project_id' => ['nullable', 'string', 'max:80'],
            'order_no' => ['nullable', 'string', 'max:40'],
            'reference_no' => ['nullable', 'string', 'max:40'],
        ];
    }

    /**
     * @return array<int, callable>
     */
    public function after(): array
    {
        return [
            function (Validator $validator): void {
                $file = $this->file('file');
                $path = $file instanceof UploadedFile ? $file->getRealPath() : false;

                if ($path === false) {
                    return;
                }

                $hash = hash_file('sha256', $path);

                if ($hash !== false && PurchaseOrder::query()->where('pdf_hash', $hash)->exists()) {
                    $validator->errors()->add('file', __('This PDF was already imported.'));
                }
            },
        ];
    }

    /**
     * @return array{
     *     po_number: string,
     *     po_date: string,
     *     order_type: int,
     *     ccc: string,
     *     description: string,
     *     po_amount: string,
     *     memo_number: string|null,
     *     memo_date: string|null,
     *     project_id: string|null,
     *     order_no: string|null,
     *     reference_no: string|null
     * }
     */
    public function purchaseOrderData(): array
    {
        $this->validated();

        $memoNumber = $this->input('memo_number');
        $memoDate = $this->input('memo_date');
        $projectId = $this->input('project_id');
        $orderNo = $this->input('order_no');
        $referenceNo = $this->input('reference_no');

        return [
            'po_number' => $this->string('po_number')->toString(),
            'po_date' => $this->string('po_date')->toString(),
            'order_type' => (int) $this->integer('order_type'),
            'ccc' => $this->string('ccc')->toString(),
            'description' => $this->string('description')->toString(),
            'po_amount' => $this->string('po_amount')->toString(),
            'memo_number' => is_string($memoNumber) && $memoNumber !== '' ? $memoNumber : null,
            'memo_date' => is_string($memoDate) && $memoDate !== '' ? $memoDate : null,
            'project_id' => is_string($projectId) && $projectId !== '' ? $projectId : null,
            'order_no' => is_string($orderNo) && $orderNo !== '' ? $orderNo : null,
            'reference_no' => is_string($referenceNo) && $referenceNo !== '' ? $referenceNo : null,
        ];
    }
}
