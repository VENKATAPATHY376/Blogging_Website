# GitHub Pages Hosting Verification Script
# Run this after enabling GitHub Pages

Write-Host "🔍 GitHub Pages Hosting Verification" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

Write-Host "`n📋 Step-by-Step Checklist:" -ForegroundColor Yellow

Write-Host "`n1. ✅ Repository Setup" -ForegroundColor Green
Write-Host "   Repository: https://github.com/VENKATAPATHY376/Blogging_Website" -ForegroundColor White

Write-Host "`n2. 🔧 Enable GitHub Pages" -ForegroundColor Yellow
Write-Host "   Go to: https://github.com/VENKATAPATHY376/Blogging_Website/settings/pages" -ForegroundColor Blue
Write-Host "   Settings to configure:" -ForegroundColor White
Write-Host "   - Source: Deploy from a branch" -ForegroundColor White
Write-Host "   - Branch: main" -ForegroundColor White
Write-Host "   - Folder: / (root)" -ForegroundColor White
Write-Host "   - Click Save" -ForegroundColor White

Write-Host "`n3. 🚀 Monitor Deployment" -ForegroundColor Yellow
Write-Host "   Actions page: https://github.com/VENKATAPATHY376/Blogging_Website/actions" -ForegroundColor Blue
Write-Host "   Look for: 'Deploy Frontend to GitHub Pages' workflow" -ForegroundColor White

Write-Host "`n4. 🌐 Your Live URLs (after deployment)" -ForegroundColor Yellow
Write-Host "   Main Site: https://VENKATAPATHY376.github.io/Blogging_Website/" -ForegroundColor Blue
Write-Host "   Frontend: https://VENKATAPATHY376.github.io/Blogging_Website/frontend/" -ForegroundColor Blue

Write-Host "`n5. 🧪 Test Your Site" -ForegroundColor Yellow
Write-Host "   - Visit the URLs above" -ForegroundColor White
Write-Host "   - Register a test account" -ForegroundColor White
Write-Host "   - Create a test blog post" -ForegroundColor White
Write-Host "   - Upload an image" -ForegroundColor White
Write-Host "   - Test like/dislike features" -ForegroundColor White

Write-Host "`n📊 Deployment Timeline:" -ForegroundColor Magenta
Write-Host "   ⏰ First deployment: 5-10 minutes" -ForegroundColor White
Write-Host "   ⚡ Future deployments: 2-5 minutes" -ForegroundColor White

Write-Host "`n🔧 Backend Connection:" -ForegroundColor Cyan
Write-Host "   Your frontend will automatically connect to:" -ForegroundColor White
Write-Host "   Backend: https://blogging-website-qvl8.onrender.com/api" -ForegroundColor Blue

Write-Host "`n🎯 Quick Test Commands:" -ForegroundColor Green
Write-Host "   Test backend health:" -ForegroundColor White
Write-Host "   curl https://blogging-website-qvl8.onrender.com/api/health" -ForegroundColor Gray

# Check if git is up to date
Write-Host "`n📦 Checking Git Status..." -ForegroundColor Yellow
git status

Write-Host "`n✅ Ready to go! Follow the steps above to enable hosting." -ForegroundColor Green