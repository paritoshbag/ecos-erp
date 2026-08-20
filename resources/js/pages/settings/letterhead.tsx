import { Head, router, useHttp } from '@inertiajs/react';
import { useMemo, useRef, useState } from 'react';
import {
    activate,
    destroy,
    duplicate,
    storeLogo,
    update,
} from '@/actions/App/Http/Controllers/Settings/LetterheadController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { DesignedEditor } from '@/components/letterhead/designed-editor';
import { PaperPreview } from '@/components/letterhead/paper-preview';
import type { PreviewModel } from '@/components/letterhead/paper-preview';
import { PresetGallery } from '@/components/letterhead/preset-gallery';
import { ScanUploader } from '@/components/letterhead/scan-uploader';
import { WritableArea } from '@/components/letterhead/writable-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { draftFromLetterhead, savePayload } from '@/lib/letterhead';
import type { LetterheadDraft } from '@/lib/letterhead';
import { edit } from '@/routes/letterhead';
import type {
    LetterheadPreset,
    LetterheadRecord,
    PaperSize,
    TokenValues,
} from '@/types/letterhead';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

function previewFromDraft(
    letterhead: LetterheadRecord | null,
    draft: LetterheadDraft | null,
    preset: LetterheadPreset | null,
): PreviewModel | null {
    if (letterhead && draft) {
        return {
            type: letterhead.type,
            paper_size: draft.paper_size,
            header: draft.header,
            footer: draft.footer,
            has_logo: letterhead.has_logo,
            has_background: letterhead.has_background,
            logoId: letterhead.id,
            backgroundId: letterhead.id,
            cacheKey: letterhead.updated_at,
            writable_top: draft.writable_top,
            writable_left: draft.writable_left,
            writable_width: draft.writable_width,
            writable_height: draft.writable_height,
        };
    }

    if (preset) {
        return {
            type: 'designed',
            paper_size: 'a4',
            header: preset.header,
            footer: preset.footer,
            has_logo: false,
            has_background: false,
            writable_top: 20,
            writable_left: 8,
            writable_width: 84,
            writable_height: 68,
        };
    }

    return null;
}

export default function LetterheadSettings(props: {
    presets: LetterheadPreset[];
    tokens: string[];
    tokenValues: TokenValues;
    letterheads: LetterheadRecord[];
    selectedId: number | null;
}) {
    return <LetterheadEditor key={props.selectedId ?? 'none'} {...props} />;
}

LetterheadSettings.layout = {
    breadcrumbs: [
        {
            title: 'Letterhead',
            href: edit(),
        },
    ],
};

