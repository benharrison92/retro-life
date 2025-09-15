import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Feed from "@/pages/Feed";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Catalogues from "./pages/Catalogues";
import FeedbackSpaces from "./pages/FeedbackSpaces";
import FeedbackSpace from "./pages/FeedbackSpace";
import CreateRetro from "./pages/CreateRetro";
import Trip from "./pages/Trip";
import MapExplore from "./pages/MapExplore";
import FeaturedTrips from "./pages/FeaturedTrips";
import UserProfile from "./pages/UserProfile";

import RetroReadCardPage from "./pages/RetroReadCard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Feed />} />
            <Route path="/retros" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/catalogues" element={<Catalogues />} />
            <Route path="/feedback-spaces" element={<FeedbackSpaces />} />
            <Route path="/feedback/:code" element={<FeedbackSpace />} />
            <Route path="/create-retro" element={<CreateRetro />} />
            <Route path="/trip/:id" element={<Trip />} />
            <Route path="/explore" element={<MapExplore />} />
            <Route path="/featured-trips" element={<FeaturedTrips />} />
            <Route path="/retro-read-card" element={<RetroReadCardPage />} />
            
            <Route path="/user/:userId" element={<UserProfile />} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
