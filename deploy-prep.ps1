# 🚀 Quick Deployment Script for Blogging Platform (PowerShell)
# Run this script to prepare your project for deployment

Write-Host "🚀 Preparing Blogging Platform for Deployment" -ForegroundColor Green
Write-Host "==============================================" -ForegroundColor Green

# Check if we're in the right directory
if (!(Test-Path "frontend/index.html") -or !(Test-Path "backend/server.js")) {
    Write-Host "❌ Error: Please run this script from the project root directory" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📋 Pre-deployment Checklist:" -ForegroundColor Yellow
Write-Host ""

# 1. Check environment files
Write-Host "1️⃣ Checking environment configuration..."
if (!(Test-Path "backend/.env")) {
    Write-Host "⚠️  backend/.env not found. Creating template..." -ForegroundColor Yellow
    @"
PORT=4000
MONGO_URI=mongodb://localhost:27017/blogdb
JWT_SECRET=your_jwt_secret_here_change_this_for_production
CORS_ORIGIN=http://localhost:3000
NODE_ENV=development
"@ | Out-File -FilePath "backend/.env" -Encoding UTF8
    Write-Host "✅ Created backend/.env template - UPDATE WITH PRODUCTION VALUES" -ForegroundColor Green
} else {
    Write-Host "✅ backend/.env exists" -ForegroundColor Green
}

# 2. Check package.json scripts
Write-Host ""
Write-Host "2️⃣ Checking package.json configurations..."

# Backend package.json
$backendPackage = Get-Content "backend/package.json" -Raw
if ($backendPackage -match '"start".*"node server.js"') {
    Write-Host "✅ Backend start script configured correctly" -ForegroundColor Green
} else {
    Write-Host "⚠️  Backend start script may need updating" -ForegroundColor Yellow
}

# Frontend package.json
if (Test-Path "frontend/package.json") {
    Write-Host "✅ Frontend package.json exists" -ForegroundColor Green
} else {
    Write-Host "⚠️  Frontend package.json not found" -ForegroundColor Yellow
}

# 3. Check for production-ready settings
Write-Host ""
Write-Host "3️⃣ Checking production readiness..."

# Check if API URLs are still localhost
$frontendContent = Get-Content "frontend/index.html" -Raw
if ($frontendContent -match "localhost:4000") {
    Write-Host "⚠️  Frontend still using localhost API URLs" -ForegroundColor Yellow
    Write-Host "   👉 Update API_BASE in frontend/index.html after deploying backend" -ForegroundColor Cyan
} else {
    Write-Host "✅ Frontend API URLs updated" -ForegroundColor Green
}

# 4. Security check
Write-Host ""
Write-Host "4️⃣ Security checklist:" -ForegroundColor Yellow
Write-Host "   🔐 Update JWT_SECRET in production"
Write-Host "   🔐 Use strong database passwords"
Write-Host "   🔐 Restrict database network access"
Write-Host "   🔐 Set proper CORS_ORIGIN"

# 5. Deployment recommendations
Write-Host ""
Write-Host "🎯 Recommended Deployment Order:" -ForegroundColor Cyan
Write-Host "   1. Setup MongoDB Atlas database"
Write-Host "   2. Deploy backend to Railway/Render"
Write-Host "   3. Update frontend API URLs"
Write-Host "   4. Deploy frontend to Netlify/Vercel"
Write-Host ""

Write-Host "📚 For detailed instructions, see HOSTING-GUIDE.md" -ForegroundColor Blue
Write-Host ""

# Ask if user wants to create a production environment file
$createProdEnv = Read-Host "🤔 Create production environment template? (y/n)"

if ($createProdEnv -eq "y" -or $createProdEnv -eq "Y") {
    @"
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
"@ | Out-File -FilePath "backend/.env.production" -Encoding UTF8
    Write-Host "✅ Created backend/.env.production template" -ForegroundColor Green
    Write-Host "   👉 Copy these values to your hosting platform" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "🎉 Pre-deployment check complete!" -ForegroundColor Green
Write-Host "📖 Next steps: Follow the HOSTING-GUIDE.md for detailed deployment instructions" -ForegroundColor Blue