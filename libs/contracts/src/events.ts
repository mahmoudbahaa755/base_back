// Base Event Interface
export interface DomainEvent {
  readonly eventId: string;
  readonly eventType: string;
  readonly aggregateId: string;
  readonly aggregateType: string;
  readonly eventVersion: number;
  readonly occurredAt: Date;
  readonly metadata?: Record<string, any>;
}

// Auth Events
export interface UserLoggedInEvent extends DomainEvent {
  eventType: 'user.logged-in';
  payload: {
    userId: string;
    email: string;
    loginTime: Date;
    ipAddress?: string;
    userAgent?: string;
  };
}

export interface UserLoggedOutEvent extends DomainEvent {
  eventType: 'user.logged-out';
  payload: {
    userId: string;
    logoutTime: Date;
  };
}

// User Events
export interface UserCreatedEvent extends DomainEvent {
  eventType: 'user.created';
  payload: {
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
    roles: string[];
    createdBy: string;
  };
}

export interface UserUpdatedEvent extends DomainEvent {
  eventType: 'user.updated';
  payload: {
    userId: string;
    updatedFields: Record<string, any>;
    updatedBy: string;
  };
}

export interface UserDeletedEvent extends DomainEvent {
  eventType: 'user.deleted';
  payload: {
    userId: string;
    deletedBy: string;
  };
}

// Role Events
export interface RoleCreatedEvent extends DomainEvent {
  eventType: 'role.created';
  payload: {
    roleId: string;
    name: string;
    permissions: string[];
    createdBy: string;
  };
}

export interface RoleUpdatedEvent extends DomainEvent {
  eventType: 'role.updated';
  payload: {
    roleId: string;
    updatedFields: Record<string, any>;
    updatedBy: string;
  };
}

// Order Events (Example Module)
export interface OrderCreatedEvent extends DomainEvent {
  eventType: 'order.created';
  payload: {
    orderId: string;
    customerId: string;
    totalAmount: number;
    items: Array<{
      productId: string;
      quantity: number;
      price: number;
    }>;
    createdBy: string;
  };
}

export interface OrderStatusUpdatedEvent extends DomainEvent {
  eventType: 'order.status-updated';
  payload: {
    orderId: string;
    previousStatus: string;
    newStatus: string;
    updatedBy: string;
  };
}

// Payment Events (Example Module)
export interface PaymentProcessedEvent extends DomainEvent {
  eventType: 'payment.processed';
  payload: {
    paymentId: string;
    orderId: string;
    amount: number;
    currency: string;
    paymentMethod: string;
    status: 'success' | 'failed' | 'pending';
    processedAt: Date;
  };
}

export interface PaymentFailedEvent extends DomainEvent {
  eventType: 'payment.failed';
  payload: {
    paymentId: string;
    orderId: string;
    amount: number;
    errorCode: string;
    errorMessage: string;
    failedAt: Date;
  };
}

// Notification Events
export interface NotificationSentEvent extends DomainEvent {
  eventType: 'notification.sent';
  payload: {
    notificationId: string;
    recipientId: string;
    type: 'email' | 'sms' | 'push';
    subject?: string;
    content: string;
    sentAt: Date;
  };
}

// Audit Events
export interface AuditLogCreatedEvent extends DomainEvent {
  eventType: 'audit.log-created';
  payload: {
    action: string;
    resourceType: string;
    resourceId: string;
    userId: string;
    changes?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
  };
}