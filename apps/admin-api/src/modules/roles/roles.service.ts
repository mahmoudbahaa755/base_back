import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { eq, and, isNull, like, desc, count } from 'drizzle-orm';
import { db } from '../../infrastructure/db/drizzle';
import { roles } from '../../infrastructure/db/schema';
import { EventBus } from '../../infrastructure/events';
import { 
  CreateRoleDto, 
  UpdateRoleDto, 
  RoleResponseDto, 
  RoleCreatedEvent, 
  RoleUpdatedEvent,
  PaginationQueryDto 
} from '@contracts';

@Injectable()
export class RolesService {
  constructor(private eventBus: EventBus) {}

  async create(createRoleDto: CreateRoleDto, createdBy: string): Promise<RoleResponseDto> {
    const existingRole = await this.findByName(createRoleDto.name);
    if (existingRole) {
      throw new ConflictException('Role with this name already exists');
    }

    const [role] = await db
      .insert(roles)
      .values({
        name: createRoleDto.name,
        description: createRoleDto.description,
        permissions: createRoleDto.permissions,
      })
      .returning();

    // Publish role created event
    await this.eventBus.publish<RoleCreatedEvent>({
      eventType: 'role.created',
      aggregateId: role.id,
      aggregateType: 'role',
      eventVersion: 1,
      payload: {
        roleId: role.id,
        name: role.name,
        permissions: createRoleDto.permissions,
        createdBy,
      },
    });

    return this.mapToResponseDto(role);
  }

  async findAll(query: PaginationQueryDto): Promise<{ data: RoleResponseDto[]; meta: any }> {
    const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'DESC' } = query;
    const offset = (page - 1) * limit;

    let whereCondition = isNull(roles.deletedAt);
    
    if (search) {
      whereCondition = and(
        whereCondition,
        like(roles.name, `%${search}%`)
      );
    }

    const [rolesResult, totalResult] = await Promise.all([
      db
        .select()
        .from(roles)
        .where(whereCondition)
        .limit(limit)
        .offset(offset)
        .orderBy(sortOrder === 'ASC' ? roles[sortBy] : desc(roles[sortBy])),
      db
        .select({ count: count(roles.id) })
        .from(roles)
        .where(whereCondition)
    ]);

    const total = totalResult[0].count;
    const totalPages = Math.ceil(total / limit);

    return {
      data: rolesResult.map(role => this.mapToResponseDto(role)),
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
    const [role] = await db
      .select()
      .from(roles)
      .where(and(eq(roles.id, id), isNull(roles.deletedAt)))
      .limit(1);

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    return role;
  }

  async findByName(name: string): Promise<any> {
    const [role] = await db
      .select()
      .from(roles)
      .where(and(eq(roles.name, name), isNull(roles.deletedAt)))
      .limit(1);

    return role;
  }

  async update(id: string, updateRoleDto: UpdateRoleDto, updatedBy: string): Promise<RoleResponseDto> {
    const existingRole = await this.findById(id);
    
    // Check if name is being updated and if it conflicts
    if (updateRoleDto.name && updateRoleDto.name !== existingRole.name) {
      const roleWithName = await this.findByName(updateRoleDto.name);
      if (roleWithName) {
        throw new ConflictException('Role with this name already exists');
      }
    }

    const [updatedRole] = await db
      .update(roles)
      .set({
        ...updateRoleDto,
        updatedAt: new Date(),
      })
      .where(eq(roles.id, id))
      .returning();

    // Publish role updated event
    await this.eventBus.publish<RoleUpdatedEvent>({
      eventType: 'role.updated',
      aggregateId: id,
      aggregateType: 'role',
      eventVersion: 1,
      payload: {
        roleId: id,
        updatedFields: updateRoleDto,
        updatedBy,
      },
    });

    return this.mapToResponseDto(updatedRole);
  }

  async remove(id: string): Promise<void> {
    await this.findById(id); // Check if role exists
    
    await db
      .update(roles)
      .set({ deletedAt: new Date() })
      .where(eq(roles.id, id));
  }

  private mapToResponseDto(role: any): RoleResponseDto {
    return {
      id: role.id,
      name: role.name,
      description: role.description,
      permissions: role.permissions,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    };
  }
}