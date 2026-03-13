import { UserMenu } from './UserMenu';
import { Link, useLocation } from 'react-router-dom';
import { Rocket } from 'lucide-react';

export const DashboardHeader = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/dashboard" className="flex items-center gap-2">
              <Rocket className="h-5 w-5" />
              <span className="font-semibold">CloudDeploy</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-sm">
              <Link 
                to="/dashboard" 
                className={`transition-colors hover:text-foreground ${
                  isActive('/dashboard') ? 'text-foreground font-medium' : 'text-foreground/60'
                }`}
              >
                Overview
              </Link>
              <Link 
                to="/create-project" 
                className={`transition-colors hover:text-foreground ${
                  isActive('/create-project') ? 'text-foreground font-medium' : 'text-foreground/60'
                }`}
              >
                Deploy
              </Link>
              <Link 
                to="/apps" 
                className={`transition-colors hover:text-foreground ${
                  isActive('/apps') ? 'text-foreground font-medium' : 'text-foreground/60'
                }`}
              >
                Marketplace
              </Link>
              <Link 
                to="/bash" 
                className={`transition-colors hover:text-foreground ${
                  isActive('/bash') ? 'text-foreground font-medium' : 'text-foreground/60'
                }`}
              >
                Terminal
              </Link>
            </nav>
          </div>
          <UserMenu />
        </div>
      </div>
    </header>
  );
};
