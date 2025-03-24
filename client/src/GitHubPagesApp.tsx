import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { Toaster } from '@/components/ui/toaster';
import StaticHome from '@/pages/StaticHome';
import '@/index.css';

function AppContent() {
  return (
    <main>
      <StaticHome />
      <Toaster />
    </main>
  );
}

export default function GitHubPagesApp() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}