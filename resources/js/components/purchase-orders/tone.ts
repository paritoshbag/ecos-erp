/*
 * Tonal palette for the purchase order profile.
 * -------------------------------------------
 * Each stage of a PO's life owns a colour so a reader can orient by hue
 * before reading a single label: commercial facts are indigo, execution is
 * amber, billing is blue, money out is green, deductions are red.
 * Every tone still pairs with an icon and a text label — colour is never the
 * only signal.
 */
export type PoTone =
    'primary' | 'info' | 'success' | 'warning' | 'destructive' | 'neutral';

/* Foreground colour for figures and icons. Warning flips in light mode: the
 * raw amber token is too light to read on a white card. */
export const toneText: Record<PoTone, string> = {
    primary: 'text-primary',
    info: 'text-info',
    success: 'text-success',
    warning: 'text-warning-foreground dark:text-warning',
    destructive: 'text-destructive',
    neutral: 'text-foreground',
};

/* Solid fill — used for the 1px status rail and stepper nodes. */
export const toneFill: Record<PoTone, string> = {
    primary: 'bg-primary',
    info: 'bg-info',
    success: 'bg-success',
    warning: 'bg-warning',
    destructive: 'bg-destructive',
    neutral: 'bg-muted-foreground',
};

/* Tinted strip behind a section heading. */
export const toneHeader: Record<PoTone, string> = {
    primary: 'bg-primary/8 text-primary',
    info: 'bg-info/10 text-info',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/15 text-warning-foreground dark:text-warning',
    destructive: 'bg-destructive/10 text-destructive',
    neutral: 'bg-muted text-muted-foreground',
};

/* Wash behind the hero header band. */
export const toneBand: Record<PoTone, string> = {
    primary: 'bg-primary/5',
    info: 'bg-info/6',
    success: 'bg-success/6',
    warning: 'bg-warning/8',
    destructive: 'bg-destructive/6',
    neutral: 'bg-muted/60',
};

/* Solid chip — fill plus its guaranteed-contrast foreground. */
export const toneSolid: Record<PoTone, string> = {
    primary: 'bg-primary text-primary-foreground',
    info: 'bg-info text-info-foreground',
    success: 'bg-success text-success-foreground',
    warning: 'bg-warning text-warning-foreground',
    destructive: 'bg-destructive text-destructive-foreground',
    neutral: 'bg-muted-foreground text-background',
};

/* Soft surface — tinted fill with a matching hairline border. */
export const toneSurface: Record<PoTone, string> = {
    primary: 'border-primary/25 bg-primary/6',
    info: 'border-info/25 bg-info/8',
    success: 'border-success/25 bg-success/8',
    warning: 'border-warning/35 bg-warning/12',
    destructive: 'border-destructive/25 bg-destructive/8',
    neutral: 'border-border bg-muted/50',
};
