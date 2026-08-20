import { Head, Link } from '@inertiajs/react';
import { Folder, FolderPlus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import {
    DriveDialogs,
    DriveListing,
    DriveToolbar,
} from '@/components/drive/drive-workspace';
import type { DialogState } from '@/components/drive/drive-workspace';
import { DriveDropzone } from '@/components/drive/dropzone';
import { EmptyState } from '@/components/template/empty-state';
import { PageHeader } from '@/components/template/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { index as driveIndex, trash as driveTrash } from '@/routes/drive';
import { show as folderShow } from '@/routes/drive/folders';
import type { DriveIndexProps } from '@/types/drive';

export default function DriveIndex({
    folder,
    breadcrumbs,
    items,
    folders,
    storage,
    can_create,
    query,
}: DriveIndexProps) {
    const [view, setView] = useState<'grid' | 'list'>('grid');
    const [dialog, setDialog] = useState<DialogState>(null);

    const searchUrl = folder ? folderShow.url(folder.id) : driveIndex.url();

    return (
        <>
            <Head title={folder ? folder.name : 'Drive'} />
            <div className="flex flex-col gap-4">
                <PageHeader
                    title={folder ? folder.name : 'Company drive'}
                    description="Company documents with folders, sharing and storage tracking."
                    actions={
                        <>
                            <Button variant="outline" asChild>
                                <Link href={driveTrash()}>
                                    <Trash2 className="size-4" /> Trash
                                </Link>
                            </Button>
                            {can_create && (
                                <Button
                                    variant="outline"
                                    onClick={() =>
                                        setDialog({ type: 'folder' })
                                    }
                                >
                                    <FolderPlus className="size-4" /> New folder
                                </Button>
                            )}
                        </>
                    }
                />

                <DriveToolbar
                    key={query}
                    breadcrumbs={breadcrumbs}
                    query={query}
                    searchUrl={searchUrl}
                    view={view}
                    onViewChange={setView}
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

                {can_create && <DriveDropzone folderId={folder?.id ?? null} />}

                {items.length === 0 ? (
                    <EmptyState
                        icon={Folder}
                        title={
                            query ? 'No matching files' : 'This folder is empty'
                        }
                        description={
                            query
                                ? 'Try a different search term.'
                                : can_create
                                  ? 'Drop files above, or create a folder to get started.'
                                  : 'You can browse files shared across the company.'
                        }
                        action={
                            can_create && !query ? (
                                <Card className="mt-1 w-full max-w-sm overflow-hidden border-dashed py-0 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
                                    <button
                                        type="button"
                                        className="flex w-full items-center gap-3 px-4 py-5 text-left"
                                        onClick={() =>
                                            setDialog({ type: 'folder' })
                                        }
                                    >
                                        <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                            <FolderPlus className="size-5" />
                                        </span>
                                        <span className="min-w-0">
                                            <span className="block text-sm font-medium">
                                                New folder
                                            </span>
                                            <span className="block text-xs text-muted-foreground">
                                                Click to name and create a
                                                folder
                                            </span>
                                        </span>
                                    </button>
                                </Card>
                            ) : undefined
                        }
                    />
                ) : (
                    <DriveListing
                        items={items}
                        folders={folders}
                        view={view}
                        onOpen={setDialog}
                    />
                )}
            </div>

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
                folderId={folder?.id ?? null}
                folders={folders}
            />
        </>
    );
}

DriveIndex.layout = {
    breadcrumbs: [
        {
            title: 'Drive',
            href: driveIndex(),
        },
    ],
};
