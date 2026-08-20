import { Head } from '@inertiajs/react';
import {
    Archive,
    ArrowUpRight,
    BellRing,
    CheckCircle2,
    ChevronDown,
    CloudUpload,
    Copy,
    Download,
    Inbox,
    Info,
    MoreHorizontal,
    Pencil,
    Plus,
    Search,
    Settings2,
    ShieldAlert,
    Trash2,
    TriangleAlert,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { toast } from 'sonner';
import { EmptyState } from '@/components/template/empty-state';
import { PageHeader } from '@/components/template/page-header';
import { StatusBadge } from '@/components/template/status-badge';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Progress } from '@/components/ui/progress';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';

function Section({
    id,
    title,
    description,
    children,
}: {
    id: string;
    title: string;
    description: string;
    children: ReactNode;
}) {
    return (
        <section id={id} className="scroll-mt-20 space-y-3">
            <div>
                <h2 className="text-lg font-semibold">{title}</h2>
                <p className="text-sm text-muted-foreground">{description}</p>
            </div>
            {children}
        </section>
    );
}

function Swatch({ label, children }: { label: string; children: ReactNode }) {
    return (
        <div className="space-y-2 rounded-lg border bg-card p-4">
            <p className="text-xs font-medium text-muted-foreground uppercase">
                {label}
            </p>
            <div className="flex flex-wrap items-center gap-2">{children}</div>
        </div>
    );
}

