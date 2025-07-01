import React, { useEffect, useState } from 'react';
import {
  Container,
  Title,
  Grid,
  Card,
  Text,
  Group,
  ThemeIcon,
  Stack,
  Badge,
  Table,
  Loader,
  Alert,
  NumberFormatter,
} from '@mantine/core';
import {
  IconShip,
  IconUsers,
  IconReceipt,
  IconCash,
  IconCurrencyDollar,
  IconCurrencyEuro,
} from '@tabler/icons-react';
import { config } from '../config';

interface DashboardStats {
  users: { total: number; active: number };
  yachts: { total: number; active: number };
  transactions: { total: number; pending: number; flagged: number };
  cashBalances: { [currency: string]: number };
}

interface YachtData {
  id: string;
  name: string;
  imoNumber: string;
  owner: string;
  captain: string;
  cashBalances: {
    amount: number;
    currency: string;
    symbol: string;
    threshold: number;
    isLowBalance: boolean;
  }[];
  totalTransactions: number;
  crewMembers: number;
  isActive: boolean;
}

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [yachts, setYachts] = useState<YachtData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch statistics
        const statsResponse = await fetch(`${config.apiUrl}/admin/stats`);
        if (!statsResponse.ok) {
          throw new Error('Failed to fetch dashboard statistics');
        }
        const statsData = await statsResponse.json();
        setStats(statsData.data);

        // Fetch yachts data
        const yachtsResponse = await fetch(`${config.apiUrl}/admin/yachts`);
        if (yachtsResponse.ok) {
          const yachtsData = await yachtsResponse.json();
          setYachts(yachtsData.data);
        }
      } catch (err) {
        console.error('Dashboard fetch error:', err);
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();

    // Set up auto-refresh
    const interval = setInterval(fetchDashboardData, config.refreshInterval);
    return () => clearInterval(interval);
  }, []);

  const getCurrencyIcon = (currency: string) => {
    switch (currency.toUpperCase()) {
      case 'USD':
        return <IconCurrencyDollar size='1rem' />;
      case 'EUR':
        return <IconCurrencyEuro size='1rem' />;
      default:
        return <IconCash size='1rem' />;
    }
  };

  if (isLoading) {
    return (
      <Container size='xl' py='xl'>
        <Group justify='center'>
          <Loader size='lg' />
          <Text>Loading YachtCash dashboard...</Text>
        </Group>
      </Container>
    );
  }

  if (error) {
    return (
      <Container size='xl' py='xl'>
        <Alert color='red' title='Dashboard Error'>
          {error}
          <Text size='sm' mt='xs'>
            API: {config.apiUrl}
          </Text>
        </Alert>
      </Container>
    );
  }

  return (
    <Container size='xl' py='xl'>
      <Group justify='space-between' mb='xl'>
        <Title order={1}>🛥️ Maritime Dashboard</Title>
        <Badge variant='light' color='green' size='lg'>
          Live Data
        </Badge>
      </Group>

      {/* Statistics Cards */}
      <Grid mb='xl'>
        <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
          <Card shadow='sm' padding='lg' radius='md' withBorder>
            <Group justify='space-between' mb='xs'>
              <Text fw={500}>Total Users</Text>
              <ThemeIcon color='blue' variant='light'>
                <IconUsers size='1.4rem' />
              </ThemeIcon>
            </Group>
            <Text size='xl' fw={700}>
              {stats?.users.total || 0}
            </Text>
            <Text size='sm' c='dimmed'>
              {stats?.users.active || 0} active users
            </Text>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
          <Card shadow='sm' padding='lg' radius='md' withBorder>
            <Group justify='space-between' mb='xs'>
              <Text fw={500}>Fleet Size</Text>
              <ThemeIcon color='cyan' variant='light'>
                <IconShip size='1.4rem' />
              </ThemeIcon>
            </Group>
            <Text size='xl' fw={700}>
              {stats?.yachts.total || 0}
            </Text>
            <Text size='sm' c='dimmed'>
              {stats?.yachts.active || 0} active yachts
            </Text>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
          <Card shadow='sm' padding='lg' radius='md' withBorder>
            <Group justify='space-between' mb='xs'>
              <Text fw={500}>Transactions</Text>
              <ThemeIcon color='green' variant='light'>
                <IconReceipt size='1.4rem' />
              </ThemeIcon>
            </Group>
            <Text size='xl' fw={700}>
              {stats?.transactions.total || 0}
            </Text>
            <Text size='sm' c='dimmed'>
              {stats?.transactions.pending || 0} pending
            </Text>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
          <Card shadow='sm' padding='lg' radius='md' withBorder>
            <Group justify='space-between' mb='xs'>
              <Text fw={500}>Cash on Hand</Text>
              <ThemeIcon color='yellow' variant='light'>
                <IconCash size='1.4rem' />
              </ThemeIcon>
            </Group>
            <Stack gap='xs'>
              {stats?.cashBalances &&
                Object.entries(stats.cashBalances).map(([currency, amount]) => (
                  <Group key={currency} gap='xs'>
                    {getCurrencyIcon(currency)}
                    <NumberFormatter value={amount} thousandSeparator />
                    <Text size='sm' c='dimmed'>
                      {currency}
                    </Text>
                  </Group>
                ))}
            </Stack>
          </Card>
        </Grid.Col>
      </Grid>

      {/* Fleet Overview */}
      <Card shadow='sm' padding='lg' radius='md' withBorder>
        <Group justify='space-between' mb='md'>
          <Title order={3}>🛥️ Fleet Overview</Title>
          <Badge variant='light'>
            {yachts.length} Yacht{yachts.length !== 1 ? 's' : ''}
          </Badge>
        </Group>

        {yachts.length > 0 ? (
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Yacht</Table.Th>
                <Table.Th>Owner</Table.Th>
                <Table.Th>Captain</Table.Th>
                <Table.Th>Cash Balances</Table.Th>
                <Table.Th>Status</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {yachts.map(yacht => (
                <Table.Tr key={yacht.id}>
                  <Table.Td>
                    <Stack gap='xs'>
                      <Text fw={500}>{yacht.name}</Text>
                      <Text size='sm' c='dimmed'>
                        {yacht.imoNumber}
                      </Text>
                    </Stack>
                  </Table.Td>
                  <Table.Td>
                    <Text>{yacht.owner}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text>{yacht.captain}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Stack gap='xs'>
                      {yacht.cashBalances.map((balance, idx) => (
                        <Group key={idx} gap='xs'>
                          <Badge
                            color={balance.isLowBalance ? 'red' : 'green'}
                            variant='light'
                            size='sm'
                          >
                            <NumberFormatter
                              value={balance.amount}
                              prefix={balance.symbol}
                              thousandSeparator
                            />
                          </Badge>
                          <Text size='xs' c='dimmed'>
                            {balance.currency}
                          </Text>
                        </Group>
                      ))}
                    </Stack>
                  </Table.Td>
                  <Table.Td>
                    <Badge color={yacht.isActive ? 'green' : 'gray'} variant='light'>
                      {yacht.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        ) : (
          <Text c='dimmed' ta='center' py='xl'>
            No yachts found. Use the seed endpoint to add demo data.
          </Text>
        )}
      </Card>
    </Container>
  );
};
