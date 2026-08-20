import { Link, useForm, useHttp } from '@inertiajs/react';
import { Upload } from 'lucide-react';
import { useRef, useState  } from 'react';
import type {KeyboardEvent} from 'react';
import { toast } from 'sonner';
import {
    scan,
    store,
} from '@/actions/App/Http/Controllers/PurchaseOrderController';
import InputError from '@/components/input-error';
import { PurchaseOrderLabourTable } from '@/components/purchase-orders/purchase-order-labour-table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { show as purchaseOrderShow } from '@/routes/purchase-orders';
import type {
    PurchaseOrderDraft,
    PurchaseOrderLabourLine,
    PurchaseOrderScanDuplicates,
    PurchaseOrderScanResponse,
} from '@/types/purchase-order';

const emptyForm = {
    file: null as File | null,
    memo_number: '',
    memo_date: '',
    po_number: '',
    po_date: '',
    project_id: '',
    order_no: '',
    reference_no: '',
    order_type: '',
    ccc: '',
    description: '',
    po_amount: '',
};

function draftValue(value: string | number | null | undefined): string {
    if (value === null || value === undefined) {
        return '';
    }

    return String(value);
}

function ExistingProfileLink({
    poNumber,
    onNavigate,
}: {
    poNumber: string;
    onNavigate: () => void;
}) {
    return (
        <Link
            href={purchaseOrderShow(poNumber)}
            preserveState
            preserveScroll
            only={['order']}
            onClick={onNavigate}
            className="font-medium text-current underline underline-offset-4"
        >
            Open profile {poNumber}
        </Link>
    );
}

