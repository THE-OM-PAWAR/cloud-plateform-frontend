import { useLocation, Link } from 'react-router-dom';
import { UserButton, useUser } from '@clerk/clerk-react';
import { ThemeToggle } from './theme-toggle';
import { Button } from '@/components/ui/button';
import { Plus, FolderKanban } from 'lucide-react';

const routeTitles: Record<string, string> = {
  '/dashboard': 'Overview',
  '/create-project': 'New Deployment',
  '/apps': 'Marketplace',
  '/apps/deployments': 'My Deployments',
  '/bash': 'Terminal',
  '/settings': 'Settings',
  '/admin/apps': 'Admin — Apps',
};

export const Navbar = () => {
  const location = useLocation();
  const { user } = useUser();
  const title = routeTitles[location.pathname] ?? 'CloudOne';

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 sm:px-6">
      {/* Left — Projects (like Vercel) */}
      <div className="flex-1 flex items-center">
        <Button asChild size="sm" variant="ghost" className="hidden sm:flex gap-1.5 font-medium">
          <Link to="/dashboard">
            <FolderKanban className="h-3.5 w-3.5" />
            Projects
          </Link>
        </Button>
      </div>

      {/* Centre — page title */}
      <span className="text-sm font-medium text-foreground absolute left-1/2 -translate-x-1/2">
        {title}
      </span>

      {/* Right — actions */}
      <div className="flex-1 flex items-center justify-end gap-2">
        <Button asChild size="sm" variant="outline" className="hidden sm:flex gap-1.5">
          <Link to="/create-project">
            <Plus className="h-3.5 w-3.5" />
            Deploy
          </Link>
        </Button>

        <ThemeToggle />

        <div className="flex items-center gap-2 pl-2 border-l">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-medium leading-none">{user?.fullName}</p>
            <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-[140px]">
              {user?.primaryEmailAddress?.emailAddress}
            </p>
          </div>
          <UserButton
            appearance={{ elements: { avatarBox: 'w-8 h-8' } }}
            afterSignOutUrl="/sign-in"
          />
        </div>
      </div>
    </header>
  );
};
