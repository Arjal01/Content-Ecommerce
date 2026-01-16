# 🛍️ Content-Ecommerce Platform

A modern, full-stack content commerce platform built with Next.js 15, featuring affiliate marketing, subscription management, and comprehensive e-commerce capabilities.

Link:- https://hurricane-thumbs-easily-citations.trycloudflare.com


## ✨ Features

### 🎯 Core Functionality
- **Content Management** - Create and manage articles with embedded product recommendations
- **Company Profiles** - Vendor/company management with detailed profiles
- **Product Catalog** - Full product management with pricing, discounts, and affiliate links
- **Order Management** - Complete order processing with GST calculations and invoicing
- **Subscription System** - Recurring subscription plans with multiple billing cycles
- **Affiliate Tracking** - Click tracking and analytics for affiliate products

### 👥 User Roles
- **Admin** - Full platform control and analytics
- **Vendor** - Company/product management and payout tracking
- **User** - Browse content, purchase products, manage subscriptions

### 💳 Payment & Billing
- Razorpay integration for payments
- Automated GST calculation (CGST, SGST, IGST)
- Invoice generation with PDF support
- Refund management
- Vendor payout system with commission tracking

### 📊 Admin Dashboard
- Analytics and reporting
- Order management
- Subscription oversight
- Vendor payout processing
- Product and article moderation
- Full-text search capabilities

## 🚀 Tech Stack

### Frontend
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** Radix UI + shadcn/ui
- **State Management:** React Context API
- **Forms:** React Hook Form + Zod validation
- **Notifications:** Sonner (toast notifications)

### Backend
- **Runtime:** Node.js
- **Database:** PostgreSQL (via Supabase)
- **ORM:** Prisma
- **Authentication:** JWT (JSON Web Tokens)
- **Password Hashing:** bcryptjs
- **Payment Gateway:** Razorpay

### Development Tools
- **Package Manager:** npm
- **Linting:** ESLint
- **Code Formatting:** Prettier (implicit via ESLint)
- **Type Checking:** TypeScript

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js 18+ and npm
- PostgreSQL database (or Supabase account)
- Razorpay account (for payment processing)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Arjal01/Content-Ecommerce.git
   cd Content-Ecommerce
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   # Database
   DATABASE_URL="postgresql://user:password@host:5432/database"
   
   # Supabase (if using)
   SUPABASE_URL="your_supabase_url"
   SUPABASE_ANON_KEY="your_supabase_anon_key"
   SUPABASE_SERVICE_ROLE_KEY="your_service_role_key"
   
   # Authentication
   JWT_SECRET="your-super-secret-jwt-key"
   
   # Razorpay
   RAZORPAY_KEY_ID="your_razorpay_key_id"
   RAZORPAY_KEY_SECRET="your_razorpay_key_secret"
   
   # Application
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   
   # Business Details
   SELLER_GSTIN="your_gstin_number"
   SELLER_STATE="your_state"
   PLATFORM_COMMISSION_RATE="10"
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma Client
   npx prisma generate
   
   # Run migrations
   npx prisma migrate dev
   
   # (Optional) Seed the database
   npx prisma db seed
   ```

5. **Create admin user**
   ```bash
   npx tsx scripts/create-admin.ts
   ```
   
   Default admin credentials:
   - Email: `admin@promohub.com`
   - Password: `admin123`

6. **Start the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
content-commerce/
├── prisma/
│   └── schema.prisma          # Database schema
├── public/                     # Static assets
├── scripts/
│   └── create-admin.ts        # Admin user creation script
├── src/
│   ├── app/
│   │   ├── (public)/          # Public-facing pages
│   │   │   ├── articles/      # Article listing and detail pages
│   │   │   ├── companies/     # Company profiles
│   │   │   ├── orders/        # User order history
│   │   │   ├── search/        # Search functionality
│   │   │   ├── login/         # Authentication pages
│   │   │   └── register/
│   │   ├── admin/             # Admin dashboard
│   │   │   ├── analytics/     # Analytics and reports
│   │   │   ├── articles/      # Article management
│   │   │   ├── companies/     # Company management
│   │   │   ├── orders/        # Order management
│   │   │   ├── payouts/       # Vendor payouts
│   │   │   ├── products/      # Product management
│   │   │   └── subscriptions/ # Subscription management
│   │   └── api/               # API routes
│   │       ├── admin/         # Admin API endpoints
│   │       ├── auth/          # Authentication endpoints
│   │       ├── checkout/      # Checkout and payment
│   │       ├── content/       # Content API
│   │       ├── orders/        # Order API
│   │       ├── subscriptions/ # Subscription API
│   │       ├── tracking/      # Analytics tracking
│   │       └── webhooks/      # Payment webhooks
│   ├── components/
│   │   ├── ui/                # Reusable UI components
│   │   ├── navbar.tsx         # Navigation component
│   │   ├── footer.tsx         # Footer component
│   │   └── protected-route.tsx # Route protection
│   ├── lib/
│   │   ├── api.ts             # API client utilities
│   │   ├── api-utils.ts       # API helper functions
│   │   ├── auth.ts            # Authentication utilities
│   │   ├── auth-context.tsx   # Auth context provider
│   │   ├── db.ts              # Database client
│   │   └── utils.ts           # General utilities
│   ├── repositories/          # Data access layer
│   │   ├── ArticleRepository.ts
│   │   ├── CompanyRepository.ts
│   │   ├── OrderRepository.ts
│   │   ├── ProductRepository.ts
│   │   └── UserRepository.ts
│   └── services/              # Business logic layer
│       ├── AdminService.ts
│       ├── AuthService.ts
│       ├── ContentService.ts
│       ├── RazorpayService.ts
│       ├── TrackingService.ts
│       ├── gst.service.ts
│       ├── invoice.service.ts
│       ├── order.service.ts
│       ├── payout.service.ts
│       ├── refund.service.ts
│       ├── search.service.ts
│       └── subscription.service.ts
├── .env                       # Environment variables
├── .gitignore
├── next.config.ts             # Next.js configuration
├── package.json
├── tailwind.config.ts         # Tailwind CSS configuration
└── tsconfig.json              # TypeScript configuration
```

