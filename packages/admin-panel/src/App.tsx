import { useState } from 'react';
import {
  MantineProvider,
  Container,
  AppShell,
  Group,
  Title,
  Tabs,
  Text,
  Box,
  createTheme,
} from '@mantine/core';
import { IconShip, IconUsers, IconDashboard } from '@tabler/icons-react';
import { Dashboard } from './pages/Dashboard';

// Custom maritime theme with beautiful gradients and modern styling
const theme = createTheme({
  colors: {
    ocean: [
      '#e6f7ff',
      '#bae7ff',
      '#7cc7ff',
      '#47a3ff',
      '#1890ff',
      '#0050b3',
      '#003a8c',
      '#002766',
      '#001d3d',
      '#001529',
    ],
    maritime: [
      '#f0f9ff',
      '#e0f2fe',
      '#bae6fd',
      '#7dd3fc',
      '#38bdf8',
      '#0ea5e9',
      '#0284c7',
      '#0369a1',
      '#075985',
      '#0c4a6e',
    ],
  },
  primaryColor: 'maritime',
  defaultRadius: 'lg',
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  headings: {
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontWeight: '600',
  },
});

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleTabChange = (value: string | null) => {
    if (value) {
      setActiveTab(value);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'yachts':
        return (
          <Container size='xl' py='xl'>
            <Box
              style={{
                background:
                  'linear-gradient(135deg, rgba(56, 189, 248, 0.1) 0%, rgba(14, 165, 233, 0.05) 100%)',
                borderRadius: '24px',
                padding: '48px',
                border: '1px solid rgba(56, 189, 248, 0.2)',
                backdropFilter: 'blur(20px)',
              }}
            >
              <Title
                order={1}
                mb='xl'
                style={{
                  background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontSize: '2.5rem',
                  fontWeight: 700,
                }}
              >
                🛥️ Fleet Management
              </Title>
              <Text size='lg' c='dimmed' fw={400}>
                Advanced yacht fleet management interface coming soon. Comprehensive vessel
                tracking, crew management, and operational analytics.
              </Text>
            </Box>
          </Container>
        );
      case 'users':
        return (
          <Container size='xl' py='xl'>
            <Box
              style={{
                background:
                  'linear-gradient(135deg, rgba(56, 189, 248, 0.1) 0%, rgba(14, 165, 233, 0.05) 100%)',
                borderRadius: '24px',
                padding: '48px',
                border: '1px solid rgba(56, 189, 248, 0.2)',
                backdropFilter: 'blur(20px)',
              }}
            >
              <Title
                order={1}
                mb='xl'
                style={{
                  background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontSize: '2.5rem',
                  fontWeight: 700,
                }}
              >
                👥 User Management
              </Title>
              <Text size='lg' c='dimmed' fw={400}>
                Comprehensive user management with role-based access control, crew certifications,
                and maritime compliance tracking.
              </Text>
            </Box>
          </Container>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <MantineProvider theme={theme}>
      <Box
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #bae6fd 100%)',
          position: 'relative',
        }}
      >
        {/* Beautiful ocean wave background pattern */}
        <Box
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `
              radial-gradient(circle at 20% 50%, rgba(56, 189, 248, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(14, 165, 233, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 40% 80%, rgba(3, 105, 161, 0.1) 0%, transparent 50%)
            `,
            zIndex: 0,
          }}
        />

        <AppShell header={{ height: 90 }} padding='md' style={{ position: 'relative', zIndex: 1 }}>
          <AppShell.Header
            style={{
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(20px)',
              borderBottom: '1px solid rgba(56, 189, 248, 0.2)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            }}
          >
            <Container size='xl'>
              <Group h={90} px='md' justify='space-between'>
                <Group>
                  <Box
                    style={{
                      background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
                      borderRadius: '16px',
                      padding: '12px',
                      boxShadow: '0 8px 32px rgba(14, 165, 233, 0.3)',
                    }}
                  >
                    <IconShip size={32} color='white' />
                  </Box>
                  <Box>
                    <Title
                      order={1}
                      style={{
                        background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        fontSize: '1.8rem',
                        fontWeight: 700,
                        letterSpacing: '-0.025em',
                      }}
                    >
                      YachtCash
                    </Title>
                    <Text size='sm' c='dimmed' fw={500}>
                      Maritime Management System
                    </Text>
                  </Box>
                </Group>

                <Tabs
                  value={activeTab}
                  onChange={handleTabChange}
                  style={{
                    background: 'rgba(255, 255, 255, 0.7)',
                    borderRadius: '16px',
                    padding: '4px',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(56, 189, 248, 0.2)',
                  }}
                >
                  <Tabs.List
                    style={{
                      background: 'transparent',
                      border: 'none',
                      gap: '4px',
                    }}
                  >
                    <Tabs.Tab
                      value='dashboard'
                      leftSection={<IconDashboard size={18} />}
                      style={{
                        borderRadius: '12px',
                        padding: '12px 20px',
                        fontWeight: 600,
                        transition: 'all 0.2s ease',
                        border: 'none',
                      }}
                    >
                      Dashboard
                    </Tabs.Tab>
                    <Tabs.Tab
                      value='yachts'
                      leftSection={<IconShip size={18} />}
                      style={{
                        borderRadius: '12px',
                        padding: '12px 20px',
                        fontWeight: 600,
                        transition: 'all 0.2s ease',
                        border: 'none',
                      }}
                    >
                      Fleet
                    </Tabs.Tab>
                    <Tabs.Tab
                      value='users'
                      leftSection={<IconUsers size={18} />}
                      style={{
                        borderRadius: '12px',
                        padding: '12px 20px',
                        fontWeight: 600,
                        transition: 'all 0.2s ease',
                        border: 'none',
                      }}
                    >
                      Crew
                    </Tabs.Tab>
                  </Tabs.List>
                </Tabs>
              </Group>
            </Container>
          </AppShell.Header>

          <AppShell.Main
            style={{
              background: 'transparent',
            }}
          >
            {renderContent()}
          </AppShell.Main>
        </AppShell>
      </Box>
    </MantineProvider>
  );
}

export default App;
