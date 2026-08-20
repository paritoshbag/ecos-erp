import { Form, Head, router } from '@inertiajs/react';
import {
    ChevronLeft,
    ChevronRight,
    KeyRound,
    Trash2,
    UserRoundMinus,
} from 'lucide-react';
import { useRef, useState } from 'react';
import UserAvatarController from '@/actions/App/Http/Controllers/Users/UserAvatarController';
import UserController from '@/actions/App/Http/Controllers/Users/UserController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { PageHeader } from '@/components/template/page-header';
import { StatusBadge } from '@/components/template/status-badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useInitials } from '@/hooks/use-initials';
import { cn } from '@/lib/utils';
import { index as usersIndex } from '@/routes/users';
import type { UserAccessLogEntry, UsersShowProps } from '@/types/user';

const eventLabels: Record<string, string> = {
    login: 'Signed in',
    logout: 'Signed out',
    login_failed: 'Sign-in failed',
    password_reset: 'Password reset',
    password_reset_sent: 'Reset email sent',
    'http.request': 'Request',
    'http.visit': 'Page view',
};

function eventLabel(event: string): string {
    return eventLabels[event] ?? event;
}

function formatWhen(value: string | null): string {
    if (!value) {
        return '—';
    }

    return new Date(value).toLocaleString();
}

function AccessLogRow({ log }: { log: UserAccessLogEntry }) {
    const [open, setOpen] = useState(false);
    const hasPayload =
        log.payload !== null && Object.keys(log.payload).length > 0;

    return (
        <>
            <TableRow
                className={cn(hasPayload && 'cursor-pointer')}
                onClick={() => {
                    if (hasPayload) {
                        setOpen((current) => !current);
                    }
                }}
            >
                <TableCell className="whitespace-nowrap text-muted-foreground tabular-nums">
                    {formatWhen(log.created_at)}
                </TableCell>
                <TableCell>
                    <StatusBadge variant="neutral" withDot={false}>
                        {eventLabel(log.event)}
                    </StatusBadge>
                </TableCell>
                <TableCell className="font-mono text-xs">
                    {log.method ? (
                        <span>
                            <span className="font-medium">{log.method}</span>{' '}
                            <span className="break-all text-muted-foreground">
                                {log.url ?? log.route_name ?? '—'}
                            </span>
                        </span>
                    ) : (
                        <span className="text-muted-foreground">—</span>
                    )}
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                    {log.ip_address ?? '—'}
                </TableCell>
            </TableRow>
            {open && hasPayload && (
                <TableRow>
                    <TableCell colSpan={4} className="bg-muted/40">
                        <pre className="max-h-64 overflow-auto text-xs leading-relaxed">
                            {JSON.stringify(log.payload, null, 2)}
                        </pre>
                    </TableCell>
                </TableRow>
            )}
        </>
    );
}

