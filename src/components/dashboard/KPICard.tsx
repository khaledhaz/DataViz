import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { LucideProps } from "lucide-react";
import type { ElementType } from "react";

interface KPICardProps {
    title: string;
    value: string | number;
    icon: ElementType<LucideProps>;
    description?: string;
}

export function KPICard({ title, value, icon: Icon, description }: KPICardProps) {
    return (
        <Card className="hover:shadow-md transition-all duration-300 border-muted/60 bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    {title}
                </CardTitle>
                <Icon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold font-heading text-foreground">{value}</div>
                {description && (
                    <p className="text-xs text-muted-foreground mt-1 font-medium">
                        {description}
                    </p>
                )}
            </CardContent>
        </Card>
    )
}