export default function TemplateComponents() {
    return (
        <>
            <Head title="Components" />
            <PageHeader
                title="Component gallery"
                description="Every base component of the design system with its variants and states. All of them adapt to brand theme and dark mode automatically."
            />

            <Section
                id="buttons"
                title="Buttons"
                description="Six variants, four sizes, icon and loading states."
            >
                <div className="grid gap-3 lg:grid-cols-2">
                    <Swatch label="Variants">
                        <Button>Primary</Button>
                        <Button variant="secondary">Secondary</Button>
                        <Button variant="outline">Outline</Button>
                        <Button variant="ghost">Ghost</Button>
                        <Button variant="link">Link</Button>
                        <Button variant="destructive">Destructive</Button>
                    </Swatch>
                    <Swatch label="Sizes">
                        <Button size="lg">Large</Button>
                        <Button>Default</Button>
                        <Button size="sm">Small</Button>
                        <Button size="icon" aria-label="Settings">
                            <Settings2 />
                        </Button>
                    </Swatch>
                    <Swatch label="With icons">
                        <Button>
                            <Plus /> New quotation
                        </Button>
                        <Button variant="outline">
                            <Download /> Export
                        </Button>
                        <Button variant="secondary">
                            Open report <ArrowUpRight />
                        </Button>
                    </Swatch>
                    <Swatch label="States">
                        <Button disabled>Disabled</Button>
                        <Button disabled>
                            <Spinner /> Saving…
                        </Button>
                        <Button variant="outline" disabled>
                            <Spinner /> Loading
                        </Button>
                    </Swatch>
                </div>
            </Section>

            <Section
                id="badges"
                title="Badges & status"
                description="Generic badges plus semantic status pills used across invoices, jobs, tasks and approvals."
            >
                <div className="grid gap-3 lg:grid-cols-2">
                    <Swatch label="Badges">
                        <Badge>Default</Badge>
                        <Badge variant="secondary">Secondary</Badge>
                        <Badge variant="outline">Outline</Badge>
                        <Badge variant="destructive">Destructive</Badge>
                    </Swatch>
                    <Swatch label="Status pills">
                        <StatusBadge variant="success">Approved</StatusBadge>
                        <StatusBadge variant="warning">Pending</StatusBadge>
                        <StatusBadge variant="info">In review</StatusBadge>
                        <StatusBadge variant="destructive">Overdue</StatusBadge>
                        <StatusBadge variant="neutral">Draft</StatusBadge>
                    </Swatch>
                </div>
            </Section>

            <Section
                id="alerts"
                title="Alerts"
                description="Inline messages for context, confirmation and failure."
            >
                <div className="grid gap-3 lg:grid-cols-2">
                    <Alert>
                        <Info className="size-4" />
                        <AlertTitle>Scheduled maintenance</AlertTitle>
                        <AlertDescription>
                            Reporting will be unavailable on Sunday between
                            02:00 and 04:00 UTC.
                        </AlertDescription>
                    </Alert>
                    <Alert variant="destructive">
                        <ShieldAlert className="size-4" />
                        <AlertTitle>Payment failed</AlertTitle>
                        <AlertDescription>
                            The bank rejected transfer #8841. Verify the account
                            details and retry.
                        </AlertDescription>
                    </Alert>
                    <Alert className="border-success/30 text-success [&>svg]:text-success">
                        <CheckCircle2 className="size-4" />
                        <AlertTitle>Quotation approved</AlertTitle>
                        <AlertDescription>
                            QT-2041 was approved by finance and sent to the
                            client.
                        </AlertDescription>
                    </Alert>
                    <Alert className="border-warning/50 text-warning-foreground dark:text-warning [&>svg]:text-warning">
                        <TriangleAlert className="size-4" />
                        <AlertTitle>Budget threshold reached</AlertTitle>
                        <AlertDescription>
                            The marketing department has used 92% of its Q3
                            budget.
                        </AlertDescription>
                    </Alert>
                </div>
            </Section>

            <Section
                id="cards"
                title="Cards"
                description="The base container for widgets, records and settings panels."
            >
                <div className="grid gap-3 lg:grid-cols-3">
                    <Card>
                        <CardHeader>
                            <CardTitle>Simple card</CardTitle>
                            <CardDescription>
                                Title, description and content area.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground">
                            Cards keep a consistent radius, border and shadow
                            across the whole system.
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex-row items-start justify-between">
                            <div className="space-y-1.5">
                                <CardTitle>With actions</CardTitle>
                                <CardDescription>
                                    Header row with a menu.
                                </CardDescription>
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="-mt-1.5 size-8"
                                        aria-label="Card actions"
                                    >
                                        <MoreHorizontal className="size-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem>
                                        <Pencil className="size-4" /> Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <Copy className="size-4" /> Duplicate
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem variant="destructive">
                                        <Trash2 className="size-4" /> Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground">
                            Used for records that support quick actions without
                            leaving the list.
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>With footer</CardTitle>
                            <CardDescription>
                                Content plus a bordered action row.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground">
                            Footers hold primary/secondary actions for the card
                            content.
                        </CardContent>
                        <CardFooter className="gap-2 border-t pt-4">
                            <Button size="sm">Save</Button>
                            <Button size="sm" variant="ghost">
                                Cancel
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </Section>

            <Section
                id="tabs"
                title="Tabs & accordion"
                description="Progressive disclosure for dense record pages."
            >
                <div className="grid gap-3 lg:grid-cols-2">
                    <Card>
                        <CardContent>
                            <Tabs defaultValue="overview">
                                <TabsList>
                                    <TabsTrigger value="overview">
                                        Overview
                                    </TabsTrigger>
                                    <TabsTrigger value="activity">
                                        Activity
                                    </TabsTrigger>
                                    <TabsTrigger value="files">
                                        Files
                                    </TabsTrigger>
                                </TabsList>
                                <TabsContent
                                    value="overview"
                                    className="pt-3 text-sm text-muted-foreground"
                                >
                                    Record overview: key fields, related
                                    parties, current status and totals.
                                </TabsContent>
                                <TabsContent
                                    value="activity"
                                    className="pt-3 text-sm text-muted-foreground"
                                >
                                    Timeline of changes, comments and
                                    system-generated events.
                                </TabsContent>
                                <TabsContent
                                    value="files"
                                    className="pt-3 text-sm text-muted-foreground"
                                >
                                    Attachments linked to this record with
                                    preview and download.
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent>
                            <Accordion
                                type="single"
                                collapsible
                                defaultValue="item-1"
                            >
                                <AccordionItem value="item-1">
                                    <AccordionTrigger>
                                        What is workflow automation?
                                    </AccordionTrigger>
                                    <AccordionContent className="text-muted-foreground">
                                        Rules that move records between states
                                        automatically — approvals, reminders,
                                        notifications and scheduled jobs.
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="item-2">
                                    <AccordionTrigger>
                                        Who can approve expenses?
                                    </AccordionTrigger>
                                    <AccordionContent className="text-muted-foreground">
                                        Users with the “Finance approver” role,
                                        or any manager within the submitter's
                                        department hierarchy.
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="item-3">
                                    <AccordionTrigger>
                                        Can reports be scheduled?
                                    </AccordionTrigger>
                                    <AccordionContent className="text-muted-foreground">
                                        Yes — any saved report can be emailed
                                        daily, weekly or monthly to a
                                        distribution list.
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </CardContent>
                    </Card>
                </div>
            </Section>

            <Section
                id="overlays"
                title="Overlays"
                description="Dialogs for confirmation, sheets for side panels, popovers and tooltips for context."
            >
                <Swatch label="Try them">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline">Open dialog</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Archive record?</DialogTitle>
                                <DialogDescription>
                                    Archived records are hidden from lists but
                                    kept for reporting. You can restore them at
                                    any time.
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="ghost">Cancel</Button>
                                </DialogClose>
                                <DialogClose asChild>
                                    <Button
                                        onClick={() =>
                                            toast.success('Record archived')
                                        }
                                    >
                                        <Archive className="size-4" />
                                        Archive
                                    </Button>
                                </DialogClose>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="outline">Open sheet</Button>
                        </SheetTrigger>
                        <SheetContent className="sm:max-w-md">
                            <SheetHeader>
                                <SheetTitle>Quick edit</SheetTitle>
                                <SheetDescription>
                                    Side sheets keep the list visible while
                                    editing a record.
                                </SheetDescription>
                            </SheetHeader>
                            <div className="grid gap-4 px-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="sheet-name">Name</Label>
                                    <Input
                                        id="sheet-name"
                                        defaultValue="Acme Industries Ltd."
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="sheet-email">Email</Label>
                                    <Input
                                        id="sheet-email"
                                        type="email"
                                        defaultValue="accounts@acme.test"
                                    />
                                </div>
                            </div>
                            <SheetFooter>
                                <Button onClick={() => toast.success('Saved')}>
                                    Save changes
                                </Button>
                            </SheetFooter>
                        </SheetContent>
                    </Sheet>

                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline">
                                Open popover
                                <ChevronDown className="size-4" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-64">
                            <p className="text-sm font-medium">
                                Column visibility
                            </p>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Popovers hold light-weight settings that don't
                                deserve a dialog.
                            </p>
                        </PopoverContent>
                    </Popover>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="outline">Hover me</Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            Tooltips label icon-only actions.
                        </TooltipContent>
                    </Tooltip>
                </Swatch>
            </Section>

            <Section
                id="feedback"
                title="Feedback"
                description="Toasts, progress, skeletons and empty states."
            >
                <div className="grid gap-3 lg:grid-cols-2">
                    <Swatch label="Toasts">
                        <Button
                            variant="outline"
                            onClick={() => toast.success('Invoice sent')}
                        >
                            Success
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() =>
                                toast.info('Sync scheduled for tonight')
                            }
                        >
                            Info
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() =>
                                toast.warning('Approaching storage limit')
                            }
                        >
                            Warning
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => toast.error('Export failed')}
                        >
                            Error
                        </Button>
                    </Swatch>
                    <Swatch label="Progress & loading">
                        <div className="w-full space-y-3">
                            <Progress value={65} />
                            <div className="flex items-center gap-3">
                                <Spinner className="size-5" />
                                <span className="text-sm text-muted-foreground">
                                    Generating report…
                                </span>
                            </div>
                        </div>
                    </Swatch>
                    <Swatch label="Skeletons">
                        <div className="w-full space-y-2">
                            <div className="flex items-center gap-3">
                                <Skeleton className="size-10 rounded-full" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-3 w-2/5" />
                                    <Skeleton className="h-3 w-3/5" />
                                </div>
                            </div>
                            <Skeleton className="h-24 w-full" />
                        </div>
                    </Swatch>
                    <EmptyState
                        icon={Inbox}
                        title="No quotations yet"
                        description="Create your first quotation to start tracking the sales pipeline."
                        action={
                            <Button size="sm">
                                <Plus className="size-4" /> New quotation
                            </Button>
                        }
                    />
                </div>
            </Section>

            <Section
                id="misc"
                title="Avatars & search"
                description="People representation and inline search."
            >
                <div className="grid gap-3 lg:grid-cols-2">
                    <Swatch label="Avatars">
                        <div className="flex -space-x-2">
                            {['AM', 'JK', 'Rt', 'SD'].map((initials) => (
                                <Avatar
                                    key={initials}
                                    className="size-9 border-2 border-background"
                                >
                                    <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                                        {initials.toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                            ))}
                            <Avatar className="size-9 border-2 border-background">
                                <AvatarFallback className="bg-muted text-xs font-medium text-muted-foreground">
                                    +8
                                </AvatarFallback>
                            </Avatar>
                        </div>
                    </Swatch>
                    <Swatch label="Search input">
                        <div className="relative w-full max-w-sm">
                            <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search employees…"
                                className="pl-8"
                            />
                        </div>
                    </Swatch>
                </div>
            </Section>

            <Section
                id="notifications"
                title="Notification pattern"
                description="A compact feed row used in the topbar dropdown and the reminders widget."
            >
                <Card className="max-w-xl">
                    <CardContent className="divide-y">
                        {[
                            {
                                icon: BellRing,
                                tone: 'text-info',
                                title: 'Reminder: submit August expense claims',
                                time: 'Today, 09:00',
                            },
                            {
                                icon: CheckCircle2,
                                tone: 'text-success',
                                title: 'Payroll run #34 completed successfully',
                                time: 'Yesterday, 18:12',
                            },
                            {
                                icon: CloudUpload,
                                tone: 'text-muted-foreground',
                                title: 'Nightly backup uploaded (2.1 GB)',
                                time: 'Yesterday, 02:00',
                            },
                        ].map((item) => (
                            <div
                                key={item.title}
                                className="flex items-start gap-3 py-3 first:pt-0 last:pb-0"
                            >
                                <item.icon
                                    className={`mt-0.5 size-4 shrink-0 ${item.tone}`}
                                />
                                <div className="grid gap-0.5">
                                    <span className="text-sm leading-snug">
                                        {item.title}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        {item.time}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </Section>
        </>
    );
}
