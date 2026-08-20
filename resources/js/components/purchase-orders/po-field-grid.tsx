import { formatDate, formatMoney } from '@/components/purchase-orders/format';
import { cn } from '@/lib/utils';

export type PoField = {
    label: string;
    value: string | number | boolean | null;
    kind?: 'text' | 'money' | 'boolean' | 'date' | 'code';
    /** Long prose — takes the full row width and wraps instead of truncating. */
    wide?: boolean;
};

function displayValue(field: PoField): string {
    if (field.kind === 'boolean') {
        return field.value ? 'Yes' : 'No';
    }

    if (field.kind === 'money') {
        return formatMoney(
            typeof field.value === 'boolean' ? null : field.value,
        );
    }

    if (field.value === null || field.value === '') {
        return '—';
    }

    if (field.kind === 'date') {
        return formatDate(String(field.value));
    }

    return String(field.value);
}

export function isFilled(field: PoField): boolean {
    if (field.kind === 'boolean') {
        return field.value === true;
    }

    return field.value !== null && field.value !== '';
}

export function filledCount(fields: PoField[]): number {
    return fields.filter(isFilled).length;
}

/*
 * Dense label/value register in the shape enterprise consoles use: label on
 * the left in muted micro-type, value hard right on a hairline baseline, two
 * columns on anything wider than a phone. Blank values keep their row so the
 * eye can still count what a record is missing.
 */
export function PoFieldGrid({
    fields,
    className,
}: {
    fields: PoField[];
    className?: string;
}) {
    return (
        <dl className={cn('grid gap-x-8 sm:grid-cols-2', className)}>
            {fields.map((field) => {
                const filled = isFilled(field);
                const text = displayValue(field);

                return (
                    <div
                        key={field.label}
                        className={cn(
                            'flex min-w-0 items-baseline justify-between gap-4 border-b border-border/60 py-1.5',
                            field.wide &&
                                'sm:col-span-2 sm:flex-col sm:items-start sm:gap-0.5',
                        )}
                    >
                        <dt className="shrink-0 text-2xs text-muted-foreground">
                            {field.label}
                        </dt>
                        <dd
                            className={cn(
                                'min-w-0 text-right text-xs font-medium',
                                field.wide
                                    ? 'text-left break-words whitespace-pre-line'
                                    : 'truncate',
                                (field.kind === 'money' ||
                                    field.kind === 'date') &&
                                    'tabular-nums',
                                field.kind === 'code' && 'font-mono',
                                !filled &&
                                    'font-normal text-muted-foreground/50',
                            )}
                            title={field.wide ? undefined : text}
                        >
                            {text}
                        </dd>
                    </div>
                );
            })}
        </dl>
    );
}
