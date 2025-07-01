import React, { useState } from 'react';
import {
  Paper,
  TextInput,
  PasswordInput,
  Button,
  Title,
  Text,
  Container,
  Alert,
  Group,
  Stack,
  Badge
} from '@mantine/core';
import { IconLogin, IconAlertCircle, IconShip } from '@tabler/icons-react';
import { useAuth } from '../providers/AuthProvider';
import { config } from '../config';

export const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, error } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      return;
    }

    try {
      setIsSubmitting(true);
      await login(email, password);
    } catch (err) {
      // Error handled by AuthProvider
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container size={420} my={40}>
      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <Stack gap="md">
          <Group justify="center" mb="md">
            <IconShip size={32} color="#228be6" />
            <Title order={2} ta="center">
              YachtCash
            </Title>
          </Group>

          {config.subdomain && (
            <Group justify="center">
              <Badge variant="light" color="blue" size="lg">
                {config.subdomain}.yachtcash.com
              </Badge>
            </Group>
          )}

          <Text c="dimmed" size="sm" ta="center">
            Sign in to your maritime cash management dashboard
          </Text>

          {error && (
            <Alert 
              icon={<IconAlertCircle size="1rem" />} 
              title="Login Error" 
              color="red"
            >
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Stack gap="md">
              <TextInput
                label="Email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isSubmitting}
              />

              <PasswordInput
                label="Password"
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isSubmitting}
              />

              <Button
                type="submit"
                fullWidth
                leftSection={<IconLogin size="1rem" />}
                loading={isSubmitting}
                disabled={!email || !password}
              >
                Sign In
              </Button>
            </Stack>
          </form>

          <Text c="dimmed" size="xs" ta="center" mt="md">
            🛥️ Secure maritime petty cash management
          </Text>
        </Stack>
      </Paper>
    </Container>
  );
}; 