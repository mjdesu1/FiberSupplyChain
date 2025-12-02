# 🚀 Deployment Information

## ✅ Backend Deployed!

### Backend URL:
```
https://fiber-supply-chain.vercel.app
```

**Vercel Project**: fiber-supply-chain-njdosssgg-mjdesu1s-projects.vercel.app

---

## 📋 Next Step: Deploy Frontend

### Frontend Environment Variables for Vercel:

Gamitin mo ito sa Frontend deployment:

```
VITE_API_URL=https://fiber-supply-chain.vercel.app
VITE_RECAPTCHA_SITE_KEY=6LcX7fwrAAAAAESjxyr64McrGGeZEF9_sW79Eurk
VITE_SUPABASE_URL=https://bjdgqkavtyglahfgfavw.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqZGdxa2F2dHlnbGFoZmdmYXZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzOTU0NDksImV4cCI6MjA3Njk3MTQ0OX0.w2v3_Dq6fOFtVdZNglAWVOxk8uTkWInsknKuKzv-21c
```

---

## 🎯 Frontend Deployment Steps:

1. **Go to Vercel**: https://vercel.com/new
2. **Import Project**: Select `mjdesu1/FiberSupplyChain` repository
3. **Configure**:
   - **Project Name**: `fiber-supply-chain-frontend` (or your choice)
   - **Framework Preset**: **Vite**
   - **Root Directory**: Click "Edit" → Select **`frontend`**
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. **Add Environment Variables** (copy from above):
   - `VITE_API_URL`
   - `VITE_RECAPTCHA_SITE_KEY`
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

5. **Click Deploy** 🚀

---

## 📱 Deployed URLs:

| Service | URL | Purpose |
|---------|-----|---------|
| **Backend API** | `https://fiber-supply-chain.vercel.app` | API Server ✅ |
| **Frontend Main** | `https://fiber-supply-chain-args.vercel.app` | Homepage ✅ |
| **MAO Login** | `https://fiber-supply-chain-args.vercel.app/mao` | MAO Officer Login ✅ |

---

## 🔧 Backend Environment Variables (Already Set):

✅ All environment variables are configured in Vercel:
- `NODE_ENV=production`
- `PORT=3000`
- `SUPABASE_URL`
- `SUPABASE_KEY`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `JWT_REFRESH_EXPIRES_IN`
- `RECAPTCHA_SECRET_KEY`
- `RECAPTCHA_SITE_KEY`
- `RECAPTCHA_VERSION`
- `RECAPTCHA_MIN_SCORE`

---

## 📝 Files Created:

- ✅ `backend/.env.example` - Backend environment template
- ✅ `frontend/.env.example` - Frontend environment template
- ✅ `backend/vercel.json` - Backend deployment config
- ✅ `frontend/vercel.json` - Frontend deployment config

---

## 🧪 Test Backend:

Try these endpoints:

```bash
# Health check
https://fiber-supply-chain.vercel.app/api/health

# API status
https://fiber-supply-chain.vercel.app/
```

---

**Status**: Backend ✅ | Frontend ⏳ (pending deployment)
