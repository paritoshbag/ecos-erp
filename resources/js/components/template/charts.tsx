import { useId, useState } from 'react';
import { cn } from '@/lib/utils';

/*
 * Lightweight SVG charts themed via the --chart-* tokens, so they follow dark
 * mode automatically with zero chart-library dependencies. All charts render
 * a hover layer (crosshair / per-mark tooltip) and lean on hairline grids and
 * thin marks; legends stay in HTML next to the chart.
 */

const defaultFormat = (value: number): string => value.toLocaleString('en-US');

const niceMax = (value: number): number => {
    if (value <= 0) {
        return 1;
    }

    const magnitude = 10 ** Math.floor(Math.log10(value));
    const normalized = value / magnitude;
    const nice =
        [1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8].find(
            (step) => normalized <= step,
        ) ?? 10;

    return nice * magnitude;
};

export type ChartSeries = {
    name: string;
    values: number[];
    color?: string;
};

export function ChartLegend({
    items,
    className,
}: {
    items: { name: string; color: string }[];
    className?: string;
}) {
    return (
        <div
            className={cn(
                'flex flex-wrap items-center gap-x-4 gap-y-1',
                className,
            )}
        >
            {items.map((item) => (
                <span
                    key={item.name}
                    className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"
                >
                    <span
                        aria-hidden="true"
                        className="size-2 rounded-full"
                        style={{ backgroundColor: item.color }}
                    />
                    {item.name}
                </span>
            ))}
        </div>
    );
}

type LineAreaChartProps = {
    labels: string[];
    series: ChartSeries[];
    height?: number;
    formatValue?: (value: number) => string;
    className?: string;
};

