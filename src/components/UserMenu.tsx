import { UserButton, useUser } from '@clerk/clerk-react';
import { ThemeToggle } from './theme-toggle';

export const UserMenu = () => {
  const { user } = useUser();

  return (
    <div className="flex items-center gap-3">
      <ThemeToggle />
      <div className="text-right hidden sm:block">
        <p className="text-sm font-medium">{user?.fullName}</p>
        <p className="text-xs text-muted-foreground">{user?.primaryEmailAddress?.emailAddress}</p>
      </div>
      <UserButton 
        appearance={{
          elements: {
            avatarBox: "w-9 h-9"
          }
        }}
        afterSignOutUrl="/sign-in"
      />
    </div>
  );
};
