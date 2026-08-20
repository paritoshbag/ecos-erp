import { router } from '@inertiajs/react';
import { storeFromPreset } from '@/actions/App/Http/Controllers/Settings/LetterheadController';
import { PaperPreview } from '@/components/letterhead/paper-preview';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type {
    LetterheadPreset,
    LetterheadRecord,
    TokenValues,
} from '@/types/letterhead';

export function PresetGallery({
    presets,
    letterheads,
    selectedPresetKey,
    tokenValues,
    onSelectPreset,
}: {
    presets: LetterheadPreset[];
    letterheads: LetterheadRecord[];
    selectedPresetKey: string | null;
    tokenValues: TokenValues;
    onSelectPreset: (key: string) => void;
}) {
    return (
        <div className="grid gap-3 sm:grid-cols-2">
            {presets.map((preset) => {
                const saved = letterheads.find(
                    (letterhead) =>
                        letterhead.source_preset === preset.key &&
                        !letterhead.is_custom &&
                        letterhead.type === 'designed',
                );
                const selected = selectedPresetKey === preset.key;

                return (
                    <div
                        key={preset.key}
                        className={cn(
                            'flex flex-col gap-3 rounded-lg border p-3',
                            selected
                                ? 'border-primary ring-1 ring-primary/30'
                                : 'border-border',
                        )}
                    >
                        <button
                            type="button"
                            className="flex gap-3 text-left"
                            onClick={() => onSelectPreset(preset.key)}
                        >
                            <div className="h-[134px] w-[84px] shrink-0 overflow-hidden rounded-sm bg-white shadow-sm ring-1 ring-black/10">
                                <div className="origin-top-left scale-[0.42]">
                                    <PaperPreview
                                        width={200}
                                        tokenValues={tokenValues}
                                        model={{
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
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="min-w-0 flex-1 space-y-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <p className="font-medium">{preset.name}</p>
                                    {saved?.is_active && <Badge>Active</Badge>}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {preset.description}
                                </p>
                            </div>
                        </button>
                        <div className="flex flex-wrap gap-2">
                            <Button
                                size="sm"
                                onClick={() =>
                                    router.post(storeFromPreset.url(), {
                                        preset: preset.key,
                                    })
                                }
                            >
                                Use on reports
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                    router.post(storeFromPreset.url(), {
                                        preset: preset.key,
                                        duplicate: true,
                                    })
                                }
                            >
                                Customize
                            </Button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
