import { Form, Head } from '@inertiajs/react';
import { Database, Trash2 } from 'lucide-react';
import {
    destroyPurchaseOrders,
    seedPurchaseOrders,
} from '@/actions/App/Http/Controllers/DeveloperController';
import { PageHeader } from '@/components/template/page-header';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';
import { index as developerIndex } from '@/routes/developer';
import type { DeveloperIndexProps } from '@/types/developer';

const countFormat = new Intl.NumberFormat('en-IN');

export default function DeveloperIndex({
    purchase_order_count: purchaseOrderCount,
}: DeveloperIndexProps) {
    const countLabel = countFormat.format(purchaseOrderCount);

    return (
        <>
            <Head title="Developer" />
            <div className="flex flex-col gap-4">
                <PageHeader
                    title="Developer"
                    description="Temporary tools for seeding and wiping purchase order data."
                />

                <p className="text-sm text-muted-foreground">
                    There {purchaseOrderCount === 1 ? 'is' : 'are'} currently{' '}
                    <span className="font-medium text-foreground tabular-nums">
                        {countLabel}
                    </span>{' '}
                    {purchaseOrderCount === 1
                        ? 'purchase order'
                        : 'purchase orders'}{' '}
                    in the database.
                </p>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Seed purchase orders</CardTitle>
                            <CardDescription>
                                Upsert the legacy register from
                                purchase_orders.json. Existing rows with the
                                same id are updated; extra rows are left alone.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-muted-foreground">
                                Safe to run more than once. Delete first if you
                                want a clean reset.
                            </p>
                        </CardContent>
                        <CardFooter>
                            <Form {...seedPurchaseOrders.form()}>
                                {({ processing }) => (
                                    <Button type="submit" disabled={processing}>
                                        {processing ? (
                                            <Spinner />
                                        ) : (
                                            <Database />
                                        )}
                                        {processing
                                            ? 'Seeding…'
                                            : 'Seed purchase orders'}
                                    </Button>
                                )}
                            </Form>
                        </CardFooter>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Delete purchase orders</CardTitle>
                            <CardDescription>
                                Permanently remove every purchase order. This
                                cannot be undone.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-muted-foreground">
                                Use this before a fresh seed when leftover
                                factory or imported rows should not remain.
                            </p>
                        </CardContent>
                        <CardFooter>
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button
                                        variant="destructive"
                                        disabled={purchaseOrderCount === 0}
                                    >
                                        <Trash2 />
                                        Delete all purchase orders
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>
                                            Delete all purchase orders?
                                        </DialogTitle>
                                        <DialogDescription>
                                            {countLabel}{' '}
                                            {purchaseOrderCount === 1
                                                ? 'purchase order'
                                                : 'purchase orders'}{' '}
                                            will be permanently deleted. Seed
                                            again afterwards if you need the
                                            legacy register back.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <Form {...destroyPurchaseOrders.form()}>
                                        {({ processing }) => (
                                            <DialogFooter>
                                                <DialogClose asChild>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                    >
                                                        Cancel
                                                    </Button>
                                                </DialogClose>
                                                <Button
                                                    type="submit"
                                                    variant="destructive"
                                                    disabled={processing}
                                                >
                                                    {processing ? (
                                                        <Spinner />
                                                    ) : (
                                                        <Trash2 />
                                                    )}
                                                    {processing
                                                        ? 'Deleting…'
                                                        : 'Delete all'}
                                                </Button>
                                            </DialogFooter>
                                        )}
                                    </Form>
                                </DialogContent>
                            </Dialog>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </>
    );
}

DeveloperIndex.layout = {
    breadcrumbs: [
        {
            title: 'Developer',
            href: developerIndex(),
        },
    ],
};
