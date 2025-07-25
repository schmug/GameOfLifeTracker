import { Switch, Route, Router as WouterRouter } from "wouter";
import { useState, useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import StaticHome from "./pages/StaticHome";
import NotFound from "./pages/not-found";

function AppContent() {
  return (
    <main className="flex flex-col min-h-screen bg-background">
      <WouterRouter base={import.meta.env.BASE_URL}>
        <Switch>
          <Route path="/" component={StaticHome} />
          <Route component={NotFound} />
        </Switch>
      </WouterRouter>
      <Toaster />
    </main>
  );
}

export default function GitHubPagesApp() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}