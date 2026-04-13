import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Breadcrumb {
  label: string;
  to?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  breadcrumbs?: Breadcrumb[];
  className?: string;
}

export const PageHeader = ({
  title,
  description,
  actions,
  breadcrumbs,
  className,
}: PageHeaderProps) => {
  return (
    <div className={cn('space-y-4 mb-8', className)}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <div className="flex items-center gap-2 text-sm text-zinc-500">
          {breadcrumbs.map((crumb, index) => (
            <div key={index} className="flex items-center gap-2">
              {crumb.to ? (
                <Link
                  to={crumb.to}
                  className="hover:text-zinc-900 transition-colors"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-zinc-900">{crumb.label}</span>
              )}
              {index < breadcrumbs.length - 1 && (
                <ChevronRight className="w-4 h-4" />
              )}
            </div>
          ))}
        </div>
      )}
      
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-zinc-900">
            {title}
          </h1>
          {description && (
            <p className="text-sm text-zinc-600">
              {description}
            </p>
          )}
        </div>
        
        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};
