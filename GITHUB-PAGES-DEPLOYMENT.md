# GitHub Pages Deployment Guide

## Overview
This guide shows you how to deploy your blogging platform frontend to GitHub Pages as an alternative to Netlify.

## Current Setup Status
- ✅ **Repository**: https://github.com/VENKATAPATHY376/Blogging_Website
- ✅ **Backend**: Running on Render at https://blogging-website-qvl8.onrender.com
- ✅ **Frontend**: Currently on Netlify (this guide adds GitHub Pages as alternative)

## Step-by-Step GitHub Pages Setup

### 1. Repository Configuration
Your repository is already properly set up with the frontend in the `frontend/` directory.

### 2. Enable GitHub Pages
1. **Go to your repository**: https://github.com/VENKATAPATHY376/Blogging_Website
2. **Click Settings tab** (top of repository page)
3. **Scroll down to "Pages"** section in left sidebar
4. **Configure Source**:
   - Source: **Deploy from a branch**
   - Branch: **main**
   - Folder: **/ (root)**

### 3. Create GitHub Actions Workflow
Create the workflow file for automatic deployment:

**File**: `.github/workflows/deploy-pages.yml`

```yaml
name: Deploy Frontend to GitHub Pages

on:
  push:
    branches: [ main ]
    paths: [ 'frontend/**' ]  # Only deploy when frontend changes
  workflow_dispatch:  # Allow manual trigger

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
        
      - name: Setup Pages
        uses: actions/configure-pages@v4
        
      - name: Upload frontend artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './frontend'
          
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v3
```

### 4. Create Root Index for Easy Access
**File**: `index.html` (in project root)

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Blogging Platform</title>
    <meta http-equiv="refresh" content="0; url=./frontend/index.html">
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #f59e0b, #d97706);
            color: white;
        }
        .container {
            text-align: center;
            padding: 2rem;
            border-radius: 12px;
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
        }
        .spinner {
            width: 40px;
            height: 40px;
            border: 4px solid rgba(255, 255, 255, 0.3);
            border-top: 4px solid white;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 1rem;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        a {
            color: white;
            text-decoration: none;
            font-weight: 600;
        }
        a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="spinner"></div>
        <h2>Redirecting to Blogging Platform...</h2>
        <p>If you're not automatically redirected, <a href="./frontend/index.html">click here</a>.</p>
    </div>
    
    <script>
        // Immediate redirect
        window.location.href = './frontend/index.html';
    </script>
</body>
</html>
```

### 5. Jekyll Configuration (Optional)
**File**: `_config.yml`

```yaml
# GitHub Pages Jekyll configuration
title: "Blogging Platform"
description: "A modern, responsive blogging platform"

# Include frontend files
include:
  - frontend

# Exclude unnecessary files from build
exclude:
  - backend/
  - node_modules/
  - "*.md"
  - .git/
  - .github/
  - README.md
  - HOSTING-GUIDE.md
  - RENDER-DEPLOYMENT.md

# Disable Jekyll processing for frontend
plugins: []
markdown: kramdown
highlighter: rouge

# Custom settings
baseurl: ""
url: "https://VENKATAPATHY376.github.io"

# Build settings
safe: true
incremental: false
```

### 6. Deploy Commands
After creating the files above, deploy with:

```bash
# Add all new files
git add .

# Commit changes
git commit -m "Add GitHub Pages deployment configuration"

# Push to trigger deployment
git push origin main
```

### 7. Access Your Site
After deployment completes (usually 2-5 minutes):

- **GitHub Pages URL**: `https://VENKATAPATHY376.github.io/Blogging_Website/`
- **Direct Frontend**: `https://VENKATAPATHY376.github.io/Blogging_Website/frontend/`

### 8. Verification Steps
1. **Check deployment status**:
   - Go to repository **Actions** tab
   - Look for "Deploy Frontend to GitHub Pages" workflow
   - Verify it completed successfully

2. **Test the live site**:
   - Visit your GitHub Pages URL
   - Test user registration/login
   - Create a test post with image upload
   - Verify API connectivity with backend

### 9. Custom Domain (Optional)
1. **Add CNAME file** in repository root:
   ```
   yourdomain.com
   ```

2. **Configure DNS** at your domain provider:
   ```
   Type: CNAME
   Name: www (or @)
   Value: VENKATAPATHY376.github.io
   ```

3. **Enable custom domain** in repository Settings > Pages

### 10. Troubleshooting

#### Common Issues:

1. **404 Page Not Found**:
   - Check if workflow ran successfully
   - Verify file paths are correct
   - Ensure Pages is enabled in repository settings

2. **CSS/JS Not Loading**:
   - Check relative paths in HTML
   - Verify files are in correct directories
   - Check browser console for errors

3. **API Connection Issues**:
   - Ensure backend URL is correct in frontend
   - Check CORS configuration on Render backend
   - Verify backend is running

#### Debug Steps:
```bash
# Check if files were included in deployment
# Go to: https://github.com/VENKATAPATHY376/Blogging_Website/deployments

# Test API connectivity
curl https://blogging-website-qvl8.onrender.com/api/health

# View deployment logs
# Repository > Actions > Latest workflow run
```

### 11. Comparison: GitHub Pages vs Netlify

| Feature | GitHub Pages | Netlify |
|---------|-------------|---------|
| **Cost** | Free | Free tier available |
| **Custom Domains** | ✅ | ✅ |
| **HTTPS** | ✅ | ✅ |
| **Build Time** | Slower | Faster |
| **Deploy Triggers** | Git push only | Git push + manual |
| **Redirects** | Limited | Full support |
| **Analytics** | No | Yes |
| **Form Handling** | No | Yes |
| **Edge Functions** | No | Yes |

### 12. Maintenance
- **Updates**: Push to main branch triggers automatic rebuild
- **Monitoring**: Check repository Actions tab for deployment status
- **Rollback**: Revert git commit and push to roll back deployment

## Summary
GitHub Pages provides a reliable, free hosting solution for your frontend. While Netlify offers more features, GitHub Pages is perfect for static sites and integrates seamlessly with your existing GitHub workflow.

**Next Steps**:
1. Follow steps 2-6 above to set up GitHub Pages
2. Test both Netlify and GitHub Pages deployments
3. Choose your preferred platform for production use

---
*For questions or issues, check the repository's Issues tab or deployment logs.*