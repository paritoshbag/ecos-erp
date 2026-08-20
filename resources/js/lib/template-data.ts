import type { StatusVariant } from '@/components/template/status-badge';

/*
 * Static demo data for the /template pages. Shaped like the future API
 * responses so pages can later swap this module for real Inertia props.
 */

export type Invoice = {
    id: string;
    client: string;
    amount: number;
    status: 'paid' | 'pending' | 'overdue' | 'draft';
    issuedAt: string;
    dueAt: string;
    owner: string;
};

export const invoiceStatusVariant: Record<Invoice['status'], StatusVariant> = {
    paid: 'success',
    pending: 'warning',
    overdue: 'destructive',
    draft: 'neutral',
};

export const invoices: Invoice[] = [
    {
        id: 'INV-2041',
        client: 'Acme Industries',
        amount: 12850,
        status: 'paid',
        issuedAt: '2026-07-02',
        dueAt: '2026-08-01',
        owner: 'Alex Morgan',
    },
    {
        id: 'INV-2042',
        client: 'Borealis Labs',
        amount: 4300,
        status: 'pending',
        issuedAt: '2026-07-05',
        dueAt: '2026-08-04',
        owner: 'Priya Nair',
    },
    {
        id: 'INV-2043',
        client: 'Cobalt Freight',
        amount: 21600,
        status: 'overdue',
        issuedAt: '2026-06-11',
        dueAt: '2026-07-11',
        owner: 'Alex Morgan',
    },
    {
        id: 'INV-2044',
        client: 'Dune Hospitality',
        amount: 7920,
        status: 'paid',
        issuedAt: '2026-07-09',
        dueAt: '2026-08-08',
        owner: 'Sam Diaz',
    },
    {
        id: 'INV-2045',
        client: 'Everest Retail',
        amount: 15400,
        status: 'pending',
        issuedAt: '2026-07-12',
        dueAt: '2026-08-11',
        owner: 'Priya Nair',
    },
    {
        id: 'INV-2046',
        client: 'Fjord Analytics',
        amount: 2680,
        status: 'draft',
        issuedAt: '2026-07-15',
        dueAt: '2026-08-14',
        owner: 'Jordan Kim',
    },
    {
        id: 'INV-2047',
        client: 'Golden Gate Media',
        amount: 9860,
        status: 'paid',
        issuedAt: '2026-07-16',
        dueAt: '2026-08-15',
        owner: 'Sam Diaz',
    },
    {
        id: 'INV-2048',
        client: 'Harbor & Sons',
        amount: 18750,
        status: 'overdue',
        issuedAt: '2026-06-18',
        dueAt: '2026-07-18',
        owner: 'Alex Morgan',
    },
    {
        id: 'INV-2049',
        client: 'Ionic Software',
        amount: 5340,
        status: 'pending',
        issuedAt: '2026-07-20',
        dueAt: '2026-08-19',
        owner: 'Jordan Kim',
    },
    {
        id: 'INV-2050',
        client: 'Juniper Clinics',
        amount: 11200,
        status: 'paid',
        issuedAt: '2026-07-21',
        dueAt: '2026-08-20',
        owner: 'Priya Nair',
    },
    {
        id: 'INV-2051',
        client: 'Kestrel Aviation',
        amount: 32400,
        status: 'pending',
        issuedAt: '2026-07-24',
        dueAt: '2026-08-23',
        owner: 'Alex Morgan',
    },
    {
        id: 'INV-2052',
        client: 'Lumen Energy',
        amount: 8150,
        status: 'draft',
        issuedAt: '2026-07-26',
        dueAt: '2026-08-25',
        owner: 'Sam Diaz',
    },
    {
        id: 'INV-2053',
        client: 'Meridian Foods',
        amount: 6480,
        status: 'paid',
        issuedAt: '2026-07-28',
        dueAt: '2026-08-27',
        owner: 'Jordan Kim',
    },
    {
        id: 'INV-2054',
        client: 'Northwind Traders',
        amount: 14980,
        status: 'overdue',
        issuedAt: '2026-06-29',
        dueAt: '2026-07-29',
        owner: 'Priya Nair',
    },
    {
        id: 'INV-2055',
        client: 'Orchid Interiors',
        amount: 3720,
        status: 'pending',
        issuedAt: '2026-08-01',
        dueAt: '2026-08-31',
        owner: 'Sam Diaz',
    },
    {
        id: 'INV-2056',
        client: 'Pinnacle Sports',
        amount: 22100,
        status: 'paid',
        issuedAt: '2026-08-03',
        dueAt: '2026-09-02',
        owner: 'Alex Morgan',
    },
    {
        id: 'INV-2057',
        client: 'Quantum Print',
        amount: 1980,
        status: 'draft',
        issuedAt: '2026-08-05',
        dueAt: '2026-09-04',
        owner: 'Jordan Kim',
    },
    {
        id: 'INV-2058',
        client: 'Riverstone Legal',
        amount: 16700,
        status: 'pending',
        issuedAt: '2026-08-07',
        dueAt: '2026-09-06',
        owner: 'Priya Nair',
    },
    {
        id: 'INV-2059',
        client: 'Summit Logistics',
        amount: 27300,
        status: 'paid',
        issuedAt: '2026-08-09',
        dueAt: '2026-09-08',
        owner: 'Alex Morgan',
    },
    {
        id: 'INV-2060',
        client: 'Tundra Mining',
        amount: 40100,
        status: 'pending',
        issuedAt: '2026-08-12',
        dueAt: '2026-09-11',
        owner: 'Sam Diaz',
    },
];

