import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { cn } from '../../lib/utils';

interface MobileHeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  className?: string;
}

export function MobileHeader({
  title,
  showBack = false,
  onBack,
  rightAction,
  className,
}: MobileHeaderProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <header
      className={cn(
        'bg-slate-900/95 backdrop-blur-lg border-b border-slate-700/50 safe-top',
        className
      )}
    >
      <div className="flex items-center justify-between h-14 px-4">
        {/* Left section - Back button or spacer */}
        <div className="w-12 flex items-center">
          {showBack && (
            <button
              onClick={handleBack}
              className="touch-target flex items-center justify-center -ml-2 text-slate-400 active:text-white tap-highlight-none no-select"
              aria-label="Go back"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}
        </div>

        {/* Center section - Title */}
        <h1 className="flex-1 text-center text-lg font-semibold text-white truncate">
          {title}
        </h1>

        {/* Right section - Action button or spacer */}
        <div className="w-12 flex items-center justify-end">{rightAction}</div>
      </div>
    </header>
  );
}

interface MobilePageHeaderProps {
  title: string;
  subtitle?: string;
  rightAction?: React.ReactNode;
  className?: string;
}

export function MobilePageHeader({
  title,
  subtitle,
  rightAction,
  className,
}: MobilePageHeaderProps) {
  return (
    <div className={cn('px-4 py-4 bg-slate-900', className)}>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white lg:text-3xl">{title}</h1>
          {subtitle && (
            <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
          )}
        </div>
        {rightAction && <div className="ml-4">{rightAction}</div>}
      </div>
    </div>
  );
}
