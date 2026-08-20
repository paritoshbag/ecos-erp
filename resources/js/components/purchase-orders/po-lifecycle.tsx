import { Check } from 'lucide-react';
import { formatDate } from '@/components/purchase-orders/format';
import { toneSolid, toneSurface } from '@/components/purchase-orders/tone';
import type { PoTone } from '@/components/purchase-orders/tone';
import { cn } from '@/lib/utils';
import type { PurchaseOrderProfile } from '@/types/purchase-order';

type Milestone = {
    label: string;
    date: string | null;
    done: boolean;
    tone: PoTone;
};

function milestones(order: PurchaseOrderProfile): Milestone[] {
    return [
        {
            label: 'Ordered',
            date: order.po_date,
            done: true,
            tone: 'primary',
        },
        {
            label: 'Executed',
            date: order.completed_on ?? order.measured_on,
            done: order.completed_on !== null || order.measured_on !== null,
            tone: 'warning',
        },
        {
            label: 'Billed',
            date: order.invoice_date ?? order.bill_receive_date,
            done: order.invoice_no !== null,
            tone: 'info',
        },
        {
            label: 'Paid',
            date: order.payment_date,
            done: order.payment_date !== null,
            tone: 'success',
        },
    ];
}

/*
 * Four-stop lifecycle rail: ordered → executed → billed → paid. Reached stops
 * take their stage colour and show the date that closed them; stops still
 * ahead stay dashed and grey, which is what tells a reviewer where the PO is
 * stuck without opening a single tab.
 */
export function PoLifecycle({ order }: { order: PurchaseOrderProfile }) {
    const steps = milestones(order);

    return (
        <ol className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
            {steps.map((step, index) => (
                <li
                    key={step.label}
                    className={cn(
                        'flex min-w-0 items-center gap-2 rounded-sm border px-2 py-1.5',
                        step.done
                            ? toneSurface[step.tone]
                            : 'border-dashed border-border bg-transparent',
                    )}
                >
                    <span
                        className={cn(
                            'flex size-4 shrink-0 items-center justify-center rounded-full text-2xs font-semibold',
                            step.done
                                ? toneSolid[step.tone]
                                : 'bg-muted text-muted-foreground',
                        )}
                        aria-hidden="true"
                    >
                        {step.done ? (
                            <Check className="size-2.5" strokeWidth={3} />
                        ) : (
                            index + 1
                        )}
                    </span>
                    <div className="min-w-0">
                        <p className="truncate text-2xs font-medium">
                            {step.label}
                        </p>
                        <p className="truncate text-2xs text-muted-foreground tabular-nums">
                            {step.done ? formatDate(step.date) : 'Pending'}
                        </p>
                    </div>
                </li>
            ))}
        </ol>
    );
}
