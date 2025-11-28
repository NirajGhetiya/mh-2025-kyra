import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { LoadingProvider } from "./contexts/LoadingContext";
import GlobalLoading from "./components/GlobalLoading";


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider>
        <LoadingProvider>
          <GlobalLoading />
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
            </Routes>
          </BrowserRouter>
        </LoadingProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;