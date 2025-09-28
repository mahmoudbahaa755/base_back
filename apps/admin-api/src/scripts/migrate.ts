#!/usr/bin/env tsx

import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { db, migrationClient } from '../infrastructure/db/drizzle';

async function main() {
  console.log('Running migrations...');
  
  await migrate(db, { migrationsFolder: './drizzle' });
  
  console.log('Migrations completed successfully');
  
  await migrationClient.end();
}

main().catch((error) => {
  console.error('Migration failed:', error);
  process.exit(1);
});