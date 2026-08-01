'use client';

import { useDashboard } from './DashboardContext';
import { 
  LayoutGrid, Briefcase, Brain, Code2, 
  Play, BookOpen, Menu
} from 'lucide-react';

const CATEGORIES = [
  { id: 'all', label: 'All', icon: LayoutGrid },
  { id: 'Produktivitas', label: 'Produktivitas', icon: Briefcase },
  { id: 'AI Tools', label: 'AI Tools', icon: Brain },
  { id: 'Development', label: 'Dev', icon: Code2 },
  { id: 'Media', label: 'Media', icon: Play },
  { id: 'Islami', label: 'Islami', icon: BookOpen },
];

export function MobileNav() {
  const { selectedCategory, setSelectedCategory, setSidebarOpen } = useDashboard();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-card/90 backdrop-blur-xl border-t border-border/50 pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
      <div className="flex items-center h-16 px-3 gap-3 overflow-x-auto scrollbar-hide">
        <button
          onClick={() => setSidebarOpen(true)}
          className="flex-shrink-0 p-2.5 rounded-full bg-secondary text-secondary-foreground"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        <div className="w-[1px] h-8 bg-border flex-shrink-0" />
        
        <div className="flex gap-2 flex-1 overflow-x-auto scrollbar-hide">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = selectedCategory === cat.id;
            
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium transition-all duration-200 ${
                  isActive 
                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-105' 
                    : 'bg-secondary/50 text-muted-foreground hover:bg-secondary'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
