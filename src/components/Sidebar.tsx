import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Plus,
  Package,
  Terminal,
  Layers,
  ChevronLeft,
  ChevronRight,
  Settings,
  ShieldCheck,
  Plug,
  FileSearch,
} from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const navItems = [
  { label: 'Overview', icon: LayoutDashboard, href: '/dashboard' },
  { label: 'Deploy', icon: Plus, href: '/dashboard/deploy' },
  { label: 'Projects', icon: Layers, href: '/dashboard/projects' },
  { label: 'Code Reviewer', icon: FileSearch, href: '/dashboard/reviewer' },
  { label: 'Marketplace', icon: Package, href: '/apps' },
  { label: 'Terminal', icon: Terminal, href: '/bash' },
];

const bottomItems = [
  { label: 'Integrations', icon: Plug, href: '/dashboard/integrations' },
  { label: 'Settings', icon: Settings, href: '/settings' },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export const Sidebar = ({ collapsed, onToggle }: SidebarProps) => {
  const location = useLocation();
  const { user } = useUser();
  const isAdmin = user?.publicMetadata?.role === 'admin';

  const isActive = (href: string) => location.pathname === href;

  const allBottomItems = isAdmin
    ? [...bottomItems, { label: 'Admin Apps', icon: ShieldCheck, href: '/admin/apps' }]
    : bottomItems;

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          'relative flex flex-col h-screen border-r bg-background transition-all duration-300 shrink-0',
          collapsed ? 'w-14' : 'w-56'
        )}
      >
        {/* Logo */}
        <div className={cn('flex items-center h-14 border-b px-3', collapsed ? 'justify-center' : 'gap-2 px-4')}>
          <div className="flex items-center justify-center w-7 h-7 rounded-md bg-foreground text-background font-bold text-sm shrink-0">
            C
          </div>
          {!collapsed && (
            <span className="font-semibold text-sm truncate">CloudOne</span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 space-y-0.5 px-2 overflow-y-auto">
          {navItems.map(({ label, icon: Icon, href }) => {
            const active = isActive(href);
            const item = (
              <Link
                key={href}
                to={href}
                className={cn(
                  'flex items-center gap-3 rounded-md px-2 py-2 text-sm transition-colors',
                  collapsed ? 'justify-center' : '',
                  active
                    ? 'bg-accent text-accent-foreground font-medium'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span>{label}</span>}
              </Link>
            );

            return collapsed ? (
              <Tooltip key={href}>
                <TooltipTrigger asChild>{item}</TooltipTrigger>
                <TooltipContent side="right">{label}</TooltipContent>
              </Tooltip>
            ) : item;
          })}
        </nav>

        {/* Bottom items */}
        <div className="py-3 space-y-0.5 px-2 border-t">
          {allBottomItems.map(({ label, icon: Icon, href }) => {
            const active = isActive(href);
            const item = (
              <Link
                key={href}
                to={href}
                className={cn(
                  'flex items-center gap-3 rounded-md px-2 py-2 text-sm transition-colors',
                  collapsed ? 'justify-center' : '',
                  active
                    ? 'bg-accent text-accent-foreground font-medium'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span>{label}</span>}
              </Link>
            );

            return collapsed ? (
              <Tooltip key={href}>
                <TooltipTrigger asChild>{item}</TooltipTrigger>
                <TooltipContent side="right">{label}</TooltipContent>
              </Tooltip>
            ) : item;
          })}
        </div>

        {/* Collapse toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="absolute -right-3 top-16 h-6 w-6 rounded-full border bg-background shadow-sm z-10"
        >
          {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </Button>
      </aside>
    </TooltipProvider>
  );
};
