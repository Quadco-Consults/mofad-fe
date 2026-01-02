# MOFAD Frontend Documentation

## Overview

The MOFAD Frontend is a Next.js 15 application built with TypeScript, Tailwind CSS, and React Query for state management. It provides a comprehensive distribution management interface for the MOFAD system.

## Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 15.5.9 | React framework with App Router |
| React | 18.3.1 | UI library |
| TypeScript | 5.7.2 | Type safety |
| Tailwind CSS | 3.4.16 | Styling |
| React Query | 5.62.8 | Server state management |
| Zustand | 5.0.2 | Client state management |
| React Hook Form | 7.53.2 | Form handling |
| Recharts | 2.13.3 | Charts and analytics |
| Axios | 1.7.9 | HTTP client |
| Lucide React | 0.468.0 | Icons |

---

## Project Structure

```
src/
├── app/                          # Next.js App Router pages
│   ├── accounts/                 # Accounting module
│   │   ├── lodgements/          # Lodgement management
│   │   ├── transactions/        # Account transactions
│   │   └── page.tsx             # Accounts dashboard
│   ├── auth/
│   │   └── login/               # Login page
│   ├── channels/                 # Sales channels
│   │   ├── lubebays/            # Lubebay locations
│   │   │   └── services/        # Lubebay services
│   │   └── substores/           # Substore network
│   │       └── transactions/    # Substore transactions
│   ├── customers/               # Customer management
│   │   ├── transactions/        # Customer transactions
│   │   ├── types/               # Customer types
│   │   └── page.tsx             # Customer list
│   ├── dashboard/               # Main dashboard
│   ├── inventory/               # Inventory management
│   │   ├── substore/            # Substore inventory
│   │   ├── transactions/        # Stock transactions
│   │   ├── transfers/           # Stock transfers
│   │   └── warehouse/           # Warehouse inventory
│   ├── orders/                  # Order management
│   │   ├── approvals/           # Approval workflow
│   │   ├── prf/                 # Purchase Requisitions
│   │   └── pro/                 # Purchase Orders
│   ├── products/                # Product management
│   │   ├── pricing/             # Pricing schemes
│   │   ├── services/            # Service offerings
│   │   └── page.tsx             # Product list
│   ├── reports/                 # Reporting module
│   │   ├── customers/           # Customer reports
│   │   ├── financial/           # Financial reports
│   │   ├── inventory/           # Inventory reports
│   │   └── sales/               # Sales reports
│   ├── settings/                # System settings
│   │   ├── states/              # State management
│   │   ├── system/              # System configuration
│   │   ├── users/               # User management
│   │   └── warehouses/          # Warehouse settings
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Home page (redirects)
│   └── providers.tsx            # React Query provider
├── components/
│   ├── dashboard/               # Dashboard components
│   │   ├── DashboardCharts.tsx
│   │   ├── PendingApprovals.tsx
│   │   └── RecentTransactions.tsx
│   ├── layout/                  # Layout components
│   │   ├── AppLayout.tsx
│   │   ├── Header.tsx
│   │   └── Sidebar.tsx
│   └── ui/                      # UI components
│       ├── Button.tsx
│       └── Card.tsx
├── hooks/                       # Custom React hooks
├── lib/                         # Utilities
│   ├── api.ts                   # Legacy API client
│   ├── apiClient.ts             # Django API client
│   ├── mockApi.ts               # Mock API for development
│   └── utils.ts                 # Helper functions
├── store/
│   └── authStore.ts             # Authentication state
└── types/
    └── index.ts                 # TypeScript interfaces
```

---

## Implemented Features

### Authentication
- [x] Login page with form validation
- [x] JWT token-based authentication
- [x] Persistent login state with Zustand
- [x] Automatic token storage in localStorage
- [x] Protected routes with auth checks

### Dashboard
- [x] Stats cards with YTD sales, orders, customers
- [x] Pending approvals count
- [x] Low stock alerts
- [x] Sales analytics charts (Recharts)
- [x] Recent transactions list
- [x] Quick action buttons

### Orders Management
- [x] PRF (Purchase Requisition Form) - Full CRUD
- [x] PRO (Purchase Order) - List and view
- [x] Approvals workflow interface

### Customer Management
- [x] Customer list with search and filters
- [x] Customer CRUD operations
- [x] Customer transactions history
- [x] Customer types management
- [x] Credit limit tracking
- [x] Customer ratings

### Product Management
- [x] Product catalog with categories
- [x] Product CRUD operations
- [x] Pricing schemes management
- [x] Service offerings management
- [x] Stock level monitoring

### Inventory Management
- [x] Warehouse inventory tracking
- [x] Substore inventory tracking
- [x] Stock transactions history
- [x] Stock transfers management
- [x] Low stock alerts

### Sales Channels
- [x] Substores network management
- [x] Substore transactions
- [x] Lubebays locations (basic)
- [x] Lubebay services (basic)

### Accounts Module
- [x] Accounts overview
- [x] Account transactions
- [x] Lodgements management

### Reports
- [x] Sales reports (basic)
- [x] Customer reports (basic)
- [x] Inventory reports (basic)
- [x] Financial reports (basic)

