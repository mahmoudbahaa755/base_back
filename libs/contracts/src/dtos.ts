import { IsEmail, IsNotEmpty, IsString, IsOptional, IsArray, IsUUID, IsEnum, IsNumber, IsBoolean, IsDateString, MinLength } from 'class-validator';

// Auth DTOs
export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}

export class AuthResponseDto {
  @IsString()
  accessToken: string;

  @IsString()
  refreshToken: string;

  @IsString()
  tokenType: string = 'Bearer';

  @IsNumber()
  expiresIn: number;
}

export class RefreshTokenDto {
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}

// User DTOs
export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  roleIds?: string[];

  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;
}

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  roleIds?: string[];

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UserResponseDto {
  @IsUUID()
  id: string;

  @IsEmail()
  email: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsBoolean()
  isActive: boolean;

  @IsArray()
  roles: string[];

  @IsDateString()
  createdAt: Date;

  @IsDateString()
  updatedAt: Date;
}

// Role DTOs
export class CreateRoleDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsString({ each: true })
  permissions: string[];
}

export class UpdateRoleDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  permissions?: string[];
}

export class RoleResponseDto {
  @IsUUID()
  id: string;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  permissions: string[];

  @IsDateString()
  createdAt: Date;

  @IsDateString()
  updatedAt: Date;
}

// Order DTOs (Example Module)
export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled'
}

export class CreateOrderItemDto {
  @IsUUID()
  productId: string;

  @IsNumber()
  quantity: number;

  @IsNumber()
  price: number;
}

export class CreateOrderDto {
  @IsUUID()
  customerId: string;

  @IsArray()
  items: CreateOrderItemDto[];

  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus)
  status: OrderStatus;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class OrderResponseDto {
  @IsUUID()
  id: string;

  @IsUUID()
  customerId: string;

  @IsEnum(OrderStatus)
  status: OrderStatus;

  @IsNumber()
  totalAmount: number;

  @IsArray()
  items: CreateOrderItemDto[];

  @IsString()
  @IsOptional()
  notes?: string;

  @IsDateString()
  createdAt: Date;

  @IsDateString()
  updatedAt: Date;
}

// Payment DTOs (Example Module)
export enum PaymentStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export enum PaymentMethod {
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  BANK_TRANSFER = 'bank_transfer',
  PAYPAL = 'paypal',
  STRIPE = 'stripe'
}

export class CreatePaymentDto {
  @IsUUID()
  orderId: string;

  @IsNumber()
  amount: number;

  @IsString()
  currency: string = 'USD';

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @IsString()
  @IsOptional()
  description?: string;
}

export class PaymentResponseDto {
  @IsUUID()
  id: string;

  @IsUUID()
  orderId: string;

  @IsNumber()
  amount: number;

  @IsString()
  currency: string;

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @IsEnum(PaymentStatus)
  status: PaymentStatus;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  transactionId?: string;

  @IsDateString()
  createdAt: Date;

  @IsDateString()
  updatedAt: Date;
}

// Notification DTOs
export enum NotificationType {
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push'
}

export class CreateNotificationDto {
  @IsUUID()
  recipientId: string;

  @IsEnum(NotificationType)
  type: NotificationType;

  @IsString()
  @IsOptional()
  subject?: string;

  @IsString()
  content: string;

  @IsString()
  @IsOptional()
  templateId?: string;
}

export class NotificationResponseDto {
  @IsUUID()
  id: string;

  @IsUUID()
  recipientId: string;

  @IsEnum(NotificationType)
  type: NotificationType;

  @IsString()
  @IsOptional()
  subject?: string;

  @IsString()
  content: string;

  @IsBoolean()
  isSent: boolean;

  @IsDateString()
  @IsOptional()
  sentAt?: Date;

  @IsDateString()
  createdAt: Date;
}

// Audit DTOs
export class AuditLogResponseDto {
  @IsUUID()
  id: string;

  @IsString()
  action: string;

  @IsString()
  resourceType: string;

  @IsUUID()
  resourceId: string;

  @IsUUID()
  userId: string;

  @IsString()
  @IsOptional()
  ipAddress?: string;

  @IsString()
  @IsOptional()
  userAgent?: string;

  @IsString()
  @IsOptional()
  changes?: string; // JSON string

  @IsDateString()
  createdAt: Date;
}

// Pagination DTOs
export class PaginationQueryDto {
  @IsNumber()
  @IsOptional()
  page?: number = 1;

  @IsNumber()
  @IsOptional()
  limit?: number = 10;

  @IsString()
  @IsOptional()
  sortBy?: string;

  @IsString()
  @IsOptional()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';

  @IsString()
  @IsOptional()
  search?: string;
}

export class PaginatedResponseDto<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}