import React, { useState } from 'react';
import {
  AppShell,
  Text,
  Burger,
  useMantineTheme,
  Group,
  Menu,
  Avatar,
  UnstyledButton,
  rem,
  Badge,
  Stack,
  Divider,
} from '@mantine/core';
import { IconLogout, IconSettings, IconUser, IconChevronDown, IconShip } from '@tabler/icons-react';
import { useAuth } from '../../providers/AuthProvider';
import { Navigation } from './Navigation';

interface AppShellLayoutProps {
  children: React.ReactNode;
}

export const AppShellLayout: React.FC<AppShellLayoutProps> = ({ children }) => {
  const theme = useMantineTheme();
  const [opened, setOpened] = useState(false);
  const { user, tenant, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <AppShell
      header={{ height: 70 }}
      navbar={{
        width: 300,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      padding='md'
    >
      <AppShell.Header p='md'>
        <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
          <Burger
            opened={opened}
            onClick={() => setOpened(o => !o)}
            hiddenFrom='sm'
            size='sm'
            color={theme.colors.gray[6]}
            mr='xl'
          />

          <Group justify='space-between' style={{ flex: 1 }}>
            <Group>
              <IconShip size={28} color='#228be6' />
              <Stack gap={2}>
                <Text size='lg' fw={700} c='blue.7'>
                  {tenant?.name || 'YachtCash'}
                </Text>
                {tenant?.subdomain && (
                  <Text size='xs' c='dimmed'>
                    {tenant.subdomain}.yachtcash.com
                  </Text>
                )}
              </Stack>
            </Group>

            <Group gap={0}>
              <Menu shadow='md' width={200} position='bottom-end'>
                <Menu.Target>
                  <UnstyledButton
                    style={{
                      padding: rem(8),
                      borderRadius: theme.radius.sm,
                      transition: 'background-color 100ms ease',
                    }}
                    onMouseEnter={event => {
                      event.currentTarget.style.backgroundColor = theme.colors.gray[0];
                    }}
                    onMouseLeave={event => {
                      event.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <Group gap={7}>
                      <Avatar size={30} radius='xl' />
                      <Stack gap={0}>
                        <Text fw={500} size='sm' style={{ lineHeight: 1 }}>
                          {user?.profile?.firstName} {user?.profile?.lastName}
                        </Text>
                        <Text size='xs' c='dimmed' style={{ lineHeight: 1 }}>
                          {user?.assignedRoles?.join(', ') || 'User'}
                        </Text>
                      </Stack>
                      <IconChevronDown size={12} stroke={1.5} />
                    </Group>
                  </UnstyledButton>
                </Menu.Target>

                <Menu.Dropdown>
                  <Menu.Label>Account</Menu.Label>
                  <Menu.Item leftSection={<IconUser size={14} />}>Profile Settings</Menu.Item>
                  <Menu.Item leftSection={<IconSettings size={14} />}>Preferences</Menu.Item>

                  <Menu.Divider />

                  <Menu.Item
                    leftSection={<IconLogout size={14} />}
                    color='red'
                    onClick={handleLogout}
                  >
                    Logout
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </Group>
          </Group>
        </div>
      </AppShell.Header>

      <AppShell.Navbar p='md'>
        <Stack gap='sm'>
          <Navigation />
          <Divider />
          <Group justify='center'>
            <Badge variant='light' color='blue' size='sm'>
              {tenant?.subscriptionPlan?.toUpperCase() || 'BASIC'}
            </Badge>
          </Group>
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
};
