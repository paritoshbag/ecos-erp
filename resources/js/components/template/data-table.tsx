import {
    ArrowDown,
    ArrowUp,
    ArrowUpDown,
    ChevronLeft,
    ChevronRight,
    FilterX,
    Search,
    SearchX,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { EmptyState } from '@/components/template/empty-state';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

export type DataTableColumn<T> = {
    key: string;
    header: string;
    sortable?: boolean;
    align?: 'left' | 'right';
    accessor: (row: T) => string | number;
    cell?: (row: T) => ReactNode;
    className?: string;
};

export type DataTableFilter<T> = {
    key: string;
    label: string;
    options: { value: string; label: string }[];
    match: (row: T, value: string) => boolean;
};

type DataTableProps<T> = {
    data: T[];
    columns: DataTableColumn<T>[];
    rowKey: (row: T) => string;
    filters?: DataTableFilter<T>[];
    searchPlaceholder?: string;
    pageSizeOptions?: number[];
    selectable?: boolean;
    renderRowActions?: (row: T) => ReactNode;
    renderBulkActions?: (
        selected: T[],
        clearSelection: () => void,
    ) => ReactNode;
    toolbarExtra?: ReactNode;
    onRowClick?: (row: T) => void;
    activeRowKey?: string | null;
};

type SortState = { key: string; direction: 'asc' | 'desc' } | null;

/*
 * Generic client-side data table: text search across all columns, faceted
 * select filters, tri-state column sorting, row selection with bulk actions,
 * and pagination. Server-driven later: swap the useMemo pipeline for Inertia
 * partial reloads while keeping the same markup.
 */
export function DataTable<T>({
    data,
    columns,
    rowKey,
    filters = [],
    searchPlaceholder = 'Search…',
    pageSizeOptions = [10, 25, 50],
    selectable = false,
    renderRowActions,
    renderBulkActions,
    toolbarExtra,
    onRowClick,
    activeRowKey,
}: DataTableProps<T>) {
    const [search, setSearch] = useState('');
    const [activeFilters, setActiveFilters] = useState<Record<string, string>>(
        {},
    );
    const [sort, setSort] = useState<SortState>(null);
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(pageSizeOptions[0]);
    const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());

    const filtered = useMemo(() => {
        const query = search.trim().toLowerCase();

        return data.filter((row) => {
            if (
                query &&
                !columns.some((column) =>
                    String(column.accessor(row)).toLowerCase().includes(query),
                )
            ) {
                return false;
            }

            return filters.every((filter) => {
                const value = activeFilters[filter.key];

                return !value || value === 'all' || filter.match(row, value);
            });
        });
    }, [data, columns, filters, search, activeFilters]);

    const sorted = useMemo(() => {
        if (!sort) {
            return filtered;
        }

        const column = columns.find((candidate) => candidate.key === sort.key);

        if (!column) {
            return filtered;
        }

        return [...filtered].sort((a, b) => {
            const left = column.accessor(a);
            const right = column.accessor(b);
            const comparison =
                typeof left === 'number' && typeof right === 'number'
                    ? left - right
                    : String(left).localeCompare(String(right));

            return sort.direction === 'asc' ? comparison : -comparison;
        });
    }, [filtered, sort, columns]);

    const pageCount = Math.max(Math.ceil(sorted.length / pageSize), 1);
    const clampedPage = Math.min(page, pageCount - 1);
    const pageRows = sorted.slice(
        clampedPage * pageSize,
        (clampedPage + 1) * pageSize,
    );

    const selectedRows = useMemo(
        () => data.filter((row) => selectedKeys.has(rowKey(row))),
        [data, selectedKeys, rowKey],
    );

    const allOnPageSelected =
        pageRows.length > 0 &&
        pageRows.every((row) => selectedKeys.has(rowKey(row)));
    const someOnPageSelected = pageRows.some((row) =>
        selectedKeys.has(rowKey(row)),
    );

    const hasActiveFilters =
        search !== '' ||
        Object.values(activeFilters).some((value) => value && value !== 'all');

    const clearSelection = (): void => setSelectedKeys(new Set());

    const toggleSort = (key: string): void => {
        setSort((current) => {
            if (current?.key !== key) {
                return { key, direction: 'asc' };
            }

            if (current.direction === 'asc') {
                return { key, direction: 'desc' };
            }

            return null;
        });
    };

    const totalColumns =
        columns.length + (selectable ? 1 : 0) + (renderRowActions ? 1 : 0);

    return (
        <div className="space-y-3">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-2">
                <div className="relative w-full sm:w-64">
                    <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        type="search"
                        value={search}
                        placeholder={searchPlaceholder}
                        className="pl-8"
                        onChange={(event) => {
                            setSearch(event.target.value);
                            setPage(0);
                        }}
                    />
                </div>
                {filters.map((filter) => (
                    <Select
                        key={filter.key}
                        value={activeFilters[filter.key] ?? 'all'}
                        onValueChange={(value) => {
                            setActiveFilters((current) => ({
                                ...current,
                                [filter.key]: value,
                            }));
                            setPage(0);
                        }}
                    >
                        <SelectTrigger className="w-fit min-w-32">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">
                                All {filter.label.toLowerCase()}
                            </SelectItem>
                            {filter.options.map((option) => (
                                <SelectItem
                                    key={option.value}
                                    value={option.value}
                                >
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                ))}
                {hasActiveFilters && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            setSearch('');
                            setActiveFilters({});
                            setPage(0);
                        }}
                    >
                        <FilterX className="size-4" />
                        Clear
                    </Button>
                )}
                {toolbarExtra && (
                    <div className="ms-auto flex items-center gap-2">
                        {toolbarExtra}
                    </div>
                )}
            </div>

            {/* Bulk actions */}
            {selectable && selectedKeys.size > 0 && (
                <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-accent/50 px-3 py-2">
                    <span className="text-sm font-medium">
                        {selectedKeys.size} selected
                    </span>
                    <div className="ms-auto flex items-center gap-2">
                        {renderBulkActions?.(selectedRows, clearSelection)}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearSelection}
                        >
                            Clear
                        </Button>
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="rounded-xl border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            {selectable && (
                                <TableHead className="w-10 ps-4">
                                    <Checkbox
                                        aria-label="Select all rows on this page"
                                        checked={
                                            allOnPageSelected
                                                ? true
                                                : someOnPageSelected
                                                  ? 'indeterminate'
                                                  : false
                                        }
                                        onCheckedChange={(checked) => {
                                            setSelectedKeys((current) => {
                                                const next = new Set(current);

                                                pageRows.forEach((row) => {
                                                    if (checked) {
                                                        next.add(rowKey(row));
                                                    } else {
                                                        next.delete(
                                                            rowKey(row),
                                                        );
                                                    }
                                                });

                                                return next;
                                            });
                                        }}
                                    />
                                </TableHead>
                            )}
                            {columns.map((column) => (
                                <TableHead
                                    key={column.key}
                                    className={cn(
                                        column.align === 'right' &&
                                            'text-right',
                                        column.className,
                                    )}
                                >
                                    {column.sortable ? (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                toggleSort(column.key)
                                            }
                                            className={cn(
                                                'inline-flex items-center gap-1.5 rounded-sm outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50',
                                                sort?.key !== column.key &&
                                                    'text-muted-foreground',
                                            )}
                                        >
                                            {column.header}
                                            {sort?.key === column.key ? (
                                                sort.direction === 'asc' ? (
                                                    <ArrowUp className="size-3.5" />
                                                ) : (
                                                    <ArrowDown className="size-3.5" />
                                                )
                                            ) : (
                                                <ArrowUpDown className="size-3.5 opacity-50" />
                                            )}
                                        </button>
                                    ) : (
                                        column.header
                                    )}
                                </TableHead>
                            ))}
                            {renderRowActions && (
                                <TableHead className="w-12 text-right" />
                            )}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {pageRows.length === 0 ? (
                            <TableRow className="hover:bg-transparent">
                                <TableCell
                                    colSpan={totalColumns}
                                    className="p-6"
                                >
                                    <EmptyState
                                        icon={SearchX}
                                        title="No matching records"
                                        description="Try adjusting the search or clearing filters."
                                        className="border-0"
                                    />
                                </TableCell>
                            </TableRow>
                        ) : (
                            pageRows.map((row) => {
                                const key = rowKey(row);
                                const isSelected = selectedKeys.has(key);
                                const isActive = activeRowKey === key;

                                return (
                                    <TableRow
                                        key={key}
                                        data-state={
                                            isSelected || isActive
                                                ? 'selected'
                                                : undefined
                                        }
                                        className={cn(
                                            onRowClick && 'cursor-pointer',
                                            isActive &&
                                                'bg-primary/10 hover:bg-primary/15',
                                        )}
                                        onClick={
                                            onRowClick
                                                ? (event) => {
                                                      const target =
                                                          event.target;

                                                      if (
                                                          !(
                                                              target instanceof
                                                              HTMLElement
                                                          )
                                                      ) {
                                                          return;
                                                      }

                                                      if (
                                                          target.closest(
                                                              'a, button, input, [role="checkbox"]',
                                                          )
                                                      ) {
                                                          return;
                                                      }

                                                      onRowClick(row);
                                                  }
                                                : undefined
                                        }
                                    >
                                        {selectable && (
                                            <TableCell className="ps-4">
                                                <Checkbox
                                                    aria-label={`Select row ${key}`}
                                                    checked={isSelected}
                                                    onCheckedChange={(
                                                        checked,
                                                    ) => {
                                                        setSelectedKeys(
                                                            (current) => {
                                                                const next =
                                                                    new Set(
                                                                        current,
                                                                    );

                                                                if (checked) {
                                                                    next.add(
                                                                        key,
                                                                    );
                                                                } else {
                                                                    next.delete(
                                                                        key,
                                                                    );
                                                                }

                                                                return next;
                                                            },
                                                        );
                                                    }}
                                                />
                                            </TableCell>
                                        )}
                                        {columns.map((column) => (
                                            <TableCell
                                                key={column.key}
                                                className={cn(
                                                    column.align === 'right' &&
                                                        'text-right',
                                                    column.className,
                                                )}
                                            >
                                                {column.cell
                                                    ? column.cell(row)
                                                    : column.accessor(row)}
                                            </TableCell>
                                        ))}
                                        {renderRowActions && (
                                            <TableCell className="pe-3 text-right">
                                                {renderRowActions(row)}
                                            </TableCell>
                                        )}
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">
                    Showing{' '}
                    <span className="font-medium text-foreground tabular-nums">
                        {sorted.length === 0 ? 0 : clampedPage * pageSize + 1}–
                        {Math.min((clampedPage + 1) * pageSize, sorted.length)}
                    </span>{' '}
                    of{' '}
                    <span className="font-medium text-foreground tabular-nums">
                        {sorted.length}
                    </span>
                </p>
                <div className="flex items-center gap-2">
                    <Select
                        value={String(pageSize)}
                        onValueChange={(value) => {
                            setPageSize(Number(value));
                            setPage(0);
                        }}
                    >
                        <SelectTrigger className="h-8 w-fit">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {pageSizeOptions.map((option) => (
                                <SelectItem key={option} value={String(option)}>
                                    {option} / page
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <div className="flex items-center gap-1">
                        <Button
                            variant="outline"
                            size="icon"
                            className="size-8"
                            aria-label="Previous page"
                            disabled={clampedPage === 0}
                            onClick={() =>
                                setPage((current) => Math.max(current - 1, 0))
                            }
                        >
                            <ChevronLeft className="size-4" />
                        </Button>
                        <span className="px-1 text-sm text-muted-foreground tabular-nums">
                            {clampedPage + 1} / {pageCount}
                        </span>
                        <Button
                            variant="outline"
                            size="icon"
                            className="size-8"
                            aria-label="Next page"
                            disabled={clampedPage >= pageCount - 1}
                            onClick={() =>
                                setPage((current) =>
                                    Math.min(current + 1, pageCount - 1),
                                )
                            }
                        >
                            <ChevronRight className="size-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
