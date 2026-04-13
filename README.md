# MangalyamMatch: Premium Matrimonial Platform 🚀

A high-performance, premium matrimonial platform featuring real-time chat, matchmaking, and a stunning Instagram-style UI.

## 🛠️ Production Tech Stack
- **Frontend**: React (Vite), Vercel
- **Backend**: Node.js (Express), Railway
- **Database**: PostgreSQL (via Prisma ORM)
- **Media**: Cloudinary (Persistent storage)
- **Payments**: Razorpay Integration Ready

## 🚀 Deployment Checklist

### 1. Backend (Railway)
1.  **Root Directory**: Set to `backend`.
2.  **Database**: Add a PostgreSQL service.
3.  **Variables**:
    - `DATABASE_URL`: Linked to the Postgres service.
    - `JWT_SECRET`: Your private security key.
    - `CLOUDINARY_URL`: Your Cloudinary connection string.
    - `EMAIL_PASS`: Your Gmail App Password.
    - `EMAIL_USER`: Your Gmail address.

### 2. Frontend (Vercel)
1.  **Root Directory**: Set to `frontend`.
2.  **Framework**: Vite.
3.  **Variables**:
    - `VITE_API_BASE_URL`: Your Railway backend public URL.

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
