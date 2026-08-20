import { Link } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    useSidebar,
} from '@/components/ui/sidebar';
import { useChrome } from '@/hooks/use-chrome';
import type { TemplateNavNode } from '@/lib/template-nav';
import { isBranchActive, isLeafActive } from '@/lib/template-nav';
import { cn } from '@/lib/utils';

/*
 * Recursive renderer for the sidebar navigation tree.
 *
 * Three states have to work at every depth:
 *   expanded rail  → inline collapsible branches, indented sub-lists
 *   icon rail      → branches become dropdown fly-outs (nested submenus)
 *   mobile drawer  → same as the expanded rail, inside a Sheet
 *
 * Depth is not capped anywhere: each level renders the next through the same
 * component, so template-nav.ts can grow as deep as a module needs.
 */

type NodeProps = {
    node: TemplateNavNode;
    url: string;
    depth: number;
};

const activeRail =
    'data-[active=true]:before:absolute data-[active=true]:before:left-0 data-[active=true]:before:top-1/2 data-[active=true]:before:h-4 data-[active=true]:before:w-0.5 data-[active=true]:before:-translate-y-1/2 data-[active=true]:before:rounded-r-full data-[active=true]:before:bg-sidebar-primary';

/* ------------------------------------------------------------------ leaves */

function NavLeaf({ node, url, depth }: NodeProps) {
    const { isMobile, setOpenMobile } = useSidebar();
    const { nav } = useChrome();
    const active = isLeafActive(node.href, url, nav);

    const label = (
        <>
            {node.icon && <node.icon />}
            <span>{node.title}</span>
            {node.badge && (
                <Badge
                    variant="secondary"
                    className="ml-auto h-4 px-1 text-2xs font-semibold"
                >
                    {node.badge}
                </Badge>
            )}
        </>
    );

    const close = () => isMobile && setOpenMobile(false);

    if (depth === 0) {
        return (
            <SidebarMenuItem>
                <SidebarMenuButton
                    asChild
                    isActive={active}
                    tooltip={{ children: node.title }}
                    className={cn('relative', activeRail)}
                >
                    <Link href={node.href!} prefetch onClick={close}>
                        {label}
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
        );
    }

    return (
        <SidebarMenuSubItem>
            <SidebarMenuSubButton
                asChild
                size="sm"
                isActive={active}
                className={cn('relative', activeRail)}
            >
                <Link href={node.href!} prefetch onClick={close}>
                    {label}
                </Link>
            </SidebarMenuSubButton>
        </SidebarMenuSubItem>
    );
}

/* --------------------------------------------------- collapsed fly-out menu */

function FlyoutItems({
    nodes,
    url,
}: {
    nodes: TemplateNavNode[];
    url: string;
}) {
    const { nav } = useChrome();

    return (
        <>
            {nodes.map((node) =>
                node.children ? (
                    <DropdownMenuSub key={node.title}>
                        <DropdownMenuSubTrigger className="gap-2">
                            {node.icon && <node.icon className="size-4" />}
                            {node.title}
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent className="w-56">
                            <FlyoutItems nodes={node.children} url={url} />
                        </DropdownMenuSubContent>
                    </DropdownMenuSub>
                ) : (
                    <DropdownMenuItem key={node.href} asChild>
                        <Link
                            href={node.href!}
                            prefetch
                            className={cn(
                                'gap-2',
                                isLeafActive(node.href, url, nav) &&
                                    'bg-accent text-accent-foreground',
                            )}
                        >
                            {node.icon && <node.icon className="size-4" />}
                            {node.title}
                        </Link>
                    </DropdownMenuItem>
                ),
            )}
        </>
    );
}

function NavBranchFlyout({ node, url }: NodeProps) {
    const { nav } = useChrome();

    return (
        <SidebarMenuItem>
            <DropdownMenu>
                {/*
                 * No `tooltip` here on purpose: SidebarMenuButton wraps itself
                 * in a TooltipTrigger when given one, and two `asChild`
                 * triggers on the same button fight over `data-state`. The
                 * fly-out is labelled by its own header instead.
                 */}
                <DropdownMenuTrigger asChild>
                    <SidebarMenuButton
                        isActive={isBranchActive(node, url, nav)}
                        aria-label={node.title}
                        className={cn('relative', activeRail)}
                    >
                        {node.icon && <node.icon />}
                        <span>{node.title}</span>
                    </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    side="right"
                    align="start"
                    sideOffset={8}
                    className="w-56"
                >
                    <DropdownMenuLabel className="text-2xs tracking-wide text-muted-foreground uppercase">
                        {node.title}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <FlyoutItems nodes={node.children ?? []} url={url} />
                </DropdownMenuContent>
            </DropdownMenu>
        </SidebarMenuItem>
    );
}

/* ---------------------------------------------------------------- branches */

function NavBranch({ node, url, depth }: NodeProps) {
    const { nav } = useChrome();
    const active = isBranchActive(node, url, nav);
    const [open, setOpen] = useState(active);

    /*
     * Follow the URL: navigating into a collapsed branch opens it, while a
     * branch the user closed by hand stays closed. Adjusting state during
     * render (rather than in an effect) means the branch is already open on
     * the first paint after a navigation — no expand animation on arrival.
     */
    const [wasActive, setWasActive] = useState(active);

    if (active !== wasActive) {
        setWasActive(active);

        if (active) {
            setOpen(true);
        }
    }

    const chevron = (
        <ChevronRight className="ml-auto size-3.5 shrink-0 transition-transform duration-200 group-data-[state=open]/branch:rotate-90" />
    );

    return (
        <Collapsible
            open={open}
            onOpenChange={setOpen}
            className="group/branch"
            asChild
        >
            {depth === 0 ? (
                <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                            isActive={active && !open}
                            tooltip={{ children: node.title }}
                            className={cn('relative', activeRail)}
                        >
                            {node.icon && <node.icon />}
                            <span>{node.title}</span>
                            {chevron}
                        </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <SidebarMenuSub>
                            {node.children?.map((child) => (
                                <NavNode
                                    key={child.href ?? child.title}
                                    node={child}
                                    url={url}
                                    depth={depth + 1}
                                />
                            ))}
                        </SidebarMenuSub>
                    </CollapsibleContent>
                </SidebarMenuItem>
            ) : (
                <SidebarMenuSubItem>
                    <CollapsibleTrigger asChild>
                        <SidebarMenuSubButton
                            asChild
                            size="sm"
                            isActive={active && !open}
                            className={cn('relative w-full', activeRail)}
                        >
                            <button type="button">
                                {node.icon && <node.icon />}
                                <span>{node.title}</span>
                                {chevron}
                            </button>
                        </SidebarMenuSubButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <SidebarMenuSub className="mx-2.5 px-2">
                            {node.children?.map((child) => (
                                <NavNode
                                    key={child.href ?? child.title}
                                    node={child}
                                    url={url}
                                    depth={depth + 1}
                                />
                            ))}
                        </SidebarMenuSub>
                    </CollapsibleContent>
                </SidebarMenuSubItem>
            )}
        </Collapsible>
    );
}

export function NavNode({ node, url, depth }: NodeProps) {
    const { state, isMobile } = useSidebar();

    if (!node.children?.length) {
        return <NavLeaf node={node} url={url} depth={depth} />;
    }

    /* In the icon rail there is no room to expand — fly out sideways instead. */
    if (state === 'collapsed' && !isMobile && depth === 0) {
        return <NavBranchFlyout node={node} url={url} depth={depth} />;
    }

    return <NavBranch node={node} url={url} depth={depth} />;
}
