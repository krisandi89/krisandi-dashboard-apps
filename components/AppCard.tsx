'use client';

import { App } from '@/lib/types';
import { useAuth } from '@/components/AuthProvider';
import { ExternalLink, Pencil, Trash2, Globe, Server, Pin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface AppCardProps {
  app: App;
  onEdit: (app: App) => void;
  onDelete: (app: App) => void;
  index: number; // for staggered animation
}

export function AppCard({ app, onEdit, onDelete, index }: AppCardProps) {
  const { isAdmin } = useAuth();

  const handleClick = () => {
    window.open(app.url, '_blank', 'noopener,noreferrer');
  };

  const renderIcon = () => {
    if (app.icon) {
      return <span className="text-4xl">{app.icon}</span>;
    }
    return app.type === 'local' ? (
      <Server className="w-10 h-10 text-amber-500" />
    ) : (
      <Globe className="w-10 h-10 text-blue-500" />
    );
  };

  return (
    <div
      className="group relative rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm p-5 card-glow cursor-pointer animate-fade-in"
      style={{ animationDelay: `${index * 60}ms`, animationFillMode: 'both' }}
      onClick={handleClick}
    >
      {/* Pin indicator */}
      {app.isPinned && (
        <div className="absolute top-3 right-3 text-amber-500">
          <Pin className="w-4 h-4 fill-current" />
        </div>
      )}

      {/* Admin overlay */}
      {isAdmin && (
        <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(app); }}
            className="p-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(app); }}
            className="p-1.5 rounded-lg bg-destructive/10 hover:bg-destructive/20 text-destructive transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Icon */}
      <div className="mb-4 flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10 mx-auto">
        {renderIcon()}
      </div>

      {/* Name */}
      <h3 className="font-semibold text-sm text-center text-foreground mb-1 line-clamp-2 group-hover:text-primary transition-colors">
        {app.name}
      </h3>

      {/* Description */}
      {app.description && (
        <p className="text-xs text-muted-foreground text-center line-clamp-2 mb-3">
          {app.description}
        </p>
      )}

      {/* Footer: type badge + external link icon */}
      <div className="flex items-center justify-center gap-2 mt-auto">
        <Badge
          variant={app.type === 'local' ? 'outline' : 'secondary'}
          className="text-[10px] px-2 py-0.5"
        >
          {app.type === 'local' ? '🖥 Local' : '🌐 Web'}
        </Badge>
        <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </div>
  );
}