export type Employee = {
    id: string;
    name: string;
    role: string;
    department: 'Finance' | 'HR' | 'Operations' | 'IT' | 'Sales';
    status: 'active' | 'on-leave' | 'probation';
    location: string;
    joinedAt: string;
};

export const employeeStatusVariant: Record<Employee['status'], StatusVariant> =
    {
        active: 'success',
        'on-leave': 'warning',
        probation: 'info',
    };

export const employees: Employee[] = [
    {
        id: 'EMP-001',
        name: 'Alex Morgan',
        role: 'Finance Director',
        department: 'Finance',
        status: 'active',
        location: 'New York',
        joinedAt: '2021-03-15',
    },
    {
        id: 'EMP-002',
        name: 'Priya Nair',
        role: 'Senior Accountant',
        department: 'Finance',
        status: 'active',
        location: 'Chicago',
        joinedAt: '2022-06-01',
    },
    {
        id: 'EMP-003',
        name: 'Jordan Kim',
        role: 'HR Manager',
        department: 'HR',
        status: 'on-leave',
        location: 'Remote',
        joinedAt: '2020-11-09',
    },
    {
        id: 'EMP-004',
        name: 'Sam Diaz',
        role: 'Operations Lead',
        department: 'Operations',
        status: 'active',
        location: 'Austin',
        joinedAt: '2023-01-23',
    },
    {
        id: 'EMP-005',
        name: 'Riley Chen',
        role: 'Systems Engineer',
        department: 'IT',
        status: 'active',
        location: 'Seattle',
        joinedAt: '2022-09-12',
    },
    {
        id: 'EMP-006',
        name: 'Dana Novak',
        role: 'Sales Executive',
        department: 'Sales',
        status: 'probation',
        location: 'Boston',
        joinedAt: '2026-06-16',
    },
    {
        id: 'EMP-007',
        name: 'Marcus Webb',
        role: 'Payroll Specialist',
        department: 'Finance',
        status: 'active',
        location: 'Chicago',
        joinedAt: '2024-04-02',
    },
    {
        id: 'EMP-008',
        name: 'Ines Farah',
        role: 'Recruiter',
        department: 'HR',
        status: 'active',
        location: 'Remote',
        joinedAt: '2023-08-28',
    },
];

/* Chart series ------------------------------------------------------------ */

export const monthLabels = [
    'Sep',
    'Oct',
    'Nov',
    'Dec',
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
];

export const revenueSeries = [
    148, 162, 155, 171, 158, 176, 189, 183, 197, 210, 204, 226,
];

