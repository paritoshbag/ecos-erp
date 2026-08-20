import {
    Check,
    PanelLeft,
    PanelTop,
    Paintbrush,
    RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { useUiPreferences } from '@/hooks/use-ui-preferences';
import type { Accent, ChromeSkin, Density, NavMode } from '@/lib/chrome-skins';
import { accents, chromeSkins, densities } from '@/lib/chrome-skins';
import { cn } from '@/lib/utils';

/*
 * Theme customizer — the panel a contractor uses to make the product look like
 * theirs: navigation layout, accent, and independent shades for the sidebar and
 * the topbar. Everything writes straight to <html> attributes, so the preview
 * *is* the application; there is no separate preview surface to keep in sync.
 */

function SkinGrid({
    value,
    onChange,
    region,
}: {
    value: ChromeSkin;
    onChange: (skin: ChromeSkin) => void;
    region: 'sidebar' | 'topbar';
}) {
    return (
        <div className="grid grid-cols-3 gap-1.5">
            {chromeSkins.map((skin) => {
                const selected = skin.value === value;
                const surface =
                    region === 'sidebar'
                        ? skin.preview.sidebar
                        : skin.preview.topbar;

                return (
                    <button
                        key={skin.value}
                        type="button"
                        onClick={() => onChange(skin.value)}
                        aria-pressed={selected}
                        className={cn(
                            'group relative overflow-hidden rounded-md border text-left transition-all',
                            selected
                                ? 'border-primary ring-2 ring-primary/30'
                                : 'border-border hover:border-primary/50',
                        )}
                    >
                        {/* Miniature of the chrome this skin produces. */}
                        <span
                            className="flex h-9 items-end gap-0.5 p-1"
                            style={{ background: surface }}
                        >
                            <span
                                className="h-1.5 w-4 rounded-full"
                                style={{ background: skin.preview.accent }}
                            />
                            <span
                                className="h-1.5 w-2.5 rounded-full opacity-40"
                                style={{ background: skin.preview.accent }}
                            />
                            {selected && (
                                <Check
                                    className="ml-auto size-3.5"
                                    style={{ color: skin.preview.accent }}
                                />
                            )}
                        </span>
                        <span className="block truncate border-t bg-card px-1.5 py-1 text-2xs font-medium">
                            {skin.label}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}

export function ThemeCustomizer() {
    const { preferences, set, resetAll } = useUiPreferences();

    return (
        <Sheet>
            <Tooltip>
                <TooltipTrigger asChild>
                    <SheetTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-topbar-foreground hover:bg-topbar-accent hover:text-topbar-accent-foreground"
                            aria-label="Customize appearance"
                        >
                            <Paintbrush className="size-4" />
                        </Button>
                    </SheetTrigger>
                </TooltipTrigger>
                <TooltipContent>Customize appearance</TooltipContent>
            </Tooltip>

            <SheetContent side="right" className="w-80 gap-0 p-0 sm:w-84">
                <SheetHeader className="p-4 pb-3">
                    <SheetTitle className="text-sm">Appearance</SheetTitle>
                    <SheetDescription className="text-xs">
                        Navigation layout and chrome colours for this browser.
                    </SheetDescription>
                </SheetHeader>
                <Separator />

                <div className="grid gap-4 overflow-y-auto p-4">
                    <div className="grid gap-1.5">
                        <Label className="text-xs font-medium">
                            Navigation layout
                        </Label>
                        <ToggleGroup
                            type="single"
                            variant="outline"
                            value={preferences.navMode}
                            onValueChange={(value) =>
                                value && set('navMode', value as NavMode)
                            }
                            className="w-full"
                        >
                            <ToggleGroupItem
                                value="sidebar"
                                className="h-8 flex-1 gap-1.5 text-xs"
                            >
                                <PanelLeft className="size-3.5" />
                                Sidebar
                            </ToggleGroupItem>
                            <ToggleGroupItem
                                value="topbar"
                                className="h-8 flex-1 gap-1.5 text-xs"
                            >
                                <PanelTop className="size-3.5" />
                                Topbar
                            </ToggleGroupItem>
                        </ToggleGroup>
                        <p className="text-2xs text-muted-foreground">
                            Topbar mode swaps the rail for a jumbo menu. Phones
                            and tablets always use the drawer.
                        </p>
                    </div>

                    <div className="grid gap-1.5">
                        <Label className="text-xs font-medium">Density</Label>
                        <ToggleGroup
                            type="single"
                            variant="outline"
                            value={preferences.density}
                            onValueChange={(value) =>
                                value && set('density', value as Density)
                            }
                            className="w-full"
                        >
                            {densities.map((density) => (
                                <ToggleGroupItem
                                    key={density.value}
                                    value={density.value}
                                    className="h-8 flex-1 text-xs"
                                >
                                    {density.label}
                                </ToggleGroupItem>
                            ))}
                        </ToggleGroup>
                    </div>

                    <Separator />

                    <div className="grid gap-1.5">
                        <Label className="text-xs font-medium">Accent</Label>
                        <div className="grid grid-cols-4 gap-1.5">
                            {accents.map((accent) => (
                                <button
                                    key={accent.value}
                                    type="button"
                                    onClick={() =>
                                        set('accent', accent.value as Accent)
                                    }
                                    aria-pressed={
                                        preferences.accent === accent.value
                                    }
                                    title={accent.label}
                                    className={cn(
                                        'flex h-10 items-center justify-center rounded-md border transition-all',
                                        preferences.accent === accent.value
                                            ? 'border-primary ring-2 ring-primary/30'
                                            : 'border-border hover:border-primary/50',
                                    )}
                                >
                                    <span
                                        className="flex size-5 items-center justify-center rounded-full"
                                        style={{ background: accent.swatch }}
                                    >
                                        {preferences.accent ===
                                            accent.value && (
                                            <Check className="size-3 text-white" />
                                        )}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid gap-1.5">
                        <Label className="text-xs font-medium">
                            Sidebar colour
                        </Label>
                        <SkinGrid
                            region="sidebar"
                            value={preferences.sidebarSkin}
                            onChange={(skin) => set('sidebarSkin', skin)}
                        />
                    </div>

                    <div className="grid gap-1.5">
                        <Label className="text-xs font-medium">
                            Topbar colour
                        </Label>
                        <SkinGrid
                            region="topbar"
                            value={preferences.topbarSkin}
                            onChange={(skin) => set('topbarSkin', skin)}
                        />
                    </div>

                    <Separator />

                    <Button
                        variant="outline"
                        size="sm"
                        className="h-8 gap-1.5 text-xs"
                        onClick={resetAll}
                    >
                        <RotateCcw className="size-3.5" />
                        Reset to defaults
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}
