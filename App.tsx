import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { Layout } from "./src/components/layout/Layout";
import { AuthProvider } from "./src/components/AuthProvider";
import React, { Suspense } from "react";

import { VoiceMode } from "./src/types/voice";

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
const DirectChatFeature = React.lazy(() => import('./components/DirectChatFeature').then(m => ({ default: m.DirectChatFeature })));
const SocialChatFeature = React.lazy(() => import('./components/SocialChatFeature').then(m => ({ default: m.SocialChatFeature })));
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
              <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
                <Routes>
                  <Route path="/" element={<DashboardRoute />} />
                  <Route path="/builder" element={<WebBuilderRoute />} />
                  <Route path="/compose" element={<ComposeFeature />} />
                  <Route path="/design" element={<DesignFeature initialType="interior" />} />
                  <Route path="/fashion" element={<FashionFeature />} />
                  <Route path="/automation" element={<ContentAutomationFeature />} />
                  <Route path="/voice" element={<VoiceRoute />} />
                  <Route path="/apps" element={<AppMarketplaceFeature />} />
                  <Route path="/explore" element={<ExploreFeature />} />
                  <Route path="/search" element={<SearchFeature />} />
                  <Route path="/jobs" element={<JobsFeature />} />
                  <Route path="/giao-viec-lam" element={<JobsFeature />} />
                  <Route path="/experts" element={<ExpertsFeature />} />
                  <Route path="/chuyen-gia" element={<ExpertsFeature />} />
                  <Route path="/chat" element={<SocialChatFeature />} />
                  <Route path="/check" element={<CheckFeature />} />
                  <Route path="/settings" element={<SettingsFeature />} />
                  <Route path="/profile" element={<ProfileFeature />} />
                  <Route path="/profile/payment" element={<PaymentFeature />} />
                  <Route path="/profile/wallet-history" element={<WalletHistoryFeature />} />
                  <Route path="/profile/upgrade" element={<UpgradeFeature />} />
                  <Route path="/profile/expert-update" element={<ExpertUpdateFeature />} />
                  <Route path="/projects" element={<ProjectsFeature />} />
                  <Route path="/jobs/my-jobs" element={<MyJobsFeature />} />
                  <Route path="/history" element={<HistoryFeature />} />
                  <Route path="/membership/packages" element={<MembershipFeature />} />
                  <Route path="/membership/promos" element={<PromotionsFeature />} />
                  <Route path="/membership/tier" element={<MembershipTierFeature />} />
                  <Route path="/membership/referral" element={<ReferralFeature />} />
                  {/* Add catch-all route */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
            </Layout>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
  </QueryClientProvider>
);

export default App;
