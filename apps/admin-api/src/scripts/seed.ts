#!/usr/bin/env tsx

import { hash } from 'bcryptjs';
import { db } from '../infrastructure/db/drizzle';
import { users, roles, userRoles, settings } from '../infrastructure/db/schema';
import { ROLE_PERMISSIONS, PERMISSIONS } from '@contracts';

async function main() {
  console.log('🌱 Starting database seeding...');

  try {
    // Create default roles
    console.log('Creating default roles...');
    
    const superAdminRole = await db
      .insert(roles)
      .values({
        name: 'SUPER_ADMIN',
        description: 'Super Administrator with full access',
        permissions: ROLE_PERMISSIONS.SUPER_ADMIN,
      })
      .returning();

    const adminRole = await db
      .insert(roles)
      .values({
        name: 'ADMIN',
        description: 'Administrator with limited access',
        permissions: ROLE_PERMISSIONS.ADMIN,
      })
      .returning();

    const userManagerRole = await db
      .insert(roles)
      .values({
        name: 'USER_MANAGER',
        description: 'User Manager - manages users and roles',
        permissions: ROLE_PERMISSIONS.USER_MANAGER,
      })
      .returning();

    // Create default super admin user
    console.log('Creating default super admin user...');
    
    const hashedPassword = await hash('admin123', 12);
    
    const superAdminUser = await db
      .insert(users)
      .values({
        email: 'admin@admin.com',
        password: hashedPassword,
        firstName: 'Super',
        lastName: 'Admin',
        isActive: true,
      })
      .returning();

    // Assign super admin role to default user
    await db.insert(userRoles).values({
      userId: superAdminUser[0].id,
      roleId: superAdminRole[0].id,
    });

    // Create default settings
    console.log('Creating default settings...');
    
    await db.insert(settings).values([
      {
        key: 'app.name',
        value: JSON.stringify('Admin Platform'),
        description: 'Application name',
        isPublic: true,
        category: 'general',
      },
      {
        key: 'app.version',
        value: JSON.stringify('1.0.0'),
        description: 'Application version',
        isPublic: true,
        category: 'general',
      },
      {
        key: 'auth.session_timeout',
        value: JSON.stringify(3600),
        description: 'Session timeout in seconds',
        isPublic: false,
        category: 'authentication',
      },
      {
        key: 'notifications.email_enabled',
        value: JSON.stringify(true),
        description: 'Enable email notifications',
        isPublic: false,
        category: 'notifications',
      },
    ]);

    console.log('✅ Database seeding completed successfully!');
    console.log('');
    console.log('Default Super Admin Credentials:');
    console.log('Email: admin@admin.com');
    console.log('Password: admin123');
    console.log('');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
}

main().catch((error) => {
  console.error('Seeding failed:', error);
  process.exit(1);
});