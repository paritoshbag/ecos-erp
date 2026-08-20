import { Head } from '@inertiajs/react';
import {
    BriefcaseBusiness,
    Cake,
    Check,
    UserMinus,
    UserPlus,
    Users,
    X,
} from 'lucide-react';
import { toast } from 'sonner';
import {
    ChartLegend,
    DonutChart,
    LineAreaChart,
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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    attendanceSeries,
    departmentHeadcount,
    employees,
    monthLabels,
} from '@/lib/template-data';

const leaveRequests = [
    {
        id: 1,
        name: 'Marcus Webb',
        type: 'Annual leave',
        dates: 'Aug 25 – Aug 29',
        days: 5,
    },
    { id: 2, name: 'Ines Farah', type: 'Sick leave', dates: 'Aug 18', days: 1 },
    {
        id: 3,
        name: 'Riley Chen',
        type: 'Remote work',
        dates: 'Sep 01 – Sep 05',
        days: 5,
    },
];

const celebrations = [
    { icon: Cake, name: 'Priya Nair', event: 'Birthday', date: 'Aug 21' },
    {
        icon: BriefcaseBusiness,
        name: 'Jordan Kim',
        event: '6 years at ECOS',
        date: 'Aug 24',
    },
    { icon: Cake, name: 'Sam Diaz', event: 'Birthday', date: 'Sep 02' },
];

const initials = (name: string): string =>
    name
        .split(' ')
        .map((part) => part[0])
        .join('');

export default function TemplateDashboardHr() {
    return (
        <>
            <Head title="HR Dashboard" />
            <PageHeader
                title="HR & people"
                description="Workforce health, attendance and requests for August 2026."
                actions={
                    <Button
                        onClick={() =>
                            toast.info(
                                'Opens the employee form in the real app',
                            )
                        }
                    >
                        <UserPlus className="size-4" /> Add employee
                    </Button>
                }
            />

            <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                    label="Headcount"
                    value="166"
                    delta={2.5}
                    icon={Users}
                />
                <StatCard
                    label="New hires (Q3)"
                    value="8"
                    delta={14.3}
                    icon={UserPlus}
                />
                <StatCard
                    label="Attrition rate"
                    value="2.3%"
                    delta={-0.6}
                    positiveIsGood={false}
                    icon={UserMinus}
                />
                <StatCard
                    label="Open positions"
                    value="12"
                    icon={BriefcaseBusiness}
                />
            </section>

            <section className="grid gap-3 xl:grid-cols-3">
                <Card className="xl:col-span-2">
                    <CardHeader className="flex-row items-start justify-between gap-2">
                        <div className="space-y-1.5">
                            <CardTitle className="text-base">
                                Attendance rate
                            </CardTitle>
                            <CardDescription>
                                Monthly average attendance, trailing 12 months.
                            </CardDescription>
                        </div>
                        <ChartLegend
                            items={[
                                {
                                    name: 'Attendance %',
                                    color: 'var(--chart-1)',
                                },
                            ]}
                        />
                    </CardHeader>
                    <CardContent>
                        <LineAreaChart
                            labels={monthLabels}
                            series={[
                                {
                                    name: 'Attendance',
                                    values: attendanceSeries,
                                },
                            ]}
                            formatValue={(value) => `${Math.round(value)}%`}
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">
                            Headcount by department
                        </CardTitle>
                        <CardDescription>
                            166 people across 5 teams.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <DonutChart
                            segments={departmentHeadcount}
                            centerLabel="People"
                        />
                    </CardContent>
                </Card>
            </section>

            <section className="grid gap-3 xl:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">
                            Leave requests
                        </CardTitle>
                        <CardDescription>
                            Waiting for your approval.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-3">
                        {leaveRequests.map((request) => (
                            <div
                                key={request.id}
                                className="flex items-start gap-3 rounded-lg border p-3"
                            >
                                <Avatar className="size-9">
                                    <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                                        {initials(request.name)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium">
                                        {request.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {request.type} · {request.dates} (
                                        {request.days}d)
                                    </p>
                                    <div className="mt-2 flex gap-1.5">
                                        <Button
                                            size="sm"
                                            className="h-7 px-2.5"
                                            onClick={() =>
                                                toast.success(
                                                    `${request.name}'s leave approved`,
                                                )
                                            }
                                        >
                                            <Check className="size-3.5" />
                                            Approve
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="h-7 px-2.5"
                                            onClick={() =>
                                                toast.error(
                                                    `${request.name}'s leave declined`,
                                                )
                                            }
                                        >
                                            <X className="size-3.5" />
                                            Decline
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card className="xl:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-base">
                            Recent joiners
                        </CardTitle>
                        <CardDescription>
                            People who joined in the last 12 months.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Employee</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Department</TableHead>
                                    <TableHead>Joined</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {employees
                                    .filter(
                                        (employee) =>
                                            employee.joinedAt >= '2024-01-01',
                                    )
                                    .map((employee) => (
                                        <TableRow key={employee.id}>
                                            <TableCell>
                                                <span className="flex items-center gap-2 font-medium">
                                                    <Avatar className="size-7">
                                                        <AvatarFallback className="bg-primary/10 text-[10px] font-semibold text-primary">
                                                            {initials(
                                                                employee.name,
                                                            )}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    {employee.name}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {employee.role}
                                            </TableCell>
                                            <TableCell>
                                                {employee.department}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {employee.joinedAt}
                                            </TableCell>
                                            <TableCell>
                                                <StatusBadge
                                                    variant={
                                                        employee.status ===
                                                        'probation'
                                                            ? 'info'
                                                            : 'success'
                                                    }
                                                >
                                                    {employee.status ===
                                                    'probation'
                                                        ? 'Probation'
                                                        : 'Active'}
                                                </StatusBadge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                            </TableBody>
                        </Table>

                        <div className="mt-4 grid gap-2 border-t pt-4 sm:grid-cols-3">
                            {celebrations.map((celebration) => (
                                <div
                                    key={celebration.name + celebration.event}
                                    className="flex items-center gap-2.5 rounded-lg border p-2.5"
                                >
                                    <celebration.icon className="size-4 shrink-0 text-primary" />
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-medium">
                                            {celebration.name}
                                        </p>
                                        <p className="truncate text-xs text-muted-foreground">
                                            {celebration.event} ·{' '}
                                            {celebration.date}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </section>
        </>
    );
}
