import { useSyncExternalStore } from 'react';
import { cn } from '@/lib/utils';

/*
 * Wall clock for the topbar.
 *
 * Timesheets, site attendance and dispatch windows are all logged against this
 * number, so it ticks every second rather than every minute — a stale clock in
 * the chrome is worse than none at all.
 *
 * One module-level ticker drives every mounted clock, and the server snapshot
 * is `null`: the server's clock is not the user's, and a mismatched first paint
 * would flash the wrong time.
 */

let now = 0;
let handle: ReturnType<typeof setInterval> | undefined;
const listeners = new Set<() => void>();

const tick = (): void => {
    now = Date.now();
    listeners.forEach((listener) => listener());
};

const subscribe = (listener: () => void): (() => void) => {
    listeners.add(listener);

    if (!handle) {
        now = Date.now();
        handle = setInterval(tick, 1000);
    }

    return () => {
        listeners.delete(listener);

        if (listeners.size === 0 && handle) {
            clearInterval(handle);
            handle = undefined;
        }
    };
};

/* Reading the clock on first subscribe keeps the snapshot referentially stable. */
const getSnapshot = (): number => now || (now = Date.now());

const getServerSnapshot = (): number => 0;

export function LiveClock({ className }: { className?: string }) {
    const timestamp = useSyncExternalStore(
        subscribe,
        getSnapshot,
        getServerSnapshot,
    );

    const date = timestamp ? new Date(timestamp) : null;

    const time = date
        ? date.toLocaleTimeString(undefined, {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: false,
          })
        : '--:--:--';

    const day = date
        ? date.toLocaleDateString(undefined, {
              weekday: 'short',
              day: '2-digit',
              month: 'short',
          })
        : '';

    return (
        <div
            className={cn(
                'hidden items-center gap-2 rounded-md bg-topbar-accent/70 px-2 py-1 xl:flex',
                className,
            )}
            aria-label="Current date and time"
        >
            <span className="font-mono text-sm leading-none font-medium text-topbar-foreground tabular-nums">
                {time}
            </span>
            <span className="text-2xs leading-none text-topbar-muted-foreground">
                {day}
            </span>
        </div>
    );
}
