import { TrendingDown, TrendingUp } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type Props = {
    label: string;
    value: string;
    delta?: number;
    deltaLabel?: string;
    positiveIsGood?: boolean;
    icon?: LucideIcon;
    chart?: ReactNode;
    className?: string;
};

/*
 * KPI tile: label, hero figure, delta vs previous period, optional icon and
 * sparkline. `positiveIsGood={false}` flips the delta colors for metrics
 * where growth is bad (expenses, churn, overdue).
 */
export function StatCard({
    label,
    value,
    delta,
    deltaLabel = 'vs last month',
    positiveIsGood = true,
    icon: Icon,
    chart,
    className,
}: Props) {
    const isPositive = (delta ?? 0) >= 0;
    const isGood = positiveIsGood ? isPositive : !isPositive;

    return (
        <Card className={cn('py-5', className)}>
            <CardContent className="flex items-start gap-4 px-5">
                <div className="min-w-0 flex-1 space-y-1">
                    <p className="truncate text-sm text-muted-foreground">
                        {label}
                    </p>
                    <p className="font-display text-2xl font-semibold tracking-tight tabular-nums">
                        {value}
                    </p>
                    {delta !== undefined && (
                        <p className="flex flex-wrap items-center gap-1.5 text-xs">
                            <span
                                className={cn(
                                    'inline-flex items-center gap-1 font-medium',
                                    isGood
                                        ? 'text-success'
                                        : 'text-destructive',
                                )}
                            >
                                {isPositive ? (
                                    <TrendingUp className="size-3.5" />
                                ) : (
                                    <TrendingDown className="size-3.5" />
                                )}
                                {isPositive ? '+' : ''}
                                {delta.toFixed(1)}%
                            </span>
                            <span className="text-muted-foreground">
                                {deltaLabel}
                            </span>
                        </p>
                    )}
                </div>
                {chart ? (
                    <div className="mt-1 shrink-0">{chart}</div>
                ) : Icon ? (
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                        <Icon className="size-5" />
                    </div>
                ) : null}
            </CardContent>
        </Card>
    );
}
