# DWARKESH FOOD - Full Stack Restaurant App

A modern, full-stack restaurant ordering application featuring authentication, shopping cart, live order tracking, and payment integration.

## Features

- ✅ **User Authentication**: Register, login with JWT tokens
- ✅ **Menu System**: Browse menu items by category with search
- ✅ **Shopping Cart**: Add/remove items with live price calculations
- ✅ **Animated Cards**: Smooth animations when adding to cart
- ✅ **Multiple Payment Methods**: Stripe, Momo, Cash on Delivery
- ✅ **Order Management**: Create, track, and manage orders
- ✅ **Real-time Order Tracking**: WebSocket support for live updates
- ✅ **Admin Dashboard**: View sales, orders, customers, and analytics
- ✅ **Responsive Design**: Works on mobile, tablet, and desktop
- ✅ **Modern UI**: Black coffee theme with gold accents

## Project Structure

```
dwarkeshfood/
├── frontend/          # React + TypeScript + Tailwind UI
├── backend/           # Node.js + Express + Prisma API
└── README.md
```

## Tech Stack

### Frontend
- React 18
- TypeScript
- Redux Toolkit (State Management)
- Tailwind CSS (Styling)
- Framer Motion (Animations)
- Axios (HTTP Client)
- Vite (Build Tool)

### Backend
- Node.js
- Express.js
- TypeScript
- Prisma (ORM)
- PostgreSQL (Database)
- JWT Authentication
- Socket.io (Real-time)
- Stripe & Momo (Payment)

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 13+
- npm or yarn

### Frontend Setup

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Frontend will run on `http://localhost:5173`

### Backend Setup

```bash
cd backend
cp .env.example .env.local

# Setup database
export DATABASE_URL="postgresql://user:password@localhost:5432/dwarkesh_food"

# Install dependencies
npm install

# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed database (optional)
npm run prisma:seed

# Start development server
npm run dev
```

Backend will run on `http://localhost:5000`

## Environment Variables

### Frontend (.env)
```
VITE_API_BASE_URL=http://localhost:5000/api
VITE_STRIPE_PUBLIC_KEY=pk_test_YOUR_KEY
VITE_SOCKET_URL=http://localhost:5000
```

### Backend (.env)
```
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/dwarkesh_food
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=15m
REFRESH_TOKEN_EXPIRE=7d

STRIPE_SECRET_KEY=sk_test_YOUR_KEY
STRIPE_PUBLIC_KEY=pk_test_YOUR_KEY
MOMO_API_KEY=your_momo_key

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

RESTAURANT_PHONE=0571679999
RESTAURANT_WHATSAPP=0571679999
```

## Database Setup

1. Create PostgreSQL database:
```bash
createdb dwarkesh_food
```

2. Run migrations:
```bash
cd backend
npm run prisma:migrate
```

## API Documentation

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### Menu
- `GET /api/menu` - Get all menu items
- `GET /api/menu/:id` - Get single item
- `POST /api/menu` - Create item (admin)
- `PUT /api/menu/:id` - Update item (admin)
- `DELETE /api/menu/:id` - Delete item (admin)

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id/cancel` - Cancel order
- `GET /api/orders/:id/tracking` - Track order

### Payments
- `POST /api/payments/stripe/intent` - Create stripe intent
- `POST /api/payments/stripe/confirm` - Confirm payment
- `POST /api/payments/momo/request` - Initiate momo payment
- `POST /api/payments/cash/confirm` - Confirm cash payment

### Admin
- `GET /api/admin/dashboard` - Dashboard stats
- `GET /api/admin/orders` - Get all orders
- `PUT /api/admin/orders/:id/status` - Update order status
- `GET /api/admin/users` - Get all users
- `POST /api/admin/deliveries/assign` - Assign delivery

## Menu Items

The app includes these Indian food items:
- **Snacks**: Kachori, Mirchi vada, Sev puri, Dahi puri, Pani puri, Moong dal pakoda, Samosa chat, Papadi chat
- **Main Course**: Chole batura, Dal batti plate, Mansukh Bhai
- **Desserts**: Dal ka halwa, Jalebi, Rabri, Bhale puri

## Testing

### Test User Credentials
```
Admin:
Email: admin@dwarkesh.com
Password: admin123

Customer:
Email: customer@dwarkesh.com
Password: customer123
```

### Payment Testing
- **Stripe**: Use test card `4242 4242 4242 4242`
- **Momo**: Use test accounts provided by Momo
- **Cash**: Select cash on delivery option

## Contact

- Phone: **0571679999**
- WhatsApp: **0571679999**
- Hours: Monday - Sunday, 11:00 AM - 11:00 PM

## License

MIT License - Feel free to use this project for learning or commercial purposes.

## Next Steps

1. Setup PostgreSQL database
2. Install dependencies for both frontend and backend
3. Configure environment variables
4. Run database migrations
5. Start both frontend and backend servers
6. Visit http://localhost:5173 to use the app

---

**Built with ❤️ for authentic Indian food lovers**
