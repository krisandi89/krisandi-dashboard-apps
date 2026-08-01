'use client';

import { useEffect, useState } from 'react';
import { useDashboard } from './DashboardContext';
import { useAuth } from '@/components/AuthProvider';
import { LoginModal } from './LoginModal';
import { 
  LayoutGrid, Briefcase, Brain, Code2, 
  Play, BookOpen, Sun, Moon, LogIn, LogOut, X, Sparkles, Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const CATEGORIES = [
  { id: 'all', label: 'Semua Apps', icon: LayoutGrid },
  { id: 'Produktivitas', label: 'Produktivitas', icon: Briefcase },
  { id: 'AI Tools', label: 'AI Tools', icon: Brain },
  { id: 'Development', label: 'Development', icon: Code2 },
  { id: 'Media', label: 'Media', icon: Play },
  { id: 'Islami', label: 'Islami', icon: BookOpen },
];

export function Sidebar() {
  const { selectedCategory, setSelectedCategory, sidebarOpen, setSidebarOpen } = useDashboard();
  const { isAdmin, logout } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSidebarOpen(false);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-card/80 backdrop-blur-xl border-r border-border/50">
      {/* Brand */}
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Krisandi</h1>
            <p className="text-xs text-muted-foreground font-medium">Dashboard Apps</p>
          </div>
        </div>
      </div>

      {/* Categories */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto scrollbar-hide py-2">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-3">
          Kategori
        </p>
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat.id)}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive 
                  ? 'bg-primary/10 text-primary border-l-2 border-primary shadow-sm' 
                  : 'hover:bg-accent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{cat.label}</span>
              {isActive && <span className="ml-auto text-xs opacity-50">•</span>}
            </button>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-4 border-t border-border/50 space-y-3">
        {/* Theme Toggle */}
        <div className="flex items-center justify-between px-2">
          <span className="text-sm font-medium text-muted-foreground">Theme</span>
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full">
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </Button>
        </div>
        
        {/* Admin */}
        {isAdmin ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/50 border border-border/50">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-green-500" />
                </div>
                <span className="text-sm font-medium">Admin</span>
              </div>
              <Button variant="ghost" size="icon" onClick={logout} className="text-muted-foreground hover:text-destructive">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ) : (
          <Button 
            className="w-full justify-start space-x-2 rounded-xl" 
            variant="outline"
            onClick={() => setShowLogin(true)}
          >
            <LogIn className="w-4 h-4" />
            <span>Admin Login</span>
          </Button>
        )}
      </div>

      <LoginModal open={showLogin} onOpenChange={setShowLogin} />
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-[260px] fixed inset-y-0 left-0 z-40">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex animate-fade-in">
          <div 
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative w-[280px] max-w-[80%] h-full animate-slide-in-left shadow-2xl">
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute -right-12 top-4 z-50 rounded-full bg-background/50 backdrop-blur-md text-foreground"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </Button>
            <SidebarContent />
          </div>
        </div>
      )}
    </>
  );
}
