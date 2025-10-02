# 🚀 GitHub Pages Automatic Deployment Guide

## Quick Setup Checklist

- [ ] Push `.github/workflows/deploy.yml` to your repository
- [ ] Go to **Settings** → **Pages** → Select **"GitHub Actions"** as source
- [ ] Go to **Settings** → **Actions** → **General** → Enable **"Read and write permissions"**
- [ ] Check **Actions** tab for deployment status
- [ ] Visit your live site: `https://[username].github.io/pomodoflow`

## 🔧 Troubleshooting

### Common Issues and Solutions

#### 1. Workflow Not Running
**Problem**: No workflow appears in Actions tab after pushing

**Solutions**:
- Ensure the file is at `.github/workflows/deploy.yml` (exact path)
- Check file is properly committed and pushed to main branch
- Verify repository has Actions enabled: **Settings** → **Actions** → **General**

#### 2. Permission Denied Error
**Problem**: Workflow fails with permission errors

**Solutions**:
- Go to **Settings** → **Actions** → **General**
- Under "Workflow permissions", select **"Read and write permissions"**
- Check **"Allow GitHub Actions to create and approve pull requests"**
- Re-run the failed workflow

#### 3. Pages Source Not Set
**Problem**: Site not deploying even with successful workflow

**Solutions**:
- Go to **Settings** → **Pages**
- Under "Source", select **"GitHub Actions"** (NOT "Deploy from a branch")
- Click **Save**
- Wait for next push or manually re-run workflow

#### 4. Files Not Found (404)
**Problem**: Site loads but shows 404 for assets

**Solutions**:
- Check all file paths in your HTML are relative (not absolute)
- Ensure `manifest.json` uses relative paths
- Verify all referenced files exist in repository

#### 5. Workflow Runs But Deployment Fails
**Problem**: Build succeeds but deployment step fails

**Solutions**:
- Check if Pages is enabled: **Settings** → **Pages**
- Verify repository is public or you have GitHub Pro/Team
- Check deployment logs in Actions tab for specific errors

#### 6. Old Version Still Showing
**Problem**: Changes pushed but old version still visible

**Solutions**:
- Hard refresh browser: `Ctrl+F5` (Windows) or `Cmd+Shift+R` (Mac)
- Check workflow completed successfully in Actions tab
- Wait 1-2 minutes for CDN to update
- Try incognito/private browsing mode

## 📊 Monitoring Your Deployments

### Viewing Deployment Status
1. Go to your repository's **Actions** tab
2. Click on the latest workflow run
3. Expand "Deploy to GitHub Pages" job
4. Check each step for success/failure status

### Understanding Workflow Logs
- **Green checkmark**: Step completed successfully
- **Red X**: Step failed (click to see error details)
- **Yellow circle**: Step is currently running
- **Gray dash**: Step was skipped

### Deployment URL
- Your site URL will be shown in the deployment job logs
- Format: `https://[username].github.io/pomodoflow`
- URL is also available in **Settings** → **Pages**

## 🛠️ Advanced Configuration

### Custom Domain Setup
1. Add `CNAME` file to repository root:
   ```
   yourdomain.com
   ```
2. Configure DNS with your domain provider
3. Enable "Enforce HTTPS" in Pages settings

### Environment Variables
Add secrets in **Settings** → **Secrets and variables** → **Actions**:
- `CUSTOM_DOMAIN`: Your custom domain
- `DEPLOY_TOKEN`: Personal access token (if needed)

### Multiple Environments
- **Production**: Deploys from `main` branch
- **Staging**: Can deploy from `develop` branch (modify workflow)
- **Preview**: Deploys from pull requests (optional)

## 📝 Workflow Customization

### Adding Build Steps
Edit `.github/workflows/deploy.yml` to add:
- CSS/JS minification
- Image optimization
- Cache busting
- Asset compilation

### Example Build Step:
```yaml
- name: Optimize assets
  run: |
    # Minify CSS
    npx clean-css-cli style.css -o _site/style.min.css
    
    # Update HTML to use minified CSS
    sed -i 's/style.css/style.min.css/g' _site/index.html
```

## 🆘 Getting Help

### Resources
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Repository Issues](https://github.com/your-username/pomodoflow/issues)

### Creating an Issue
If you encounter problems:
1. Go to your repository's **Issues** tab
2. Click **"New issue"**
3. Include:
   - What you were trying to do
   - What happened instead
   - Screenshots of error messages
   - Link to failed workflow run

---

**Happy deploying! 🎉**
