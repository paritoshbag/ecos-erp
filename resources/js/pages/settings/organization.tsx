import { Head, useForm } from '@inertiajs/react';
import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { update } from '@/actions/App/Http/Controllers/Settings/OrganizationController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import TaxCodeInput from '@/components/tax-code-input';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { edit } from '@/routes/organization';

const SAVE_DEBOUNCE_MS = 600;

const ORGANIZATION_FIELDS = [
    'company_name',
    'gst',
    'pan',
    'address',
    'email',
    'website',
    'mobile',
    'secondary_mobile',
    'company_type',
    'vendor_code',
    'field1',
    'field2',
    'field3',
    'field4',
    'field5',
] as const;

export type OrganizationSettings = {
    id: number;
    company_name: string | null;
    gst: string | null;
    pan: string | null;
    address: string | null;
    email: string | null;
    website: string | null;
    mobile: string | null;
    secondary_mobile: string | null;
    company_type: string | null;
    vendor_code: string | null;
    field1: string | null;
    field2: string | null;
    field3: string | null;
    field4: string | null;
    field5: string | null;
};

type OrganizationForm = Record<(typeof ORGANIZATION_FIELDS)[number], string>;

function toFormData(organization: OrganizationSettings): OrganizationForm {
    return {
        company_name: organization.company_name ?? '',
        gst: organization.gst ?? '',
        pan: organization.pan ?? '',
        address: organization.address ?? '',
        email: organization.email ?? '',
        website: organization.website ?? '',
        mobile: organization.mobile ?? '',
        secondary_mobile: organization.secondary_mobile ?? '',
        company_type: organization.company_type ?? '',
        vendor_code: organization.vendor_code ?? '',
        field1: organization.field1 ?? '',
        field2: organization.field2 ?? '',
        field3: organization.field3 ?? '',
        field4: organization.field4 ?? '',
        field5: organization.field5 ?? '',
    };
}

function isSavableUrl(value: string): boolean {
    try {
        const url = new URL(value);

        return (
            (url.protocol === 'http:' || url.protocol === 'https:') &&
            url.hostname !== ''
        );
    } catch {
        return false;
    }
}

function isFieldReady(field: keyof OrganizationForm, value: string): boolean {
    switch (field) {
        case 'company_name':
        case 'address':
        case 'vendor_code':
            return value.trim() !== '';
        case 'gst':
            return value.length === 15;
        case 'pan':
            return value.length === 10;
        case 'email':
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        case 'mobile':
            return /^\d{10}$/.test(value);
        case 'secondary_mobile':
            return value === '' || /^\d{10}$/.test(value);
        case 'website':
            return value === '' || isSavableUrl(value);
        default:
            return true;
    }
}

function shouldSaveImmediately(
    field: keyof OrganizationForm,
    value: string,
): boolean {
    switch (field) {
        case 'gst':
        case 'pan':
        case 'mobile':
        case 'secondary_mobile':
            return isFieldReady(field, value);
        default:
            return false;
    }
}

function changedReadyFields(
    data: OrganizationForm,
    saved: OrganizationForm,
): Partial<OrganizationForm> {
    const payload: Partial<OrganizationForm> = {};

    for (const field of ORGANIZATION_FIELDS) {
        if (data[field] === saved[field] || !isFieldReady(field, data[field])) {
            continue;
        }

        payload[field] = data[field];
    }

    return payload;
}

function Field({
    id,
    label,
    error,
    optional = false,
    className,
    children,
}: {
    id: string;
    label: string;
    error?: string;
    optional?: boolean;
    className?: string;
    children: ReactNode;
}) {
    return (
        <div className={className ?? 'grid gap-2'}>
            <Label htmlFor={id}>
                {label}
                {optional && (
                    <span className="font-normal text-muted-foreground">
                        {' '}
                        (optional)
                    </span>
                )}
            </Label>
            {children}
            <InputError message={error} />
        </div>
    );
}

function SaveStatus({
    processing,
    recentlySuccessful,
}: {
    processing: boolean;
    recentlySuccessful: boolean;
}) {
    if (processing) {
        return (
            <p
                className="flex items-center gap-1.5 text-xs text-muted-foreground"
                aria-live="polite"
                data-test="organization-save-status"
            >
                <Spinner className="size-3" />
                Saving
            </p>
        );
    }

    if (recentlySuccessful) {
        return (
            <p
                className="text-xs text-muted-foreground"
                aria-live="polite"
                data-test="organization-save-status"
            >
                Saved
            </p>
        );
    }

    return (
        <span className="sr-only" aria-live="polite">
            Changes save automatically
        </span>
    );
}

