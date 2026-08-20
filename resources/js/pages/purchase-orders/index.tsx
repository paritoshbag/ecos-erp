import { Head, Link, router } from '@inertiajs/react';
import { PanelLeft, X } from 'lucide-react';
import {
    formatSource,
    rupee,
    statusLabels,
    statusVariants,
} from '@/components/purchase-orders/format';
import { NoMaterialChip } from '@/components/purchase-orders/no-material-chip';
import { PoProfile } from '@/components/purchase-orders/po-profile';
import { UploadPurchaseOrderDialog } from '@/components/purchase-orders/upload-purchase-order-dialog';
import { DataTable } from '@/components/template/data-table';
import type {
    DataTableColumn,
    DataTableFilter,
} from '@/components/template/data-table';
import { PageHeader } from '@/components/template/page-header';
import { StatusBadge } from '@/components/template/status-badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { index as purchaseOrdersIndex, show } from '@/routes/purchase-orders';
import type {
    PurchaseOrderIndexProps,
    PurchaseOrderListItem,
} from '@/types/purchase-order';

const visitOptions = {
    preserveState: true,
    preserveScroll: true,
    only: ['order'],
};

function openOrder(poNumber: string): void {
    router.get(show.url(poNumber), {}, visitOptions);
}

function closeOrder(): void {
    router.get(purchaseOrdersIndex.url(), {}, visitOptions);
}

const columns: DataTableColumn<PurchaseOrderListItem>[] = [
    {
        key: 'po_number',
        header: 'PO number',
        sortable: true,
        accessor: (row) => row.po_number,
        cell: (row) => (
            <span className="font-mono text-sm font-medium">
                {row.po_number}
            </span>
        ),
    },
    {
        key: 'po_date',
        header: 'PO date',
        sortable: true,
        accessor: (row) => row.po_date,
        cell: (row) => <span className="tabular-nums">{row.po_date}</span>,
    },
    {
        key: 'ccc',
        header: 'CCC',
        sortable: true,
        accessor: (row) => row.ccc,
    },
    {
        key: 'order_type',
        header: 'Type',
        sortable: true,
        accessor: (row) => row.order_type,
        cell: (row) => <span className="tabular-nums">{row.order_type}</span>,
    },
    {
        key: 'memo_number',
        header: 'Memo',
        sortable: true,
        accessor: (row) => row.memo_number ?? '',
        cell: (row) => (
            <span className="max-w-48 truncate text-muted-foreground">
                {row.memo_number ?? '—'}
            </span>
        ),
    },
    {
        key: 'description',
        header: 'Description',
        accessor: (row) => row.description,
        cell: (row) => (
            <span className="block max-w-xs truncate" title={row.description}>
                {row.description}
            </span>
        ),
        className: 'max-w-xs',
    },
    {
        key: 'po_amount',
        header: 'Amount',
        sortable: true,
        align: 'right',
        accessor: (row) => Number(row.po_amount),
        cell: (row) => (
            <span className="font-medium tabular-nums">
                {rupee.format(Number(row.po_amount))}
            </span>
        ),
    },
    {
        key: 'status',
        header: 'Status',
        sortable: true,
        accessor: (row) => row.status,
        cell: (row) => (
            <div className="flex flex-wrap items-center gap-1.5">
                <StatusBadge variant={statusVariants[row.status]}>
                    {statusLabels[row.status]}
                </StatusBadge>
                {!row.has_materials && <NoMaterialChip />}
            </div>
        ),
    },
    {
        key: 'source',
        header: 'Source',
        sortable: true,
        accessor: (row) => row.source,
        cell: (row) => (
            <StatusBadge
                variant={row.source === 'import' ? 'info' : 'neutral'}
                withDot={false}
            >
                {formatSource(row.source)}
            </StatusBadge>
        ),
    },
];

