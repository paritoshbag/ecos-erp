import { router } from '@inertiajs/react';
import { CloudUpload } from 'lucide-react';
import { useRef, useState } from 'react';
import { store as storeFile } from '@/actions/App/Http/Controllers/Drive/DriveFileController';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

type Props = {
    folderId: number | null;
};

export function DriveDropzone({ folderId }: Props) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [dragging, setDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentName, setCurrentName] = useState<string | null>(null);
    const [remaining, setRemaining] = useState(0);

    function uploadFiles(fileList: FileList | File[]): void {
        const files = Array.from(fileList).filter((file) => file.size >= 0);

        if (files.length === 0 || uploading) {
            return;
        }

        setUploading(true);
        setRemaining(files.length);
        uploadNext(files, 0);
    }

    function uploadNext(files: File[], index: number): void {
        const file = files[index];

        if (!file) {
            setUploading(false);
            setProgress(0);
            setCurrentName(null);
            setRemaining(0);

            return;
        }

        setCurrentName(file.name);
        setRemaining(files.length - index);
        setProgress(0);

        const data = new FormData();
        data.append('file', file);

        if (folderId !== null) {
            data.append('parent_id', String(folderId));
        }

        router.post(storeFile.url(), data, {
            forceFormData: true,
            preserveScroll: true,
            preserveState: true,
            onProgress: (event) => {
                setProgress(event?.percentage ?? 0);
            },
            onFinish: () => {
                uploadNext(files, index + 1);
            },
        });
    }

    return (
        <div
            role="button"
            tabIndex={0}
            aria-label="Upload files"
            onClick={(event) => {
                if (event.target === inputRef.current || uploading) {
                    return;
                }

                inputRef.current?.click();
            }}
            onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    inputRef.current?.click();
                }
            }}
            onDragEnter={(event) => {
                event.preventDefault();
                setDragging(true);
            }}
            onDragOver={(event) => {
                event.preventDefault();
                event.dataTransfer.dropEffect = 'copy';
                setDragging(true);
            }}
            onDragLeave={(event) => {
                event.preventDefault();

                if (
                    !event.currentTarget.contains(event.relatedTarget as Node)
                ) {
                    setDragging(false);
                }
            }}
            onDrop={(event) => {
                event.preventDefault();
                setDragging(false);
                uploadFiles(event.dataTransfer.files);
            }}
            className={cn(
                'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-6 py-8 text-center transition-colors',
                dragging
                    ? 'border-primary bg-primary/5'
                    : 'border-muted-foreground/30 bg-muted/30 hover:border-primary/50 hover:bg-muted/50',
                uploading && 'pointer-events-none opacity-80',
            )}
        >
            <input
                ref={inputRef}
                type="file"
                multiple
                className="sr-only"
                onClick={(event) => event.stopPropagation()}
                onChange={(event) => {
                    if (event.target.files) {
                        uploadFiles(event.target.files);
                    }

                    event.target.value = '';
                }}
            />
            <div className="flex size-11 items-center justify-center rounded-full bg-accent text-accent-foreground">
                <CloudUpload className="size-5" />
            </div>
            <div className="space-y-1">
                <p className="text-sm font-medium">
                    {dragging
                        ? 'Drop files to upload'
                        : 'Drag and drop files here'}
                </p>
                <p className="text-xs text-muted-foreground">
                    {uploading
                        ? `Uploading ${currentName ?? 'file'} (${remaining} remaining)`
                        : 'or click to browse. Multiple files are uploaded one after another.'}
                </p>
            </div>
            {uploading && (
                <Progress
                    value={progress}
                    className="mt-1 h-1.5 w-full max-w-md"
                />
            )}
        </div>
    );
}
