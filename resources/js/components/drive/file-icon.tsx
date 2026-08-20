import {
    FileArchive,
    FileImage,
    FileSpreadsheet,
    FileText,
    Folder,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const mimeIcon = (
    mime: string | null,
    type: 'folder' | 'file',
): { icon: LucideIcon; className: string } => {
    if (type === 'folder') {
        return { icon: Folder, className: 'text-primary' };
    }

    if (mime?.startsWith('image/')) {
        return { icon: FileImage, className: 'text-warning' };
    }

    if (
        mime === 'application/pdf' ||
        mime === 'application/msword' ||
        mime?.includes('wordprocessingml')
    ) {
        return { icon: FileText, className: 'text-destructive' };
    }

    if (mime?.includes('spreadsheet') || mime === 'application/vnd.ms-excel') {
        return { icon: FileSpreadsheet, className: 'text-success' };
    }

    if (mime === 'application/zip' || mime === 'application/x-zip-compressed') {
        return { icon: FileArchive, className: 'text-muted-foreground' };
    }

    return { icon: FileText, className: 'text-muted-foreground' };
};

export function DriveFileIcon({
    type,
    mime,
    className,
}: {
    type: 'folder' | 'file';
    mime?: string | null;
    className?: string;
}) {
    const meta = mimeIcon(mime ?? null, type);
    const Icon = meta.icon;

    return (
        <Icon
            className={cn(
                'size-8 shrink-0',
                type === 'folder' && 'fill-primary/15',
                meta.className,
                className,
            )}
        />
    );
}
