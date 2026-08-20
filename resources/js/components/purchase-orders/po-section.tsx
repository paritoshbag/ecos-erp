import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { toneHeader } from '@/components/purchase-orders/tone';
import type { PoTone } from '@/components/purchase-orders/tone';
import { cn } from '@/lib/utils';

type Props = {
    title: string;
    icon: LucideIcon;
    tone?: PoTone;
    /** Right-aligned counter, e.g. "6 / 13 filled". */
    meta?: ReactNode;
    className?: string;
    children: ReactNode;
};

/*
 * Titled panel inside a profile tab. The heading strip carries the section's
 * tone so scanning down the page reads as distinct blocks rather than one
 * undifferentiated wall of fields.
 */
export function PoSection({
    title,
    icon: Icon,
    tone = 'neutral',
    meta,
    className,
    children,
}: Props) {
    return (
        <section
            className={cn(
                'overflow-hidden rounded-md border bg-card',
                className,
            )}
        >
            <header
                className={cn(
                    'flex items-center gap-2 border-b px-3 py-1.5',
                    toneHeader[tone],
                )}
            >
                <Icon className="size-3.5 shrink-0" />
                <h3 className="truncate text-2xs font-semibold tracking-wider uppercase">
                    {title}
                </h3>
                {meta && (
                    <span className="ms-auto shrink-0 text-2xs tabular-nums opacity-70">
                        {meta}
                    </span>
                )}
            </header>
            <div className="px-3 py-2">{children}</div>
        </section>
    );
}
