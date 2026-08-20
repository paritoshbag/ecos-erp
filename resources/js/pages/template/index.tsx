import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    Accessibility,
    ListTree,
    Palette,
    Rows3,
} from 'lucide-react';
import { TemplateLogoMark } from '@/components/template/template-logo';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { appConfig } from '@/lib/app-config';
import { flattenNav, templateNav } from '@/lib/template-nav';

const capabilities = [
    { icon: ListTree, label: 'Nested menus, three ways' },
    { icon: Palette, label: '9 sidebar & topbar skins' },
    { icon: Accessibility, label: 'Accessibility controls built in' },
    { icon: Rows3, label: 'Three density settings' },
];

const colorTokens = [
    { name: 'Primary', className: 'bg-primary' },
    { name: 'Success', className: 'bg-success' },
    { name: 'Warning', className: 'bg-warning' },
    { name: 'Info', className: 'bg-info' },
    { name: 'Destructive', className: 'bg-destructive' },
];

const chartTokens = [
    'bg-chart-1',
    'bg-chart-2',
    'bg-chart-3',
    'bg-chart-4',
    'bg-chart-5',
];

export default function TemplateIndex() {
    return (
        <>
            <Head title="Template Hub" />

            {/* Hero */}
            <section className="relative overflow-hidden rounded-xl bg-primary p-6 text-primary-foreground md:p-10">
                <div className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-white/10 blur-2xl" />
                <div className="pointer-events-none absolute right-24 -bottom-32 size-72 rounded-full bg-black/10 blur-2xl" />
                <div className="relative max-w-3xl space-y-4">
                    <div className="flex items-center gap-3">
                        <TemplateLogoMark className="bg-white/15 text-white" />
                        <Badge className="border-white/25 bg-white/15 text-white">
                            Design System v{appConfig.version}
                        </Badge>
                    </div>
                    <h1 className="text-2xl font-semibold md:text-4xl">
                        {appConfig.name} — {appConfig.tagline}
                    </h1>
                    <p className="max-w-2xl text-sm text-primary-foreground/85 md:text-base">
                        The complete visual language for the platform:
                        dashboards, data tables, forms, wizards and widgets for
                        job costing, quotations, compliance, people and
                        scheduling — reviewable here without signing in, before
                        any backend is built.
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1">
                        <Button
                            variant="secondary"
                            className="bg-white text-primary hover:bg-white/90"
                            asChild
                        >
                            <Link href="/template/components">
                                Explore components
                                <ArrowRight className="size-4" />
                            </Link>
                        </Button>
                        <Button
                            variant="outline"
                            className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
                            asChild
                        >
                            <Link href="/template/dashboards/executive">
                                View dashboards
                            </Link>
                        </Button>
                    </div>
                </div>
            </section>

            {/* Capabilities */}
            <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {capabilities.map((capability) => (
                    <div
                        key={capability.label}
                        className="flex items-center gap-3 rounded-xl border bg-card p-4"
                    >
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                            <capability.icon className="size-4.5" />
                        </div>
                        <span className="text-sm font-medium">
                            {capability.label}
                        </span>
                    </div>
                ))}
            </section>

            {/* Sections */}
            {templateNav
                .filter((group) => group.label !== 'Overview')
                .map((group) => (
                    <section key={group.label} className="space-y-3">
                        <h2 className="text-lg font-semibold">{group.label}</h2>
                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                            {flattenNav(group.items).map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href!}
                                    prefetch
                                    className="group rounded-xl outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                >
                                    <Card className="h-full transition-all group-hover:-translate-y-0.5 group-hover:border-primary/40 group-hover:shadow-md">
                                        <CardHeader>
                                            <div className="mb-1 flex size-9 items-center justify-center rounded-md bg-accent text-accent-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                                                {item.icon && (
                                                    <item.icon className="size-4.5" />
                                                )}
                                            </div>
                                            <CardTitle className="flex items-center justify-between text-base">
                                                {item.title}
                                                <ArrowRight className="size-4 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
                                            </CardTitle>
                                            <CardDescription>
                                                {item.description}
                                            </CardDescription>
                                        </CardHeader>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    </section>
                ))}

            {/* Foundations */}
            <section className="space-y-3">
                <h2 className="text-lg font-semibold">Foundations</h2>
                <div className="grid gap-3 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">
                                Color tokens
                            </CardTitle>
                            <CardDescription>
                                Semantic roles adapt to the accent palette and
                                dark mode. Chart colors stay fixed so data keeps
                                its identity across themes.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex flex-wrap gap-4">
                                {colorTokens.map((token) => (
                                    <div
                                        key={token.name}
                                        className="flex items-center gap-2"
                                    >
                                        <span
                                            className={`size-6 rounded-md border border-black/10 dark:border-white/10 ${token.className}`}
                                        />
                                        <span className="text-sm">
                                            {token.name}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <div className="space-y-1.5">
                                <p className="text-xs font-medium text-muted-foreground uppercase">
                                    Chart palette
                                </p>
                                <div className="flex gap-1.5">
                                    {chartTokens.map((token) => (
                                        <span
                                            key={token}
                                            className={`h-6 flex-1 rounded-md ${token}`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">
                                Typography
                            </CardTitle>
                            <CardDescription>
                                Inter throughout the interface at a 13px base,
                                JetBrains Mono for figures, references and code.
                                No display face — weight and tracking carry the
                                hierarchy.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <p className="font-display text-2xl font-semibold tracking-tight">
                                Quarterly revenue up 18%
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Body — Inter 13px. The quick brown fox jumps
                                over the lazy dog, 0123456789.
                            </p>
                            <p className="font-mono text-sm tabular-nums">
                                INV-2041 · $128,540.00 · 2026-08-17
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </section>
        </>
    );
}
