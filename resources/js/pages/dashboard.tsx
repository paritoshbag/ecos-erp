import { Head } from '@inertiajs/react';
import { LayoutGrid } from 'lucide-react';
import { EmptyState } from '@/components/template/empty-state';
import { PageHeader } from '@/components/template/page-header';
import { dashboard } from '@/routes';

export default function Dashboard() {
    return (
        <>
            <Head title="Dashboard" />
            <div className="flex flex-col gap-4">
                <PageHeader
                    title="Dashboard"
                    description="Your workspace overview — modules will land here as they come online."
                />
                <EmptyState
                    icon={LayoutGrid}
                    title="Nothing to review yet"
                    description="Purchase orders, drive files and the rest of the contractor workspace will appear here."
                />
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