export function LineAreaChart({
    labels,
    series,
    height = 240,
    formatValue = defaultFormat,
    className,
}: LineAreaChartProps) {
    const gradientId = useId();
    const [active, setActive] = useState<number | null>(null);

    const width = 640;
    const pad = { top: 16, right: 16, bottom: 28, left: 44 };
    const innerWidth = width - pad.left - pad.right;
    const innerHeight = height - pad.top - pad.bottom;

    const max = niceMax(Math.max(...series.flatMap((entry) => entry.values)));
    const count = labels.length;
    const stepX = innerWidth / Math.max(count - 1, 1);

    const x = (index: number) => pad.left + index * stepX;
    const y = (value: number) => pad.top + innerHeight * (1 - value / max);

    const linePath = (values: number[]) =>
        values
            .map(
                (value, index) =>
                    `${index === 0 ? 'M' : 'L'}${x(index).toFixed(1)},${y(value).toFixed(1)}`,
            )
            .join(' ');

    const gridValues = [0.25, 0.5, 0.75, 1].map((ratio) => max * ratio);
    const colors = series.map(
        (entry, index) => entry.color ?? `var(--chart-${index + 1})`,
    );

    return (
        <div className={cn('relative', className)}>
            <svg
                viewBox={`0 0 ${width} ${height}`}
                className="h-auto w-full"
                role="img"
                aria-label={`Line chart: ${series.map((entry) => entry.name).join(', ')}`}
            >
                {gridValues.map((value) => (
                    <g key={value}>
                        <line
                            x1={pad.left}
                            x2={width - pad.right}
                            y1={y(value)}
                            y2={y(value)}
                            stroke="var(--border)"
                            strokeWidth="1"
                        />
                        <text
                            x={pad.left - 8}
                            y={y(value) + 3.5}
                            textAnchor="end"
                            className="fill-muted-foreground text-[10px] tabular-nums"
                        >
                            {formatValue(value)}
                        </text>
                    </g>
                ))}
                <line
                    x1={pad.left}
                    x2={width - pad.right}
                    y1={y(0)}
                    y2={y(0)}
                    stroke="var(--border)"
                    strokeWidth="1"
                />

                {labels.map((label, index) =>
                    index % Math.ceil(count / 12) === 0 ? (
                        <text
                            key={label + index}
                            x={x(index)}
                            y={height - 8}
                            textAnchor="middle"
                            className="fill-muted-foreground text-[10px]"
                        >
                            {label}
                        </text>
                    ) : null,
                )}

                <defs>
                    <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                        <stop
                            offset="0%"
                            stopColor={colors[0]}
                            stopOpacity="0.22"
                        />
                        <stop
                            offset="100%"
                            stopColor={colors[0]}
                            stopOpacity="0.02"
                        />
                    </linearGradient>
                </defs>
                <path
                    d={`${linePath(series[0].values)} L${x(count - 1)},${y(0)} L${x(0)},${y(0)} Z`}
                    fill={`url(#${gradientId})`}
                />

                {series.map((entry, seriesIndex) => (
                    <path
                        key={entry.name}
                        d={linePath(entry.values)}
                        fill="none"
                        stroke={colors[seriesIndex]}
                        strokeWidth="2"
                        strokeLinejoin="round"
                        strokeLinecap="round"
                    />
                ))}

                {active !== null && (
                    <g>
                        <line
                            x1={x(active)}
                            x2={x(active)}
                            y1={pad.top}
                            y2={height - pad.bottom}
                            stroke="var(--muted-foreground)"
                            strokeWidth="1"
                            strokeDasharray="3 3"
                        />
                        {series.map((entry, seriesIndex) => (
                            <circle
                                key={entry.name}
                                cx={x(active)}
                                cy={y(entry.values[active])}
                                r="4"
                                fill={colors[seriesIndex]}
                                stroke="var(--card)"
                                strokeWidth="2"
                            />
                        ))}
                    </g>
                )}

                {labels.map((_, index) => (
                    <rect
                        key={index}
                        x={x(index) - stepX / 2}
                        y={pad.top}
                        width={stepX}
                        height={innerHeight}
                        fill="transparent"
                        onMouseEnter={() => setActive(index)}
                        onMouseLeave={() => setActive(null)}
                    />
                ))}
            </svg>

            {active !== null && (
                <div
                    className="pointer-events-none absolute top-1 z-10 -translate-x-1/2 rounded-md border bg-popover px-2.5 py-1.5 text-xs shadow-md"
                    style={{
                        left: `${Math.min(Math.max((x(active) / width) * 100, 12), 88)}%`,
                    }}
                >
                    <p className="font-medium">{labels[active]}</p>
                    {series.map((entry, seriesIndex) => (
                        <p
                            key={entry.name}
                            className="flex items-center gap-1.5 text-muted-foreground"
                        >
                            <span
                                className="size-1.5 rounded-full"
                                style={{ backgroundColor: colors[seriesIndex] }}
                            />
                            {entry.name}:{' '}
                            <span className="font-medium text-foreground tabular-nums">
                                {formatValue(entry.values[active])}
                            </span>
                        </p>
                    ))}
                </div>
            )}
        </div>
    );
}

type BarChartProps = {
    labels: string[];
    series: ChartSeries[];
    height?: number;
    formatValue?: (value: number) => string;
    className?: string;
};

