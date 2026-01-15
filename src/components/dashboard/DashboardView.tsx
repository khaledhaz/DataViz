import { useAppStore } from '@/store/useAppStore';
import { KPICard } from './KPICard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent } from '@/components/ui/card';
import { useMemo, useState } from 'react';
import { TrendingUp, Users, Activity } from 'lucide-react';
import { PatientFlowchart } from './PatientFlowchart';
import { useFilteredData } from '@/hooks/use-filtered-data';

export function DashboardView() {
    const { columns } = useAppStore();
    const data = useFilteredData();

    // State for user-controlled Chart Config
    // Initialize with smart defaults based on user's specific dataset headers if present
    const [categoryCol, setCategoryCol] = useState<string>(() => {
        // Smart default: Look for "Location", "Category", or specific Medical fields
        return columns.find(c => c.includes("Location") || c.includes("Category") || c.includes("Occlusion")) || columns[0] || "";
    });

    // If metricCol is "Count", we just count rows. Otherwise we sum the values.
    const [metricCol] = useState<string>("Count");

    // Aggregation Logic for Chart
    const chartData = useMemo(() => {
        if (!categoryCol) return [];

        const map = new Map<string, number>();

        data.forEach(row => {
            let key = String(row[categoryCol] || "Unknown");
            if (key.trim() === "") key = "Unknown";

            if (metricCol === "Count") {
                // Count occurrences
                map.set(key, (map.get(key) || 0) + 1);
            } else {
                // Sum values (if numeric)
                const val = Number(row[metricCol]) || 0;
                map.set(key, (map.get(key) || 0) + val);
            }
        });

        // Sort by value desc
        return Array.from(map.entries())
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 15); // Top 15 categories to avoid overcrowding
    }, [data, categoryCol, metricCol]);

    // Calculations for KPIs
    const totalPatients = data.length;

    // Specific Medical KPIs heuristics
    const truePositives = useMemo(() => {
        // Look for "True positive" column
        const tpCol = columns.find(c => c.toLowerCase().includes("true positive"));
        if (!tpCol) return 0;
        // Count non-empty, non-zero, or "Y" values
        return data.filter(r => {
            const val = r[tpCol];
            return val === "Y" || val === "Yes" || val === 1 || val === "1";
        }).length;
    }, [data, columns]);

    const thrombectomyReferrals = useMemo(() => {
        const refCol = columns.find(c => c.toLowerCase().includes("thrombectomy referral") && !c.includes("DateTime"));
        if (!refCol) return 0;
        return data.filter(r => {
            const val = String(r[refCol]).toLowerCase();
            return val === "y" || val === "yes";
        }).length;
    }, [data, columns]);


    return (
        <div className="space-y-6 fade-in-20 animate-in">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <h2 className="text-3xl font-bold tracking-tight font-heading text-primary">Analysis Dashboard</h2>

                {/* simple controls */}
                <div className="flex gap-2 w-full sm:w-auto">
                    <select
                        className="h-10 rounded-xl border border-input bg-card px-3 py-1 text-sm shadow-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 w-full sm:w-[200px]"
                        value={categoryCol}
                        onChange={(e) => setCategoryCol(e.target.value)}
                    >
                        {columns.map(c => <option key={c} value={c}>By {c}</option>)}
                    </select>
                </div>
            </div>

            {/* Patient Flow Visualization */}
            <PatientFlowchart />

            {/* KPI Grid */}
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                <KPICard
                    title="Total Patients / Rows"
                    value={totalPatients.toLocaleString()}
                    icon={Users}
                />
                <KPICard
                    title={columns.some(c => c.includes("True positive")) ? "True Positives" : "Detected Items"}
                    value={truePositives || "-"}
                    icon={Activity}
                    description={columns.some(c => c.includes("True positive")) ? "Flagged as 'Y'" : "Column not found"}
                />
                <KPICard
                    title="Thrombectomy Referrals"
                    value={thrombectomyReferrals || "-"}
                    icon={TrendingUp}
                    description="Patients referred"
                />
            </div>

            {/* Chart Section */}
            {/* Chart Section */}
            <div className="grid gap-3 sm:gap-4 grid-cols-1">
                {/* Chart Controls - Moved outside for visibility */}
                <div className="flex flex-col sm:flex-row justify-between items-end sm:items-center gap-4 bg-card/30 p-1 rounded-xl">
                    <h3 className="font-heading text-lg font-bold text-foreground px-2">Distribution Analysis</h3>
                    <div className="flex items-center gap-3 bg-card p-1.5 rounded-lg border shadow-sm">
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider pl-2">Group By:</span>
                        <select
                            className="bg-transparent text-sm font-medium focus:outline-none cursor-pointer p-1"
                            value={categoryCol}
                            onChange={(e) => setCategoryCol(e.target.value)}
                        >
                            {columns.map((col) => (
                                <option key={col} value={col}>
                                    {col}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <Card className="col-span-1 shadow-md border-muted">
                    <CardContent className="pt-6">
                        <div className="h-[300px] md:h-[400px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 20, right: 30, left: -20, bottom: 50 }}>
                                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted/50" vertical={false} />
                                    <XAxis
                                        dataKey="name"
                                        stroke="#888888"
                                        fontSize={11}
                                        tickLine={false}
                                        axisLine={false}
                                        angle={-45}
                                        textAnchor="end"
                                        interval={0}
                                        height={60}
                                    />
                                    <YAxis
                                        stroke="#888888"
                                        fontSize={11}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'hsl(var(--muted)/0.4)' }}
                                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '12px', border: '1px solid hsl(var(--border))', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                        itemStyle={{ color: 'hsl(var(--foreground))', fontWeight: 500 }}
                                    />
                                    <Bar
                                        dataKey="value"
                                        fill="hsl(var(--primary))"
                                        radius={[8, 8, 0, 0]}
                                        barSize={40}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
