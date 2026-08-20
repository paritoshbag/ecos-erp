import { Head } from '@inertiajs/react';
import {
    Banknote,
    CalendarDays,
    CloudUpload,
    FileSpreadsheet,
    FileText,
    Mail,
    Phone,
    Search,
    X,
} from 'lucide-react';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { toast } from 'sonner';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { PageHeader } from '@/components/template/page-header';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

function Section({
    title,
    description,
    children,
}: {
    title: string;
    description: string;
    children: ReactNode;
}) {
    return (
        <section className="space-y-3">
            <div>
                <h2 className="text-lg font-semibold">{title}</h2>
                <p className="text-sm text-muted-foreground">{description}</p>
            </div>
            {children}
        </section>
    );
}

const uploadedFiles = [
    {
        icon: FileSpreadsheet,
        name: 'august-payroll.xlsx',
        size: '1.2 MB',
        progress: 100,
    },
    {
        icon: FileText,
        name: 'vendor-contract-draft.pdf',
        size: '4.8 MB',
        progress: 62,
    },
];

export default function TemplateForms() {
    const [notes, setNotes] = useState('');
    const [approvalLimit, setApprovalLimit] = useState([2500]);

    return (
        <>
            <Head title="Forms" />
            <PageHeader
                title="Form patterns"
                description="Every input type with its states, plus the standard layout for record forms: sectioned cards, a two-column grid and a sticky action bar."
            />

            <Section
                title="Text inputs"
                description="Base fields with icons, prefixes, hints and validation states."
            >
                <Card>
                    <CardContent className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="grid gap-2">
                            <Label htmlFor="f-name">Full name</Label>
                            <Input id="f-name" placeholder="Jane Cooper" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="f-email">Email</Label>
                            <div className="relative">
                                <Mail className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    id="f-email"
                                    type="email"
                                    placeholder="jane@company.com"
                                    className="pl-8"
                                />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="f-phone">Phone</Label>
                            <div className="relative">
                                <Phone className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    id="f-phone"
                                    type="tel"
                                    placeholder="+1 555 000 1234"
                                    className="pl-8"
                                />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="f-amount">Amount</Label>
                            <div className="relative">
                                <Banknote className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    id="f-amount"
                                    inputMode="decimal"
                                    placeholder="0.00"
                                    className="pr-12 pl-8 text-right tabular-nums"
                                />
                                <span className="absolute top-1/2 right-3 -translate-y-1/2 text-sm text-muted-foreground">
                                    USD
                                </span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Net amount before tax.
                            </p>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="f-password">Password</Label>
                            <PasswordInput
                                id="f-password"
                                placeholder="••••••••"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="f-search">Search</Label>
                            <div className="relative">
                                <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    id="f-search"
                                    type="search"
                                    placeholder="Search records…"
                                    className="pl-8"
                                />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="f-disabled">Disabled</Label>
                            <Input
                                id="f-disabled"
                                disabled
                                value="Locked by workflow"
                                readOnly
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="f-error">
                                Tax ID{' '}
                                <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="f-error"
                                aria-invalid="true"
                                defaultValue="12-34"
                            />
                            <InputError message="Tax ID must be 9 digits." />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="f-date">Start date</Label>
                            <div className="relative">
                                <CalendarDays className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    id="f-date"
                                    type="date"
                                    className="pl-8"
                                    defaultValue="2026-08-17"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </Section>

            <Section
                title="Selection controls"
                description="Selects, radios, checkboxes, switches and sliders."
            >
                <div className="grid gap-3 lg:grid-cols-2">
                    <Card>
                        <CardContent className="grid gap-5">
                            <div className="grid gap-2">
                                <Label>Department</Label>
                                <Select defaultValue="finance">
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select a department" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="finance">
                                            Finance
                                        </SelectItem>
                                        <SelectItem value="hr">
                                            Human Resources
                                        </SelectItem>
                                        <SelectItem value="ops">
                                            Operations
                                        </SelectItem>
                                        <SelectItem value="it">
                                            Information Technology
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="f-notes">
                                    Notes
                                    <span className="ml-auto text-xs font-normal text-muted-foreground">
                                        {notes.length}/200
                                    </span>
                                </Label>
                                <Textarea
                                    id="f-notes"
                                    placeholder="Internal remarks visible to the finance team only…"
                                    maxLength={200}
                                    value={notes}
                                    onChange={(event) =>
                                        setNotes(event.target.value)
                                    }
                                />
                            </div>
                            <div className="grid gap-3">
                                <Label>
                                    Auto-approval limit
                                    <span className="ml-auto font-mono text-xs font-normal text-muted-foreground tabular-nums">
                                        ${approvalLimit[0].toLocaleString()}
                                    </span>
                                </Label>
                                <Slider
                                    value={approvalLimit}
                                    onValueChange={setApprovalLimit}
                                    min={0}
                                    max={10000}
                                    step={250}
                                />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="grid gap-6">
                            <div className="grid gap-3">
                                <Label>Payment terms</Label>
                                <RadioGroup
                                    defaultValue="net30"
                                    className="grid gap-2 sm:grid-cols-3"
                                >
                                    {[
                                        { value: 'net15', label: 'Net 15' },
                                        { value: 'net30', label: 'Net 30' },
                                        { value: 'net60', label: 'Net 60' },
                                    ].map((option) => (
                                        <Label
                                            key={option.value}
                                            className="flex cursor-pointer items-center gap-2 rounded-lg border p-3 font-normal transition-colors has-data-[state=checked]:border-primary has-data-[state=checked]:bg-accent"
                                        >
                                            <RadioGroupItem
                                                value={option.value}
                                            />
                                            {option.label}
                                        </Label>
                                    ))}
                                </RadioGroup>
                            </div>
                            <div className="grid gap-3">
                                <Label>Notify via</Label>
                                <div className="flex flex-wrap gap-x-6 gap-y-2">
                                    {['Email', 'SMS', 'In-app'].map(
                                        (channel, index) => (
                                            <Label
                                                key={channel}
                                                className="flex items-center gap-2 font-normal"
                                            >
                                                <Checkbox
                                                    defaultChecked={index !== 1}
                                                />
                                                {channel}
                                            </Label>
                                        ),
                                    )}
                                </div>
                            </div>
                            <Separator />
                            <div className="grid gap-4">
                                {[
                                    {
                                        title: 'Require two-step approval',
                                        description:
                                            'Expenses above the limit need a second approver.',
                                        checked: true,
                                    },
                                    {
                                        title: 'Send weekly digest',
                                        description:
                                            'Summary of pending items every Monday morning.',
                                        checked: false,
                                    },
                                ].map((setting) => (
                                    <div
                                        key={setting.title}
                                        className="flex items-start justify-between gap-4"
                                    >
                                        <div className="space-y-0.5">
                                            <p className="text-sm font-medium">
                                                {setting.title}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {setting.description}
                                            </p>
                                        </div>
                                        <Switch
                                            defaultChecked={setting.checked}
                                        />
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </Section>

            <Section
                title="File upload"
                description="Drop zone with an upload queue and per-file progress."
            >
                <Card>
                    <CardContent className="grid gap-4 lg:grid-cols-2">
                        <button
                            type="button"
                            onClick={() =>
                                toast.info(
                                    'Design preview — uploads are wired up with the backend later.',
                                )
                            }
                            className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-8 text-center transition-colors hover:border-primary/50 hover:bg-accent/40"
                        >
                            <div className="flex size-11 items-center justify-center rounded-full bg-accent text-accent-foreground">
                                <CloudUpload className="size-5" />
                            </div>
                            <p className="text-sm font-medium">
                                Drag files here or click to browse
                            </p>
                            <p className="text-xs text-muted-foreground">
                                PDF, XLSX, PNG up to 25 MB
                            </p>
                        </button>
                        <div className="grid content-start gap-3">
                            {uploadedFiles.map((file) => (
                                <div
                                    key={file.name}
                                    className="flex items-center gap-3 rounded-lg border p-3"
                                >
                                    <file.icon className="size-5 shrink-0 text-muted-foreground" />
                                    <div className="min-w-0 flex-1 space-y-1.5">
                                        <div className="flex items-baseline justify-between gap-2">
                                            <p className="truncate text-sm font-medium">
                                                {file.name}
                                            </p>
                                            <span className="text-xs text-muted-foreground">
                                                {file.size}
                                            </span>
                                        </div>
                                        <Progress
                                            value={file.progress}
                                            className="h-1"
                                        />
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="size-7"
                                        aria-label={`Remove ${file.name}`}
                                    >
                                        <X className="size-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </Section>

            <Section
                title="Record form layout"
                description="The standard pattern for create/edit screens: sectioned fields, responsive two-column grid, sticky action bar."
            >
                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        toast.success('Employee record saved');
                    }}
                >
                    <Card>
                        <CardHeader>
                            <CardTitle>New employee</CardTitle>
                            <CardDescription>
                                Personal details, employment and compensation in
                                one sectioned form.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-6">
                            <fieldset className="grid gap-4">
                                <legend className="mb-1 text-sm font-semibold">
                                    Personal
                                </legend>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="e-first">
                                            First name{' '}
                                            <span className="text-destructive">
                                                *
                                            </span>
                                        </Label>
                                        <Input
                                            id="e-first"
                                            placeholder="Jane"
                                            required
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="e-last">
                                            Last name{' '}
                                            <span className="text-destructive">
                                                *
                                            </span>
                                        </Label>
                                        <Input
                                            id="e-last"
                                            placeholder="Cooper"
                                            required
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="e-mail">
                                            Work email
                                        </Label>
                                        <Input
                                            id="e-mail"
                                            type="email"
                                            placeholder="jane.cooper@company.com"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="e-dob">
                                            Date of birth
                                        </Label>
                                        <Input id="e-dob" type="date" />
                                    </div>
                                </div>
                            </fieldset>
                            <Separator />
                            <fieldset className="grid gap-4">
                                <legend className="mb-1 text-sm font-semibold">
                                    Employment
                                </legend>
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    <div className="grid gap-2">
                                        <Label>Department</Label>
                                        <Select>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select…" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="finance">
                                                    Finance
                                                </SelectItem>
                                                <SelectItem value="hr">
                                                    Human Resources
                                                </SelectItem>
                                                <SelectItem value="ops">
                                                    Operations
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="e-title">
                                            Job title
                                        </Label>
                                        <Input
                                            id="e-title"
                                            placeholder="Senior Accountant"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="e-start">
                                            Start date
                                        </Label>
                                        <Input id="e-start" type="date" />
                                    </div>
                                </div>
                            </fieldset>
                        </CardContent>
                        <CardFooter className="sticky bottom-0 justify-end gap-2 rounded-b-xl border-t bg-card/95 py-4 backdrop-blur">
                            <Button type="button" variant="ghost">
                                Cancel
                            </Button>
                            <Button type="button" variant="outline">
                                Save as draft
                            </Button>
                            <Button type="submit">Save employee</Button>
                        </CardFooter>
                    </Card>
                </form>
            </Section>
        </>
    );
}
