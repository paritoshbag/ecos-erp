<?php

namespace App\Exceptions;

use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class PurchaseOrderPdfUnreadableException extends Exception
{
    public function __construct()
    {
        parent::__construct(__('Could not read this PDF. It may be a scanned image.'));
    }

    public function render(Request $request): JsonResponse|RedirectResponse
    {
        if ($request->expectsJson()) {
            return response()->json([
                'message' => $this->getMessage(),
                'errors' => [
                    'file' => [$this->getMessage()],
                ],
            ], 422);
        }

        return back()->withErrors(['file' => $this->getMessage()]);
    }
}
