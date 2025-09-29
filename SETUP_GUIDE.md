# 🚀 FinanceHub Setup Guide

Welcome to your new multi-user personal finance dashboard! Follow this guide to complete the setup.

## 📋 Prerequisites

You mentioned you have:

- ✅ Clerk account
- ✅ Neon database (or need to create one)
- ✅ Free email service (we'll use Resend)

## 🔐 Step 1: Configure Clerk Authentication

1. **Go to your Clerk Dashboard**: https://dashboard.clerk.com
2. **Get your API keys** from your application settings:

   - Publishable Key (starts with `pk_test_` or `pk_live_`)
   - Secret Key (starts with `sk_test_` or `sk_live_`)

3. **Update your `.env.local` file** with your Clerk keys:

```bash
# Replace these with your actual Clerk keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
CLERK_SECRET_KEY=sk_test_your_secret_key_here

# These are already configured
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

4. **Configure Clerk settings** in your dashboard:
   - Go to "User & Authentication" → "Email, Phone, Username"
   - Enable "Email address" as a sign-in method
   - Optionally enable social logins (Google, GitHub, etc.)

## 🐘 Step 2: Set Up Neon PostgreSQL Database

### If you don't have a Neon account:

1. Go to https://neon.tech and sign up
2. Create a new project
3. Select a region close to you

### If you have a Neon account:

1. Create a new database or use existing one
2. Go to your project dashboard
3. Copy the connection string from "Connection Details"

### Update your database configuration:

```bash
# Add to .env.local - replace with your actual Neon connection string
DATABASE_URL="postgresql://username:password@hostname/dbname?sslmode=require"
DIRECT_URL="postgresql://username:password@hostname/dbname?sslmode=require"
```

## 📧 Step 3: Set Up Email Notifications (Resend)

1. **Sign up for Resend**: https://resend.com (free tier includes 3,000 emails/month)
2. **Create an API key** in your Resend dashboard
3. **Add to `.env.local`**:

```bash
RESEND_API_KEY=re_your_api_key_here
```

## � Step 4: Install Dependencies

First, make sure you have pnpm installed globally:

```bash
npm install -g pnpm
```

Then install all project dependencies:

```bash
pnpm install
```

## �🗄️ Step 5: Initialize the Database

Run these commands to set up your database:

```bash
# Generate Prisma client
pnpm prisma generate

# Push the schema to your database
pnpm prisma db push

# Optional: Seed with sample data
pnpm prisma db seed
```

## 🔄 Step 6: Restart the Application

```bash
# Restart Next.js to pick up environment changes
sudo supervisorctl restart nextjs
```

## ✅ Step 7: Test Your Setup

1. **Visit your app**: http://localhost:3000
2. **Click "Get Started"** to test sign-up
3. **Create an account** and verify email functionality
4. **Access the dashboard** after signing up

## 🎯 What You'll Have After Setup

### ✅ **Authentication Features**:

- User registration and login
- Secure session management
- User profiles with Clerk
- Multi-user support (each user has isolated data)

### ✅ **Database Features**:

- PostgreSQL with Prisma ORM
- User-specific accounts, categories, transactions
- Budget tracking with email notifications
- Data relationships and constraints

### ✅ **Dashboard Features**:

- Personal finance analytics
- Transaction management
- Budget tracking
- Data import/export
- Responsive design

## 🛠️ Next Development Phases

After basic setup is complete, we can implement:

### Phase 2: Enhanced UI Components

- Sidebar navigation with dark mode
- Separate routes for transactions, accounts, categories
- Advanced filtering and search

### Phase 3: Advanced Features

- Monthly budget tracking with notifications
- Enhanced charts and analytics
- Default account functionality
- Chart filters (daily, weekly, monthly, yearly)

### Phase 4: Final Polish

- Email budget notifications
- Mobile responsiveness
- Performance optimizations

## 🆘 Troubleshooting

### Authentication Issues:

- Verify Clerk keys are correct in `.env.local`
- Check Clerk dashboard for allowed domains
- Ensure middleware.ts is working

### Database Issues:

- Verify DATABASE_URL connection string
- Check Neon dashboard for connection limits
- Run `pnpm prisma db push` to sync schema

### Email Issues:

- Verify Resend API key
- Check Resend dashboard for sending limits
- Test with a simple email first

## 🔧 Environment File Template

Here's your complete `.env.local` template:

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
CLERK_SECRET_KEY=sk_test_your_key_here
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Neon Database
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"
DIRECT_URL="postgresql://user:pass@host/db?sslmode=require"

# Resend Email
RESEND_API_KEY=re_your_api_key_here

# Application
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

---

**Ready to set up?** Follow these steps and let me know when you've completed the configuration. I'll then continue with Phase 2 development!

**Questions?** Feel free to ask if you need help with any of these steps.
