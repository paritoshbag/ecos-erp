export type LetterheadLayout = 'classic' | 'centered' | 'banner' | 'compact';
export type PaperSize = 'a4' | 'letter';
export type LetterheadKind = 'designed' | 'scanned';

export type LetterheadHeader = {
    layout: LetterheadLayout;
    lines: string[];
};

export type LetterheadFooter = {
    lines: string[];
};

export type LetterheadRecord = {
    id: number;
    type: LetterheadKind;
    name: string;
    source_preset: string | null;
    paper_size: PaperSize;
    is_active: boolean;
    is_custom: boolean;
    header: LetterheadHeader;
    footer: LetterheadFooter;
    writable_top: number;
    writable_left: number;
    writable_width: number;
    writable_height: number;
    has_logo: boolean;
    has_background: boolean;
    updated_at: number | null;
};

export type LetterheadPreset = {
    key: string;
    name: string;
    description: string;
    header: LetterheadHeader;
    footer: LetterheadFooter;
};

export type TokenValues = Record<string, string>;
