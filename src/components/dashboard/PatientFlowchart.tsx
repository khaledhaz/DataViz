import { useAppStore } from '@/store/useAppStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMemo } from 'react';
import { cn } from '@/lib/utils';;

interface TreeNodeProps {
    label: string;
    count: number;
    grandTotal: number;
    type?: 'default' | 'success' | 'warning' | 'error' | 'neutral';
    children?: React.ReactNode;
}

function TreeNode({ label, count, grandTotal, type = 'default', children }: TreeNodeProps) {
    const percentage = grandTotal > 0 ? ((count / grandTotal) * 100).toFixed(1) : "0";

    const colors = {
        default: "bg-card/80 backdrop-blur-sm border-primary/20 hover:border-primary/40",
        success: "bg-green-50/80 backdrop-blur-sm border-green-200 text-green-900 dark:bg-green-900/20 dark:border-green-800 dark:text-green-100",
        warning: "bg-yellow-50/80 backdrop-blur-sm border-yellow-200 text-yellow-900 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-100",
        error: "bg-red-50/80 backdrop-blur-sm border-red-200 text-red-900 dark:bg-red-900/20 dark:border-red-800 dark:text-red-100",
        neutral: "bg-muted/30 backdrop-blur-sm border-muted text-foreground",
    };

    return (
        <div className="flex flex-col items-center">
            <div className={cn("relative p-5 rounded-2xl border shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 min-w-[140px] text-center z-10", colors[type])}>
                <div className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-1">{label}</div>
                <div className="text-3xl font-bold font-heading">{count}</div>
                <div className="text-xs font-medium opacity-50 mt-1">{percentage}%</div>

                {/* Connector line to bottom */}
                {children && <div className="absolute -bottom-6 left-1/2 w-px h-6 bg-border/50" />}
            </div>

            {/* Children Container */}
            {children && (
                <div className="flex gap-4 mt-6 relative">
                    {/* Horizontal connecting line */}
                    <div className="absolute -top-0 left-1/2 -translate-x-1/2 w-full h-px bg-border/50" style={{ width: 'calc(100% - 140px)' }}></div>
                    {children}
                </div>
            )}
        </div>
    );
}

// Simple connector helper for leaf nodes to fix the "tree" look for standard HTML
function LeafNode({ label, count, grandTotal, type = 'default' }: { label: string, count: number, grandTotal: number, type?: TreeNodeProps['type'] }) {
    const percentage = grandTotal > 0 ? ((count / grandTotal) * 100).toFixed(1) : "0";

    const colors = {
        default: "border-primary/20",
        success: "border-green-200 bg-green-50/40 dark:border-green-900 dark:bg-green-900/10",
        warning: "border-yellow-200 bg-yellow-50/40 dark:border-yellow-900 dark:bg-yellow-900/10",
        error: "border-red-200 bg-red-50/40 dark:border-red-900 dark:bg-red-900/10",
        neutral: "border-muted bg-muted/20",
    };

    return (
        <div className="flex flex-col items-center relative min-w-[100px] pt-6">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-6 bg-border/50" />
            <div className={cn("p-3 rounded-xl border text-center shadow-sm hover:shadow-md transition-all duration-200 w-full backdrop-blur-sm", colors[type])}>
                <div className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider mb-1">{label}</div>
                <div className="text-xl font-bold font-heading">{count}</div>
                <div className="text-[9px] opacity-60 font-medium">{percentage}%</div>
            </div>
        </div>
    )
}

import { useFilteredData } from '@/hooks/use-filtered-data';