export default function Organization({
    organization,
}: {
    organization: OrganizationSettings;
}) {
    const initialData = toFormData(organization);
    const {
        data,
        setData,
        patch,
        processing,
        errors,
        recentlySuccessful,
        setDefaults,
        transform,
        clearErrors,
    } = useForm(initialData);
    const dataRef = useRef(data);
    const savedRef = useRef(initialData);
    const timeoutRef = useRef<number>(0);
    const processingRef = useRef(false);
    const pendingRef = useRef(false);
    const saveNowRef = useRef<() => void>(() => {});

    const saveNow = (): void => {
        const payload = changedReadyFields(dataRef.current, savedRef.current);

        if (Object.keys(payload).length === 0) {
            return;
        }

        if (processingRef.current) {
            pendingRef.current = true;

            return;
        }

        processingRef.current = true;
        transform(() => payload);

        patch(update.url(), {
            preserveScroll: true,
            preserveState: true,
            showProgress: false,
            onSuccess: () => {
                savedRef.current = { ...savedRef.current, ...payload };
                setDefaults(payload);
            },
            onFinish: () => {
                processingRef.current = false;

                if (pendingRef.current) {
                    pendingRef.current = false;
                    saveNowRef.current();
                }
            },
        });
    };

    useEffect(() => {
        saveNowRef.current = saveNow;
    });

    const scheduleSave = (
        field: keyof OrganizationForm,
        value: string,
    ): void => {
        window.clearTimeout(timeoutRef.current);

        if (shouldSaveImmediately(field, value)) {
            saveNow();

            return;
        }

        timeoutRef.current = window.setTimeout(() => {
            saveNowRef.current();
        }, SAVE_DEBOUNCE_MS);
    };

    const updateField = (
        field: keyof OrganizationForm,
        value: string,
    ): void => {
        dataRef.current = { ...dataRef.current, [field]: value };
        setData(field, value);

        if (errors[field]) {
            clearErrors(field);
        }

        scheduleSave(field, value);
    };

    useEffect(() => {
        return () => {
            window.clearTimeout(timeoutRef.current);
            saveNowRef.current();
        };
    }, []);

    return (
        <>
            <Head title="Organization settings" />

            <h1 className="sr-only">Organization settings</h1>

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title="Organization"
                    description="Company identity used on invoices, POs and correspondence. Changes save automatically."
                />

                <form
                    className="space-y-6"
                    onSubmit={(event) => {
                        event.preventDefault();
                        window.clearTimeout(timeoutRef.current);
                        saveNow();
                    }}
                >
                    <Card>
                        <CardHeader>
                            <div className="flex items-start justify-between gap-4">
                                <div className="grid gap-1">
                                    <CardTitle>Organization</CardTitle>
                                    <CardDescription>
                                        GST, PAN and vendor details for this
                                        company.
                                    </CardDescription>
                                </div>
                                <SaveStatus
                                    processing={processing}
                                    recentlySuccessful={recentlySuccessful}
                                />
                            </div>
                        </CardHeader>
                        <CardContent className="grid gap-4 sm:grid-cols-2">
                            <Field
                                id="company_name"
                                label="Company name"
                                error={errors.company_name}
                            >
                                <Input
                                    id="company_name"
                                    name="company_name"
                                    value={data.company_name}
                                    onChange={(event) =>
                                        updateField(
                                            'company_name',
                                            event.target.value,
                                        )
                                    }
                                    onBlur={() => saveNow()}
                                    autoComplete="organization"
                                    placeholder="Company name"
                                />
                            </Field>

                            <Field
                                id="vendor_code"
                                label="Vendor code"
                                error={errors.vendor_code}
                            >
                                <Input
                                    id="vendor_code"
                                    name="vendor_code"
                                    value={data.vendor_code}
                                    onChange={(event) =>
                                        updateField(
                                            'vendor_code',
                                            event.target.value,
                                        )
                                    }
                                    onBlur={() => saveNow()}
                                    placeholder="Vendor code"
                                />
                            </Field>

                            <Field
                                id="gst"
                                label="GST"
                                error={errors.gst}
                                className="grid gap-2 sm:col-span-2"
                            >
                                <TaxCodeInput
                                    id="gst"
                                    name="gst"
                                    kind="gst"
                                    value={data.gst}
                                    onChange={(value) =>
                                        updateField('gst', value)
                                    }
                                    onBlur={() => saveNow()}
                                    invalid={Boolean(errors.gst)}
                                />
                            </Field>

                            <Field
                                id="pan"
                                label="PAN"
                                error={errors.pan}
                                className="grid gap-2 sm:col-span-2"
                            >
                                <TaxCodeInput
                                    id="pan"
                                    name="pan"
                                    kind="pan"
                                    value={data.pan}
                                    onChange={(value) =>
                                        updateField('pan', value)
                                    }
                                    onBlur={() => saveNow()}
                                    invalid={Boolean(errors.pan)}
                                />
                            </Field>

                            <Field
                                id="address"
                                label="Address"
                                error={errors.address}
                                className="grid gap-2 sm:col-span-2"
                            >
                                <Textarea
                                    id="address"
                                    name="address"
                                    value={data.address}
                                    onChange={(event) =>
                                        updateField(
                                            'address',
                                            event.target.value,
                                        )
                                    }
                                    onBlur={() => saveNow()}
                                    autoComplete="street-address"
                                    placeholder="Registered address"
                                />
                            </Field>

                            <Field
                                id="email"
                                label="Email"
                                error={errors.email}
                            >
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    onChange={(event) =>
                                        updateField('email', event.target.value)
                                    }
                                    onBlur={() => saveNow()}
                                    autoComplete="email"
                                    placeholder="accounts@company.com"
                                />
                            </Field>

                            <Field
                                id="mobile"
                                label="Mobile"
                                error={errors.mobile}
                            >
                                <Input
                                    id="mobile"
                                    type="tel"
                                    name="mobile"
                                    value={data.mobile}
                                    onChange={(event) =>
                                        updateField(
                                            'mobile',
                                            event.target.value,
                                        )
                                    }
                                    onBlur={() => saveNow()}
                                    inputMode="numeric"
                                    maxLength={10}
                                    autoComplete="tel"
                                    placeholder="10-digit mobile"
                                />
                            </Field>

                            <Field
                                id="secondary_mobile"
                                label="Secondary mobile"
                                error={errors.secondary_mobile}
                                optional
                            >
                                <Input
                                    id="secondary_mobile"
                                    type="tel"
                                    name="secondary_mobile"
                                    value={data.secondary_mobile}
                                    onChange={(event) =>
                                        updateField(
                                            'secondary_mobile',
                                            event.target.value,
                                        )
                                    }
                                    onBlur={() => saveNow()}
                                    inputMode="numeric"
                                    maxLength={10}
                                    autoComplete="tel"
                                    placeholder="10-digit mobile"
                                />
                            </Field>

                            <Field
                                id="website"
                                label="Website"
                                error={errors.website}
                                optional
                            >
                                <Input
                                    id="website"
                                    type="url"
                                    name="website"
                                    value={data.website}
                                    onChange={(event) =>
                                        updateField(
                                            'website',
                                            event.target.value,
                                        )
                                    }
                                    onBlur={() => saveNow()}
                                    autoComplete="url"
                                    placeholder="https://"
                                />
                            </Field>

                            <Field
                                id="company_type"
                                label="Company type"
                                error={errors.company_type}
                                optional
                            >
                                <Input
                                    id="company_type"
                                    name="company_type"
                                    value={data.company_type}
                                    onChange={(event) =>
                                        updateField(
                                            'company_type',
                                            event.target.value,
                                        )
                                    }
                                    onBlur={() => saveNow()}
                                    placeholder="Private Limited, LLP, …"
                                />
                            </Field>

                            <Field
                                id="field1"
                                label="Field 1"
                                error={errors.field1}
                                optional
                            >
                                <Input
                                    id="field1"
                                    name="field1"
                                    value={data.field1}
                                    onChange={(event) =>
                                        updateField(
                                            'field1',
                                            event.target.value,
                                        )
                                    }
                                    onBlur={() => saveNow()}
                                />
                            </Field>

                            <Field
                                id="field2"
                                label="Field 2"
                                error={errors.field2}
                                optional
                            >
                                <Input
                                    id="field2"
                                    name="field2"
                                    value={data.field2}
                                    onChange={(event) =>
                                        updateField(
                                            'field2',
                                            event.target.value,
                                        )
                                    }
                                    onBlur={() => saveNow()}
                                />
                            </Field>

                            <Field
                                id="field3"
                                label="Field 3"
                                error={errors.field3}
                                optional
                            >
                                <Input
                                    id="field3"
                                    name="field3"
                                    value={data.field3}
                                    onChange={(event) =>
                                        updateField(
                                            'field3',
                                            event.target.value,
                                        )
                                    }
                                    onBlur={() => saveNow()}
                                />
                            </Field>

                            <Field
                                id="field4"
                                label="Field 4"
                                error={errors.field4}
                                optional
                            >
                                <Input
                                    id="field4"
                                    name="field4"
                                    value={data.field4}
                                    onChange={(event) =>
                                        updateField(
                                            'field4',
                                            event.target.value,
                                        )
                                    }
                                    onBlur={() => saveNow()}
                                />
                            </Field>

                            <Field
                                id="field5"
                                label="Field 5"
                                error={errors.field5}
                                optional
                                className="grid gap-2 sm:col-span-2"
                            >
                                <Input
                                    id="field5"
                                    name="field5"
                                    value={data.field5}
                                    onChange={(event) =>
                                        updateField(
                                            'field5',
                                            event.target.value,
                                        )
                                    }
                                    onBlur={() => saveNow()}
                                />
                            </Field>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </>
    );
}

Organization.layout = {
    breadcrumbs: [
        {
            title: 'Organization settings',
            href: edit(),
        },
    ],
};
