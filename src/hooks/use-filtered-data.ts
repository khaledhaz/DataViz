import { useMemo } from 'react';
import { useAppStore } from '@/store/useAppStore';

export function useFilteredData() {
    const { data, filters } = useAppStore();

    const filteredData = useMemo(() => {
        if (filters.length === 0) return data;

        return data.filter((row) => {
            // AND Logic: All filters must pass
            return filters.every((filter) => {
                const rowValue = row[filter.field];
                const filterValue = filter.value;

                // String comparison helper
                const strRow = String(rowValue ?? '').toLowerCase();
                const strFilter = String(filterValue).toLowerCase();

                switch (filter.operator) {
                    // String Ops
                    case 'contains':
                        return strRow.includes(strFilter);
                    case 'equals':
                        return strRow === strFilter;
                    case 'starts_with':
                        return strRow.startsWith(strFilter);
                    case 'ends_with':
                        return strRow.endsWith(strFilter);

                    // Number Ops (Try to parse, if NaN fall back to string or false)
                    case 'gt':
                        return Number(rowValue) > Number(filterValue);
                    case 'lt':
                        return Number(rowValue) < Number(filterValue);
                    case 'eq':
                        // robust equality for numbers or strings
                        return rowValue == filterValue;
                    case 'neq':
                        return rowValue != filterValue;

                    // Existence
                    case 'is_empty':
                        return rowValue == null || rowValue === '';
                    case 'is_not_empty':
                        return rowValue != null && rowValue !== '';

                    default:
                        return true;
                }
            });
        });
    }, [data, filters]);

    return filteredData;
}
