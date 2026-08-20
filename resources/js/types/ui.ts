import type { ReactNode } from 'react';
import type { BreadcrumbItem } from '@/types/navigation';

export type AppLayoutProps = {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
};

export type AppVariant = 'header' | 'sidebar';

export type FlashToast = {
    type: 'success' | 'info' | 'warning' | 'error';
    message: string;
};

export type AuthLayoutProps = {
    children?: ReactNode;
    name?: string;
    title?: string;
    description?: string;
};

/*
 * Server-shared product identity. Populated by HandleInertiaRequests so the
 * footer's version badge tracks the deployed build rather than a constant that
 * has to be remembered at release time.
 */
export type AppIdentity = {
    name: string;
    version: string;
    environment: string;
};
