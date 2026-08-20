import { Link } from '@inertiajs/react';
import { ArrowLeft, BarChart3, ShieldCheck, Workflow } from 'lucide-react';
import type { ReactNode } from 'react';
import {
    TemplateLogo,
    TemplateLogoMark,
} from '@/components/template/template-logo';
import { appConfig } from '@/lib/app-config';

const highlights = [
    {
        icon: BarChart3,
        title: 'Job costing that keeps up',
        description: 'Labour, material and margin on every site, live.',
    },
    {
        icon: Workflow,
        title: 'Quote to certificate',
        description:
            'Estimates, works orders, test reports and invoices in one flow.',
    },
    {
        icon: ShieldCheck,
        title: 'Compliance built in',
        description:
            'Licence tracking, role-based access and full audit trails.',
    },
];

type Props = {
    title: string;
    description: string;
    children: ReactNode;
    footer?: ReactNode;
    backHref?: string;
    backLabel?: string;
    preview?: boolean;
};

/*
 * Split-screen shell for auth: brand panel on desktop, form-first single
 * column on mobile. The /template previews pass a back-link and the preview
 * copyright; the real login omits both.
 */
export function AuthSplit({
    title,
    description,
    children,
    footer,
    backHref,
    backLabel = 'Back',
    preview = false,
}: Props) {
    return (
        <div className="grid min-h-svh lg:grid-cols-2">
            <div className="relative hidden overflow-hidden bg-primary p-10 text-primary-foreground lg:flex lg:flex-col">
                <div className="pointer-events-none absolute -top-24 -left-24 size-96 rounded-full bg-white/10 blur-3xl" />
                <div className="pointer-events-none absolute -right-32 -bottom-32 size-96 rounded-full bg-black/15 blur-3xl" />
                <div className="relative flex items-center gap-2.5">
                    <TemplateLogoMark className="bg-white/15 text-white" />
                    <span className="grid leading-tight">
                        <span className="font-display text-lg font-bold tracking-tight">
                            {appConfig.name}
                        </span>
                        <span className="text-xs text-primary-foreground/70">
                            {appConfig.tagline}
                        </span>
                    </span>
                </div>
                <div className="relative my-auto max-w-md space-y-8">
                    <h2 className="font-display text-3xl font-semibold tracking-tight">
                        Run the whole contracting business from one workspace.
                    </h2>
                    <div className="space-y-5">
                        {highlights.map((highlight) => (
                            <div
                                key={highlight.title}
                                className="flex items-start gap-3"
                            >
                                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/15">
                                    <highlight.icon className="size-4.5" />
                                </div>
                                <div>
                                    <p className="font-medium">
                                        {highlight.title}
                                    </p>
                                    <p className="text-sm text-primary-foreground/75">
                                        {highlight.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <p className="relative text-xs text-primary-foreground/60">
                    © {new Date().getFullYear()} {appConfig.name}
                    {preview ? ' — design preview' : ''}
                </p>
            </div>

            <div className="flex flex-col p-6 md:p-10">
                <div className="flex items-center justify-between">
                    <TemplateLogo className="lg:hidden" withWordmark={false} />
                    {backHref && (
                        <Link
                            href={backHref}
                            className="ml-auto inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                            <ArrowLeft className="size-4" />
                            {backLabel}
                        </Link>
                    )}
                </div>
                <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 py-10">
                    <div className="space-y-1.5">
                        <h1 className="text-2xl font-semibold">{title}</h1>
                        <p className="text-sm text-muted-foreground">
                            {description}
                        </p>
                    </div>
                    {children}
                </div>
                {footer && (
                    <div className="mx-auto w-full max-w-sm text-center text-sm text-muted-foreground">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}
