import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from './components/ProtectedRoute';
import AppSidebar from './components/AppSidebar';
import MotionProvider from './components/motion/MotionProvider';

// Public pages
import Home from '@/pages/Home';
import Marketplace from '@/pages/Marketplace';
import CreatorDetail from '@/pages/CreatorDetail';
import Pricing from '@/pages/Pricing';
import HowItWorks from '@/pages/HowItWorks';
import ForCreators from '@/pages/ForCreators';
import ForAgencies from '@/pages/ForAgencies';
import ForCompanies from '@/pages/ForCompanies';

// Auth pages
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';

// Company app pages
import CompanyDashboard from '@/pages/company/Dashboard';
import Campaigns from '@/pages/company/Campaigns';
import CampaignDetail from '@/pages/company/CampaignDetail';
import NewCampaign from '@/pages/company/NewCampaign';
import CompanyMarketplace from '@/pages/company/CompanyMarketplace';
import SavedCreators from '@/pages/company/SavedCreators';
import Analytics from '@/pages/company/Analytics';
import Payments from '@/pages/company/Payments';
import Settings from '@/pages/company/Settings';

// Creator app pages
import CreatorDashboard from '@/pages/creator/CreatorDashboard';
import Opportunities from '@/pages/creator/Opportunities';
import MyCampaigns from '@/pages/creator/MyCampaigns';
import Earnings from '@/pages/creator/Earnings';
import CreatorProfileEdit from '@/pages/creator/CreatorProfileEdit';
import DashboardRouter from '@/pages/DashboardRouter';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div
          className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary"
          role="status"
          aria-label="Loading"
        />
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Home />} />
      <Route path="/marketplace" element={<Marketplace />} />
      <Route path="/creators/:id" element={<CreatorDetail />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/how-it-works" element={<HowItWorks />} />
      <Route path="/for-creators" element={<ForCreators />} />
      <Route path="/for-agencies" element={<ForAgencies />} />
      <Route path="/for-companies" element={<ForCompanies />} />

      {/* Auth routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Authenticated app routes */}
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route element={<AppSidebar />}>
          <Route path="/app" element={<DashboardRouter />} />
          <Route path="/app/marketplace" element={<CompanyMarketplace />} />
          <Route path="/app/campaigns" element={<Campaigns />} />
          <Route path="/app/campaigns/new" element={<NewCampaign />} />
          <Route path="/app/campaigns/:id" element={<CampaignDetail />} />
          <Route path="/app/saved" element={<SavedCreators />} />
          <Route path="/app/analytics" element={<Analytics />} />
          <Route path="/app/payments" element={<Payments />} />
          <Route path="/app/settings" element={<Settings />} />
          {/* Creator routes */}
          <Route path="/app/opportunities" element={<Opportunities />} />
          <Route path="/app/my-campaigns" element={<MyCampaigns />} />
          <Route path="/app/earnings" element={<Earnings />} />
          <Route path="/app/profile" element={<CreatorProfileEdit />} />
        </Route>
      </Route>

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <MotionProvider>
      <AuthProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <ScrollToTop />
            <AuthenticatedApp />
          </Router>
          <Toaster />
        </QueryClientProvider>
      </AuthProvider>
    </MotionProvider>
  )
}

export default App
