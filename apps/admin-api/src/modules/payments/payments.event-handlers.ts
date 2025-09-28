import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PaymentProcessedEvent, PaymentFailedEvent, OrderCreatedEvent } from '@contracts';

@Injectable()
export class PaymentsEventHandlers {
  private readonly logger = new Logger(PaymentsEventHandlers.name);

  @OnEvent('payment.processed')
  async handlePaymentProcessed(event: PaymentProcessedEvent) {
    this.logger.log(`Payment processed successfully: ${event.payload.paymentId} for order: ${event.payload.orderId}`);
    
    // Example: Update order status to 'paid'
    // Example: Send confirmation email to customer
    // Example: Generate receipt
    // Example: Update accounting records
    
    this.logger.log(`Order ${event.payload.orderId} payment confirmed - Amount: ${event.payload.amount} ${event.payload.currency}`);
  }

  @OnEvent('payment.failed')
  async handlePaymentFailed(event: PaymentFailedEvent) {
    this.logger.error(`Payment failed: ${event.payload.paymentId} for order: ${event.payload.orderId} - ${event.payload.errorMessage}`);
    
    // Example: Send notification to customer about failed payment
    // Example: Hold the order for retry
    // Example: Log for fraud detection
    // Example: Update order status to 'payment_failed'
    
    this.logger.log(`Order ${event.payload.orderId} payment failed - Error: ${event.payload.errorCode}`);
  }

  @OnEvent('order.created')
  async handleOrderCreated(event: OrderCreatedEvent) {
    this.logger.log(`New order created: ${event.payload.orderId} - Preparing for payment processing`);
    
    // Example: Automatically create a pending payment record
    // Example: Reserve inventory
    // Example: Calculate taxes and fees
    
    // In a microservices architecture, this would be handled by the payment service
    // that subscribes to order.created events via Kafka
  }
}