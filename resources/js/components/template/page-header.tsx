import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Props = {
    title: string;
    description?: string;
    actions?: ReactNode;
    className?: string;
};

export function PageHeader({ title, description, actions, className }: Props) {
    return (
        <div
            className={cn(
                'flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between',
                className,
            )}
        >
            <div className="space-y-0.5">
                <h1 className="text-lg font-semibold md:text-xl">{title}</h1>
                {description && (
                    <p className="max-w-2xl text-xs text-muted-foreground">
                        {description}
                    </p>
                )}
            </div>
            {actions && (
                <div className="flex shrink-0 flex-wrap items-center gap-1.5">
                    {actions}
                </div>
            )}
        </div>
    );
}
