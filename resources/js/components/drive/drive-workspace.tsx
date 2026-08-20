import { Link, router, useForm } from '@inertiajs/react';
import {
    ChevronRight,
    Copy,
    Download,
    Eye,
    Home,
    LayoutGrid,
    Link2,
    List,
    MoreHorizontal,
    Pencil,
    RotateCcw,
    Search,
    Share2,
    Trash2,
    Users,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
    download as downloadFile,
    preview as previewFile,
} from '@/actions/App/Http/Controllers/Drive/DriveFileController';
import { store as storeFolder } from '@/actions/App/Http/Controllers/Drive/DriveFolderController';
import {
    copy as copyItem,
    destroy as trashItem,
    move as moveItem,
    purge as purgeItem,
    restore as restoreItem,
    update as renameItem,
} from '@/actions/App/Http/Controllers/Drive/DriveItemController';
import {
    destroy as destroyLink,
    store as storeLink,
} from '@/actions/App/Http/Controllers/Drive/DriveLinkController';
import {
    destroy as destroyShare,
    store as storeShare,
} from '@/actions/App/Http/Controllers/Drive/DriveShareController';
import { DriveFileIcon } from '@/components/drive/file-icon';
import InputError from '@/components/input-error';
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { show as folderShow } from '@/routes/drive/folders';
import type { DriveFolderOption, DriveItem as DriveEntry } from '@/types/drive';

type DialogState =
    | { type: 'folder' }
    | { type: 'rename'; item: DriveEntry }
    | { type: 'share'; item: DriveEntry }
    | { type: 'move'; item: DriveEntry }
    | { type: 'copy'; item: DriveEntry }
    | { type: 'preview'; item: DriveEntry }
    | { type: 'trash'; item: DriveEntry }
    | { type: 'purge'; item: DriveEntry }
    | null;

function parentValue(id: number | null | undefined): string {
    return id === null || id === undefined ? 'root' : String(id);
}

export function DriveItemMenu({
    item,
    mode = 'browse',
    onOpen,
}: {
    item: DriveEntry;
    folders?: DriveFolderOption[];
    mode?: 'browse' | 'trash';
    onOpen: (dialog: DialogState) => void;
}) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    aria-label={`Actions for ${item.name}`}
                >
                    <MoreHorizontal className="size-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {mode === 'trash' ? (
                    <>
                        {item.can_restore && (
                            <DropdownMenuItem
                                onClick={() =>
                                    router.post(restoreItem.url(item.id))
                                }
                            >
                                Restore
                            </DropdownMenuItem>
                        )}
                        {item.can_purge && (
                            <DropdownMenuItem
                                variant="destructive"
                                onClick={() => onOpen({ type: 'purge', item })}
                            >
                                <Trash2 className="size-4" /> Delete forever
                            </DropdownMenuItem>
                        )}
                    </>
                ) : (
                    <>
                        {item.type === 'file' && (
                            <DropdownMenuItem asChild>
                                <a href={downloadFile.url(item.id)}>
                                    <Download className="size-4" /> Download
                                </a>
                            </DropdownMenuItem>
                        )}
                        {item.can_preview && (
                            <DropdownMenuItem
                                onClick={() =>
                                    onOpen({ type: 'preview', item })
                                }
                            >
                                <Eye className="size-4" /> Preview
                            </DropdownMenuItem>
                        )}
                        {item.can_share && (
                            <DropdownMenuItem
                                onClick={() => onOpen({ type: 'share', item })}
                            >
                                <Share2 className="size-4" /> Share
                            </DropdownMenuItem>
                        )}
                        {item.can_update && (
                            <>
                                <DropdownMenuItem
                                    onClick={() =>
                                        onOpen({ type: 'rename', item })
                                    }
                                >
                                    <Pencil className="size-4" /> Rename
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() =>
                                        onOpen({ type: 'move', item })
                                    }
                                >
                                    Move
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() =>
                                        onOpen({ type: 'copy', item })
                                    }
                                >
                                    <Copy className="size-4" /> Copy
                                </DropdownMenuItem>
                            </>
                        )}
                        {item.can_delete && (
                            <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    variant="destructive"
                                    onClick={() =>
                                        onOpen({ type: 'trash', item })
                                    }
                                >
                                    <Trash2 className="size-4" /> Delete
                                </DropdownMenuItem>
                            </>
                        )}
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export function DriveItemActions({
    item,
    folders,
    mode = 'browse',
    onOpen,
}: {
    item: DriveEntry;
    folders?: DriveFolderOption[];
    mode?: 'browse' | 'trash';
    onOpen: (dialog: DialogState) => void;
}) {
    return (
        <div
            className="flex shrink-0 items-center gap-0.5"
            onClick={(event) => event.stopPropagation()}
            onPointerDown={(event) => event.stopPropagation()}
        >
            {mode === 'browse' && item.can_delete && (
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="outline"
                            size="icon"
                            className="size-8 border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
                            aria-label={`Delete ${item.name}`}
                            onClick={() => onOpen({ type: 'trash', item })}
                        >
                            <Trash2 className="size-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Move to trash</TooltipContent>
                </Tooltip>
            )}
            {mode === 'trash' && item.can_restore && (
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="outline"
                            size="icon"
                            className="size-8"
                            aria-label={`Restore ${item.name}`}
                            onClick={() =>
                                router.post(restoreItem.url(item.id))
                            }
                        >
                            <RotateCcw className="size-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Restore</TooltipContent>
                </Tooltip>
            )}
            {mode === 'trash' && item.can_purge && (
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="outline"
                            size="icon"
                            className="size-8 border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
                            aria-label={`Delete ${item.name} forever`}
                            onClick={() => onOpen({ type: 'purge', item })}
                        >
                            <Trash2 className="size-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Delete forever</TooltipContent>
                </Tooltip>
            )}
            <DriveItemMenu
                item={item}
                folders={folders}
                mode={mode}
                onOpen={onOpen}
            />
        </div>
    );
}

