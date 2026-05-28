import { Toaster } from "./toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from './query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './PageNotFound';
import { AuthProvider, useAuth } from './AuthContext';
import { LanguageProvider } from './LanguageContext';
import UserNotRegisteredError from './UserNotRegisteredError';
import AppLayout from './AppLayout';
import Home from './Home';
import SignIn from './SignIn';
import Dashboard from './Dashboard';
import NearbyDonations from './NearbyDonations';
import Profile from './Profile';
import DeliveryHandoff from './DeliveryHandoff';
import Leaderboard from './Leaderboard';
import DonationDetail from './DonationDetail';
import Fundraising from './Fundraising';
import Analytics from './Analytics';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-orange-500 rounded-full animate-spin"></div>
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
      <Route element={<AppLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/nearby" element={<NearbyDonations />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/delivery/:id" element={<DeliveryHandoff />} />
        <Route path="/donation/:id" element={<DonationDetail />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/fundraising" element={<Fundraising />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="*" element={<PageNotFound />} />
      </Route>
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <AuthenticatedApp />
          </Router>
          <Toaster />
        </QueryClientProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;
