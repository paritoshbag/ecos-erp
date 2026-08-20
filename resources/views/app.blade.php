<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark' => ($appearance ?? 'system') == 'dark'])>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        {{-- Inline script to detect system dark mode preference and apply it immediately --}}
        <script>
            (function() {
                const appearance = '{{ $appearance ?? "system" }}';

                if (appearance === 'system') {
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

                    if (prefersDark) {
                        document.documentElement.classList.add('dark');
                    }
                }
            })();
        </script>

        {{--
            Interface preferences, applied before the first paint.

            Mirrors applyPreferences() in resources/js/hooks/use-ui-preferences.ts.
            Without this the page paints with default chrome and then snaps to the
            user's navy sidebar / high contrast / larger text a frame later — the
            classic admin-template flash. Keep the two in sync.
        --}}
        <script>
            (function() {
                const DENSITY = { compact: 0.82, cozy: 0.9, comfortable: 1 };
                const root = document.documentElement;

                let prefs = {};

                try {
                    prefs = JSON.parse(localStorage.getItem('ecos.ui') || '{}') || {};
                } catch (error) {
                    prefs = {};
                }

                const clamp = (value, min, max, fallback) =>
                    typeof value === 'number' && isFinite(value)
                        ? Math.min(max, Math.max(min, value))
                        : fallback;

                if (prefs.accent && prefs.accent !== 'ecos') {
                    root.setAttribute('data-accent', prefs.accent);
                }

                root.setAttribute('data-sidebar-skin', prefs.sidebarSkin || 'midnight');
                root.setAttribute('data-topbar-skin', prefs.topbarSkin || 'default');
                root.setAttribute('data-nav-mode', prefs.navMode || 'sidebar');
                root.setAttribute('data-density', prefs.density || 'cozy');

                if (prefs.contrast === 'high') {
                    root.setAttribute('data-contrast', 'high');
                }

                if (prefs.reduceMotion === true) {
                    root.setAttribute('data-motion', 'reduced');
                }

                root.style.setProperty('--ui-font-scale', clamp(prefs.fontScale, 0.85, 1.5, 1));
                root.style.setProperty('--ui-zoom', clamp(prefs.zoom, 0.8, 1.5, 1));
                root.style.setProperty('--ui-density', DENSITY[prefs.density] || DENSITY.cozy);
            })();
        </script>

        {{-- Inline style to set the HTML background color based on our theme in app.css --}}
        <style>
            html {
                background-color: oklch(0.985 0.002 277);
            }

            html.dark {
                background-color: oklch(0.155 0.015 277);
            }
        </style>

        <link rel="icon" href="/favicon.ico" sizes="any">
        <link rel="icon" href="/favicon.svg" type="image/svg+xml">
        <link rel="apple-touch-icon" href="/apple-touch-icon.png">

        @fonts

        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        <x-inertia::head>
            <title>{{ config('app.name', 'ECOS') }}</title>
        </x-inertia::head>
    </head>
    <body class="font-sans antialiased">
        <x-inertia::app />
    </body>
</html>
