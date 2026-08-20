import { formatMoney } from '@/components/purchase-orders/format';
import { cn } from '@/lib/utils';

export type PoLedgerRow = {
    label: string;
    value: string | number | null;
    kind?: 'line' | 'addition' | 'deduction' | 'subtotal' | 'total';
};

const rowClasses: Record<NonNullable<PoLedgerRow['kind']>, string> = {
    line: '',
    addition: '',
    deduction: '',
    subtotal: 'border-t border-border font-semibold',
    total: 'border-t-2 border-border font-semibold',
};

const valueClasses: Record<NonNullable<PoLedgerRow['kind']>, string> = {
    line: '',
    addition: 'text-info',
    deduction: 'text-destructive',
    subtotal: '',
    total: 'text-success',
};

/*
 * Running money statement: additions, recoveries and the net payable in the
 * order a finance reviewer walks them. Deductions carry an explicit minus so
 * the column arithmetic reads correctly without relying on the red alone.
 */
export function PoAmountLedger({ rows }: { rows: PoLedgerRow[] }) {
    return (
        <dl className="text-xs">
            {rows.map((row) => {
                const kind = row.kind ?? 'line';
                const empty = row.value === null || row.value === '';
                const amount = formatMoney(row.value);

                return (
                    <div
                        key={row.label}
                        className={cn(
                            'flex items-baseline justify-between gap-4 py-1.5',
                            kind === 'line' && 'border-b border-border/50',
                            kind === 'addition' && 'border-b border-border/50',
                            kind === 'deduction' && 'border-b border-border/50',
                            rowClasses[kind],
                        )}
                    >
                        <dt
                            className={cn(
                                'min-w-0 truncate',
                                kind === 'subtotal' || kind === 'total'
                                    ? 'text-foreground'
                                    : 'text-muted-foreground',
                            )}
                        >
                            {row.label}
                        </dt>
                        <dd
                            className={cn(
                                'shrink-0 font-medium tabular-nums',
                                valueClasses[kind],
                                kind === 'total' && 'text-sm',
                                empty && 'font-normal text-muted-foreground/50',
                            )}
                        >
                            {!empty && kind === 'deduction' ? '−' : ''}
                            {amount}
                        </dd>
                    </div>
                );
            })}
        </dl>
    );
}