export function BarChart({
    labels,
    series,
    height = 240,
    formatValue = defaultFormat,
    className,
}: BarChartProps) {
    const [active, setActive] = useState<number | null>(null);

    const width = 640;
    const pad = { top: 16, right: 16, bottom: 28, left: 44 };
    const innerWidth = width - pad.left - pad.right;
    const innerHeight = height - pad.top - pad.bottom;

    const max = niceMax(Math.max(...series.flatMap((entry) => entry.values)));
    const count = labels.length;
    const groupWidth = innerWidth / count;
    const barGap = 2;
    const barWidth = Math.min(
        (groupWidth * 0.6 - barGap * (series.length - 1)) / series.length,
        28,
    );

    const y = (value: number) => pad.top + innerHeight * (1 - value / max);
    const gridValues = [0.25, 0.5, 0.75, 1].map((ratio) => max * ratio);
    const colors = series.map(
        (entry, index) => entry.color ?? `var(--chart-${index + 1})`,
    );

    return (
        <div className={cn('relative', className)}>
            <svg
                viewBox={`0 0 ${width} ${height}`}
                className="h-auto w-full"
                role="img"
                aria-label={`Bar chart: ${series.map((entry) => entry.name).join(', ')}`}
            >
                {gridValues.map((value) => (
                    <g key={value}>
                        <line
                            x1={pad.left}
                            x2={width - pad.right}
                            y1={y(value)}
                            y2={y(value)}
                            stroke="var(--border)"
                            strokeWidth="1"
                        />
                        <text
                            x={pad.left - 8}
                            y={y(value) + 3.5}
                            textAnchor="end"
                            className="fill-muted-foreground text-[10px] tabular-nums"
                        >
                            {formatValue(value)}
                        </text>
                    </g>
                ))}

                {labels.map((label, index) => {
                    const groupX =
                        pad.left + index * groupWidth + groupWidth / 2;
                    const totalBars =
                        series.length * barWidth + (series.length - 1) * barGap;

                    return (
                        <g key={label + index}>
                            {series.map((entry, seriesIndex) => {
                                const value = entry.values[index];
                                const barHeight = innerHeight * (value / max);
                                const barX =
                                    groupX -
                                    totalBars / 2 +
                                    seriesIndex * (barWidth + barGap);

                                return (
                                    <rect
                                        key={entry.name}
                                        x={barX}
                                        y={y(value)}
                                        width={barWidth}
                                        height={Math.max(barHeight, 2)}
                                        rx="4"
                                        fill={colors[seriesIndex]}
                                        opacity={
                                            active === null || active === index
                                                ? 1
                                                : 0.35
                                        }
                                        className="transition-opacity"
                                    />
                                );
                            })}
                            {/* Square off the rounded bottom corners */}
                            <rect
                                x={groupX - totalBars / 2}
                                y={y(0) - 2}
                                width={totalBars}
                                height={2}
                                fill="var(--card)"
                                opacity="0"
                            />
                            <text
                                x={groupX}
                                y={height - 8}
                                textAnchor="middle"
                                className="fill-muted-foreground text-[10px]"
                            >
                                {label}
                            </text>
                            <rect
                                x={pad.left + index * groupWidth}
                                y={pad.top}
                                width={groupWidth}
                                height={innerHeight}
                                fill="transparent"
                                onMouseEnter={() => setActive(index)}
                                onMouseLeave={() => setActive(null)}
                            />
                        </g>
                    );
                })}

                <line
                    x1={pad.left}
                    x2={width - pad.right}
                    y1={y(0)}
                    y2={y(0)}
                    stroke="var(--border)"
                    strokeWidth="1"
                />
            </svg>

            {active !== null && (
                <div
                    className="pointer-events-none absolute top-1 z-10 -translate-x-1/2 rounded-md border bg-popover px-2.5 py-1.5 text-xs shadow-md"
                    style={{
                        left: `${Math.min(
                            Math.max(
                                ((pad.left +
                                    active * groupWidth +
                                    groupWidth / 2) /
                                    width) *
                                    100,
                                12,
                            ),
                            88,
                        )}%`,
                    }}
                >
                    <p className="font-medium">{labels[active]}</p>
                    {series.map((entry, seriesIndex) => (
                        <p
                            key={entry.name}
                            className="flex items-center gap-1.5 text-muted-foreground"
                        >
                            <span
                                className="size-1.5 rounded-full"
                                style={{ backgroundColor: colors[seriesIndex] }}
                            />
                            {entry.name}:{' '}
                            <span className="font-medium text-foreground tabular-nums">
                                {formatValue(entry.values[active])}
                            </span>
                        </p>
                    ))}
                </div>
            )}
        </div>
    );
}

type DonutChartProps = {
    segments: { label: string; value: number; color?: string }[];
    formatValue?: (value: number) => string;
    centerLabel?: string;
    className?: string;
};

