'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@researchhive/ui';
import { LogOut, User } from 'lucide-react';

interface UserButtonProps {
  user?: {
    name?: string;
    email?: string;
    picture?: string;
  } | null;
}

export function UserButton({ user }: UserButtonProps) {
  const router = useRouter();

  const handleSignOut = async () => {
    // Redirect to Logto sign-out endpoint
    router.push('/api/logto/sign-out');
  };

  const handleSignIn = () => {
    // Redirect to Logto sign-in endpoint
    router.push('/api/logto/sign-in');
  };

  if (!user) {
    return (
      <Button onClick={handleSignIn} variant="outline" size="sm">
        <User className="h-4 w-4 mr-2" />
        Sign In
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        {user.picture ? (
          <img
            src={user.picture}
            alt={user.name || 'User'}
            className="w-8 h-8 rounded-full"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-4 w-4 text-primary" />
          </div>
        )}
        <div className="text-sm">
          <div className="font-medium">{user.name || 'User'}</div>
          <div className="text-xs text-muted-foreground">{user.email}</div>
        </div>
      </div>
      <Button onClick={handleSignOut} variant="ghost" size="sm">
        <LogOut className="h-4 w-4" />
      </Button>
    </div>
  );
}
