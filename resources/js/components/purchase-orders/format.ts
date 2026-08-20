import type { PoTone } from '@/components/purchase-orders/tone';
import type { StatusVariant } from '@/components/template/status-badge';
import type {
    PurchaseOrderProfile,
    PurchaseOrderSource,
    PurchaseOrderStatus,
} from '@/types/purchase-order';

export const statusLabels: Record<PurchaseOrderStatus, string> = {
    open: 'Open',
    invoiced: 'Invoiced',
    paid: 'Paid',
};

export const statusVariants: Record<PurchaseOrderStatus, StatusVariant> = {
    open: 'warning',
    invoiced: 'info',
    paid: 'success',
};

export const statusTones: Record<PurchaseOrderStatus, PoTone> = {
    open: 'warning',
    invoiced: 'info',
    paid: 'success',
};

export const rupee = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
});

/* Hero figures drop the paise: at a glance, rupees are the story. */
export const rupeeWhole = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
});

const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
];

export function formatMoney(value: string | number | null): string {
    if (value === null || value === '') {
        return '—';
    }

    return rupee.format(Number(value));
}

export function formatMoneyWhole(value: string | number | null): string {
    if (value === null || value === '') {
        return '—';
    }

    return rupeeWhole.format(Number(value));
}

/**
 * ISO date string to `14 Mar 2025`. Parsed by hand rather than through Date so
 * a browser in a negative UTC offset cannot roll the day backwards.
 */
export function formatDate(value: string | null): string {
    if (value === null || value === '') {
        return '—';
    }

    const parts = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);

    if (parts === null) {
        return value;
    }

    const [, year, month, day] = parts;

    return `${day} ${monthNames[Number(month) - 1]} ${year}`;
}

export function formatSource(source: PurchaseOrderSource): string {
    return source === 'import' ? 'Import' : 'Manual';
}

export function toAmount(value: string | number | null): number {
    if (value === null || value === '') {
        return 0;
    }

    const amount = Number(value);

    return Number.isFinite(amount) ? amount : 0;
}

/** First non-empty of the given amounts, or null when the PO carries none. */
function firstAmount(
    ...values: (string | number | null)[]
): string | number | null {
    return values.find((value) => value !== null && value !== '') ?? null;
}

export type PoTotals = {
    ordered: number;
    billed: number | null;
    deductions: number;
    deductionHeads: number;
    net: number | null;
    /** Pre-tax billed value as a percentage of the ordered value. Uncapped. */
    billedShare: number;
};

/**
 * Money roll-up for the hero strip. Deductions are summed from the seven
 * recovery heads the register tracks so the strip reconciles with the ledger
 * on the billing tab.
 */
export function purchaseOrderTotals(order: PurchaseOrderProfile): PoTotals {
    const deductionValues = [
        order.security_deposit,
        order.income_tax,
        order.cess,
        order.wct,
        order.material_deduction,
        order.penalty,
        order.tax_deduction,
    ];

    const ordered = toAmount(order.po_amount);
    const billedValue = firstAmount(
        order.total_gross_amount,
        order.gross_bill_amount,
    );
    /*
     * The share is measured on the pre-tax bill: po_amount is an ex-GST order
     * value, so dividing the GST-inclusive total by it would report ~118% on
     * a PO that was billed exactly to order.
     */
    const preTaxValue = firstAmount(
        order.gross_bill_amount,
        order.total_gross_amount,
    );
    const netValue = firstAmount(order.net_amount, order.net_amount_gst);
    const billed = billedValue === null ? null : toAmount(billedValue);
    const preTax = preTaxValue === null ? null : toAmount(preTaxValue);

    return {
        ordered,
        billed,
        deductions: deductionValues.reduce(
            (total, value) => total + toAmount(value),
            0,
        ),
        deductionHeads: deductionValues.filter((value) => toAmount(value) > 0)
            .length,
        net: netValue === null ? null : toAmount(netValue),
        billedShare:
            preTax === null || ordered <= 0 ? 0 : (preTax / ordered) * 100,
    };
}
