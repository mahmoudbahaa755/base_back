import { Injectable, NotFoundException } from '@nestjs/common';
import { eq, and, isNull, desc, count } from 'drizzle-orm';
import { db } from '../../infrastructure/db/drizzle';
import { orders } from '../../infrastructure/db/schema';
import { EventBus } from '../../infrastructure/events';
import { 
  CreateOrderDto, 
  UpdateOrderStatusDto, 
  OrderResponseDto, 
  OrderCreatedEvent,
  OrderStatusUpdatedEvent,
  PaginationQueryDto 
} from '@contracts';

@Injectable()
export class OrdersService {
  constructor(private eventBus: EventBus) {}

  async create(createOrderDto: CreateOrderDto, createdBy: string): Promise<OrderResponseDto> {
    const totalAmount = createOrderDto.items.reduce((sum, item) => 
      sum + (item.price * item.quantity), 0
    );

    const [order] = await db
      .insert(orders)
      .values({
        customerId: createOrderDto.customerId,
        totalAmount: totalAmount.toString(),
        items: createOrderDto.items,
        notes: createOrderDto.notes,
        createdBy,
        status: 'pending',
      })
      .returning();

    // Publish order created event
    await this.eventBus.publish<OrderCreatedEvent>({
      eventType: 'order.created',
      aggregateId: order.id,
      aggregateType: 'order',
      eventVersion: 1,
      payload: {
        orderId: order.id,
        customerId: order.customerId,
        totalAmount: parseFloat(order.totalAmount),
        items: createOrderDto.items,
        createdBy,
      },
    });

    return this.mapToResponseDto(order);
  }

  async findAll(query: PaginationQueryDto): Promise<{ data: OrderResponseDto[]; meta: any }> {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'DESC' } = query;
    const offset = (page - 1) * limit;

    const whereCondition = isNull(orders.deletedAt);

    const [ordersResult, totalResult] = await Promise.all([
      db
        .select()
        .from(orders)
        .where(whereCondition)
        .limit(limit)
        .offset(offset)
        .orderBy(sortOrder === 'ASC' ? orders[sortBy] : desc(orders[sortBy])),
      db
        .select({ count: count(orders.id) })
        .from(orders)
        .where(whereCondition)
    ]);

    const total = totalResult[0].count;
    const totalPages = Math.ceil(total / limit);

    return {
      data: ordersResult.map(order => this.mapToResponseDto(order)),
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
    const [order] = await db
      .select()
      .from(orders)
      .where(and(eq(orders.id, id), isNull(orders.deletedAt)))
      .limit(1);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async updateStatus(
    id: string, 
    updateOrderStatusDto: UpdateOrderStatusDto, 
    updatedBy: string
  ): Promise<OrderResponseDto> {
    const existingOrder = await this.findById(id);
    
    const [updatedOrder] = await db
      .update(orders)
      .set({
        status: updateOrderStatusDto.status,
        notes: updateOrderStatusDto.notes || existingOrder.notes,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, id))
      .returning();

    // Publish order status updated event
    await this.eventBus.publish<OrderStatusUpdatedEvent>({
      eventType: 'order.status-updated',
      aggregateId: id,
      aggregateType: 'order',
      eventVersion: 1,
      payload: {
        orderId: id,
        previousStatus: existingOrder.status,
        newStatus: updateOrderStatusDto.status,
        updatedBy,
      },
    });

    return this.mapToResponseDto(updatedOrder);
  }

  async remove(id: string): Promise<void> {
    await this.findById(id); // Check if order exists
    
    await db
      .update(orders)
      .set({ deletedAt: new Date() })
      .where(eq(orders.id, id));
  }

  private mapToResponseDto(order: any): OrderResponseDto {
    return {
      id: order.id,
      customerId: order.customerId,
      status: order.status,
      totalAmount: parseFloat(order.totalAmount),
      items: order.items,
      notes: order.notes,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }
}