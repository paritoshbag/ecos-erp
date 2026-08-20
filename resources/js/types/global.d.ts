import type { Auth } from '@/types/auth';
import type { OrganizationIdentity } from '@/types/organization';
import type { AppIdentity } from '@/types/ui';

declare module 'react' {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface InputHTMLAttributes<T> {
        passwordrules?: string;
    }
}

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            app: AppIdentity;
            auth: Auth;
            organization: OrganizationIdentity | null;
            sidebarOpen: boolean;
            [key: string]: unknown;
        };
    }
}
