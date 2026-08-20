export type UserRole = 'member' | 'superadmin';

export type ManagedUser = {
    id: number;
    name: string;
    email: string;
    avatar: string | null;
    role: UserRole;
    is_disabled: boolean;
    email_verified_at: string | null;
    created_at: string | null;
    updated_at: string | null;
};

export type ManagedUserListItem = ManagedUser & {
    can_disable: boolean;
    can_reset_password: boolean;
};

export type ManagedUserShow = ManagedUser & {
    can_disable: boolean;
    can_reset_password: boolean;
    can_upload_avatar: boolean;
};

export type UserAccessLogEntry = {
    id: number;
    event: string;
    method: string | null;
    url: string | null;
    route_name: string | null;
    ip_address: string | null;
    user_agent: string | null;
    payload: Record<string, unknown> | null;
    created_at: string | null;
};

export type PaginatedAccessLogs = {
    data: UserAccessLogEntry[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    prev_page_url: string | null;
    next_page_url: string | null;
};

export type UsersIndexProps = {
    users: ManagedUserListItem[];
};

export type UsersCreateProps = {
    passwordRules: string;
};

export type UsersShowProps = {
    user: ManagedUserShow;
    accessLogs: PaginatedAccessLogs;
};
