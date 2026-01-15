import { DropZone } from '@/components/upload/DropZone';
import { DataTable } from '@/components/grid/DataTable';
import { AppLayout } from '@/components/layout/AppLayout';
import { DashboardView } from '@/components/dashboard/DashboardView';
import { useAppStore } from '@/store/useAppStore';

function App() {
  const { status, currentView } = useAppStore();

  const renderContent = () => {
    if (status === 'idle' || status === 'parsing') {
      return (
        <div className="max-w-xl mx-auto mt-20">
          <DropZone />
        </div>
      );
    }

    if (status === 'error') {
      return (
        <div className="max-w-xl mx-auto mt-20 space-y-4">
          <div className="p-4 bg-destructive/10 text-destructive rounded-md border border-destructive/20">
            Error parsing file. Please try again.
          </div>
          <DropZone />
        </div>
      );
    }

    if (status === 'ready') {
      if (currentView === 'dashboard') {
        return <DashboardView />;
      } else {
        return (
          <div className="space-y-4 fade-in-50 animate-in slide-in-from-bottom-5 duration-500">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold tracking-tight">Dataset Grid</h2>
            </div>
            <DataTable />
          </div>
        );
      }
    }
  };

  return (
    <AppLayout>
      {renderContent()}
    </AppLayout>
  )
}

export default App
