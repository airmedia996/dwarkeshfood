# DWARKESH FOOD - Quick Start Guide

## ✅ What's Been Done

Your full-stack restaurant app is now ready with:

### Backend (Complete)
- ✅ Express.js server with TypeScript
- ✅ Prisma ORM with PostgreSQL schema
- ✅ Complete API routes for:
  - Authentication (JWT + bcrypt)
  - Menu management (CRUD operations)
  - Order creation and tracking
  - Payment processing (Stripe, Momo, Cash)
  - User profiles
  - Admin dashboard
- ✅ WebSocket support for real-time tracking
- ✅ Error handling and middleware
- ✅ All controllers and services

### Frontend (Complete)
- ✅ React 18 with TypeScript & Vite
- ✅ Redux Toolkit for state management
- ✅ Tailwind CSS with custom colors (Black, Coffee, Gold)
- ✅ Framer Motion for smooth animations
- ✅ All pages:
  - Home (hero + features)
  - Menu with category filtering
  - Cart with real-time calculations
  - Checkout with payment methods
  - Order history and tracking
  - User profile
  - Admin dashboard
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Shopping cart animations
- ✅ Menu card animations

---

## 🚀 Next Steps to Run the App

### 1. Setup PostgreSQL Database

```bash
# On Mac
brew install postgresql
brew services start postgresql

# On Windows
# Download from https://www.postgresql.org/download/windows/

# On Linux
sudo apt-get install postgresql postgresql-contrib
```

Create the database:
```bash
createdb dwarkesh_food
```

### 2. Backend Setup

```bash
cd backend

# Copy environment file
cp .env.example .env

# Edit .env and set:
DATABASE_URL="postgresql://postgres:password@localhost:5432/dwarkesh_food"
JWT_SECRET="your-super-secret-key-here"
# (Add other API keys as needed)

# Install dependencies
npm install

# Generate Prisma Client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Start backend server
npm run dev
```

Backend will run on: **http://localhost:5000**

### 3. Frontend Setup

```bash
cd frontend

# Copy environment file
cp .env.example .env

# Edit .env (usually fine as-is if backend is on localhost:5000)

# Install dependencies
npm install

# Start frontend dev server
npm run dev
```

Frontend will run on: **http://localhost:5173**

---

## 🔑 Test Credentials

After seeding the database, use these:

**Admin Account:**
```
Email: admin@dwarkesh.com
Password: admin123
```

**Customer Account:**
```
Email: customer@dwarkesh.com
Password: customer123
```

---

## 💳 Payment Testing

### Stripe
- Use test card: **4242 4242 4242 4242**
- Any future expiry date
- Any 3-digit CVC

### Momo
- Depends on your Momo provider
- Check your Momo API documentation

### Cash on Delivery
- No setup needed, just select the option at checkout

---

## 📝 Menu Items (Ready to Add)

All 15 items are ready:

**Snacks** (₹50-150)
- Kachori
- Mirchi vada
- Sev puri
- Dahi puri
- Pani puri
- Moong dal pakoda
- Samosa chat
- Papadi chat

**Main Course** (₹200-300)
- Chole batura
- Dal batti plate
- Mansukh Bhai (specialty)

**Desserts** (₹100-200)
- Dal ka halwa
- Jalebi
- Rabri
- Bhale puri

---

## 🎨 Design Details

- **Brand Colors:**
  - Primary: Black (#000000)
  - Secondary: Coffee Brown (#6F4E37)
  - Accent: Gold (#D4A574)

- **Animations:**
  - Food cards scale up on hover
  - Cart bounces when items added
  - Smooth page transitions
  - Real-time order status updates

---

## 🔧 Key Features Implemented

### For Customers
- ✅ Browse menu items
- ✅ Search and filter by category
- ✅ Add items to cart with quantity selector
- ✅ View cart with live totals
- ✅ Checkout with multiple payment methods
- ✅ Track orders in real-time
- ✅ View order history
- ✅ Rate and review orders

### For Admin
- ✅ View dashboard with KPIs
- ✅ Manage menu items
- ✅ View all orders
- ✅ Update order status
- ✅ Assign delivery personnel
- ✅ View customer list
- ✅ View analytics

---

## 📞 Contact Information

- **Phone**: 0571679999
- **WhatsApp**: 0571679999
- **Hours**: Mon-Sun 11:00 AM - 11:00 PM

---

## 🎯 Recommended Next Steps (Optional Enhancements)

1. **Add images to menu**: Integrate with Cloudinary for food photos
2. **Email notifications**: Add email service for order confirmations
3. **Push notifications**: Add mobile push notifications
4. **Multi-language support**: Add Hindi/English toggle
5. **Wishlist feature**: Save favorite items
6. **Loyalty points**: Implement rewards program
7. **Analytics**: Add charts and graphs for admin
8. **SMS alerts**: Send SMS for order status updates

---

## 🐛 Troubleshooting

**Port already in use?**
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

**Database connection error?**
- Check PostgreSQL is running: `psql --version`
- Verify DATABASE_URL in .env
- Ensure database exists: `createdb dwarkesh_food`

**CORS errors?**
- Backend CORS is already configured
- Check backend is running: http://localhost:5000/health

**Dependencies not installing?**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## 📚 Project Structure Quick Reference

```
Frontend:
- Components: Layout, MenuCard
- Pages: Home, Menu, Login, Register, Cart, Checkout, Orders, Profile
- Store: Redux slices for auth, cart, menu
- Services: API wrapper for backend calls

Backend:
- Controllers: Auth, Menu, Orders, Payments, Admin
- Routes: All CRUD endpoints
- Middleware: JWT auth, error handling
- Models: Prisma schema for database
```

---

## ✨ Once You're Running

1. Visit **http://localhost:5173** in your browser
2. Click "Sign Up" to create an account
3. Browse the menu
4. Add items to cart (watch the animations!)
5. Go to checkout
6. Place an order
7. Track your order in real-time
8. Log in as admin to see the dashboard

---

## 🎉 You're All Set!

The app is fully structured and ready to run. Just follow the setup steps above and you'll have a working restaurant ordering system!

Have questions? Check READMe or run the individual `npm run dev` commands.

Happy coding! 🚀
