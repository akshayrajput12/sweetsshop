# BukBox Project Structure

## Overview

This document outlines the complete project structure for the BukBox bulk shopping e-commerce platform.

## Root Directory Structure

```
bukbox/
├── .env                          # Environment variables (create from .env.example)
├── .env.example                  # Environment variables template
├── setup.js                     # Automated setup script
├── BUKBOX_SETUP_GUIDE.md        # Complete setup guide
├── PROJECT_STRUCTURE.md         # This file
├── package.json                 # Node.js dependencies and scripts
├── index.html                   # Main HTML entry point
├── vite.config.ts               # Vite configuration
├── tailwind.config.js           # Tailwind CSS configuration
├── tsconfig.json                # TypeScript configuration
├── 
├── src/                         # Source code directory
│   ├── components/              # Reusable React components
│   │   ├── ui/                  # UI component library
│   │   ├── Footer.tsx           # Site footer component
│   │   ├── Header.tsx           # Site header component
│   │   └── ProductCard.tsx      # Product display component
│   │
│   ├── pages/                   # Page components
│   │   ├── admin/               # Admin panel pages
│   │   │   ├── AdminLayout.tsx  # Admin layout wrapper
│   │   │   ├── Analytics.tsx    # Analytics dashboard
│   │   │   ├── Categories.tsx   # Category management
│   │   │   ├── CategoryForm.tsx # Category add/edit form
│   │   │   ├── Customers.tsx    # Customer management
│   │   │   ├── Dashboard.tsx    # Admin dashboard
│   │   │   ├── Orders.tsx       # Order management
│   │   │   ├── OrderDetail.tsx  # Order detail view
│   │   │   ├── Products.tsx     # Product management
│   │   │   ├── ProductForm.tsx  # Product add/edit form
│   │   │   ├── Coupons.tsx      # Coupon management
│   │   │   ├── CouponForm.tsx   # Coupon add/edit form
│   │   │   └── Settings.tsx     # Admin settings
│   │   │
│   │   ├── Checkout.tsx         # Checkout process
│   │   ├── OrderDetail.tsx      # Customer order detail
│   │   ├── ProductDetail.tsx    # Product detail page
│   │   ├── Products.tsx         # Product listing page
│   │   └── Profile.tsx          # User profile page
│   │
│   ├── store/                   # State management
│   │   └── useStore.ts          # Zustand store
│   │
│   ├── utils/                   # Utility functions
│   │   ├── currency.ts          # Currency formatting
│   │   └── razorpay.ts          # Razorpay integration
│   │
│   ├── integrations/            # External integrations
│   │   └── supabase/            # Supabase integration
│   │       └── client.ts        # Supabase client setup
│   │
│   ├── hooks/                   # Custom React hooks
│   │   └── use-toast.ts         # Toast notification hook
│   │
│   └── main.tsx                 # React application entry point
│
├── supabase/                    # Supabase configuration
│   ├── .env                     # Supabase environment variables
│   ├── .env.example             # Supabase environment template
│   ├── config.toml              # Supabase configuration
│   │
│   ├── functions/               # Edge Functions
│   │   ├── create-razorpay-order/
│   │   │   └── index.ts         # Create Razorpay order function
│   │   └── verify-razorpay-payment/
│   │       └── index.ts         # Verify Razorpay payment function
│   │
│   └── migrations/              # Database migrations
│       └── 20250208000000_bukbox_complete_migration.sql
│
├── public/                      # Static assets
│   ├── favicon.ico              # Site favicon
│   └── placeholder.svg          # Placeholder images
│
└── documentation/               # Project documentation
    ├── ADMIN_ENHANCEMENTS.md
    ├── ADDRESS_MANAGEMENT.md
    ├── CHECKOUT_FLOW.md
    ├── CLIENT_SIDE_RAZORPAY.md
    ├── DATABASE_SCHEMA.md
    ├── ORDER_MANAGEMENT_FIXES.md
    ├── PRODUCT_DETAIL_PAGE_ENHANCEMENT.md
    ├── PRODUCT_FILTERING_AND_CUSTOMER_DATA_FIXES.md
    ├── PRODUCT_FORM_ENHANCEMENTS.md
    ├── RAZORPAY_INTEGRATION.md
    └── USER_ORDER_MANAGEMENT_FIXES.md
```

## Key Directories Explained

