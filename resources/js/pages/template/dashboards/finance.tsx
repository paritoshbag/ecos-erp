import { Head, Link } from '@inertiajs/react';
import {
    ArrowDownLeft,
    ArrowRight,
    ArrowUpRight,
    FileDown,
    Landmark,
    Receipt,
} from 'lucide-react';
import { toast } from 'sonner';
import { BarChart, DonutChart, Sparkline } from '@/components/template/charts';
import { PageHeader } from '@/components/template/page-header';
import { StatCard } from '@/components/template/stat-card';
import { StatusBadge } from '@/components/template/status-badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
    cashFlowSeries,
    expenseBreakdown,
    formatCompactCurrency,
    monthLabels,
} from '@/lib/template-data';

const agingBuckets = [
    {
        label: 'Current',
        amount: 84200,
        share: 100,
        variant: 'success' as const,
    },
    { label: '1–30 days', amount: 36500, share: 43, variant: 'info' as const },
    {
        label: '31–60 days',
        amount: 18900,
        share: 22,
        variant: 'warning' as const,
    },
    {
        label: '60+ days',
        amount: 55350,
        share: 66,
        variant: 'destructive' as const,
    },
];

const budgets = [
    { department: 'Operations', used: 78, budget: '$120k' },
    { department: 'Sales & Marketing', used: 92, budget: '$85k' },
    { department: 'IT & Infrastructure', used: 55, budget: '$64k' },
    { department: 'Human Resources', used: 61, budget: '$38k' },
];

const claims = [
    {
        id: 'EXP-121',
        employee: 'Sam Diaz',
        purpose: 'Client site visit — Austin',
        amount: 840,
        status: 'warning' as const,
        statusLabel: 'Pending',
    },
    {
        id: 'EXP-120',
        employee: 'Dana Novak',
        purpose: 'Trade show booth materials',
        amount: 2310,
        status: 'info' as const,
        statusLabel: 'In review',
    },
    {
        id: 'EXP-119',
        employee: 'Riley Chen',
        purpose: 'Server room cooling parts',
        amount: 1275,
        status: 'success' as const,
        statusLabel: 'Approved',
    },
    {
        id: 'EXP-118',
        employee: 'Priya Nair',
        purpose: 'Audit team working lunch',
        amount: 96,
        status: 'success' as const,
        statusLabel: 'Approved',
    },
];

export default function TemplateDashboardFinance() {
    return (
        <>
            <Head title="Finance Dashboard" />
            <PageHeader
                title="Finance"
                description="Cash position, receivables and spend control for August 2026."
                actions={
                    <Button
                        variant="outline"
                        onClick={() =>
                            toast.success('finance-pack-august.xlsx generated')
                        }
                    >
                        <FileDown className="size-4" /> Month-end pack
                    </Button>
                }
            />

            <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                    label="Cash balance"
                    value="$412.6k"
                    delta={5.2}
                    icon={Landmark}
                />
                <StatCard
                    label="Receivables"
                    value="$194.9k"
                    delta={3.1}
                    positiveIsGood={false}
                    icon={ArrowDownLeft}
                />
                <StatCard
                    label="Payables"
                    value="$88.4k"
                    delta={-7.6}
                    positiveIsGood={false}
                    icon={ArrowUpRight}
                />
                <StatCard
                    label="Net cash flow"
                    value="$68k"
                    delta={28.3}
                    chart={
                        <Sparkline
                            values={cashFlowSeries.slice(-8)}
                            color="var(--chart-3)"
                        />
                    }
                />
            </section>

            <section className="grid gap-3 xl:grid-cols-3">
                <Card className="xl:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-base">
                            Net cash flow
                        </CardTitle>
                        <CardDescription>
                            Monthly net movement, in thousands USD.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <BarChart
                            labels={monthLabels}
                            series={[
                                {
                                    name: 'Net cash flow',
                                    values: cashFlowSeries,
                                    color: 'var(--chart-3)',
                                },
                            ]}
                            formatValue={(value) => `$${value}k`}
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">
                            Expense breakdown
                        </CardTitle>
                        <CardDescription>
                            August 2026 by category.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <DonutChart
                            segments={expenseBreakdown}
                            formatValue={formatCompactCurrency}
                        />
                    </CardContent>
                </Card>
            </section>

            <section className="grid gap-3 xl:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">
                            Receivables aging
                        </CardTitle>
                        <CardDescription>
                            Outstanding invoices by age bucket.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        {agingBuckets.map((bucket) => (
                            <div key={bucket.label} className="space-y-1.5">
                                <div className="flex items-center justify-between gap-2">
                                    <StatusBadge
                                        variant={bucket.variant}
                                        withDot
                                    >
                                        {bucket.label}
                                    </StatusBadge>
                                    <span className="text-sm font-medium tabular-nums">
                                        {formatCompactCurrency(bucket.amount)}
                                    </span>
                                </div>
                                <Progress
                                    value={bucket.share}
                                    className="h-1.5"
                                />
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">
                            Budget vs actual
                        </CardTitle>
                        <CardDescription>
                            Departmental spend against Q3 budgets.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        {budgets.map((budget) => (
                            <div
                                key={budget.department}
                                className="space-y-1.5"
                            >
                                <div className="flex items-baseline justify-between gap-2 text-sm">
                                    <span>{budget.department}</span>
                                    <span
                                        className={
                                            budget.used > 90
                                                ? 'font-medium text-destructive tabular-nums'
                                                : 'text-muted-foreground tabular-nums'
                                        }
                                    >
                                        {budget.used}% of {budget.budget}
                                    </span>
                                </div>
                                <Progress
                                    value={budget.used}
                                    className="h-1.5"
                                    indicatorClassName={
                                        budget.used > 90
                                            ? 'bg-destructive'
                                            : budget.used > 75
                                              ? 'bg-warning'
                                              : undefined
                                    }
                                />
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex-row items-center justify-between">
                        <div className="space-y-1.5">
                            <CardTitle className="text-base">
                                Expense claims
                            </CardTitle>
                            <CardDescription>
                                Latest submissions.
                            </CardDescription>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/template/tables">
                                All
                                <ArrowRight className="size-4" />
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent className="grid gap-3">
                        {claims.map((claim) => (
                            <div
                                key={claim.id}
                                className="flex items-start gap-3 rounded-lg border p-3"
                            >
                                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                                    <Receipt className="size-4.5" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-baseline justify-between gap-2">
                                        <p className="truncate text-sm font-medium">
                                            {claim.employee}
                                        </p>
                                        <span className="text-sm font-medium tabular-nums">
                                            ${claim.amount.toLocaleString()}
                                        </span>
                                    </div>
                                    <p className="truncate text-xs text-muted-foreground">
                                        {claim.id} · {claim.purpose}
                                    </p>
                                    <StatusBadge
                                        variant={claim.status}
                                        className="mt-1.5"
                                    >
                                        {claim.statusLabel}
                                    </StatusBadge>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </section>
        </>
    );
}