export function PatientFlowchart() {
    const { columns } = useAppStore();
    const data = useFilteredData();

    const stats = useMemo(() => {
        // 1. Total
        const total = data.length;

        // 2. CTA Done vs Nil
        // Look for "CTA done Y/N"
        const ctaParams = ["CTA done Y/N", "CTA", "CTA Done"];
        const ctaCol = columns.find(c => ctaParams.some(p => c.includes(p))) || "";

        const ctaYes = data.filter((r: any) => {
            const val = String(r[ctaCol]).toLowerCase();
            return val === 'y' || val === 'yes' || val === '1';
        }).length;
        const ctaNo = total - ctaYes;

        // 3. CTA + AI vs No AI
        // Look for "Occlusions Y/N - AI"
        const aiCol = columns.find(c => c.includes("Occlusions Y/N - AI")) || "";
        const aiYes = data.filter((r: any) => {
            const ctaDone = String(r[ctaCol] || "").toLowerCase().startsWith('y');
            // Heuristic: If AI column has ANY value or explictly Y? 
            // User diagram implies subset of CTA.
            if (!ctaDone) return false;
            const val = r[aiCol];
            return val != null && val !== "" && val !== "N/A";
        }).length;

        const noAi = ctaYes - aiYes;

        // 4. Outcomes (TP, FP, TN, FN)
        const tpCol = columns.find(c => c.toLowerCase().includes("true positive")) || "";
        const fpCol = columns.find(c => c.toLowerCase().includes("false positive")) || "";
        const tnCol = columns.find(c => c.toLowerCase().includes("true negative")) || "";
        const fnCol = columns.find(c => c.toLowerCase().includes("false negative")) || "";

        const tp = data.filter((r: any) => String(r[tpCol]).toLowerCase().startsWith('y')).length;
        const fp = data.filter((r: any) => String(r[fpCol]).toLowerCase().startsWith('y')).length;
        const tn = data.filter((r: any) => String(r[tnCol]).toLowerCase().startsWith('y')).length;
        const fn = data.filter((r: any) => String(r[fnCol]).toLowerCase().startsWith('y')).length;

        // 5. Exclusions
        const excludeCol = columns.find(c => c.toLowerCase().includes("exclude")) || "";
        const excludedRows = data.filter((r: any) => {
            const val = r[excludeCol];
            return val != null && val !== "" && val !== "N" && val !== "No";
        }).map((r: any) => ({
            id: r["NHS Number"] || r["Patient Name"] || "Unknown ID",
            reason: String(r[excludeCol]).trim(),
            other: r["Other information"] || "-"
        }));
        const excludedCount = excludedRows.length;

        // Aggregate reasons
        const reasonCounts: Record<string, number> = {};
        excludedRows.forEach((row: any) => {
            const reason = row.reason || "Unspecified";
            // Simple normalization: first 20 chars
            const key = reason.length > 20 ? reason.substring(0, 20) + "..." : reason;
            reasonCounts[key] = (reasonCounts[key] || 0) + 1;
        });

        const exclusionBreakdown = Object.entries(reasonCounts)
            .map(([label, count]) => ({ label, count }))
            .sort((a, b) => b.count - a.count);

        // Helper to check if row belongs to CTA + AI (229 group)
        const isAiYes = (r: any) => {
            const ctaDone = String(r[ctaCol] || "").toLowerCase().startsWith('y');
            if (!ctaDone) return false;
            const val = r[aiCol];
            return val != null && val !== "" && val !== "N/A";
        };

        // 6. Deep Dive Metrics (Filtered strictly from the CTA+AI group)

        // IT Issues
        const otherInfoCol = columns.find(c => c.toLowerCase().includes("other information")) || "";
        const itIssues = data.filter((r: any) => {
            if (!isAiYes(r)) return false;
            const reason = String(r[excludeCol] || "").toLowerCase();
            const info = String(r[otherInfoCol] || "").toLowerCase();
            return reason.includes("it") || info.includes("it issue") || info.includes("connectivity");
        }).length;

        // No CT Artery Report
        const radioReportCol = columns.find(c => c.toLowerCase().includes("radiology report")) || "";
        const noCtReport = data.filter((r: any) => {
            if (!isAiYes(r)) return false;
            const val = r[radioReportCol];
            return val == null || val === "" || String(val).toLowerCase().includes("no report");
        }).length;

        // No AI Report
        // Logic: Belongs to CTA+AI group but has "No AI Report" in exclusion/notes? 
        // OR: User wants to check validity. 
        // NOTE: By definition, isAiYes means they HAVE an AI result value. 
        // So this checks if they are in the group but also flagged as missing report elsewhere.
        const noAiReport = data.filter((r: any) => {
            if (!isAiYes(r)) return false;
            // Check if explicitly flagged in exclusion col as "No AI Report"
            const reason = String(r[excludeCol] || "").toLowerCase();
            return reason.includes("no ai report");
        }).length;

        // Radiologist Wrong
        const discrepancyCol = columns.find(c => c.includes("AI=N & Radio=Y?")) || "";
        const radioWrong = data.filter((r: any) => {
            if (!isAiYes(r)) return false;
            const val = String(r[discrepancyCol] || "").toLowerCase();
            return val.startsWith('y');
        }).length;

        return { total, ctaYes, ctaNo, aiYes, noAi, tp, fp, tn, fn, excludedCount, itIssues, noCtReport, noAiReport, radioWrong, excludedRows, exclusionBreakdown };
    }, [data, columns]);

    if (stats.total === 0) return null;

    return (
        <Card className="col-span-1 lg:col-span-7 overflow-x-auto">
            <CardHeader>
                <CardTitle>Patient Triage Flow</CardTitle>
            </CardHeader>
            <CardContent className="min-w-[1000px] flex justify-center pb-12">
                {/* Level 1: Total */}
                <TreeNode label="Total Patients" count={stats.total} grandTotal={stats.total} type="neutral">

                    {/* Level 2: Branches (CTA, Nil, Excluded) */}
                    <div className="flex gap-12 items-start">

                        {/* 1. CTA Done */}
                        <TreeNode label="CTA Done" count={stats.ctaYes} grandTotal={stats.total} type="default">
                            {/* Level 3: AI */}
                            <div className="flex gap-8">
                                <TreeNode label="CTA + AI" count={stats.aiYes} grandTotal={stats.total} type="default">
                                    <div className="flex flex-col gap-6 items-center">
                                        {/* Level 4: Outcomes */}
                                        <div className="flex gap-2">
                                            <LeafNode label="True Pos" count={stats.tp} grandTotal={stats.total} type="success" />
                                            <LeafNode label="True Neg" count={stats.tn} grandTotal={stats.total} type="success" />
                                            <LeafNode label="False Pos" count={stats.fp} grandTotal={stats.total} type="error" />
                                            <LeafNode label="False Neg" count={stats.fn} grandTotal={stats.total} type="error" />
                                        </div>

                                        {/* Additional Analysis Row */}
                                        {(stats.itIssues > 0 || stats.noCtReport > 0 || stats.noAiReport > 0 || stats.radioWrong > 0) && (
                                            <div className="mt-8 pt-6 border-t border-border/50 w-full flex flex-col items-center">
                                                <span className="text-xs font-semibold text-muted-foreground mb-4 uppercase tracking-wider bg-background px-2 -mt-9">Deep Dive Analysis</span>
                                                <div className="flex gap-4">
                                                    <LeafNode label="IT Issues" count={stats.itIssues} grandTotal={stats.total} type="neutral" />
                                                    <LeafNode label="No CT Report" count={stats.noCtReport} grandTotal={stats.total} type="neutral" />
                                                    <LeafNode label="No AI Report" count={stats.noAiReport} grandTotal={stats.total} type="warning" />
                                                    <LeafNode label="Rad Wrong" count={stats.radioWrong} grandTotal={stats.total} type="error" />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </TreeNode>

                                <LeafNode label="No AI / Other" count={stats.noAi} grandTotal={stats.total} type="neutral" />
                            </div>
                        </TreeNode>

                        {/* 2. Excluded (New Branch) */}
                        {stats.excludedCount > 0 && (
                            <TreeNode label="Excluded" count={stats.excludedCount} grandTotal={stats.total} type="error">
                                <div className="flex gap-2 flex-wrap max-w-[300px] justify-center">
                                    {stats.exclusionBreakdown.map((item, idx) => (
                                        <LeafNode
                                            key={idx}
                                            label={item.label}
                                            count={item.count}
                                            grandTotal={stats.total}
                                            type="error"
                                        />
                                    ))}
                                </div>
                            </TreeNode>
                        )}

                        {/* 3. Nil / No CTA */}
                        <LeafNode label="Nil / No CTA" count={stats.ctaNo} grandTotal={stats.total} type="warning" />
                    </div>

                </TreeNode>
            </CardContent>
        </Card>
    );
}
