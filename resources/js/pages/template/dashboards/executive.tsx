import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    Briefcase,
    FileDown,
    FileText,
    TrendingUp,
} from 'lucide-react';
import { toast } from 'sonner';
import {
    ChartLegend,
    LineAreaChart,
    Sparkline,
} from '@/components/template/charts';
import { PageHeader } from '@/components/template/page-header';
import { StatCard } from '@/components/template/stat-card';
import { StatusBadge } from '@/components/template/status-badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    activityFeed,
    expenseSeries,
    formatCurrency,
    invoices,
    invoiceStatusVariant,
    monthLabels,
    revenueSeries,
} from '@/lib/template-data';

const pipeline = [
    { stage: 'Qualified leads', value: 48, amount: '$412k' },
    { stage: 'Quotation sent', value: 31, amount: '$268k' },
    { stage: 'Negotiation', value: 17, amount: '$196k' },
    { stage: 'Won this quarter', value: 12, amount: '$154k' },
];

const topClients = [
    { name: 'Tundra Mining', revenue: 40100, share: 88 },
    { name: 'Kestrel Aviation', revenue: 32400, share: 71 },
    { name: 'Summit Logistics', revenue: 27300, share: 60 },
    { name: 'Pinnacle Sports', revenue: 22100, share: 49 },
    { name: 'Cobalt Freight', revenue: 21600, share: 47 },
];

export default function TemplateDashboardExecutive() {
    return (
        <>
            <Head title="Executive Dashboard" />
            <PageHeader
                title="Executive overview"
                description="Company-wide performance at a glance — Monday, August 17, 2026."
                actions={
                    <>
                        <Select defaultValue="12m">
                            <SelectTrigger className="w-36">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="30d">
                                    Last 30 days
                                </SelectItem>
                                <SelectItem value="90d">
                                    Last quarter
                                </SelectItem>
                                <SelectItem value="12m">
                                    Last 12 months
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        <Button
                            variant="outline"
                            onClick={() =>
                                toast.success('executive-report.pdf generated')
                            }
                        >
                            <FileDown className="size-4" /> Export
                        </Button>
                    </>
                }
            />

            <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                    label="Total revenue (YTD)"
                    value="$1.86M"
                    delta={12.4}
                    chart={<Sparkline values={revenueSeries.slice(-8)} />}
                />
                <StatCard
                    label="Gross margin"
                    value="38.2%"
                    delta={1.8}
                    icon={TrendingUp}
                />
                <StatCard
                    label="Open quotations"
                    value="23"
                    delta={9.5}
                    icon={FileText}
                />
                <StatCard
                    label="Jobs completed"
                    value="148"
                    delta={4.2}
                    icon={Briefcase}
                />
            </section>

            <section className="grid gap-3 xl:grid-cols-3">
                <Card className="xl:col-span-2">
                    <CardHeader className="flex-row items-start justify-between gap-2">
                        <div className="space-y-1.5">
                            <CardTitle className="text-base">
                                Revenue vs expenses
                            </CardTitle>
                            <CardDescription>
                                Trailing 12 months, in thousands USD.
                            </CardDescription>
                        </div>
                        <ChartLegend
                            items={[
                                { name: 'Revenue', color: 'var(--chart-1)' },
                                { name: 'Expenses', color: 'var(--chart-2)' },
                            ]}
                        />
                    </CardHeader>
                    <CardContent>
                        <LineAreaChart
                            labels={monthLabels}
                            series={[
                                { name: 'Revenue', values: revenueSeries },
                                { name: 'Expenses', values: expenseSeries },
                            ]}
                            formatValue={(value) => `$${value}k`}
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">
                            Sales pipeline
                        </CardTitle>
                        <CardDescription>
                            Open opportunities by stage.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        {pipeline.map((stage) => (
                            <div key={stage.stage} className="space-y-1.5">
                                <div className="flex items-baseline justify-between gap-2 text-sm">
                                    <span>{stage.stage}</span>
                                    <span className="text-muted-foreground tabular-nums">
                                        {stage.value} · {stage.amount}
                                    </span>
                                </div>
                                <Progress
                                    value={
                                        (stage.value / pipeline[0].value) * 100
                                    }
                                    className="h-1.5"
                                />
                            </div>
                        ))}
                    </CardContent>
                    <CardFooter>
                        <Button variant="outline" size="sm" className="w-full">
                            Open CRM board
                            <ArrowRight className="size-4" />
                        </Button>
                    </CardFooter>
                </Card>
            </section>

            <section className="grid gap-3 xl:grid-cols-3">
                <Card className="xl:col-span-2">
                    <CardHeader className="flex-row items-center justify-between">
                        <div className="space-y-1.5">
                            <CardTitle className="text-base">
                                Recent invoices
                            </CardTitle>
                            <CardDescription>
                                Latest five across all clients.
                            </CardDescription>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/template/tables">
                                View all
                                <ArrowRight className="size-4" />
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Invoice</TableHead>
                                    <TableHead>Client</TableHead>
                                    <TableHead>Due</TableHead>
                                    <TableHead className="text-right">
                                        Amount
                                    </TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {invoices
                                    .slice(-5)
                                    .reverse()
                                    .map((invoice) => (
                                        <TableRow key={invoice.id}>
                                            <TableCell className="font-medium">
                                                {invoice.id}
                                            </TableCell>
                                            <TableCell>
                                                {invoice.client}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {invoice.dueAt}
                                            </TableCell>
                                            <TableCell className="text-right font-medium tabular-nums">
                                                {formatCurrency(invoice.amount)}
                                            </TableCell>
                                            <TableCell>
                                                <StatusBadge
                                                    variant={
                                                        invoiceStatusVariant[
                                                            invoice.status
                                                        ]
                                                    }
                                                >
                                                    {invoice.status
                                                        .charAt(0)
                                                        .toUpperCase() +
                                                        invoice.status.slice(1)}
                                                </StatusBadge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <div className="grid gap-3">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">
                                Top clients
                            </CardTitle>
                            <CardDescription>
                                By revenue this quarter.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-3">
                            {topClients.map((client) => (
                                <div
                                    key={client.name}
                                    className="flex items-center gap-3"
                                >
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-baseline justify-between gap-2">
                                            <p className="truncate text-sm">
                                                {client.name}
                                            </p>
                                            <span className="text-sm font-medium tabular-nums">
                                                {formatCurrency(client.revenue)}
                                            </span>
                                        </div>
                                        <Progress
                                            value={client.share}
                                            className="mt-1.5 h-1"
                                        />
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">
                                Latest activity
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-3">
                            {activityFeed.slice(0, 3).map((entry) => (
                                <p
                                    key={entry.id}
                                    className="text-sm leading-snug"
                                >
                                    <span className="font-medium">
                                        {entry.actor}
                                    </span>{' '}
                                    <span className="text-muted-foreground">
                                        {entry.action}
                                    </span>{' '}
                                    {entry.target}
                                    <span className="block text-xs text-muted-foreground">
                                        {entry.time}
                                    </span>
                                </p>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </section>
        </>
    );
}
