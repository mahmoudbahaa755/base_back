import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { eq, and, isNull, like } from 'drizzle-orm';
import { hash } from 'bcryptjs';
import { db } from '../../infrastructure/db/drizzle';
import { users, userRoles, refreshTokens } from '../../infrastructure/db/schema';
import { EventBus } from '../../infrastructure/events';
import { CreateUserDto, UpdateUserDto, UserResponseDto, UserCreatedEvent, UserUpdatedEvent, UserDeletedEvent, PaginationQueryDto } from '@contracts';

@Injectable()
export class UsersService {
  constructor(private eventBus: EventBus) {}

  async create(createUserDto: CreateUserDto, createdBy: string): Promise<UserResponseDto> {
    const existingUser = await this.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await hash(createUserDto.password, 12);
    
    const [user] = await db
      .insert(users)
      .values({
        ...createUserDto,
        password: hashedPassword,
      })
      .returning();

    // Assign roles if provided
    if (createUserDto.roleIds && createUserDto.roleIds.length > 0) {
      const roleAssignments = createUserDto.roleIds.map(roleId => ({
        userId: user.id,
        roleId,
      }));
      
      await db.insert(userRoles).values(roleAssignments);
    }

    const userWithRoles = await this.findById(user.id);

    // Publish user created event
    await this.eventBus.publish<UserCreatedEvent>({
      eventType: 'user.created',
      aggregateId: user.id,
      aggregateType: 'user',
      eventVersion: 1,
      payload: {
        userId: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: userWithRoles.roles,
        createdBy,
      },
    });

    return this.mapToResponseDto(userWithRoles);
  }

  async findAll(query: PaginationQueryDto): Promise<{ data: UserResponseDto[]; meta: any }> {
    const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'DESC' } = query;
    const offset = (page - 1) * limit;

    let whereCondition = isNull(users.deletedAt);
    
    if (search) {
      whereCondition = and(
        whereCondition,
        like(users.email, `%${search}%`)
      );
    }

    const [usersResult, totalResult] = await Promise.all([
      db
        .select()
        .from(users)
        .where(whereCondition)
        .limit(limit)
        .offset(offset)
        .orderBy(sortOrder === 'ASC' ? users[sortBy] : desc(users[sortBy])),
      db
        .select({ count: count(users.id) })
        .from(users)
        .where(whereCondition)
    ]);

    const total = totalResult[0].count;
    const totalPages = Math.ceil(total / limit);

    return {
      data: usersResult.map(user => this.mapToResponseDto(user)),
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  async findById(id: string): Promise<any> {
    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        password: users.password,
        firstName: users.firstName,
        lastName: users.lastName,
        isActive: users.isActive,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(and(eq(users.id, id), isNull(users.deletedAt)))
      .limit(1);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get user roles and permissions
    const userRolesData = await db
      .select({
        roleId: userRoles.roleId,
        roleName: roles.name,
        permissions: roles.permissions,
      })
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .where(eq(userRoles.userId, id));

    const roleNames = userRolesData.map(role => role.roleName);
    const allPermissions = userRolesData.reduce((acc, role) => {
      const permissions = role.permissions as string[];
      return [...acc, ...permissions];
    }, []);
    const uniquePermissions = [...new Set(allPermissions)];

    return {
      ...user,
      roles: roleNames,
      permissions: uniquePermissions,
    };
  }

  async findByEmail(email: string): Promise<any> {
    const [user] = await db
      .select()
      .from(users)
      .where(and(eq(users.email, email), isNull(users.deletedAt)))
      .limit(1);

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto, updatedBy: string): Promise<UserResponseDto> {
    const user = await this.findById(id);
    
    const [updatedUser] = await db
      .update(users)
      .set({
        ...updateUserDto,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();

    // Update roles if provided
    if (updateUserDto.roleIds !== undefined) {
      // Remove existing roles
      await db.delete(userRoles).where(eq(userRoles.userId, id));
      
      // Add new roles
      if (updateUserDto.roleIds.length > 0) {
        const roleAssignments = updateUserDto.roleIds.map(roleId => ({
          userId: id,
          roleId,
        }));
        
        await db.insert(userRoles).values(roleAssignments);
      }
    }

    const userWithRoles = await this.findById(id);

    // Publish user updated event
    await this.eventBus.publish<UserUpdatedEvent>({
      eventType: 'user.updated',
      aggregateId: id,
      aggregateType: 'user',
      eventVersion: 1,
      payload: {
        userId: id,
        updatedFields: updateUserDto,
        updatedBy,
      },
    });

    return this.mapToResponseDto(userWithRoles);
  }

  async remove(id: string, deletedBy: string): Promise<void> {
    await this.findById(id); // Check if user exists
    
    await db
      .update(users)
      .set({ deletedAt: new Date() })
      .where(eq(users.id, id));

    // Publish user deleted event
    await this.eventBus.publish<UserDeletedEvent>({
      eventType: 'user.deleted',
      aggregateId: id,
      aggregateType: 'user',
      eventVersion: 1,
      payload: {
        userId: id,
        deletedBy,
      },
    });
  }

  async storeRefreshToken(userId: string, token: string): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await db.insert(refreshTokens).values({
      userId,
      token,
      expiresAt,
    });
  }

  async revokeRefreshTokens(userId: string): Promise<void> {
    await db.delete(refreshTokens).where(eq(refreshTokens.userId, userId));
  }

  private mapToResponseDto(user: any): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isActive: user.isActive,
      roles: user.roles || [],
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}

// Import required Drizzle functions
import { desc, count } from 'drizzle-orm';
import { roles } from '../../infrastructure/db/schema';