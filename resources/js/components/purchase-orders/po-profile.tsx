import {
    Banknote,
    CalendarDays,
    ClipboardList,
    Download,
    ExternalLink,
    FileCheck,
    FileText,
    HardHat,
    Landmark,
    ReceiptIndianRupee,
    ShieldCheck,
    Stamp,
} from 'lucide-react';
import {
    downloadPdf,
    previewPdf,
} from '@/actions/App/Http/Controllers/PurchaseOrderController';
import {
    formatMoney,
    formatSource,
    purchaseOrderTotals,
    statusLabels,
} from '@/components/purchase-orders/format';
import { PoAmountLedger } from '@/components/purchase-orders/po-amount-ledger';
import {
    filledCount,
    PoFieldGrid,
} from '@/components/purchase-orders/po-field-grid';
import type { PoField } from '@/components/purchase-orders/po-field-grid';
import { PoHeroCard } from '@/components/purchase-orders/po-hero-card';
import { PoSection } from '@/components/purchase-orders/po-section';
import { EmptyState } from '@/components/template/empty-state';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import type { PurchaseOrderProfile } from '@/types/purchase-order';

/* Underline tab bar rather than the stock segmented pill: at five tabs the
 * pill group eats too much of a split-view column, and the underline is the
 * idiom every enterprise object page already uses. */
const triggerClasses = cn(
    'relative h-8 flex-none gap-1.5 rounded-none border-0 border-b-2 border-transparent px-2.5',
    'text-xs font-medium text-muted-foreground shadow-none',
    'data-[state=active]:border-primary data-[state=active]:bg-transparent',
    'data-[state=active]:text-primary data-[state=active]:shadow-none',
    'dark:data-[state=active]:border-primary dark:data-[state=active]:bg-transparent',
    'dark:data-[state=active]:text-primary',
);

function Count({ fields }: { fields: PoField[] }) {
    return (
        <span className="rounded-sm bg-muted px-1 text-2xs text-muted-foreground tabular-nums">
            {filledCount(fields)}/{fields.length}
        </span>
    );
}

function commercialFields(order: PurchaseOrderProfile): PoField[] {
    return [
        { label: 'PO number', value: order.po_number, kind: 'code' },
        { label: 'PO date', value: order.po_date, kind: 'date' },
        { label: 'CCC', value: order.ccc },
        { label: 'Order type', value: order.order_type },
        { label: 'PO amount', value: order.po_amount, kind: 'money' },
        { label: 'Status', value: statusLabels[order.status] },
    ];
}

function referenceFields(order: PurchaseOrderProfile): PoField[] {
    return [
        { label: 'Memo number', value: order.memo_number, kind: 'code' },
        { label: 'Memo date', value: order.memo_date, kind: 'date' },
        { label: 'Project ID', value: order.project_id, kind: 'code' },
        { label: 'Order no.', value: order.order_no, kind: 'code' },
        { label: 'Reference no.', value: order.reference_no, kind: 'code' },
        { label: 'Source', value: formatSource(order.source) },
    ];
}

function scopeFields(order: PurchaseOrderProfile): PoField[] {
    return [
        { label: 'Subject', value: order.subject, wide: true },
        { label: 'Description', value: order.description, wide: true },
    ];
}

function progressFields(order: PurchaseOrderProfile): PoField[] {
    return [
        { label: 'Commenced on', value: order.commenced_on, kind: 'date' },
        { label: 'Completed on', value: order.completed_on, kind: 'date' },
        { label: 'Measured on', value: order.measured_on, kind: 'date' },
        {
            label: 'Completion letter',
            value: order.completion_letter,
            kind: 'code',
        },
    ];
}

function measurementFields(order: PurchaseOrderProfile): PoField[] {
    return [
        { label: 'MB no.', value: order.mb_no, kind: 'code' },
        { label: 'MB written', value: order.mb_written, kind: 'boolean' },
        { label: 'Measurement done', value: order.measurement_done },
        { label: 'SIRN number', value: order.sirn_number, kind: 'code' },
    ];
}

