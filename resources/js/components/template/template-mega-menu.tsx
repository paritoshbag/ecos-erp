import { Link } from '@inertiajs/react';
import { ArrowUpRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { useChrome } from '@/hooks/use-chrome';
import type { TemplateNavGroup, TemplateNavNode } from '@/lib/template-nav';
import { isBranchActive, isLeafActive } from '@/lib/template-nav';
import { cn } from '@/lib/utils';

/*
 * Jumbo (mega) menu — the topbar navigation mode.
 *
 * One trigger per navigation group; the panel below it lays every branch out
 * as a column so the whole module is visible in a single pass instead of the
 * three hovers a cascading dropdown would cost. Renders from the same tree as
 * the sidebar, so the two modes can never drift apart.
 *
 * Desktop only — below `lg` the topbar swaps to the drawer.
 */

function LeafLink({ node, url }: { node: TemplateNavNode; url: string }) {
    const { nav } = useChrome();
    const active = isLeafActive(node.href, url, nav);

    return (
        <NavigationMenuLink asChild>
            <Link
                href={node.href!}
                prefetch
                className={cn(
                    'group/leaf flex items-start gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-accent',
                    active && 'bg-accent',
                )}
            >
                {node.icon && (
                    <node.icon
                        className={cn(
                            'mt-0.5 size-4 shrink-0',
                            active
                                ? 'text-primary'
                                : 'text-muted-foreground group-hover/leaf:text-foreground',
                        )}
                    />
                )}
                <span className="min-w-0">
                    <span className="flex items-center gap-1.5 text-sm leading-tight font-medium">
                        {node.title}
                        {node.badge && (
                            <Badge
                                variant="secondary"
                                className="h-4 px-1 text-2xs font-semibold"
                            >
                                {node.badge}
                            </Badge>
                        )}
                    </span>
                    {node.description && (
                        <span className="mt-0.5 block text-2xs leading-snug text-muted-foreground">
                            {node.description}
                        </span>
                    )}
                </span>
            </Link>
        </NavigationMenuLink>
    );
}

/* A column: a branch heading plus its leaves, recursing for deeper branches. */
function MenuColumn({
    node,
    url,
    nested = false,
}: {
    node: TemplateNavNode;
    url: string;
    nested?: boolean;
}) {
    if (!node.children?.length) {
        return <LeafLink node={node} url={url} />;
    }

    return (
        <div className={cn('min-w-0', nested && 'mt-1 ml-2 border-l pl-2')}>
            <p className="flex items-center gap-1.5 px-2 pt-1 pb-1 text-2xs font-semibold tracking-[0.08em] text-muted-foreground uppercase">
                {node.icon && !nested && <node.icon className="size-3.5" />}
                {node.title}
            </p>
            <div className="grid">
                {node.children.map((child) => (
                    <MenuColumn
                        key={child.href ?? child.title}
                        node={child}
                        url={url}
                        nested
                    />
                ))}
            </div>
        </div>
    );
}

function GroupPanel({ group, url }: { group: TemplateNavGroup; url: string }) {
    return (
        <div className="flex w-[min(92vw,54rem)] gap-3 p-3">
            {/* Context rail — says what the module is for before the links. */}
            <div className="hidden w-48 shrink-0 flex-col justify-between rounded-md bg-muted/60 p-3 lg:flex">
                <div>
                    <group.icon className="size-5 text-primary" />
                    <p className="mt-2 text-sm font-semibold">{group.label}</p>
                    <p className="mt-1 text-2xs leading-snug text-muted-foreground">
                        {group.description}
                    </p>
                </div>
                <p className="flex items-center gap-1 text-2xs font-medium text-muted-foreground">
                    {group.items.length} section
                    {group.items.length === 1 ? '' : 's'}
                    <ArrowUpRight className="size-3" />
                </p>
            </div>

            <div className="grid flex-1 gap-x-3 gap-y-1 sm:grid-cols-2">
                {group.items.map((item) => (
                    <MenuColumn
                        key={item.href ?? item.title}
                        node={item}
                        url={url}
                    />
                ))}
            </div>
        </div>
    );
}

export function TemplateMegaMenu({ url }: { url: string }) {
    const { nav } = useChrome();

    return (
        <NavigationMenu viewport={false} className="hidden max-w-none lg:flex">
            <NavigationMenuList className="gap-0.5">
                {nav.map((group) => {
                    const active = group.items.some((item) =>
                        isBranchActive(item, url, nav),
                    );

                    return (
                        <NavigationMenuItem key={group.label}>
                            <NavigationMenuTrigger
                                className={cn(
                                    'h-8 bg-transparent px-2.5 text-sm font-medium text-topbar-foreground',
                                    'hover:bg-topbar-accent hover:text-topbar-accent-foreground',
                                    'focus:bg-topbar-accent focus:text-topbar-accent-foreground',
                                    'data-[state=open]:bg-topbar-accent data-[state=open]:text-topbar-accent-foreground',
                                    active &&
                                        'bg-topbar-accent/70 text-topbar-accent-foreground',
                                )}
                            >
                                <group.icon className="mr-1.5 size-4" />
                                {group.label}
                            </NavigationMenuTrigger>
                            <NavigationMenuContent>
                                <GroupPanel group={group} url={url} />
                            </NavigationMenuContent>
                        </NavigationMenuItem>
                    );
                })}
            </NavigationMenuList>
        </NavigationMenu>
    );
}
