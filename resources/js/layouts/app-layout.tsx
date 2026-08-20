import { usePage } from '@inertiajs/react';
import ChromeLayout from '@/layouts/chrome-layout';
import { appHomeHref, appNavFor } from '@/lib/app-nav';
import type { AppLayoutProps } from '@/types';

export default function AppLayout({ children }: AppLayoutProps) {
    const { auth } = usePage().props;

    return (
        <ChromeLayout
            nav={appNavFor(auth.user?.role)}
            homeHref={appHomeHref}
            mode="app"
        >
            {children}
        </ChromeLayout>
    );
}