function clearanceFields(order: PurchaseOrderProfile): PoField[] {
    return [
        {
            label: 'ZMM confirmation',
            value: order.zmm_confirmation_no,
            kind: 'code',
        },
        {
            label: 'Requisition copy',
            value: order.requisition_copy_no,
            kind: 'code',
        },
        { label: 'CCC issue no.', value: order.ccc_issue_no, kind: 'code' },
        { label: 'CCC issue date', value: order.ccc_issue_date, kind: 'date' },
        {
            label: 'CCC receive date',
            value: order.ccc_receive_date,
            kind: 'date',
        },
    ];
}

function acceptanceFields(order: PurchaseOrderProfile): PoField[] {
    return [
        {
            label: 'Service acceptance no.',
            value: order.service_acceptance_no,
            kind: 'code',
        },
        {
            label: 'Acceptance date',
            value: order.service_acceptance_date,
            kind: 'date',
        },
        {
            label: 'Acceptance amount',
            value: order.service_acceptance_amount,
            kind: 'money',
        },
        {
            label: 'Service account no.',
            value: order.service_account_no,
            kind: 'code',
        },
        {
            label: 'Accepted amount',
            value: order.accepted_amount,
            kind: 'money',
        },
    ];
}

function billFields(order: PurchaseOrderProfile): PoField[] {
    return [
        { label: 'Bill issue no.', value: order.bill_issue_no, kind: 'code' },
        {
            label: 'Bill issue date',
            value: order.bill_issue_date,
            kind: 'date',
        },
        {
            label: 'Bill receive no.',
            value: order.bill_receive_no,
            kind: 'code',
        },
        {
            label: 'Bill receive date',
            value: order.bill_receive_date,
            kind: 'date',
        },
        { label: 'Bill signed', value: order.bill_signed, kind: 'boolean' },
        { label: 'Invoice no.', value: order.invoice_no, kind: 'code' },
        { label: 'Invoice date', value: order.invoice_date, kind: 'date' },
    ];
}

function settlementFields(order: PurchaseOrderProfile): PoField[] {
    return [
        {
            label: 'Net amount (GST)',
            value: order.net_amount_gst,
            kind: 'money',
        },
        { label: 'Net amount', value: order.net_amount, kind: 'money' },
        {
            label: 'Final receipt no.',
            value: order.final_receipt_issue_no,
            kind: 'code',
        },
        {
            label: 'Final receipt date',
            value: order.final_receipt_issue_date,
            kind: 'date',
        },
        { label: 'Deposit date', value: order.deposit_date, kind: 'date' },
        { label: 'Payment date', value: order.payment_date, kind: 'date' },
        { label: 'Payment year', value: order.payment_year },
    ];
}

function securityFields(order: PurchaseOrderProfile): PoField[] {
    return [
        {
            label: 'Security deposit',
            value: order.security_deposit,
            kind: 'money',
        },
        {
            label: 'Claimed on',
            value: order.security_claimed_on,
            kind: 'date',
        },
        { label: 'Paid on', value: order.security_paid_on, kind: 'date' },
        { label: 'SRN number', value: order.srn_number, kind: 'code' },
    ];
}

