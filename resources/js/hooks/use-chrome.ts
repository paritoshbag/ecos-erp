import { createContext, useContext } from 'react';
import type { TemplateNavGroup } from '@/lib/template-nav';

export type ChromeMode = 'app' | 'preview';

export type ChromeConfig = {
    nav: TemplateNavGroup[];
    homeHref: string;
    mode: ChromeMode;
};

export const ChromeContext = createContext<ChromeConfig | null>(null);

export function useChrome(): ChromeConfig {
    const value = useContext(ChromeContext);

    if (!value) {
        throw new Error('useChrome must be used within ChromeLayout');
    }

    return value;
}
