# Netlify Troubleshooting Guide

## Issue: Static Files Returning 404

If you're seeing 404 errors for files like `/src/loader.js` or `/src/tailwind-custom.css`, follow these steps:

### Step 1: Verify Build Settings

In Netlify Dashboard → Site settings → Build & deploy:

- **Publish directory:** Must be set to `public` (not `/public` or empty)
- **Functions directory:** `netlify/functions`

### Step 2: Check File Structure

After deployment, verify files exist:
- `public/src/loader.js` should be accessible at `https://your-site.netlify.app/src/loader.js`
- `public/src/tailwind-custom.css` should be accessible at `https://your-site.netlify.app/src/tailwind-custom.css`

### Step 3: Test Static File Access

Try accessing these URLs directly in your browser:
- `https://your-site.netlify.app/src/loader.js`
- `https://your-site.netlify.app/src/tailwind-custom.css`

If these return 404, the files aren't being deployed correctly.

### Step 4: Check Deployment Logs

1. Go to Netlify Dashboard → Deploys
2. Click on the latest deploy
3. Check the "Publish directory" section
4. Verify files are listed: `src/loader.js`, `src/tailwind-custom.css`, etc.

### Step 5: Verify _redirects File

The `public/_redirects` file should exist and contain:
```
/* /.netlify/functions/server 200
```

**Important:** Netlify serves static files BEFORE processing redirects, so static files should work even with the catch-all redirect.

### Step 6: Clear Cache and Redeploy

1. In Netlify Dashboard → Deploys
2. Click "Trigger deploy" → "Clear cache and deploy site"
3. Wait for deployment to complete
4. Test again

### Step 7: Check Function Logs

If static files still don't work, check if they're being served by the function:

1. Go to Netlify Dashboard → Functions
2. Click on `server` function
3. Check logs for requests to `/src/loader.js`
4. Look for any errors

### Common Issues

**Issue:** Files return 404
- **Solution:** Verify `publish = "public"` in `netlify.toml` and Netlify dashboard

**Issue:** Files load but are empty
- **Solution:** Check file encoding and ensure files are committed to git

**Issue:** Redirects interfering with static files
- **Solution:** Netlify should serve static files first, but if issues persist, try removing the catch-all redirect temporarily to test

### Alternative: Use Absolute Paths

If static files still don't work, you can try using absolute URLs in `index.html`:

```html
<script src="https://your-site.netlify.app/src/loader.js"></script>
```

But this is not recommended for production.

### Still Having Issues?

1. Check Netlify function logs for detailed errors
2. Verify all environment variables are set
3. Test locally first: `npm start` and verify paths work
4. Check browser console for specific error messages
