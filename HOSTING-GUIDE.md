# 🚀 Hosting Guide - Blogging Platform

Complete guide to deploy your full-stack blogging platform to production.

## 📋 Overview

Your platform consists of:
- **Frontend**: Static files (HTML, CSS, JS) - needs static hosting
- **Backend**: Node.js/Express API - needs server hosting  
- **Database**: MongoDB - needs database hosting

## 🎯 Recommended Hosting Strategy

### Option 1: Free Tier Setup (Recommended for Testing)
- **Frontend**: Netlify or Vercel (Free)
- **Backend**: Railway or Render (Free tier)
- **Database**: MongoDB Atlas (Free tier - 512MB)

### Option 2: Production Setup
- **Frontend**: Netlify Pro or Vercel Pro
- **Backend**: Railway Pro, Render, or DigitalOcean
- **Database**: MongoDB Atlas (Paid tier)

## 🌐 Frontend Deployment

### Option A: Netlify (Recommended)

1. **Prepare your frontend:**
   ```bash
   cd frontend
   # Update API_BASE in index.html to your backend URL
   ```

2. **Deploy via GitHub:**
   - Go to [Netlify](https://netlify.com)
   - Sign up with GitHub
   - Click "New site from Git"
   - Select your `Blogging_Website` repository
   - Configure build settings:
     - **Base directory**: `frontend`
     - **Build command**: `npm run build` (or leave empty for static)
     - **Publish directory**: `frontend` (or `dist` if you have a build step)

3. **Environment Variables:**
   - Go to Site settings → Environment variables
   - Add any frontend environment variables if needed

4. **Custom Domain (Optional):**
   - Site settings → Domain management
   - Add your custom domain

### Option B: Vercel

1. **Deploy via GitHub:**
   - Go to [Vercel](https://vercel.com)
   - Import your GitHub repository
   - Root Directory: `frontend`
   - Framework Preset: Other
   - Build Command: Leave empty
   - Output Directory: Leave empty

2. **Update API URLs:**
   After deployment, update `index.html`:
   ```javascript
   const API_BASE = 'https://your-backend-url.railway.app/api';
   ```

## 🖥️ Backend Deployment

### Option A: Railway (Recommended)

1. **Prepare your backend:**
   ```bash
   cd backend
   # Make sure package.json has correct start script
   ```

2. **Deploy:**
   - Go to [Railway](https://railway.app)
   - Sign up with GitHub
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Select `backend` folder as root
   - Railway will auto-detect Node.js and deploy

3. **Environment Variables:**
   - In Railway dashboard → Variables tab
   - Add these variables:
     ```
     PORT=4000
     MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/blogdb
     JWT_SECRET=your_production_jwt_secret_here
     CORS_ORIGIN=https://your-frontend-domain.netlify.app
     NODE_ENV=production
     ```

4. **Custom Domain:**
   - Settings → Domains
   - Add your custom domain

### Option B: Render

1. **Create Web Service:**
   - Go to [Render](https://render.com)
   - New → Web Service
   - Connect GitHub repository
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`

2. **Environment Variables:**
   ```
   PORT=4000
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/blogdb
   JWT_SECRET=your_production_jwt_secret_here
   CORS_ORIGIN=https://your-frontend-domain.netlify.app
   NODE_ENV=production
   ```

### Option C: Heroku

1. **Install Heroku CLI:**
   ```bash
   # Download from https://devcenter.heroku.com/articles/heroku-cli
   ```

2. **Deploy:**
   ```bash
   cd backend
   heroku create your-blog-api
   heroku config:set MONGO_URI=your_mongodb_connection_string
   heroku config:set JWT_SECRET=your_jwt_secret
   heroku config:set CORS_ORIGIN=https://your-frontend-domain.netlify.app
   git subtree push --prefix backend heroku main
   ```

## 🗄️ Database Setup

### MongoDB Atlas (Recommended)

1. **Create Account:**
   - Go to [MongoDB Atlas](https://cloud.mongodb.com)
   - Sign up for free account

2. **Create Cluster:**
   - Create new cluster (free M0 tier)
   - Choose region closest to your backend server
   - Wait for cluster creation (2-3 minutes)

3. **Setup Database Access:**
   - Database Access → Add New Database User
   - Create username and password
   - Grant read/write access

4. **Setup Network Access:**
   - Network Access → Add IP Address
   - Add `0.0.0.0/0` (allow access from anywhere)
   - Or add specific IPs of your hosting providers

5. **Get Connection String:**
   - Clusters → Connect → Connect your application
   - Copy the connection string
   - Replace `<password>` with your database user password

## 🔧 Configuration Updates

### Update Frontend API URLs

After deploying backend, update `frontend/index.html`:

```javascript
// Replace localhost URLs with production URLs
const API_BASE = 'https://your-backend-url.railway.app/api';
const API_ORIGIN = 'https://your-backend-url.railway.app';
```

### Update Backend CORS

In your backend, update the CORS_ORIGIN environment variable:
```
CORS_ORIGIN=https://your-frontend-domain.netlify.app
```

## 📝 Step-by-Step Deployment

### Phase 1: Database
1. ✅ Set up MongoDB Atlas
2. ✅ Create database user and configure network access
3. ✅ Get connection string

### Phase 2: Backend
1. ✅ Deploy to Railway/Render
2. ✅ Set environment variables
3. ✅ Test API endpoints
4. ✅ Note the backend URL

### Phase 3: Frontend
1. ✅ Update API_BASE URLs in index.html
2. ✅ Commit and push changes
3. ✅ Deploy to Netlify/Vercel
4. ✅ Test the complete application

## 🧪 Testing Your Deployed App

1. **Test Registration/Login:**
   - Visit your frontend URL
   - Try registering a new user
   - Test login functionality

2. **Test Post Creation:**
   - Create a new post with images
   - Verify post appears in feed
   - Test like/dislike functionality

3. **Test Multi-User:**
   - Use different browsers/incognito modes
   - Test multiple users interacting

## 🚨 Common Issues & Solutions

### CORS Errors
- Ensure CORS_ORIGIN matches your exact frontend URL
- Include protocol (https://) and no trailing slash

### Database Connection Errors
- Check MongoDB Atlas network access settings
- Verify connection string format
- Ensure database user has correct permissions

### File Upload Issues
- For production, consider using cloud storage (AWS S3, Cloudinary)
- Update upload controller to use cloud storage URLs

### Environment Variables Not Working
- Double-check variable names (case-sensitive)
- Restart your backend service after adding variables
- Use the hosting platform's dashboard to set variables

## 💰 Cost Estimates

### Free Tier (Good for testing)
- **Frontend**: Netlify Free (100GB bandwidth)
- **Backend**: Railway Free ($5 credit, then $0.01/min)
- **Database**: MongoDB Atlas Free (512MB)
- **Total**: Free for small usage

### Production Tier
- **Frontend**: Netlify Pro ($19/month)
- **Backend**: Railway Pro ($20/month)
- **Database**: MongoDB Atlas M10 ($57/month)
- **Total**: ~$96/month

## 🔒 Security Checklist

- ✅ Use strong JWT secrets
- ✅ Enable HTTPS on all services
- ✅ Restrict database access to specific IPs
- ✅ Use environment variables for all secrets
- ✅ Enable rate limiting on API endpoints
- ✅ Validate and sanitize all inputs

## 📞 Support

If you encounter issues:
1. Check the hosting platform's logs
2. Verify all environment variables are set
3. Test API endpoints individually
4. Check browser console for frontend errors

---

Your blogging platform is now ready for the world! 🌍