import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PasswordGate } from "@/components/PasswordGate";
import Public from "./pages/Public.tsx";
import ArticleView from "./pages/ArticleView.tsx";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Gune publikoa */}
          <Route path="/" element={<Public />} />
          <Route path="/albistea/:slug" element={<ArticleView />} />
          <Route path="/oharra/:slug" element={<ArticleView />} />

          {/* Iturri-monitorea (pribatua) */}
          <Route
            path="/iturriak"
            element={
              <PasswordGate
                title="Iturrien monitorea"
                description="Kanpo-iturrien monitorea pasahitzarekin babestuta dago."
              >
                <Index />
              </PasswordGate>
            }
          />

          {/* CMSera birbideratzea (Decap CMS public/admin/-en bizi da) */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
