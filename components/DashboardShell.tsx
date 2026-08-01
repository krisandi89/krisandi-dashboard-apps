'use client';

import { useState, ReactNode } from 'react';
import { DashboardContext } from './DashboardContext';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';

export function DashboardShell({ children }: { children: ReactNode }) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <DashboardContext.Provider
      value={{
        selectedCategory,
        setSelectedCategory,
        searchQuery,
        setSearchQuery,
        sidebarOpen,
        setSidebarOpen,
      }}
    >
      <div className="min-h-screen flex bg-background">
        {/* Desktop Sidebar */}
        <Sidebar />
        {/* Main Content */}
        <main className="flex-1 lg:ml-[260px] min-h-screen">
          {children}
        </main>
      </div>
      {/* Mobile Bottom Nav */}
      <MobileNav />
    </DashboardContext.Provider>
  );
}