function LetterheadEditor({
    presets,
    tokens,
    tokenValues,
    letterheads,
    selectedId,
}: {
    presets: LetterheadPreset[];
    tokens: string[];
    tokenValues: TokenValues;
    letterheads: LetterheadRecord[];
    selectedId: number | null;
}) {
    const initial =
        letterheads.find((item) => item.id === selectedId) ??
        letterheads[0] ??
        null;
    const [tab, setTab] = useState<'designed' | 'scanned'>(
        initial?.type === 'scanned' ? 'scanned' : 'designed',
    );
    const [selectedLetterheadId, setSelectedLetterheadId] = useState<
        number | null
    >(initial?.id ?? null);
    const [selectedPresetKey, setSelectedPresetKey] = useState<string | null>(
        initial?.source_preset && !initial.is_custom
            ? initial.source_preset
            : (presets[0]?.key ?? null),
    );
    const [draft, setDraft] = useState<LetterheadDraft | null>(
        initial ? draftFromLetterhead(initial) : null,
    );
    const [uploadPaperSize, setUploadPaperSize] = useState<PaperSize>('a4');
    const [status, setStatus] = useState<SaveStatus>('idle');
    const logoInputRef = useRef<HTMLInputElement>(null);
    const saveTimer = useRef<number>(0);
    const { patch, processing, errors, transform } = useHttp({
        name: '',
        paper_size: 'a4' as PaperSize,
        header: { layout: 'classic' as const, lines: [] as string[] },
        footer: { lines: [] as string[] },
        writable_top: 18,
        writable_left: 8,
        writable_width: 84,
        writable_height: 65,
    });

    const selected =
        letterheads.find((item) => item.id === selectedLetterheadId) ?? null;
    const selectedPreset =
        presets.find((preset) => preset.key === selectedPresetKey) ?? null;
    const designedLetterheads = letterheads.filter(
        (item) => item.type === 'designed',
    );
    const scannedLetterheads = letterheads.filter(
        (item) => item.type === 'scanned',
    );
    const preview = useMemo(
        () =>
            previewFromDraft(
                selected,
                draft,
                selected && draft ? null : selectedPreset,
            ),
        [selected, draft, selectedPreset],
    );

    function queueSave(next: LetterheadDraft): void {
        if (!selected?.is_custom) {
            return;
        }

        const letterheadId = selected.id;
        const payload = savePayload(selected, next);
        setStatus('saving');
        window.clearTimeout(saveTimer.current);
        saveTimer.current = window.setTimeout(() => {
            transform(() => payload);
            void patch(update.url(letterheadId), {
                onSuccess: () => setStatus('saved'),
                onError: () => setStatus('error'),
                onHttpException: () => {
                    setStatus('error');
                },
                onNetworkError: () => {
                    setStatus('error');
                },
            }).catch(() => {
                setStatus('error');
            });
        }, 700);
    }

    function changeDraft(partial: Partial<LetterheadDraft>): void {
        if (!draft) {
            return;
        }

        const next = { ...draft, ...partial };
        setDraft(next);
        queueSave(next);
    }

    function selectSaved(letterhead: LetterheadRecord): void {
        window.clearTimeout(saveTimer.current);
        setSelectedLetterheadId(letterhead.id);
        setDraft(draftFromLetterhead(letterhead));
        setStatus('idle');

        if (letterhead.source_preset && !letterhead.is_custom) {
            setSelectedPresetKey(letterhead.source_preset);
        }
    }

    const statusLabel =
        status === 'saving' || processing
            ? 'Saving…'
            : status === 'saved'
              ? 'Saved'
              : status === 'error'
                ? 'Could not save'
                : selected?.is_custom
                  ? 'Autosave on'
                  : null;

    return (
        <>
            <Head title="Letterhead" />

            <h1 className="sr-only">Letterhead settings</h1>

            <div className="space-y-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <Heading
                        variant="small"
                        title="Letterhead"
                        description="Stationery used on reports. Changes save automatically."
                    />
                    {statusLabel && (
                        <p
                            className={
                                status === 'error'
                                    ? 'text-sm text-destructive'
                                    : 'text-sm text-muted-foreground'
                            }
                        >
                            {statusLabel}
                        </p>
                    )}
                </div>

                <div className="grid items-start gap-8 xl:grid-cols-[minmax(0,1fr)_300px]">
                    <Tabs
                        value={tab}
                        onValueChange={(value) =>
                            setTab(value === 'scanned' ? 'scanned' : 'designed')
                        }
                    >
                        <TabsList>
                            <TabsTrigger value="designed">Designed</TabsTrigger>
                            <TabsTrigger value="scanned">
                                Scanned stationery
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="designed" className="space-y-6">
                            <PresetGallery
                                presets={presets}
                                letterheads={letterheads}
                                selectedPresetKey={
                                    selected?.is_custom
                                        ? null
                                        : selectedPresetKey
                                }
                                tokenValues={tokenValues}
                                onSelectPreset={(key) => {
                                    const saved = letterheads.find(
                                        (item) =>
                                            item.source_preset === key &&
                                            !item.is_custom,
                                    );

                                    setSelectedPresetKey(key);
                                    setSelectedLetterheadId(saved?.id ?? null);
                                    setDraft(
                                        saved
                                            ? draftFromLetterhead(saved)
                                            : null,
                                    );
                                    setStatus('idle');
                                }}
                            />

                            {designedLetterheads.some(
                                (item) => item.is_custom,
                            ) && (
                                <div className="space-y-2">
                                    <Label>Your copies</Label>
                                    <div className="flex flex-wrap gap-2">
                                        {designedLetterheads
                                            .filter((item) => item.is_custom)
                                            .map((item) => (
                                                <Button
                                                    key={item.id}
                                                    type="button"
                                                    size="sm"
                                                    variant={
                                                        selected?.id === item.id
                                                            ? 'default'
                                                            : 'outline'
                                                    }
                                                    onClick={() =>
                                                        selectSaved(item)
                                                    }
                                                >
                                                    {item.name}
                                                    {item.is_active && (
                                                        <Badge className="ml-1">
                                                            Active
                                                        </Badge>
                                                    )}
                                                </Button>
                                            ))}
                                    </div>
                                </div>
                            )}

                            {selected?.type === 'designed' && draft && (
                                <div className="space-y-4 rounded-lg border p-4">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <div>
                                            <p className="font-medium">
                                                {selected.name}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {selected.is_custom
                                                    ? 'Editable copy'
                                                    : 'Starter layout — customize to edit header and footer'}
                                            </p>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {!selected.is_active && (
                                                <Button
                                                    size="sm"
                                                    onClick={() =>
                                                        router.post(
                                                            activate.url(
                                                                selected.id,
                                                            ),
                                                        )
                                                    }
                                                >
                                                    Use on reports
                                                </Button>
                                            )}
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() =>
                                                    router.post(
                                                        duplicate.url(
                                                            selected.id,
                                                        ),
                                                    )
                                                }
                                            >
                                                Duplicate
                                            </Button>
                                            {!selected.is_active && (
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => {
                                                        if (
                                                            window.confirm(
                                                                'Delete this letterhead?',
                                                            )
                                                        ) {
                                                            router.delete(
                                                                destroy.url(
                                                                    selected.id,
                                                                ),
                                                            );
                                                        }
                                                    }}
                                                >
                                                    Delete
                                                </Button>
                                            )}
                                        </div>
                                    </div>

                                    {selected.is_custom && (
                                        <div className="grid gap-4">
                                            <div className="grid gap-2 sm:grid-cols-2">
                                                <div className="grid gap-2">
                                                    <Label htmlFor="letterhead-name">
                                                        Name
                                                    </Label>
                                                    <Input
                                                        id="letterhead-name"
                                                        value={draft.name}
                                                        onChange={(event) =>
                                                            changeDraft({
                                                                name: event
                                                                    .target
                                                                    .value,
                                                            })
                                                        }
                                                    />
                                                    <InputError
                                                        message={errors.name}
                                                    />
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label>Paper</Label>
                                                    <Select
                                                        value={draft.paper_size}
                                                        onValueChange={(
                                                            value: PaperSize,
                                                        ) =>
                                                            changeDraft({
                                                                paper_size:
                                                                    value,
                                                            })
                                                        }
                                                    >
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="a4">
                                                                A4
                                                            </SelectItem>
                                                            <SelectItem value="letter">
                                                                US Letter
                                                            </SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>

                                            <div className="grid gap-2">
                                                <Label>Logo</Label>
                                                <input
                                                    ref={logoInputRef}
                                                    type="file"
                                                    accept="image/png,image/jpeg,image/webp"
                                                    className="sr-only"
                                                    onChange={(event) => {
                                                        const file =
                                                            event.target
                                                                .files?.[0];

                                                        if (!file) {
                                                            return;
                                                        }

                                                        const data =
                                                            new FormData();
                                                        data.append(
                                                            'logo',
                                                            file,
                                                        );
                                                        router.post(
                                                            storeLogo.url(
                                                                selected.id,
                                                            ),
                                                            data,
                                                            {
                                                                forceFormData: true,
                                                            },
                                                        );
                                                        event.target.value = '';
                                                    }}
                                                />
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="outline"
                                                    className="w-fit"
                                                    onClick={() =>
                                                        logoInputRef.current?.click()
                                                    }
                                                >
                                                    {selected.has_logo
                                                        ? 'Replace logo'
                                                        : 'Upload logo'}
                                                </Button>
                                            </div>

                                            <DesignedEditor
                                                header={draft.header}
                                                footer={draft.footer}
                                                tokens={tokens}
                                                onHeaderChange={(header) =>
                                                    changeDraft({ header })
                                                }
                                                onFooterChange={(footer) =>
                                                    changeDraft({ footer })
                                                }
                                            />
                                        </div>
                                    )}
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="scanned" className="space-y-6">
                            <div className="grid gap-2 sm:max-w-xs">
                                <Label>Paper size for new uploads</Label>
                                <Select
                                    value={uploadPaperSize}
                                    onValueChange={(value: PaperSize) =>
                                        setUploadPaperSize(value)
                                    }
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="a4">A4</SelectItem>
                                        <SelectItem value="letter">
                                            US Letter
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <ScanUploader paperSize={uploadPaperSize} />

                            {scannedLetterheads.length > 0 && (
                                <div className="space-y-2">
                                    <Label>Uploaded scans</Label>
                                    <div className="flex flex-wrap gap-2">
                                        {scannedLetterheads.map((item) => (
                                            <Button
                                                key={item.id}
                                                type="button"
                                                size="sm"
                                                variant={
                                                    selected?.id === item.id
                                                        ? 'default'
                                                        : 'outline'
                                                }
                                                onClick={() => {
                                                    setTab('scanned');
                                                    selectSaved(item);
                                                }}
                                            >
                                                {item.name}
                                                {item.is_active && (
                                                    <Badge className="ml-1">
                                                        Active
                                                    </Badge>
                                                )}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {selected?.type === 'scanned' && draft && (
                                <div className="space-y-4 rounded-lg border p-4">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <div className="grid max-w-sm flex-1 gap-2">
                                            <Label htmlFor="scan-name">
                                                Name
                                            </Label>
                                            <Input
                                                id="scan-name"
                                                value={draft.name}
                                                onChange={(event) =>
                                                    changeDraft({
                                                        name: event.target
                                                            .value,
                                                    })
                                                }
                                            />
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {!selected.is_active && (
                                                <Button
                                                    size="sm"
                                                    onClick={() =>
                                                        router.post(
                                                            activate.url(
                                                                selected.id,
                                                            ),
                                                        )
                                                    }
                                                >
                                                    Use on reports
                                                </Button>
                                            )}
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() =>
                                                    router.post(
                                                        duplicate.url(
                                                            selected.id,
                                                        ),
                                                    )
                                                }
                                            >
                                                Duplicate
                                            </Button>
                                            {!selected.is_active && (
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => {
                                                        if (
                                                            window.confirm(
                                                                'Delete this letterhead?',
                                                            )
                                                        ) {
                                                            router.delete(
                                                                destroy.url(
                                                                    selected.id,
                                                                ),
                                                            );
                                                        }
                                                    }}
                                                >
                                                    Delete
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Drag the box on the preview to mark
                                        where report text should go. Everything
                                        outside that box is the printed header
                                        and footer.
                                    </p>
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>

                    <aside className="xl:sticky xl:top-6">
                        <p className="mb-3 text-sm font-medium">
                            Preview with demo text
                        </p>
                        {preview ? (
                            <PaperPreview
                                model={preview}
                                tokenValues={tokenValues}
                            >
                                {selected?.type === 'scanned' && draft ? (
                                    <WritableArea
                                        area={{
                                            top: draft.writable_top,
                                            left: draft.writable_left,
                                            width: draft.writable_width,
                                            height: draft.writable_height,
                                        }}
                                        onChange={(area) =>
                                            setDraft({
                                                ...draft,
                                                writable_top: area.top,
                                                writable_left: area.left,
                                                writable_width: area.width,
                                                writable_height: area.height,
                                            })
                                        }
                                        onCommit={(area) =>
                                            changeDraft({
                                                writable_top: area.top,
                                                writable_left: area.left,
                                                writable_width: area.width,
                                                writable_height: area.height,
                                            })
                                        }
                                    />
                                ) : null}
                            </PaperPreview>
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                Choose a template or upload a scan to see a
                                preview.
                            </p>
                        )}
                    </aside>
                </div>
            </div>
        </>
    );
}
