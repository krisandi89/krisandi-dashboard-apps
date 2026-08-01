'use client';

import { createContext, useContext } from 'react';

export interface DashboardContextType {
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const DashboardContext = createContext<DashboardContextType>({
  selectedCategory: 'all',
  setSelectedCategory: () => {},
  searchQuery: '',
  setSearchQuery: () => {},
  sidebarOpen: false,
  setSidebarOpen: () => {},
});

export function useDashboard() {
  return useContext(DashboardContext);
}
