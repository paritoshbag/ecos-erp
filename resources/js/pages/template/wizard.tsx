import { Head } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowRight,
    Building2,
    CheckCircle2,
    PackagePlus,
    Plus,
    RotateCcw,
    Send,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import InputError from '@/components/input-error';
import { PageHeader } from '@/components/template/page-header';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Stepper } from '@/components/ui/stepper';
import type { StepperStep } from '@/components/ui/stepper';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';

const steps: StepperStep[] = [
    { id: 'client', title: 'Client', description: 'Who is this for' },
    { id: 'items', title: 'Line items', description: 'Products & services' },
    { id: 'terms', title: 'Terms', description: 'Validity & payment' },
    { id: 'review', title: 'Review', description: 'Confirm & send' },
];

type LineItem = {
    id: number;
    description: string;
    quantity: number;
    unitPrice: number;
};

const initialItems: LineItem[] = [
    {
        id: 1,
        description: 'ERP implementation — discovery phase',
        quantity: 1,
        unitPrice: 8500,
    },
    {
        id: 2,
        description: 'User training workshop (per day)',
        quantity: 3,
        unitPrice: 1200,
    },
];

const currency = (value: number) =>
    value.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
    });

export default function TemplateWizard() {
    const [currentStep, setCurrentStep] = useState(0);
    const [completed, setCompleted] = useState(false);

    const [clientName, setClientName] = useState('');
    const [clientEmail, setClientEmail] = useState('');
    const [clientError, setClientError] = useState('');

    const [items, setItems] = useState<LineItem[]>(initialItems);
    const [nextItemId, setNextItemId] = useState(3);

    const [validity, setValidity] = useState('30');
    const [paymentTerms, setPaymentTerms] = useState('net30');
    const [notes, setNotes] = useState('');

    const subtotal = items.reduce(
        (sum, item) => sum + item.quantity * item.unitPrice,
        0,
    );
    const tax = subtotal * 0.1;
    const total = subtotal + tax;

    const updateItem = (
        id: number,
        patch: Partial<Omit<LineItem, 'id'>>,
    ): void => {
        setItems((current) =>
            current.map((item) =>
                item.id === id ? { ...item, ...patch } : item,
            ),
        );
    };

    const goNext = (): void => {
        if (currentStep === 0) {
            if (!clientName.trim()) {
                setClientError('Client name is required to continue.');

                return;
            }

            setClientError('');
        }

        if (currentStep === 1 && items.length === 0) {
            toast.error('Add at least one line item.');

            return;
        }

        setCurrentStep((step) => Math.min(step + 1, steps.length - 1));
    };

    const reset = (): void => {
        setCompleted(false);
        setCurrentStep(0);
        setClientName('');
        setClientEmail('');
        setItems(initialItems);
        setNotes('');
    };

    if (completed) {
        return (
            <>
                <Head title="Wizard" />
                <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-xl border p-10 text-center">
                    <div className="flex size-14 items-center justify-center rounded-full bg-success/10 text-success">
                        <CheckCircle2 className="size-7" />
                    </div>
                    <div className="space-y-1">
                        <h1 className="text-xl font-semibold">
                            Quotation sent
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            QT-2042 for {clientName || 'the client'} (
                            {currency(total)}) is on its way.
                        </p>
                    </div>
                    <Button variant="outline" onClick={reset}>
                        <RotateCcw className="size-4" />
                        Start another quotation
                    </Button>
                </div>
            </>
        );
    }

    return (
        <>
            <Head title="Wizard" />
            <PageHeader
                title="New quotation"
                description="A reusable multi-step wizard: per-step validation, editable review and a mobile-friendly progress header."
            />

            <Card>
                <CardHeader className="border-b">
                    <Stepper
                        steps={steps}
                        currentStep={currentStep}
                        onStepClick={setCurrentStep}
                    />
                </CardHeader>

                <CardContent className="min-h-72">
                    {currentStep === 0 && (
                        <div className="grid max-w-2xl gap-5">
                            <div className="flex items-center gap-3">
                                <div className="flex size-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                                    <Building2 className="size-5" />
                                </div>
                                <div>
                                    <p className="font-medium">
                                        Client details
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Pick an existing client or enter a new
                                        one.
                                    </p>
                                </div>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="w-client">
                                        Client name{' '}
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </Label>
                                    <Input
                                        id="w-client"
                                        placeholder="Acme Industries Ltd."
                                        value={clientName}
                                        aria-invalid={
                                            clientError ? 'true' : undefined
                                        }
                                        onChange={(event) =>
                                            setClientName(event.target.value)
                                        }
                                    />
                                    <InputError message={clientError} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="w-email">
                                        Billing email
                                    </Label>
                                    <Input
                                        id="w-email"
                                        type="email"
                                        placeholder="accounts@acme.test"
                                        value={clientEmail}
                                        onChange={(event) =>
                                            setClientEmail(event.target.value)
                                        }
                                    />
                                </div>
                                <div className="grid gap-2 sm:col-span-2">
                                    <Label htmlFor="w-address">Address</Label>
                                    <Textarea
                                        id="w-address"
                                        placeholder="Street, city, country"
                                        className="min-h-20"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {currentStep === 1 && (
                        <div className="grid gap-4">
                            <div className="flex items-center gap-3">
                                <div className="flex size-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                                    <PackagePlus className="size-5" />
                                </div>
                                <div>
                                    <p className="font-medium">Line items</p>
                                    <p className="text-sm text-muted-foreground">
                                        Quantities and prices update the totals
                                        live.
                                    </p>
                                </div>
                            </div>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="min-w-56">
                                            Description
                                        </TableHead>
                                        <TableHead className="w-20 text-right">
                                            Qty
                                        </TableHead>
                                        <TableHead className="w-32 text-right">
                                            Unit price
                                        </TableHead>
                                        <TableHead className="w-28 text-right">
                                            Total
                                        </TableHead>
                                        <TableHead className="w-10" />
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {items.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell>
                                                <Input
                                                    value={item.description}
                                                    className="min-w-52"
                                                    onChange={(event) =>
                                                        updateItem(item.id, {
                                                            description:
                                                                event.target
                                                                    .value,
                                                        })
                                                    }
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    type="number"
                                                    min={1}
                                                    value={item.quantity}
                                                    className="text-right tabular-nums"
                                                    onChange={(event) =>
                                                        updateItem(item.id, {
                                                            quantity:
                                                                Number(
                                                                    event.target
                                                                        .value,
                                                                ) || 0,
                                                        })
                                                    }
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    type="number"
                                                    min={0}
                                                    value={item.unitPrice}
                                                    className="text-right tabular-nums"
                                                    onChange={(event) =>
                                                        updateItem(item.id, {
                                                            unitPrice:
                                                                Number(
                                                                    event.target
                                                                        .value,
                                                                ) || 0,
                                                        })
                                                    }
                                                />
                                            </TableCell>
                                            <TableCell className="text-right font-medium tabular-nums">
                                                {currency(
                                                    item.quantity *
                                                        item.unitPrice,
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="size-8 text-muted-foreground hover:text-destructive"
                                                    aria-label="Remove item"
                                                    onClick={() =>
                                                        setItems((current) =>
                                                            current.filter(
                                                                (candidate) =>
                                                                    candidate.id !==
                                                                    item.id,
                                                            ),
                                                        )
                                                    }
                                                >
                                                    <Trash2 className="size-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setItems((current) => [
                                            ...current,
                                            {
                                                id: nextItemId,
                                                description: '',
                                                quantity: 1,
                                                unitPrice: 0,
                                            },
                                        ]);
                                        setNextItemId((id) => id + 1);
                                    }}
                                >
                                    <Plus className="size-4" /> Add item
                                </Button>
                                <div className="text-sm text-muted-foreground">
                                    Subtotal:{' '}
                                    <span className="font-medium text-foreground tabular-nums">
                                        {currency(subtotal)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {currentStep === 2 && (
                        <div className="grid max-w-2xl gap-5">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label>Quotation valid for</Label>
                                    <Select
                                        value={validity}
                                        onValueChange={setValidity}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="14">
                                                14 days
                                            </SelectItem>
                                            <SelectItem value="30">
                                                30 days
                                            </SelectItem>
                                            <SelectItem value="60">
                                                60 days
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Payment terms</Label>
                                    <RadioGroup
                                        value={paymentTerms}
                                        onValueChange={setPaymentTerms}
                                        className="flex flex-wrap gap-2"
                                    >
                                        {[
                                            { value: 'net15', label: 'Net 15' },
                                            { value: 'net30', label: 'Net 30' },
                                            { value: 'net60', label: 'Net 60' },
                                        ].map((option) => (
                                            <Label
                                                key={option.value}
                                                className="flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 font-normal transition-colors has-data-[state=checked]:border-primary has-data-[state=checked]:bg-accent"
                                            >
                                                <RadioGroupItem
                                                    value={option.value}
                                                />
                                                {option.label}
                                            </Label>
                                        ))}
                                    </RadioGroup>
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="w-notes">
                                    Terms & notes (shown on the PDF)
                                </Label>
                                <Textarea
                                    id="w-notes"
                                    placeholder="Prices exclude travel expenses…"
                                    value={notes}
                                    onChange={(event) =>
                                        setNotes(event.target.value)
                                    }
                                />
                            </div>
                            <Label className="flex items-start gap-2 font-normal">
                                <Checkbox defaultChecked className="mt-0.5" />
                                Email a copy to the sales team when the client
                                opens the quotation.
                            </Label>
                        </div>
                    )}

                    {currentStep === 3 && (
                        <div className="grid gap-5 lg:grid-cols-2">
                            <div className="space-y-4">
                                <div className="rounded-lg border p-4">
                                    <p className="text-xs font-medium text-muted-foreground uppercase">
                                        Client
                                    </p>
                                    <p className="mt-1 font-medium">
                                        {clientName || '—'}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {clientEmail || 'No billing email'}
                                    </p>
                                </div>
                                <div className="rounded-lg border p-4">
                                    <p className="text-xs font-medium text-muted-foreground uppercase">
                                        Terms
                                    </p>
                                    <p className="mt-1 text-sm">
                                        Valid {validity} days · Payment{' '}
                                        {paymentTerms.replace('net', 'Net ')}
                                    </p>
                                    {notes && (
                                        <p className="mt-2 text-sm text-muted-foreground">
                                            {notes}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="rounded-lg border p-4">
                                <p className="text-xs font-medium text-muted-foreground uppercase">
                                    Summary
                                </p>
                                <div className="mt-2 space-y-2 text-sm">
                                    {items.map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex justify-between gap-4"
                                        >
                                            <span className="truncate">
                                                {item.description ||
                                                    'Untitled item'}{' '}
                                                × {item.quantity}
                                            </span>
                                            <span className="shrink-0 tabular-nums">
                                                {currency(
                                                    item.quantity *
                                                        item.unitPrice,
                                                )}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                <Separator className="my-3" />
                                <div className="space-y-1.5 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            Subtotal
                                        </span>
                                        <span className="tabular-nums">
                                            {currency(subtotal)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            Tax (10%)
                                        </span>
                                        <span className="tabular-nums">
                                            {currency(tax)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-base font-semibold">
                                        <span>Total</span>
                                        <span className="tabular-nums">
                                            {currency(total)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>

                <CardFooter className="justify-between gap-2 border-t pt-4">
                    <Button
                        variant="ghost"
                        disabled={currentStep === 0}
                        onClick={() =>
                            setCurrentStep((step) => Math.max(step - 1, 0))
                        }
                    >
                        <ArrowLeft className="size-4" /> Back
                    </Button>
                    {currentStep < steps.length - 1 ? (
                        <Button onClick={goNext}>
                            Continue <ArrowRight className="size-4" />
                        </Button>
                    ) : (
                        <Button
                            onClick={() => {
                                setCompleted(true);
                                toast.success('Quotation QT-2042 sent');
                            }}
                        >
                            <Send className="size-4" /> Send quotation
                        </Button>
                    )}
                </CardFooter>
            </Card>
        </>
    );
}
