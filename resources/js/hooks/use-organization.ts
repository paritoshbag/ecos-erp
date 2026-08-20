import { usePage } from '@inertiajs/react';
import type { OrganizationIdentity } from '@/types';

export function useOrganization(): OrganizationIdentity | null {
    return usePage().props.organization ?? null;
}

export function organizationDisplayName(
    organization: OrganizationIdentity | null,
): string | null {
    const name = organization?.company_name?.trim();

    return name ? name : null;
}
