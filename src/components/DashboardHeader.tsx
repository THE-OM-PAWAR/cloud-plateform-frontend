import { UserMenu } from './UserMenu';
import { Link } from 'react-router-dom';
import { Rocket } from 'lucide-react';

export const DashboardHeader = () => {
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
                className="text-foreground/60 transition-colors hover:text-foreground"
              >
                Overview
              </Link>
              <Link 
                to="/create-project" 
                className="text-foreground/60 transition-colors hover:text-foreground"
              >
                Deploy
              </Link>
              <Link 
                to="/bash" 
                className="text-foreground/60 transition-colors hover:text-foreground"
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