## 🔐 Authentication

The platform uses JWT-based authentication with three user roles:

- **ADMIN** - Full platform access
- **VENDOR** - Company and product management
- **USER** - Standard user access

### Protected Routes

- `/admin/*` - Admin only
- `/orders` - Authenticated users only
- Public routes accessible to all

## 💾 Database Schema

Key models include:

- **User** - User accounts with role-based access
- **Company** - Vendor/company profiles
- **Article** - Content articles with product recommendations
- **Product** - Product catalog with pricing and affiliate links
- **Order** - Order management with items and payments
- **Payment** - Payment tracking with Razorpay integration
- **Subscription** - Recurring subscription management
- **Invoice** - GST-compliant invoice generation
- **Payout** - Vendor payout tracking
- **Refund** - Refund management

## 🎨 UI Components

Built with shadcn/ui and Radix UI primitives:

- Forms, inputs, and validation
- Data tables and pagination
- Dialogs and modals
- Toast notifications
- Charts and analytics visualizations
- Responsive navigation
- Loading states and skeletons

## 📱 API Endpoints

### Public APIs
- `GET /api/content/feed` - Get article feed
- `GET /api/content/articles/:id` - Get article details
- `GET /api/content/companies` - List companies
- `GET /api/search` - Full-text search

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Admin APIs (Protected)
- `GET /api/admin/analytics` - Platform analytics
- `CRUD /api/admin/articles` - Article management
- `CRUD /api/admin/companies` - Company management
- `CRUD /api/admin/products` - Product management
- `GET /api/admin/orders` - Order management
- `POST /api/admin/refunds` - Process refunds
- `GET /api/admin/payouts` - Vendor payouts

### User APIs (Protected)
- `GET /api/orders` - User order history
- `POST /api/checkout` - Create order
- `GET /api/subscriptions` - User subscriptions

## 🧪 Development

### Running in Development Mode
```bash
npm run dev
```

### Building for Production
```bash
npm run build
npm start
```

### Database Management
```bash
# Open Prisma Studio
npx prisma studio

# Create a new migration
npx prisma migrate dev --name migration_name

# Reset database (caution!)
npx prisma migrate reset
```

### Linting
```bash
npm run lint
```

## 🚢 Deployment

### Environment Setup
1. Set up production database (PostgreSQL)
2. Configure environment variables
3. Set up Razorpay webhook endpoints
4. Configure domain and SSL

### Recommended Platforms
- **Vercel** - Optimal for Next.js applications
- **Railway** - Full-stack deployment
- **AWS/GCP/Azure** - Enterprise deployments

### Build Command
```bash
npm run build
```

### Start Command
```bash
npm start
```

## 🔧 Configuration

### Razorpay Setup
1. Create a Razorpay account
2. Get API keys from dashboard
3. Set up webhook for payment confirmations
4. Configure webhook URL: `https://yourdomain.com/api/webhooks/razorpay`

### GST Configuration
Update `.env` with your business details:
```env
SELLER_GSTIN="your_gstin"
SELLER_STATE="your_state"
PLATFORM_COMMISSION_RATE="10"
```

## 📝 Recent Fixes

### Authentication Issues ✅
- Fixed duplicate `useAuth` hooks causing authentication loops
- Updated all admin pages to use correct auth context
- Resolved login persistence issues

### Product Creation ✅
- Fixed missing `companyId` error
- Implemented automatic company assignment
- Corrected Prisma input structure

See [walkthrough.md](file:///C:/Users/Shiva/.gemini/antigravity/brain/3d5560f1-5e5c-44af-991e-a6949000858a/walkthrough.md) for detailed fix documentation.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Prisma](https://www.prisma.io/) - Database ORM
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Radix UI](https://www.radix-ui.com/) - Headless UI primitives
- [Razorpay](https://razorpay.com/) - Payment gateway
- [Supabase](https://supabase.com/) - Database hosting

## 📧 Support

For support, email support@promohub.com or open an issue in the GitHub repository.

---

**Built with ❤️ using Next.js and TypeScript**
