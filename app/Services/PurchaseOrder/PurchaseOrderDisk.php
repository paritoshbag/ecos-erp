<?php

namespace App\Services\PurchaseOrder;

use App\Models\PurchaseOrder;
use Illuminate\Filesystem\FilesystemAdapter;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\StreamedResponse;

class PurchaseOrderDisk
{
    public function filesystem(): FilesystemAdapter
    {
        return Storage::disk((string) config('purchase-orders.disk'));
    }

    /**
     * @return array{disk: string, key: string}
     */
    public function store(UploadedFile $file): array
    {
        $disk = (string) config('purchase-orders.disk');
        $uuid = (string) Str::uuid();
        $filename = 'po.pdf';
        $key = $uuid.'/'.$filename;

        $file->storeAs($uuid, $filename, $disk);

        return [
            'disk' => $disk,
            'key' => $key,
        ];
    }

    public function exists(?string $key): bool
    {
        if ($key === null || $key === '') {
            return false;
        }

        return $this->filesystem()->exists($key);
    }

    public function download(PurchaseOrder $order): StreamedResponse
    {
        $key = $order->pdf_key;
        abort_unless(is_string($key) && $this->exists($key), 404);

        return $this->filesystem()->download($key, $this->downloadName($order));
    }

    public function inline(PurchaseOrder $order): StreamedResponse
    {
        $key = $order->pdf_key;
        abort_unless(is_string($key) && $this->exists($key), 404);

        return $this->filesystem()->response(
            $key,
            $this->downloadName($order),
            [
                'Content-Type' => 'application/pdf',
            ],
            'inline',
        );
    }

    private function downloadName(PurchaseOrder $order): string
    {
        return $order->pdf_original_name ?: $order->po_number.'.pdf';
    }
}
