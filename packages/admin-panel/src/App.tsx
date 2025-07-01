import React from 'react';
import { MantineProvider } from '@mantine/core';
import { AuthProvider, useAuth } from './providers/AuthProvider';
import { AppShellLayout } from './components/Layout/AppShell';
import { LoginForm } from './components/LoginForm';
import { Dashboard } from './pages/Dashboard';
import '@mantine/core/styles.css';

const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        Loading...
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  return (
    <AppShellLayout>
      <Dashboard />
    </AppShellLayout>
  );
};

const App: React.FC = () => {
  return (
    <MantineProvider defaultColorScheme="light">
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </MantineProvider>
  );
};

export default App; 