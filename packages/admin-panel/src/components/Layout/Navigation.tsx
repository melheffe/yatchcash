import React from 'react';
import { 
  NavLink, 
  Stack, 
  Text, 
  Group, 
  rem,
  ThemeIcon 
} from '@mantine/core';
import {
  IconDashboard,
  IconUsers,
  IconShip,
  IconReceipt,
  IconCash,
  IconSettings,
  IconFlag,
  IconChartBar,
  IconShield
} from '@tabler/icons-react';
import { useAuth } from '../../providers/AuthProvider';

interface NavigationItemProps {
  icon: React.ComponentType<any>;
  label: string;
  href: string;
  permission?: string;
  badge?: string;
}

const NavigationItem: React.FC<NavigationItemProps> = ({ 
  icon: Icon, 
  label, 
  href, 
  permission,
  badge 
}) => {
  const { hasPermission } = useAuth();
  
  // Check permissions if specified
  if (permission && !hasPermission(permission)) {
    return null;
  }

  return (
    <NavLink
      href={href}
      label={label}
      leftSection={
        <ThemeIcon variant="light" size={30}>
          <Icon size={rem(18)} />
        </ThemeIcon>
      }
      rightSection={
        badge && (
          <Text size="xs" c="dimmed">
            {badge}
          </Text>
        )
      }
    />
  );
};

export const Navigation: React.FC = () => {
  return (
    <Stack gap="xs">
      <Group mb="md">
        <Text fw={500} size="sm" c="dimmed">
          MAIN MENU
        </Text>
      </Group>

      <NavigationItem
        icon={IconDashboard}
        label="Dashboard"
        href="/dashboard"
      />

      <NavigationItem
        icon={IconUsers}
        label="Users"
        href="/users"
        permission="users.view"
      />

      <NavigationItem
        icon={IconShip}
        label="Yachts"
        href="/yachts"
        permission="yachts.view"
      />

      <NavigationItem
        icon={IconReceipt}
        label="Transactions"
        href="/transactions"
        permission="transactions.view"
      />

      <NavigationItem
        icon={IconCash}
        label="Cash Management"
        href="/cash"
        permission="cash.view"
      />

      <NavigationItem
        icon={IconFlag}
        label="Flagged Items"
        href="/flagged"
        permission="transactions.flag"
        badge="3"
      />

      <Group mt="lg" mb="md">
        <Text fw={500} size="sm" c="dimmed">
          ANALYTICS
        </Text>
      </Group>

      <NavigationItem
        icon={IconChartBar}
        label="Reports"
        href="/reports"
        permission="reports.view"
      />

      <Group mt="lg" mb="md">
        <Text fw={500} size="sm" c="dimmed">
          ADMINISTRATION
        </Text>
      </Group>

      <NavigationItem
        icon={IconShield}
        label="Roles & Permissions"
        href="/admin/roles"
        permission="roles.view"
      />

      <NavigationItem
        icon={IconSettings}
        label="System Settings"
        href="/admin/settings"
        permission="system.configure"
      />
    </Stack>
  );
}; 