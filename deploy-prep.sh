#!/bin/bash

# 🚀 Quick Deployment Script for Blogging Platform
# Run this script to prepare your project for deployment

echo "🚀 Preparing Blogging Platform for Deployment"
echo "=============================================="

# Check if we're in the right directory
if [ ! -f "frontend/index.html" ] || [ ! -f "backend/server.js" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

echo ""
echo "📋 Pre-deployment Checklist:"
echo ""

# 1. Check environment files
echo "1️⃣ Checking environment configuration..."
if [ ! -f "backend/.env" ]; then
    echo "⚠️  backend/.env not found. Creating template..."
    cat > backend/.env << EOL
PORT=4000
MONGO_URI=mongodb://localhost:27017/blogdb
JWT_SECRET=your_jwt_secret_here_change_this_for_production
CORS_ORIGIN=http://localhost:3000
NODE_ENV=development
EOL
    echo "✅ Created backend/.env template - UPDATE WITH PRODUCTION VALUES"
else
    echo "✅ backend/.env exists"
fi

# 2. Check package.json scripts
echo ""
echo "2️⃣ Checking package.json configurations..."

# Backend package.json
if grep -q '"start".*"node server.js"' backend/package.json; then
    echo "✅ Backend start script configured correctly"
else
    echo "⚠️  Backend start script may need updating"
fi

# Frontend package.json
if [ -f "frontend/package.json" ]; then
    echo "✅ Frontend package.json exists"
else
    echo "⚠️  Frontend package.json not found"
fi

# 3. Check for production-ready settings
echo ""
echo "3️⃣ Checking production readiness..."

# Check if API URLs are still localhost
if grep -q "localhost:4000" frontend/index.html; then
    echo "⚠️  Frontend still using localhost API URLs"
    echo "   👉 Update API_BASE in frontend/index.html after deploying backend"
else
    echo "✅ Frontend API URLs updated"
fi

# 4. Security check
echo ""
echo "4️⃣ Security checklist:"
echo "   🔐 Update JWT_SECRET in production"
echo "   🔐 Use strong database passwords"
echo "   🔐 Restrict database network access"
echo "   🔐 Set proper CORS_ORIGIN"

# 5. Deployment recommendations
echo ""
echo "🎯 Recommended Deployment Order:"
echo "   1. Setup MongoDB Atlas database"
echo "   2. Deploy backend to Railway/Render"
echo "   3. Update frontend API URLs"
echo "   4. Deploy frontend to Netlify/Vercel"
echo ""

echo "📚 For detailed instructions, see HOSTING-GUIDE.md"
echo ""

# Ask if user wants to create a production environment file
read -p "🤔 Create production environment template? (y/n): " create_prod_env

if [ "$create_prod_env" = "y" ] || [ "$create_prod_env" = "Y" ]; then
    cat > backend/.env.production << EOL
# Production Environment Variables
# Copy these to your hosting platform's environment settings

PORT=4000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/blogdb
JWT_SECRET=your_super_secure_jwt_secret_here_minimum_32_characters
CORS_ORIGIN=https://your-frontend-domain.netlify.app
NODE_ENV=production

# Optional: If using cloud storage for file uploads
# AWS_ACCESS_KEY_ID=your_aws_access_key
# AWS_SECRET_ACCESS_KEY=your_aws_secret_key
# AWS_BUCKET_NAME=your_s3_bucket_name
# AWS_REGION=us-east-1
EOL
    echo "✅ Created backend/.env.production template"
    echo "   👉 Copy these values to your hosting platform"
fi

echo ""
echo "🎉 Pre-deployment check complete!"
echo "📖 Next steps: Follow the HOSTING-GUIDE.md for detailed deployment instructions"