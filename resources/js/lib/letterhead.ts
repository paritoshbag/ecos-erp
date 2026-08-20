import type {
    LetterheadHeader,
    LetterheadRecord,
    PaperSize,
    TokenValues,
} from '@/types/letterhead';

export const TOKEN_LABELS: Record<string, string> = {
    company_name: 'Company',
    gst: 'GST',
    pan: 'PAN',
    address: 'Address',
    email: 'Email',
    website: 'Website',
    mobile: 'Mobile',
    secondary_mobile: 'Mobile 2',
    company_type: 'Type',
    vendor_code: 'Vendor',
    field1: 'Field 1',
    field2: 'Field 2',
    field3: 'Field 3',
    field4: 'Field 4',
    field5: 'Field 5',
};

export const DEMO_BODY = [
    'SAMPLE TEST REPORT',
    'Report no. TR-2026-0142    Date: 20 August 2026',
    'This is demo body text so you can see how a report will sit on this letterhead. The real document replaces this block.',
    '1. Scope — The work described below was carried out in accordance with the agreed specification.',
    '2. Findings — All inspected items were found to be within acceptable limits for this demonstration.',
    '3. Remarks — No further action is required. This preview uses your organisation details in the header and footer.',
];

export function substitute(text: string, values: TokenValues): string {
    return text.replace(
        /\{\{([a-z0-9_]+)\}\}/gi,
        (_match, key: string) => values[key.toLowerCase()] ?? '',
    );
}

export function paperAspect(size: PaperSize): number {
    return size === 'letter' ? 215.9 / 279.4 : 210 / 297;
}

export function headerLines(
    header: LetterheadHeader,
    values: TokenValues,
): string[] {
    return header.lines
        .map((line) => substitute(line, values).trim())
        .filter((line) => line !== '');
}

export function roundPercent(value: number): number {
    return Math.round(value * 100) / 100;
}

export function clampWritableArea(area: {
    top: number;
    left: number;
    width: number;
    height: number;
}): {
    top: number;
    left: number;
    width: number;
    height: number;
} {
    const min = 10;
    const left = Math.min(100 - min, Math.max(0, roundPercent(area.left)));
    const top = Math.min(100 - min, Math.max(0, roundPercent(area.top)));
    const width = Math.min(
        roundPercent(100 - left),
        Math.max(min, roundPercent(area.width)),
    );
    const height = Math.min(
        roundPercent(100 - top),
        Math.max(min, roundPercent(area.height)),
    );

    return { top, left, width, height };
}

export function draftFromLetterhead(letterhead: LetterheadRecord) {
    const area = clampWritableArea({
        top: Number(letterhead.writable_top) || 18,
        left: Number(letterhead.writable_left) || 8,
        width: Number(letterhead.writable_width) || 84,
        height: Number(letterhead.writable_height) || 65,
    });

    return {
        name: letterhead.name,
        paper_size: letterhead.paper_size,
        header: {
            layout: letterhead.header?.layout ?? 'classic',
            lines: [...(letterhead.header?.lines ?? [])],
        },
        footer: {
            lines: [...(letterhead.footer?.lines ?? [])],
        },
        writable_top: area.top,
        writable_left: area.left,
        writable_width: area.width,
        writable_height: area.height,
    };
}

export function savePayload(
    letterhead: LetterheadRecord,
    draft: LetterheadDraft,
): Record<string, unknown> {
    const area = clampWritableArea({
        top: draft.writable_top,
        left: draft.writable_left,
        width: draft.writable_width,
        height: draft.writable_height,
    });

    if (letterhead.type === 'scanned') {
        return {
            name: draft.name,
            paper_size: draft.paper_size,
            writable_top: area.top,
            writable_left: area.left,
            writable_width: area.width,
            writable_height: area.height,
        };
    }

    return {
        name: draft.name,
        paper_size: draft.paper_size,
        header: draft.header,
        footer: draft.footer,
    };
}

export type LetterheadDraft = ReturnType<typeof draftFromLetterhead>;
