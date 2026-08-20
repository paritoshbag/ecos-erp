import { Head, Link } from '@inertiajs/react';
import { Download, Eye, Folder } from 'lucide-react';
import { DriveFileIcon } from '@/components/drive/file-icon';
import { EmptyState } from '@/components/template/empty-state';
import { PageHeader } from '@/components/template/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    download as publicDownload,
    preview as publicPreview,
    show as publicShow,
} from '@/routes/drive/public';

type PublicItem = {
    id: number;
    type: 'folder' | 'file';
    name: string;
    mime_type: string | null;
    size_label: string | null;
    items_count: number | null;
    can_preview: boolean;
};

type Props = {
    token: string;
    root: { id: number; name: string; type: 'folder' | 'file' };
    current: {
        id: number;
        name: string;
        type: 'folder' | 'file';
        mime_type: string | null;
        size_label: string | null;
        can_preview: boolean;
    };
    breadcrumbs: { title: string; href: string }[];
    items: PublicItem[];
};

export default function DrivePublic({
    token,
    current,
    breadcrumbs,
    items,
}: Props) {
    const fileQuery = { query: { item: current.id } };

    return (
        <>
            <Head title={current.name} />
            <div className="mx-auto flex min-h-screen max-w-5xl flex-col gap-4 p-6">
                <PageHeader
                    title={current.name}
                    description="Shared from the company drive."
                    actions={
                        current.type === 'file' ? (
                            <>
                                {current.can_preview && (
                                    <Button variant="outline" asChild>
                                        <a
                                            href={publicPreview.url(
                                                token,
                                                fileQuery,
                                            )}
                                        >
                                            <Eye className="size-4" /> Preview
                                        </a>
                                    </Button>
                                )}
                                <Button asChild>
                                    <a
                                        href={publicDownload.url(
                                            token,
                                            fileQuery,
                                        )}
                                    >
                                        <Download className="size-4" /> Download
                                    </a>
                                </Button>
                            </>
                        ) : null
                    }
                />

                <nav className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                    {breadcrumbs.map((crumb) => (
                        <Link
                            key={crumb.href}
                            href={crumb.href}
                            className="hover:text-foreground"
                        >
                            {crumb.title}
                        </Link>
                    ))}
                </nav>

                {current.type === 'file' && current.can_preview && (
                    <Card>
                        <CardContent className="p-4">
                            {current.mime_type?.startsWith('image/') ? (
                                <img
                                    src={publicPreview.url(token, fileQuery)}
                                    alt={current.name}
                                    className="mx-auto max-h-[70vh] rounded-md"
                                />
                            ) : (
                                <iframe
                                    title={current.name}
                                    src={publicPreview.url(token, fileQuery)}
                                    className="h-[70vh] w-full rounded-md border"
                                />
                            )}
                        </CardContent>
                    </Card>
                )}

                {current.type === 'folder' && items.length === 0 && (
                    <EmptyState
                        icon={Folder}
                        title="This folder is empty"
                        description="Nothing has been added here yet."
                    />
                )}

                {current.type === 'folder' && items.length > 0 && (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {items.map((item) => (
                            <Card key={item.id} className="py-4">
                                <CardContent className="flex items-center gap-3 px-4">
                                    {item.type === 'folder' ? (
                                        <Link
                                            href={publicShow.url(token, {
                                                query: { item: item.id },
                                            })}
                                            className="flex min-w-0 flex-1 items-center gap-3"
                                        >
                                            <DriveFileIcon type="folder" />
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-medium">
                                                    {item.name}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {item.items_count ?? 0}{' '}
                                                    items
                                                </p>
                                            </div>
                                        </Link>
                                    ) : (
                                        <div className="flex min-w-0 flex-1 items-center gap-3">
                                            <DriveFileIcon
                                                type="file"
                                                mime={item.mime_type}
                                            />
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium">
                                                    {item.name}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {item.size_label}
                                                </p>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                asChild
                                            >
                                                <a
                                                    href={publicDownload.url(
                                                        token,
                                                        {
                                                            query: {
                                                                item: item.id,
                                                            },
                                                        },
                                                    )}
                                                >
                                                    <Download className="size-4" />
                                                </a>
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
