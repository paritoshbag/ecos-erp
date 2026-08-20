import { Link, usePage } from '@inertiajs/react';
import { BadgeCheck, LifeBuoy } from 'lucide-react';
import { TemplateLogo } from '@/components/template/template-logo';
import { NavNode } from '@/components/template/template-nav-tree';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
    SidebarSeparator,
} from '@/components/ui/sidebar';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { useChrome } from '@/hooks/use-chrome';
import {
    organizationDisplayName,
    useOrganization,
} from '@/hooks/use-organization';
import { licensedContractor } from '@/lib/app-config';

/*
 * The rail. Colors come entirely from the active sidebar skin
 * (`--sidebar-*`, set by data-sidebar-skin on <html>), so this component never
 * hard-codes a shade and every skin — light or dark — renders correctly
 * regardless of the workspace theme.
 */
export function TemplateSidebar() {
    const url = usePage().url;
    const { nav, homeHref, mode } = useChrome();
    const organization = useOrganization();
    const companyName = organizationDisplayName(organization);
    const vendorCode = organization?.vendor_code?.trim();
    const showPreviewLicence = mode === 'preview';
    const showOrganization = Boolean(companyName || vendorCode);

    return (
        <Sidebar collapsible="icon" className="border-sidebar-border">
            <SidebarHeader className="p-2">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            asChild
                            className="h-11 gap-2 hover:bg-sidebar-accent/70"
                        >
                            <Link href={homeHref} prefetch>
                                <TemplateLogo tone="sidebar" />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarSeparator className="mx-0" />

            <SidebarContent className="gap-0 py-1">
                {nav.map((group) => (
                    <SidebarGroup key={group.label} className="px-2 py-1">
                        <SidebarGroupLabel className="h-6 px-2 text-2xs font-semibold tracking-[0.08em] text-sidebar-muted-foreground uppercase">
                            {group.label}
                        </SidebarGroupLabel>
                        <SidebarMenu className="gap-0.5">
                            {group.items.map((item) => (
                                <NavNode
                                    key={item.href ?? item.title}
                                    node={item}
                                    url={url}
                                    depth={0}
                                />
                            ))}
                        </SidebarMenu>
                    </SidebarGroup>
                ))}
            </SidebarContent>

            <SidebarFooter className="gap-1 p-2">
                {showPreviewLicence && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="flex items-center gap-2 rounded-md bg-sidebar-accent/60 px-2 py-1.5 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:px-0">
                                <BadgeCheck className="size-4 shrink-0 text-sidebar-primary" />
                                <div className="grid min-w-0 leading-tight group-data-[collapsible=icon]:hidden">
                                    <span className="truncate text-2xs font-semibold text-sidebar-foreground">
                                        Licence active
                                    </span>
                                    <span className="truncate text-2xs text-sidebar-muted-foreground">
                                        {licensedContractor.licenceNo}
                                    </span>
                                </div>
                            </div>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                            {licensedContractor.licenceClass} · valid to{' '}
                            {new Date(
                                licensedContractor.validTill,
                            ).toLocaleDateString()}
                        </TooltipContent>
                    </Tooltip>
                )}

                {!showPreviewLicence && showOrganization && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div
                                data-test="organization-sidebar"
                                className="flex items-center gap-2 rounded-md bg-sidebar-accent/60 px-2 py-1.5 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:px-0"
                            >
                                <BadgeCheck className="size-4 shrink-0 text-sidebar-primary" />
                                <div className="grid min-w-0 leading-tight group-data-[collapsible=icon]:hidden">
                                    <span className="truncate text-2xs font-semibold text-sidebar-foreground">
                                        {companyName ?? 'Organization'}
                                    </span>
                                    {vendorCode && (
                                        <span className="truncate text-2xs text-sidebar-muted-foreground">
                                            Vendor {vendorCode}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                            {[companyName, vendorCode && `Vendor ${vendorCode}`]
                                .filter(Boolean)
                                .join(' · ')}
                        </TooltipContent>
                    </Tooltip>
                )}

                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            size="sm"
                            tooltip={{ children: 'Help & support' }}
                        >
                            <Link href="/">
                                <LifeBuoy />
                                <span>Help & support</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}
