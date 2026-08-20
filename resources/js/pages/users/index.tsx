import { Head, Link, router } from '@inertiajs/react';
import {
    Eye,
    KeyRound,
    MoreHorizontal,
    UserPlus,
    UserRoundCheck,
    UserRoundMinus,
} from 'lucide-react';
import UserController from '@/actions/App/Http/Controllers/Users/UserController';
import { DataTable } from '@/components/template/data-table';
import type {
    DataTableColumn,
    DataTableFilter,
} from '@/components/template/data-table';
import { PageHeader } from '@/components/template/page-header';
import { StatusBadge } from '@/components/template/status-badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useInitials } from '@/hooks/use-initials';
import { create, index as usersIndex, show } from '@/routes/users';
import type { ManagedUserListItem, UsersIndexProps } from '@/types/user';

const roleLabels: Record<ManagedUserListItem['role'], string> = {
    superadmin: 'Superadmin',
    member: 'Member',
};

const columns: DataTableColumn<ManagedUserListItem>[] = [
    {
        key: 'name',
        header: 'Name',
        sortable: true,
        accessor: (row) => row.name,
        cell: (row) => <UserNameCell user={row} />,
    },
    {
        key: 'email',
        header: 'Email',
        sortable: true,
        accessor: (row) => row.email,
        cell: (row) => (
            <span className="text-muted-foreground">{row.email}</span>
        ),
    },
    {
        key: 'role',
        header: 'Role',
        sortable: true,
        accessor: (row) => row.role,
        cell: (row) => (
            <StatusBadge
                variant={row.role === 'superadmin' ? 'info' : 'neutral'}
                withDot={false}
            >
                {roleLabels[row.role]}
            </StatusBadge>
        ),
    },
    {
        key: 'status',
        header: 'Status',
        sortable: true,
        accessor: (row) => (row.is_disabled ? 'disabled' : 'active'),
        cell: (row) => (
            <StatusBadge variant={row.is_disabled ? 'destructive' : 'success'}>
                {row.is_disabled ? 'Disabled' : 'Active'}
            </StatusBadge>
        ),
    },
    {
        key: 'created_at',
        header: 'Created',
        sortable: true,
        accessor: (row) => row.created_at ?? '',
        cell: (row) => (
            <span className="text-muted-foreground tabular-nums">
                {row.created_at
                    ? new Date(row.created_at).toLocaleDateString()
                    : '—'}
            </span>
        ),
    },
];

const filters: DataTableFilter<ManagedUserListItem>[] = [
    {
        key: 'status',
        label: 'Status',
        options: [
            { value: 'active', label: 'Active' },
            { value: 'disabled', label: 'Disabled' },
        ],
        match: (row, value) =>
            value === 'disabled' ? row.is_disabled : !row.is_disabled,
    },
    {
        key: 'role',
        label: 'Role',
        options: [
            { value: 'superadmin', label: 'Superadmin' },
            { value: 'member', label: 'Member' },
        ],
        match: (row, value) => row.role === value,
    },
];

function UserNameCell({ user }: { user: ManagedUserListItem }) {
    const getInitials = useInitials();

    return (
        <Link
            href={show(user.id)}
            className="flex items-center gap-2.5 font-medium hover:underline"
        >
            <Avatar className="size-7">
                {user.avatar && (
                    <AvatarImage src={user.avatar} alt={user.name} />
                )}
                <AvatarFallback className="bg-primary/15 text-2xs font-semibold text-primary">
                    {getInitials(user.name)}
                </AvatarFallback>
            </Avatar>
            {user.name}
        </Link>
    );
}

function UserRowActions({ user }: { user: ManagedUserListItem }) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    aria-label={`Actions for ${user.name}`}
                >
                    <MoreHorizontal className="size-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                    <Link href={show(user.id)}>
                        <Eye className="size-4" /> View
                    </Link>
                </DropdownMenuItem>
                {user.can_reset_password && (
                    <DropdownMenuItem
                        onClick={() =>
                            router.post(
                                UserController.sendPasswordReset.url(user.id),
                                {},
                                { preserveScroll: true },
                            )
                        }
                    >
                        <KeyRound className="size-4" /> Send password reset
                    </DropdownMenuItem>
                )}
                {user.can_disable && (
                    <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            variant={
                                user.is_disabled ? 'default' : 'destructive'
                            }
                            onClick={() =>
                                router.patch(
                                    UserController.toggleDisabled.url(user.id),
                                    {},
                                    { preserveScroll: true },
                                )
                            }
                        >
                            {user.is_disabled ? (
                                <>
                                    <UserRoundCheck className="size-4" /> Enable
                                </>
                            ) : (
                                <>
                                    <UserRoundMinus className="size-4" />{' '}
                                    Disable
                                </>
                            )}
                        </DropdownMenuItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export default function UsersIndex({ users }: UsersIndexProps) {
    return (
        <>
            <Head title="Users" />
            <div className="flex flex-col gap-4">
                <PageHeader
                    title="Users"
                    description="Create accounts, disable access, and review what people did in the workspace."
                    actions={
                        <Button asChild>
                            <Link href={create()}>
                                <UserPlus className="size-4" /> Create user
                            </Link>
                        </Button>
                    }
                />
                <DataTable
                    data={users}
                    columns={columns}
                    rowKey={(row) => String(row.id)}
                    filters={filters}
                    searchPlaceholder="Search name or email…"
                    pageSizeOptions={[25, 50, 100]}
                    renderRowActions={(row) => <UserRowActions user={row} />}
                />
            </div>
        </>
    );
}

UsersIndex.layout = {
    breadcrumbs: [
        {
            title: 'Users',
            href: usersIndex(),
        },
    ],
};
