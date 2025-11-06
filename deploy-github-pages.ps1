# GitHub Pages Quick Deploy Script
# Run this script to deploy your frontend to GitHub Pages

Write-Host "🚀 Starting GitHub Pages deployment preparation..." -ForegroundColor Cyan

# Check if we're in the right directory
if (-not (Test-Path "frontend/index.html")) {
    Write-Host "❌ Error: frontend/index.html not found. Make sure you're in the project root directory." -ForegroundColor Red
    exit 1
}

# Check git status
Write-Host "📋 Checking git status..." -ForegroundColor Yellow
git status

# Add all files
Write-Host "📁 Adding all files to git..." -ForegroundColor Yellow
git add .

# Check if there are changes to commit
$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Host "💾 Committing changes..." -ForegroundColor Yellow
    git commit -m "Add GitHub Pages deployment configuration and workflow"
    
    # Push to trigger deployment
    Write-Host "🔄 Pushing to GitHub (this will trigger deployment)..." -ForegroundColor Yellow
    git push origin main
    
    Write-Host "✅ Deployment initiated! Check the following:" -ForegroundColor Green
    Write-Host "   1. Repository Actions tab: https://github.com/VENKATAPATHY376/Blogging_Website/actions" -ForegroundColor White
    Write-Host "   2. Enable GitHub Pages in Settings > Pages if not already enabled" -ForegroundColor White
    Write-Host "   3. Your site will be available at: https://VENKATAPATHY376.github.io/Blogging_Website/" -ForegroundColor White
    
    Write-Host "`n🔗 Quick Links:" -ForegroundColor Cyan
    Write-Host "   • Repository: https://github.com/VENKATAPATHY376/Blogging_Website" -ForegroundColor Blue
    Write-Host "   • Actions: https://github.com/VENKATAPATHY376/Blogging_Website/actions" -ForegroundColor Blue
    Write-Host "   • Settings: https://github.com/VENKATAPATHY376/Blogging_Website/settings/pages" -ForegroundColor Blue
    
    Write-Host "`n⏰ Deployment usually takes 2-5 minutes to complete." -ForegroundColor Magenta
} else {
    Write-Host "ℹ️  No changes to commit. Your repository is up to date." -ForegroundColor Blue
    Write-Host "   If you want to redeploy, go to Actions tab and manually trigger the workflow." -ForegroundColor White
}

Write-Host "`n🎉 GitHub Pages deployment preparation complete!" -ForegroundColor Green