export function DonutChart({
    segments,
    formatValue = defaultFormat,
    centerLabel = 'Total',
    className,
}: DonutChartProps) {
    const [active, setActive] = useState<number | null>(null);

    const size = 200;
    const center = size / 2;
    const radius = 78;
    const thickness = 26;
    const gapAngle = 2.2;

    const total = segments.reduce((sum, segment) => sum + segment.value, 0);
    const colors = segments.map(
        (segment, index) => segment.color ?? `var(--chart-${index + 1})`,
    );

    const polar = (angle: number, r: number) => {
        const radians = ((angle - 90) * Math.PI) / 180;

        return {
            x: center + r * Math.cos(radians),
            y: center + r * Math.sin(radians),
        };
    };

    const sweeps = segments.map((segment) => (segment.value / total) * 360);
    const arcs = segments.map((_, index) => {
        const offset = sweeps
            .slice(0, index)
            .reduce((sum, sweep) => sum + sweep, 0);
        const start = offset + gapAngle / 2;
        const end = offset + sweeps[index] - gapAngle / 2;

        const outerStart = polar(start, radius);
        const outerEnd = polar(end, radius);
        const innerStart = polar(end, radius - thickness);
        const innerEnd = polar(start, radius - thickness);
        const largeArc = end - start > 180 ? 1 : 0;

        return [
            `M${outerStart.x.toFixed(2)},${outerStart.y.toFixed(2)}`,
            `A${radius},${radius} 0 ${largeArc} 1 ${outerEnd.x.toFixed(2)},${outerEnd.y.toFixed(2)}`,
            `L${innerStart.x.toFixed(2)},${innerStart.y.toFixed(2)}`,
            `A${radius - thickness},${radius - thickness} 0 ${largeArc} 0 ${innerEnd.x.toFixed(2)},${innerEnd.y.toFixed(2)}`,
            'Z',
        ].join(' ');
    });

    const activeSegment = active !== null ? segments[active] : null;

    return (
        <div className={cn('flex flex-wrap items-center gap-6', className)}>
            <div className="relative">
                <svg
                    viewBox={`0 0 ${size} ${size}`}
                    className="size-40 md:size-44"
                    role="img"
                    aria-label={`Donut chart, total ${formatValue(total)}`}
                >
                    {arcs.map((path, index) => (
                        <path
                            key={segments[index].label}
                            d={path}
                            fill={colors[index]}
                            opacity={
                                active === null || active === index ? 1 : 0.3
                            }
                            className="cursor-pointer transition-opacity"
                            onMouseEnter={() => setActive(index)}
                            onMouseLeave={() => setActive(null)}
                        />
                    ))}
                </svg>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="max-w-24 truncate text-xs text-muted-foreground">
                        {activeSegment ? activeSegment.label : centerLabel}
                    </span>
                    <span className="font-display text-lg font-semibold tabular-nums">
                        {formatValue(
                            activeSegment ? activeSegment.value : total,
                        )}
                    </span>
                </div>
            </div>
            <div className="grid min-w-40 flex-1 gap-2">
                {segments.map((segment, index) => (
                    <button
                        type="button"
                        key={segment.label}
                        className={cn(
                            'flex items-center gap-2 rounded-md px-1.5 py-0.5 text-left text-sm transition-opacity outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50',
                            active !== null && active !== index && 'opacity-40',
                        )}
                        onMouseEnter={() => setActive(index)}
                        onMouseLeave={() => setActive(null)}
                        onFocus={() => setActive(index)}
                        onBlur={() => setActive(null)}
                    >
                        <span
                            aria-hidden="true"
                            className="size-2.5 shrink-0 rounded-full"
                            style={{ backgroundColor: colors[index] }}
                        />
                        <span className="flex-1 truncate text-muted-foreground">
                            {segment.label}
                        </span>
                        <span className="font-medium tabular-nums">
                            {Math.round((segment.value / total) * 100)}%
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
}

type SparklineProps = {
    values: number[];
    color?: string;
    className?: string;
};

export function Sparkline({
    values,
    color = 'var(--chart-1)',
    className,
}: SparklineProps) {
    const width = 120;
    const height = 36;
    const pad = 3;

    const max = Math.max(...values);
    const min = Math.min(...values);
    const range = max - min || 1;
    const stepX = (width - pad * 2) / Math.max(values.length - 1, 1);

    const points = values
        .map((value, index) => {
            const px = pad + index * stepX;
            const py = pad + (height - pad * 2) * (1 - (value - min) / range);

            return `${index === 0 ? 'M' : 'L'}${px.toFixed(1)},${py.toFixed(1)}`;
        })
        .join(' ');

    return (
        <svg
            viewBox={`0 0 ${width} ${height}`}
            className={cn('h-9 w-full max-w-30', className)}
            aria-hidden="true"
        >
            <path
                d={points}
                fill="none"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}
