import { Link, usePage } from '@inertiajs/react';
import {
    Bell,
    CircleUserRound,
    FileCheck2,
    LogOut,
    MessageSquareText,
    PanelsTopLeft,
    Search,
    Settings,
    TriangleAlert,
} from 'lucide-react';
import { AccessibilityMenu } from '@/components/template/accessibility-menu';
import { ContractorBadge } from '@/components/template/contractor-badge';
import { LiveClock } from '@/components/template/live-clock';
import { TemplateBreadcrumbs } from '@/components/template/template-breadcrumbs';
import { TemplateLogo } from '@/components/template/template-logo';
import { TemplateMegaMenu } from '@/components/template/template-mega-menu';
import { ThemeCustomizer } from '@/components/template/theme-customizer';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { UserMenuContent } from '@/components/user-menu-content';
import { useChrome } from '@/hooks/use-chrome';
import { useInitials } from '@/hooks/use-initials';
import { useUiPreferences } from '@/hooks/use-ui-preferences';

/*
 * The topbar carries three jobs at once, and stays one row tall doing them:
 *
 *   identity   — which licensed contractor this session certifies work under
 *   orientation— breadcrumb trail (sidebar mode) or jumbo menu (topbar mode)
 *   controls   — search, alerts, accessibility, appearance, account
 *
 * Colors come from the topbar skin (`--topbar-*`), which is chosen
 * independently of the sidebar skin and of light/dark mode.
 */

const mockUser = {
    name: 'Alex Morgan',
    role: 'Operations Manager',
    email: 'alex.morgan@ecos.app',
    initials: 'AM',
};

const notifications = [
    {
        icon: FileCheck2,
        title: 'Quotation QT-2041 approved',
        time: '12 min ago',
        tone: 'text-success',
    },
    {
        icon: TriangleAlert,
        title: 'Expense claim over budget limit',
        time: '1 hr ago',
        tone: 'text-warning',
    },
    {
        icon: MessageSquareText,
        title: 'New comment on Task "Q3 audit"',
        time: '3 hrs ago',
        tone: 'text-info',
    },
];

const iconButton =
    'size-8 text-topbar-foreground hover:bg-topbar-accent hover:text-topbar-accent-foreground';

