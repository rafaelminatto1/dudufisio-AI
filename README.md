# Enterprise Financial System

A comprehensive enterprise-grade financial system built with Domain-Driven Design (DDD) architecture, featuring microservices patterns, audit compliance, fiscal documentation, and payment gateway integrations.

## 🏗️ Architecture Overview

This system implements a robust financial module following DDD principles with clear separation of concerns:

```
lib/financial/
├── domain/                    # Core business logic and rules
│   ├── entities/             # Business entities (Transaction, Package, Invoice, PaymentPlan)
│   ├── value-objects/        # Value objects (Money, PaymentMethod, TaxRate)
│   ├── repositories/         # Repository interfaces
│   └── errors/              # Domain-specific errors
├── application/              # Application services and use cases
│   ├── services/            # Application services (BillingService, PaymentService, ReportingService)
│   └── use-cases/           # Use cases (CreatePackage, ProcessPayment, GenerateInvoice)
└── infrastructure/           # External integrations and data persistence
    ├── repositories/        # Repository implementations (SupabaseFinancialRepository)
    └── gateways/           # Payment gateways (StripeGateway)
```

## 🚀 Key Features

### 💰 Financial Management
- **Package Management**: Create and manage therapy session packages with automatic expiry and session tracking
- **Transaction Processing**: Handle various transaction types (purchases, installments, refunds, adjustments)
- **Invoice Generation**: Create, issue, and manage invoices with tax calculations
- **Payment Plans**: Support for installment payments with interest and penalty calculations

### 🏦 Processamento de Pagamentos
- **Múltiplos Métodos de Pagamento**: Cartão de crédito, cartão de débito, PIX, boleto bancário, dinheiro, transferência bancária
- **Gateway de Pagamento**: Integração com Stripe com suporte a webhooks
- **Pagamentos Recorrentes**: Gerenciamento de assinaturas para planos de pagamento
- **Processamento de Reembolsos**: Cálculo e processamento automatizado de reembolsos

### 📊 Análise & Relatórios Financeiros
- **Dashboard em Tempo Real**: KPIs, tendências de receita, desempenho por método de pagamento
- **Relatórios Avançados**: Fluxo de caixa, análise de receita, valor do cliente ao longo do tempo
- **Gestão de Inadimplência**: Detecção automática de inadimplência e cálculo de penalidades
- **Pontuação de Saúde Financeira**: Avaliação de risco financeiro do paciente

### 🔒 Auditoria & Compliance
- **Trilha de Auditoria Completa**: Toda alteração financeira é registrada com usuário, data/hora e IP
- **Documentação Fiscal**: Conformidade com tributos brasileiros (ISS, COFINS, PIS)
- **Integridade de Dados**: Controle de versões e locking otimista
- **Segurança em Nível de Linha**: Políticas RLS do Supabase para proteção de dados

### 🎨 Interface do Usuário
- **Dashboard Moderno**: Dashboard financeiro em React com gráficos e KPIs
- **Gestão de Transações**: Visualização e gerenciamento completo de transações
- **Acompanhamento de Pacotes**: Gestão visual do uso e validade de pacotes
- **Sistema de Faturas**: Gerenciamento completo do ciclo de vida de faturas

## 🛠️ Stack Tecnológico

### Backend
- **TypeScript**: Desenvolvimento com tipagem forte
- **Domain-Driven Design**: Arquitetura limpa com limites bem definidos
- **Supabase**: Banco de dados PostgreSQL com recursos em tempo real
### 🏦 Payment Processing
- **Multiple Payment Methods**: Credit card, debit card, PIX, bank slip, cash, bank transfer
- **Payment Gateway**: Stripe integration with webhook support
- **Recurring Payments**: Subscription management for payment plans
- **Refund Processing**: Automated refund calculations and processing

### 📊 Financial Analytics & Reporting
- **Real-time Dashboard**: KPIs, revenue trends, payment method performance
- **Advanced Reports**: Cash flow, revenue analysis, customer lifetime value
- **Overdue Management**: Automated overdue detection and penalty calculations
- **Financial Health Scoring**: Patient financial risk assessment

### 🔒 Audit & Compliance
- **Complete Audit Trail**: Every financial change is logged with user, timestamp, and IP
- **Fiscal Documentation**: Brazilian tax compliance (ISS, COFINS, PIS)
- **Data Integrity**: Version control and optimistic locking
- **Row-Level Security**: Supabase RLS policies for data protection

### 🎨 User Interface
- **Modern Dashboard**: React-based financial dashboard with charts and KPIs
- **Transaction Management**: Comprehensive transaction viewing and management
- **Package Tracking**: Visual package usage and expiry management
- **Invoice System**: Complete invoice lifecycle management

## 🛠️ Technology Stack

### Backend
- **TypeScript**: Type-safe development
- **Domain-Driven Design**: Clean architecture with clear boundaries
- **Supabase**: PostgreSQL database with real-time features
- **Stripe & Pagar.me**: Payment processing integrations

### Frontend
- **Next.js 14**: React framework with App Router
- **React 18**: Modern React with hooks and concurrent features
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Accessible component primitives
- **Recharts**: Data visualization and charts
- **Lucide React**: Modern icon library

