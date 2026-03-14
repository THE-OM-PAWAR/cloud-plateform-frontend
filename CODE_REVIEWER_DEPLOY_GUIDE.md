# Code Reviewer - Deploy Guide

## Quick Start

### Step 1: Review Your Repository
1. Navigate to **Code Reviewer** from the sidebar
2. Select a repository from your GitHub account
3. Click **Start Review**
4. Wait for AI analysis to complete

### Step 2: Fix Repository (Optional)
1. After review completes, click **Fix Repository**
2. This will generate and push documentation files:
   - `skill.md` - Required technologies and skills
   - `rule.md` - Development rules and guidelines
   - `task.md` - List of improvements needed
   - `documentation.md` - Complete AI review report
3. Wait for files to be pushed to your repository

### Step 3: Deploy Your Project
1. After fix completes, click **Deploy Project**
2. Watch real-time deployment logs in the terminal
3. Wait for deployment to complete (~1-2 minutes)
4. You'll be automatically redirected to the Projects page

## What Happens During Deployment?

### Automatic Process
The deployment is fully automated:

1. **Clone Repository** - Your repo is cloned to the server
2. **Detect Project Type** - Automatically detects:
   - Next.js (SSR or Static)
   - React (CRA or Vite)
   - Node.js Server
   - Static HTML/CSS/JS
   - Angular, Vue, and more
3. **Install Dependencies** - Runs `npm install`
4. **Build Project** - Runs build command if needed
5. **Start Application** - Starts with PM2 process manager
6. **Configure Nginx** - Sets up reverse proxy
7. **Generate SSL** - Creates HTTPS certificate with Let's Encrypt

### Subdomain Generation
Your subdomain is automatically generated from your repository name:
- Repository: `my-awesome-app`
- Subdomain: `my-awesome-app.aitoyz.in`
- URL: `https://my-awesome-app.aitoyz.in`

Special characters are converted to hyphens for valid subdomain format.

## Real-Time Deployment Logs

During deployment, you'll see logs like:

```
🚀 Starting deployment for owner/repo
📝 Subdomain: my-app.aitoyz.in
🔌 Port: 3001
📁 Deployment directory: /home/ubuntu/apps/my-app
📦 Cloning repository...
✅ Repository cloned
🔍 Detecting project type...
📋 Project type: Next.js (SSR)
📦 Installing dependencies...
✅ Dependencies installed
🔧 Setting up environment variables...
✅ Environment variables configured
🔨 Building project...
✅ Build completed (.next)
🚀 Starting application with PM2...
✅ Application started with PM2
🌐 Configuring Nginx reverse proxy...
✅ Nginx configured for my-app.aitoyz.in
🔒 SSL certificate generated - HTTPS enabled
🎉 Deployment completed successfully!
🌐 Your app is live at: https://my-app.aitoyz.in
```

## Deployment States

### Success Screen
After fix completes, you'll see:
- ✅ Review Completed!
- List of files added to repository
- **View Repository** button (opens GitHub)
- **Deploy Project** button (starts deployment)

### Deployment Progress
During deployment:
- Terminal showing real-time logs
- Deployment status updates
- Progress indicators

### After Deployment
- Automatic redirect to Projects page
- Your deployed project appears in the list
- Click on project to view details, logs, and manage

## Managing Deployed Projects

From the Projects page, you can:
- **View Logs** - See deployment and runtime logs
- **Stop** - Stop the running application
- **Restart** - Restart the application
- **Delete** - Remove the deployment completely

## Supported Project Types

### Automatically Detected:
- ✅ Next.js (SSR and Static Export)
- ✅ Create React App
- ✅ Vite (React, Vue, Svelte)
- ✅ Angular
- ✅ Vue CLI
- ✅ Node.js/Express servers
- ✅ Static HTML/CSS/JS sites

### Build Commands:
The system automatically runs the appropriate build command:
- Next.js: `npm run build`
- React: `npm run build`
- Vite: `npm run build`
- Custom: Uses `package.json` scripts

### Start Commands:
Applications are started with PM2:
- Next.js SSR: `npm start`
- Static sites: `serve -s [build-dir]`
- Node servers: `npm start`

## Environment Variables

Default environment variables are automatically set:
```bash
PORT=3001              # Assigned port
NODE_ENV=production    # Production mode
NEXT_TELEMETRY_DISABLED=1  # Disable Next.js telemetry
```

## SSL/HTTPS

All deployments automatically get:
- ✅ Free SSL certificate from Let's Encrypt
- ✅ HTTPS enabled by default
- ✅ Automatic certificate renewal
- ✅ HTTP to HTTPS redirect

## Troubleshooting

### Deployment Failed
If deployment fails:
1. Check the deployment logs for errors
2. Verify your repository has correct configuration
3. Ensure `package.json` has valid scripts
4. Check if build command succeeds locally

### Common Issues

**Missing Dependencies**
- Ensure all dependencies are in `package.json`
- Don't rely on global packages

**Build Errors**
- Test build locally: `npm run build`
- Check for environment-specific code
- Verify all imports are correct

**Port Already in Use**
- System automatically assigns available ports
- If issue persists, contact support

**SSL Certificate Failed**
- Deployment still works with HTTP
- SSL generation may take a few minutes
- Check domain DNS settings

## Best Practices

### Before Deployment
1. ✅ Test build locally
2. ✅ Ensure all dependencies are listed
3. ✅ Remove sensitive data from code
4. ✅ Use environment variables for secrets
5. ✅ Test in production mode locally

### Repository Structure
```
your-repo/
├── package.json       # Required for Node projects
├── .gitignore        # Exclude node_modules
├── README.md         # Project documentation
└── src/              # Source code
```

### Environment Variables
- Never commit `.env` files
- Use platform environment variable management
- Document required variables in README

## Integration with Code Reviewer

The deployment feature is seamlessly integrated:

1. **Review** → Analyzes your code and detects issues
2. **Fix** → Generates documentation and pushes to repo
3. **Deploy** → Automatically deploys the reviewed project

This creates a complete workflow:
- AI reviews your code
- Generates improvement documentation
- Deploys your application
- All in one seamless flow!

## Next Steps

After deployment:
1. Visit your deployed URL
2. Test your application
3. Monitor logs for any issues
4. Make updates and redeploy as needed

## Support

If you encounter issues:
- Check deployment logs in the Projects page
- Review this guide for common solutions
- Contact support with deployment ID

---

**Happy Deploying! 🚀**
