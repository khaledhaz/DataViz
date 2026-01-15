import { create } from 'zustand';

export type AppStatus = 'idle' | 'parsing' | 'ready' | 'error';

export type FilterOperator =
    | 'contains' | 'equals' | 'starts_with' | 'ends_with'
    | 'gt' | 'lt' | 'eq' | 'neq'
    | 'is_empty' | 'is_not_empty';

export interface FilterRule {
    id: string;
    field: string;
    operator: FilterOperator;
    value: string | number;
}

interface AppState {
    status: AppStatus;
    data: any[];
    columns: string[];
    error: string | null;
    fileName: string | null;
    currentView: 'dashboard' | 'grid';

    filters: FilterRule[];

    // Actions
    setParsing: () => void;
    setData: (data: any[], columns: string[], fileName: string) => void;
    setError: (error: string) => void;
    setCurrentView: (view: 'dashboard' | 'grid') => void;

    addFilter: (filter: FilterRule) => void;
    removeFilter: (id: string) => void;
    updateFilter: (id: string, updates: Partial<FilterRule>) => void;
    clearFilters: () => void;

    reset: () => void;
}

export const useAppStore = create<AppState>((set) => ({
    status: 'idle',
    data: [],
    columns: [],
    error: null,
    fileName: null,
    currentView: 'dashboard',
    filters: [],

    setParsing: () => set({ status: 'parsing', error: null }),
    setData: (data, columns, fileName) => set({ status: 'ready', data, columns, fileName, filters: [] }),
    setError: (error) => set({ status: 'error', error }),
    setCurrentView: (view) => set({ currentView: view }),

    addFilter: (filter) => set((state) => ({ filters: [...state.filters, filter] })),
    removeFilter: (id) => set((state) => ({ filters: state.filters.filter(f => f.id !== id) })),
    updateFilter: (id, updates) => set((state) => ({
        filters: state.filters.map(f => f.id === id ? { ...f, ...updates } : f)
    })),
    clearFilters: () => set({ filters: [] }),

    reset: () => set({ status: 'idle', data: [], columns: [], error: null, fileName: null, currentView: 'dashboard', filters: [] }),
}));
