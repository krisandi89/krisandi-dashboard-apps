'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  appName: string;
}

export function DeleteConfirmDialog({ open, onOpenChange, onConfirm, appName }: DeleteConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm border-border/50 bg-card/95 backdrop-blur-xl">
        <DialogHeader>
          <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-2">
            <AlertTriangle className="w-6 h-6 text-destructive" />
          </div>
          <DialogTitle className="text-center text-lg">
            Hapus Aplikasi?
          </DialogTitle>
        </DialogHeader>
        <p className="text-center text-sm text-muted-foreground">
          Apakah kamu yakin ingin menghapus <strong className="text-foreground">{appName}</strong>? Tindakan ini tidak dapat dibatalkan.
        </p>
        <div className="flex justify-center gap-3 mt-4">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
          >
            Hapus
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
