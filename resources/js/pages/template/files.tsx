import { Head } from '@inertiajs/react';
import {
    ChevronRight,
    CloudUpload,
    Download,
    FileArchive,
    FileImage,
    FileSpreadsheet,
    FileText,
    Folder,
    FolderPlus,
    Home,
    LayoutGrid,
    Link2,
    List,
    MoreHorizontal,
    Pencil,
    Search,
    Share2,
    Trash2,
    Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/template/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { fileEntries } from '@/lib/template-data';
import type { FileEntry } from '@/lib/template-data';
import { cn } from '@/lib/utils';

const typeMeta: Record<
    FileEntry['type'],
    { icon: LucideIcon; className: string }
> = {
    folder: { icon: Folder, className: 'text-primary' },
    pdf: { icon: FileText, className: 'text-destructive' },
    xlsx: { icon: FileSpreadsheet, className: 'text-success' },
    docx: { icon: FileText, className: 'text-info' },
    image: { icon: FileImage, className: 'text-warning' },
    zip: { icon: FileArchive, className: 'text-muted-foreground' },
};

function FileActions({ file }: { file: FileEntry }) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    aria-label={`Actions for ${file.name}`}
                >
                    <MoreHorizontal className="size-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem
                    onClick={() =>
                        toast.success(`Sharing link copied for ${file.name}`)
                    }
                >
                    <Link2 className="size-4" /> Copy link
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() =>
                        toast.info(`Share settings for ${file.name}`)
                    }
                >
                    <Share2 className="size-4" /> Share
                </DropdownMenuItem>
                {file.type !== 'folder' && (
                    <DropdownMenuItem
                        onClick={() =>
                            toast.success(`${file.name} downloading`)
                        }
                    >
                        <Download className="size-4" /> Download
                    </DropdownMenuItem>
                )}
                <DropdownMenuItem
                    onClick={() => toast.info('Rename dialog opens')}
                >
                    <Pencil className="size-4" /> Rename
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    variant="destructive"
                    onClick={() => toast.error(`${file.name} moved to trash`)}
                >
                    <Trash2 className="size-4" /> Delete
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export default function TemplateFiles() {
    const [view, setView] = useState<'grid' | 'list'>('grid');
    const [search, setSearch] = useState('');

    const visible = fileEntries.filter((file) =>
        file.name.toLowerCase().includes(search.trim().toLowerCase()),
    );
    const folders = visible.filter((file) => file.type === 'folder');
    const files = visible.filter((file) => file.type !== 'folder');

    return (
        <>
            <Head title="File Manager" />
            <PageHeader
                title="File manager"
                description="Company documents with folders, sharing and storage tracking."
                actions={
                    <>
                        <Button
                            variant="outline"
                            onClick={() =>
                                toast.info('New folder dialog opens')
                            }
                        >
                            <FolderPlus className="size-4" /> New folder
                        </Button>
                        <Button
                            onClick={() => toast.info('Upload picker opens')}
                        >
                            <CloudUpload className="size-4" /> Upload
                        </Button>
                    </>
                }
            />

            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-2">
                <nav
                    aria-label="Folder path"
                    className="flex items-center gap-1 text-sm text-muted-foreground"
                >
                    <Home className="size-4" />
                    <ChevronRight className="size-3.5" />
                    <span className="font-medium text-foreground">
                        Company drive
                    </span>
                </nav>
                <div className="ms-auto flex items-center gap-2">
                    <div className="relative">
                        <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            type="search"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search files…"
                            className="w-44 pl-8 sm:w-56"
                        />
                    </div>
                    <ToggleGroup
                        type="single"
                        value={view}
                        onValueChange={(value) =>
                            value && setView(value as 'grid' | 'list')
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

            {/* Storage strip */}
            <Card className="py-4">
                <CardContent className="flex flex-wrap items-center gap-4 px-5">
                    <div className="min-w-44 flex-1">
                        <div className="flex items-baseline justify-between text-sm">
                            <span className="font-medium">Storage</span>
                            <span className="text-muted-foreground tabular-nums">
                                415 GB / 512 GB
                            </span>
                        </div>
                        <Progress value={81} className="mt-2 h-1.5" />
                    </div>
                    <p className="text-xs text-muted-foreground">
                        81% used — archives are cleaned automatically after 24
                        months.
                    </p>
                </CardContent>
            </Card>

            {view === 'grid' ? (
                <div className="space-y-5">
                    {folders.length > 0 && (
                        <section className="space-y-2.5">
                            <h2 className="text-sm font-semibold text-muted-foreground">
                                Folders
                            </h2>
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {folders.map((folder) => (
                                    <Card
                                        key={folder.id}
                                        className="cursor-pointer py-4 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
                                    >
                                        <CardContent className="flex items-center gap-3 px-4">
                                            <Folder className="size-8 shrink-0 fill-primary/15 text-primary" />
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium">
                                                    {folder.name}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {folder.items} items
                                                    {folder.shared && (
                                                        <span className="ml-1.5 inline-flex items-center gap-0.5">
                                                            ·{' '}
                                                            <Users className="size-3" />
                                                            Shared
                                                        </span>
                                                    )}
                                                </p>
                                            </div>
                                            <FileActions file={folder} />
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
                                {files.map((file) => {
                                    const meta = typeMeta[file.type];

                                    return (
                                        <Card
                                            key={file.id}
                                            className="py-4 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
                                        >
                                            <CardContent className="flex items-center gap-3 px-4">
                                                <meta.icon
                                                    className={cn(
                                                        'size-8 shrink-0',
                                                        meta.className,
                                                    )}
                                                />
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm font-medium">
                                                        {file.name}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {file.size} ·{' '}
                                                        {file.modifiedAt}
                                                    </p>
                                                </div>
                                                <FileActions file={file} />
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        </section>
                    )}
                </div>
            ) : (
                <div className="rounded-xl border bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="min-w-52">Name</TableHead>
                                <TableHead>Owner</TableHead>
                                <TableHead>Modified</TableHead>
                                <TableHead className="text-right">
                                    Size
                                </TableHead>
                                <TableHead>Sharing</TableHead>
                                <TableHead className="w-12" />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {visible.map((file) => {
                                const meta = typeMeta[file.type];

                                return (
                                    <TableRow key={file.id}>
                                        <TableCell>
                                            <span className="flex items-center gap-2.5 font-medium">
                                                <meta.icon
                                                    className={cn(
                                                        'size-4.5 shrink-0',
                                                        meta.className,
                                                    )}
                                                />
                                                {file.name}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {file.owner}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {file.modifiedAt}
                                        </TableCell>
                                        <TableCell className="text-right text-muted-foreground tabular-nums">
                                            {file.size ?? `${file.items} items`}
                                        </TableCell>
                                        <TableCell>
                                            {file.shared ? (
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
                                            <FileActions file={file} />
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            )}
        </>
    );
}
