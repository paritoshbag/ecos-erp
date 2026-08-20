import {
    BadgeCheck,
    CalendarClock,
    Landmark,
    TriangleAlert,
} from 'lucide-react';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { useChrome } from '@/hooks/use-chrome';
import {
    organizationDisplayName,
    useOrganization,
} from '@/hooks/use-organization';
import { licensedContractor } from '@/lib/app-config';
import { cn } from '@/lib/utils';
import type { OrganizationIdentity } from '@/types';

/*
 * Whose company is this session working under?
 *
 * The topbar shows the saved organisation so staff always know which
 * letterhead, vendor code and tax details apply. The template playground
 * keeps a mock licence record so the chrome can be reviewed without a
 * tenant.
 */

const RENEWAL_WARNING_DAYS = 90;

function daysUntil(iso: string): number {
    const target = new Date(iso).getTime();

    return Math.ceil((target - Date.now()) / 86_400_000);
}

function hasChromeIdentity(
    organization: OrganizationIdentity | null,
): organization is OrganizationIdentity {
    return Boolean(
        organization?.company_name?.trim() || organization?.vendor_code?.trim(),
    );
}

function Detail({
    label,
    value,
}: {
    label: string;
    value: string | null | undefined;
}) {
    const text = value?.trim();

    if (!text) {
        return null;
    }

    return (
        <div className="flex items-baseline justify-between gap-3">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="max-w-[12rem] text-right font-medium break-words">
                {text}
            </dd>
        </div>
    );
}

function OrganizationBadge({
    organization,
}: {
    organization: OrganizationIdentity;
}) {
    const name = organizationDisplayName(organization) ?? 'Organization';
    const vendorCode = organization.vendor_code?.trim();

    return (
        <Popover>
            <PopoverTrigger asChild>
                <button
                    type="button"
                    data-test="organization-badge"
                    className="flex max-w-[16rem] min-w-0 items-center gap-1.5 rounded-md px-1.5 py-1 text-left transition-colors hover:bg-topbar-accent focus-visible:ring-2 focus-visible:ring-topbar-ring focus-visible:outline-none"
                >
                    <BadgeCheck className="size-3.5 shrink-0 text-success" />
                    <span className="grid min-w-0 leading-tight">
                        <span className="truncate text-xs font-semibold text-topbar-foreground">
                            {name}
                        </span>
                        {vendorCode && (
                            <span className="truncate text-2xs text-topbar-muted-foreground">
                                Vendor {vendorCode}
                            </span>
                        )}
                    </span>
                </button>
            </PopoverTrigger>

            <PopoverContent align="start" className="w-72 p-0">
                <div className="flex items-start gap-2 p-3">
                    <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                        <Landmark className="size-4" />
                    </span>
                    <div className="min-w-0">
                        <p className="text-sm leading-tight font-semibold">
                            {name}
                        </p>
                        {organization.company_type?.trim() && (
                            <p className="mt-0.5 text-2xs text-muted-foreground">
                                {organization.company_type}
                            </p>
                        )}
                    </div>
                </div>
                <Separator />
                <dl className="grid gap-1.5 p-3 text-xs">
                    <Detail label="Vendor code" value={organization.vendor_code} />
                    <Detail label="GSTIN" value={organization.gst} />
                    <Detail label="PAN" value={organization.pan} />
                    <Detail label="Mobile" value={organization.mobile} />
                    <Detail label="Email" value={organization.email} />
                    <Detail label="Address" value={organization.address} />
                </dl>
            </PopoverContent>
        </Popover>
    );
}

function PreviewContractorBadge() {
    const contractor = licensedContractor;
    const remaining = daysUntil(contractor.validTill);
    const expiring = remaining <= RENEWAL_WARNING_DAYS;

    return (
        <Popover>
            <PopoverTrigger asChild>
                <button
                    type="button"
                    className="flex max-w-[16rem] min-w-0 items-center gap-1.5 rounded-md px-1.5 py-1 text-left transition-colors hover:bg-topbar-accent focus-visible:ring-2 focus-visible:ring-topbar-ring focus-visible:outline-none"
                >
                    {expiring ? (
                        <TriangleAlert className="size-3.5 shrink-0 text-warning" />
                    ) : (
                        <BadgeCheck className="size-3.5 shrink-0 text-success" />
                    )}
                    <span className="grid min-w-0 leading-tight">
                        <span className="truncate text-xs font-semibold text-topbar-foreground">
                            {contractor.name}
                        </span>
                        <span className="truncate text-2xs text-topbar-muted-foreground">
                            Licence {contractor.licenceNo}
                        </span>
                    </span>
                </button>
            </PopoverTrigger>

            <PopoverContent align="start" className="w-72 p-0">
                <div className="flex items-start gap-2 p-3">
                    <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                        <Landmark className="size-4" />
                    </span>
                    <div className="min-w-0">
                        <p className="text-sm leading-tight font-semibold">
                            {contractor.name}
                        </p>
                        <p className="mt-0.5 text-2xs text-muted-foreground">
                            {contractor.authority}
                        </p>
                    </div>
                </div>
                <Separator />
                <dl className="grid gap-1.5 p-3 text-xs">
                    <div className="flex items-baseline justify-between gap-3">
                        <dt className="text-muted-foreground">Licence no.</dt>
                        <dd className="font-mono text-2xs font-medium tabular-nums">
                            {contractor.licenceNo}
                        </dd>
                    </div>
                    <div className="flex items-baseline justify-between gap-3">
                        <dt className="text-muted-foreground">Class</dt>
                        <dd className="font-medium">
                            {contractor.licenceClass}
                        </dd>
                    </div>
                    <div className="flex items-baseline justify-between gap-3">
                        <dt className="text-muted-foreground">Valid until</dt>
                        <dd className="font-medium tabular-nums">
                            {new Date(
                                contractor.validTill,
                            ).toLocaleDateString()}
                        </dd>
                    </div>
                </dl>
                <Separator />
                <p
                    className={cn(
                        'flex items-center gap-1.5 px-3 py-2 text-2xs font-medium',
                        expiring ? 'text-warning' : 'text-muted-foreground',
                    )}
                >
                    <CalendarClock className="size-3.5" />
                    {remaining > 0
                        ? `Renews in ${remaining} day${remaining === 1 ? '' : 's'}`
                        : 'Licence has lapsed — renew before certifying work'}
                </p>
            </PopoverContent>
        </Popover>
    );
}

export function ContractorBadge() {
    const { mode } = useChrome();
    const organization = useOrganization();

    if (mode === 'preview') {
        return <PreviewContractorBadge />;
    }

    if (!hasChromeIdentity(organization)) {
        return null;
    }

    return <OrganizationBadge organization={organization} />;
}
