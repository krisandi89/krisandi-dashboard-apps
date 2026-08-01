'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { App } from '@/lib/types';
import { Loader2, Plus, Save } from 'lucide-react';

const CATEGORIES = [
  'Produktivitas',
  'AI Tools',
  'Development',
  'Media',
  'Islami',
];

const EMOJI_SUGGESTIONS = ['📱', '💰', '📝', '🤖', '💻', '📂', '💸', '📖', '🎮', '📥', '🌐', '⚡', '🔧', '📊', '🎨', '😎'];

interface AppFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Record<string, unknown>) => Promise<void>;
  mode: 'add' | 'edit';
  initialData?: App;
}

export function AppFormModal({ open, onOpenChange, onSubmit, mode, initialData }: AppFormModalProps) {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('');
  const [category, setCategory] = useState('Produktivitas');
  const [isPinned, setIsPinned] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setUrl(initialData.url);
      setDescription(initialData.description);
      setIcon(initialData.icon);
      setCategory(initialData.tags[0] || 'Produktivitas');
      setIsPinned(initialData.isPinned);
    } else {
      setName('');
      setUrl('');
      setDescription('');
      setIcon('');
      setCategory('Produktivitas');
      setIsPinned(false);
    }
  }, [initialData, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !url.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        url: url.trim(),
        description: description.trim(),
        icon,
        tags: [category],
        isPinned,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-border/50 bg-card/95 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">
            {mode === 'add' ? 'Tambah Aplikasi Baru' : 'Edit Aplikasi'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="app-name">Nama Aplikasi *</Label>
            <Input
              id="app-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: My App"
              required
              className="bg-background/50"
            />
          </div>

          {/* URL */}
          <div className="space-y-2">
            <Label htmlFor="app-url">URL *</Label>
            <Input
              id="app-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              type="url"
              required
              className="bg-background/50"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="app-desc">Deskripsi</Label>
            <Input
              id="app-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Deskripsi singkat..."
              className="bg-background/50"
            />
          </div>

          {/* Icon */}
          <div className="space-y-2">
            <Label>Icon Emoji</Label>
            <div className="flex flex-wrap gap-2">
              {EMOJI_SUGGESTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setIcon(emoji)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all ${
                    icon === emoji
                      ? 'bg-primary/20 ring-2 ring-primary scale-110'
                      : 'bg-muted/50 hover:bg-muted hover:scale-105'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>Kategori</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="bg-background/50">
                <SelectValue placeholder="Pilih kategori" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Pin */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="app-pin"
              checked={isPinned}
              onChange={(e) => setIsPinned(e.target.checked)}
              className="rounded"
            />
            <Label htmlFor="app-pin" className="cursor-pointer text-sm">
              📌 Pin ke atas
            </Label>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting || !name.trim() || !url.trim()}>
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : mode === 'add' ? (
                <Plus className="w-4 h-4 mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {mode === 'add' ? 'Tambah' : 'Simpan'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