### Settings
- [x] User management
- [x] Warehouse configuration
- [x] State/Location management
- [x] System settings

---

## Features Not Yet Implemented

### Authentication
- [ ] Forgot password flow
- [ ] Email verification
- [ ] MFA/2FA support
- [ ] Session timeout handling
- [ ] Password change

### Orders
- [ ] PRF item management (add/remove items)
- [ ] PRO creation from PRF
- [ ] Order approval workflow with comments
- [ ] Order status tracking
- [ ] Order printing/PDF export

### Inventory
- [ ] Batch stock updates
- [ ] Barcode scanning integration
- [ ] Stock take/counting
- [ ] Automated reorder suggestions
- [ ] Inventory valuation reports

### Customers
- [ ] Customer balance statements
- [ ] Credit limit approval workflow
- [ ] Customer documents upload
- [ ] Customer communication history

### Products
- [ ] Product images upload
- [ ] Product variants
- [ ] Bulk price updates
- [ ] Product import/export CSV

### Sales Channels
- [ ] Substore performance analytics
- [ ] Lubebay service scheduling
- [ ] Commission calculations
- [ ] Channel-specific pricing

### Accounts
- [ ] Journal entry creation
- [ ] Account reconciliation
- [ ] Payment processing
- [ ] Expense management
- [ ] Financial statements generation

### Reports
- [ ] Export to Excel/PDF
- [ ] Date range filtering
- [ ] Custom report builder
- [ ] Scheduled report generation
- [ ] Report sharing

### System
- [ ] Audit log viewer
- [ ] System backup/restore
- [ ] Email notification settings
- [ ] API key management
- [ ] Role permission configuration

---

## Bug Fixes Applied

### Build Errors Fixed (January 2026)

1. **ESLint Unescaped Entities**
   - `src/app/auth/login/page.tsx:179` - Fixed `Don't` to `Don&apos;t`
   - `src/app/dashboard/page.tsx:100` - Fixed `Here's what's` to `Here&apos;s what&apos;s`

2. **TypeScript Type Errors**
   - `src/app/channels/substores/page.tsx:202` - Added `string[]` type annotation for states array
   - `src/app/inventory/substore/page.tsx:97` - Added `string[]` type annotation for substores array
   - `src/app/customers/page.tsx:87` - Added explicit type for formData status field
   - `src/app/orders/prf/page.tsx:97` - Added explicit type for formData priority field
   - `src/app/products/page.tsx:88` - Added explicit type for formData status field
   - `src/app/dashboard/page.tsx:90-100` - Added DashboardStats interface and type annotations
   - `src/store/authStore.ts:37` - Fixed login response handling
   - `src/store/authStore.ts:91` - Fixed getUser response handling

---

## API Integration

### Backend Connection
The frontend is configured to connect to the Django backend:

```typescript
// Default API URLs
const API_BASE_URL = 'http://localhost:8000/api/v1'
const AUTH_API_URL = 'http://localhost:8000/api/token'
```

### Environment Variables
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_USE_REAL_API=true  # Set to 'false' to use mock API
```

### API Endpoints Used
- `POST /api/token/` - JWT authentication
- `GET /api/v1/users/` - User data
- `GET /api/v1/customers/` - Customer list
- `GET /api/v1/products/` - Product list
- `GET /api/v1/prfs/` - Purchase requisitions
- `GET /api/v1/pros/` - Purchase orders
- `GET /api/v1/customer-transactions/` - Transactions
- And more...

---

## Development

### Running the Development Server
```bash
npm run dev
# or
yarn dev
```

### Building for Production
```bash
npm run build
npm start
```

### Linting
```bash
npm run lint
```

---

## Login Credentials (Development)

### Mock API
```
Email: admin@mofadenergysolutions.com
Password: admin123
```

### Django Backend
```
Email: admin@mofad.com
Password: Admin@123
```

---

## Known Issues

1. **Chart Data**: Sales analytics chart uses placeholder data until backend endpoint is implemented
2. **Mock vs Real API**: Some pages may still reference mock API instead of real Django API
3. **File Uploads**: Image/document upload functionality not yet implemented
4. **Notifications**: Real-time notifications not implemented
5. **Search**: Global search functionality is UI-only

---

## Next Steps

### Priority 1 - Critical
1. Complete API integration for all CRUD operations. Please be cautious and very
   thorough by looking to understand the backend data structure and json format while
   consuming the endpoints
2. Implement proper error handling with user feedback
3. Add loading states for all data fetching
4. Implement form validation with proper error messages

### Priority 2 - Important
1. Add export functionality (Excel/PDF)
2. Implement approval workflow with comments
3. Add real-time notifications
4. Complete reports with date filtering

### Priority 3 - Nice to Have
1. Dark mode support
2. Internationalization (i18n)
3. Progressive Web App (PWA) support
4. Offline capability

---

## Contributing

1. Follow TypeScript best practices
2. Use existing UI components from `/components/ui/`
3. Add proper type definitions for all data
4. Implement loading and error states
5. Test API integrations thoroughly

---

*Last Updated: January 1, 2026*
