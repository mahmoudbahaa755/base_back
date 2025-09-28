# Orders Service (Future Microservice)

This directory is prepared for when you need to extract the orders module into a dedicated microservice.

## Migration Guide

When you're ready to extract this as a microservice:

1. **Copy the orders module** from `apps/admin-api/src/modules/orders/`
2. **Set up independent NestJS application** structure
3. **Configure dedicated database** connection
4. **Set up Kafka consumer** to listen for domain events
5. **Update the monolith** to publish events to Kafka instead of local event emitter
6. **Configure API Gateway** to route orders requests to this service

## Structure Preview

```
services/orders-service/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── orders/
│   │   ├── orders.controller.ts
│   │   ├── orders.service.ts
│   │   └── orders.events.ts
│   ├── infrastructure/
│   │   ├── db/
│   │   └── kafka/
│   └── config/
├── package.json
├── Dockerfile
└── k8s/
    ├── deployment.yaml
    └── service.yaml
```

## Benefits of Extraction

- **Independent scaling** based on order volume
- **Technology flexibility** (different language/framework if needed)
- **Team autonomy** for orders domain
- **Independent deployment** cycles
- **Database optimization** for order-specific queries