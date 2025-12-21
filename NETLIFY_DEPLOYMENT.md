# Netlify Deployment Guide

Complete guide for deploying your Notion Transaction App to Netlify.

## Prerequisites

- Netlify account (sign up at https://www.netlify.com)
- Code pushed to Git repository (GitHub, GitLab, or Bitbucket)
- All environment variables ready

## Step 1: Install Dependencies

The `serverless-http` package has been added to `package.json`. Install it:

```bash
npm install
```

## Step 2: Connect Repository to Netlify

1. Go to https://app.netlify.com
2. Click **"Add new site"** → **"Import an existing project"**
3. Connect your Git provider (GitHub/GitLab/Bitbucket)
4. Select your repository: `notion-transaction-app`

## Step 3: Configure Build Settings

In Netlify dashboard → **Site settings** → **Build & deploy** → **Build settings**:

### Required Settings:

| Setting | Value |
|---------|-------|
| **Base directory** | `/` (or leave empty) |
| **Build command** | `npm install` |
| **Publish directory** | `public` ⚠️ **IMPORTANT** |
| **Functions directory** | `netlify/functions` (auto-detected) |

**Note:** The `netlify.toml` file will auto-configure most settings, but you should verify:
- **Publish directory** is set to `public`
- **Functions directory** is `netlify/functions`

## Step 4: Set Environment Variables

Go to **Site settings** → **Environment variables** → **Add variable**

Add each of these variables:

```
NOTION_API_KEY=your_notion_api_key_here
NOTION_TRANSACTIONS_DB_ID=your_transactions_database_id
NOTION_CATEGORIES_DB_ID=your_categories_database_id
NOTION_ACCOUNTS_DB_ID=your_accounts_database_id
SESSION_SECRET=your_strong_random_secret_here
APP_USERNAME=your_username_here
APP_PASSWORD_HASH=your_bcrypt_password_hash_here
NODE_ENV=production
```

### How to Generate Values:

**SESSION_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**APP_PASSWORD_HASH:**
```bash
node -e "const bcrypt = require('bcrypt'); bcrypt.hash('yourPassword', 12).then(console.log)"
```

## Step 5: Deploy

1. Click **"Deploy site"** in Netlify dashboard
2. Netlify will:
   - Install dependencies (`npm install`)
   - Build serverless functions
   - Deploy your site

3. Wait for deployment to complete (usually 1-2 minutes)

## Step 6: Verify Deployment

1. Netlify will provide a URL: `https://your-site-name.netlify.app`
2. Visit the URL and test:
   - Login page loads
   - Can log in with credentials
   - Transaction form works
   - API endpoints respond

## How It Works

### Architecture:

- **Static Files** (`public/`): HTML, CSS, JS files served directly by Netlify CDN
- **Serverless Function** (`netlify/functions/server.js`): Handles all API routes and app routing
- **Express App**: Wrapped in `serverless-http` to work as a Netlify Function

### Request Flow:

1. User visits `https://your-site.netlify.app/`
2. Netlify redirects to serverless function (via `netlify.toml`)
3. Express app handles routing:
   - `/login` → Login page
   - `/categories`, `/accounts`, etc. → API endpoints
   - `/` → Main app (index.html)

## Troubleshooting

### Build Fails

**Error: "serverless-http not found"**
- Solution: Ensure `npm install` runs successfully
- Check `package.json` includes `serverless-http`

**Error: "Cannot find module"**
- Solution: Verify all dependencies are in `package.json`
- Check build logs for missing modules

### Function Errors

**Check Function Logs:**
1. Go to Netlify dashboard
2. Click **"Functions"** tab
3. Click on `server` function
4. View logs for errors

**Common Issues:**
- Missing environment variables → Set all vars in dashboard
- Path errors → Check `netlify/functions/server.js` paths
- Session issues → Verify `SESSION_SECRET` is set

### Static Files Not Loading

**Issue: CSS/JS files return 404**
- Solution: Verify `Publish directory` is set to `public`
- Check that files exist in `public/` directory
- Review redirect rules in `netlify.toml`

### Timeout Errors

**Error: "Function execution timed out"**
- Netlify free tier: 10-second timeout
- Solution: Optimize Notion API calls or upgrade to Pro plan

## Files Created

- ✅ `netlify.toml` - Netlify configuration
- ✅ `netlify/functions/server.js` - Serverless function wrapper
- ✅ `package.json` - Updated with `serverless-http` dependency

## Important Notes

1. **Sessions**: Work with cookies (supported by Netlify Functions)
2. **Environment Variables**: Must be set in Netlify dashboard, not `.env` file
3. **HTTPS**: Always enabled on Netlify (sessions use `secure: true`)
4. **Cold Starts**: First request may be slower (~1-2 seconds)

## Support

If you encounter issues:
1. Check Netlify function logs
2. Verify all environment variables
3. Test locally first: `npm start`
4. Review `NETLIFY_SETTINGS.md` for exact dashboard settings
