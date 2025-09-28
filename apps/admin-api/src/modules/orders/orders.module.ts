import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { OrdersEventHandlers } from './orders.event-handlers';

@Module({
  controllers: [OrdersController],
  providers: [OrdersService, OrdersEventHandlers],
  exports: [OrdersService],
})
export class OrdersModule {}