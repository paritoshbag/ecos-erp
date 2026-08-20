import {
    ClipboardList,
    Code2,
    FolderOpen,
    Gauge,
    HardDrive,
    LayoutGrid,
    LockKeyhole,
    Palette,
    Settings,
    Trash2,
    UserRound,
    Users,
} from 'lucide-react';
import type { TemplateNavGroup } from '@/lib/template-nav';
import { dashboard } from '@/routes';
import { edit as editAppearance } from '@/routes/appearance';
import { index as developerIndex } from '@/routes/developer';
import { index as driveIndex, trash as driveTrash } from '@/routes/drive';
import { edit as editProfile } from '@/routes/profile';
import { index as purchaseOrdersIndex } from '@/routes/purchase-orders';
import { edit as editSecurity } from '@/routes/security';
import { index as usersIndex } from '@/routes/users';

/*
 * Production navigation tree. Same shape as the /template playground so the
 * shared chrome (rail, mega menu, breadcrumbs) can render either without
 * forking. Organization settings stay in the nested settings layout — they are
 * superadmin-only and do not belong on every account's sidebar.
 */
export const appNav: TemplateNavGroup[] = [
    {
        label: 'Overview',
        description: 'Where the working day starts.',
        icon: Gauge,
        items: [
            {
                title: 'Dashboard',
                href: dashboard.url(),
                icon: LayoutGrid,
                description: 'Workspace home for the modules in use today.',
            },
        ],
    },
    {
        label: 'Operations',
        description: 'Jobs, buying and the company filing cabinet.',
        icon: ClipboardList,
        items: [
            {
                title: 'Purchase orders',
                href: purchaseOrdersIndex.url(),
                icon: ClipboardList,
                description: 'Company purchase order register.',
            },
            {
                title: 'Drive',
                icon: HardDrive,
                description: 'Company documents, folders and trash.',
                children: [
                    {
                        title: 'Company drive',
                        href: driveIndex.url(),
                        icon: FolderOpen,
                        description: 'Browse, upload and share files.',
                    },
                    {
                        title: 'Trash',
                        href: driveTrash.url(),
                        icon: Trash2,
                        description: 'Restore or permanently delete items.',
                    },
                ],
            },
        ],
    },
    {
        label: 'Account',
        description: 'Profile, security and how the workspace looks.',
        icon: Settings,
        items: [
            {
                title: 'Settings',
                icon: Settings,
                description: 'Your account and workspace preferences.',
                children: [
                    {
                        title: 'Profile',
                        href: editProfile.url(),
                        icon: UserRound,
                        description: 'Name, email and profile photo.',
                    },
                    {
                        title: 'Security',
                        href: editSecurity.url(),
                        icon: LockKeyhole,
                        description: 'Password, passkeys and two-factor auth.',
                    },
                    {
                        title: 'Appearance',
                        href: editAppearance.url(),
                        icon: Palette,
                        description: 'Light, dark or system color scheme.',
                    },
                ],
            },
        ],
    },
];

export const administrationNav: TemplateNavGroup = {
    label: 'Administration',
    description: 'People who can sign in to this workspace.',
    icon: Users,
    items: [
        {
            title: 'Users',
            href: usersIndex.url(),
            icon: Users,
            description: 'Create accounts, disable access and review activity.',
        },
    ],
};

export const developerNav: TemplateNavGroup = {
    label: 'Developer',
    description: 'Seed and wipe working data.',
    icon: Code2,
    items: [
        {
            title: 'Developer',
            href: developerIndex.url(),
            icon: Code2,
            description: 'Seed or delete purchase order data.',
        },
    ],
};

export function appNavFor(
    role?: 'member' | 'superadmin' | null,
): TemplateNavGroup[] {
    if (role === 'superadmin') {
        const accountIndex = appNav.findIndex(
            (group) => group.label === 'Account',
        );
        const before =
            accountIndex === -1 ? appNav : appNav.slice(0, accountIndex);
        const after = accountIndex === -1 ? [] : appNav.slice(accountIndex);

        return [...before, administrationNav, ...after, developerNav];
    }

    return appNav;
}

export const appHomeHref = dashboard.url();
