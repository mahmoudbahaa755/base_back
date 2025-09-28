import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DomainEvent } from '@contracts';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class EventBus {
  private readonly logger = new Logger(EventBus.name);

  constructor(private eventEmitter: EventEmitter2) {}

  async publish<T extends DomainEvent>(event: Omit<T, 'eventId' | 'occurredAt'>): Promise<void> {
    const domainEvent: T = {
      ...event,
      eventId: uuidv4(),
      occurredAt: new Date(),
    } as T;

    this.logger.log(`Publishing event: ${domainEvent.eventType} for aggregate: ${domainEvent.aggregateId}`);
    
    try {
      // Emit locally for immediate processing
      await this.eventEmitter.emitAsync(domainEvent.eventType, domainEvent);
      
      // TODO: Add external message broker (Kafka) publishing here
      // await this.publishToKafka(domainEvent);
      
      this.logger.log(`Event published successfully: ${domainEvent.eventId}`);
    } catch (error) {
      this.logger.error(`Failed to publish event: ${domainEvent.eventId}`, error);
      throw error;
    }
  }

  // Placeholder for future Kafka integration
  private async publishToKafka<T extends DomainEvent>(event: T): Promise<void> {
    // Implementation will be added when Kafka is integrated
    // const producer = this.kafkaService.getProducer();
    // await producer.send({
    //   topic: `domain-events.${event.aggregateType}`,
    //   messages: [{
    //     key: event.aggregateId,
    //     value: JSON.stringify(event),
    //     headers: {
    //       eventType: event.eventType,
    //       eventId: event.eventId,
    //     },
    //   }],
    // });
  }
}