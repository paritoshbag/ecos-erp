import { Head } from '@inertiajs/react';
import {
    Banknote,
    CalendarPlus,
    ClipboardList,
    Database,
    FilePlus2,
    Receipt,
    UserPlus,
    Users,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import {
    BarChart,
    ChartLegend,
    DonutChart,
    LineAreaChart,
    Sparkline,
} from '@/components/template/charts';
import { PageHeader } from '@/components/template/page-header';
import { StatCard } from '@/components/template/stat-card';
import { StatusBadge } from '@/components/template/status-badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import {
    activityFeed,
    cashFlowSeries,
    employees,
    expenseBreakdown,
    expenseSeries,
    formatCompactCurrency,
    monthLabels,
    reminders as reminderData,
    revenueSeries,
} from '@/lib/template-data';

const quickActions = [
    { icon: FilePlus2, label: 'New quotation' },
    { icon: Receipt, label: 'Add expense' },
    { icon: UserPlus, label: 'Add employee' },
    { icon: CalendarPlus, label: 'Schedule job' },
];

const storage = [
    { label: 'Documents', used: 128, color: 'var(--chart-1)' },
    { label: 'Media', used: 74, color: 'var(--chart-2)' },
    { label: 'Backups', used: 213, color: 'var(--chart-3)' },
];