export const expenseSeries = [
    112, 118, 121, 133, 117, 126, 131, 138, 142, 149, 151, 158,
];

export const cashFlowSeries = [36, 44, 34, 38, 41, 50, 58, 45, 55, 61, 53, 68];

export const expenseBreakdown = [
    { label: 'Salaries', value: 86_400 },
    { label: 'Facilities', value: 24_800 },
    { label: 'Software', value: 18_300 },
    { label: 'Travel', value: 9_600 },
    { label: 'Other', value: 6_100 },
];

export const departmentHeadcount = [
    { label: 'Operations', value: 64 },
    { label: 'Sales', value: 41 },
    { label: 'Finance', value: 27 },
    { label: 'IT', value: 22 },
    { label: 'HR', value: 12 },
];

export const attendanceSeries = [
    92, 95, 91, 96, 94, 89, 93, 95, 97, 94, 96, 95,
];

/* Feeds ------------------------------------------------------------------- */

export type ActivityEntry = {
    id: number;
    actor: string;
    action: string;
    target: string;
    time: string;
};

export const activityFeed: ActivityEntry[] = [
    {
        id: 1,
        actor: 'Priya Nair',
        action: 'approved',
        target: 'Expense claim EXP-118',
        time: '8 min ago',
    },
    {
        id: 2,
        actor: 'Automation',
        action: 'sent reminder for',
        target: 'Invoice INV-2048',
        time: '32 min ago',
    },
    {
        id: 3,
        actor: 'Sam Diaz',
        action: 'created',
        target: 'Quotation QT-2043',
        time: '1 hr ago',
    },
    {
        id: 4,
        actor: 'Jordan Kim',
        action: 'onboarded',
        target: 'Dana Novak (Sales)',
        time: '3 hrs ago',
    },
    {
        id: 5,
        actor: 'Riley Chen',
        action: 'completed job',
        target: 'Nightly data backup',
        time: '6 hrs ago',
    },
    {
        id: 6,
        actor: 'Alex Morgan',
        action: 'published',
        target: 'Q3 budget report',
        time: 'Yesterday',
    },
];

export type Reminder = {
    id: number;
    title: string;
    due: string;
    done: boolean;
    variant: StatusVariant;
};

export const reminders: Reminder[] = [
    {
        id: 1,
        title: 'Chase payment for INV-2043',
        due: 'Today, 15:00',
        done: false,
        variant: 'destructive',
    },
    {
        id: 2,
        title: 'Review August expense claims',
        due: 'Tomorrow, 10:00',
        done: false,
        variant: 'warning',
    },
    {
        id: 3,
        title: 'Renew vendor contract — CloudHost',
        due: 'Fri, 22 Aug',
        done: false,
        variant: 'info',
    },
    {
        id: 4,
        title: 'Submit VAT return draft',
        due: 'Mon, 25 Aug',
        done: true,
        variant: 'success',
    },
];

/* Kanban ------------------------------------------------------------------ */

export type KanbanTask = {
    id: string;
    title: string;
    tag: string;
    priority: 'high' | 'medium' | 'low';
    assignees: string[];
    due: string;
    comments: number;
};

export type KanbanColumn = {
    id: string;
    title: string;
    tasks: KanbanTask[];
};

