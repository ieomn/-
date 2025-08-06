import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { AuthProvider, useAuth } from "@/components/auth/AuthProvider";
import { LoginForm } from "@/components/auth/LoginForm";
import Index from "./pages/Index";
import { CategoryOverview } from "./pages/CategoryOverview";
import { ModelDetails } from "./pages/ModelDetails";
import { DataAnalysis } from "./pages/DataAnalysis";
import { LatheManagement } from "./pages/LatheManagement";
import { MillManagement } from "./pages/MillManagement";
import { SettingsPage } from "./pages/SettingsPage";
import { HelpPage } from "./pages/HelpPage";
import { UserProfilePage } from "./pages/UserProfilePage";
import { AccountSettings } from "./pages/AccountSettings";
import { DataUpload } from "./pages/DataUpload";
import { SectionComponents } from "./pages/SectionComponents";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// 应用主界面组件
const AppContent = () => {
  const { user, loading } = useAuth();

  // 临时跳过登录进行测试
  const SKIP_LOGIN = true;
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">MT</span>
          </div>
          <p className="text-lg text-muted-foreground">加载中...</p>
        </div>
      </div>
    );
  }

  if (!user && !SKIP_LOGIN) {
    return <LoginForm />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 overflow-x-auto">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/category/lathe" element={<LatheManagement />} />
            <Route path="/category/mill" element={<MillManagement />} />
            <Route path="/category/:category" element={<CategoryOverview />} />
            <Route path="/category/:category/:model" element={<ModelDetails />} />
            <Route path="/category/:category/:model/:section" element={<SectionComponents />} />
            <Route path="/analysis/:category/:model/:section/:component" element={<DataAnalysis />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/account" element={<AccountSettings />} />
            <Route path="/data-upload" element={<DataUpload />} />
            <Route path="/help" element={<HelpPage />} />
            <Route path="/profile" element={<UserProfilePage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