export function PoProfile({ order }: { order: PurchaseOrderProfile }) {
    const totals = purchaseOrderTotals(order);

    return (
        <div className="flex flex-col gap-3">
            <PoHeroCard order={order} />

            <div className="overflow-hidden rounded-lg border bg-card">
                <Tabs defaultValue="overview" className="gap-0">
                    <div className="overflow-x-auto border-b bg-card">
                        <TabsList className="h-auto w-full justify-start gap-0 rounded-none bg-transparent p-0">
                            <TabsTrigger
                                value="overview"
                                className={triggerClasses}
                            >
                                <ClipboardList className="size-3.5" />
                                Overview
                            </TabsTrigger>
                            <TabsTrigger
                                value="execution"
                                className={triggerClasses}
                            >
                                <HardHat className="size-3.5" />
                                Execution
                            </TabsTrigger>
                            <TabsTrigger
                                value="billing"
                                className={triggerClasses}
                            >
                                <ReceiptIndianRupee className="size-3.5" />
                                Billing
                            </TabsTrigger>
                            <TabsTrigger
                                value="payment"
                                className={triggerClasses}
                            >
                                <Landmark className="size-3.5" />
                                Payment
                            </TabsTrigger>
                            <TabsTrigger
                                value="documents"
                                className={triggerClasses}
                            >
                                <FileText className="size-3.5" />
                                Documents
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent
                        value="overview"
                        className="grid gap-3 bg-muted/40 p-3 xl:grid-cols-2"
                    >
                        <PoSection
                            title="Commercial"
                            icon={Banknote}
                            tone="primary"
                            meta={<Count fields={commercialFields(order)} />}
                        >
                            <PoFieldGrid
                                fields={commercialFields(order)}
                                className="sm:grid-cols-1 xl:grid-cols-1"
                            />
                        </PoSection>
                        <PoSection
                            title="Memo & reference"
                            icon={Stamp}
                            tone="info"
                            meta={<Count fields={referenceFields(order)} />}
                        >
                            <PoFieldGrid
                                fields={referenceFields(order)}
                                className="sm:grid-cols-1 xl:grid-cols-1"
                            />
                        </PoSection>
                        <PoSection
                            title="Scope of work"
                            icon={FileText}
                            tone="neutral"
                            className="xl:col-span-2"
                            meta={<Count fields={scopeFields(order)} />}
                        >
                            <PoFieldGrid fields={scopeFields(order)} />
                        </PoSection>
                    </TabsContent>

                    <TabsContent
                        value="execution"
                        className="grid gap-3 bg-muted/40 p-3 xl:grid-cols-2"
                    >
                        <PoSection
                            title="Site progress"
                            icon={CalendarDays}
                            tone="warning"
                            meta={<Count fields={progressFields(order)} />}
                        >
                            <PoFieldGrid
                                fields={progressFields(order)}
                                className="sm:grid-cols-1 xl:grid-cols-1"
                            />
                        </PoSection>
                        <PoSection
                            title="Measurement"
                            icon={ClipboardList}
                            tone="warning"
                            meta={<Count fields={measurementFields(order)} />}
                        >
                            <PoFieldGrid
                                fields={measurementFields(order)}
                                className="sm:grid-cols-1 xl:grid-cols-1"
                            />
                        </PoSection>
                        <PoSection
                            title="Clearances & requisition"
                            icon={FileCheck}
                            tone="info"
                            className="xl:col-span-2"
                            meta={<Count fields={clearanceFields(order)} />}
                        >
                            <PoFieldGrid fields={clearanceFields(order)} />
                        </PoSection>
                    </TabsContent>

                    <TabsContent
                        value="billing"
                        className="grid gap-3 bg-muted/40 p-3 xl:grid-cols-2"
                    >
                        <PoSection
                            title="Service acceptance"
                            icon={FileCheck}
                            tone="info"
                            meta={<Count fields={acceptanceFields(order)} />}
                        >
                            <PoFieldGrid
                                fields={acceptanceFields(order)}
                                className="sm:grid-cols-1 xl:grid-cols-1"
                            />
                        </PoSection>
                        <PoSection
                            title="Bill & invoice"
                            icon={ReceiptIndianRupee}
                            tone="info"
                            meta={<Count fields={billFields(order)} />}
                        >
                            <PoFieldGrid
                                fields={billFields(order)}
                                className="sm:grid-cols-1 xl:grid-cols-1"
                            />
                        </PoSection>
                        <PoSection
                            title="Amount statement"
                            icon={Banknote}
                            tone="destructive"
                            className="xl:col-span-2"
                            meta={`Net ${formatMoney(totals.net)}`}
                        >
                            <PoAmountLedger
                                rows={[
                                    {
                                        label: 'Gross bill amount',
                                        value: order.gross_bill_amount,
                                    },
                                    {
                                        label: 'CGST',
                                        value: order.cgst,
                                        kind: 'addition',
                                    },
                                    {
                                        label: 'SGST',
                                        value: order.sgst,
                                        kind: 'addition',
                                    },
                                    {
                                        label: 'Total gross amount',
                                        value: order.total_gross_amount,
                                        kind: 'subtotal',
                                    },
                                    {
                                        label: 'Security deposit',
                                        value: order.security_deposit,
                                        kind: 'deduction',
                                    },
                                    {
                                        label: 'Income tax',
                                        value: order.income_tax,
                                        kind: 'deduction',
                                    },
                                    {
                                        label: 'Cess',
                                        value: order.cess,
                                        kind: 'deduction',
                                    },
                                    {
                                        label: 'WCT',
                                        value: order.wct,
                                        kind: 'deduction',
                                    },
                                    {
                                        label: 'Material deduction',
                                        value: order.material_deduction,
                                        kind: 'deduction',
                                    },
                                    {
                                        label: 'Penalty',
                                        value: order.penalty,
                                        kind: 'deduction',
                                    },
                                    {
                                        label: 'Tax deduction',
                                        value: order.tax_deduction,
                                        kind: 'deduction',
                                    },
                                    {
                                        label: 'Net payable',
                                        value: totals.net,
                                        kind: 'total',
                                    },
                                ]}
                            />
                        </PoSection>
                    </TabsContent>

                    <TabsContent
                        value="payment"
                        className="grid gap-3 bg-muted/40 p-3 xl:grid-cols-2"
                    >
                        <PoSection
                            title="Settlement"
                            icon={Landmark}
                            tone="success"
                            meta={<Count fields={settlementFields(order)} />}
                        >
                            <PoFieldGrid
                                fields={settlementFields(order)}
                                className="sm:grid-cols-1 xl:grid-cols-1"
                            />
                        </PoSection>
                        <PoSection
                            title="Security deposit"
                            icon={ShieldCheck}
                            tone="warning"
                            meta={<Count fields={securityFields(order)} />}
                        >
                            <PoFieldGrid
                                fields={securityFields(order)}
                                className="sm:grid-cols-1 xl:grid-cols-1"
                            />
                        </PoSection>
                    </TabsContent>

                    <TabsContent value="documents" className="bg-muted/40 p-3">
                        <PoSection
                            title="Attachments"
                            icon={FileText}
                            tone="neutral"
                            meta={order.has_pdf ? '1 file' : 'No files'}
                        >
                            {order.has_pdf ? (
                                <div className="flex flex-col gap-3 py-1 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex min-w-0 items-center gap-2.5">
                                        <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-destructive/10 text-destructive">
                                            <FileText className="size-4" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="truncate text-xs font-medium">
                                                {order.pdf_original_name ??
                                                    `${order.po_number}.pdf`}
                                            </p>
                                            <p className="text-2xs text-muted-foreground">
                                                Original purchase order PDF
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex shrink-0 flex-wrap gap-1.5">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            asChild
                                        >
                                            <a
                                                href={previewPdf.url(
                                                    order.po_number,
                                                )}
                                                target="_blank"
                                                rel="noreferrer"
                                            >
                                                <ExternalLink className="size-3.5" />
                                                Preview
                                            </a>
                                        </Button>
                                        <Button size="sm" asChild>
                                            <a
                                                href={downloadPdf.url(
                                                    order.po_number,
                                                )}
                                            >
                                                <Download className="size-3.5" />
                                                Download
                                            </a>
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <EmptyState
                                    icon={FileText}
                                    title="No PDF on file"
                                    description="Imported purchase orders keep the original PDF here. Manual records may not have one."
                                    className="border-0 p-4"
                                />
                            )}
                        </PoSection>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
