<?php

use Illuminate\Support\Facades\Route;

/*
 * UI Template routes — intentionally outside the auth middleware so the design
 * system can be reviewed and tested without logging in. Remove or guard this
 * group before production release.
 */
Route::prefix('template')->name('template.')->group(function (): void {
    Route::inertia('/', 'template/index')->name('index');

    Route::inertia('dashboards/executive', 'template/dashboards/executive')->name('dashboards.executive');
    Route::inertia('dashboards/finance', 'template/dashboards/finance')->name('dashboards.finance');
    Route::inertia('dashboards/hr', 'template/dashboards/hr')->name('dashboards.hr');

    Route::inertia('components', 'template/components')->name('components');
    Route::inertia('forms', 'template/forms')->name('forms');
    Route::inertia('wizard', 'template/wizard')->name('wizard');
    Route::inertia('tables', 'template/tables')->name('tables');
    Route::inertia('widgets', 'template/widgets')->name('widgets');

    Route::inertia('files', 'template/files')->name('files');
    Route::inertia('tasks', 'template/tasks')->name('tasks');

    Route::inertia('auth/login', 'template/auth/login')->name('auth.login');
    Route::inertia('auth/register', 'template/auth/register')->name('auth.register');
    Route::inertia('auth/forgot-password', 'template/auth/forgot-password')->name('auth.forgot-password');
});
