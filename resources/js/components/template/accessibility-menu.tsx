import {
    Accessibility,
    Contrast,
    Minus,
    Monitor,
    Moon,
    Plus,
    RotateCcw,
    Sun,
    Volume2,
    VolumeX,
    ZoomIn,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { useAppearance } from '@/hooks/use-appearance';
import type { Appearance } from '@/hooks/use-appearance';
import {
    FONT_SCALE_MAX,
    FONT_SCALE_MIN,
    FONT_SCALE_STEP,
    ZOOM_MAX,
    ZOOM_MIN,
    ZOOM_STEP,
    playFeedbackTone,
    useUiPreferences,
} from '@/hooks/use-ui-preferences';

/*
 * Accessibility controls, parked in the topbar where they are reachable from
 * every screen rather than buried in a settings page. Site staff work off
 * tablets in bad light and shared workstations, so these have to be one click
 * away and they have to persist per browser.
 *
 * Text size and zoom are deliberately separate levers:
 *   text size → scales the type ramp only, layout stays put
 *   zoom      → scales the rem unit, so type and layout grow together
 */

const themes: { value: Appearance; label: string; icon: typeof Sun }[] = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
];

function Stepper({
    label,
    icon: Icon,
    value,
    min,
    max,
    onDecrease,
    onIncrease,
    hint,
}: {
    label: string;
    icon: typeof Sun;
    value: number;
    min: number;
    max: number;
    onDecrease: () => void;
    onIncrease: () => void;
    hint: string;
}) {
    return (
        <div className="grid gap-1.5">
            <div className="flex items-center justify-between">
                <Label className="flex items-center gap-1.5 text-xs font-medium">
                    <Icon className="size-3.5 text-muted-foreground" />
                    {label}
                </Label>
                <span className="font-mono text-2xs text-muted-foreground tabular-nums">
                    {Math.round(value * 100)}%
                </span>
            </div>
            <div className="flex items-center gap-1">
                <Button
                    variant="outline"
                    size="icon"
                    className="size-7"
                    onClick={onDecrease}
                    disabled={value <= min}
                    aria-label={`Decrease ${label.toLowerCase()}`}
                >
                    <Minus className="size-3.5" />
                </Button>
                <div
                    className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted"
                    role="presentation"
                >
                    <div
                        className="h-full rounded-full bg-primary transition-[width]"
                        style={{
                            width: `${((value - min) / (max - min)) * 100}%`,
                        }}
                    />
                </div>
                <Button
                    variant="outline"
                    size="icon"
                    className="size-7"
                    onClick={onIncrease}
                    disabled={value >= max}
                    aria-label={`Increase ${label.toLowerCase()}`}
                >
                    <Plus className="size-3.5" />
                </Button>
            </div>
            <p className="text-2xs text-muted-foreground">{hint}</p>
        </div>
    );
}

