import { Injectable, NotFoundException } from '@nestjs/common';
import { eq, and, isNull, desc, count } from 'drizzle-orm';
import { db } from '../../infrastructure/db/drizzle';
import { payments } from '../../infrastructure/db/schema';
import { EventBus } from '../../infrastructure/events';
import { 
  CreatePaymentDto, 
  PaymentResponseDto, 
  PaymentProcessedEvent,
  PaymentFailedEvent,
  PaginationQueryDto 
} from '@contracts';

@Injectable()
export class PaymentsService {
  constructor(private eventBus: EventBus) {}

  async create(createPaymentDto: CreatePaymentDto): Promise<PaymentResponseDto> {
    const [payment] = await db
      .insert(payments)
      .values({
        orderId: createPaymentDto.orderId,
        amount: createPaymentDto.amount.toString(),
        currency: createPaymentDto.currency,
        paymentMethod: createPaymentDto.paymentMethod,
        description: createPaymentDto.description,
        status: 'pending',
      })
      .returning();

    return this.mapToResponseDto(payment);
  }

  async processPayment(id: string): Promise<PaymentResponseDto> {
    const existingPayment = await this.findById(id);
    
    // Simulate payment processing
    const success = Math.random() > 0.2; // 80% success rate for demo
    const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    if (success) {
      const [updatedPayment] = await db
        .update(payments)
        .set({
          status: 'success',
          transactionId,
          processedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(payments.id, id))
        .returning();

      // Publish payment processed event
      await this.eventBus.publish<PaymentProcessedEvent>({
        eventType: 'payment.processed',
        aggregateId: id,
        aggregateType: 'payment',
        eventVersion: 1,
        payload: {
          paymentId: id,
          orderId: existingPayment.orderId,
          amount: parseFloat(existingPayment.amount),
          currency: existingPayment.currency,
          paymentMethod: existingPayment.paymentMethod,
          status: 'success',
          processedAt: new Date(),
        },
      });

      return this.mapToResponseDto(updatedPayment);
    } else {
      const errorCode = 'INSUFFICIENT_FUNDS';
      const errorMessage = 'Payment failed due to insufficient funds';

      const [updatedPayment] = await db
        .update(payments)
        .set({
          status: 'failed',
          errorCode,
          errorMessage,
          failedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(payments.id, id))
        .returning();

      // Publish payment failed event
      await this.eventBus.publish<PaymentFailedEvent>({
        eventType: 'payment.failed',
        aggregateId: id,
        aggregateType: 'payment',
        eventVersion: 1,
        payload: {
          paymentId: id,
          orderId: existingPayment.orderId,
          amount: parseFloat(existingPayment.amount),
          errorCode,
          errorMessage,
          failedAt: new Date(),
        },
      });

      return this.mapToResponseDto(updatedPayment);
    }
  }

  async findAll(query: PaginationQueryDto): Promise<{ data: PaymentResponseDto[]; meta: any }> {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'DESC' } = query;
    const offset = (page - 1) * limit;

    const [paymentsResult, totalResult] = await Promise.all([
      db
        .select()
        .from(payments)
        .limit(limit)
        .offset(offset)
        .orderBy(sortOrder === 'ASC' ? payments[sortBy] : desc(payments[sortBy])),
      db
        .select({ count: count(payments.id) })
        .from(payments)
    ]);

    const total = totalResult[0].count;
    const totalPages = Math.ceil(total / limit);

    return {
      data: paymentsResult.map(payment => this.mapToResponseDto(payment)),
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
    const [payment] = await db
      .select()
      .from(payments)
      .where(eq(payments.id, id))
      .limit(1);

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return payment;
  }

  async findByOrderId(orderId: string): Promise<PaymentResponseDto[]> {
    const paymentsResult = await db
      .select()
      .from(payments)
      .where(eq(payments.orderId, orderId))
      .orderBy(desc(payments.createdAt));

    return paymentsResult.map(payment => this.mapToResponseDto(payment));
  }

  private mapToResponseDto(payment: any): PaymentResponseDto {
    return {
      id: payment.id,
      orderId: payment.orderId,
      amount: parseFloat(payment.amount),
      currency: payment.currency,
      paymentMethod: payment.paymentMethod,
      status: payment.status,
      description: payment.description,
      transactionId: payment.transactionId,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
    };
  }
}