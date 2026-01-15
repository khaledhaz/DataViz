import { useState, type ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { BarChart3, Menu, X } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

export function AppLayout({ children }: { children: ReactNode }) {
    const { status, fileName } = useAppStore();
    const showSidebar = status === 'ready';
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-background text-foreground font-sans flex flex-col">
            {/* Top Header */}
            <header className="border-b bg-card z-20 sticky top-0">
                <div className="h-16 flex items-center px-4 md:px-6 justify-between">
                    <div className="flex items-center gap-3">
                        {/* Mobile Menu Toggle */}
                        {showSidebar && (
                            <button
                                onClick={() => setIsMobileMenuOpen(true)}
                                className="md:hidden p-2 -ml-2 hover:bg-muted rounded-md"
                            >
                                <Menu className="h-5 w-5" />
                            </button>
                        )}

                        <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
                            <BarChart3 className="text-primary-foreground h-5 w-5" />
                        </div>
                        <h1 className="text-xl font-bold tracking-tight font-heading">DataVis Pro</h1>
                    </div>
                    <div className="text-sm text-muted-foreground truncate max-w-[150px] md:max-w-none">
                        {status === 'ready' && fileName ? <span className="font-medium text-primary">{fileName}</span> : "Local Excel Dashboard"}
                    </div>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden relative">
                {/* Desktop Sidebar */}
                {showSidebar && (
                    <Sidebar className="hidden md:block w-72 flex-shrink-0 border-r bg-card/50 backdrop-blur-xl" />
                )}

                {/* Mobile Sidebar Overlay */}
                {showSidebar && isMobileMenuOpen && (
                    <div className="absolute inset-0 z-50 md:hidden">
                        {/* Backdrop */}
                        <div
                            className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
                            onClick={() => setIsMobileMenuOpen(false)}
                        />
                        {/* Drawer */}
                        <div className="absolute top-0 bottom-0 left-0 w-[80%] max-w-[300px] bg-card border-r shadow-2xl animate-in slide-in-from-left duration-200">
                            <div className="p-4 flex justify-end border-b">
                                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 hover:bg-muted rounded-md">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            <Sidebar className="h-full" />
                        </div>
                    </div>
                )}

                <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-background relative scroll-smooth">
                    {children}
                </main>
            </div>
        </div>
    );
}