export function AccessibilityMenu() {
    const {
        preferences,
        set,
        adjustFontScale,
        adjustZoom,
        resetAccessibility,
    } = useUiPreferences();
    const { appearance, updateAppearance } = useAppearance();

    return (
        <Popover>
            <Tooltip>
                <TooltipTrigger asChild>
                    <PopoverTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-topbar-foreground hover:bg-topbar-accent hover:text-topbar-accent-foreground"
                            aria-label="Accessibility options"
                        >
                            <Accessibility className="size-4" />
                        </Button>
                    </PopoverTrigger>
                </TooltipTrigger>
                <TooltipContent>Accessibility</TooltipContent>
            </Tooltip>

            <PopoverContent align="end" className="w-72 p-0">
                <div className="flex items-center justify-between px-3 py-2">
                    <p className="text-xs font-semibold">Accessibility</p>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 gap-1 px-1.5 text-2xs text-muted-foreground"
                        onClick={resetAccessibility}
                    >
                        <RotateCcw className="size-3" />
                        Reset
                    </Button>
                </div>
                <Separator />

                <div className="grid gap-3 p-3">
                    <Stepper
                        label="Text size"
                        icon={Accessibility}
                        value={preferences.fontScale}
                        min={FONT_SCALE_MIN}
                        max={FONT_SCALE_MAX}
                        onDecrease={() => adjustFontScale(-FONT_SCALE_STEP)}
                        onIncrease={() => adjustFontScale(FONT_SCALE_STEP)}
                        hint="Type only — spacing stays as designed."
                    />

                    <Stepper
                        label="Interface zoom"
                        icon={ZoomIn}
                        value={preferences.zoom}
                        min={ZOOM_MIN}
                        max={ZOOM_MAX}
                        onDecrease={() => adjustZoom(-ZOOM_STEP)}
                        onIncrease={() => adjustZoom(ZOOM_STEP)}
                        hint="Scales the whole interface, like browser zoom."
                    />

                    <Separator />

                    <div className="grid gap-1.5">
                        <Label className="text-xs font-medium">Theme</Label>
                        <ToggleGroup
                            type="single"
                            size="sm"
                            variant="outline"
                            value={appearance}
                            onValueChange={(value) =>
                                value && updateAppearance(value as Appearance)
                            }
                            className="w-full"
                        >
                            {themes.map((theme) => (
                                <ToggleGroupItem
                                    key={theme.value}
                                    value={theme.value}
                                    className="h-7 flex-1 gap-1.5 text-2xs"
                                    aria-label={theme.label}
                                >
                                    <theme.icon className="size-3.5" />
                                    {theme.label}
                                </ToggleGroupItem>
                            ))}
                        </ToggleGroup>
                    </div>

                    <label className="flex items-center justify-between gap-2">
                        <span className="flex items-center gap-1.5 text-xs font-medium">
                            <Contrast className="size-3.5 text-muted-foreground" />
                            High contrast
                        </span>
                        <Switch
                            checked={preferences.contrast === 'high'}
                            onCheckedChange={(checked) =>
                                set('contrast', checked ? 'high' : 'normal')
                            }
                            aria-label="High contrast"
                        />
                    </label>

                    <label className="flex items-center justify-between gap-2">
                        <span className="flex items-center gap-1.5 text-xs font-medium">
                            <RotateCcw className="size-3.5 text-muted-foreground" />
                            Reduce motion
                        </span>
                        <Switch
                            checked={preferences.reduceMotion}
                            onCheckedChange={(checked) =>
                                set('reduceMotion', checked)
                            }
                            aria-label="Reduce motion"
                        />
                    </label>

                    <Separator />

                    <div className="grid gap-1.5">
                        <div className="flex items-center justify-between">
                            <Label className="flex items-center gap-1.5 text-xs font-medium">
                                {preferences.muted ? (
                                    <VolumeX className="size-3.5 text-muted-foreground" />
                                ) : (
                                    <Volume2 className="size-3.5 text-muted-foreground" />
                                )}
                                Alert volume
                            </Label>
                            <span className="font-mono text-2xs text-muted-foreground tabular-nums">
                                {preferences.muted
                                    ? 'Muted'
                                    : `${preferences.volume}%`}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="icon"
                                className="size-7"
                                onClick={() => set('muted', !preferences.muted)}
                                aria-label={
                                    preferences.muted ? 'Unmute' : 'Mute'
                                }
                            >
                                {preferences.muted ? (
                                    <VolumeX className="size-3.5" />
                                ) : (
                                    <Volume2 className="size-3.5" />
                                )}
                            </Button>
                            <Slider
                                value={[preferences.volume]}
                                min={0}
                                max={100}
                                step={5}
                                disabled={preferences.muted}
                                onValueChange={([value]) =>
                                    set('volume', value)
                                }
                                /* Preview the level once the drag settles. */
                                onValueCommit={() => playFeedbackTone()}
                                aria-label="Alert volume"
                                className="flex-1"
                            />
                        </div>
                        <p className="text-2xs text-muted-foreground">
                            Applies to notification and confirmation sounds.
                        </p>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
