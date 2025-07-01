import React, { useState } from 'react';
import {
  AppShell,
  Navbar,
  Header,
  Text,
  MediaQuery,
  Burger,
  useMantineTheme,
  Group,
  ActionIcon,
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
      styles={{
        main: {
          background: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0],
        },
      }}
      navbar={
        <Navbar p='md' hiddenBreakpoint='sm' hidden={!opened} width={{ sm: 200, lg: 300 }}>
          <Navigation />
        </Navbar>
      }
      header={
        <Header height={{ base: 50, md: 70 }} p='md'>
          <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
            <MediaQuery largerThan='sm' styles={{ display: 'none' }}>
              <Burger
                opened={opened}
                onClick={() => setOpened(o => !o)}
                size='sm'
                color={theme.colors.gray[6]}
                mr='xl'
              />
            </MediaQuery>

            <Group justify='space-between' style={{ flex: 1 }}>
              <Group>
                <Text size='lg' weight={700} color='blue.7'>
                  YachtCash Admin
                </Text>
              </Group>

              <Group spacing={0}>
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
                      <Group spacing={7}>
                        <Avatar size={26} radius='xl' />
                        <Text weight={500} size='sm' sx={{ lineHeight: 1 }}>
                          {user?.profile?.firstName} {user?.profile?.lastName}
                        </Text>
                        <IconChevronDown size={12} stroke={1.5} />
                      </Group>
                    </UnstyledButton>
                  </Menu.Target>

                  <Menu.Dropdown>
                    <Menu.Label>Account</Menu.Label>
                    <Menu.Item icon={<IconUser size={14} />}>Profile Settings</Menu.Item>
                    <Menu.Item icon={<IconSettings size={14} />}>Preferences</Menu.Item>

                    <Menu.Divider />

                    <Menu.Item icon={<IconLogout size={14} />} color='red' onClick={handleLogout}>
                      Logout
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              </Group>
            </Group>
          </div>
        </Header>
      }
    >
      {children}
    </AppShell>
  );
};