### `/src/components/`
Contains reusable React components:
- **ui/**: Shadcn/ui component library components
- **ProductCard.tsx**: Displays product information in grid/list views
- **Header.tsx**: Site navigation and branding
- **Footer.tsx**: Site footer with links and information

### `/src/pages/`
Contains all page components:
- **admin/**: Complete admin panel for managing the platform
- **Checkout.tsx**: Multi-step checkout process with payment
- **ProductDetail.tsx**: Detailed product view with specifications
- **Products.tsx**: Product listing with filtering and search
- **Profile.tsx**: User profile and order history

### `/src/pages/admin/`
Complete admin panel with:
- **Dashboard.tsx**: Overview of key metrics
- **Products.tsx**: Product management with CRUD operations
- **ProductForm.tsx**: Enhanced product add/edit form
- **Orders.tsx**: Order management and processing
- **Analytics.tsx**: Sales and performance analytics
- **Customers.tsx**: Customer management
- **Categories.tsx**: Product category management
- **Coupons.tsx**: Discount and coupon management

### `/src/utils/`
Utility functions:
- **currency.ts**: Currency formatting and calculations
- **razorpay.ts**: Razorpay payment integration helpers

### `/supabase/`
Supabase configuration and functions:
- **migrations/**: Database schema and data migrations
- **functions/**: Edge Functions for server-side operations
- **.env**: Server-side environment variables

## Database Schema

### Core Tables

1. **profiles** - User profiles and admin management
2. **categories** - Product categories for organization
3. **products** - Product catalog with enhanced features
4. **product_features** - Dynamic feature management system
5. **orders** - Order management with payment integration
6. **addresses** - User address management
7. **coupons** - Discount and coupon system
8. **reviews** - Product review and rating system

### Storage Buckets

1. **product-images** - Product photos and galleries
2. **category-images** - Category banner images
3. **coupon-images** - Coupon graphics and banners

## Configuration Files

### Environment Configuration
- **.env** - Client-side environment variables
- **supabase/.env** - Server-side environment variables
- **.env.example** - Template for client environment
- **supabase/.env.example** - Template for server environment

### Build Configuration
- **vite.config.ts** - Vite build configuration
- **tailwind.config.js** - Tailwind CSS configuration
- **tsconfig.json** - TypeScript configuration
- **package.json** - Dependencies and scripts

### Supabase Configuration
- **supabase/config.toml** - Supabase project configuration

## Key Features by Directory

### Frontend Features (`/src/`)
- ✅ **Responsive Design**: Mobile-first responsive layout
- ✅ **Product Catalog**: Advanced product browsing and filtering
- ✅ **Shopping Cart**: Full shopping cart functionality
- ✅ **Checkout Process**: Multi-step checkout with payment
- ✅ **User Authentication**: Secure user registration and login
- ✅ **Order Management**: Order tracking and history
- ✅ **Admin Panel**: Comprehensive admin management

### Backend Features (`/supabase/`)
- ✅ **Database Management**: Complete PostgreSQL schema
- ✅ **Authentication**: Supabase Auth integration
- ✅ **File Storage**: Organized image storage system
- ✅ **Edge Functions**: Server-side payment processing
- ✅ **Row Level Security**: Secure data access policies
- ✅ **Real-time Updates**: Live data synchronization

### Admin Features (`/src/pages/admin/`)
- ✅ **Product Management**: CRUD operations for products
- ✅ **Order Processing**: Order status management
- ✅ **Customer Management**: Customer information and history
- ✅ **Analytics Dashboard**: Sales and performance metrics
- ✅ **Category Management**: Product categorization
- ✅ **Coupon Management**: Discount code creation and management

## Development Workflow

### 1. Initial Setup
```bash
# Install dependencies
npm install

# Run setup script
node setup.js

# Configure environment variables
# Edit .env and supabase/.env files
```

### 2. Database Setup
```bash
# Run migration in Supabase SQL Editor
# Copy content from supabase/migrations/20250208000000_bukbox_complete_migration.sql
```

### 3. Development
```bash
# Start development server
npm run dev

# Deploy Edge Functions (optional)
supabase functions deploy create-razorpay-order
supabase functions deploy verify-razorpay-payment
```

### 4. Production Deployment
```bash
# Build for production
npm run build

# Deploy to hosting provider
# Update environment variables for production
```

## File Naming Conventions

### Components
- **PascalCase** for component files: `ProductCard.tsx`
- **camelCase** for utility files: `currency.ts`
- **kebab-case** for configuration files: `vite.config.ts`

### Database
- **snake_case** for table names: `product_features`
- **snake_case** for column names: `created_at`
- **SCREAMING_SNAKE_CASE** for constants: `VITE_SUPABASE_URL`

### Documentation
- **SCREAMING_SNAKE_CASE** for main docs: `SETUP_GUIDE.md`
- **PascalCase** for feature docs: `ProductEnhancements.md`

## Dependencies Overview

### Core Dependencies
- **React 18**: Frontend framework
- **TypeScript**: Type safety
- **Vite**: Build tool and dev server
- **Tailwind CSS**: Styling framework
- **Supabase**: Backend as a service

### UI Dependencies
- **Shadcn/ui**: Component library
- **Lucide React**: Icon library
- **Framer Motion**: Animations
- **React Router**: Client-side routing

### Integration Dependencies
- **Zustand**: State management
- **React Hook Form**: Form handling
- **Date-fns**: Date manipulation
- **Razorpay**: Payment processing

## Security Considerations

### Environment Variables
- ✅ Client-side variables prefixed with `VITE_`
- ✅ Server-side secrets in `supabase/.env`
- ✅ No sensitive data in client-side code
- ✅ Separate development and production configs

### Database Security
- ✅ Row Level Security (RLS) enabled
- ✅ Proper authentication policies
- ✅ Admin-only access for sensitive operations
- ✅ Secure file upload policies

### Payment Security
- ✅ Server-side payment verification
- ✅ Secure webhook handling
- ✅ No payment secrets in client code
- ✅ PCI DSS compliant integration

## Maintenance and Updates

### Regular Tasks
1. **Update Dependencies**: Keep packages up to date
2. **Monitor Performance**: Check Core Web Vitals
3. **Security Audits**: Regular security reviews
4. **Database Maintenance**: Optimize queries and indexes
5. **Backup Management**: Regular database backups

### Scaling Considerations
1. **Database Optimization**: Index optimization for large datasets
2. **Image Optimization**: CDN integration for images
3. **Caching Strategy**: Implement caching for better performance
4. **Load Balancing**: Consider load balancing for high traffic
5. **Monitoring**: Implement comprehensive monitoring

This project structure provides a solid foundation for a scalable bulk shopping e-commerce platform with comprehensive admin capabilities and secure payment processing.