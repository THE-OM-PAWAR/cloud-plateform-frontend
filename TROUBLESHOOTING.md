# Troubleshooting Guide

## Common Issues and Solutions

### 1. Module Export Error

**Error:**
```
The requested module '/src/services/github.ts' does not provide an export named 'GitHubStatus'
```

**Solution:**

#### Option A: Clear Vite Cache (Recommended)

**Windows:**
```bash
# Run the fix script
fix-cache.bat

# Or manually:
rmdir /s /q node_modules\.vite
rmdir /s /q dist
npm run dev
```

**Mac/Linux:**
```bash
# Run the fix script
chmod +x fix-cache.sh
./fix-cache.sh

# Or manually:
rm -rf node_modules/.vite
rm -rf dist
npm run dev
```

#### Option B: Hard Refresh Browser
1. Stop the dev server (Ctrl+C)
2. Clear Vite cache: `rm -rf node_modules/.vite`
3. Start dev server: `npm run dev`
4. Hard refresh browser: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)

#### Option C: Restart Everything
```bash
# Stop dev server
# Then:
npm run dev
```

### 2. API Connection Issues

**Error:**
```
Network Error / Failed to fetch
```

**Solution:**
1. Check backend is running on port 3000
2. Verify `.env` file:
   ```env
   VITE_API_URL=http://localhost:3000/api
   ```
3. Check CORS settings in backend
4. Restart both frontend and backend

### 3. GitHub OAuth Not Working

**Error:**
```
Failed to initiate GitHub connection
```

**Solution:**
1. Check backend `.env` has:
   ```env
   GITHUB_CLIENT_ID=your_client_id
   GITHUB_CLIENT_SECRET=your_secret
   GITHUB_REDIRECT_URI=http://localhost:3000/api/github/callback
   ```
2. Verify GitHub OAuth app callback URL matches
3. Check backend logs for errors

### 4. Repositories Not Loading

**Error:**
```
Failed to load repositories
```

**Solution:**
1. Ensure GitHub is connected first
2. Check browser console for errors
3. Verify backend `/api/github/repos` endpoint works
4. Check Clerk token is valid

### 5. Socket.IO Connection Failed

**Error:**
```
Socket connection error
```

**Solution:**
1. Check backend Socket.IO is running
2. Verify API_URL in `.env` is correct
3. Check CORS configuration in backend
4. Ensure port 3000 is not blocked by firewall

### 6. TypeScript Errors

**Error:**
```
Cannot find module '@/services/github'
```

**Solution:**
1. Check `tsconfig.json` has path aliases configured
2. Restart TypeScript server in VS Code:
   - `Ctrl+Shift+P` → "TypeScript: Restart TS Server"
3. Check file exists at correct path

### 7. Build Errors

**Error:**
```
Build failed
```

**Solution:**
```bash
# Clean and rebuild
rm -rf node_modules/.vite
rm -rf dist
npm run build
```

### 8. Clerk Authentication Issues

**Error:**
```
Missing Clerk Publishable Key
```

**Solution:**
1. Check `.env` file exists
2. Verify `VITE_CLERK_PUBLISHABLE_KEY` is set
3. Restart dev server after changing `.env`

### 9. Component Not Found

**Error:**
```
Module not found: Can't resolve '@/components/...'
```

**Solution:**
1. Check file exists at correct path
2. Verify import path is correct
3. Check `tsconfig.json` path aliases
4. Restart dev server

### 10. Deployment Logs Not Showing

**Issue:**
Logs not appearing in real-time

**Solution:**
1. Check Socket.IO connection in browser console
2. Verify backend is emitting events
3. Check socket ID is being sent with deploy request
4. Look for errors in browser console

## Quick Fixes

### Reset Everything
```bash
# Stop all servers
# Then:
rm -rf node_modules/.vite
rm -rf dist
npm run dev
```

### Check Environment
```bash
# Verify .env file
cat .env

# Should show:
# VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
# VITE_API_URL=http://localhost:3000/api
```

### Verify Backend
```bash
# Test backend health
curl http://localhost:3000/api/health

# Test GitHub status (with token)
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/api/github/status
```

### Browser DevTools
1. Open DevTools (F12)
2. Check Console for errors
3. Check Network tab for failed requests
4. Check Application → Local Storage for Clerk session

## Still Having Issues?

### Check Logs
1. **Frontend Console**: F12 → Console
2. **Backend Logs**: Terminal running backend
3. **Network Tab**: F12 → Network

### Verify Setup
- [ ] Backend running on port 3000
- [ ] Frontend running on port 5173
- [ ] `.env` files configured
- [ ] GitHub OAuth app created
- [ ] Clerk project created
- [ ] MongoDB running

### Common Mistakes
- ❌ Wrong API URL in `.env`
- ❌ Backend not running
- ❌ GitHub OAuth callback URL mismatch
- ❌ Clerk key not set
- ❌ CORS not configured
- ❌ Firewall blocking ports

### Get Help
1. Check error message carefully
2. Look in browser console
3. Check backend logs
4. Review documentation
5. Verify all environment variables

## Prevention

### Best Practices
1. Always clear cache after pulling changes
2. Restart dev server after `.env` changes
3. Check both frontend and backend logs
4. Use hard refresh in browser
5. Keep dependencies updated

### Development Workflow
```bash
# Start backend first
cd cloud-plateform-backend
npm run dev

# Then start frontend
cd cloud-plateform-frontend
npm run dev
```

### Before Deploying
- [ ] Run `npm run typecheck`
- [ ] Run `npm run lint`
- [ ] Test all features
- [ ] Check production `.env`
- [ ] Test with production API
