import { Switch, Route, Router } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Deficiencies from "./pages/Deficiencies";
import Evidence from "./pages/Evidence";
import Schedule from "./pages/Schedule";
import ChecklistPage from "./pages/ChecklistPage";
import Meetings from "./pages/Meetings";
import NotFound from "./pages/not-found";

function AppLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Router hook={useHashLocation}>
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/deficiencies" component={Deficiencies} />
            <Route path="/evidence" component={Evidence} />
            <Route path="/schedule" component={Schedule} />
            <Route path="/checklist" component={ChecklistPage} />
            <Route path="/meetings" component={Meetings} />
            <Route component={NotFound} />
          </Switch>
        </Router>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppLayout />
      <Toaster />
    </QueryClientProvider>
  );
}
