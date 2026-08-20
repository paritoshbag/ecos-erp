import { router } from '@inertiajs/react';
import { CloudUpload } from 'lucide-react';
import { useRef, useState } from 'react';
import { storeScan } from '@/actions/App/Http/Controllers/Settings/LetterheadController';
import { Progress } from '@/components/ui/progress';
import { rasterizePdfFirstPage } from '@/lib/rasterize-pdf';
import { cn } from '@/lib/utils';
import type { PaperSize } from '@/types/letterhead';

export function ScanUploader({ paperSize }: { paperSize: PaperSize }) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [dragging, setDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);

    async function uploadFile(file: File): Promise<void> {
        setError(null);
        setUploading(true);
        setProgress(0);

        try {
            const payload =
                file.type === 'application/pdf' ||
                file.name.toLowerCase().endsWith('.pdf')
                    ? await rasterizePdfFirstPage(file)
                    : file;

            const data = new FormData();
            data.append('file', payload);
            data.append('paper_size', paperSize);

            router.post(storeScan.url(), data, {
                forceFormData: true,
                preserveScroll: true,
                onProgress: (event) => {
                    setProgress(event?.percentage ?? 0);
                },
                onFinish: () => {
                    setUploading(false);
                    setProgress(0);
                },
                onError: () => {
                    setError(
                        'Could not upload that file. Use a PNG, JPG, WebP or PDF.',
                    );
                },
            });
        } catch {
            setUploading(false);
            setError(
                'Could not read that PDF. Try exporting the first page as an image.',
            );
        }
    }

    return (
        <div
            role="button"
            tabIndex={0}
            aria-label="Upload scanned letterhead"
            onClick={() => {
                if (!uploading) {
                    inputRef.current?.click();
                }
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
                const file = event.dataTransfer.files[0];

                if (file) {
                    void uploadFile(file);
                }
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
                accept="image/png,image/jpeg,image/webp,application/pdf,.pdf"
                className="sr-only"
                onClick={(event) => event.stopPropagation()}
                onChange={(event) => {
                    const file = event.target.files?.[0];

                    if (file) {
                        void uploadFile(file);
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
                        ? 'Drop the scan to upload'
                        : 'Drop an A4 or Letter scan'}
                </p>
                <p className="text-xs text-muted-foreground">
                    PNG, JPG, WebP or PDF. The first PDF page is used.
                </p>
            </div>
            {uploading && (
                <Progress
                    value={progress}
                    className="mt-1 h-1.5 w-full max-w-md"
                />
            )}
            {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
    );
}
