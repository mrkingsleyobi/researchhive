'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@vibecast/ui';
import {
  Home,
  Search,
  FileText,
  Users,
  Settings,
  Sparkles,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Research', href: '/dashboard/research', icon: Search },
  { name: 'Projects', href: '/dashboard/projects', icon: FileText },
  { name: 'AI Agents', href: '/dashboard/agents', icon: Sparkles },
  { name: 'Team', href: '/dashboard/team', icon: Users },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-card border-r border-border">
      <div className="flex flex-col h-full">
        <div className="p-6">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            VibecastAI
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Content Intelligence Platform
          </p>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-medium text-primary">U</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">User Account</p>
              <p className="text-xs text-muted-foreground truncate">
                user@example.com
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
