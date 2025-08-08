# BulkBox - Bulk Shopping E-commerce Platform

![BulkBox Logo](https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200)

**BulkBox** is a comprehensive bulk shopping e-commerce platform designed for businesses, restaurants, and bulk buyers. Shop everything in bulk at wholesale prices with advanced features like real-time inventory management, dynamic pricing, and seamless payment integration.

## 🚀 Features

### 🛒 **Customer Features**
- **Bulk Product Catalog**: Browse groceries, electronics, home essentials, and office supplies
- **Smart Checkout**: Multi-step checkout with address management and GPS-based pincode detection
- **Payment Options**: Razorpay integration with UPI, Cards, Net Banking, and Cash on Delivery
- **Order Management**: Track orders, view history, and manage delivery addresses
- **Dynamic Coupons**: Product-specific and general coupons with automatic validation
- **Responsive Design**: Mobile-first design with smooth animations

### 🎛️ **Admin Features**
- **Real-time Dashboard**: Live sales analytics, revenue tracking, and performance metrics
- **Product Management**: Dynamic product features, inventory tracking, and bulk operations
- **Order Management**: Complete order lifecycle management with status updates
- **Customer Management**: User profiles, order history, and customer analytics
- **Settings Management**: Dynamic business configuration (pricing, delivery, payments)
- **Coupon Management**: Create and manage product-specific and general coupons

### 🔧 **Technical Features**
- **Database-Driven Configuration**: All pricing, fees, and business rules configurable via admin panel
- **Automatic Inventory Management**: Real-time stock updates and sales tracking
- **Row Level Security**: Secure data access with Supabase RLS policies
- **Real-time Updates**: Live data synchronization across all components
- **SEO Optimized**: Complete meta tags, structured data, and search optimization

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **Payments**: Razorpay (UPI, Cards, Net Banking, Wallets)
- **Maps**: Google Maps API for location services
- **State Management**: Zustand
- **UI Components**: Radix UI, Shadcn/ui
- **Build Tool**: Vite
- **Deployment**: Vercel

## 📦 Quick Setup

### 1. Clone & Install
```bash
git clone <your-repo>
cd bulkbox
npm install
```

### 2. Environment Configuration
Create `.env` file with your credentials:

```env
# Supabase Configuration (REQUIRED)
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google Maps API Configuration (REQUIRED)
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Razorpay Configuration (REQUIRED)
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id

# Application Configuration
VITE_APP_NAME=BulkBox
VITE_APP_URL=http://localhost:8080
```

### 3. Supabase Edge Functions Configuration
Update `supabase/.env`:

```env
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

### 4. Database Setup
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and run the complete migration:
   ```sql
   -- Copy entire content from:
   -- supabase/migrations/20250208000000_bulkbox_complete_migration.sql
   ```
4. If you have an existing database, also run the additional migration:
   ```sql
   -- Copy entire content from:
   -- supabase/migrations/20250208000002_add_cod_fee_column.sql
   ```

### 5. Start Development
```bash
npm run dev
```

## 🗄️ Database Schema

### Core Tables
- **`profiles`**: User accounts and admin roles
- **`categories`**: Product categories with images
- **`products`**: Complete product catalog with features and inventory
- **`orders`**: Order management with payment and delivery tracking
- **`coupons`**: Discount codes and promotions
- **`addresses`**: User delivery addresses with GPS coordinates
- **`settings`**: Dynamic business configuration
- **`product_sales`**: Automatic sales tracking and analytics

### Key Features
- **Automatic Sales Tracking**: Database triggers track sales and update inventory
- **Row Level Security**: Secure data access with user-based policies
- **Dynamic Settings**: All business rules configurable via admin panel
- **Real-time Updates**: Live data synchronization

## 💳 Payment Integration

### Razorpay Features
- **Multiple Payment Methods**: UPI, Cards, Net Banking, Wallets
- **Secure Processing**: Client-side integration with server verification
- **Order Management**: Automatic order creation and status updates
- **Receipt Generation**: Unique receipt IDs for all transactions

### Cash on Delivery
- **Configurable Limits**: Admin-set maximum COD amount
- **Dynamic Fees**: Configurable COD charges
- **Order Validation**: Automatic COD availability checks

## 🎯 Admin Panel

### Dashboard Analytics
- **Real-time Metrics**: Sales, revenue, orders, customers
- **Performance Charts**: Daily, weekly, monthly analytics
- **Top Products**: Best-selling items and categories
- **Customer Insights**: User behavior and order patterns

### Business Configuration
- **Pricing Settings**: Tax rates, delivery charges, bulk discounts
- **Payment Methods**: Enable/disable payment options
- **Operational Settings**: Business hours, processing times
- **SEO Settings**: Meta tags, site information

## 🚚 Order Management

### Customer Flow
1. **Product Selection**: Browse and add items to cart
2. **Checkout Process**: Multi-step checkout with validation
3. **Address Management**: Save and reuse delivery addresses
4. **Payment Processing**: Secure payment with multiple options
5. **Order Tracking**: Real-time status updates

### Admin Management
- **Order Processing**: Update status, manage delivery
- **Customer Communication**: Order notifications and updates
- **Inventory Updates**: Automatic stock management
- **Sales Analytics**: Revenue tracking and reporting

## 🔐 Security Features

- **Authentication**: Supabase Auth with email/password
- **Authorization**: Role-based access control (Admin/User)
- **Data Security**: Row Level Security policies
- **Payment Security**: Razorpay secure payment processing
- **Input Validation**: Comprehensive form validation
- **HTTPS**: Secure data transmission

## 📱 Responsive Design

- **Mobile-First**: Optimized for mobile devices
- **Progressive Web App**: PWA capabilities
- **Touch-Friendly**: Optimized touch interactions
- **Fast Loading**: Optimized images and lazy loading
- **Smooth Animations**: Framer Motion animations

## 🌐 SEO & Performance

### SEO Features
- **Meta Tags**: Complete Open Graph and Twitter cards
- **Structured Data**: Rich snippets for products
- **Sitemap**: Automatic sitemap generation
- **Canonical URLs**: Proper URL canonicalization

### Performance
- **Code Splitting**: Lazy loading of components
- **Image Optimization**: WebP images with fallbacks
- **Caching**: Browser and CDN caching strategies
- **Bundle Optimization**: Tree shaking and minification

## 🔧 Development

### Project Structure
```
src/
├── components/          # Reusable UI components
├── pages/              # Page components
│   ├── admin/          # Admin panel pages
│   └── ...             # Customer pages
├── contexts/           # React contexts
├── hooks/              # Custom hooks
├── store/              # State management
├── utils/              # Utility functions
└── integrations/       # Third-party integrations

supabase/
├── migrations/         # Database migrations
└── functions/          # Edge functions
```

### Key Commands
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

## 🚀 Deployment

### Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Environment Variables
Ensure all required environment variables are set in your deployment platform:
- Supabase credentials
- Google Maps API key
- Razorpay keys
- Application configuration

## 📊 Analytics & Monitoring

### Built-in Analytics
- **Sales Tracking**: Automatic revenue and sales analytics
- **Customer Insights**: User behavior and preferences
- **Product Performance**: Best-selling items and categories
- **Order Analytics**: Conversion rates and order values

### Monitoring
- **Error Tracking**: Client-side error monitoring
- **Performance Monitoring**: Core Web Vitals tracking
- **Database Monitoring**: Supabase built-in monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is proprietary software for BulkBox bulk shopping platform.

## 🆘 Support

For support and questions:
- **Email**: support@bulkbox.com
- **Phone**: +91 98765 43210
- **Address**: Mumbai, Maharashtra, India

---

**Ready to start bulk shopping with BulkBox!** 🎉

Built with ❤️ for bulk buyers, businesses, and entrepreneurs.