export default function TemplateWidgets() {
    const [reminders, setReminders] = useState(reminderData);

    const storageTotal = storage.reduce((sum, item) => sum + item.used, 0);
    const storageLimit = 512;

    return (
        <>
            <Head title="Widgets" />
            <PageHeader
                title="Widget gallery"
                description="The building blocks for dashboards: KPI tiles, charts, feeds and utility widgets. Compose any dashboard from these."
            />

            {/* KPI tiles */}
            <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                    label="Monthly revenue"
                    value="$226k"
                    delta={10.8}
                    chart={<Sparkline values={revenueSeries.slice(-8)} />}
                />
                <StatCard
                    label="Active employees"
                    value="166"
                    delta={2.5}
                    icon={Users}
                />
                <StatCard
                    label="Pending approvals"
                    value="14"
                    delta={-18.2}
                    positiveIsGood={false}
                    icon={ClipboardList}
                />
                <StatCard
                    label="Overdue receivables"
                    value="$55.3k"
                    delta={6.4}
                    positiveIsGood={false}
                    icon={Banknote}
                />
            </section>

            {/* Charts */}
            <section className="grid gap-3 xl:grid-cols-2">
                <Card>
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
                                },
                            ]}
                            formatValue={(value) => `$${value}k`}
                        />
                    </CardContent>
                </Card>
            </section>

            <section className="grid gap-3 xl:grid-cols-3">
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

                {/* Activity feed */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">
                            Recent activity
                        </CardTitle>
                        <CardDescription>
                            Everything that happened across modules.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ol className="relative space-y-4 before:absolute before:inset-y-1 before:left-[5px] before:w-px before:bg-border">
                            {activityFeed.slice(0, 5).map((entry) => (
                                <li
                                    key={entry.id}
                                    className="relative flex gap-3 ps-6"
                                >
                                    <span className="absolute top-1.5 left-0 size-2.5 rounded-full border-2 border-background bg-primary" />
                                    <div className="min-w-0">
                                        <p className="text-sm leading-snug">
                                            <span className="font-medium">
                                                {entry.actor}
                                            </span>{' '}
                                            <span className="text-muted-foreground">
                                                {entry.action}
                                            </span>{' '}
                                            {entry.target}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {entry.time}
                                        </p>
                                    </div>
                                </li>
                            ))}
                        </ol>
                    </CardContent>
                </Card>

                {/* Reminders */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Reminders</CardTitle>
                        <CardDescription>
                            Due items pulled from every module.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-3">
                        {reminders.map((reminder) => (
                            <label
                                key={reminder.id}
                                className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-accent/40"
                            >
                                <Checkbox
                                    checked={reminder.done}
                                    className="mt-0.5"
                                    onCheckedChange={(checked) =>
                                        setReminders((current) =>
                                            current.map((candidate) =>
                                                candidate.id === reminder.id
                                                    ? {
                                                          ...candidate,
                                                          done:
                                                              checked === true,
                                                      }
                                                    : candidate,
                                            ),
                                        )
                                    }
                                />
                                <span className="min-w-0 flex-1">
                                    <span
                                        className={
                                            reminder.done
                                                ? 'text-sm text-muted-foreground line-through'
                                                : 'text-sm'
                                        }
                                    >
                                        {reminder.title}
                                    </span>
                                    <span className="mt-1 block">
                                        <StatusBadge
                                            variant={reminder.variant}
                                            withDot={false}
                                        >
                                            {reminder.due}
                                        </StatusBadge>
                                    </span>
                                </span>
                            </label>
                        ))}
                    </CardContent>
                </Card>
            </section>

            <section className="grid gap-3 xl:grid-cols-3">
                {/* Quick actions */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">
                            Quick actions
                        </CardTitle>
                        <CardDescription>
                            One-tap entry points for frequent tasks.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-2">
                        {quickActions.map((action) => (
                            <Button
                                key={action.label}
                                variant="outline"
                                className="h-auto flex-col gap-2 py-4"
                                onClick={() =>
                                    toast.info(
                                        `${action.label} — opens the matching form`,
                                    )
                                }
                            >
                                <action.icon className="size-5 text-primary" />
                                <span className="text-xs font-medium">
                                    {action.label}
                                </span>
                            </Button>
                        ))}
                    </CardContent>
                </Card>

                {/* Storage */}
                <Card>
                    <CardHeader className="flex-row items-start justify-between">
                        <div className="space-y-1.5">
                            <CardTitle className="text-base">
                                Storage usage
                            </CardTitle>
                            <CardDescription>
                                {storageTotal} GB of {storageLimit} GB used
                            </CardDescription>
                        </div>
                        <Database className="size-5 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <Progress value={(storageTotal / storageLimit) * 100} />
                        <div className="grid gap-2.5">
                            {storage.map((item) => (
                                <div
                                    key={item.label}
                                    className="flex items-center gap-2 text-sm"
                                >
                                    <span
                                        aria-hidden="true"
                                        className="size-2.5 rounded-full"
                                        style={{ backgroundColor: item.color }}
                                    />
                                    <span className="flex-1 text-muted-foreground">
                                        {item.label}
                                    </span>
                                    <span className="font-medium tabular-nums">
                                        {item.used} GB
                                    </span>
                                </div>
                            ))}
                        </div>
                        <Button variant="outline" size="sm">
                            Manage storage
                        </Button>
                    </CardContent>
                </Card>

                {/* Team */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Team</CardTitle>
                        <CardDescription>
                            People you work with most.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-3">
                        {employees.slice(0, 4).map((employee) => (
                            <div
                                key={employee.id}
                                className="flex items-center gap-3"
                            >
                                <Avatar className="size-9">
                                    <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                                        {employee.name
                                            .split(' ')
                                            .map((part) => part[0])
                                            .join('')}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium">
                                        {employee.name}
                                    </p>
                                    <p className="truncate text-xs text-muted-foreground">
                                        {employee.role}
                                    </p>
                                </div>
                                <StatusBadge
                                    variant={
                                        employee.status === 'active'
                                            ? 'success'
                                            : employee.status === 'on-leave'
                                              ? 'warning'
                                              : 'info'
                                    }
                                    withDot
                                >
                                    {employee.status === 'on-leave'
                                        ? 'Leave'
                                        : employee.status === 'active'
                                          ? 'Active'
                                          : 'New'}
                                </StatusBadge>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </section>
        </>
    );
}
