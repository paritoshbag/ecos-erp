import { useSyncExternalStore } from 'react';
import type { Accent, ChromeSkin, Density, NavMode } from '@/lib/chrome-skins';
import { accents, chromeSkins, densities } from '@/lib/chrome-skins';

/*
 * Every user-tunable interface preference in one store.
 *
 * Two rules keep this predictable across a codebase that will eventually hold
 * hundreds of screens:
 *
 *  1. The DOM is the state. Each preference lands on <html> as an attribute or
 *     a custom property, and the CSS in resources/css/app.css reacts. Nothing
 *     re-renders to change a color, a density or a font size.
 *  2. One localStorage key. `ecos.ui` holds the whole blob, which is what the
 *     inline boot script in resources/views/app.blade.php reads to paint the
 *     first frame correctly — no flash of default chrome.
 *
 * Keep STORAGE_KEY and the attribute names in sync with that boot script.
 */

export const STORAGE_KEY = 'ecos.ui';

export type UiPreferences = {
    accent: Accent;
    sidebarSkin: ChromeSkin;
    topbarSkin: ChromeSkin;
    navMode: NavMode;
    density: Density;
    /** Type-ramp multiplier — scales text without disturbing layout spacing. */
    fontScale: number;
    /** Interface zoom — scales the rem unit, so type and layout move together. */
    zoom: number;
    contrast: 'normal' | 'high';
    reduceMotion: boolean;
    /** Notification / feedback sound level, 0–100. */
    volume: number;
    muted: boolean;
};

export const FONT_SCALE_MIN = 0.85;
export const FONT_SCALE_MAX = 1.5;
export const FONT_SCALE_STEP = 0.05;

export const ZOOM_MIN = 0.8;
export const ZOOM_MAX = 1.5;
export const ZOOM_STEP = 0.1;

export const defaultPreferences: UiPreferences = {
    accent: 'ecos',
    sidebarSkin: 'midnight',
    topbarSkin: 'default',
    navMode: 'sidebar',
    density: 'cozy',
    fontScale: 1,
    zoom: 1,
    contrast: 'normal',
    reduceMotion: false,
    volume: 60,
    muted: false,
};

const clamp = (value: number, min: number, max: number): number =>
    Math.min(max, Math.max(min, value));

/* Round to the step grid so repeated +/- presses never drift (0.9500000001). */
const snap = (value: number, step: number): number =>
    Math.round(value / step) * step;

const densityScale = (density: Density): number =>
    densities.find((entry) => entry.value === density)?.scale ?? 1;

/*
 * Defensive read: preferences survive deploys, so an unknown skin name from an
 * older build must degrade to the default rather than render an unstyled bar.
 */
function normalize(input: unknown): UiPreferences {
    const raw = (input ?? {}) as Partial<Record<keyof UiPreferences, unknown>>;

    const oneOf = <T extends string>(
        value: unknown,
        allowed: readonly T[],
        fallback: T,
    ): T => (allowed.includes(value as T) ? (value as T) : fallback);

    const numberOr = (value: unknown, fallback: number): number =>
        typeof value === 'number' && Number.isFinite(value) ? value : fallback;

    const skinValues = chromeSkins.map((skin) => skin.value);

    return {
        accent: oneOf(
            raw.accent,
            accents.map((entry) => entry.value),
            defaultPreferences.accent,
        ),
        sidebarSkin: oneOf(
            raw.sidebarSkin,
            skinValues,
            defaultPreferences.sidebarSkin,
        ),
        topbarSkin: oneOf(
            raw.topbarSkin,
            skinValues,
            defaultPreferences.topbarSkin,
        ),
        navMode: oneOf(
            raw.navMode,
            ['sidebar', 'topbar'] as const,
            defaultPreferences.navMode,
        ),
        density: oneOf(
            raw.density,
            densities.map((entry) => entry.value),
            defaultPreferences.density,
        ),
        fontScale: clamp(
            numberOr(raw.fontScale, defaultPreferences.fontScale),
            FONT_SCALE_MIN,
            FONT_SCALE_MAX,
        ),
        zoom: clamp(
            numberOr(raw.zoom, defaultPreferences.zoom),
            ZOOM_MIN,
            ZOOM_MAX,
        ),
        contrast: oneOf(
            raw.contrast,
            ['normal', 'high'] as const,
            defaultPreferences.contrast,
        ),
        reduceMotion:
            typeof raw.reduceMotion === 'boolean'
                ? raw.reduceMotion
                : defaultPreferences.reduceMotion,
        volume: clamp(numberOr(raw.volume, defaultPreferences.volume), 0, 100),
        muted:
            typeof raw.muted === 'boolean'
                ? raw.muted
                : defaultPreferences.muted,
    };
}

let current: UiPreferences = defaultPreferences;

const listeners = new Set<() => void>();

const subscribe = (callback: () => void): (() => void) => {
    listeners.add(callback);

    return () => {
        listeners.delete(callback);
    };
};

