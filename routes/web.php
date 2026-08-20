<?php

use App\Http\Controllers\DeveloperController;
use App\Http\Controllers\Drive\DriveController;
use App\Http\Controllers\Drive\DriveFileController;
use App\Http\Controllers\Drive\DriveFolderController;
use App\Http\Controllers\Drive\DriveItemController;
use App\Http\Controllers\Drive\DriveLinkController;
use App\Http\Controllers\Drive\DriveShareController;
use App\Http\Controllers\Drive\PublicDriveController;
use App\Http\Controllers\PurchaseOrderController;
use App\Http\Controllers\Users\UserAvatarController;
use App\Http\Controllers\Users\UserController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    Route::get('users', [UserController::class, 'index'])->name('users.index');
    Route::get('users/create', [UserController::class, 'create'])->name('users.create');
    Route::post('users', [UserController::class, 'store'])->name('users.store');
    Route::get('users/{user}', [UserController::class, 'show'])->name('users.show');
    Route::patch('users/{user}', [UserController::class, 'update'])->name('users.update');
    Route::patch('users/{user}/disabled', [UserController::class, 'toggleDisabled'])->name('users.disabled');
    Route::post('users/{user}/password-reset', [UserController::class, 'sendPasswordReset'])
        ->middleware('throttle:6,1')
        ->name('users.password-reset');
    Route::post('users/{user}/avatar', [UserAvatarController::class, 'store'])
        ->middleware('throttle:20,1')
        ->name('users.avatar.store');
    Route::delete('users/{user}/avatar', [UserAvatarController::class, 'destroy'])->name('users.avatar.destroy');

    Route::post('purchase-orders/scan', [PurchaseOrderController::class, 'scan'])
        ->middleware('throttle:10,1')
        ->name('purchase-orders.scan');
    Route::get('purchase-orders/{purchaseOrder}/pdf', [PurchaseOrderController::class, 'downloadPdf'])
        ->name('purchase-orders.pdf');
    Route::get('purchase-orders/{purchaseOrder}/pdf/preview', [PurchaseOrderController::class, 'previewPdf'])
        ->name('purchase-orders.pdf.preview');
    Route::resource('purchase-orders', PurchaseOrderController::class)
        ->only(['index', 'store', 'show'])
        ->parameters(['purchase-orders' => 'purchaseOrder']);

    Route::get('developer', [DeveloperController::class, 'index'])->name('developer.index');
    Route::post('developer/purchase-orders/seed', [DeveloperController::class, 'seedPurchaseOrders'])
        ->middleware('throttle:5,1')
        ->name('developer.purchase-orders.seed');
    Route::delete('developer/purchase-orders', [DeveloperController::class, 'destroyPurchaseOrders'])
        ->middleware('throttle:5,1')
        ->name('developer.purchase-orders.destroy');

    Route::prefix('drive')->name('drive.')->group(function (): void {
        Route::get('/', [DriveController::class, 'index'])->name('index');
        Route::get('trash', [DriveController::class, 'trash'])->name('trash');
        Route::delete('trash', [DriveController::class, 'emptyTrash'])->name('trash.empty');
        Route::get('folders/{folder}', [DriveController::class, 'show'])->name('folders.show');

        Route::post('folders', [DriveFolderController::class, 'store'])->name('folders.store');
        Route::post('files', [DriveFileController::class, 'store'])
            ->middleware('throttle:20,1')
            ->name('files.store');

        Route::get('items/{item}/download', [DriveFileController::class, 'download'])->name('items.download');
        Route::get('items/{item}/preview', [DriveFileController::class, 'preview'])->name('items.preview');

        Route::patch('items/{item}', [DriveItemController::class, 'update'])->name('items.update');
        Route::delete('items/{item}', [DriveItemController::class, 'destroy'])->name('items.destroy');
        Route::post('items/{item}/restore', [DriveItemController::class, 'restore'])->withTrashed()->name('items.restore');
        Route::delete('items/{item}/purge', [DriveItemController::class, 'purge'])->withTrashed()->name('items.purge');
        Route::post('items/{item}/move', [DriveItemController::class, 'move'])->name('items.move');
        Route::post('items/{item}/copy', [DriveItemController::class, 'copy'])->name('items.copy');

        Route::post('items/{item}/shares', [DriveShareController::class, 'store'])->name('shares.store');
        Route::delete('shares/{share}', [DriveShareController::class, 'destroy'])->name('shares.destroy');

        Route::post('items/{item}/links', [DriveLinkController::class, 'store'])->name('links.store');
        Route::delete('links/{link}', [DriveLinkController::class, 'destroy'])->name('links.destroy');
    });
});

Route::middleware('throttle:60,1')->group(function (): void {
    Route::get('share/{token}', [PublicDriveController::class, 'show'])->name('drive.public.show');
    Route::get('share/{token}/download', [PublicDriveController::class, 'download'])->name('drive.public.download');
    Route::get('share/{token}/preview', [PublicDriveController::class, 'preview'])->name('drive.public.preview');
});

require __DIR__.'/settings.php';
require __DIR__.'/template.php';

