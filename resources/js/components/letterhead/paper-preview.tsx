import type { ReactNode } from 'react';
import {
    background,
    logo as letterheadLogo,
} from '@/actions/App/Http/Controllers/Settings/LetterheadController';
import {
    DEMO_BODY,
    headerLines,
    paperAspect,
    substitute,
} from '@/lib/letterhead';
import { cn } from '@/lib/utils';
import type {
    LetterheadFooter,
    LetterheadHeader,
    LetterheadKind,
    LetterheadLayout,
    PaperSize,
    TokenValues,
} from '@/types/letterhead';

export type PreviewModel = {
    type: LetterheadKind;
    paper_size: PaperSize;
    header: LetterheadHeader;
    footer: LetterheadFooter;
    has_logo: boolean;
    has_background: boolean;
    logoId?: number;
    backgroundId?: number;
    cacheKey?: number | null;
    writable_top: number;
    writable_left: number;
    writable_width: number;
    writable_height: number;
};

function fileUrl(
    builder: (
        id: number,
        options?: { query?: Record<string, string> },
    ) => { url: string } | string,
    id: number,
    cacheKey?: number | null,
): string {
    const result = builder(id, {
        query: cacheKey ? { v: String(cacheKey) } : undefined,
    });

    return typeof result === 'string' ? result : result.url;
}

function HeaderBlock({
    layout,
    lines,
    logoSrc,
}: {
    layout: LetterheadLayout;
    lines: string[];
    logoSrc?: string;
}) {
    const [title, ...rest] = lines;
    const logo = logoSrc ? (
        <img
            src={logoSrc}
            alt=""
            className="max-h-12 max-w-16 object-contain"
        />
    ) : null;

    if (layout === 'banner') {
        return (
            <header className="border-b border-neutral-200">
                <div className="bg-neutral-900 px-3 py-2 text-center text-[11px] font-semibold tracking-wide text-white">
                    {title || 'Company name'}
                </div>
                <div className="flex items-center gap-2 px-3 py-2">
                    {logo}
                    <div className="min-w-0 flex-1 text-[8px] leading-snug text-neutral-600">
                        {rest.map((line) => (
                            <p key={line} className="truncate">
                                {line}
                            </p>
                        ))}
                    </div>
                </div>
            </header>
        );
    }

    if (layout === 'centered') {
        return (
            <header className="flex flex-col items-center gap-1.5 border-b border-neutral-200 px-3 py-3 text-center">
                {logo}
                <p className="text-[12px] font-semibold tracking-tight text-neutral-900">
                    {title || 'Company name'}
                </p>
                {rest.map((line) => (
                    <p
                        key={line}
                        className="text-[8px] leading-snug text-neutral-600"
                    >
                        {line}
                    </p>
                ))}
            </header>
        );
    }

    if (layout === 'compact') {
        return (
            <header className="flex items-center gap-2 border-b border-neutral-200 px-3 py-1.5">
                {logo}
                <div className="min-w-0 text-[8px] leading-snug text-neutral-700">
                    {lines.map((line) => (
                        <p key={line} className="truncate">
                            {line}
                        </p>
                    ))}
                </div>
            </header>
        );
    }

    return (
        <header className="flex items-start gap-3 border-b border-neutral-200 px-3 py-3">
            {logo ?? (
                <div className="flex size-12 shrink-0 items-center justify-center rounded border border-dashed border-neutral-300 text-[8px] text-neutral-400">
                    Logo
                </div>
            )}
            <div className="min-w-0 flex-1 text-right">
                <p className="text-[12px] font-semibold tracking-tight text-neutral-900">
                    {title || 'Company name'}
                </p>
                {rest.map((line) => (
                    <p
                        key={line}
                        className="text-[8px] leading-snug text-neutral-600"
                    >
                        {line}
                    </p>
                ))}
            </div>
        </header>
    );
}

function DemoBody({ className }: { className?: string }) {
    return (
        <div
            className={cn(
                'space-y-1.5 text-[8px] leading-relaxed text-neutral-700',
                className,
            )}
        >
            <p className="text-[10px] font-semibold tracking-wide text-neutral-900">
                {DEMO_BODY[0]}
            </p>
            {DEMO_BODY.slice(1).map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
            ))}
        </div>
    );
}

export function PaperPreview({
    model,
    tokenValues,
    children,
    width = 280,
}: {
    model: PreviewModel;
    tokenValues: TokenValues;
    children?: ReactNode;
    width?: number;
}) {
    const height = width / paperAspect(model.paper_size);
    const lines = headerLines(model.header, tokenValues);
    const footer = model.footer.lines
        .map((line) => substitute(line, tokenValues).trim())
        .filter((line) => line !== '');
    const logoSrc =
        model.has_logo && model.logoId
            ? fileUrl(letterheadLogo.url, model.logoId, model.cacheKey)
            : undefined;
    const backgroundSrc =
        model.has_background && model.backgroundId
            ? fileUrl(background.url, model.backgroundId, model.cacheKey)
            : undefined;

    return (
        <div
            className="relative overflow-hidden bg-white text-neutral-900 shadow-lg ring-1 ring-black/10"
            style={{ width, height }}
        >
            {model.type === 'scanned' ? (
                <>
                    {backgroundSrc ? (
                        <img
                            src={backgroundSrc}
                            alt=""
                            className="absolute inset-0 size-full object-fill"
                        />
                    ) : (
                        <div className="absolute inset-0 bg-neutral-100" />
                    )}
                    <div
                        className="absolute overflow-hidden bg-white/90 p-2"
                        style={{
                            top: `${model.writable_top}%`,
                            left: `${model.writable_left}%`,
                            width: `${model.writable_width}%`,
                            height: `${model.writable_height}%`,
                        }}
                    >
                        <DemoBody />
                    </div>
                    {children}
                </>
            ) : (
                <div className="flex h-full flex-col">
                    <HeaderBlock
                        layout={model.header.layout}
                        lines={lines}
                        logoSrc={logoSrc}
                    />
                    <div className="min-h-0 flex-1 px-3 py-3">
                        <DemoBody />
                    </div>
                    <footer className="border-t border-neutral-200 px-3 py-2 text-center text-[8px] leading-snug text-neutral-500">
                        {footer.length > 0 ? (
                            footer.map((line) => <p key={line}>{line}</p>)
                        ) : (
                            <p>Footer</p>
                        )}
                    </footer>
                </div>
            )}
        </div>
    );
}
