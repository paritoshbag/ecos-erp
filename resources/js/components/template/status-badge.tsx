import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type StatusVariant =
    'success' | 'warning' | 'info' | 'destructive' | 'neutral';

const variantClasses: Record<StatusVariant, string> = {
    success: 'border-success/25 bg-success/10 text-success',
    warning: 'border-warning/40 bg-warning text-warning-foreground',
    info: 'border-info/25 bg-info/10 text-info',
    destructive: 'border-destructive/25 bg-destructive/10 text-destructive',
    neutral: 'border-border bg-muted text-muted-foreground',
};

type Props = {
    variant?: StatusVariant;
    withDot?: boolean;
    className?: string;
    children: ReactNode;
};

/*
 * Pill for record states across the ERP (invoices, tasks, approvals, jobs…).
 * Always pairs color with a text label; the dot is reinforcement, never the
 * only signal.
 */
export function StatusBadge({
    variant = 'neutral',
    withDot = true,
    className,
    children,
}: Props) {
    return (
        <span
            className={cn(
                'inline-flex w-fit items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap',
                variantClasses[variant],
                className,
            )}
        >
            {withDot && (
                <span
                    aria-hidden="true"
                    className="size-1.5 shrink-0 rounded-full bg-current"
                />
            )}
            {children}
        </span>
    );
}
