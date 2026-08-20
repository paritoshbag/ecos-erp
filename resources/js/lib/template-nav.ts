import {
    Boxes,
    ClipboardList,
    Component,
    FolderOpen,
    Gauge,
    KeyRound,
    LayoutGrid,
    LayoutList,
    LockKeyhole,
    LogIn,
    Rows3,
    ShieldCheck,
    SquareKanban,
    Table2,
    UserPlus,
    Users,
    Wallet,
    Wand2,
    Workflow,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

/*
 * Navigation is a tree, not a list.
 *
 * An ERP this size outgrows a flat sidebar within the first two modules, so
 * every consumer — the sidebar, the topbar mega menu, the mobile drawer and the
 * breadcrumb trail — renders from this one recursive structure. A node with
 * `children` is a branch (never navigable itself); a node with `href` is a leaf.
 *
 * Depth is deliberately unbounded: the renderers recurse, so adding a fourth
 * level costs nothing but an extra nesting in this file.
 */

export type TemplateNavNode = {
    title: string;
    /** Present on leaves only. A node with children is a branch. */
    href?: string;
    icon?: LucideIcon;
    description?: string;
    /** Short pill rendered beside the label (counts, "New", "Beta"). */
    badge?: string;
    children?: TemplateNavNode[];
};

export type TemplateNavGroup = {
    label: string;
    /** Column heading blurb in the mega menu. */
    description: string;
    icon: LucideIcon;
    items: TemplateNavNode[];
};

export const templateNav: TemplateNavGroup[] = [
    {
        label: 'Overview',
        description: 'Where the working day starts.',
        icon: Gauge,
        items: [
            {
                title: 'Command Centre',
                href: '/template',
                icon: LayoutGrid,
                description:
                    'Every building block of the design system in one place.',
            },
            {
                title: 'Dashboards',
                icon: Gauge,
                description: 'Role-specific rollups of the whole business.',
                children: [
                    {
                        title: 'Executive',
                        href: '/template/dashboards/executive',
                        icon: Gauge,
                        description:
                            'Company-wide KPIs, revenue trend, pipeline and activity.',
                    },
                    {
                        title: 'Finance',
                        href: '/template/dashboards/finance',
                        icon: Wallet,
                        description:
                            'Cash flow, expense breakdown, invoices and quotations.',
                    },
                    {
                        title: 'HR & People',
                        href: '/template/dashboards/hr',
                        icon: Users,
                        description:
                            'Headcount, attendance, departments and leave requests.',
                    },
                ],
            },
        ],
    },
    {
        label: 'Design System',
        description: 'The parts every module is assembled from.',
        icon: Boxes,
        items: [
            {
                title: 'Foundations',
                icon: Component,
                description: 'Primitives shared by every screen.',
                children: [
                    {
                        title: 'Components',
                        href: '/template/components',
                        icon: Component,
                        description:
                            'Buttons, badges, cards, dialogs, alerts, tabs and toasts.',
                    },
                    {
                        title: 'Forms & Input',
                        icon: ClipboardList,
                        description: 'Data capture patterns end to end.',
                        children: [
                            {
                                title: 'Form Controls',
                                href: '/template/forms',
                                icon: ClipboardList,
                                description:
                                    'Inputs, selects, validation states and form layout.',
                            },
                            {
                                title: 'Multi-step Wizard',
                                href: '/template/wizard',
                                icon: Wand2,
                                description:
                                    'Stepped flow with progress, validation and review.',
                            },
                        ],
                    },
                ],
            },
            {
                title: 'Data Display',
                icon: Rows3,
                description: 'How records and figures reach the screen.',
                children: [
                    {
                        title: 'Data Tables',
                        href: '/template/tables',
                        icon: Table2,
                        description:
                            'Search, filters, sorting, selection and paging.',
                    },
                    {
                        title: 'Widgets & Charts',
                        href: '/template/widgets',
                        icon: LayoutList,
                        description:
                            'Stat cards, charts, activity feeds and quick actions.',
                    },
                ],
            },
        ],
    },
    {
        label: 'Applications',
        description: 'Working screens built from the kit.',
        icon: Workflow,
        items: [
            {
                title: 'Document Vault',
                href: '/template/files',
                icon: FolderOpen,
                description:
                    'Folder navigation, file listing, storage usage and uploads.',
            },
            {
                title: 'Job Board',
                href: '/template/tasks',
                icon: SquareKanban,
                description:
                    'Kanban board with columns, priorities, assignees and due dates.',
                badge: 'New',
            },
        ],
    },
    {
        label: 'Access Control',
        description: 'Everything before the session begins.',
        icon: ShieldCheck,
        items: [
            {
                title: 'Authentication',
                icon: LockKeyhole,
                description: 'Sign-in, onboarding and recovery screens.',
                children: [
                    {
                        title: 'Sign In',
                        href: '/template/auth/login',
                        icon: LogIn,
                        description:
                            'Branded sign-in screen with social options.',
                    },
                    {
                        title: 'Create Account',
                        href: '/template/auth/register',
                        icon: UserPlus,
                        description:
                            'Account creation with password strength meter.',
                    },
                    {
                        title: 'Reset Password',
                        href: '/template/auth/forgot-password',
                        icon: KeyRound,
                        description: 'Password reset request screen.',
                    },
                ],
            },
        ],
    },
];

/** Strip the query string and any trailing slash so hrefs compare cleanly. */
export function normalizePath(url: string): string {
    return url.split('?')[0].split('#')[0].replace(/\/+$/, '') || '/';
}

/**
 * Exact matches beat prefix matches so `/template` does not steal
 * `/template/dashboards/executive`, while `/drive` still highlights for
 * `/drive/folders/12`.
 */
function hrefMatchScore(href: string, url: string): number {
    const path = normalizePath(url);
    const target = normalizePath(href);

    if (path === target) {
        return target.length + 10_000;
    }

    if (target !== '/' && path.startsWith(`${target}/`)) {
        return target.length;
    }

    return -1;
}

/**
 * Path of nodes from a top-level item down to the leaf matching `url`.
 * Returns an empty array when nothing matches. Drives breadcrumbs, the active
 * highlight, and which sidebar branches start expanded.
 */
export function findNavTrail(
    url: string,
    nav: TemplateNavGroup[] = templateNav,
): TemplateNavNode[] {
    let best: TemplateNavNode[] | null = null;
    let bestScore = -1;

    const walk = (nodes: TemplateNavNode[], trail: TemplateNavNode[]): void => {
        for (const node of nodes) {
            const next = [...trail, node];

            if (node.href) {
                const score = hrefMatchScore(node.href, url);

                if (score > bestScore) {
                    bestScore = score;
                    best = next;
                }
            }

            if (node.children) {
                walk(node.children, next);
            }
        }
    };

    for (const group of nav) {
        walk(group.items, []);
    }

    return best ?? [];
}

/** The group a URL belongs to — the first breadcrumb segment. */
export function findNavGroup(
    url: string,
    nav: TemplateNavGroup[] = templateNav,
): TemplateNavGroup | undefined {
    const leaf = findNavTrail(url, nav).at(-1);

    if (!leaf?.href) {
        return undefined;
    }

    return nav.find((group) =>
        flattenNav(group.items).some((node) => node.href === leaf.href),
    );
}

/** Every leaf in the tree, depth-first — for search and route sanity checks. */
export function flattenNav(
    nodes: TemplateNavNode[] = templateNav.flatMap((group) => group.items),
): TemplateNavNode[] {
    return nodes.flatMap((node) =>
        node.children ? flattenNav(node.children) : [node],
    );
}

/** True when the node itself, or anything beneath it, is the best match. */
export function isBranchActive(
    node: TemplateNavNode,
    url: string,
    nav: TemplateNavGroup[] = templateNav,
): boolean {
    const leaf = findNavTrail(url, nav).at(-1);

    if (!leaf?.href) {
        return false;
    }

    return flattenNav([node]).some((item) => item.href === leaf.href);
}

/** True when this leaf is the best match for `url`. */
export function isLeafActive(
    href: string | undefined,
    url: string,
    nav: TemplateNavGroup[] = templateNav,
): boolean {
    if (!href) {
        return false;
    }

    return findNavTrail(url, nav).at(-1)?.href === href;
}

/** Leaf currently being viewed, if any. */
export function findTemplateNavItem(
    url: string,
    nav: TemplateNavGroup[] = templateNav,
): TemplateNavNode | undefined {
    return findNavTrail(url, nav).at(-1);
}
