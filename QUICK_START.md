# Quick Start Guide

## Setup (5 minutes)

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
```

Edit `.env`:
```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
VITE_API_URL=http://localhost:3000/api
```

### 3. Start Development Server
```bash
npm run dev
```

Visit: http://localhost:5173

## First Deployment (3 steps)

### Step 1: Connect GitHub
1. Sign in with Clerk
2. Go to **Integrations** (sidebar)
3. Click **Connect GitHub**
4. Authorize on GitHub

### Step 2: Deploy Repository
1. Go to **Deploy** (sidebar)
2. Find your repository
3. Click **Deploy**
4. Configure:
   - Project name
   - Branch
5. Click **Deploy**

### Step 3: Watch Progress
- Real-time logs appear
- Wait for completion
- Visit deployed URL

## Navigation

### Sidebar Routes
- **Overview** - Dashboard home
- **Deploy** - Deploy from GitHub
- **Projects** - Manage deployments
- **Marketplace** - Pre-built apps
- **Terminal** - SSH terminal
- **Integrations** - Connect services

## Key Features

### GitHub Integration
- OAuth connection
- Repository browser
- Branch selection
- One-click deploy

### Real-time Logs
- Socket.IO powered
- Live deployment progress
- Error tracking
- Success notifications

### Project Management
- View all deployments
- Stop/restart projects
- Delete deployments
- Open deployed URLs

## Common Tasks

### Deploy a Repository
```
Dashboard → Deploy → Select Repo → Configure → Deploy
```

### View Deployment Logs
```
Projects → Select Project → View Logs
```

### Stop a Deployment
```
Projects → Project Menu (⋮) → Stop
```

### Disconnect GitHub
```
Integrations → GitHub Card → Disconnect
```

## Troubleshooting

### GitHub Not Connecting
- Check backend is running
- Verify GITHUB_CLIENT_ID in backend .env
- Check callback URL matches

### Repositories Not Loading
- Ensure GitHub is connected
- Check API_URL in frontend .env
- Verify backend /github/repos endpoint

### Deployment Fails
- Check VPS SSH connection
- Verify VPS has Node.js, npm, PM2
- Check deployment logs for errors

### Socket.IO Not Working
- Ensure backend Socket.IO is running
- Check CORS configuration
- Verify API_URL is correct

## Development

### Run Development Server
```bash
npm run dev
```

### Type Check
```bash
npm run typecheck
```

### Lint Code
```bash
npm run lint
```

### Format Code
```bash
npm run format
```

### Build for Production
```bash
npm run build
```

## Project Structure

```
src/
├── components/
│   ├── ui/              # shadcn/ui components
│   ├── GitHubConnection.tsx
│   ├── RepoCard.tsx
│   ├── DeployModal.tsx
│   └── DeploymentLogs.tsx
├── pages/
│   ├── Integrations.tsx
│   ├── DeployFromGitHub.tsx
│   └── Projects.tsx
├── services/
│   ├── github.ts
│   └── projects.ts
└── App.tsx
```

## Next Steps

1. ✅ Connect GitHub account
2. ✅ Deploy first repository
3. ✅ View deployment logs
4. ✅ Manage projects
5. 🔄 Set up custom domains (coming soon)
6. 🔄 Configure environment variables (coming soon)
7. 🔄 Set up CI/CD (coming soon)

## Support

- Check [GITHUB_DEPLOYMENT_FRONTEND.md](GITHUB_DEPLOYMENT_FRONTEND.md) for detailed docs
- Review backend [GITHUB_DEPLOYMENT.md](../cloud-plateform-backend/GITHUB_DEPLOYMENT.md)
- Check [ARCHITECTURE.md](../cloud-plateform-backend/ARCHITECTURE.md) for system design

## Tips

- Use search to find repositories quickly
- Deploy to test branch first
- Check logs if deployment fails
- Stop unused deployments to save resources
- Keep GitHub token secure (never commit .env)