### Database
- **PostgreSQL**: Robust relational database
- **Row-Level Security**: Built-in data protection
- **Materialized Views**: Optimized financial reporting
- **Audit Triggers**: Automatic change tracking

### Testing
- **Jest**: Comprehensive testing framework
- **Testing Library**: React component testing
- **90%+ Coverage**: Domain layer with high test coverage
- **Integration Tests**: Payment gateway and database testing

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/financial-system-enterprise.git
   cd financial-system-enterprise
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env.local
   # Configure your environment variables
   ```

4. **Database Setup**
   ```bash
   # Initialize Supabase project
   supabase init
   
   # Run migrations
   supabase db reset
   npm run db:migrate
   
   # Generate TypeScript types
   npm run db:generate-types
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

## 🧪 Testing

The system includes comprehensive tests with high coverage:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage

# Run domain tests only
npm run test:domain

# Run application tests
npm run test:application

# Run infrastructure tests
npm run test:infrastructure
```

### Test Coverage Goals
- **Domain Layer**: 90%+ coverage (business logic)
- **Application Layer**: 85%+ coverage (use cases and services)
- **Infrastructure Layer**: 80%+ coverage (integrations)

## 💳 Payment Gateway Configuration

### Stripe Setup
```typescript
import { StripeGateway } from './lib/financial/infrastructure/gateways/StripeGateway';

const stripeGateway = new StripeGateway({
  secretKey: process.env.STRIPE_SECRET_KEY!,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  apiVersion: '2023-10-16'
});
```



## 📊 Database Schema

The system uses a comprehensive PostgreSQL schema with:

- **Financial Transactions**: Core transaction table with audit fields
- **Patient Packages**: Session package tracking with usage monitoring
- **Invoices**: Invoice management with line items and tax calculations
- **Payment Plans**: Installment payment tracking
- **Audit Logs**: Complete change history for compliance
- **Materialized Views**: Optimized reporting and KPI calculations

Key features:
- Automatic audit triggers
- Row-level security policies
- Optimized indexes for performance
- Stored procedures for complex calculations

## 🔧 Configuration

### Environment Variables
```env
# Database
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Payment Gateway
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Application
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
```

### Payment Gateway Webhooks
Configure webhooks in your payment provider dashboards:

**Stripe Webhooks:**
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `invoice.payment_succeeded`
- `invoice.payment_failed`



## 📈 Usage Examples

### Creating a Package
```typescript
import { CreatePackageUseCase } from './lib/financial/application/use-cases/CreatePackageUseCase';

const createPackage = new CreatePackageUseCase(repository, billingService, paymentService);

const result = await createPackage.execute({
  patientId: 'patient-123',
  packageType: PackageType.SESSIONS_10,
  paymentMethod: PaymentMethod.creditCard('visa', '1234', 12, 2025, 'John Doe'),
  installments: 3,
  createdBy: 'user-123'
});

if (result.success) {
  console.log('Package created:', result.package);
} else {
  console.error('Error:', result.error);
}
```

### Processing a Payment
```typescript
import { ProcessPaymentUseCase } from './lib/financial/application/use-cases/ProcessPaymentUseCase';

const processPayment = new ProcessPaymentUseCase(repository, paymentService);

const result = await processPayment.execute({
  transactionId: 'tx-123',
  paymentMethodId: 'pm_123',
  gatewayName: 'stripe'
});
```

### Generating Financial Reports
```typescript
import { ReportingService } from './lib/financial/application/services/ReportingService';

const reportingService = new ReportingService(repository);

const cashFlowReport = await reportingService.generateCashFlowReport({
  start: new Date('2024-01-01'),
  end: new Date('2024-12-31')
});

const revenueAnalysis = await reportingService.generateRevenueAnalysis({
  start: new Date('2024-01-01'),
  end: new Date('2024-12-31')
});
```

## 🔐 Security Features

- **Row-Level Security**: Database-level access control
- **Audit Logging**: Complete change tracking with user attribution
- **Payment Data Protection**: PCI-compliant payment handling
- **API Rate Limiting**: Protection against abuse
- **Input Validation**: Comprehensive data validation
- **Error Handling**: Secure error messages without data leakage

## 🚀 Deployment

### Production Checklist
- [ ] Configure environment variables
- [ ] Set up database with proper indexes
- [ ] Configure payment gateway webhooks
- [ ] Set up monitoring and alerting
- [ ] Configure backup strategies
- [ ] Test payment flows end-to-end
- [ ] Verify audit logging
- [ ] Check security policies

### Monitoring
- Database performance metrics
- Payment success/failure rates
- API response times
- Error rates and types
- Audit log completeness
- Financial reconciliation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass (`npm run test:ci`)
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

### Development Guidelines
- Follow DDD principles and maintain clean architecture
- Write comprehensive tests for new features
- Update documentation for API changes
- Use TypeScript strict mode
- Follow the existing code style and patterns

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation in the `/docs` folder
- Review the test files for usage examples

## 🙏 Acknowledgments

- Domain-Driven Design community for architectural patterns
- Stripe for excellent payment APIs
- Supabase team for the amazing database platform
- React and Next.js communities for frontend excellence
