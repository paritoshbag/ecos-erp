import { Head } from '@inertiajs/react';
import {
    CheckCircle2,
    Download,
    Eye,
    FileDown,
    MoreHorizontal,
    Pencil,
    Plus,
    Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { DataTable } from '@/components/template/data-table';
import type {
    DataTableColumn,
    DataTableFilter,
} from '@/components/template/data-table';
import { PageHeader } from '@/components/template/page-header';
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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    employees,
    employeeStatusVariant,
    formatCurrency,
    invoices,
    invoiceStatusVariant,
} from '@/lib/template-data';
import type { Invoice } from '@/lib/template-data';

const columns: DataTableColumn<Invoice>[] = [
    {
        key: 'id',
        header: 'Invoice',
        sortable: true,
        accessor: (row) => row.id,
        cell: (row) => <span className="font-medium">{row.id}</span>,
    },
    {
        key: 'client',
        header: 'Client',
        sortable: true,
        accessor: (row) => row.client,
    },
    {
        key: 'owner',
        header: 'Owner',
        accessor: (row) => row.owner,
        cell: (row) => (
            <span className="flex items-center gap-2">
                <Avatar className="size-6">
                    <AvatarFallback className="bg-primary/10 text-[10px] font-semibold text-primary">
                        {row.owner
                            .split(' ')
                            .map((part) => part[0])
                            .join('')}
                    </AvatarFallback>
                </Avatar>
                {row.owner}
            </span>
        ),
    },
    {
        key: 'dueAt',
        header: 'Due date',
        sortable: true,
        accessor: (row) => row.dueAt,
    },
    {
        key: 'amount',
        header: 'Amount',
        sortable: true,
        align: 'right',
        accessor: (row) => row.amount,
        cell: (row) => (
            <span className="font-medium tabular-nums">
                {formatCurrency(row.amount)}
            </span>
        ),
    },
    {
        key: 'status',
        header: 'Status',
        sortable: true,
        accessor: (row) => row.status,
        cell: (row) => (
            <StatusBadge variant={invoiceStatusVariant[row.status]}>
                {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
            </StatusBadge>
        ),
    },
];

const filters: DataTableFilter<Invoice>[] = [
    {
        key: 'status',
        label: 'Statuses',
        options: [
            { value: 'paid', label: 'Paid' },
            { value: 'pending', label: 'Pending' },
            { value: 'overdue', label: 'Overdue' },
            { value: 'draft', label: 'Draft' },
        ],
        match: (row, value) => row.status === value,
    },
    {
        key: 'owner',
        label: 'Owners',
        options: [...new Set(invoices.map((invoice) => invoice.owner))].map(
            (owner) => ({ value: owner, label: owner }),
        ),
        match: (row, value) => row.owner === value,
    },
];

const exportCsv = (): void => {
    const header = 'Invoice,Client,Owner,Issued,Due,Amount,Status';
    const rows = invoices.map(
        (invoice) =>
            `${invoice.id},"${invoice.client}",${invoice.owner},${invoice.issuedAt},${invoice.dueAt},${invoice.amount},${invoice.status}`,
    );
    const blob = new Blob([[header, ...rows].join('\n')], {
        type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = 'invoices.csv';
    link.click();
    URL.revokeObjectURL(url);
    toast.success('invoices.csv exported');
};

export default function TemplateTables() {
    return (
        <>
            <Head title="Tables" />
            <PageHeader
                title="Data tables"
                description="The reusable DataTable component: search across all columns, faceted filters, tri-state sorting, row selection with bulk actions, row menus and pagination."
                actions={
                    <>
                        <Button variant="outline" onClick={exportCsv}>
                            <FileDown className="size-4" /> Export CSV
                        </Button>
                        <Button
                            onClick={() =>
                                toast.info(
                                    'Hooked to the quotation wizard in the real app.',
                                )
                            }
                        >
                            <Plus className="size-4" /> New invoice
                        </Button>
                    </>
                }
            />

            <DataTable
                data={invoices}
                columns={columns}
                rowKey={(row) => row.id}
                filters={filters}
                searchPlaceholder="Search invoices…"
                selectable
                renderBulkActions={(selected, clearSelection) => (
                    <>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                                toast.success(
                                    `${selected.length} invoice(s) marked as paid`,
                                );
                                clearSelection();
                            }}
                        >
                            <CheckCircle2 className="size-4" /> Mark paid
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            className="text-destructive hover:text-destructive"
                            onClick={() => {
                                toast.error(
                                    `${selected.length} invoice(s) deleted`,
                                );
                                clearSelection();
                            }}
                        >
                            <Trash2 className="size-4" /> Delete
                        </Button>
                    </>
                )}
                renderRowActions={(row) => (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="size-8"
                                aria-label={`Actions for ${row.id}`}
                            >
                                <MoreHorizontal className="size-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem
                                onClick={() => toast.info(`Viewing ${row.id}`)}
                            >
                                <Eye className="size-4" /> View
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => toast.info(`Editing ${row.id}`)}
                            >
                                <Pencil className="size-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() =>
                                    toast.success(`${row.id}.pdf downloaded`)
                                }
                            >
                                <Download className="size-4" /> Download PDF
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                variant="destructive"
                                onClick={() => toast.error(`${row.id} deleted`)}
                            >
                                <Trash2 className="size-4" /> Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            />

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Simple table</CardTitle>
                    <CardDescription>
                        The base Table primitive without a toolbar — for small,
                        fixed datasets inside record pages.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Employee</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Department</TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {employees.slice(0, 5).map((employee) => (
                                <TableRow key={employee.id}>
                                    <TableCell className="font-medium">
                                        {employee.name}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {employee.role}
                                    </TableCell>
                                    <TableCell>{employee.department}</TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {employee.location}
                                    </TableCell>
                                    <TableCell>
                                        <StatusBadge
                                            variant={
                                                employeeStatusVariant[
                                                    employee.status
                                                ]
                                            }
                                        >
                                            {employee.status === 'on-leave'
                                                ? 'On leave'
                                                : employee.status
                                                      .charAt(0)
                                                      .toUpperCase() +
                                                  employee.status.slice(1)}
                                        </StatusBadge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </>
    );
}
