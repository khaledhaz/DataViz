import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import type { FilterRule, FilterOperator } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { Plus, X, Filter as FilterIcon } from 'lucide-react';

export function FilterBuilder() {
    const { columns, filters, addFilter, removeFilter, clearFilters } = useAppStore();
    const [isAdding, setIsAdding] = useState(false);

    // Pending filter state
    const [field, setField] = useState(columns[0] || "");
    const [operator, setOperator] = useState<FilterOperator>('contains');
    const [value, setValue] = useState("");

    const handleAdd = () => {
        if (!field) return;
        const newFilter: FilterRule = {
            id: crypto.randomUUID(),
            field,
            operator,
            value
        };
        addFilter(newFilter);
        setIsAdding(false);
        setValue(""); // reset value but keep field/op as they might render multiple similar filters
    };

    return (
        <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm flex items-center">
                    <FilterIcon className="w-4 h-4 mr-2" />
                    Active Filters
                    {filters.length > 0 && <span className="ml-2 bg-primary/20 text-primary text-xs px-2 py-0.5 rounded-full">{filters.length}</span>}
                </h3>
                {filters.length > 0 && (
                    <button onClick={clearFilters} className="text-xs text-muted-foreground hover:text-destructive">
                        Clear all
                    </button>
                )}
            </div>

            {/* Active Filters List */}
            <div className="space-y-2">
                {filters.map(f => (
                    <div key={f.id} className="relative group text-sm p-3 bg-secondary/50 rounded-md border border-border">
                        <div className="font-medium text-xs text-muted-foreground mb-1">{f.field}</div>
                        <div className="flex items-center gap-2">
                            <span className="bg-background px-1.5 rounded border text-[10px] uppercase font-bold text-muted-foreground">{f.operator.replace('_', ' ')}</span>
                            <span className="font-medium truncate" title={String(f.value)}>{f.value}</span>
                        </div>
                        <button
                            onClick={() => removeFilter(f.id)}
                            className="absolute top-2 right-2 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ))}

                {filters.length === 0 && !isAdding && (
                    <div className="text-sm text-muted-foreground py-8 text-center italic border-2 border-dashed rounded-lg">
                        No active filters
                    </div>
                )}
            </div>

            {/* Add New Filter Form */}
            {isAdding ? (
                <div className="p-3 border rounded-md bg-card shadow-sm space-y-3 animate-in fade-in zoom-in-95 duration-200">
                    <div className="space-y-1">
                        <label className="text-xs font-medium">Column</label>
                        <select
                            className="w-full h-8 rounded-md border bg-background px-2 text-xs"
                            value={field}
                            onChange={(e) => setField(e.target.value)}
                        >
                            {columns.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-medium">Operator</label>
                        <select
                            className="w-full h-8 rounded-md border bg-background px-2 text-xs"
                            value={operator}
                            onChange={(e) => setOperator(e.target.value as FilterOperator)}
                        >
                            <optgroup label="Text">
                                <option value="contains">Contains</option>
                                <option value="equals">Equals</option>
                                <option value="starts_with">Starts with</option>
                            </optgroup>
                            <optgroup label="Number">
                                <option value="gt">Greater Than (&gt;)</option>
                                <option value="lt">Less Than (&lt;)</option>
                                <option value="eq">Equals (=)</option>
                            </optgroup>
                            <optgroup label="Status">
                                <option value="is_empty">Is Empty</option>
                                <option value="is_not_empty">Is Not Empty</option>
                            </optgroup>
                        </select>
                    </div>

                    {/* Only show value input if not "Is Empty" etc */}
                    {!['is_empty', 'is_not_empty'].includes(operator) && (
                        <div className="space-y-1">
                            <label className="text-xs font-medium">Value</label>
                            <input
                                className="w-full h-8 rounded-md border bg-background px-2 text-xs"
                                placeholder="Value..."
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                            />
                        </div>
                    )}

                    <div className="flex gap-2 pt-2">
                        <Button size="sm" onClick={handleAdd} className="flex-1 h-8 text-xs">Apply</Button>
                        <Button size="sm" variant="ghost" onClick={() => setIsAdding(false)} className="h-8 w-8 p-0"><X className="w-4 h-4" /></Button>
                    </div>
                </div>
            ) : (
                <Button variant="outline" className="w-full border-dashed" onClick={() => setIsAdding(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Filter
                </Button>
            )}
        </div>
    );
}