const notify = (): void => listeners.forEach((listener) => listener());

const read = (): UiPreferences => {
    if (typeof window === 'undefined') {
        return defaultPreferences;
    }

    try {
        const stored = window.localStorage.getItem(STORAGE_KEY);

        return normalize(stored ? JSON.parse(stored) : {});
    } catch {
        return defaultPreferences;
    }
};

const write = (preferences: UiPreferences): void => {
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    } catch {
        /* Private-mode / quota failures must never break navigation. */
    }
};

/**
 * Push preferences onto <html>. Mirrors the inline boot script in
 * resources/views/app.blade.php — change one, change both.
 */
export function applyPreferences(preferences: UiPreferences): void {
    if (typeof document === 'undefined') {
        return;
    }

    const root = document.documentElement;

    const attribute = (name: string, value: string, omitWhen: string): void => {
        if (value === omitWhen) {
            root.removeAttribute(name);
        } else {
            root.setAttribute(name, value);
        }
    };

    /* The default accent lives on bare `:root`, so it carries no attribute. */
    attribute('data-accent', preferences.accent, 'ecos');
    root.setAttribute('data-sidebar-skin', preferences.sidebarSkin);
    root.setAttribute('data-topbar-skin', preferences.topbarSkin);
    root.setAttribute('data-nav-mode', preferences.navMode);
    root.setAttribute('data-density', preferences.density);
    attribute('data-contrast', preferences.contrast, 'normal');
    attribute(
        'data-motion',
        preferences.reduceMotion ? 'reduced' : 'normal',
        'normal',
    );

    root.style.setProperty('--ui-font-scale', String(preferences.fontScale));
    root.style.setProperty('--ui-zoom', String(preferences.zoom));
    root.style.setProperty(
        '--ui-density',
        String(densityScale(preferences.density)),
    );
}

export function initializeUiPreferences(): void {
    if (typeof window === 'undefined') {
        return;
    }

    current = read();
    applyPreferences(current);
}

/**
 * Short feedback tone, played at the user's chosen volume. Gives the volume
 * control something real to control and doubles as the audio cue for
 * notifications and destructive-action confirmations.
 */
export function playFeedbackTone(variant: 'notify' | 'error' = 'notify'): void {
    if (typeof window === 'undefined' || current.muted || current.volume <= 0) {
        return;
    }

    const AudioCtor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
            .webkitAudioContext;

    if (!AudioCtor) {
        return;
    }

    try {
        const context = new AudioCtor();
        const oscillator = context.createOscillator();
        const gain = context.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.value = variant === 'error' ? 320 : 660;

        /* Square the slider so the low end of the range stays usable. */
        const level = (current.volume / 100) ** 2 * 0.25;

        gain.gain.setValueAtTime(0.0001, context.currentTime);
        gain.gain.exponentialRampToValueAtTime(
            Math.max(level, 0.0002),
            context.currentTime + 0.012,
        );
        gain.gain.exponentialRampToValueAtTime(
            0.0001,
            context.currentTime + 0.22,
        );

        oscillator.connect(gain).connect(context.destination);
        oscillator.start();
        oscillator.stop(context.currentTime + 0.24);
        oscillator.onended = () => void context.close();
    } catch {
        /* Autoplay policy or an unavailable device — silence is acceptable. */
    }
}

export function useUiPreferences() {
    const preferences = useSyncExternalStore(
        subscribe,
        () => current,
        () => defaultPreferences,
    );

    const set = <K extends keyof UiPreferences>(
        key: K,
        value: UiPreferences[K],
    ): void => {
        current = normalize({ ...current, [key]: value });
        write(current);
        applyPreferences(current);
        notify();
    };

    const adjustFontScale = (delta: number): void =>
        set(
            'fontScale',
            clamp(
                snap(preferences.fontScale + delta, FONT_SCALE_STEP),
                FONT_SCALE_MIN,
                FONT_SCALE_MAX,
            ),
        );

    const adjustZoom = (delta: number): void =>
        set(
            'zoom',
            clamp(
                snap(preferences.zoom + delta, ZOOM_STEP),
                ZOOM_MIN,
                ZOOM_MAX,
            ),
        );

    /* Resets accessibility only — chrome skins are a branding choice, not one. */
    const resetAccessibility = (): void => {
        current = normalize({
            ...current,
            fontScale: defaultPreferences.fontScale,
            zoom: defaultPreferences.zoom,
            contrast: defaultPreferences.contrast,
            reduceMotion: defaultPreferences.reduceMotion,
            volume: defaultPreferences.volume,
            muted: defaultPreferences.muted,
        });
        write(current);
        applyPreferences(current);
        notify();
    };

    const resetAll = (): void => {
        current = defaultPreferences;
        write(current);
        applyPreferences(current);
        notify();
    };

    return {
        preferences,
        set,
        adjustFontScale,
        adjustZoom,
        resetAccessibility,
        resetAll,
    } as const;
}
