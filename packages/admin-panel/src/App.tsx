import React from 'react';
import { Container, Title, Text, Card, Button } from '@mantine/core';

function App() {
  return (
    <Container size="md" py="xl">
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Title order={1} mb="md">🛥️ YachtCash</Title>
        <Text size="lg" mb="md">
          Maritime Petty Cash Management System
        </Text>
        <Text mb="xl">
          Successfully deployed to Heroku! 🎉
        </Text>
        
        <Title order={2} size="h3" mb="md">Features Ready:</Title>
        <Text mb="sm">✅ API Server (Fastify + Prisma)</Text>
        <Text mb="sm">✅ Database Schema (23 models)</Text>
        <Text mb="sm">✅ Authentication System</Text>
        <Text mb="sm">✅ Heroku Deployment</Text>
        <Text mb="lg">🚧 Admin Panel (Coming Soon)</Text>
        
        <Button>Get Started</Button>
      </Card>
    </Container>
  );
}

export default App; 