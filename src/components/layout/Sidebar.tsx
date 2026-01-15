import { LayoutDashboard, Table as TableIcon, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/useAppStore';
import { FilterBuilder } from '../filters/FilterBuilder';

interface SidebarProps {
    className?: string;
}

export function Sidebar({ className }: SidebarProps) {
    const { currentView, setCurrentView } = useAppStore();

    const navItems = [
        {
            label: 'Dashboard',
            icon: LayoutDashboard,
            view: 'dashboard' as const,
        },
        {
            label: 'Data Grid',
            icon: TableIcon,
            view: 'grid' as const,
        },
    ];

    return (
        <div className={cn("pb-12 w-64 border-r min-h-screen bg-card", className)}>
            <div className="space-y-4 py-4">
                <div className="px-3 py-2">
                    <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                        Views
                    </h2>
                    <div className="space-y-1">
                        {navItems.map((item) => (
                            <button
                                key={item.view}
                                onClick={() => setCurrentView(item.view)}
                                className={cn(
                                    "w-full flex items-center justify-start rounded-md px-4 py-2 text-sm font-medium transition-colors",
                                    currentView === item.view
                                        ? "bg-secondary text-secondary-foreground"
                                        : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                                )}
                            >
                                <item.icon className="mr-2 h-4 w-4" />
                                {item.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="px-3 py-2">
                    <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                        Settings
                    </h2>
                    <div className="space-y-1">
                        <button className="w-full flex items-center justify-start rounded-md px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary/50 hover:text-foreground">
                            <Settings className="mr-2 h-4 w-4" />
                            Theme
                        </button>
                    </div>
                </div>

                <div className="px-3 py-2 border-t mt-4">
                    <FilterBuilder />
                </div>
            </div>
        </div>
    );
}
