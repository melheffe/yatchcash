import { Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from '@mantine/core';
import { useAuth } from './hooks/useAuth';
import { MobileNavigation } from './components/MobileNavigation';
import { OfflineIndicator } from './components/OfflineIndicator';

// Import pages
import { LoginPage } from './pages/auth/LoginPage';
import { Dashboard } from './pages/Dashboard';
import { TransactionCreate } from './pages/transactions/TransactionCreate';
import { TransactionList } from './pages/transactions/TransactionList';
import { TransactionDetail } from './pages/transactions/TransactionDetail';
import { CashBalance } from './pages/CashBalance';
import { Recipients } from './pages/Recipients';
import { Settings } from './pages/Settings';
import { LoadingScreen } from './components/LoadingScreen';

function App() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <AppShell
      navbar={{ width: 0, breakpoint: 'xs' }}
      footer={{ height: 60 }}
      padding={0}
    >
      <AppShell.Main>
        <div className="min-h-screen pb-16">
          <OfflineIndicator />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/transactions" element={<TransactionList />} />
            <Route path="/transactions/new" element={<TransactionCreate />} />
            <Route path="/transactions/:id" element={<TransactionDetail />} />
            <Route path="/cash" element={<CashBalance />} />
            <Route path="/recipients" element={<Recipients />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </AppShell.Main>

      <AppShell.Footer>
        <MobileNavigation />
      </AppShell.Footer>
    </AppShell>
  );
}

export default App; 