export function DriveDialogs({
    dialog,
    onClose,
    folderId,
    folders,
}: {
    dialog: DialogState;
    onClose: () => void;
    folderId: number | null;
    folders: DriveFolderOption[];
}) {
    const folderForm = useForm({
        name: '',
        parent_id: folderId,
    });
    const renameForm = useForm({ name: '' });
    const shareForm = useForm({ email: '' });
    const linkForm = useForm({ expires_at: '' });
    const moveForm = useForm({ parent_id: parentValue(folderId) });
    const copyForm = useForm({ parent_id: parentValue(folderId) });

    useEffect(() => {
        folderForm.setData('parent_id', folderId);
        folderForm.setData('name', '');

        if (dialog?.type === 'rename') {
            renameForm.setData('name', dialog.item.name);
        }

        if (dialog?.type === 'move' || dialog?.type === 'copy') {
            moveForm.setData('parent_id', parentValue(folderId));
            copyForm.setData('parent_id', parentValue(folderId));
        }
        // Forms are stable enough for dialog open; avoid resetting on every render.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dialog, folderId]);

    const open = dialog !== null;
    const title =
        dialog?.type === 'folder'
            ? 'New folder'
            : dialog?.type === 'rename'
              ? 'Rename'
              : dialog?.type === 'share'
                ? `Share ${dialog.item.name}`
                : dialog?.type === 'move'
                  ? `Move ${dialog.item.name}`
                  : dialog?.type === 'copy'
                    ? `Copy ${dialog.item.name}`
                    : dialog?.type === 'preview'
                      ? dialog.item.name
                      : dialog?.type === 'trash'
                        ? 'Move to trash'
                        : dialog?.type === 'purge'
                          ? 'Delete forever'
                          : '';

    return (
        <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
            <DialogContent
                className={
                    dialog?.type === 'preview' ? 'sm:max-w-4xl' : undefined
                }
            >
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    {dialog?.type === 'trash' && (
                        <DialogDescription>
                            “{dialog.item.name}” will be moved to trash. You can
                            restore it later.
                        </DialogDescription>
                    )}
                    {dialog?.type === 'purge' && (
                        <DialogDescription>
                            This cannot be undone. The file will be removed from
                            storage.
                        </DialogDescription>
                    )}
                </DialogHeader>

                {dialog?.type === 'folder' && (
                    <form
                        className="space-y-4"
                        onSubmit={(event) => {
                            event.preventDefault();
                            folderForm.post(storeFolder.url(), {
                                onSuccess: () => onClose(),
                            });
                        }}
                    >
                        <div className="grid gap-2">
                            <Label htmlFor="folder-name">Name</Label>
                            <Input
                                id="folder-name"
                                value={folderForm.data.name}
                                onChange={(event) =>
                                    folderForm.setData(
                                        'name',
                                        event.target.value,
                                    )
                                }
                                autoFocus
                            />
                            <InputError message={folderForm.errors.name} />
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={folderForm.processing}
                            >
                                Create
                            </Button>
                        </DialogFooter>
                    </form>
                )}

                {dialog?.type === 'rename' && (
                    <form
                        className="space-y-4"
                        onSubmit={(event) => {
                            event.preventDefault();
                            renameForm.patch(renameItem.url(dialog.item.id), {
                                onSuccess: () => onClose(),
                            });
                        }}
                    >
                        <div className="grid gap-2">
                            <Label htmlFor="rename-name">Name</Label>
                            <Input
                                id="rename-name"
                                value={renameForm.data.name}
                                onChange={(event) =>
                                    renameForm.setData(
                                        'name',
                                        event.target.value,
                                    )
                                }
                                autoFocus
                            />
                            <InputError message={renameForm.errors.name} />
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={renameForm.processing}
                            >
                                Save
                            </Button>
                        </DialogFooter>
                    </form>
                )}

                {dialog?.type === 'share' && (
                    <div className="space-y-4">
                        <form
                            className="space-y-3"
                            onSubmit={(event) => {
                                event.preventDefault();
                                shareForm.post(storeShare.url(dialog.item.id), {
                                    preserveScroll: true,
                                    onSuccess: () => shareForm.reset(),
                                });
                            }}
                        >
                            <div className="grid gap-2">
                                <Label htmlFor="share-email">
                                    Grant editor access
                                </Label>
                                <Input
                                    id="share-email"
                                    type="email"
                                    placeholder="colleague@example.com"
                                    value={shareForm.data.email}
                                    onChange={(event) =>
                                        shareForm.setData(
                                            'email',
                                            event.target.value,
                                        )
                                    }
                                />
                                <InputError message={shareForm.errors.email} />
                            </div>
                            <Button
                                type="submit"
                                disabled={shareForm.processing}
                            >
                                Share
                            </Button>
                        </form>

                        {dialog.item.shares.length > 0 && (
                            <ul className="space-y-2 text-sm">
                                {dialog.item.shares.map((share) => (
                                    <li
                                        key={share.id}
                                        className="flex items-center justify-between gap-2 rounded-md border px-3 py-2"
                                    >
                                        <span>
                                            {share.user.name}{' '}
                                            <span className="text-muted-foreground">
                                                ({share.user.email}) · Editor
                                            </span>
                                        </span>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                                router.delete(
                                                    destroyShare.url(share.id),
                                                )
                                            }
                                        >
                                            Remove
                                        </Button>
                                    </li>
                                ))}
                            </ul>
                        )}

                        <div className="space-y-2 border-t pt-4">
                            <p className="text-sm font-medium">Public link</p>
                            {dialog.item.public_link ? (
                                <div className="flex flex-wrap items-center gap-2">
                                    <Input
                                        readOnly
                                        value={dialog.item.public_link.url}
                                        className="flex-1"
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={async () => {
                                            await navigator.clipboard.writeText(
                                                dialog.item.public_link!.url,
                                            );
                                            toast.success('Link copied');
                                        }}
                                    >
                                        <Link2 className="size-4" /> Copy
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={() =>
                                            router.delete(
                                                destroyLink.url(
                                                    dialog.item.public_link!.id,
                                                ),
                                            )
                                        }
                                    >
                                        Revoke
                                    </Button>
                                </div>
                            ) : (
                                <form
                                    className="flex flex-wrap items-end gap-2"
                                    onSubmit={(event) => {
                                        event.preventDefault();
                                        linkForm.post(
                                            storeLink.url(dialog.item.id),
                                            {
                                                preserveScroll: true,
                                            },
                                        );
                                    }}
                                >
                                    <div className="grid min-w-48 flex-1 gap-1">
                                        <Label htmlFor="link-expires">
                                            Expires (optional)
                                        </Label>
                                        <Input
                                            id="link-expires"
                                            type="datetime-local"
                                            value={linkForm.data.expires_at}
                                            onChange={(event) =>
                                                linkForm.setData(
                                                    'expires_at',
                                                    event.target.value,
                                                )
                                            }
                                        />
                                        <InputError
                                            message={linkForm.errors.expires_at}
                                        />
                                    </div>
                                    <Button
                                        type="submit"
                                        disabled={linkForm.processing}
                                    >
                                        Create link
                                    </Button>
                                </form>
                            )}
                        </div>
                    </div>
                )}

                {(dialog?.type === 'move' || dialog?.type === 'copy') && (
                    <form
                        className="space-y-4"
                        onSubmit={(event) => {
                            event.preventDefault();
                            const form =
                                dialog.type === 'move' ? moveForm : copyForm;
                            const action =
                                dialog.type === 'move' ? moveItem : copyItem;
                            form.post(action.url(dialog.item.id), {
                                onSuccess: () => onClose(),
                            });
                        }}
                    >
                        <div className="grid gap-2">
                            <Label>Destination</Label>
                            <Select
                                value={
                                    dialog.type === 'move'
                                        ? String(moveForm.data.parent_id)
                                        : String(copyForm.data.parent_id)
                                }
                                onValueChange={(value) => {
                                    if (dialog.type === 'move') {
                                        moveForm.setData('parent_id', value);
                                    } else {
                                        copyForm.setData('parent_id', value);
                                    }
                                }}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Choose a folder" />
                                </SelectTrigger>
                                <SelectContent>
                                    {folders.map((option) => (
                                        <SelectItem
                                            key={option.id ?? 'root'}
                                            value={parentValue(option.id)}
                                        >
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError
                                message={
                                    dialog.type === 'move'
                                        ? moveForm.errors.parent_id
                                        : copyForm.errors.parent_id
                                }
                            />
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={
                                    dialog.type === 'move'
                                        ? moveForm.processing
                                        : copyForm.processing
                                }
                            >
                                {dialog.type === 'move' ? 'Move' : 'Copy'}
                            </Button>
                        </DialogFooter>
                    </form>
                )}

                {dialog?.type === 'preview' && (
                    <div className="max-h-[70vh] overflow-auto">
                        {dialog.item.mime_type?.startsWith('image/') ? (
                            <img
                                src={previewFile.url(dialog.item.id)}
                                alt={dialog.item.name}
                                className="mx-auto max-h-[65vh] rounded-md"
                            />
                        ) : (
                            <iframe
                                title={dialog.item.name}
                                src={previewFile.url(dialog.item.id)}
                                className="h-[65vh] w-full rounded-md border"
                            />
                        )}
                    </div>
                )}

                {dialog?.type === 'trash' && (
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() =>
                                router.delete(trashItem.url(dialog.item.id), {
                                    onSuccess: () => onClose(),
                                })
                            }
                        >
                            Move to trash
                        </Button>
                    </DialogFooter>
                )}

                {dialog?.type === 'purge' && (
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() =>
                                router.delete(purgeItem.url(dialog.item.id), {
                                    onSuccess: () => onClose(),
                                })
                            }
                        >
                            Delete forever
                        </Button>
                    </DialogFooter>
                )}
            </DialogContent>
        </Dialog>
    );
}

export function DriveListing({
    items,
    folders,
    mode = 'browse',
    view,
    onOpen,
}: {
    items: DriveEntry[];
    folders: DriveFolderOption[];
    mode?: 'browse' | 'trash';
    view: 'grid' | 'list';
    onOpen: (dialog: DialogState) => void;
}) {
    const foldersList = useMemo(
        () => items.filter((item) => item.type === 'folder'),
        [items],
    );
    const files = useMemo(
        () => items.filter((item) => item.type === 'file'),
        [items],
    );

    if (items.length === 0) {
        return null;
    }

    if (view === 'list') {
        return (
            <div className="rounded-xl border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="min-w-52">Name</TableHead>
                            <TableHead>Owner</TableHead>
                            <TableHead>Modified</TableHead>
                            <TableHead className="text-right">Size</TableHead>
                            <TableHead>Sharing</TableHead>
                            <TableHead className="w-32" />
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {items.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell>
                                    {item.type === 'folder' &&
                                    mode === 'browse' ? (
                                        <Link
                                            href={folderShow(item.id)}
                                            className="flex items-center gap-2.5 font-medium"
                                        >
                                            <DriveFileIcon
                                                type={item.type}
                                                mime={item.mime_type}
                                                className="size-4.5"
                                            />
                                            {item.name}
                                        </Link>
                                    ) : (
                                        <button
                                            type="button"
                                            className="flex items-center gap-2.5 font-medium"
                                            onClick={() =>
                                                item.can_preview
                                                    ? onOpen({
                                                          type: 'preview',
                                                          item,
                                                      })
                                                    : undefined
                                            }
                                        >
                                            <DriveFileIcon
                                                type={item.type}
                                                mime={item.mime_type}
                                                className="size-4.5"
                                            />
                                            {item.name}
                                        </button>
                                    )}
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                    {item.owner.name}
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                    {item.deleted_at_label ??
                                        item.updated_at_label}
                                </TableCell>
                                <TableCell className="text-right text-muted-foreground tabular-nums">
                                    {item.size_label ??
                                        (item.items_count !== null
                                            ? `${item.items_count} items`
                                            : '—')}
                                </TableCell>
                                <TableCell>
                                    {item.is_shared ? (
                                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                            <Users className="size-3.5" />
                                            Shared
                                        </span>
                                    ) : (
                                        <span className="text-xs text-muted-foreground">
                                            Private
                                        </span>
                                    )}
                                </TableCell>
                                <TableCell className="pe-3 text-right">
                                    <DriveItemActions
                                        item={item}
                                        folders={folders}
                                        mode={mode}
                                        onOpen={onOpen}
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        );
    }

    return (
        <div className="space-y-5">
            {foldersList.length > 0 && (
                <section className="space-y-2.5">
                    <h2 className="text-sm font-semibold text-muted-foreground">
                        Folders
                    </h2>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {foldersList.map((folder) => (
                            <Card
                                key={folder.id}
                                className="py-4 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
                            >
                                <CardContent className="flex items-center gap-3 px-4">
                                    {mode === 'browse' ? (
                                        <Link
                                            href={folderShow(folder.id)}
                                            className="flex min-w-0 flex-1 items-center gap-3"
                                        >
                                            <DriveFileIcon type="folder" />
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium">
                                                    {folder.name}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {folder.items_count ?? 0}{' '}
                                                    items
                                                    {folder.is_shared && (
                                                        <span className="ml-1.5 inline-flex items-center gap-0.5">
                                                            ·{' '}
                                                            <Users className="size-3" />{' '}
                                                            Shared
                                                        </span>
                                                    )}
                                                </p>
                                            </div>
                                        </Link>
                                    ) : (
                                        <div className="flex min-w-0 flex-1 items-center gap-3">
                                            <DriveFileIcon type="folder" />
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium">
                                                    {folder.name}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                    <DriveItemActions
                                        item={folder}
                                        folders={folders}
                                        mode={mode}
                                        onOpen={onOpen}
                                    />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>
            )}
            {files.length > 0 && (
                <section className="space-y-2.5">
                    <h2 className="text-sm font-semibold text-muted-foreground">
                        Files
                    </h2>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {files.map((file) => (
                            <Card
                                key={file.id}
                                className="py-4 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
                            >
                                <CardContent className="flex items-center gap-3 px-4">
                                    <button
                                        type="button"
                                        className="flex min-w-0 flex-1 items-center gap-3 text-left"
                                        onClick={() =>
                                            file.can_preview
                                                ? onOpen({
                                                      type: 'preview',
                                                      item: file,
                                                  })
                                                : undefined
                                        }
                                    >
                                        <DriveFileIcon
                                            type="file"
                                            mime={file.mime_type}
                                        />
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium">
                                                {file.name}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {file.size_label} ·{' '}
                                                {file.deleted_at_label ??
                                                    file.updated_at_label}
                                            </p>
                                        </div>
                                    </button>
                                    <DriveItemActions
                                        item={file}
                                        folders={folders}
                                        mode={mode}
                                        onOpen={onOpen}
                                    />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}

export function DriveToolbar({
    breadcrumbs,
    query,
    searchUrl,
    view,
    onViewChange,
}: {
    breadcrumbs: { title: string; href: string }[];
    query: string;
    searchUrl: string;
    view: 'grid' | 'list';
    onViewChange: (view: 'grid' | 'list') => void;
}) {
    const [search, setSearch] = useState(query);

    return (
        <div className="flex flex-wrap items-center gap-2">
            <nav
                aria-label="Folder path"
                className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground"
            >
                <Home className="size-4" />
                {breadcrumbs.map((crumb, index) => (
                    <span key={crumb.href} className="flex items-center gap-1">
                        <ChevronRight className="size-3.5" />
                        {index === breadcrumbs.length - 1 ? (
                            <span className="font-medium text-foreground">
                                {crumb.title}
                            </span>
                        ) : (
                            <Link
                                href={crumb.href}
                                className="hover:text-foreground"
                            >
                                {crumb.title}
                            </Link>
                        )}
                    </span>
                ))}
            </nav>
            <div className="ms-auto flex items-center gap-2">
                <form
                    className="relative"
                    onSubmit={(event) => {
                        event.preventDefault();
                        router.get(
                            searchUrl,
                            { q: search || undefined },
                            { preserveState: true, replace: true },
                        );
                    }}
                >
                    <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        type="search"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search files…"
                        className="w-44 pl-8 sm:w-56"
                    />
                </form>
                <ToggleGroup
                    type="single"
                    value={view}
                    onValueChange={(value) =>
                        value && onViewChange(value as 'grid' | 'list')
                    }
                    variant="outline"
                >
                    <ToggleGroupItem value="grid" aria-label="Grid view">
                        <LayoutGrid className="size-4" />
                    </ToggleGroupItem>
                    <ToggleGroupItem value="list" aria-label="List view">
                        <List className="size-4" />
                    </ToggleGroupItem>
                </ToggleGroup>
            </div>
        </div>
    );
}

export { type DialogState };
