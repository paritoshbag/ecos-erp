<?php

use App\Http\Controllers\Settings\LetterheadController;
use App\Http\Controllers\Settings\OrganizationController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\SecurityController;
use Illuminate\Auth\Middleware\RequirePassword;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->group(function () {
    Route::redirect('settings', '/settings/profile');

    Route::get('settings/organization', [OrganizationController::class, 'edit'])->name('organization.edit');
    Route::patch('settings/organization', [OrganizationController::class, 'update'])->name('organization.update');

    Route::get('settings/letterhead', [LetterheadController::class, 'edit'])->name('letterhead.edit');
    Route::post('settings/letterhead/from-preset', [LetterheadController::class, 'storeFromPreset'])->name('letterhead.from-preset');
    Route::post('settings/letterhead/scans', [LetterheadController::class, 'storeScan'])
        ->middleware('throttle:20,1')
        ->name('letterhead.scans.store');
    Route::post('settings/letterhead/{letterhead}/duplicate', [LetterheadController::class, 'duplicate'])->name('letterhead.duplicate');
    Route::post('settings/letterhead/{letterhead}/activate', [LetterheadController::class, 'activate'])->name('letterhead.activate');
    Route::patch('settings/letterhead/{letterhead}', [LetterheadController::class, 'update'])->name('letterhead.update');
    Route::post('settings/letterhead/{letterhead}/logo', [LetterheadController::class, 'storeLogo'])
        ->middleware('throttle:20,1')
        ->name('letterhead.logo.store');
    Route::get('settings/letterhead/{letterhead}/background', [LetterheadController::class, 'background'])->name('letterhead.background');
    Route::get('settings/letterhead/{letterhead}/logo', [LetterheadController::class, 'logo'])->name('letterhead.logo.show');
    Route::delete('settings/letterhead/{letterhead}', [LetterheadController::class, 'destroy'])->name('letterhead.destroy');

    Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('settings/profile', [ProfileController::class, 'update'])->name('profile.update');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::delete('settings/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('settings/security', [SecurityController::class, 'edit'])
        ->middleware(RequirePassword::class)
        ->name('security.edit');

    Route::put('settings/password', [SecurityController::class, 'update'])
        ->middleware('throttle:6,1')
        ->name('user-password.update');

    Route::inertia('settings/appearance', 'settings/appearance')->name('appearance.edit');
});

Route::get('.well-known/passkey-endpoints', function () {
    return response()->json([
        'enroll' => route('security.edit'),
        'manage' => route('security.edit'),
    ]);
})->name('well-known.passkeys');