const compactColumns: DataTableColumn<PurchaseOrderListItem>[] = [
    {
        key: 'po_number',
        header: 'PO',
        sortable: true,
        accessor: (row) => row.po_number,
        cell: (row) => (
            <div className="min-w-0 space-y-1">
                <span className="block font-mono text-sm font-medium">
                    {row.po_number}
                </span>
                <span className="block text-xs text-muted-foreground">
                    {row.ccc}
                </span>
                {!row.has_materials && <NoMaterialChip />}
            </div>
        ),
    },
    {
        key: 'status',
        header: 'Status',
        sortable: true,
        accessor: (row) => row.status,
        cell: (row) => (
            <div className="space-y-1 text-right">
                <StatusBadge variant={statusVariants[row.status]}>
                    {statusLabels[row.status]}
                </StatusBadge>
                <span className="block text-xs font-medium tabular-nums">
                    {rupee.format(Number(row.po_amount))}
                </span>
            </div>
        ),
        align: 'right',
    },
];

const filters: DataTableFilter<PurchaseOrderListItem>[] = [
    {
        key: 'ccc',
        label: 'CCC',
        options: [],
        match: (row, value) => row.ccc === value,
    },
    {
        key: 'status',
        label: 'Statuses',
        options: [
            { value: 'open', label: 'Open' },
            { value: 'invoiced', label: 'Invoiced' },
            { value: 'paid', label: 'Paid' },
        ],
        match: (row, value) => row.status === value,
    },
    {
        key: 'source',
        label: 'Sources',
        options: [
            { value: 'manual', label: 'Manual' },
            { value: 'import', label: 'Import' },
        ],
        match: (row, value) => row.source === value,
    },
];

export default function PurchaseOrdersIndex({
    orders,
    order,
    can_create: canCreate,
}: PurchaseOrderIndexProps) {
    const split = order !== null;
    const cccOptions = [...new Set(orders.map((item) => item.ccc))]
        .sort()
        .map((ccc) => ({ value: ccc, label: ccc }));

    const tableFilters = filters.map((filter) =>
        filter.key === 'ccc' ? { ...filter, options: cccOptions } : filter,
    );

    return (
        <>
            <Head title={order ? `PO ${order.po_number}` : 'Purchase orders'} />
            <div className="flex flex-col gap-4">
                <PageHeader
                    title="Purchase orders"
                    description={
                        split
                            ? 'Select another PO on the left to jump, or close the profile to return to the full register.'
                            : 'Company purchase order register — search by PO number, memo, or CCC.'
                    }
                    actions={
                        <div className="flex flex-wrap items-center gap-1.5">
                            {split && (
                                <Button variant="outline" size="sm" asChild>
                                    <Link
                                        href={purchaseOrdersIndex()}
                                        preserveState
                                        preserveScroll
                                        only={['order']}
                                    >
                                        <PanelLeft className="size-4" /> Full
                                        list
                                    </Link>
                                </Button>
                            )}
                            {canCreate ? <UploadPurchaseOrderDialog /> : null}
                        </div>
                    }
                />
                <div
                    className={cn(
                        'grid gap-4',
                        split &&
                            'lg:grid-cols-[minmax(13rem,18rem)_minmax(0,1fr)]',
                    )}
                >
                    <div className={cn(split && 'max-lg:hidden')}>
                        <DataTable
                            data={orders}
                            columns={split ? compactColumns : columns}
                            rowKey={(row) => row.po_number}
                            filters={tableFilters}
                            searchPlaceholder="Search PO number, memo, CCC…"
                            pageSizeOptions={[25, 50, 100]}
                            activeRowKey={order?.po_number}
                            onRowClick={(row) => openOrder(row.po_number)}
                        />
                    </div>
                    {order && (
                        <aside className="min-w-0 rounded-lg border bg-muted/30">
                            <div className="flex items-center justify-between gap-2 border-b bg-card px-3 py-1.5">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="lg:hidden"
                                    onClick={() => closeOrder()}
                                >
                                    <PanelLeft className="size-4" /> List
                                </Button>
                                <p className="hidden text-2xs tracking-widest text-muted-foreground uppercase lg:block">
                                    Object profile
                                </p>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-7"
                                    aria-label="Close profile"
                                    onClick={() => closeOrder()}
                                >
                                    <X className="size-4" />
                                </Button>
                            </div>
                            <div className="p-3">
                                <PoProfile order={order} />
                            </div>
                        </aside>
                    )}
                </div>
            </div>
        </>
    );
}

PurchaseOrdersIndex.layout = {
    breadcrumbs: [
        {
            title: 'Purchase orders',
            href: purchaseOrdersIndex(),
        },
    ],
};