export default function UsersShow({ user, accessLogs }: UsersShowProps) {
    const getInitials = useInitials();
    const fileInput = useRef<HTMLInputElement>(null);

    return (
        <>
            <Head title={user.name} />
            <div className="flex flex-col gap-4">
                <PageHeader
                    title={user.name}
                    description={user.email}
                    actions={
                        <div className="flex flex-wrap items-center gap-1.5">
                            <StatusBadge
                                variant={
                                    user.role === 'superadmin'
                                        ? 'info'
                                        : 'neutral'
                                }
                                withDot={false}
                            >
                                {user.role === 'superadmin'
                                    ? 'Superadmin'
                                    : 'Member'}
                            </StatusBadge>
                            <StatusBadge
                                variant={
                                    user.is_disabled ? 'destructive' : 'success'
                                }
                            >
                                {user.is_disabled ? 'Disabled' : 'Active'}
                            </StatusBadge>
                        </div>
                    }
                />

                <div className="grid gap-4 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Profile</CardTitle>
                            <CardDescription>
                                Name and email for this account.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form
                                {...UserController.update.form(user.id)}
                                options={{ preserveScroll: true }}
                                className="space-y-4"
                            >
                                {({ processing, errors }) => (
                                    <>
                                        <div className="grid gap-2">
                                            <Label htmlFor="name">Name</Label>
                                            <Input
                                                id="name"
                                                name="name"
                                                required
                                                defaultValue={user.name}
                                                autoComplete="name"
                                            />
                                            <InputError message={errors.name} />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="email">Email</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                name="email"
                                                required
                                                defaultValue={user.email}
                                                autoComplete="email"
                                            />
                                            <InputError
                                                message={errors.email}
                                            />
                                        </div>
                                        <Button disabled={processing}>
                                            Save
                                        </Button>
                                    </>
                                )}
                            </Form>
                        </CardContent>
                    </Card>

                    <div className="flex flex-col gap-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Avatar</CardTitle>
                                <CardDescription>
                                    JPG, PNG or WebP, up to 2 MB.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex items-center gap-4">
                                <Avatar className="size-16">
                                    {user.avatar && (
                                        <AvatarImage
                                            src={user.avatar}
                                            alt={user.name}
                                        />
                                    )}
                                    <AvatarFallback className="bg-primary/15 text-base font-semibold text-primary">
                                        {getInitials(user.name)}
                                    </AvatarFallback>
                                </Avatar>
                                {user.can_upload_avatar && (
                                    <div className="flex flex-wrap gap-1.5">
                                        <input
                                            ref={fileInput}
                                            type="file"
                                            accept="image/jpeg,image/png,image/webp"
                                            className="sr-only"
                                            onChange={(event) => {
                                                const file =
                                                    event.target.files?.[0];

                                                if (!file) {
                                                    return;
                                                }

                                                router.post(
                                                    UserAvatarController.store.url(
                                                        user.id,
                                                    ),
                                                    { avatar: file },
                                                    {
                                                        forceFormData: true,
                                                        preserveScroll: true,
                                                        onFinish: () => {
                                                            event.target.value =
                                                                '';
                                                        },
                                                    },
                                                );
                                            }}
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() =>
                                                fileInput.current?.click()
                                            }
                                        >
                                            Upload
                                        </Button>
                                        {user.avatar && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() =>
                                                    router.delete(
                                                        UserAvatarController.destroy.url(
                                                            user.id,
                                                        ),
                                                        {
                                                            preserveScroll: true,
                                                        },
                                                    )
                                                }
                                            >
                                                <Trash2 className="size-4" />{' '}
                                                Remove
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Access</CardTitle>
                                <CardDescription>
                                    Disable the account or send a Fortify reset
                                    email.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="enabled">
                                            Account enabled
                                        </Label>
                                        <p className="text-xs text-muted-foreground">
                                            Disabled users cannot sign in.
                                            Active sessions are revoked.
                                        </p>
                                    </div>
                                    <Switch
                                        id="enabled"
                                        checked={!user.is_disabled}
                                        disabled={!user.can_disable}
                                        onCheckedChange={() =>
                                            router.patch(
                                                UserController.toggleDisabled.url(
                                                    user.id,
                                                ),
                                                {},
                                                { preserveScroll: true },
                                            )
                                        }
                                    />
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    disabled={!user.can_reset_password}
                                    onClick={() =>
                                        router.post(
                                            UserController.sendPasswordReset.url(
                                                user.id,
                                            ),
                                            {},
                                            { preserveScroll: true },
                                        )
                                    }
                                >
                                    <KeyRound className="size-4" /> Send
                                    password reset
                                </Button>
                                {!user.can_disable && (
                                    <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <UserRoundMinus className="size-3.5" />
                                        You cannot disable your own account.
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <Card>
                    <CardHeader className="flex flex-row items-start justify-between gap-4">
                        <div>
                            <Heading
                                variant="small"
                                title="Access log"
                                description="What this person did, when, and the sanitized payload."
                            />
                        </div>
                        <p className="text-xs text-muted-foreground tabular-nums">
                            {accessLogs.total}{' '}
                            {accessLogs.total === 1 ? 'event' : 'events'}
                        </p>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {accessLogs.data.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                No activity recorded yet.
                            </p>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>When</TableHead>
                                        <TableHead>Event</TableHead>
                                        <TableHead>Request</TableHead>
                                        <TableHead>IP</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {accessLogs.data.map((log) => (
                                        <AccessLogRow key={log.id} log={log} />
                                    ))}
                                </TableBody>
                            </Table>
                        )}

                        {accessLogs.last_page > 1 && (
                            <div className="flex items-center justify-between gap-3">
                                <p className="text-sm text-muted-foreground tabular-nums">
                                    Page {accessLogs.current_page} of{' '}
                                    {accessLogs.last_page}
                                </p>
                                <div className="flex gap-1">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="size-8"
                                        aria-label="Previous page"
                                        disabled={!accessLogs.prev_page_url}
                                        onClick={() => {
                                            if (accessLogs.prev_page_url) {
                                                router.get(
                                                    accessLogs.prev_page_url,
                                                    {},
                                                    {
                                                        preserveState: true,
                                                        only: ['accessLogs'],
                                                    },
                                                );
                                            }
                                        }}
                                    >
                                        <ChevronLeft className="size-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="size-8"
                                        aria-label="Next page"
                                        disabled={!accessLogs.next_page_url}
                                        onClick={() => {
                                            if (accessLogs.next_page_url) {
                                                router.get(
                                                    accessLogs.next_page_url,
                                                    {},
                                                    {
                                                        preserveState: true,
                                                        only: ['accessLogs'],
                                                    },
                                                );
                                            }
                                        }}
                                    >
                                        <ChevronRight className="size-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

UsersShow.layout = {
    breadcrumbs: [
        {
            title: 'Users',
            href: usersIndex(),
        },
        {
            title: 'User',
            href: usersIndex(),
        },
    ],
};
