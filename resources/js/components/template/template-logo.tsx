import { appConfig } from '@/lib/app-config';
import { cn } from '@/lib/utils';

type Props = {
    className?: string;
    withWordmark?: boolean;
    /* `chrome` inherits sidebar/topbar skin colors instead of page surface. */
    tone?: 'default' | 'sidebar' | 'topbar';
};

/*
 * The mark is a bolt crossing a busbar: the trade in two strokes, legible at
 * 16px in a collapsed rail. No text inside the glyph, so it survives being
 * scaled down to a favicon.
 */
export function TemplateLogoMark({ className }: { className?: string }) {
    return (
        <span
            className={cn(
                'flex aspect-square size-7 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm',
                className,
            )}
        >
            <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="size-4"
                aria-hidden="true"
            >
                <path
                    d="M13.2 2.5 5.8 13.1a.7.7 0 0 0 .58 1.1h4.03l-1.6 7.3 7.4-10.6a.7.7 0 0 0-.58-1.1h-4.03l1.6-7.3Z"
                    fill="currentColor"
                />
            </svg>
        </span>
    );
}

export function TemplateLogo({
    className,
    withWordmark = true,
    tone = 'default',
}: Props) {
    const wordmarkTone =
        tone === 'sidebar'
            ? 'text-sidebar-foreground'
            : tone === 'topbar'
              ? 'text-topbar-foreground'
              : 'text-foreground';

    const taglineTone =
        tone === 'sidebar'
            ? 'text-sidebar-muted-foreground'
            : tone === 'topbar'
              ? 'text-topbar-muted-foreground'
              : 'text-muted-foreground';

    return (
        <div className={cn('flex items-center gap-2', className)}>
            <TemplateLogoMark />
            {withWordmark && (
                <div className="grid min-w-0 flex-1 text-left leading-none">
                    <span
                        className={cn(
                            'truncate font-display text-[0.9375rem] font-bold tracking-tight',
                            wordmarkTone,
                        )}
                    >
                        {appConfig.name}
                    </span>
                    <span
                        className={cn(
                            'mt-0.5 truncate text-2xs font-medium',
                            taglineTone,
                        )}
                    >
                        {appConfig.tagline}
                    </span>
                </div>
            )}
        </div>
    );
}
