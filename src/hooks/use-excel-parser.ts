import { useCallback } from 'react';
import { useAppStore } from '@/store/useAppStore';
import * as XLSX from 'xlsx';

export function useExcelParser() {
    const { setParsing, setData, setError } = useAppStore();

    const parseFile = useCallback(async (file: File) => {
        try {
            setParsing();
            console.log('Starting main thread parsing...');

            // Update filename immediately
            useAppStore.setState({ fileName: file.name });

            const buffer = await file.arrayBuffer();
            const workbook = XLSX.read(buffer, { type: 'array' });

            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];

            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            if (!jsonData || jsonData.length === 0) {
                throw new Error("Sheet is empty");
            }

            const header = jsonData[0] as string[];

            // Parse to objects
            const objectData = XLSX.utils.sheet_to_json(worksheet, {
                header: 0,
                defval: ""
            });

            console.log('Parsing complete. Rows:', objectData.length);
            setData(objectData, header, file.name);

        } catch (err) {
            console.error('Parsing error:', err);
            setError((err as Error).message || "Failed to parse file");
        }
    }, [setParsing, setData, setError]);

    return { parseFile };
}
