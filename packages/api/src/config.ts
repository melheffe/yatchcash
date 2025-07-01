import dotenv from 'dotenv';
import path from 'path';

// Load environment from root .env file
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

export const config = {
  // Server - Heroku sets PORT automatically
  PORT: parseInt(process.env.PORT || process.env.API_PORT || '3001'),
  HOST: process.env.API_HOST || 'localhost',
  NODE_ENV: process.env.NODE_ENV || 'development',
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',

  // Database
  DATABASE_URL: process.env.DATABASE_URL || '',

  // Authentication
  JWT_SECRET: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',

  // File Upload
  UPLOAD_DIR: path.resolve(process.env.UPLOAD_DIR || './uploads'),
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB

  // CORS - Allow all frontend ports and production URL
  CORS_ORIGINS:
    process.env.NODE_ENV === 'production'
      ? [process.env.FRONTEND_URL || 'https://your-app.herokuapp.com']
      : [
          `http://localhost:${process.env.ADMIN_PANEL_PORT || '3000'}`,
          `http://localhost:${process.env.CAPTAIN_PWA_PORT || '3002'}`,
          'http://localhost:5173', // Vite default
        ],

  // Email (optional)
  SMTP_HOST: process.env.SMTP_HOST || '',
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '587'),
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',

  // External APIs
  EXCHANGE_RATE_API_KEY: process.env.EXCHANGE_RATE_API_KEY || '',

  // Security
  BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS || '12'),

  // Rate limiting
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX || '100'),
  RATE_LIMIT_WINDOW: process.env.RATE_LIMIT_WINDOW || '15 minutes',
} as const;

// Validation
if (!config.DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is required');
  console.log('💡 Please check your .env file in the project root');
  if (config.NODE_ENV === 'production') {
    console.log('💡 On Heroku, make sure PostgreSQL addon is added');
  }
  process.exit(1);
}

if (!config.JWT_SECRET || config.JWT_SECRET === 'your-super-secret-jwt-key') {
  if (config.NODE_ENV === 'production') {
    console.error('❌ JWT_SECRET must be set in production!');
    process.exit(1);
  } else {
    console.warn('⚠️  Using default JWT_SECRET. Please set a secure JWT_SECRET in production!');
  }
}
