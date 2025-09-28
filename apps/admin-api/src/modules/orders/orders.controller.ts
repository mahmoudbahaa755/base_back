import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CurrentUser, RequirePermissions } from '@common';
import { 
  CreateOrderDto, 
  UpdateOrderStatusDto, 
  OrderResponseDto, 
  PaginationQueryDto, 
  PERMISSIONS 
} from '@contracts';

@ApiTags('Orders')
@ApiBearerAuth()
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @RequirePermissions(PERMISSIONS.ORDERS_CREATE)
  @ApiOperation({ summary: 'Create a new order' })
  @ApiResponse({ status: 201, description: 'Order created successfully', type: OrderResponseDto })
  async create(
    @Body() createOrderDto: CreateOrderDto,
    @CurrentUser('userId') currentUserId: string,
  ): Promise<OrderResponseDto> {
    return this.ordersService.create(createOrderDto, currentUserId);
  }

  @Get()
  @RequirePermissions(PERMISSIONS.ORDERS_READ)
  @ApiOperation({ summary: 'Get all orders with pagination' })
  @ApiResponse({ status: 200, description: 'Orders retrieved successfully' })
  async findAll(@Query() query: PaginationQueryDto) {
    return this.ordersService.findAll(query);
  }

  @Get(':id')
  @RequirePermissions(PERMISSIONS.ORDERS_READ)
  @ApiOperation({ summary: 'Get order by ID' })
  @ApiResponse({ status: 200, description: 'Order found', type: OrderResponseDto })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async findOne(@Param('id') id: string): Promise<OrderResponseDto> {
    const order = await this.ordersService.findById(id);
    return this.ordersService['mapToResponseDto'](order);
  }

  @Patch(':id/status')
  @RequirePermissions(PERMISSIONS.ORDERS_UPDATE)
  @ApiOperation({ summary: 'Update order status' })
  @ApiResponse({ status: 200, description: 'Order status updated successfully', type: OrderResponseDto })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async updateStatus(
    @Param('id') id: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
    @CurrentUser('userId') currentUserId: string,
  ): Promise<OrderResponseDto> {
    return this.ordersService.updateStatus(id, updateOrderStatusDto, currentUserId);
  }

  @Delete(':id')
  @RequirePermissions(PERMISSIONS.ORDERS_DELETE)
  @ApiOperation({ summary: 'Delete order by ID (soft delete)' })
  @ApiResponse({ status: 200, description: 'Order deleted successfully' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async remove(
    @Param('id') id: string,
  ): Promise<{ message: string }> {
    await this.ordersService.remove(id);
    return { message: 'Order deleted successfully' };
  }
}