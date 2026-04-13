# MangalyamMatch: Premium Matrimonial Platform 🚀

A high-performance, premium matrimonial platform featuring real-time chat, matchmaking, and a stunning Instagram-style UI.

## 🛠️ Production Tech Stack
- **Frontend**: React (Vite), Vercel
- **Backend**: Node.js (Express), Render
- **Database**: PostgreSQL (via Prisma ORM)
- **Media**: Cloudinary (Persistent storage)
- **Payments**: Razorpay Integration Ready

## 🚀 Deployment Checklist

### 1. Backend & Database (Render)
1.  **Database**: Click **"New +"** -> **"PostgreSQL"** and create your database. Copy the **Internal Database URL**.
2.  **Web Service**: Click **"New +"** -> **"Web Service"** and connect your GitHub repo.
3.  **Root Directory**: Set to `backend`.
4.  **Environment Variables**:
    - `DATABASE_URL`: Your Render PostgreSQL Internal URL.
    - `JWT_SECRET`: Your private security key.
    - `CLOUDINARY_URL`: Your Cloudinary connection string.
    - `EMAIL_PASS`: Your Gmail App Password.
    - `EMAIL_USER`: Your Gmail address.

### 2. Frontend (Vercel)
1.  **Root Directory**: Set to `frontend`.
2.  **Framework**: Vite.
3.  **Variables**:
    - `VITE_API_BASE_URL`: Your Render Web Service public URL.

## 📦 Developer Setup
```bash
# Clone
git clone https://github.com/mangalyammatch/mangalyammatch.git

# Backend
cd backend && npm install && npx prisma generate

# Frontend
cd frontend && npm install && npm run dev
```

---
*Built with ❤️ for MangalyamMatch.*
