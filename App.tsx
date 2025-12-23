import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { Layout } from "./src/components/layout/Layout";
import { AuthProvider } from "./src/components/AuthProvider";
import { ErrorBoundary } from "./src/components/ErrorBoundary";
import React, { Suspense } from "react";
import { ProtectedRoute } from "./src/components/ProtectedRoute";

import { VoiceMode } from "./src/types/voice";
import { SocialChatFeature } from "./components/SocialChatFeature";

// Existing Features (Lazy Loaded)
const ComposeFeature = React.lazy(() => import('./components/ComposeFeature').then(m => ({ default: m.ComposeFeature })));
const SearchFeature = React.lazy(() => import('./components/SearchFeature').then(m => ({ default: m.SearchFeature })));
const CheckFeature = React.lazy(() => import('./components/CheckFeature').then(m => ({ default: m.CheckFeature })));
const AppMarketplaceFeature = React.lazy(() => import('./components/AppMarketplaceFeature').then(m => ({ default: m.AppMarketplaceFeature })));
const ExploreFeature = React.lazy(() => import('./components/ExploreFeature').then(m => ({ default: m.ExploreFeature })));
const DesignFeature = React.lazy(() => import('./components/DesignFeature').then(m => ({ default: m.DesignFeature })));
const FashionFeature = React.lazy(() => import('./components/FashionFeature').then(m => ({ default: m.FashionFeature })));
const DashboardFeature = React.lazy(() => import('./components/DashboardFeature').then(m => ({ default: m.DashboardFeature })));
const WebBuilderFeature = React.lazy(() => import('./components/WebBuilderFeature').then(m => ({ default: m.WebBuilderFeature })));
const JobsFeature = React.lazy(() => import('./components/JobsFeature').then(m => ({ default: m.JobsFeature })));
const ExpertsFeature = React.lazy(() => import('./components/ExpertsFeature').then(m => ({ default: m.ExpertsFeature })));
const HandymanFeature = React.lazy(() => import('./components/HandymanFeature').then(m => ({ default: m.HandymanFeature })));
const DirectChatFeature = React.lazy(() => import('./components/DirectChatFeature').then(m => ({ default: m.DirectChatFeature })));
const ContentAutomationFeature = React.lazy(() => import('./components/ContentAutomationFeature').then(m => ({ default: m.ContentAutomationFeature })));
const SettingsFeature = React.lazy(() => import('./components/SettingsFeature').then(m => ({ default: m.SettingsFeature })));
const ProfileFeature = React.lazy(() => import('./components/ProfileFeature').then(m => ({ default: m.ProfileFeature })));
const ProjectsFeature = React.lazy(() => import('./components/ProjectsFeature').then(m => ({ default: m.ProjectsFeature })));
const MyJobsFeature = React.lazy(() => import('./components/MyJobsFeature').then(m => ({ default: m.MyJobsFeature })));
const HistoryFeature = React.lazy(() => import('./components/HistoryFeature').then(m => ({ default: m.HistoryFeature })));
const MembershipFeature = React.lazy(() => import('./components/MembershipFeature').then(m => ({ default: m.MembershipFeature })));
const PromotionsFeature = React.lazy(() => import('./components/PromotionsFeature').then(m => ({ default: m.PromotionsFeature })));
const MembershipTierFeature = React.lazy(() => import('./components/MembershipTierFeature').then(m => ({ default: m.MembershipTierFeature })));
const ReferralFeature = React.lazy(() => import('./components/ReferralFeature').then(m => ({ default: m.ReferralFeature })));
const ExpertUpdateFeature = React.lazy(() => import('./components/ExpertUpdateFeature').then(m => ({ default: m.ExpertUpdateFeature })));
const PaymentFeature = React.lazy(() => import('./components/PaymentFeature').then(m => ({ default: m.PaymentFeature })));
const WalletHistoryFeature = React.lazy(() => import('./components/WalletHistoryFeature').then(m => ({ default: m.WalletHistoryFeature })));
const UpgradeFeature = React.lazy(() => import('./components/UpgradeFeature').then(m => ({ default: m.UpgradeFeature })));
const VoiceChat = React.lazy(() => import('./components/VoiceChat'));

