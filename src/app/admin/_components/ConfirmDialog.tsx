'use client';

import { AlertTriangle, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

/**
 * 通用二次确认弹窗
 *
 * 后台的写操作（改角色、拉黑、删除）都必须过这一层，
 * 尤其是删除类（答卷、留言是物理删除，没有回收站）。
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmText = '确认',
  cancelText = '取消',
  destructive = false,
  loading = false,
  onConfirm,
  onOpenChange,
}: {
  open: boolean;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!loading) onOpenChange(v);
      }}
    >
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            {destructive && (
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-red-500/15">
                <AlertTriangle className="size-4 text-red-600 dark:text-red-300" />
              </div>
            )}
            <DialogTitle>{title}</DialogTitle>
          </div>
          {description && (
            <DialogDescription className="pt-2">{description}</DialogDescription>
          )}
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button
            variant={destructive ? 'destructive' : 'default'}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading && <Loader2 className="size-4 animate-spin" />}
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
