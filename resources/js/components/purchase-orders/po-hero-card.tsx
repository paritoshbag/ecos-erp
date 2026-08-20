import { Download, ExternalLink } from 'lucide-react';
import type { ReactNode } from 'react';
import {
    downloadPdf,
    previewPdf,
} from '@/actions/App/Http/Controllers/PurchaseOrderController';
import {
    formatDate,
    formatMoneyWhole,
    formatSource,
    purchaseOrderTotals,
    statusLabels,
    statusTones,
    statusVariants,
} from '@/components/purchase-orders/format';
import { NoMaterialChip } from '@/components/purchase-orders/no-material-chip';
import { PoLifecycle } from '@/components/purchase-orders/po-lifecycle';
import {
    toneBand,
    toneFill,
    toneText,
} from '@/components/purchase-orders/tone';
import type { PoTone } from '@/components/purchase-orders/tone';
import { StatusBadge } from '@/components/template/status-badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { PurchaseOrderProfile } from '@/types/purchase-order';

type Metric = {
    label: string;
    value: string;
    hint: string;
    tone: PoTone;
    muted?: boolean;
};

function MetricCell({ metric }: { metric: Metric }) {
    return (
        <div className="min-w-0 px-3 py-2">
            <p className="truncate text-2xs tracking-wide text-muted-foreground uppercase">
                {metric.label}
            </p>
            <p
                className={cn(
                    'truncate text-base font-semibold tabular-nums',
                    metric.muted
                        ? 'font-normal text-muted-foreground/50'
                        : toneText[metric.tone],
                )}
                title={metric.value}
            >
                {metric.value}
            </p>
            <p className="truncate text-2xs text-muted-foreground">
                {metric.hint}
            </p>
        </div>
    );
}

function MetaItem({ label, value }: { label: string; value: ReactNode }) {
    return (
        <div className="flex min-w-0 items-baseline gap-1.5">
            <span className="shrink-0 text-2xs text-muted-foreground">
                {label}
            </span>
            <span className="min-w-0 truncate text-2xs font-medium tabular-nums">
                {value}
            </span>
        </div>
    );
}

/*
 * Object header for a purchase order, in the shape enterprise consoles use:
 * identity and state on a tinted band, the money roll-up as a divided metric
 * strip, and the lifecycle rail underneath. Everything a reviewer needs to
 * decide whether to open a tab lives above the tab bar.
 */
export function PoHeroCard({ order }: { order: PurchaseOrderProfile }) {
    const tone = statusTones[order.status];
    const totals = purchaseOrderTotals(order);
    const deductionHeads = totals.deductionHeads === 1 ? 'head' : 'heads';

    const metrics: Metric[] = [
        {
            label: 'PO value',
            value: formatMoneyWhole(order.po_amount),
            hint: `Ordered ${formatDate(order.po_date)}`,
            tone: 'primary',
        },
        {
            label: 'Gross billed',
            value:
                totals.billed === null ? '—' : formatMoneyWhole(totals.billed),
            hint:
                totals.billed === null
                    ? 'Not billed yet'
                    : `${totals.billedShare.toFixed(0)}% of PO value`,
            tone: 'info',
            muted: totals.billed === null,
        },
        {
            label: 'Deductions',
            value:
                totals.deductions > 0
                    ? formatMoneyWhole(totals.deductions)
                    : '—',
            hint:
                totals.deductions > 0
                    ? `${totals.deductionHeads} recovery ${deductionHeads}`
                    : 'None recorded',
            tone: 'destructive',
            muted: totals.deductions === 0,
        },
        {
            label: 'Net payable',
            value: totals.net === null ? '—' : formatMoneyWhole(totals.net),
            hint:
                order.payment_date !== null
                    ? `Paid ${formatDate(order.payment_date)}`
                    : 'Payment pending',
            tone: 'success',
            muted: totals.net === null,
        },
    ];

    return (
        <Card className="gap-0 overflow-hidden py-0">
            {/* Identity band */}
            <div
                className={cn(
                    'relative border-b px-3 py-3 sm:px-4',
                    toneBand[tone],
                )}
            >
                <span
                    aria-hidden="true"
                    className={cn(
                        'absolute inset-y-0 start-0 w-1',
                        toneFill[tone],
                    )}
                />
                <div className="flex flex-wrap items-start justify-between gap-3 ps-2">
                    <div className="min-w-0 space-y-1.5">
                        <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-2xs tracking-widest text-muted-foreground uppercase">
                                Purchase order
                            </span>
                            <StatusBadge variant={statusVariants[order.status]}>
                                {statusLabels[order.status]}
                            </StatusBadge>
                            <StatusBadge
                                variant={
                                    order.source === 'import'
                                        ? 'info'
                                        : 'neutral'
                                }
                                withDot={false}
                            >
                                {formatSource(order.source)}
                            </StatusBadge>
                            {!order.has_materials && <NoMaterialChip />}
                        </div>
                        <div className="flex flex-wrap items-baseline gap-2">
                            <h2 className="font-mono text-xl font-semibold tracking-tight sm:text-2xl">
                                {order.po_number}
                            </h2>
                            <span className="text-2xs text-muted-foreground">
                                {order.ccc} · Type {order.order_type}
                            </span>
                        </div>
                        <p
                            className="line-clamp-2 max-w-3xl text-xs text-muted-foreground"
                            title={order.description}
                        >
                            {order.description}
                        </p>
                    </div>
                    {order.has_pdf && (
                        <div className="flex shrink-0 items-center gap-1.5">
                            <Button variant="outline" size="sm" asChild>
                                <a
                                    href={previewPdf.url(order.po_number)}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    <ExternalLink className="size-3.5" />
                                    Preview
                                </a>
                            </Button>
                            <Button variant="outline" size="sm" asChild>
                                <a href={downloadPdf.url(order.po_number)}>
                                    <Download className="size-3.5" />
                                    PDF
                                </a>
                            </Button>
                        </div>
                    )}
                </div>
                <div className="mt-2.5 flex flex-wrap items-baseline gap-x-4 gap-y-1 ps-2">
                    <MetaItem label="Memo" value={order.memo_number ?? '—'} />
                    <MetaItem
                        label="Memo date"
                        value={formatDate(order.memo_date)}
                    />
                    <MetaItem label="Project" value={order.project_id ?? '—'} />
                    <MetaItem label="Order no." value={order.order_no ?? '—'} />
                    <MetaItem
                        label="Reference"
                        value={order.reference_no ?? '—'}
                    />
                </div>
            </div>

            {/* Money roll-up */}
            <div className="grid grid-cols-2 divide-x divide-y divide-border lg:grid-cols-4 lg:divide-y-0">
                {metrics.map((metric) => (
                    <MetricCell key={metric.label} metric={metric} />
                ))}
            </div>

            {/* Billed against ordered — the bar caps at full width, the
                percentage beside "Gross billed" keeps the true figure. */}
            <div className="h-1 w-full bg-muted" aria-hidden="true">
                <div
                    className="h-full bg-info transition-all"
                    style={{ width: `${Math.min(100, totals.billedShare)}%` }}
                />
            </div>

            {/* Lifecycle */}
            <div className="border-t bg-muted/30 px-3 py-2.5 sm:px-4">
                <PoLifecycle order={order} />
            </div>
        </Card>
    );
}
