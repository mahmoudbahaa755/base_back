import type { Config } from 'drizzle-kit';

export default {
  schema: './src/infrastructure/db/schema/*',
  out: './drizzle',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/admin_platform',
  },
} satisfies Config;