export function UploadPurchaseOrderDialog() {
    const inputRef = useRef<HTMLInputElement>(null);
    const formRef = useRef<HTMLFormElement>(null);
    const [open, setOpen] = useState(false);
    const [duplicates, setDuplicates] =
        useState<PurchaseOrderScanDuplicates | null>(null);
    const [scannedPoNumber, setScannedPoNumber] = useState<string | null>(null);
    const [lines, setLines] = useState<PurchaseOrderLabourLine[]>([]);

    const scanHttp = useHttp<{ file: File | null }, PurchaseOrderScanResponse>({
        file: null,
    });

    const form = useForm(emptyForm);

    function resetPicker(): void {
        if (inputRef.current) {
            inputRef.current.value = '';
        }
    }

    function closeDialog(): void {
        setOpen(false);
        setDuplicates(null);
        setScannedPoNumber(null);
        setLines([]);
        form.reset();
        form.clearErrors();
        scanHttp.reset();
        scanHttp.clearErrors();
        resetPicker();
    }

    function applyDraft(draft: PurchaseOrderDraft, file: File): void {
        form.setData({
            file,
            memo_number: draftValue(draft.memo_number),
            memo_date: draftValue(draft.memo_date),
            po_number: draftValue(draft.po_number),
            po_date: draftValue(draft.po_date),
            project_id: draftValue(draft.project_id),
            order_no: draftValue(draft.order_no),
            reference_no: draftValue(draft.reference_no),
            order_type: draftValue(draft.order_type),
            ccc: draftValue(draft.ccc),
            description: draftValue(draft.description),
            po_amount: draftValue(draft.po_amount),
        });
        form.clearErrors();
    }

    async function handleFile(file: File): Promise<void> {
        scanHttp.setData('file', file);
        scanHttp.clearErrors();

        try {
            const response = await scanHttp.post(scan.url(), {
                onError: (errors) => {
                    const message = errors.file;

                    toast.error(
                        typeof message === 'string'
                            ? message
                            : 'Could not read this PDF.',
                    );
                },
            });
            applyDraft(response.draft, file);
            setDuplicates(response.duplicates);
            setScannedPoNumber(response.draft.po_number);
            setLines(response.lines);
            setOpen(true);
        } catch {
            setOpen(false);
        } finally {
            resetPicker();
        }
    }

    const pdfDuplicate = duplicates?.pdf === true;
    const poDuplicate =
        duplicates?.po_number === true &&
        form.data.po_number === (scannedPoNumber ?? '');
    const confirmBlocked = pdfDuplicate || poDuplicate;

    function submitForm(): void {
        if (confirmBlocked || form.processing) {
            return;
        }

        form.post(store.url(), {
            forceFormData: true,
            onSuccess: () => closeDialog(),
        });
    }

    function handleDialogKeyDown(event: KeyboardEvent<HTMLDivElement>): void {
        if (
            event.key !== 'Enter' ||
            event.shiftKey ||
            event.nativeEvent.isComposing
        ) {
            return;
        }

        const target = event.target;

        if (
            target instanceof HTMLTextAreaElement ||
            (target instanceof HTMLElement && target.closest('textarea'))
        ) {
            return;
        }

        event.preventDefault();
        submitForm();
    }

    return (
        <>
            <input
                ref={inputRef}
                type="file"
                accept="application/pdf,.pdf"
                className="sr-only"
                onChange={(event) => {
                    const file = event.target.files?.[0];

                    if (file) {
                        void handleFile(file);
                    }
                }}
            />
            <Button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={scanHttp.processing}
            >
                <Upload className="size-4" />
                {scanHttp.processing ? 'Scanning…' : 'Upload PDF'}
            </Button>

            <Dialog
                open={open}
                onOpenChange={(nextOpen) => {
                    if (!nextOpen) {
                        closeDialog();
                    }
                }}
            >
                <DialogContent
                    className="flex max-h-[92vh] w-full flex-col overflow-hidden sm:max-w-6xl"
                    onKeyDown={handleDialogKeyDown}
                >
                    <DialogHeader>
                        <DialogTitle>Review purchase order</DialogTitle>
                        <DialogDescription>
                            Check the scanned fields and labour rows, then press
                            Enter to save or Esc to cancel.
                        </DialogDescription>
                    </DialogHeader>

                    {pdfDuplicate && (
                        <Alert variant="destructive">
                            <AlertTitle>Already imported</AlertTitle>
                            <AlertDescription>
                                <p>
                                    This PDF was already uploaded. It cannot be
                                    imported again.
                                </p>
                                {duplicates?.existing_pdf_po_number && (
                                    <ExistingProfileLink
                                        poNumber={
                                            duplicates.existing_pdf_po_number
                                        }
                                        onNavigate={closeDialog}
                                    />
                                )}
                            </AlertDescription>
                        </Alert>
                    )}

                    {poDuplicate && !pdfDuplicate && (
                        <Alert variant="destructive">
                            <AlertTitle>Duplicate PO number</AlertTitle>
                            <AlertDescription>
                                <p>
                                    A purchase order with this number already
                                    exists.
                                </p>
                                {duplicates?.existing_po_number && (
                                    <ExistingProfileLink
                                        poNumber={duplicates.existing_po_number}
                                        onNavigate={closeDialog}
                                    />
                                )}
                            </AlertDescription>
                        </Alert>
                    )}

                    {scanHttp.errors.file && (
                        <InputError message={scanHttp.errors.file} />
                    )}

                    <form
                        ref={formRef}
                        className="grid min-h-0 flex-1 gap-4 overflow-y-auto sm:grid-cols-2"
                        onSubmit={(event) => {
                            event.preventDefault();
                            submitForm();
                        }}
                    >
                        <div className="grid gap-2">
                            <Label htmlFor="po_number">PO number</Label>
                            <Input
                                id="po_number"
                                value={form.data.po_number}
                                onChange={(event) =>
                                    form.setData(
                                        'po_number',
                                        event.target.value,
                                    )
                                }
                                required
                            />
                            <InputError message={form.errors.po_number} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="po_date">PO date</Label>
                            <Input
                                id="po_date"
                                type="date"
                                value={form.data.po_date}
                                onChange={(event) =>
                                    form.setData('po_date', event.target.value)
                                }
                                required
                            />
                            <InputError message={form.errors.po_date} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="memo_number">Memo no</Label>
                            <Input
                                id="memo_number"
                                value={form.data.memo_number}
                                onChange={(event) =>
                                    form.setData(
                                        'memo_number',
                                        event.target.value,
                                    )
                                }
                            />
                            <InputError message={form.errors.memo_number} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="memo_date">Memo date</Label>
                            <Input
                                id="memo_date"
                                type="date"
                                value={form.data.memo_date}
                                onChange={(event) =>
                                    form.setData(
                                        'memo_date',
                                        event.target.value,
                                    )
                                }
                            />
                            <InputError message={form.errors.memo_date} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="project_id">Proj. ID</Label>
                            <Input
                                id="project_id"
                                value={form.data.project_id}
                                onChange={(event) =>
                                    form.setData(
                                        'project_id',
                                        event.target.value,
                                    )
                                }
                            />
                            <InputError message={form.errors.project_id} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="order_no">Order no</Label>
                            <Input
                                id="order_no"
                                value={form.data.order_no}
                                onChange={(event) =>
                                    form.setData('order_no', event.target.value)
                                }
                            />
                            <InputError message={form.errors.order_no} />
                        </div>
                        <div className="grid gap-2 sm:col-span-2">
                            <Label htmlFor="reference_no">Ref no</Label>
                            <Input
                                id="reference_no"
                                value={form.data.reference_no}
                                onChange={(event) =>
                                    form.setData(
                                        'reference_no',
                                        event.target.value,
                                    )
                                }
                                maxLength={40}
                            />
                            <InputError message={form.errors.reference_no} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="order_type">Order type</Label>
                            <Input
                                id="order_type"
                                type="number"
                                min={1}
                                max={255}
                                value={form.data.order_type}
                                onChange={(event) =>
                                    form.setData(
                                        'order_type',
                                        event.target.value,
                                    )
                                }
                                required
                            />
                            <InputError message={form.errors.order_type} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="ccc">CCC</Label>
                            <Input
                                id="ccc"
                                value={form.data.ccc}
                                onChange={(event) =>
                                    form.setData('ccc', event.target.value)
                                }
                                required
                                maxLength={10}
                            />
                            <InputError message={form.errors.ccc} />
                        </div>
                        <div className="grid gap-2 sm:col-span-2">
                            <Label htmlFor="description">PO description</Label>
                            <Textarea
                                id="description"
                                value={form.data.description}
                                onChange={(event) =>
                                    form.setData(
                                        'description',
                                        event.target.value,
                                    )
                                }
                                required
                                rows={3}
                            />
                            <InputError message={form.errors.description} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="po_amount">P.O amount</Label>
                            <Input
                                id="po_amount"
                                type="number"
                                min={0}
                                step="0.01"
                                value={form.data.po_amount}
                                onChange={(event) =>
                                    form.setData(
                                        'po_amount',
                                        event.target.value,
                                    )
                                }
                                required
                            />
                            <InputError message={form.errors.po_amount} />
                        </div>
                        <div className="grid gap-2 sm:col-span-2">
                            <div className="flex items-center justify-between gap-2">
                                <Label>Labour items</Label>
                                <span className="text-xs text-muted-foreground">
                                    {lines.length} row
                                    {lines.length === 1 ? '' : 's'} · GST
                                    skipped
                                </span>
                            </div>
                            <div className="rounded-md border">
                                <PurchaseOrderLabourTable lines={lines} />
                            </div>
                        </div>
                        <InputError
                            className="sm:col-span-2"
                            message={form.errors.file}
                        />
                        <DialogFooter className="sm:col-span-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={closeDialog}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={form.processing || confirmBlocked}
                            >
                                {form.processing ? 'Saving…' : 'Save'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
