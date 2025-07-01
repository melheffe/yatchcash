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
} from '@mantine/core';
import { IconLogout, IconSettings, IconUser, IconChevronDown } from '@tabler/icons-react';
import { useAuth } from '../../providers/AuthProvider';
import { Navigation } from './Navigation';

interface AppShellLayoutProps {
  children: React.ReactNode;
}

export const AppShellLayout: React.FC<AppShellLayoutProps> = ({ children }) => {
  const theme = useMantineTheme();
  const [opened, setOpened] = useState(false);
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <AppShell
      navbar={{
        width: { sm: 200, lg: 300 },
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      header={{ height: { base: 50, md: 70 } }}
      padding='md'
    >
      <AppShell.Header>
        <div style={{ display: 'flex', alignItems: 'center', height: '100%', padding: '0 1rem' }}>
          <Burger opened={opened} onClick={() => setOpened(o => !o)} hiddenFrom='sm' size='sm' />

          <Group justify='space-between' style={{ flex: 1 }}>
            <Group>
              <Text size='lg' fw={700} c='blue.7'>
                YachtCash Admin
              </Text>
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
                      <Avatar size={26} radius='xl' />
                      <Text fw={500} size='sm' style={{ lineHeight: 1 }}>
                        {user?.email}
                      </Text>
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
        <Navigation />
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
};
