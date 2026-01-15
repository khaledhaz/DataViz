import React, { useCallback, useState } from 'react';
import { useExcelParser } from '@/hooks/use-excel-parser';
import { cn } from '@/lib/utils';
import { Upload, FileSpreadsheet, Loader2 } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

export const DropZone = () => {
    const { parseFile } = useExcelParser();
    const status = useAppStore((s) => s.status);
    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const file = e.dataTransfer.files[0];
        if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
            parseFile(file);
        } else {
            alert("Please upload a valid Excel file (.xlsx or .xls)");
        }
    }, [parseFile]);

    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            parseFile(e.target.files[0]);
        }
    }, [parseFile]);

    if (status === 'parsing') {
        return (
            <div className="flex flex-col items-center justify-center p-12 space-y-4 border-2 border-dashed rounded-xl border-primary/20 bg-muted/30 animate-pulse">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                <p className="text-sm font-medium text-muted-foreground">Parsing heavy spreadsheet...</p>
            </div>
        );
    }

    return (
        <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
                "relative group cursor-pointer transition-all duration-300 ease-in-out",
                "border-2 border-dashed rounded-xl p-12 text-center",
                isDragging
                    ? "border-primary bg-primary/5 scale-[1.02] shadow-xl"
                    : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30"
            )}
        >
            <input
                type="file"
                accept=".xlsx, .xls"
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                onChange={handleFileSelect}
            />

            <div className="flex flex-col items-center gap-4">
                <div className={cn(
                    "p-4 rounded-full transition-colors",
                    isDragging ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                )}>
                    {isDragging ? <FileSpreadsheet className="w-8 h-8" /> : <Upload className="w-8 h-8" />}
                </div>

                <div className="space-y-1">
                    <h3 className="text-lg font-semibold tracking-tight">
                        {isDragging ? "Drop to analyze" : "Upload Spreadsheet"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        Drag & drop or click to browse (.xlsx)
                    </p>
                </div>
            </div>
        </div>
    );
};
