import { Link } from '@inertiajs/react';
import { ArrowLeft, Hammer } from 'lucide-react';
import { PageHeader } from '@/components/template/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

type Props = {
    title: string;
    description: string;
    phase: string;
};

export function TemplatePlaceholder({ title, description, phase }: Props) {
    return (
        <div className="flex flex-1 flex-col gap-4">
            <PageHeader title={title} description={description} />
            <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-xl border border-dashed p-10 text-center">
                <div className="flex size-12 items-center justify-center rounded-full bg-accent text-accent-foreground">
                    <Hammer className="size-6" />
                </div>
                <div className="space-y-1">
                    <p className="font-medium">This section is being built</p>
                    <p className="text-sm text-muted-foreground">
                        Scheduled for {phase} of the template build-out.
                    </p>
                </div>
                <Badge variant="secondary">{phase}</Badge>
                <Button variant="outline" asChild>
                    <Link href="/template">
                        <ArrowLeft className="size-4" />
                        Back to Template Hub
                    </Link>
                </Button>
            </div>
        </div>
    );
}
