/*
 * Navigation chrome skins.
 *
 * Each entry maps 1:1 to a `[data-sidebar-skin='…']` / `[data-topbar-skin='…']`
 * pair in resources/css/app.css. The `preview` values are the raw surface and
 * accent colors of that skin, used to paint the swatches in the theme
 * customizer — they are duplicated from the CSS on purpose so a swatch never
 * needs the skin to be applied in order to render.
 */

export type ChromeSkin =
    | 'default'
    | 'light'
    | 'slate'
    | 'midnight'
    | 'navy'
    | 'charcoal'
    | 'evergreen'
    | 'plum'
    | 'brand';

export type ChromeSkinOption = {
    value: ChromeSkin;
    label: string;
    /** `true` for the self-contained dark shades, used to group the picker. */
    dark: boolean;
    preview: {
        sidebar: string;
        topbar: string;
        accent: string;
    };
};

export const chromeSkins: ChromeSkinOption[] = [
    {
        value: 'default',
        label: 'Follow theme',
        dark: false,
        preview: {
            sidebar: 'oklch(0.975 0.004 277)',
            topbar: 'oklch(1 0 0)',
            accent: 'oklch(0.51 0.23 277)',
        },
    },
    {
        value: 'light',
        label: 'Always light',
        dark: false,
        preview: {
            sidebar: 'oklch(1 0 0)',
            topbar: 'oklch(1 0 0)',
            accent: 'oklch(0.51 0.23 277)',
        },
    },
    {
        value: 'slate',
        label: 'Slate',
        dark: true,
        preview: {
            sidebar: 'oklch(0.245 0.018 258)',
            topbar: 'oklch(0.275 0.02 258)',
            accent: 'oklch(0.72 0.14 258)',
        },
    },
    {
        value: 'midnight',
        label: 'Midnight',
        dark: true,
        preview: {
            sidebar: 'oklch(0.168 0.014 265)',
            topbar: 'oklch(0.198 0.016 265)',
            accent: 'oklch(0.7 0.15 270)',
        },
    },
    {
        value: 'navy',
        label: 'Navy',
        dark: true,
        preview: {
            sidebar: 'oklch(0.242 0.055 260)',
            topbar: 'oklch(0.272 0.058 260)',
            accent: 'oklch(0.74 0.13 245)',
        },
    },
    {
        value: 'charcoal',
        label: 'Charcoal',
        dark: true,
        preview: {
            sidebar: 'oklch(0.232 0.002 275)',
            topbar: 'oklch(0.262 0.002 275)',
            accent: 'oklch(0.78 0.005 275)',
        },
    },
    {
        value: 'evergreen',
        label: 'Evergreen',
        dark: true,
        preview: {
            sidebar: 'oklch(0.228 0.04 168)',
            topbar: 'oklch(0.258 0.044 168)',
            accent: 'oklch(0.76 0.13 160)',
        },
    },
    {
        value: 'plum',
        label: 'Plum',
        dark: true,
        preview: {
            sidebar: 'oklch(0.235 0.05 322)',
            topbar: 'oklch(0.265 0.052 322)',
            accent: 'oklch(0.75 0.14 322)',
        },
    },
    {
        value: 'brand',
        label: 'Brand indigo',
        dark: true,
        preview: {
            sidebar: 'oklch(0.252 0.078 277)',
            topbar: 'oklch(0.282 0.082 277)',
            accent: 'oklch(0.8 0.13 277)',
        },
    },
];

/* Accent palettes — `[data-accent='…']` blocks in app.css. */
export type Accent = 'ecos' | 'ocean' | 'forest' | 'voltage';

export type AccentOption = {
    value: Accent;
    label: string;
    swatch: string;
};

export const accents: AccentOption[] = [
    { value: 'ecos', label: 'ECOS Indigo', swatch: 'oklch(0.51 0.23 277)' },
    { value: 'ocean', label: 'Ocean Teal', swatch: 'oklch(0.52 0.11 215)' },
    { value: 'forest', label: 'Forest Green', swatch: 'oklch(0.52 0.12 160)' },
    { value: 'voltage', label: 'Voltage Amber', swatch: 'oklch(0.62 0.16 62)' },
];

/* Interface density — multiplies Tailwind's `--spacing` unit. */
export type Density = 'compact' | 'cozy' | 'comfortable';

export const densities: { value: Density; label: string; scale: number }[] = [
    { value: 'compact', label: 'Compact', scale: 0.82 },
    { value: 'cozy', label: 'Cozy', scale: 0.9 },
    { value: 'comfortable', label: 'Comfortable', scale: 1 },
];

/* Where the primary navigation lives on desktop. Mobile is always a drawer. */
export type NavMode = 'sidebar' | 'topbar';
