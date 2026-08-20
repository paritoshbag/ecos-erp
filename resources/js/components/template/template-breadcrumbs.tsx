import { Link } from '@inertiajs/react';
import { Fragment } from 'react';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { useChrome } from '@/hooks/use-chrome';
import { findNavGroup, findNavTrail } from '@/lib/template-nav';
import { cn } from '@/lib/utils';

/*
 * Breadcrumbs derived from the navigation tree rather than hand-written per
 * page: with three levels of nesting the trail is the only reliable "where am
 * I" signal, and deriving it means a page can never disagree with the menu.
 *
 * Branch nodes have no href, so they render as plain text — they are context,
 * not destinations.
 */
export function TemplateBreadcrumbs({
    url,
    className,
    tone = 'topbar',
}: {
    url: string;
    className?: string;
    tone?: 'topbar' | 'page';
}) {
    const { nav, homeHref } = useChrome();
    const trail = findNavTrail(url, nav);
    const group = findNavGroup(url, nav);

    if (trail.length === 0) {
        return null;
    }

    const muted =
        tone === 'topbar'
            ? 'text-topbar-muted-foreground'
            : 'text-muted-foreground';
    const strong =
        tone === 'topbar' ? 'text-topbar-foreground' : 'text-foreground';

    return (
        <Breadcrumb className={cn('min-w-0', className)}>
            <BreadcrumbList
                className={cn('flex-nowrap gap-1 text-xs sm:gap-1.5', muted)}
            >
                <BreadcrumbItem className="hidden shrink-0 md:block">
                    <BreadcrumbLink asChild>
                        <Link
                            href={homeHref}
                            className={cn('hover:underline', muted)}
                        >
                            {group?.label ?? 'Home'}
                        </Link>
                    </BreadcrumbLink>
                </BreadcrumbItem>

                {trail.map((node, index) => {
                    const last = index === trail.length - 1;

                    return (
                        <Fragment key={node.href ?? node.title}>
                            <BreadcrumbSeparator className="hidden md:block [&>svg]:size-3" />
                            <BreadcrumbItem
                                className={cn(
                                    'min-w-0',
                                    !last && 'hidden md:flex',
                                )}
                            >
                                {last ? (
                                    <BreadcrumbPage
                                        className={cn(
                                            'truncate font-medium',
                                            strong,
                                        )}
                                    >
                                        {node.title}
                                    </BreadcrumbPage>
                                ) : node.href ? (
                                    <BreadcrumbLink asChild>
                                        <Link
                                            href={node.href}
                                            className={cn(
                                                'truncate hover:underline',
                                                muted,
                                            )}
                                        >
                                            {node.title}
                                        </Link>
                                    </BreadcrumbLink>
                                ) : (
                                    <span className={cn('truncate', muted)}>
                                        {node.title}
                                    </span>
                                )}
                            </BreadcrumbItem>
                        </Fragment>
                    );
                })}
            </BreadcrumbList>
        </Breadcrumb>
    );
}