// Wrappers for Navigation and State
const VoiceRoute = () => {
  const navigate = useNavigate();
  const [mode, setMode] = React.useState<VoiceMode>('FULL');

  React.useEffect(() => {
    if (mode === 'HIDDEN') {
      navigate('/');
    }
  }, [mode, navigate]);

  const handleNavigate = (view: any) => {
    if (view === 'BUILDER') navigate('/builder');
    else if (view === 'INTERIOR') navigate('/design');
    else if (view === 'COMPOSE') navigate('/compose');
    else if (view === 'SEARCH') navigate('/search');
    else if (view === 'MARKETING') navigate('/automation');
  };

  return (
    <VoiceChat 
      mode={mode} 
      setMode={setMode} 
      onNavigate={handleNavigate}
      onFillAndGenerate={(text) => console.log("Voice command:", text)}
      lastUserInteraction={null}
    />
  );
};

const DashboardRoute = () => {
  const navigate = useNavigate();
  return (
    <DashboardFeature
      onOpenProject={(website) => navigate('/builder', { state: { project: website } })}
      onNewProject={() => navigate('/builder')}
    />
  );
};

const WebBuilderRoute = () => {
  const location = useLocation();
  const project = location.state?.project;
  return <WebBuilderFeature currentProject={project} />;
};

// Create a client
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Layout>
              <ErrorBoundary>
                <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
                  <Routes>
                    <Route path="/" element={<DashboardRoute />} />
                    <Route path="/builder" element={<ProtectedRoute><WebBuilderRoute /></ProtectedRoute>} />
                    <Route path="/compose" element={<ProtectedRoute><ComposeFeature /></ProtectedRoute>} />
                    <Route path="/design" element={<ProtectedRoute><DesignFeature initialType="interior" /></ProtectedRoute>} />
                    <Route path="/fashion" element={<ProtectedRoute><FashionFeature /></ProtectedRoute>} />
                    <Route path="/automation" element={<ProtectedRoute><ContentAutomationFeature /></ProtectedRoute>} />
                    <Route path="/voice" element={<ProtectedRoute><VoiceRoute /></ProtectedRoute>} />
                    <Route path="/apps" element={<AppMarketplaceFeature />} />
                    <Route path="/explore" element={<ExploreFeature />} />
                    <Route path="/search" element={<ProtectedRoute><SearchFeature /></ProtectedRoute>} />
                    <Route path="/jobs" element={<JobsFeature />} />
                    <Route path="/giao-viec-lam" element={<JobsFeature />} />
                    <Route path="/experts" element={<ExpertsFeature />} />
                    <Route path="/chuyen-gia" element={<ExpertsFeature />} />
                    <Route path="/goi-tho" element={<HandymanFeature />} />
                    <Route path="/chat" element={<ProtectedRoute><SocialChatFeature /></ProtectedRoute>} />
                    <Route path="/check" element={<CheckFeature />} />
                    <Route path="/settings" element={<ProtectedRoute><SettingsFeature /></ProtectedRoute>} />
                    <Route path="/profile" element={<ProtectedRoute><ProfileFeature /></ProtectedRoute>} />
                    <Route path="/profile/payment" element={<ProtectedRoute><PaymentFeature /></ProtectedRoute>} />
                    <Route path="/profile/wallet-history" element={<ProtectedRoute><WalletHistoryFeature /></ProtectedRoute>} />
                    <Route path="/profile/upgrade" element={<ProtectedRoute><UpgradeFeature /></ProtectedRoute>} />
                    <Route path="/profile/expert-update" element={<ProtectedRoute><ExpertUpdateFeature /></ProtectedRoute>} />
                    <Route path="/projects" element={<ProtectedRoute><ProjectsFeature /></ProtectedRoute>} />
                    <Route path="/jobs/my-jobs" element={<ProtectedRoute><MyJobsFeature /></ProtectedRoute>} />
                    <Route path="/history" element={<ProtectedRoute><HistoryFeature /></ProtectedRoute>} />
                    <Route path="/membership/packages" element={<ProtectedRoute><MembershipFeature /></ProtectedRoute>} />
                    <Route path="/membership/promos" element={<ProtectedRoute><PromotionsFeature /></ProtectedRoute>} />
                    <Route path="/membership/tier" element={<ProtectedRoute><MembershipTierFeature /></ProtectedRoute>} />
                    <Route path="/membership/referral" element={<ProtectedRoute><ReferralFeature /></ProtectedRoute>} />
                    {/* Add catch-all route */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </Suspense>
              </ErrorBoundary>
            </Layout>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
  </QueryClientProvider>
);

export default App;
