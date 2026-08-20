export type DriveItemType = 'folder' | 'file';

export type DriveUserRef = {
    id: number;
    name: string;
    email?: string;
};

export type DriveShare = {
    id: number;
    permission: 'editor';
    user: DriveUserRef;
};

export type DrivePublicLink = {
    id: number;
    token: string;
    url: string;
    expires_at: string | null;
};

export type DriveItem = {
    id: number;
    parent_id: number | null;
    type: DriveItemType;
    name: string;
    mime_type: string | null;
    size: number | null;
    size_label: string | null;
    items_count: number | null;
    owner: DriveUserRef;
    updated_at: string | null;
    updated_at_label: string | null;
    deleted_at: string | null;
    deleted_at_label: string | null;
    is_shared: boolean;
    can_update: boolean;
    can_share: boolean;
    can_delete: boolean;
    can_restore: boolean;
    can_purge: boolean;
    can_preview: boolean;
    shares: DriveShare[];
    public_link: DrivePublicLink | null;
};

export type DriveFolderSummary = {
    id: number;
    name: string;
    type: DriveItemType;
};

export type DriveFolderOption = {
    id: number | null;
    label: string;
};

export type DriveStorage = {
    used_bytes: number;
    used_label: string;
};

export type DriveBreadcrumb = {
    title: string;
    href: string;
};

export type DriveIndexProps = {
    folder: DriveFolderSummary | null;
    breadcrumbs: DriveBreadcrumb[];
    items: DriveItem[];
    folders: DriveFolderOption[];
    storage: DriveStorage;
    can_create: boolean;
    query: string;
};

export type DriveTrashProps = {
    items: DriveItem[];
    storage: DriveStorage;
};
