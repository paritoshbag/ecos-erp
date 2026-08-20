<?php

namespace App\Http\Controllers\Settings;

use App\Actions\Letterhead\ActivateLetterheadAction;
use App\Actions\Letterhead\CreateFromPresetAction;
use App\Actions\Letterhead\DeleteLetterheadAction;
use App\Actions\Letterhead\DuplicateLetterheadAction;
use App\Actions\Letterhead\StoreLetterheadLogoAction;
use App\Actions\Letterhead\StoreScannedLetterheadAction;
use App\Actions\Letterhead\UpdateLetterheadAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\DuplicateLetterheadRequest;
use App\Http\Requests\Settings\StoreLetterheadFromPresetRequest;
use App\Http\Requests\Settings\StoreLetterheadLogoRequest;
use App\Http\Requests\Settings\StoreScannedLetterheadRequest;
use App\Http\Requests\Settings\UpdateLetterheadRequest;
use App\Models\Letterhead;
use App\Models\Organization;
use App\Services\Letterhead\LetterheadDisk;
use App\Services\Letterhead\LetterheadService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class LetterheadController extends Controller
{
    /**
     * Show the letterhead settings page.
     */
    public function edit(Request $request, LetterheadService $letterheads): Response
    {
        $this->authorize('viewAny', Letterhead::class);

        $organization = Organization::current();

        return Inertia::render('settings/letterhead', [
            'presets' => array_values($letterheads->presets()),
            'tokens' => $letterheads->tokens(),
            'tokenValues' => $letterheads->tokenValues($organization),
            'letterheads' => Letterhead::query()
                ->latest('id')
                ->get()
                ->map(fn (Letterhead $letterhead): array => $letterhead->toSettingsArray())
                ->values()
                ->all(),
            'selectedId' => $request->integer('selected') ?: Letterhead::current()?->id,
        ]);
    }

    /**
     * Use (or create) a designed preset, or start an editable copy of one.
     */
    public function storeFromPreset(
        StoreLetterheadFromPresetRequest $request,
        CreateFromPresetAction $action,
        DuplicateLetterheadAction $duplicate,
    ): RedirectResponse {
        $shouldDuplicate = $request->boolean('duplicate');
        $letterhead = $action->handle((string) $request->validated('preset'), activate: ! $shouldDuplicate);

        if ($shouldDuplicate) {
            $letterhead = $duplicate->handle($letterhead);

            Inertia::flash('toast', ['type' => 'success', 'message' => __('Letterhead copied. You can edit this one.')]);

            return to_route('letterhead.edit', ['selected' => $letterhead->id]);
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Letterhead activated.')]);

        return to_route('letterhead.edit', ['selected' => $letterhead->id]);
    }

    /**
     * Duplicate a letterhead into an editable copy.
     */
    public function duplicate(DuplicateLetterheadRequest $request, Letterhead $letterhead, DuplicateLetterheadAction $action): RedirectResponse
    {
        $copy = $action->handle($letterhead);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Letterhead duplicated.')]);

        return to_route('letterhead.edit', ['selected' => $copy->id]);
    }

    /**
     * Mark a letterhead as the one reports will use.
     */
    public function activate(Letterhead $letterhead, ActivateLetterheadAction $action): RedirectResponse
    {
        $this->authorize('update', $letterhead);

        $action->handle($letterhead);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('This letterhead is now used on reports.')]);

        return to_route('letterhead.edit', ['selected' => $letterhead->id]);
    }

    /**
     * Auto-save name, paper size, header/footer, or writable area.
     */
    public function update(UpdateLetterheadRequest $request, Letterhead $letterhead, UpdateLetterheadAction $action): JsonResponse
    {
        $updated = $action->handle($letterhead, $request->validated());

        return response()->json([
            'letterhead' => $updated->toSettingsArray(),
        ]);
    }

    /**
     * Upload a scanned A4/Letter image as a new letterhead.
     */
    public function storeScan(StoreScannedLetterheadRequest $request, StoreScannedLetterheadAction $action): RedirectResponse
    {
        $file = $request->file('file');
        abort_unless($file instanceof UploadedFile, 422);

        $letterhead = $action->handle($file, $request->paperSize(), $request->letterheadName());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Scanned letterhead uploaded.')]);

        return to_route('letterhead.edit', ['selected' => $letterhead->id]);
    }

    /**
     * Upload a logo for a custom designed letterhead.
     */
    public function storeLogo(StoreLetterheadLogoRequest $request, Letterhead $letterhead, StoreLetterheadLogoAction $action): RedirectResponse
    {
        $file = $request->file('logo');
        abort_unless($file instanceof UploadedFile, 422);

        $action->handle($letterhead, $file);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Logo updated.')]);

        return to_route('letterhead.edit', ['selected' => $letterhead->id]);
    }

    /**
     * Stream the scanned background image.
     */
    public function background(Letterhead $letterhead, LetterheadDisk $disk): StreamedResponse
    {
        $this->authorize('view', $letterhead);
        abort_unless($letterhead->hasBackground() && is_string($letterhead->background_key), 404);

        return $disk->inline($letterhead->background_key, $letterhead->background_mime, 'letterhead.png');
    }

    /**
     * Stream the designed-template logo.
     */
    public function logo(Letterhead $letterhead, LetterheadDisk $disk): StreamedResponse
    {
        $this->authorize('view', $letterhead);
        abort_unless($letterhead->hasLogo() && is_string($letterhead->logo_key), 404);

        return $disk->inline($letterhead->logo_key, $letterhead->logo_mime, 'logo.png');
    }

    /**
     * Delete a non-active letterhead.
     */
    public function destroy(Letterhead $letterhead, DeleteLetterheadAction $action): RedirectResponse
    {
        $this->authorize('delete', $letterhead);

        $action->handle($letterhead);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Letterhead deleted.')]);

        return to_route('letterhead.edit');
    }
}
