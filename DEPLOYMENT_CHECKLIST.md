# Netlify Deployment Checklist

## Current Issue
The browser is requesting `/public/src/loader.js` but the HTML has `/src/loader.js`. This indicates cached HTML or an outdated deployment.

## Immediate Actions Required

### 1. Clear Netlify Cache and Redeploy
In Netlify Dashboard:
1. Go to **Deploys** tab
2. Click **"Trigger deploy"** → **"Clear cache and deploy site"**
3. Wait for deployment to complete (usually 1-2 minutes)

### 2. Clear Browser Cache
- **Hard refresh:** `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
- **Or:** Open DevTools → Network tab → Check "Disable cache" → Refresh

### 3. Verify Deployment
After redeploy, test these URLs directly:
- `https://expensoooo.netlify.app/src/loader.js` (should work)
- `https://expensoooo.netlify.app/public/src/loader.js` (fallback, should also work)
- `https://expensoooo.netlify.app/src/tailwind-custom.css` (should work)

### 4. Check Build Settings
Verify in Netlify Dashboard → Site settings → Build & deploy:
- ✅ **Publish directory:** `public`
- ✅ **Build command:** `npm install`
- ✅ **Functions directory:** `netlify/functions`

### 5. Verify Files Are Deployed
In Netlify Dashboard → Deploys → Latest deploy:
- Check "Publish directory" section
- Verify these files exist:
  - `src/loader.js`
  - `src/tailwind-custom.css`
  - `index.html`
  - `_redirects`

## What's Already Fixed

✅ Serverless function supports both `/src/` and `/public/src/` paths
✅ HTML files use correct `/src/` paths
✅ `_redirects` file is configured correctly
✅ Cache headers updated to prevent HTML caching

## If Issues Persist

1. **Check Function Logs:**
   - Netlify Dashboard → Functions → `server`
   - Look for errors when accessing `/src/loader.js` or `/public/src/loader.js`

2. **Verify Branch:**
   - Ensure Netlify is deploying from `code-cleanup-review` branch (or merge to `main`)

3. **Test Locally:**
   ```bash
   npm start
   ```
   - Visit `http://localhost:3000`
   - Verify paths work locally

4. **Check Git:**
   - Verify latest commit is pushed: `git log --oneline -1`
   - Check remote: `git remote -v`

## Expected Behavior After Fix

- ✅ HTML loads with `/src/` paths
- ✅ `loader.js` loads successfully
- ✅ `tailwind-custom.css` loads successfully
- ✅ `window.loadModules` function is available
- ✅ React app initializes correctly
