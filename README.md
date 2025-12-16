# MOFAD Frontend - Next.js Application

This is the Next.js frontend for the MOFAD (Ministry of Fuel and Distribution) Distribution Management System, converted from the original Laravel Blade-based frontend.

## Features

- **Modern React/Next.js Application** with TypeScript support
- **Responsive Design** built with Tailwind CSS
- **Real-time Dashboard** with charts and analytics
- **Authentication System** with JWT tokens
- **Role-based Access Control** integrated with Laravel backend
- **Multi-channel Sales Management** (Direct, Substores, Lubebays)
- **Inventory Tracking** across warehouses and locations
- **Approval Workflows** for orders and transactions
- **Financial Management** with account tracking
- **Comprehensive Reporting** with export capabilities

## Technology Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand + React Query (TanStack Query)
- **Charts**: Recharts
- **Forms**: React Hook Form
- **HTTP Client**: Axios
- **UI Components**: Custom components with Radix UI primitives
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Laravel backend running on `http://localhost:8000`

### Installation

1. **Clone and navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Copy environment variables**:
   ```bash
   cp .env.example .env.local
   ```

4. **Configure environment variables** in `.env.local`:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:8000/api
   ```

5. **Start the development server**:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. **Open your browser** and navigate to `http://localhost:3000`

## Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── auth/              # Authentication pages
│   │   ├── dashboard/         # Dashboard page
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Homepage
│   │   └── providers.tsx      # React Query provider
│   ├── components/            # React components
│   │   ├── dashboard/         # Dashboard-specific components
│   │   ├── layout/            # Layout components (Sidebar, Header)
│   │   └── ui/                # Reusable UI components
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Utility functions and API client
│   ├── store/                 # Zustand stores
│   └── types/                 # TypeScript type definitions
├── public/                    # Static assets
├── next.config.js            # Next.js configuration
├── tailwind.config.ts        # Tailwind CSS configuration
└── tsconfig.json             # TypeScript configuration
```

## Key Features Implemented

### 1. Authentication System
- JWT-based authentication with Laravel Sanctum
- Persistent login state with localStorage
- Automatic token refresh and error handling
- Role-based access control

### 2. Dashboard Analytics
- Real-time sales and inventory metrics
- Interactive charts showing sales trends
- Product performance analytics
- Channel performance breakdown (Direct/Substore/Lubebay)
- Pending approvals overview

### 3. Layout System
- Responsive sidebar navigation
- Collapsible menu with icons
- User profile dropdown
- Real-time notifications
- Search functionality

### 4. API Integration
- Axios-based HTTP client with interceptors
- Automatic error handling and retries
- React Query for data fetching and caching
- Optimistic updates for better UX

## API Endpoints Integration

The frontend is designed to integrate with these Laravel backend endpoints:

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/user` - Get current user

### Dashboard
- `GET /api/dashboard/stats` - Dashboard statistics
- `GET /api/dashboard/sales-analytics` - Sales analytics data

### Orders Management
- `GET /api/prfs` - List purchase requisitions
- `POST /api/prfs` - Create new PRF
- `PUT /api/prfs/{id}` - Update PRF
- `POST /api/prfs/{id}/approve` - Approve PRF

### Inventory
- `GET /api/warehouses/{id}/inventory` - Warehouse inventory
- `GET /api/substores/{id}/inventory` - Substore inventory
- `POST /api/inventory/adjust` - Inventory adjustments

### Customers & Products
- `GET /api/customers` - Customer list
- `GET /api/products` - Product list
- `GET /api/substores` - Substore list
- `GET /api/lubebays` - Lubebay list

## State Management

### Zustand Stores
- **AuthStore**: User authentication and session management
- Additional stores can be added for specific features

### React Query
- Server state management and caching
- Automatic background refetching
- Optimistic updates
- Error boundary handling

## Styling Guide

### Tailwind CSS Classes
- **Primary Colors**: `primary-50` to `primary-900` (Blue theme)
- **Secondary Colors**: `secondary-50` to `secondary-900` (Green theme)
- **Accent Colors**: `accent-50` to `accent-900` (Yellow theme)

### Component Patterns
- All components use the `cn()` utility for conditional classes
- Consistent spacing with Tailwind's spacing scale
- Color-coded status indicators
- Hover states and transitions for interactive elements

## Development Guidelines

### Code Organization
- Use TypeScript for all components and utilities
- Follow React functional component patterns
- Implement proper error boundaries
- Use React Query for all server state
- Implement loading and error states

### Performance Optimization
- Lazy loading for route components
- Image optimization with Next.js Image component
- Bundle analysis and code splitting
- Efficient re-rendering with proper dependencies

## TODO - Additional Features to Implement

Based on the Laravel backend functionality, these features should be added:

1. **Order Management Pages**
   - PRF (Purchase Requisition) creation and management
   - PRO (Purchase Order) management
   - Approval workflow interface

2. **Inventory Management**
   - Stock transaction tracking
   - Inventory adjustment interfaces
   - Stock transfer management

3. **Customer Management**
   - Customer CRUD operations
   - Customer transaction history
   - Credit limit management

4. **Sales Channel Management**
   - Substore transaction entry (SST)
   - Lubebay service transaction entry (LST)
   - Channel-specific reporting

5. **Financial Management**
   - Account management interface
   - Lodgement processing
   - Payment tracking

6. **Reporting System**
   - Sales reports with export functionality
   - Inventory reports
   - Financial reports
   - Custom date range filtering

7. **Advanced Features**
   - Real-time notifications
   - Advanced search and filtering
   - Bulk operations
   - Data export (Excel/PDF)

## Backend API Requirements

For full functionality, ensure your Laravel backend provides these API endpoints:

```
Authentication:
- POST /api/auth/login
- POST /api/auth/logout
- GET /api/auth/user

Dashboard:
- GET /api/dashboard/stats
- GET /api/dashboard/sales-analytics

CRUD Operations:
- RESTful endpoints for all entities (customers, products, prfs, etc.)

Approval Workflows:
- POST /api/*/approve endpoints for approvable entities
- GET /api/approvals/pending

File Operations:
- POST /api/reports/export (Excel/PDF exports)
```

## Contributing

1. Follow the established code structure and patterns
2. Write TypeScript interfaces for all data structures
3. Implement proper error handling and loading states
4. Add comprehensive comments for complex logic
5. Test all API integrations thoroughly

## Deployment

For production deployment:

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Set production environment variables**:
   ```
   NEXT_PUBLIC_API_URL=https://your-api-domain.com/api
   ```

3. **Deploy to your preferred hosting platform** (Vercel, Netlify, etc.)

## Support

For issues and questions related to the frontend implementation, please check:
- The type definitions in `/src/types/`
- The API client implementation in `/src/lib/api.ts`
- Component documentation in individual files

This frontend provides a solid foundation for the MOFAD distribution management system and can be extended based on specific business requirements.