import type { ReactNode } from 'react';
import ChromeLayout from '@/layouts/chrome-layout';
import { templateNav } from '@/lib/template-nav';

export default function TemplateLayout({ children }: { children: ReactNode }) {
    return (
        <ChromeLayout nav={templateNav} homeHref="/template" mode="preview">
            {children}
        </ChromeLayout>
    );
}
