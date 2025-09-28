# Admin Platform Boilerplate — NestJS Monorepo (Drizzle ORM)

A production-ready monorepo designed as a **Modular Monolith** with future microservices migration capabilities.

## 🏗️ Architecture

This project implements a monorepo structure that can be easily converted to microservices when needed:

```
/workspace
├─ apps/
│  └─ admin-api/               # NestJS modular monolith
│     ├─ src/
│     │  ├─ main.ts
│     │  ├─ app.module.ts
│     │  ├─ infrastructure/
│     │  │  ├─ db/             # Drizzle ORM setup
│     │  │  └─ events/         # Domain events system
│     │  └─ modules/
│     │     ├─ auth/           # Authentication & Authorization
│     │     ├─ users/          # User management
│     │     ├─ roles/          # Role-based access control
│     │     ├─ audit/          # Audit logging
│     │     ├─ settings/       # Application settings
│     │     ├─ notifications/  # Notification system
│     │     ├─ orders/         # Example module
│     │     └─ payments/       # Example module
├─ services/
│  ├─ orders-service/          # Future microservice
│  └─ payments-service/        # Future microservice
├─ libs/
│  ├─ contracts/               # Shared DTOs, events, permissions
│  └─ common/                  # Shared guards, decorators, utilities
└─ infra/
   └─ docker-compose.yml       # Infrastructure setup
```

## 🚀 Features

### Core Features
- **Authentication & Authorization** with JWT
- **Role-Based Access Control (RBAC)** with granular permissions
- **User Management** with audit trails
- **Settings Management** for application configuration
- **Notification System** (email, SMS, push notifications)
- **Audit Logging** for all system operations
- **Domain Events** for loose coupling between modules

### Technical Features
- **NestJS** with modular architecture
- **Drizzle ORM** with PostgreSQL
- **Docker Compose** for development infrastructure
- **Swagger/OpenAPI** documentation
- **TypeScript** throughout
- **Event-driven architecture** ready for microservices
- **Comprehensive validation** with class-validator
- **Global error handling** and logging

## 🛠️ Quick Start

### Prerequisites
- Node.js 18+
- Docker and Docker Compose
- npm 8+

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/mahmoudbahaa755/base_back.git
cd base_back
```

2. **Install dependencies**
```bash
npm install
```

3. **Start the infrastructure**
```bash
npm run infra:up
```

This will start:
- PostgreSQL (port 5432)
- Redis (port 6379)
- Kafka + Zookeeper (port 9092)
- Kafka UI (http://localhost:8080)
- pgAdmin (http://localhost:8081)

4. **Set up environment variables**
```bash
# Create .env file in apps/admin-api/
cp apps/admin-api/.env.example apps/admin-api/.env
```

5. **Run database migrations**
```bash
npm run db:migrate
```

6. **Seed the database**
```bash
npm run db:seed
```

7. **Start the application**
```bash
npm run start:dev
```

The API will be available at:
- **API**: http://localhost:3000
- **Swagger Documentation**: http://localhost:3000/api/docs

### Default Credentials
After seeding:
- **Email**: admin@admin.com
- **Password**: admin123

## 📝 Available Scripts

### Root Level
```bash
npm run build          # Build all workspaces
npm run start:dev       # Start admin-api in development
npm run start:prod      # Start admin-api in production
npm run test           # Run tests in all workspaces
npm run lint           # Lint all workspaces
npm run format         # Format code with Prettier

# Infrastructure
npm run infra:up       # Start Docker services
npm run infra:down     # Stop Docker services

# Database
npm run db:migrate     # Run database migrations
npm run db:seed        # Seed database with default data
```

### Admin API Specific
```bash
cd apps/admin-api

npm run start          # Start in production mode
npm run start:dev      # Start in development mode
npm run start:debug    # Start in debug mode
npm run build          # Build the application
npm run test           # Run unit tests
npm run test:e2e       # Run end-to-end tests
npm run lint           # Lint TypeScript files

# Database operations
npm run db:generate    # Generate migrations from schema
npm run db:migrate     # Run migrations
npm run db:seed        # Seed database
```

## 🏢 Monorepo Structure

### Apps
- **admin-api**: Main NestJS application with all core modules

### Services (Future Microservices)
- **orders-service**: Ready to be extracted as a microservice
- **payments-service**: Ready to be extracted as a microservice

### Libraries
- **contracts**: Shared types, DTOs, events, and permissions
- **common**: Shared utilities, guards, decorators, and interceptors

## 🔐 Authentication & Authorization

The system implements a comprehensive RBAC system:

### Default Roles
- **SUPER_ADMIN**: Full system access
- **ADMIN**: Administrative access with some limitations
- **USER_MANAGER**: User and role management
- **ORDER_MANAGER**: Order operations
- **PAYMENT_MANAGER**: Payment processing
- **AUDITOR**: Read-only access for auditing
- **VIEWER**: Read-only access

### Permissions
The system includes granular permissions for:
- User management (read, create, update, delete)
- Role management
- Order processing
- Payment handling
- Audit log access
- Settings management
- System administration

## 🗄️ Database Schema

The application uses Drizzle ORM with PostgreSQL and includes:

- **users**: User accounts with authentication
- **roles**: Role definitions with permissions
- **user_roles**: Many-to-many relationship between users and roles
- **refresh_tokens**: JWT refresh token storage
- **orders**: Order management (example)
- **payments**: Payment processing (example)
- **audit_logs**: Comprehensive audit trail
- **notifications**: Notification management
- **settings**: Application configuration

## 🔄 Event-Driven Architecture

The system uses domain events for loose coupling:

### Event Types
- User events (created, updated, deleted, login, logout)
- Role events (created, updated)
- Order events (created, status updated)
- Payment events (processed, failed)
- Notification events (sent)
- Audit events (logged)

### Event Bus
Events are published through a centralized event bus that supports:
- Local event handling (immediate processing)
- Future Kafka integration for microservices
- Event versioning and metadata

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 🚀 Migration to Microservices

This monolith is designed for easy microservices extraction:

### 1. Domain Events
All module interactions use domain events, making it easy to split services.

### 2. Shared Contracts
Common DTOs and events are in the `libs/contracts` package.

### 3. Database per Service
Each module can have its own database when extracted.

### 4. Independent Deployment
Modules are designed to be independently deployable.

### Migration Steps
1. Extract a module (e.g., orders) to `services/orders-service`
2. Set up independent database
3. Configure Kafka for event communication
4. Deploy as separate service
5. Update API gateway routing

## 📊 Development Tools

### Database Management
- **pgAdmin**: http://localhost:8081
  - Email: admin@admin.com
  - Password: admin

### Message Queue Management
- **Kafka UI**: http://localhost:8080

### API Documentation
- **Swagger**: http://localhost:3000/api/docs

## 🔧 Configuration

### Environment Variables
```env
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/admin_platform

# JWT
JWT_SECRET=your-jwt-secret-key

# API
PORT=3000

# Redis (for caching)
REDIS_URL=redis://localhost:6379

# Kafka (for events)
KAFKA_BROKERS=localhost:9092
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact: [Your email]

---

**Happy coding!** 🎉