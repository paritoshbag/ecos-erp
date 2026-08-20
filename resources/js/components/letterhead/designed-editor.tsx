import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TOKEN_LABELS } from '@/lib/letterhead';
import type {
    LetterheadFooter,
    LetterheadHeader,
    LetterheadLayout,
} from '@/types/letterhead';

const LAYOUTS: { value: LetterheadLayout; label: string }[] = [
    { value: 'classic', label: 'Classic' },
    { value: 'centered', label: 'Centered' },
    { value: 'banner', label: 'Banner' },
    { value: 'compact', label: 'Compact' },
];

function LineList({
    label,
    lines,
    tokens,
    onChange,
}: {
    label: string;
    lines: string[];
    tokens: string[];
    onChange: (lines: string[]) => void;
}) {
    return (
        <div className="grid gap-2">
            <Label>{label}</Label>
            <div className="flex flex-wrap gap-1">
                {tokens.map((token) => (
                    <Button
                        key={token}
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-7 px-2 text-xs"
                        onClick={() => {
                            const insertion = `{{${token}}}`;
                            const next = [...lines];

                            if (next.length === 0) {
                                onChange([insertion]);

                                return;
                            }

                            next[next.length - 1] =
                                `${next[next.length - 1]} ${insertion}`.trim();
                            onChange(next);
                        }}
                    >
                        {TOKEN_LABELS[token] ?? token}
                    </Button>
                ))}
            </div>
            <div className="grid gap-2">
                {lines.map((line, index) => (
                    <div key={index} className="flex gap-2">
                        <Input
                            value={line}
                            onChange={(event) => {
                                const next = [...lines];
                                next[index] = event.target.value;
                                onChange(next);
                            }}
                            aria-label={`${label} line ${index + 1}`}
                        />
                        <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            aria-label={`Remove ${label} line ${index + 1}`}
                            onClick={() =>
                                onChange(
                                    lines.filter(
                                        (_, lineIndex) => lineIndex !== index,
                                    ),
                                )
                            }
                        >
                            <Trash2 className="size-4" />
                        </Button>
                    </div>
                ))}
            </div>
            {lines.length < 12 && (
                <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="w-fit"
                    onClick={() => onChange([...lines, ''])}
                >
                    <Plus className="size-4" />
                    Add line
                </Button>
            )}
        </div>
    );
}

export function DesignedEditor({
    header,
    footer,
    tokens,
    onHeaderChange,
    onFooterChange,
}: {
    header: LetterheadHeader;
    footer: LetterheadFooter;
    tokens: string[];
    onHeaderChange: (header: LetterheadHeader) => void;
    onFooterChange: (footer: LetterheadFooter) => void;
}) {
    return (
        <div className="grid gap-6">
            <div className="grid gap-2">
                <Label>Layout</Label>
                <div className="flex flex-wrap gap-1">
                    {LAYOUTS.map((layout) => (
                        <Button
                            key={layout.value}
                            type="button"
                            size="sm"
                            variant={
                                header.layout === layout.value
                                    ? 'default'
                                    : 'outline'
                            }
                            onClick={() =>
                                onHeaderChange({
                                    ...header,
                                    layout: layout.value,
                                })
                            }
                        >
                            {layout.label}
                        </Button>
                    ))}
                </div>
            </div>

            <LineList
                label="Header"
                lines={header.lines}
                tokens={tokens}
                onChange={(lines) => onHeaderChange({ ...header, lines })}
            />

            <LineList
                label="Footer"
                lines={footer.lines}
                tokens={tokens}
                onChange={(lines) => onFooterChange({ lines })}
            />
        </div>
    );
}
