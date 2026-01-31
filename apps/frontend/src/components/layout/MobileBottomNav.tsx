import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Calendar, BarChart3, Settings, type LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  { name: 'Events', href: '/', icon: Calendar },
  { name: 'Portfolio', href: '/portfolio', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function MobileBottomNav() {
  const location = useLocation();

  const isActive = (href: string) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <nav className="bg-slate-800/95 backdrop-blur-lg border-t border-slate-700 safe-bottom">
      <div className="flex items-center justify-around h-16">
        {navItems.map(item => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'flex flex-col items-center justify-center w-full h-full touch-target tap-highlight-none no-select',
                'transition-colors duration-200',
                active
                  ? 'text-blue-400'
                  : 'text-slate-400 active:text-slate-300'
              )}
            >
              <item.icon
                className={cn(
                  'h-6 w-6 mb-1 transition-transform duration-200',
                  active && 'scale-110'
                )}
              />
              <span
                className={cn(
                  'text-[10px] font-medium',
                  active && 'font-semibold'
                )}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
