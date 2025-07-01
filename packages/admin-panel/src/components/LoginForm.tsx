import React, { useState } from 'react';
import {
  Paper,
  TextInput,
  PasswordInput,
  Button,
  Title,
  Text,
  Container,
  Stack,
  Alert,
  Group,
  Anchor
} from '@mantine/core';
import { IconAlertCircle, IconShip } from '@tabler/icons-react';
import { useAuth } from '../providers/AuthProvider';

interface LoginFormProps {
  onSuccess?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const success = await login(email, password);
      if (success) {
        onSuccess?.();
      } else {
        setError('Invalid email or password');
      }
    } catch (err) {
      setError('An error occurred during login');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container size={420} my={40}>
      <Group justify="center" mb={40}>
        <IconShip size={40} color="#1971c2" />
        <Title order={1} c="blue.7">YachtCash</Title>
      </Group>

      <Title ta="center" order={2} mb={5}>
        Admin Panel
      </Title>
      <Text c="dimmed" size="sm" ta="center" mb={30}>
        Sign in to access the management dashboard
      </Text>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <form onSubmit={handleSubmit}>
          <Stack gap="md">
            {error && (
              <Alert icon={<IconAlertCircle size="1rem" />} color="red" variant="filled">
                {error}
              </Alert>
            )}

            <TextInput
              label="Email"
              placeholder="admin@yachtcash.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              size="md"
            />

            <PasswordInput
              label="Password"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              size="md"
            />

            <Group justify="space-between" mt="md">
              <Anchor component="button" type="button" c="dimmed" size="xs">
                Forgot password?
              </Anchor>
            </Group>

            <Button
              type="submit"
              loading={isSubmitting}
              size="md"
              fullWidth
              mt="xl"
            >
              Sign in
            </Button>
          </Stack>
        </form>
      </Paper>

      <Text c="dimmed" size="sm" ta="center" mt={30}>
        Need help? Contact your system administrator
      </Text>
    </Container>
  );
}; 