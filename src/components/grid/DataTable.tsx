import {
    useReactTable,
    getCoreRowModel,
    flexRender,
    type ColumnDef,
    getPaginationRowModel,
} from '@tanstack/react-table';
import { useMemo } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { useFilteredData } from '@/hooks/use-filtered-data';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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

    const table = useReactTable({
        data,
        columns: tableColumns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        initialState: {
            pagination: {
                pageSize: 10,
            },
        },
    });

    if (data.length === 0) return null;

    return (
        <div className="space-y-4">
            <div className="rounded-2xl border bg-card/50 backdrop-blur-sm shadow-sm overflow-hidden">
                <div className="relative w-full overflow-auto max-h-[600px]">
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
                            {table.getRowModel().rows.length ? (
                                table.getRowModel().rows.map((row) => (
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
                                ))
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

            {/* Pagination Controls */}
            <div className="flex items-center justify-end space-x-2 py-4">
                <button
                    className="flex items-center px-4 py-2 text-sm font-medium border rounded-md hover:bg-muted disabled:opacity-50"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                >
                    <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                </button>
                <span className="text-sm">
                    Page {table.getState().pagination.pageIndex + 1} of{' '}
                    {table.getPageCount()}
                </span>
                <button
                    className="flex items-center px-4 py-2 text-sm font-medium border rounded-md hover:bg-muted disabled:opacity-50"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                >
                    Next <ChevronRight className="w-4 h-4 ml-1" />
                </button>
            </div>
        </div>
    );
};
