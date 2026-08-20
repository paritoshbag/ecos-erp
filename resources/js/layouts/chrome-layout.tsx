import { usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { AppFooter } from '@/components/template/app-footer';
import { TemplateBreadcrumbs } from '@/components/template/template-breadcrumbs';
import { TemplateSidebar } from '@/components/template/template-sidebar';
import { TemplateTopbar } from '@/components/template/template-topbar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { ChromeContext } from '@/hooks/use-chrome';
import type { ChromeConfig } from '@/hooks/use-chrome';
import { useIsMobile } from '@/hooks/use-mobile';
import { useUiPreferences } from '@/hooks/use-ui-preferences';

type Props = ChromeConfig & {
    children: ReactNode;
};

/*
 * One application shell for the real product and the /template playground.
 *
 * Navigation has three presentations and one source of tree data:
 *   desktop + sidebar mode → collapsible rail with nested, multi-level menus
 *   desktop + topbar mode  → jumbo (mega) menu across the topbar
 *   mobile (either mode)   → drawer, opened from the topbar trigger
 *
 * The rail component stays mounted on mobile in both modes because it *is* the
 * drawer — Sidebar renders itself as a Sheet below the md breakpoint.
 */
export default function ChromeLayout({
    children,
    nav,
    homeHref,
    mode,
}: Props) {
    const { preferences } = useUiPreferences();
    const isMobile = useIsMobile();
    const page = usePage();
    const { sidebarOpen } = page.props;

    const showRail = preferences.navMode === 'sidebar' || isMobile;

    return (
        <ChromeContext.Provider value={{ nav, homeHref, mode }}>
            <SidebarProvider defaultOpen={sidebarOpen ?? true}>
                {showRail && <TemplateSidebar />}
                <SidebarInset className="min-w-0">
                    <TemplateTopbar />

                    {preferences.navMode === 'topbar' && !isMobile && (
                        <TemplateBreadcrumbs
                            url={page.url}
                            tone="page"
                            className="px-4 pt-3"
                        />
                    )}

                    <div className="flex flex-1 flex-col gap-3 p-3 md:gap-4 md:p-4">
                        {children}
                    </div>

                    <AppFooter />
                </SidebarInset>
            </SidebarProvider>
        </ChromeContext.Provider>
    );
}
