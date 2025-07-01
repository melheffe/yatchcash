import React from 'react';
import { Text, Group, ThemeIcon, UnstyledButton, Stack, Badge } from '@mantine/core';
import {
  IconDashboard,
  IconShip,
  IconUsers,
  IconReceipt,
  IconCash,
  IconReport,
  IconSettings,
  IconAlertTriangle,
} from '@tabler/icons-react';

interface NavLinkProps {
  icon: React.ReactNode;
  label: string;
  badge?: string;
  active?: boolean;
  onClick?: () => void;
}

const NavLink: React.FC<NavLinkProps> = ({ icon, label, badge, active, onClick }) => {
  return (
    <UnstyledButton
      onClick={onClick}
      p='xs'
      style={{
        display: 'block',
        width: '100%',
        borderRadius: '8px',
        backgroundColor: active ? '#e7f5ff' : 'transparent',
        color: active ? '#1971c2' : '#495057',
      }}
    >
      <Group>
        <ThemeIcon color={active ? 'blue' : 'gray'} variant='light'>
          {icon}
        </ThemeIcon>
        <Text size='sm' fw={active ? 600 : 500}>
          {label}
        </Text>
        {badge && (
          <Badge size='xs' variant='filled' color='red'>
            {badge}
          </Badge>
        )}
      </Group>
    </UnstyledButton>
  );
};

export const Navigation: React.FC = () => {
  const [activeLink, setActiveLink] = React.useState('dashboard');

  const navItems = [
    {
      id: 'dashboard',
      icon: <IconDashboard size='1rem' />,
      label: 'Dashboard',
    },
    {
      id: 'yachts',
      icon: <IconShip size='1rem' />,
      label: 'Fleet Management',
    },
    {
      id: 'users',
      icon: <IconUsers size='1rem' />,
      label: 'Crew & Users',
    },
    {
      id: 'transactions',
      icon: <IconReceipt size='1rem' />,
      label: 'Transactions',
    },
    {
      id: 'cash',
      icon: <IconCash size='1rem' />,
      label: 'Cash Balances',
    },
    {
      id: 'reports',
      icon: <IconReport size='1rem' />,
      label: 'Reports',
    },
    {
      id: 'alerts',
      icon: <IconAlertTriangle size='1rem' />,
      label: 'Alerts',
      badge: '3', // Could be dynamic
    },
    {
      id: 'settings',
      icon: <IconSettings size='1rem' />,
      label: 'Settings',
    },
  ];

  return (
    <Stack gap='xs'>
      <Text fw={500} size='sm' c='dimmed' px='md' mb='xs'>
        Navigation
      </Text>

      {navItems.map(item => (
        <NavLink
          key={item.id}
          icon={item.icon}
          label={item.label}
          badge={item.badge}
          active={activeLink === item.id}
          onClick={() => setActiveLink(item.id)}
        />
      ))}
    </Stack>
  );
};
