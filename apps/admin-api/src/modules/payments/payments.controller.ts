import { Controller, Get, Post, Body, Param, Query, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { RequirePermissions } from '@common';
import { 
  CreatePaymentDto, 
  PaymentResponseDto, 
  PaginationQueryDto, 
  PERMISSIONS 
} from '@contracts';

@ApiTags('Payments')
@ApiBearerAuth()
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @RequirePermissions(PERMISSIONS.PAYMENTS_CREATE)
  @ApiOperation({ summary: 'Create a new payment' })
  @ApiResponse({ status: 201, description: 'Payment created successfully', type: PaymentResponseDto })
  async create(@Body() createPaymentDto: CreatePaymentDto): Promise<PaymentResponseDto> {
    return this.paymentsService.create(createPaymentDto);
  }

  @Get()
  @RequirePermissions(PERMISSIONS.PAYMENTS_READ)
  @ApiOperation({ summary: 'Get all payments with pagination' })
  @ApiResponse({ status: 200, description: 'Payments retrieved successfully' })
  async findAll(@Query() query: PaginationQueryDto) {
    return this.paymentsService.findAll(query);
  }

  @Get(':id')
  @RequirePermissions(PERMISSIONS.PAYMENTS_READ)
  @ApiOperation({ summary: 'Get payment by ID' })
  @ApiResponse({ status: 200, description: 'Payment found', type: PaymentResponseDto })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async findOne(@Param('id') id: string): Promise<PaymentResponseDto> {
    const payment = await this.paymentsService.findById(id);
    return this.paymentsService['mapToResponseDto'](payment);
  }

  @Get('order/:orderId')
  @RequirePermissions(PERMISSIONS.PAYMENTS_READ)
  @ApiOperation({ summary: 'Get payments by order ID' })
  @ApiResponse({ status: 200, description: 'Payments found', type: [PaymentResponseDto] })
  async findByOrderId(@Param('orderId') orderId: string): Promise<PaymentResponseDto[]> {
    return this.paymentsService.findByOrderId(orderId);
  }

  @Patch(':id/process')
  @RequirePermissions(PERMISSIONS.PAYMENTS_PROCESS)
  @ApiOperation({ summary: 'Process a payment' })
  @ApiResponse({ status: 200, description: 'Payment processed', type: PaymentResponseDto })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async processPayment(@Param('id') id: string): Promise<PaymentResponseDto> {
    return this.paymentsService.processPayment(id);
  }
}