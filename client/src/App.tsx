import { Switch, Route, Router as WouterRouter } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import WebcamOverlay from "@/pages/WebcamOverlay";

function AppRouter() {
  return (
    <WouterRouter base={import.meta.env.BASE_URL}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/overlay" component={WebcamOverlay} />
        <Route component={NotFound} />
      </Switch>
    </WouterRouter>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppRouter />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
