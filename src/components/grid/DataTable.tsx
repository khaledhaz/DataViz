import {
    useReactTable,
    getCoreRowModel,
    flexRender,
    type ColumnDef,
} from '@tanstack/react-table';
import { useMemo, useState, useRef, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { useFilteredData } from '@/hooks/use-filtered-data';

export const DataTable = () => {
    const { columns } = useAppStore();
    const data = useFilteredData();

    const tableColumns = useMemo<ColumnDef<any>[]>(
        () =>
            columns.map((col) => ({
                accessorKey: col,
                header: col,
                cell: (info) => info.getValue(),
            })),
        [columns]
    );

    const [visibleCount, setVisibleCount] = useState(20);
    const observerRef = useRef<HTMLDivElement | null>(null);
    const scrollContainerRef = useRef<HTMLDivElement | null>(null);

    // Reset visible count when filters change
    useEffect(() => {
        setVisibleCount(20);
    }, [data.length]);

    const table = useReactTable({
        data,
        columns: tableColumns,
        getCoreRowModel: getCoreRowModel(),
    });

    const rows = table.getRowModel().rows;
    const visibleRows = rows.slice(0, visibleCount);

    // Infinite Scroll Observer
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                // Check intersecting OR if we have rootMargin helping us
                if (entries[0].isIntersecting && visibleCount < rows.length) {
                    setVisibleCount((prev: number) => Math.min(prev + 20, rows.length));
                }
            },
            {
                root: scrollContainerRef.current, // Use the scroll container as root
                threshold: 0.1,
                rootMargin: "200px" // Load 200px before reaching the bottom
            }
        );

        if (observerRef.current) {
            observer.observe(observerRef.current);
        }

        return () => observer.disconnect();
    }, [visibleCount, rows.length]);

    if (data.length === 0) return null;

    return (
        <div className="space-y-4">
            <div className="rounded-2xl border bg-card/50 backdrop-blur-sm shadow-sm overflow-hidden">
                <div
                    ref={scrollContainerRef}
                    className="relative w-full overflow-auto max-h-[600px] scroll-smooth"
                >
                    <table className="w-full caption-bottom text-sm">
                        <thead className="[&_tr]:border-b sticky top-0 bg-card/95 backdrop-blur-md z-20 shadow-sm">
                            {table.getHeaderGroups().map((headerGroup) => (
                                <tr key={headerGroup.id} className="border-b transition-colors data-[state=selected]:bg-muted">
                                    {headerGroup.headers.map((header) => (
                                        <th key={header.id} className="h-12 px-4 text-left align-middle font-heading text-xs font-semibold uppercase tracking-wider text-muted-foreground/80 [&:has([role=checkbox])]:pr-0 whitespace-nowrap">
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0">
                            {visibleRows.length ? (
                                <>
                                    {visibleRows.map((row) => (
                                        <tr
                                            key={row.id}
                                            className="border-b transition-colors hover:bg-muted/30 data-[state=selected]:bg-muted"
                                        >
                                            {row.getVisibleCells().map((cell) => (
                                                <td key={cell.id} className="p-4 align-middle [&:has([role=checkbox])]:pr-0 whitespace-nowrap text-muted-foreground">
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                    {/* Sentry div for Infinite Scroll */}
                                    {visibleCount < rows.length && (
                                        <tr>
                                            <td colSpan={columns.length} className="p-4 text-center">
                                                <div ref={observerRef} className="h-4 w-full flex justify-center items-center">
                                                    <span className="text-xs text-muted-foreground animate-pulse">Loading more...</span>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </>
                            ) : (
                                <tr>
                                    <td colSpan={columns.length} className="h-32 text-center text-muted-foreground">
                                        No results match your filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="text-xs text-center text-muted-foreground">
                Showing {Math.min(visibleCount, rows.length)} of {rows.length} rows
            </div>
        </div>
    );
};
