import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PaymentsEventHandlers } from './payments.event-handlers';

@Module({
  controllers: [PaymentsController],
  providers: [PaymentsService, PaymentsEventHandlers],
  exports: [PaymentsService],
})
export class PaymentsModule {}