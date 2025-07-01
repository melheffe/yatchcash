import React, { useEffect, useState } from 'react';
import {
  Container,
  Title,
  SimpleGrid,
  Card,
  Text,
  Group,
  ThemeIcon,
  Progress,
  Stack,
  Badge,
  Table,
  ActionIcon,
  Loader,
  Alert
} from '@mantine/core';
import {
  IconUsers,
  IconShip,
  IconReceipt,
  IconCash,
  IconTrendingUp,
  IconAlertTriangle,
  IconEye
} from '@tabler/icons-react';
import { useAuth } from '../providers/AuthProvider';

interface DashboardStats {
  users: { total: number; active: number };
  yachts: { total: number };
  transactions: { total: number; pending: number; flagged: number };
}

interface RecentTransaction {
  id: string;
  amount: number;
  currencyCode: string;
  description: string;
  yacht: { name: string };
  createdAt: string;
  status: string;
}

export const Dashboard: React.FC = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch statistics
        const statsResponse = await fetch('/api/admin/stats', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!statsResponse.ok) {
          throw new Error('Failed to fetch dashboard statistics');
        }

        const statsData = await statsResponse.json();
        setStats(statsData.data);

        // Fetch recent transactions
        const transactionsResponse = await fetch('/api/transactions?limit=10&sortBy=createdAt&sortOrder=desc', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (transactionsResponse.ok) {
          const transactionsData = await transactionsResponse.json();
          setRecentTransactions(transactionsData.data);
        }

      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchDashboardData();
    }
  }, [token]);

  if (isLoading) {
    return (
      <Container size="xl" py="xl">
        <Group justify="center">
          <Loader size="lg" />
        </Group>
      </Container>
    );
  }

  if (error) {
    return (
      <Container size="xl" py="xl">
        <Alert color="red" title="Error loading dashboard">
          {error}
        </Alert>
      </Container>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'green';
      case 'pending': return 'yellow';
      case 'flagged': return 'red';
      default: return 'gray';
    }
  };

  return (
    <Container size="xl" py="xl">
      <Title order={1} mb="xl">Dashboard</Title>

      {/* Statistics Cards */}
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} mb="xl">
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Group justify="space-between" mb="xs">
            <Text fw={500}>Total Users</Text>
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
            <Text fw={500}>Active Yachts</Text>
            <ThemeIcon color="cyan" variant="light">
              <IconShip size="1.4rem" />
            </ThemeIcon>
          </Group>
          <Text size="xl" fw={700}>{stats?.yachts.total || 0}</Text>
          <Text size="sm" c="dimmed">
            Fleet overview
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
            <Text fw={500}>Flagged Items</Text>
            <ThemeIcon color="red" variant="light">
              <IconAlertTriangle size="1.4rem" />
            </ThemeIcon>
          </Group>
          <Text size="xl" fw={700}>{stats?.transactions.flagged || 0}</Text>
          <Text size="sm" c="dimmed">
            Requires attention
          </Text>
        </Card>
      </SimpleGrid>

      {/* Recent Transactions */}
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Group justify="space-between" mb="md">
          <Title order={3}>Recent Transactions</Title>
          <Badge variant="light">Latest 10</Badge>
        </Group>

        {recentTransactions.length > 0 ? (
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Amount</Table.Th>
                <Table.Th>Description</Table.Th>
                <Table.Th>Yacht</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Date</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {recentTransactions.map((transaction) => (
                <Table.Tr key={transaction.id}>
                  <Table.Td>
                    <Text fw={500}>
                      {transaction.amount} {transaction.currencyCode}
                    </Text>
                  </Table.Td>
                  <Table.Td>{transaction.description}</Table.Td>
                  <Table.Td>{transaction.yacht.name}</Table.Td>
                  <Table.Td>
                    <Badge color={getStatusColor(transaction.status)} variant="light">
                      {transaction.status}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    {new Date(transaction.createdAt).toLocaleDateString()}
                  </Table.Td>
                  <Table.Td>
                    <ActionIcon variant="light" color="blue">
                      <IconEye size="1rem" />
                    </ActionIcon>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        ) : (
          <Text c="dimmed" ta="center" py="xl">
            No recent transactions found
          </Text>
        )}
      </Card>
    </Container>
  );
}; 