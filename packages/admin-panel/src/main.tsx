import React from 'react';
import ReactDOM from 'react-dom/client';
import { MantineProvider } from '@mantine/core';
// import { Notifications } from '@mantine/notifications'; // Commented out for deployment
import App from './App';
import '@mantine/core/styles.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MantineProvider>
      {/* <Notifications /> */}
      <App />
    </MantineProvider>
  </React.StrictMode>
);
