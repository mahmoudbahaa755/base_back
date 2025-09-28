import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { OrderCreatedEvent, OrderStatusUpdatedEvent } from '@contracts';

@Injectable()
export class OrdersEventHandlers {
  private readonly logger = new Logger(OrdersEventHandlers.name);

  @OnEvent('order.created')
  async handleOrderCreated(event: OrderCreatedEvent) {
    this.logger.log(`Order created: ${event.payload.orderId} for customer: ${event.payload.customerId}`);
    
    // Example: Send notification to customer
    // Example: Update inventory
    // Example: Create payment record
    
    // This is where you would trigger other business processes
    // In a microservices architecture, this would be sent via Kafka
  }

  @OnEvent('order.status-updated')
  async handleOrderStatusUpdated(event: OrderStatusUpdatedEvent) {
    this.logger.log(
      `Order ${event.payload.orderId} status changed from ${event.payload.previousStatus} to ${event.payload.newStatus}`
    );
    
    // Example: Send notification to customer about status change
    // Example: Update shipping information
    // Example: Trigger payment processing when status changes to 'confirmed'
    
    if (event.payload.newStatus === 'confirmed') {
      // Trigger payment processing
      this.logger.log(`Triggering payment process for order: ${event.payload.orderId}`);
    }
    
    if (event.payload.newStatus === 'shipped') {
      // Send tracking information
      this.logger.log(`Order shipped: ${event.payload.orderId}`);
    }
  }
}