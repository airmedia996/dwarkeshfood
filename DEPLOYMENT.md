# Deployment Guide

## Quick Deploy

### Frontend (Vercel)
1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repo: `dwarkeshfood`
3. Add environment variables:
   - `VITE_API_BASE_URL` = `https://dwarkeshfood-api.onrender.com/api`
   - `VITE_SOCKET_URL` = `https://dwarkeshfood-api.onrender.com`
4. Deploy

### Backend (Render)
1. Go to [render.com](https://render.com)
2. Create new "Web Service"
3. Connect your GitHub repo, select `backend` folder
4. Add environment variables:
   - `DATABASE_URL` = your PostgreSQL connection string
   - `JWT_SECRET` = random secure string
   - `STRIPE_SECRET_KEY` = your Stripe key
   - `FRONTEND_URL` = your Vercel frontend URL
5. Deploy

### Database (Render PostgreSQL)
1. In Render, create new "PostgreSQL"
2. Copy the connection string to backend's `DATABASE_URL`

## Running Locally

```bash
# Backend
cd backend
cp .env.example .env
# Edit .env with your values
npm run dev

# Frontend
cd frontend
npm run dev
```

## Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d
STRIPE_SECRET_KEY=sk_...
FRONTEND_URL=http://localhost:5173
```

### Frontend
```
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```