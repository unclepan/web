"use client";

import { useState } from "react";
import { Eye, EyeOff, Lock, LockOpen, Ellipsis } from "lucide-react";
import { useGetComponentInfo, useEditor } from "@/components/editor/store/EditorProvider";
import { useChangeComponentInfo } from "@/components/editor/hooks/useChangeComponentInfo";
import { useLocale } from "@/i18n/useLocale";
import { format } from "@/i18n/locale-utils";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";

/** 修改组件名称的弹窗 */
function RenameDialog({
  open,
  title,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  onConfirm: (newTitle: string) => void;
  onCancel: () => void;
}) {
  const { t } = useLocale();
  const [dialogTitle, setDialogTitle] = useState(title);

  const confirm = () => {
    const v = dialogTitle.trim();
    if (!v) return;
    onConfirm(v);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onCancel(); }}>
      <DialogContent className="sm:max-w-[360px]">
        <DialogHeader>
          <DialogTitle>{t((m) => m.editor.renameComponent)}</DialogTitle>
        </DialogHeader>
        <Input
          value={dialogTitle}
          onChange={(e) => setDialogTitle(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") confirm(); }}
          autoFocus
        />
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>{t((m) => m.editor.cancel)}</Button>
          <Button onClick={confirm} disabled={!dialogTitle.trim()}>{t((m) => m.editor.confirm)}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function Layers() {
  const { t } = useLocale();
  const { componentList, selectedId, currentPage, pageTotal } = useGetComponentInfo();
  const { dispatch } = useEditor();
  const { onDel, onMoveForward, onMoveBack, onCopy, onAdd } = useChangeComponentInfo();
  const [editingComponent, setEditingComponent] = useState<{ feUuid: string; title: string } | null>(null);
  const [menuPage, setMenuPage] = useState(currentPage);

  const handleTitleClick = (feUuid: string) => {
    dispatch({ type: "PUSH_PAST" });
    const cur = componentList.find((c) => c.feUuid === feUuid);
    if (cur?.isHidden) return;
    if (cur) dispatch({ type: "CHANGE_CURRENT_PAGE", payload: cur.page });
    if (feUuid !== selectedId) {
      dispatch({ type: "CHANGE_SELECTED_ID", payload: feUuid });
      return;
    }
    // 已选中再次点击 → 弹出修改名称对话框
    setEditingComponent({ feUuid, title: cur?.title ?? "" });
  };

  const handleToggleHidden = (feUuid: string) => {
    dispatch({ type: "PUSH_PAST" });
    dispatch({ type: "TOGGLE_COMPONENT_HIDDEN", payload: { feUuid } });
    const title = componentList.find((c) => c.feUuid === feUuid)?.title ?? "";
    toast.success(format(t((m) => m.editor.hidden), { title }));
  };

  const handleToggleLocked = (feUuid: string) => {
    dispatch({ type: "PUSH_PAST" });
    dispatch({ type: "TOGGLE_COMPONENT_LOCKED", payload: { feUuid } });
    const cur = componentList.find((c) => c.feUuid === feUuid);
    toast.success(format(t((m) => cur?.isLocked ? m.editor.unlocked : m.editor.locked), { title: cur?.title ?? "" }));
  };

  const handleMenuOpenChange = (open: boolean, page: number) => {
    if (open) setMenuPage(page);
  };

  // 重命名确认：dispatch 后关闭弹窗
  const handleRenameConfirm = (newTitle: string) => {
    if (!editingComponent) return;
    dispatch({ type: "PUSH_PAST" });
    dispatch({ type: "CHANGE_COMPONENT_TITLE", payload: { feUuid: editingComponent.feUuid, title: newTitle } });
    setEditingComponent(null);
    toast.success(t((m) => m.editor.renamed));
  };

  const handleRenameCancel = () => setEditingComponent(null);

  const menuLabelMap: Record<string, string> = {
    "1": t((m) => m.editor.deleteMenuItem),
    "2": t((m) => m.editor.moveForwardMenuItem),
    "3": t((m) => m.editor.moveBackMenuItem),
    "4": t((m) => m.editor.copyMenuItem),
    "5": t((m) => m.editor.addMenuItem),
  };

  const onMenuClick = (key: string) => {
    dispatch({ type: "PUSH_PAST" });
    dispatch({ type: "CHANGE_SELECTED_ID", payload: "" });
    if (key === "1") onDel(menuPage);
    if (key === "2") onMoveForward(menuPage);
    if (key === "3") onMoveBack(menuPage);
    if (key === "4") onCopy(menuPage);
    if (key === "5") onAdd(menuPage);
    toast.success(format(t((m) => m.editor.menuActionToast), { action: menuLabelMap[key] ?? "" }));
  };

  const pages = Array.from({ length: pageTotal }, (_, i) => i + 1);

  const menuItems = Object.entries(menuLabelMap).map(([key, label]) => ({ key, label }));

  return (
    <>
      <div className="space-y-3">
        {pages.map((page) => {
          const pageComponents = componentList.filter((c) => c.page === page);
          return (
            <div key={page}>
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-bold text-foreground">{format(t((m) => m.editor.page), { page })}</h3>
                <DropdownMenu onOpenChange={(open) => handleMenuOpenChange(open, page)}>
                  <DropdownMenuTrigger
                    className="cursor-pointer text-muted-foreground hover:text-muted-foreground outline-none"
                  >
                    <Ellipsis size={14}/>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" data-no-drag="true">
                    {menuItems.map((item) => (
                      <DropdownMenuItem key={item.key} onClick={() => onMenuClick(item.key)}>
                        {item.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              {pageComponents.map((c) => {
                const isSelected = c.feUuid === selectedId;
                const IconEye = c.isHidden ? EyeOff : Eye;
                const IconLock = c.isLocked ? Lock : LockOpen;
                return (
                  <div
                    key={c.feUuid}
                    className={`flex items-center justify-between p-2 rounded text-sm cursor-pointer ${
                      isSelected ? "bg-muted" : "hover:bg-muted"
                    }`}
                    onClick={() => handleTitleClick(c.feUuid)}
                  >
                    <div className="flex-1 truncate" data-no-drag="true">
                      {c.title}
                    </div>
                    <div className="flex items-center gap-1 shrink-0" data-no-drag="true">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleHidden(c.feUuid);
                            }}
                            className={`w-6 h-6 flex items-center justify-center rounded ${
                              c.isHidden ? "text-blue-600 dark:text-blue-300" : "text-muted-foreground"
                            }`}
                          >
                            <IconEye size={14} />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>{c.isHidden ? t((m) => m.editor.showTooltip) : t((m) => m.editor.hideTooltip)}</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleLocked(c.feUuid);
                            }}
                            className={`w-6 h-6 flex items-center justify-center rounded ${
                              c.isLocked ? "text-blue-600 dark:text-blue-300" : "text-muted-foreground"
                            }`}
                          >
                            <IconLock size={14} />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>{c.isLocked ? t((m) => m.editor.unlockTooltip) : t((m) => m.editor.lockTooltip)}</TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
      <RenameDialog
        key={editingComponent?.feUuid ?? "_"}
        open={editingComponent !== null}
        title={editingComponent?.title ?? ""}
        onConfirm={handleRenameConfirm}
        onCancel={handleRenameCancel}
      />
    </>
  );
}
