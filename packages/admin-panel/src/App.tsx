import React, { useState } from 'react';
import { MantineProvider, Container, AppShell, Group, Title, Tabs, Text } from '@mantine/core';
import { IconShip, IconUsers, IconDashboard, IconDatabase } from '@tabler/icons-react';
import { Dashboard } from './pages/Dashboard';

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
          <Container size="xl" py="xl">
            <Title order={1} mb="xl">🛥️ Yacht Fleet Management</Title>
            <Text size="lg" c="dimmed">Coming soon - comprehensive yacht management interface</Text>
          </Container>
        );
      case 'users':
        return (
          <Container size="xl" py="xl">
            <Title order={1} mb="xl">👥 User Management</Title>
            <Text size="lg" c="dimmed">Coming soon - user roles and permissions</Text>
          </Container>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <MantineProvider>
      <AppShell
        header={{ height: 70 }}
        padding="md"
      >
        <AppShell.Header>
          <Container size="xl">
            <Group h={70} px="md">
              <Group>
                <IconShip size={32} color="#228be6" />
                <Title order={2}>YachtCash Admin</Title>
              </Group>
              
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                ml="auto"
              >
                <Tabs.List>
                  <Tabs.Tab value="dashboard" leftSection={<IconDashboard size="0.8rem" />}>
                    Dashboard
                  </Tabs.Tab>
                  <Tabs.Tab value="yachts" leftSection={<IconShip size="0.8rem" />}>
                    Yachts
                  </Tabs.Tab>
                  <Tabs.Tab value="users" leftSection={<IconUsers size="0.8rem" />}>
                    Users
                  </Tabs.Tab>
                </Tabs.List>
              </Tabs>
            </Group>
          </Container>
        </AppShell.Header>

        <AppShell.Main>
          {renderContent()}
        </AppShell.Main>
      </AppShell>
    </MantineProvider>
  );
}

export default App; 