export const kanbanColumns: KanbanColumn[] = [
    {
        id: 'todo',
        title: 'To do',
        tasks: [
            {
                id: 'T-101',
                title: 'Draft Q4 hiring plan',
                tag: 'HR',
                priority: 'medium',
                assignees: ['JK', 'IF'],
                due: 'Aug 26',
                comments: 3,
            },
            {
                id: 'T-102',
                title: 'Collect missing receipts for July',
                tag: 'Finance',
                priority: 'high',
                assignees: ['PN'],
                due: 'Aug 20',
                comments: 5,
            },
            {
                id: 'T-103',
                title: 'Vendor comparison — fleet insurance',
                tag: 'Ops',
                priority: 'low',
                assignees: ['SD'],
                due: 'Sep 02',
                comments: 0,
            },
        ],
    },
    {
        id: 'progress',
        title: 'In progress',
        tasks: [
            {
                id: 'T-097',
                title: 'Q3 audit preparation',
                tag: 'Finance',
                priority: 'high',
                assignees: ['AM', 'PN'],
                due: 'Aug 22',
                comments: 12,
            },
            {
                id: 'T-099',
                title: 'Migrate payroll to new bank API',
                tag: 'IT',
                priority: 'medium',
                assignees: ['RC'],
                due: 'Aug 29',
                comments: 7,
            },
        ],
    },
    {
        id: 'review',
        title: 'In review',
        tasks: [
            {
                id: 'T-094',
                title: 'Travel policy update',
                tag: 'HR',
                priority: 'medium',
                assignees: ['JK'],
                due: 'Aug 19',
                comments: 4,
            },
            {
                id: 'T-095',
                title: 'Warehouse safety checklist',
                tag: 'Ops',
                priority: 'high',
                assignees: ['SD', 'AM'],
                due: 'Aug 18',
                comments: 2,
            },
        ],
    },
    {
        id: 'done',
        title: 'Done',
        tasks: [
            {
                id: 'T-090',
                title: 'July payroll run',
                tag: 'Finance',
                priority: 'high',
                assignees: ['MW'],
                due: 'Aug 01',
                comments: 1,
            },
            {
                id: 'T-091',
                title: 'Onboard Dana Novak',
                tag: 'HR',
                priority: 'medium',
                assignees: ['IF'],
                due: 'Aug 12',
                comments: 6,
            },
            {
                id: 'T-092',
                title: 'CRM data cleanup',
                tag: 'Sales',
                priority: 'low',
                assignees: ['DN'],
                due: 'Aug 10',
                comments: 0,
            },
        ],
    },
];

/* Files ------------------------------------------------------------------- */

export type FileEntry = {
    id: number;
    name: string;
    type: 'folder' | 'pdf' | 'xlsx' | 'docx' | 'image' | 'zip';
    size: string | null;
    items?: number;
    modifiedAt: string;
    owner: string;
    shared: boolean;
};

export const fileEntries: FileEntry[] = [
    {
        id: 1,
        name: 'Contracts',
        type: 'folder',
        size: null,
        items: 48,
        modifiedAt: 'Aug 14, 2026',
        owner: 'Alex Morgan',
        shared: true,
    },
    {
        id: 2,
        name: 'Invoices 2026',
        type: 'folder',
        size: null,
        items: 214,
        modifiedAt: 'Aug 16, 2026',
        owner: 'Priya Nair',
        shared: true,
    },
    {
        id: 3,
        name: 'HR Policies',
        type: 'folder',
        size: null,
        items: 17,
        modifiedAt: 'Jul 30, 2026',
        owner: 'Jordan Kim',
        shared: false,
    },
    {
        id: 4,
        name: 'Q3-budget-final.xlsx',
        type: 'xlsx',
        size: '2.4 MB',
        modifiedAt: 'Aug 15, 2026',
        owner: 'Alex Morgan',
        shared: true,
    },
    {
        id: 5,
        name: 'vendor-contract-cloudhost.pdf',
        type: 'pdf',
        size: '5.1 MB',
        modifiedAt: 'Aug 13, 2026',
        owner: 'Sam Diaz',
        shared: false,
    },
    {
        id: 6,
        name: 'audit-checklist-2026.docx',
        type: 'docx',
        size: '860 KB',
        modifiedAt: 'Aug 11, 2026',
        owner: 'Priya Nair',
        shared: true,
    },
    {
        id: 7,
        name: 'office-floorplan.png',
        type: 'image',
        size: '3.8 MB',
        modifiedAt: 'Aug 05, 2026',
        owner: 'Sam Diaz',
        shared: false,
    },
    {
        id: 8,
        name: 'backup-2026-08.zip',
        type: 'zip',
        size: '1.9 GB',
        modifiedAt: 'Aug 02, 2026',
        owner: 'Automation',
        shared: false,
    },
];

/* Formatters -------------------------------------------------------------- */

export const formatCurrency = (value: number): string =>
    value.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
    });

export const formatCompactCurrency = (value: number): string =>
    `$${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
