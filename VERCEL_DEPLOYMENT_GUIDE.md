# Vercel Deployment Guide

## Overview
This guide will help you deploy both the frontend and backend to Vercel with separate URLs.

### URLs Structure:
- **Frontend (Main)**: `https://your-app.vercel.app` - Homepage and user login
- **Frontend /mao**: `https://your-app.vercel.app/mao` - MAO officer login
- **Backend API**: `https://your-api.vercel.app` - Backend API server

---

## Prerequisites

1. **GitHub Account** - Create one at https://github.com
2. **Vercel Account** - Sign up at https://vercel.com (use your GitHub account)
3. **Git installed** on your computer

---

## Step 1: Push Code to GitHub

### 1.1 Create a New Repository on GitHub
1. Go to https://github.com/new
2. Repository name: `fiber-supply-chain` (or your preferred name)
3. Set to **Public** or **Private**
4. **DO NOT** initialize with README, .gitignore, or license
5. Click **Create repository**

### 1.2 Push Your Code to GitHub

Open PowerShell in your project folder and run:

```powershell
# Navigate to your project
cd "C:\Users\840G3\OneDrive\Desktop\FiberSupplyChain-3"

# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit your code
git commit -m "Initial commit - Fiber Supply Chain System"

# Add your GitHub repository as remote
# Replace YOUR_USERNAME with your GitHub username
git remote add origin https://github.com/YOUR_USERNAME/fiber-supply-chain.git

# Push to GitHub
git branch -M main
git push -u origin main
```

---

## Step 2: Deploy Backend to Vercel

### 2.1 Import Backend Project
1. Go to https://vercel.com/dashboard
2. Click **"Add New..."** → **"Project"**
3. Click **"Import Git Repository"**
4. Select your `fiber-supply-chain` repository
5. Click **"Import"**

### 2.2 Configure Backend Deployment
1. **Project Name**: `fiber-supply-chain-backend` (or your preferred name)
2. **Framework Preset**: Select **"Other"**
3. **Root Directory**: Click **"Edit"** and select `backend`
4. **Build Command**: Leave empty or use `npm run build`
5. **Output Directory**: Leave empty
6. **Install Command**: `npm install`

### 2.3 Add Environment Variables
Click **"Environment Variables"** and add these:

| Name | Value |
|------|-------|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | Your Supabase database URL |
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_ANON_KEY` | Your Supabase anon key |
| `JWT_SECRET` | Your JWT secret key |
| `PORT` | `3000` |

**Note**: Get your Supabase credentials from https://app.supabase.com → Your Project → Settings → API

### 2.4 Deploy Backend
1. Click **"Deploy"**
2. Wait for deployment to complete (2-5 minutes)
3. **Copy your backend URL** (e.g., `https://fiber-supply-chain-backend.vercel.app`)

---

## Step 3: Deploy Frontend to Vercel

### 3.1 Import Frontend Project
1. Go back to https://vercel.com/dashboard
2. Click **"Add New..."** → **"Project"**
3. Select your `fiber-supply-chain` repository again
4. Click **"Import"**

### 3.2 Configure Frontend Deployment
1. **Project Name**: `fiber-supply-chain` (or your preferred name)
2. **Framework Preset**: Select **"Vite"**
3. **Root Directory**: Click **"Edit"** and select `frontend`
4. **Build Command**: `npm run build`
5. **Output Directory**: `dist`
6. **Install Command**: `npm install`

### 3.3 Add Environment Variables
Click **"Environment Variables"** and add these:

| Name | Value |
|------|-------|
| `VITE_API_URL` | Your backend URL from Step 2.4 |
| `VITE_RECAPTCHA_SITE_KEY` | Your reCAPTCHA site key |
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key |

**Example**:
```
VITE_API_URL=https://fiber-supply-chain-backend.vercel.app
```

### 3.4 Deploy Frontend
1. Click **"Deploy"**
2. Wait for deployment to complete (2-5 minutes)
3. **Your frontend is now live!**

---

## Step 4: Test Your Deployment

### 4.1 Test Frontend URLs
1. **Homepage**: `https://your-app.vercel.app`
   - Should show the main homepage with farmer/buyer login options
   
2. **MAO Login**: `https://your-app.vercel.app/mao`
   - Should show the MAO officer login page

### 4.2 Test Backend API
Visit: `https://your-backend.vercel.app/api/health`
- Should return a health check response

---

## Step 5: Update Frontend API URL (if needed)

If you need to update the backend URL in your frontend:

1. Go to Vercel Dashboard → Your Frontend Project
2. Click **"Settings"** → **"Environment Variables"**
3. Edit `VITE_API_URL` to your backend URL
4. Click **"Save"**
5. Go to **"Deployments"** tab
6. Click **"..."** on the latest deployment → **"Redeploy"**

---

## Troubleshooting

### Backend Issues
- **500 Error**: Check environment variables are set correctly
- **Database Connection**: Verify `DATABASE_URL` and Supabase credentials
- **CORS Error**: Ensure backend allows your frontend domain

### Frontend Issues
- **Blank Page**: Check browser console for errors
- **API Not Working**: Verify `VITE_API_URL` is correct
- **404 on /mao**: Redeploy frontend (routing issue)

### Common Fixes
1. **Clear Vercel Cache**: Redeploy with "Clear Cache and Deploy"
2. **Check Logs**: Go to Deployment → "View Function Logs"
3. **Environment Variables**: Make sure all required variables are set

---

## Custom Domain (Optional)

### Add Custom Domain to Frontend
1. Go to Vercel Dashboard → Your Frontend Project
2. Click **"Settings"** → **"Domains"**
3. Add your domain (e.g., `myapp.com`)
4. Follow DNS configuration instructions

### Add Custom Domain to Backend
1. Go to Vercel Dashboard → Your Backend Project
2. Click **"Settings"** → **"Domains"**
3. Add your API domain (e.g., `api.myapp.com`)
4. Update `VITE_API_URL` in frontend environment variables

---

## Automatic Deployments

Every time you push to GitHub, Vercel will automatically deploy:

```powershell
# Make changes to your code
git add .
git commit -m "Your commit message"
git push
```

Vercel will automatically:
1. Detect the push
2. Build your project
3. Deploy the new version

---

## Important Notes

1. **Environment Variables**: Never commit sensitive keys to GitHub
2. **Database**: Make sure Supabase is properly configured
3. **CORS**: Backend must allow requests from your frontend domain
4. **MAO Route**: The `/mao` route works automatically with the React Router setup
5. **Free Tier**: Vercel free tier includes:
   - 100GB bandwidth/month
   - Unlimited deployments
   - Automatic HTTPS

---

## Your URLs Summary

After deployment, you'll have:

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend Main | `https://your-app.vercel.app` | Homepage, Farmer/Buyer login |
| MAO Login | `https://your-app.vercel.app/mao` | MAO officer login |
| Backend API | `https://your-api.vercel.app` | API server |

---

## Need Help?

- **Vercel Docs**: https://vercel.com/docs
- **Vercel Support**: https://vercel.com/support
- **GitHub Issues**: Create an issue in your repository

---

## Quick Commands Reference

```powershell
# Push updates to GitHub
git add .
git commit -m "Update message"
git push

# Check git status
git status

# View git remote
git remote -v

# Pull latest changes
git pull origin main
```

---

**Deployment Complete! 🎉**

Your Fiber Supply Chain system is now live on Vercel with:
- ✅ Frontend deployed with homepage and /mao route
- ✅ Backend API deployed separately
- ✅ Automatic deployments on git push
- ✅ HTTPS enabled by default
