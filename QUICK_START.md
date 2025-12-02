# Quick Start - Vercel Deployment

## Mabilis na Gabay (Tagalog)

### Ano ang Gagawin:
1. **I-upload sa GitHub** - Ilagay ang code sa GitHub
2. **I-deploy sa Vercel** - Dalawang deployment (Frontend at Backend)
3. **Makakuha ng 2 URLs**:
   - Frontend: `https://your-app.vercel.app` (Homepage + /mao)
   - Backend: `https://your-api.vercel.app` (API)

---

## Step 1: I-push sa GitHub

```powershell
# Pumunta sa folder
cd "C:\Users\840G3\OneDrive\Desktop\FiberSupplyChain-3"

# I-initialize ang git
git init

# I-add lahat ng files
git add .

# I-commit
git commit -m "Initial commit"

# I-connect sa GitHub (palitan ang YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/fiber-supply-chain.git

# I-push
git branch -M main
git push -u origin main
```

**Kung wala pang GitHub repository:**
1. Pumunta sa https://github.com/new
2. Repository name: `fiber-supply-chain`
3. Click "Create repository"

---

## Step 2: I-deploy ang Backend

1. Pumunta sa https://vercel.com
2. Click **"Add New" → "Project"**
3. Select ang `fiber-supply-chain` repository
4. **Root Directory**: Piliin ang `backend` folder
5. **Framework**: "Other"
6. **Environment Variables** (importante!):
   ```
   NODE_ENV=production
   DATABASE_URL=your_supabase_database_url
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_key
   JWT_SECRET=your_jwt_secret
   ```
7. Click **"Deploy"**
8. **I-copy ang URL** (e.g., `https://fiber-supply-chain-backend.vercel.app`)

---

## Step 3: I-deploy ang Frontend

1. Bumalik sa Vercel Dashboard
2. Click **"Add New" → "Project"**
3. Select ulit ang `fiber-supply-chain` repository
4. **Root Directory**: Piliin ang `frontend` folder
5. **Framework**: "Vite"
6. **Environment Variables**:
   ```
   VITE_API_URL=https://fiber-supply-chain-backend.vercel.app
   VITE_RECAPTCHA_SITE_KEY=your_recaptcha_key
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_key
   ```
7. Click **"Deploy"**
8. **Tapos na!** 🎉

---

## Mga URLs Mo:

### Frontend (Main Homepage)
```
https://your-app.vercel.app
```
- Homepage para sa Farmers at Buyers
- Login pages para sa lahat

### MAO Officer Login
```
https://your-app.vercel.app/mao
```
- Special login page para sa MAO officers
- Hindi makikita sa homepage (secure)

### Backend API
```
https://your-api.vercel.app
```
- API server para sa lahat ng requests

---

## I-test ang Deployment

1. **Homepage**: Buksan ang `https://your-app.vercel.app`
   - Dapat makita ang homepage

2. **MAO Login**: Buksan ang `https://your-app.vercel.app/mao`
   - Dapat makita ang MAO login page

3. **API**: Buksan ang `https://your-api.vercel.app/api/health`
   - Dapat may response

---

## Kung May Mali

### Frontend hindi gumagana:
1. Check ang Environment Variables
2. I-verify ang `VITE_API_URL` - dapat tama ang backend URL
3. I-redeploy: Vercel Dashboard → Deployments → "Redeploy"

### Backend hindi gumagana:
1. Check ang Database connection
2. I-verify lahat ng Environment Variables
3. Check ang Logs: Vercel Dashboard → Deployment → "View Function Logs"

### /mao route 404 error:
1. I-redeploy ang frontend
2. Clear cache: "Redeploy" → "Clear Cache and Deploy"

---

## Automatic Updates

Kada mag-push ka sa GitHub, automatic na mag-deploy:

```powershell
# Gumawa ng changes
git add .
git commit -m "Update ko"
git push
```

Vercel will automatically deploy the new version!

---

## Importante!

✅ **Huwag i-commit ang .env files** - Lagi naka-gitignore
✅ **I-set lahat ng Environment Variables** sa Vercel
✅ **I-test muna bago i-share** ang URLs
✅ **I-save ang URLs** para madali hanapin

---

## Need Help?

Basahin ang detailed guide: `VERCEL_DEPLOYMENT_GUIDE.md`

**Tapos na! Ready na ang system mo sa Vercel! 🚀**
