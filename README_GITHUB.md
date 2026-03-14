# Cloud Platform Frontend - GitHub Deployment

Modern deployment platform frontend with GitHub integration, built with React, TypeScript, and Tailwind CSS.

## 🚀 Features

- **GitHub OAuth** - Connect and manage GitHub account
- **Repository Browser** - Browse and search repositories
- **One-Click Deploy** - Deploy repositories with configuration
- **Real-time Logs** - Watch deployment progress live
- **Project Management** - Stop, restart, delete deployments
- **Dark Mode** - Beautiful dark theme by default
- **Responsive** - Works on mobile, tablet, and desktop

## 📦 Quick Start

```bash
# Install
npm install

# Configure
cp .env.example .env
# Edit .env with your values

# Run
npm run dev
```

Visit: http://localhost:5173

## 📚 Documentation

- [Quick Start Guide](QUICK_START.md) - Get started in 5 minutes
- [Implementation Details](IMPLEMENTATION_SUMMARY.md) - What was built
- [Full Documentation](GITHUB_DEPLOYMENT_FRONTEND.md) - Complete guide

## 🎯 Key Pages

- `/dashboard/integrations` - Connect GitHub
- `/dashboard/deploy` - Deploy repositories
- `/dashboard/projects` - Manage deployments

## 🛠️ Tech Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- Clerk Auth
- Socket.IO
- Axios

## 📖 Usage

See [QUICK_START.md](QUICK_START.md) for detailed usage instructions.

## 🔧 Development

```bash
npm run dev        # Start dev server
npm run build      # Build for production
npm run typecheck  # Type check
npm run lint       # Lint code
```

## 📝 License

MIT
