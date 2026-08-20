import { usePage } from '@inertiajs/react';
import { appConfig } from '@/lib/app-config';
import { cn } from '@/lib/utils';

/*
 * Application footer.
 *
 * Version on one side, developer credit on the other — the two things a
 * support call always starts with. The version comes from the server
 * (`config('app.version')`, shared on every Inertia response) so it identifies
 * the deployed build rather than a constant someone forgot to bump; the
 * bundled constant is only a fallback for pages rendered without shared props.
 */
export function AppFooter({ className }: { className?: string }) {
    const shared = usePage().props as {
        app?: { version?: string; environment?: string };
    };

    const version = shared.app?.version ?? appConfig.version;
    const environment = shared.app?.environment;
    const year = new Date().getFullYear();

    return (
        <footer
            className={cn(
                'flex shrink-0 flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t bg-background/60 px-4 py-2 text-2xs text-muted-foreground',
                className,
            )}
        >
            <p className="flex items-center gap-1.5">
                <span className="font-semibold text-foreground">
                    {appConfig.name}
                </span>
                <span className="text-muted-foreground/70">·</span>
                <span className="font-mono tabular-nums">v{version}</span>
                {environment && environment !== 'production' && (
                    <span className="rounded bg-warning/15 px-1 py-px font-medium text-warning uppercase">
                        {environment}
                    </span>
                )}
            </p>

            <p>
                © {year} · Crafted by{' '}
                <a
                    href={appConfig.developer.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="font-medium text-foreground underline-offset-2 hover:text-primary hover:underline"
                >
                    {appConfig.developer.name}
                </a>
            </p>
        </footer>
    );
}