export function TemplateTopbar() {
    const url = usePage().url;
    const { auth } = usePage().props;
    const { preferences } = useUiPreferences();
    const { isMobile } = useSidebar();
    const { homeHref, mode } = useChrome();
    const getInitials = useInitials();

    const topbarNav = preferences.navMode === 'topbar' && !isMobile;
    const user = mode === 'app' ? auth.user : null;
    const displayName = user?.name ?? mockUser.name;
    const displayRole =
        user?.role === 'superadmin'
            ? 'Superadmin'
            : user
              ? 'Member'
              : mockUser.role;
    const displayInitials = user ? getInitials(user.name) : mockUser.initials;

    return (
        <header className="sticky top-0 z-40 flex h-12 shrink-0 items-center gap-1.5 border-b border-topbar-border bg-topbar px-2 text-topbar-foreground md:px-3">
            {/*
             * One trigger, two jobs: collapses the rail on desktop, opens the
             * drawer on mobile. In topbar mode it is mobile-only, because
             * there is no rail to collapse.
             */}
            <SidebarTrigger
                className={
                    topbarNav
                        ? `${iconButton} md:hidden`
                        : `${iconButton} -ml-0.5`
                }
            />

            {topbarNav ? (
                <>
                    <Link href={homeHref} prefetch className="mr-1 shrink-0">
                        <TemplateLogo tone="topbar" />
                    </Link>
                    <Separator
                        orientation="vertical"
                        className="mr-1 bg-topbar-border data-[orientation=vertical]:h-5"
                    />
                    <TemplateMegaMenu url={url} />
                </>
            ) : (
                <>
                    {/* Wordmark stands in for the rail while the drawer is shut. */}
                    <Link
                        href={homeHref}
                        prefetch
                        className="shrink-0 md:hidden"
                    >
                        <TemplateLogo tone="topbar" />
                    </Link>
                    <Separator
                        orientation="vertical"
                        className="mx-0.5 hidden bg-topbar-border data-[orientation=vertical]:h-4 md:block"
                    />
                    <TemplateBreadcrumbs
                        url={url}
                        className="hidden md:block"
                    />
                </>
            )}

            <div className="ml-auto flex min-w-0 items-center gap-1">
                <div className="hidden min-w-0 items-center gap-1.5 lg:flex">
                    <ContractorBadge />
                    <Separator
                        orientation="vertical"
                        className="bg-topbar-border data-[orientation=vertical]:h-5"
                    />
                </div>

                <LiveClock />

                <div className="relative hidden md:block">
                    <Search className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-topbar-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search jobs, quotes, people…"
                        className="h-8 w-44 border-topbar-border bg-topbar-accent/60 pl-8 text-xs text-topbar-foreground placeholder:text-topbar-muted-foreground lg:w-56"
                    />
                    <kbd className="pointer-events-none absolute top-1/2 right-2 hidden -translate-y-1/2 rounded border border-topbar-border px-1 font-mono text-2xs text-topbar-muted-foreground lg:inline-block">
                        Ctrl K
                    </kbd>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    className={`${iconButton} md:hidden`}
                    aria-label="Search"
                >
                    <Search className="size-4" />
                </Button>

                {mode === 'preview' && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className={`relative ${iconButton}`}
                                aria-label="Notifications"
                            >
                                <Bell className="size-4" />
                                <span className="absolute top-1.5 right-1.5 flex size-1.5">
                                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-destructive opacity-60" />
                                    <span className="relative inline-flex size-1.5 rounded-full bg-destructive" />
                                </span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-76">
                            <DropdownMenuLabel className="flex items-center justify-between text-xs">
                                Notifications
                                <Badge
                                    variant="secondary"
                                    className="h-4 px-1.5 text-2xs"
                                >
                                    3 new
                                </Badge>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuGroup>
                                {notifications.map((notification) => (
                                    <DropdownMenuItem
                                        key={notification.title}
                                        className="items-start gap-2 py-1.5"
                                    >
                                        <notification.icon
                                            className={`mt-0.5 size-3.5 shrink-0 ${notification.tone}`}
                                        />
                                        <div className="grid gap-0.5">
                                            <span className="text-xs leading-snug">
                                                {notification.title}
                                            </span>
                                            <span className="text-2xs text-muted-foreground">
                                                {notification.time}
                                            </span>
                                        </div>
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="justify-center text-xs text-primary">
                                View all notifications
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}

                <AccessibilityMenu />
                <ThemeCustomizer />

                <Separator
                    orientation="vertical"
                    className="mx-0.5 hidden bg-topbar-border data-[orientation=vertical]:h-5 sm:block"
                />

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            className="h-8 gap-1.5 rounded-md px-1 hover:bg-topbar-accent"
                            aria-label="Account menu"
                        >
                            <Avatar className="size-6.5">
                                {user?.avatar && (
                                    <AvatarImage
                                        src={user.avatar}
                                        alt={user.name}
                                    />
                                )}
                                <AvatarFallback className="bg-primary/15 text-2xs font-semibold text-primary">
                                    {displayInitials}
                                </AvatarFallback>
                            </Avatar>
                            <span className="hidden text-left leading-tight xl:grid">
                                <span className="text-xs font-medium text-topbar-foreground">
                                    {displayName}
                                </span>
                                <span className="text-2xs text-topbar-muted-foreground">
                                    {displayRole}
                                </span>
                            </span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        {user ? (
                            <UserMenuContent user={user} />
                        ) : (
                            <>
                                <DropdownMenuLabel className="font-normal">
                                    <div className="grid gap-0.5">
                                        <span className="text-xs font-medium">
                                            {mockUser.name}
                                        </span>
                                        <span className="text-2xs text-muted-foreground">
                                            {mockUser.email}
                                        </span>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-xs">
                                    <CircleUserRound className="size-3.5" />
                                    Profile
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-xs">
                                    <PanelsTopLeft className="size-3.5" />
                                    Switch workspace
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-xs">
                                    <Settings className="size-3.5" />
                                    Settings
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    variant="destructive"
                                    className="text-xs"
                                >
                                    <LogOut className="size-3.5" />
                                    Log out
                                </DropdownMenuItem>
                            </>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
