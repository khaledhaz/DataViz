import * as XLSX from 'xlsx';

// Define the shape of messages sent to/from the worker
export type WorkerMessage =
    | { type: 'PARSE'; payload: ArrayBuffer }
    ;

export type WorkerResponse =
    | { type: 'SUCCESS'; payload: { header: string[]; data: any[] } }
    | { type: 'ERROR'; error: string }
    ;

console.log('Worker loaded');

self.onmessage = (e: MessageEvent<WorkerMessage>) => {
    const { type, payload } = e.data;
    console.log('Worker received message:', type);

    if (type === 'PARSE') {
        try {
            // internal processing
            console.log('Worker starting read...');
            const workbook = XLSX.read(payload, { type: 'array' });
            console.log('Worker workbook read. Sheets:', workbook.SheetNames);

            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];

            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            if (!jsonData || jsonData.length === 0) {
                throw new Error("Sheet is empty");
            }

            const header = jsonData[0] as string[];
            console.log('Worker found headers:', header);

            // Re-parse to get objects
            const objectData = XLSX.utils.sheet_to_json(worksheet, {
                header: 0,
                defval: ""
            });
            console.log('Worker parsed rows:', objectData.length);

            self.postMessage({
                type: 'SUCCESS',
                payload: {
                    header,
                    data: objectData
                }
            });

        } catch (err) {
            console.error('Worker error:', err);
            self.postMessage({
                type: 'ERROR',
                error: (err as Error).message || "Unknown worker error"
            });
        }
    }
};
