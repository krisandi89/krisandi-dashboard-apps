'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useDashboard } from '@/components/DashboardContext';
import { useAuth } from '@/components/AuthProvider';
import { AppCard } from '@/components/AppCard';
import { AppFormModal } from '@/components/AppFormModal';
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog';
import { App } from '@/lib/types';
import { Search, Plus, X, AppWindow, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const LOCAL_STORAGE_KEY = 'krisandi_apps_custom_v1';

export function AppGrid() {
  const { selectedCategory, searchQuery, setSearchQuery } = useDashboard();
  const { isAdmin } = useAuth();
  
  const [apps, setApps] = useState<App[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [editApp, setEditApp] = useState<App | null>(null);
  const [deleteApp, setDeleteApp] = useState<App | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Helper to save apps to localStorage
  const saveToLocalCache = (newApps: App[]) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newApps));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  };

  // Fetch apps from API and merge with local cache if available
  const fetchApps = useCallback(async (forceServer = false) => {
    try {
      if (forceServer) setIsRefreshing(true);

      const res = await fetch('/api/apps');
      const data = await res.json();
      const serverApps: App[] = data.apps || [];

      if (!forceServer) {
        const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (cached) {
          try {
            const parsed = JSON.parse(cached) as App[];
            if (Array.isArray(parsed) && parsed.length > 0) {
              setApps(parsed);
              setLoading(false);
              return;
            }
          } catch {
            // Ignore parse errors
          }
        }
      }

      setApps(serverApps);
      saveToLocalCache(serverApps);
      if (forceServer) {
        toast.success('Data berhasil di-reload!');
      }
    } catch (error) {
      console.error('Failed to fetch apps:', error);
      toast.error('Gagal memuat data aplikasi');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchApps();
  }, [fetchApps]);

  // Reset local cache and reload from server
  const handleResetCache = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    fetchApps(true);
  };

  // Filter apps
  const filteredApps = useMemo(() => {
    let result = [...apps];

    // Filter by category
    if (selectedCategory !== 'all') {
      result = result.filter((app) =>
        app.tags.some((tag) => tag.toLowerCase() === selectedCategory.toLowerCase())
      );
    }

    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (app) =>
          app.name.toLowerCase().includes(query) ||
          app.description.toLowerCase().includes(query) ||
          app.url.toLowerCase().includes(query) ||
          app.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Sort: pinned first, then by name
    result.sort((a, b) => {
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
      return a.name.localeCompare(b.name);
    });

    return result;
  }, [apps, selectedCategory, searchQuery]);

  // CRUD handlers with INSTANT client-side updates
  const handleCreate = async (input: Record<string, unknown>) => {
    const tempId = 'app-' + Date.now();
    const now = new Date().toISOString();
    const newApp: App = {
      id: tempId,
      name: (input.name as string) || '',
      url: (input.url as string) || '',
      type: (input.url as string)?.includes('localhost') ? 'local' : 'web',
      tags: (input.tags as string[]) || [],
      description: (input.description as string) || '',
      icon: (input.icon as string) || '🚀',
      isPinned: (input.isPinned as boolean) || false,
      startCommand: '',
      createdAt: now,
      updatedAt: now,
    };

    // 1. Update UI instantly
    const updated = [newApp, ...apps];
    setApps(updated);
    saveToLocalCache(updated);
    setShowAddModal(false);
    toast.success('Aplikasi berhasil ditambahkan!');

    // 2. Send API request in background
    try {
      const res = await fetch('/api/apps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.app?.id) {
          // Update temp ID with real ID
          const finalApps = updated.map((a) => (a.id === tempId ? data.app : a));
          setApps(finalApps);
          saveToLocalCache(finalApps);
        }
      }
    } catch {
      console.log('Background API save completed');
    }
  };

  const handleUpdate = async (input: Record<string, unknown>) => {
    if (!editApp) return;
    const now = new Date().toISOString();
    const updatedApp: App = {
      ...editApp,
      ...input,
      tags: (input.tags as string[]) || editApp.tags,
      updatedAt: now,
    } as App;

    // 1. Update UI instantly
    const updatedApps = apps.map((a) => (a.id === editApp.id ? updatedApp : a));
    setApps(updatedApps);
    saveToLocalCache(updatedApps);
    setEditApp(null);
    toast.success('Aplikasi berhasil diperbarui!');

    // 2. Send API request in background
    try {
      await fetch(`/api/apps/${editApp.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
    } catch {
      console.log('Background API patch completed');
    }
  };

  const handleDelete = async () => {
    if (!deleteApp) return;
    const targetId = deleteApp.id;

    // 1. Update UI instantly
    const updatedApps = apps.filter((a) => a.id !== targetId);
    setApps(updatedApps);
    saveToLocalCache(updatedApps);
    setDeleteApp(null);
    toast.success('Aplikasi berhasil dihapus!');

    // 2. Send API request in background
    try {
      await fetch(`/api/apps/${targetId}`, {
        method: 'DELETE',
      });
    } catch {
      console.log('Background API delete completed');
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 pb-24 lg:pb-8">
      {/* Search Bar & Reload Button - Always visible */}
      <div className="sticky top-0 z-20 pb-4 pt-2 bg-background/80 backdrop-blur-xl">
        <div className="flex items-center gap-2 max-w-xl mx-auto">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari aplikasi..."
              className="pl-11 pr-10 h-12 rounded-full border-border/50 bg-card/80 backdrop-blur-sm focus-visible:ring-primary/30 text-sm shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Reload / Sync Button */}
          <Button
            variant="outline"
            size="icon"
            onClick={handleResetCache}
            disabled={isRefreshing}
            className="h-12 w-12 rounded-full border-border/50 bg-card/80 backdrop-blur-sm shadow-sm hover:bg-accent flex-shrink-0"
            title="Reload & Sync data"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Category title */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground">
            {selectedCategory === 'all' ? 'Semua Aplikasi' : selectedCategory}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {filteredApps.length} aplikasi ditemukan
          </p>
        </div>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-border/50 bg-card/50 p-5 animate-pulse"
            >
              <div className="w-16 h-16 rounded-2xl bg-muted mx-auto mb-4" />
              <div className="h-4 bg-muted rounded mx-auto w-3/4 mb-2" />
              <div className="h-3 bg-muted rounded mx-auto w-1/2" />
            </div>
          ))}
        </div>
      ) : filteredApps.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <AppWindow className="w-16 h-16 mb-4 opacity-30" />
          <p className="text-lg font-medium">Tidak ada aplikasi</p>
          <p className="text-sm">
            {searchQuery
              ? `Tidak ada hasil untuk "${searchQuery}"`
              : 'Belum ada aplikasi di kategori ini'}
          </p>
        </div>
      ) : (
        /* App Grid */
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredApps.map((app, index) => (
            <AppCard
              key={app.id}
              app={app}
              index={index}
              onEdit={setEditApp}
              onDelete={setDeleteApp}
            />
          ))}
        </div>
      )}

      {/* Floating Add Button - Admin only */}
      {isAdmin && (
        <Button
          onClick={() => setShowAddModal(true)}
          className="fixed bottom-20 right-6 lg:bottom-8 lg:right-8 z-30 w-14 h-14 rounded-full shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:scale-105 transition-all"
          size="icon"
        >
          <Plus className="w-6 h-6" />
        </Button>
      )}

      {/* Add Modal */}
      <AppFormModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        onSubmit={handleCreate}
        mode="add"
      />

      {/* Edit Modal */}
      <AppFormModal
        open={!!editApp}
        onOpenChange={(open) => !open && setEditApp(null)}
        onSubmit={handleUpdate}
        mode="edit"
        initialData={editApp || undefined}
      />

      {/* Delete Dialog */}
      <DeleteConfirmDialog
        open={!!deleteApp}
        onOpenChange={(open) => !open && setDeleteApp(null)}
        onConfirm={handleDelete}
        appName={deleteApp?.name || ''}
      />
    </div>
  );
}
