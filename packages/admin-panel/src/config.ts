export const API_BASE_URL = 'https://yatchcash-b0f8671844cc.herokuapp.com/api';

export const config = {
  apiUrl: API_BASE_URL,
  environment: 'development',
  enableAuth: false, // Temporarily disabled for demo
  refreshInterval: 30000, // 30 seconds
  pagination: {
    defaultPageSize: 10,
    maxPageSize: 100
  }
};

export default config; 