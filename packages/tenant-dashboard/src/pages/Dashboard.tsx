import React, { useEffect, useState } from 'react';
import {
  Container,
  Title,
  SimpleGrid,
  Card,
  Text,
  Group,
  ThemeIcon,
  Stack,
  Badge,
  Table,
  Loader,
  Alert,
  NumberFormatter
} from '@mantine/core';
import {
  IconUsers,
  IconShip,
  IconReceipt,
  IconCash,
  IconAlertTriangle,
  IconCurrencyDollar,
  IconCurrencyEuro
} from '@tabler/icons-react';
import { buildApiUrl, getApiHeaders } from '../config';
import { useAuth } from '../providers/AuthProvider';

interface TenantStats {
  users: { total: number; active: number };
  yachts: { total: number; active: number };
  transactions: { total: number; pending: number; flagged: number };
  cashBalances: { [currency: string]: number };
}

interface YachtData {
  id: string;
  name: string;
  imoNumber: string;
  owner: { profile: { firstName: string; lastName: string } };
  primaryCaptain?: { profile: { firstName: string; lastName: string } };
  cashBalances: {
    amount: number;
    currencyCode: { code: string; symbol: string };
  }[];
  _count: { transactions: number; yachtUsers: number };
  isActive: boolean;
}

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<TenantStats | null>(null);
  const [yachts, setYachts] = useState<YachtData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { tenant } = useAuth();

  useEffect(() => {
    fetchDashboardData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setError(null);
      
      // Fetch tenant statistics
      const statsResponse = await fetch(buildApiUrl('/stats'), {
        headers: getApiHeaders()
      });
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.data);
      }

      // Fetch tenant yachts
      const yachtsResponse = await fetch(buildApiUrl('/yachts'), {
        headers: getApiHeaders()
      });
      
      if (yachtsResponse.ok) {
        const yachtsData = await yachtsResponse.json();
        setYachts(yachtsData.data || []);
      }

    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrencyIcon = (currency: string) => {
    switch (currency.toUpperCase()) {
      case 'USD': return <IconCurrencyDollar size="1rem" />;
      case 'EUR': return <IconCurrencyEuro size="1rem" />;
      default: return <IconCash size="1rem" />;
    }
  };

  if (isLoading) {
    return (
      <Container size="xl" py="xl">
        <Group justify="center">
          <Loader size="lg" />
          <Text>Loading your maritime dashboard...</Text>
        </Group>
      </Container>
    );
  }

  if (error) {
    return (
      <Container size="xl" py="xl">
        <Alert color="red" title="Dashboard Error" icon={<IconAlertTriangle size="1rem" />}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container size="xl" py="xl">
      <Group justify="space-between" mb="xl">
        <div>
          <Title order={1}>🛥️ {tenant?.name} Dashboard</Title>
          <Text c="dimmed" size="sm">
            Maritime petty cash management system
          </Text>
        </div>
        <Badge variant="light" color="green" size="lg">
          Live Data
        </Badge>
      </Group>

      {/* Statistics Cards */}
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} mb="xl">
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Group justify="space-between" mb="xs">
            <Text fw={500}>Team Members</Text>
            <ThemeIcon color="blue" variant="light">
              <IconUsers size="1.4rem" />
            </ThemeIcon>
          </Group>
          <Text size="xl" fw={700}>{stats?.users.total || 0}</Text>
          <Text size="sm" c="dimmed">
            {stats?.users.active || 0} active users
          </Text>
        </Card>

        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Group justify="space-between" mb="xs">
            <Text fw={500}>Your Fleet</Text>
            <ThemeIcon color="cyan" variant="light">
              <IconShip size="1.4rem" />
            </ThemeIcon>
          </Group>
          <Text size="xl" fw={700}>{stats?.yachts.total || 0}</Text>
          <Text size="sm" c="dimmed">
            {stats?.yachts.active || 0} active yachts
          </Text>
        </Card>

        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Group justify="space-between" mb="xs">
            <Text fw={500}>Transactions</Text>
            <ThemeIcon color="green" variant="light">
              <IconReceipt size="1.4rem" />
            </ThemeIcon>
          </Group>
          <Text size="xl" fw={700}>{stats?.transactions.total || 0}</Text>
          <Text size="sm" c="dimmed">
            {stats?.transactions.pending || 0} pending
          </Text>
        </Card>

        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Group justify="space-between" mb="xs">
            <Text fw={500}>Cash on Hand</Text>
            <ThemeIcon color="yellow" variant="light">
              <IconCash size="1.4rem" />
            </ThemeIcon>
          </Group>
          <Stack gap="xs">
            {stats?.cashBalances && Object.entries(stats.cashBalances).map(([currency, amount]) => (
              <Group key={currency} gap="xs">
                {getCurrencyIcon(currency)}
                <NumberFormatter value={amount} thousandSeparator />
                <Text size="sm" c="dimmed">{currency}</Text>
              </Group>
            ))}
            {(!stats?.cashBalances || Object.keys(stats.cashBalances).length === 0) && (
              <Text size="sm" c="dimmed">No cash balances</Text>
            )}
          </Stack>
        </Card>
      </SimpleGrid>

      {/* Fleet Overview */}
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Group justify="space-between" mb="md">
          <Text size="lg" fw={600}>Fleet Overview</Text>
          <Badge variant="light">{yachts.length} yachts</Badge>
        </Group>

        {yachts.length > 0 ? (
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Yacht</Table.Th>
                <Table.Th>Owner</Table.Th>
                <Table.Th>Captain</Table.Th>
                <Table.Th>Cash Balances</Table.Th>
                <Table.Th>Transactions</Table.Th>
                <Table.Th>Crew</Table.Th>
                <Table.Th>Status</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {yachts.map((yacht) => (
                <Table.Tr key={yacht.id}>
                  <Table.Td>
                    <div>
                      <Text fw={500}>{yacht.name}</Text>
                      {yacht.imoNumber && (
                        <Text size="sm" c="dimmed">{yacht.imoNumber}</Text>
                      )}
                    </div>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">
                      {yacht.owner.profile.firstName} {yacht.owner.profile.lastName}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">
                      {yacht.primaryCaptain
                        ? `${yacht.primaryCaptain.profile.firstName} ${yacht.primaryCaptain.profile.lastName}`
                        : 'Not assigned'
                      }
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Stack gap="xs">
                      {yacht.cashBalances.map((balance, idx) => (
                        <Group key={idx} gap="xs">
                          <Text size="sm">
                            {balance.currencyCode.symbol}
                            <NumberFormatter value={balance.amount} thousandSeparator />
                          </Text>
                          <Text size="xs" c="dimmed">{balance.currencyCode.code}</Text>
                        </Group>
                      ))}
                      {yacht.cashBalances.length === 0 && (
                        <Text size="sm" c="dimmed">No balances</Text>
                      )}
                    </Stack>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{yacht._count.transactions}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{yacht._count.yachtUsers}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Badge
                      variant="light"
                      color={yacht.isActive ? 'green' : 'red'}
                      size="sm"
                    >
                      {yacht.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        ) : (
          <Text c="dimmed" ta="center" py="xl">
            No yachts found. Contact your administrator to add yachts to your fleet.
          </Text>
        )}
      </Card>
    </Container>
  );
}; 