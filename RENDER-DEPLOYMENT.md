# 🚀 Render Backend Deployment Guide

Step-by-step guide to deploy your Node.js backend to Render.

## 📋 Prerequisites

- GitHub repository with your backend code
- MongoDB Atlas account (for database)
- Render account (free)

## 🌐 Step-by-Step Deployment

### Step 1: Create Render Account
1. Go to [Render.com](https://render.com)
2. Sign up with GitHub account
3. Authorize Render to access your repositories

### Step 2: Create Web Service
1. Click **"New +"** → **"Web Service"**
2. **Connect repository**: `VENKATAPATHY376/Blogging_Website`
3. Click **"Connect"**

### Step 3: Configure Service
```
Name: blogging-platform-backend
Region: Ohio (US East) or closest to your users
Branch: main
Root Directory: backend
Runtime: Node
Build Command: npm install
Start Command: npm start
```

### Step 4: Environment Variables
Add these in the **"Advanced"** section:

```bash
# Required Environment Variables
# Do NOT set PORT manually - Render injects the correct PORT automatically.
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/blogdb
JWT_SECRET=your_super_secure_jwt_secret_here_minimum_32_characters
CORS_ORIGIN=https://your-frontend-domain.netlify.app
NODE_ENV=production

# Optional: For enhanced security
BCRYPT_ROUNDS=12
JWT_EXPIRES_IN=2d
```

> `backend/.env` is gitignored and is not uploaded to Render. All secrets must be added in the Render dashboard under **Environment**.

### Step 5: Database Setup (MongoDB Atlas)

#### Create Database:
1. **MongoDB Atlas**: [cloud.mongodb.com](https://cloud.mongodb.com)
2. **Create cluster** (free M0 tier)
3. **Database Access** → Create user:
   - Username: `bloguser`
   - Password: Generate secure password
   - Role: `Read and write to any database`

#### Network Access:
1. **Network Access** → **Add IP Address**
2. **Allow access from anywhere**: `0.0.0.0/0`
3. **Confirm**

#### Get Connection String:
1. **Clusters** → **Connect** → **Connect your application**
2. Copy connection string:
   ```
   mongodb+srv://bloguser:<password>@cluster0.abc123.mongodb.net/blogdb
   ```
3. **Replace `<password>`** with your actual password

### Step 6: Deploy
1. **Review settings**
2. **Click "Create Web Service"**
3. **Wait for deployment** (3-5 minutes)
4. **Note your backend URL**: `https://your-service-name.onrender.com`

## 🔧 Post-Deployment Configuration

### Update Frontend API URL
After backend deployment, update your frontend:

1. **Copy your Render backend URL**
2. **Update `frontend/index.html`** line 632:
   ```javascript
   ? 'https://YOUR_ACTUAL_BACKEND_URL.onrender.com/api'
   ```
3. **Commit and push changes**
4. **Netlify will auto-redeploy**

### Update CORS Settings
In Render dashboard:
1. **Environment** → **CORS_ORIGIN**
2. **Update with your Netlify frontend URL**:
   ```
   https://your-frontend-name.netlify.app
   ```

## 🧪 Testing Your Deployment

### Test Backend Endpoints:
```bash
# Health check
curl https://your-backend.onrender.com/api/posts

# Test user registration
curl -X POST https://your-backend.onrender.com/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"Test123!"}'
```

### Test Frontend Integration:
1. **Open your Netlify frontend**
2. **Try user registration**
3. **Create a test post**
4. **Verify database data** in MongoDB Atlas

## 🚨 Common Issues & Solutions

### Issue 1: Build Fails
**Error**: `npm ERR! missing script: start`
**Solution**: Ensure `backend/package.json` has:
```json
{
  "scripts": {
    "start": "node server.js"
  }
}
```

### Issue 2: Service exits right after `Connecting to database...`
**Cause**: `MONGO_URI` is missing or MongoDB is unreachable. The old code exited before `app.listen()`, so Render also reported `No open ports detected`.

**Solutions**:
- Add `MONGO_URI` in Render **Environment** (not just local `backend/.env`)
- Confirm the Atlas user/password and database name in the URI
- Allow `0.0.0.0/0` in MongoDB Atlas **Network Access**
- Do not set `PORT` manually; Render injects it

The updated server binds its port first and exposes `GET /api/health`. A `503` response with `"database": "DISCONNECTED"` means MongoDB is still the problem.

### Issue 3: `bad auth : authentication failed`
**Cause**: The `MONGO_URI` in Render has the wrong username/password (or a password that needs URL-encoding).

**Solutions**:
- Copy the exact working connection string from local `backend/.env` into Render **Environment > MONGO_URI**
- If the password contains special characters, URL-encode them (`@` → `%40`, `#` → `%23`, etc.)
- Confirm the Atlas database user has read/write access to the database in the URI

After fixing the variable, restart the Render service. `/api/health` should then return `200 OK`.

### Issue 3: CORS Errors
**Error**: `Access-Control-Allow-Origin`
**Solution**: 
- Ensure CORS_ORIGIN matches frontend URL exactly
- No trailing slash in CORS_ORIGIN
- Include https:// protocol

### Issue 4: JWT Secret Issues
**Error**: `secretOrPrivateKey has a minimum key size`
**Solution**: Use a strong JWT secret (32+ characters):
```bash
# Generate strong secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 💰 Pricing Information

### Render Free Tier:
- **750 hours/month** free compute
- **Sleeps after 15 minutes** of inactivity
- **Cold start delay** (~30 seconds when waking)
- **Automatic HTTPS**

### Render Paid Tier ($7/month):
- **Always-on service** (no sleeping)
- **Faster performance**
- **Custom domains**

## 🔄 Automatic Deployments

Render automatically redeploys when you push to GitHub:
1. **Push code changes**
2. **Render detects changes**
3. **Automatic rebuild and deploy**
4. **Zero downtime deployment**

## 🔒 Security Best Practices

### Environment Variables:
- ✅ Never commit `.env` files
- ✅ Use strong, unique JWT secrets
- ✅ Restrict CORS to specific domains
- ✅ Use strong database passwords

### Database Security:
- ✅ Create dedicated database user
- ✅ Use least-privilege access
- ✅ Enable MongoDB Atlas monitoring
- ✅ Regular security updates

## 📊 Monitoring

### Render Dashboard:
- **Logs**: Real-time application logs
- **Metrics**: CPU, memory, response times
- **Events**: Deployment history

### MongoDB Atlas:
- **Performance**: Query performance
- **Alerts**: Connection and usage alerts
- **Backup**: Automatic daily backups

## 🚀 Next Steps

1. ✅ **Deploy backend to Render**
2. ✅ **Update frontend API URLs**
3. ✅ **Test full application**
4. ✅ **Set up custom domain** (optional)
5. ✅ **Monitor performance**

---

Your backend is now live and scalable! 🎉