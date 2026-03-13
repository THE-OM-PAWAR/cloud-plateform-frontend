import { UserButton, useUser } from '@clerk/clerk-react';

export const UserMenu = () => {
  const { user } = useUser();

  return (
    <div className="flex items-center gap-3">
      <div className="text-right hidden sm:block">
        <p className="text-sm font-medium text-gray-900">{user?.fullName}</p>
        <p className="text-xs text-gray-500">{user?.primaryEmailAddress?.emailAddress}</p>
      </div>
      <UserButton 
        appearance={{
          elements: {
            avatarBox: "w-10 h-10"
          }
        }}
        afterSignOutUrl="/sign-in"
      />
    </div>
  );
};
