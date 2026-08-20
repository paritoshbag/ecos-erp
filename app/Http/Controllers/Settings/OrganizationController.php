<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\UpdateOrganizationRequest;
use App\Models\Organization;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class OrganizationController extends Controller
{
    /**
     * Show the organization settings page.
     */
    public function edit(): Response
    {
        Gate::authorize('viewAny', Organization::class);

        return Inertia::render('settings/organization', [
            'organization' => Organization::current(),
        ]);
    }

    /**
     * Update the organization settings.
     */
    public function update(UpdateOrganizationRequest $request): RedirectResponse
    {
        $organization = Organization::current();

        Gate::authorize('update', $organization);

        $organization->fill($request->validated());
        $organization->save();

        return to_route('organization.edit');
    }
}
