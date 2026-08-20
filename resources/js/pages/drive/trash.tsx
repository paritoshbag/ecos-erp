import { Head, Link, useForm } from '@inertiajs/react';
import { HardDrive, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { emptyTrash } from '@/actions/App/Http/Controllers/Drive/DriveController';
import {
    DriveDialogs,
    DriveListing,
} from '@/components/drive/drive-workspace';
import type { DialogState } from '@/components/drive/drive-workspace';
import InputError from '@/components/input-error';
import { EmptyState } from '@/components/template/empty-state';
import { PageHeader } from '@/components/template/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { index as driveIndex, trash as driveTrash } from '@/routes/drive';
import type { DriveTrashProps } from '@/types/drive';

export default function DriveTrash({ items, storage }: DriveTrashProps) {
    const [view] = useState<'grid' | 'list'>('list');
    const [dialog, setDialog] = useState<DialogState>(null);
    const [emptyOpen, setEmptyOpen] = useState(false);
    const emptyForm = useForm({ confirmation: '' });
    const canEmpty = items.some((item) => item.can_purge);
    const purgableCount = items.filter((item) => item.can_purge).length;
    const confirmationMatches = emptyForm.data.confirmation === 'CONFIRM';

    const closeEmptyDialog = () => {
        setEmptyOpen(false);
        emptyForm.reset();
        emptyForm.clearErrors();
    };

    return (
        <>
            <Head title="Trash" />
            <div className="flex flex-col gap-4">
                <PageHeader
                    title="Trash"
                    description="Restore items or delete them permanently from storage."
                    actions={
                        <>
                            <Button variant="outline" asChild>
                                <Link href={driveIndex()}>
                                    <HardDrive className="size-4" /> Back to
                                    drive
                                </Link>
                            </Button>
                            {canEmpty && (
                                <Button
                                    variant="destructive"
                                    onClick={() => {
                                        emptyForm.reset();
                                        emptyForm.clearErrors();
                                        setEmptyOpen(true);
                                    }}
                                >
                                    <Trash2 className="size-4" /> Empty trash
                                </Button>
                            )}
                        </>
                    }
                />

                <Card className="py-4">
                    <CardContent className="flex flex-wrap items-center gap-4 px-5">
                        <div className="min-w-44 flex-1">
                            <div className="flex items-baseline justify-between text-sm">
                                <span className="font-medium">Storage</span>
                                <span className="text-muted-foreground tabular-nums">
                                    {storage.used_label} used
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {items.length === 0 ? (
                    <EmptyState
                        icon={Trash2}
                        title="Trash is empty"
                        description="Deleted files and folders will appear here."
                    />
                ) : (
                    <DriveListing
                        items={items}
                        folders={[]}
                        mode="trash"
                        view={view}
                        onOpen={setDialog}
                    />
                )}
            </div>

            <Dialog
                open={emptyOpen}
                onOpenChange={(open) => {
                    if (!open) {
                        closeEmptyDialog();
                    }
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Empty trash</DialogTitle>
                        <DialogDescription>
                            This cannot be undone. {purgableCount}{' '}
                            {purgableCount === 1 ? 'item' : 'items'} will be
                            permanently deleted from storage. Type CONFIRM to
                            continue.
                        </DialogDescription>
                    </DialogHeader>
                    <form
                        className="space-y-4"
                        onSubmit={(event) => {
                            event.preventDefault();
                            emptyForm.delete(emptyTrash.url(), {
                                onSuccess: () => closeEmptyDialog(),
                            });
                        }}
                    >
                        <div className="grid gap-2">
                            <Label htmlFor="empty-trash-confirmation">
                                Type CONFIRM
                            </Label>
                            <Input
                                id="empty-trash-confirmation"
                                name="confirmation"
                                value={emptyForm.data.confirmation}
                                onChange={(event) =>
                                    emptyForm.setData(
                                        'confirmation',
                                        event.target.value,
                                    )
                                }
                                placeholder="CONFIRM"
                                autoComplete="off"
                                spellCheck={false}
                                autoFocus
                            />
                            <InputError
                                message={emptyForm.errors.confirmation}
                            />
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={closeEmptyDialog}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="destructive"
                                disabled={
                                    emptyForm.processing || !confirmationMatches
                                }
                            >
                                Delete forever
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <DriveDialogs
                dialog={
                    dialog && 'item' in dialog
                        ? {
                              ...dialog,
                              item:
                                  items.find(
                                      (item) => item.id === dialog.item.id,
                                  ) ?? dialog.item,
                          }
                        : dialog
                }
                onClose={() => setDialog(null)}
                folderId={null}
                folders={[]}
            />
        </>
    );
}

DriveTrash.layout = {
    breadcrumbs: [
        {
            title: 'Drive',
            href: driveIndex(),
        },
        {
            title: 'Trash',
            href: driveTrash(),
        },
    ],
};
