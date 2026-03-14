# GitHub Deployment Frontend

Frontend for the cloud deployment platform with GitHub integration.

## New Features

### 1. GitHub Integration Page (`/dashboard/integrations`)
- Connect/disconnect GitHub account
- View connection status
- Manage integrations

### 2. Deploy from GitHub Page (`/dashboard/deploy`)
- Browse GitHub repositories
- Search repositories
- Deploy with one click
- Real-time deployment logs
- Socket.IO integration for live updates

### 3. Projects Page (`/dashboard/projects`)
- View all deployed projects
- Stop/restart/delete deployments
- View project status
- Quick actions menu

## New Components

### Services
- `src/services/github.ts` - GitHub API integration
- `src/services/projects.ts` - Projects API integration

### Components
- `src/components/GitHubConnection.tsx` - GitHub connection card
- `src/components/RepoCard.tsx` - Repository card with deploy button
- `src/components/DeployModal.tsx` - Deployment configuration modal
- `src/components/DeploymentLogs.tsx` - Real-time deployment logs viewer

### Pages
- `src/pages/Integrations.tsx` - Integrations management
- `src/pages/DeployFromGitHub.tsx` - Repository browser and deployment
- `src/pages/Projects.tsx` - Projects management

## Setup

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
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_key
VITE_API_URL=http://localhost:3000/api
```

### 3. Start Development Server
```bash
npm run dev
```

## Usage Flow

### Connect GitHub
1. Navigate to `/dashboard/integrations`
2. Click "Connect GitHub"
3. Authorize on GitHub
4. Redirected back with connection confirmed

### Deploy Repository
1. Navigate to `/dashboard/deploy`
2. Browse your repositories
3. Click "Deploy" on desired repo
4. Configure project name and branch
5. Click "Deploy"
6. Watch real-time logs
7. Deployment completes

### Manage Projects
1. Navigate to `/dashboard/projects`
2. View all deployments
3. Use dropdown menu to:
   - Stop deployment
   - Restart deployment
   - Open deployed URL
   - Delete deployment

## API Integration

### GitHub API
```typescript
// Get OAuth URL
const authUrl = await githubApi.getAuthUrl(token);

// Check connection status
const status = await githubApi.getStatus(token);

// Get repositories
const repos = await githubApi.getRepositories(token);

// Get branches
const branches = await githubApi.getBranches(token, owner, repo);

// Disconnect
await githubApi.disconnect(token);
```

### Projects API
```typescript
// Deploy project
await projectsApi.deploy(token, {
  repoOwner: 'username',
  repoName: 'repo',
  branch: 'main'
}, socketId);

// Get all projects
const projects = await projectsApi.getAll(token);

// Stop project
await projectsApi.stop(token, projectId);

// Restart project
await projectsApi.restart(token, projectId);

// Delete project
await projectsApi.delete(token, projectId);
```

## Real-time Updates

Socket.IO connection for deployment logs:

```typescript
const socket = io(API_URL);

socket.on('deployment:progress', (data) => {
  // Handle progress update
  console.log(data.message);
});

socket.on('deployment:error', (data) => {
  // Handle error
  console.error(data.message);
});
```

## Routing

New routes added:
- `/dashboard/integrations` - Integrations page
- `/dashboard/deploy` - Deploy from GitHub
- `/dashboard/projects` - Projects management

## Styling

- Dark mode by default
- Tailwind CSS for styling
- shadcn/ui components
- Responsive design
- Clean, minimal UI similar to Vercel

## Components Structure

```
src/
├── components/
│   ├── GitHubConnection.tsx    # GitHub connection card
│   ├── RepoCard.tsx            # Repository card
│   ├── DeployModal.tsx         # Deployment modal
│   ├── DeploymentLogs.tsx      # Logs viewer
│   └── Sidebar.tsx             # Updated with new routes
├── pages/
│   ├── Integrations.tsx        # Integrations page
│   ├── DeployFromGitHub.tsx    # Deploy page
│   └── Projects.tsx            # Projects page
├── services/
│   ├── github.ts               # GitHub API
│   └── projects.ts             # Projects API
└── App.tsx                     # Updated routes
```

## Features

### GitHub Connection
- ✅ OAuth flow
- ✅ Connection status
- ✅ Disconnect option
- ✅ Visual feedback

### Repository Browser
- ✅ List all repositories
- ✅ Search functionality
- ✅ Public/private badges
- ✅ Language tags
- ✅ Last updated info
- ✅ Deploy button

### Deployment
- ✅ Project name configuration
- ✅ Branch selection
- ✅ Real-time logs
- ✅ Status indicators
- ✅ Error handling
- ✅ Success notifications

### Project Management
- ✅ List all projects
- ✅ Status badges
- ✅ Stop/restart/delete actions
- ✅ Open deployed URL
- ✅ Project details
- ✅ Responsive grid layout

## Error Handling

All API calls include error handling with toast notifications:
- Connection errors
- API failures
- Deployment errors
- Network issues

## TypeScript

Fully typed with TypeScript:
- API response types
- Component props
- Service interfaces
- State management

## Testing

```bash
# Type check
npm run typecheck

# Lint
npm run lint

# Format
npm run format
```

## Build

```bash
npm run build
```

## Production Considerations

- Set production API URL in environment
- Enable HTTPS
- Configure CORS properly
- Set up error tracking
- Add analytics
- Optimize bundle size
- Add loading states
- Implement retry logic
- Add offline support
