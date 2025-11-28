'use client';

import { Bell, Search } from 'lucide-react';
import { Button, Input } from '@researchhive/ui';
import { UserButton } from '../auth/user-button';

interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  role?: string;
}

interface HeaderProps {
  user: User | null;
  isDemoMode?: boolean;
}

export function Header({ user, isDemoMode = false }: HeaderProps) {
  return (
    <header className="h-16 border-b border-border bg-card px-6 flex items-center justify-between">
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search research, projects, or agents..."
            className="pl-10"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        {isDemoMode && (
          <div className="text-xs px-2 py-1 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 rounded border border-yellow-500/20">
            Demo Mode
          </div>
        )}
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
        </Button>
        <UserButton user={user} />
      </div>
    </header>
  );
}
