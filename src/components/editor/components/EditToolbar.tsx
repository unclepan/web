"use client";
import {
  Trash2,
  Eye,
  EyeOff,
  Lock,
  LockOpen,
  Copy,
  ClipboardPaste,
  ArrowUp,
  ArrowDown,
  Undo2,
  Redo2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { useGetComponentInfo, useEditor } from "@/components/editor/store/EditorProvider";
import { MAX_COMPONENTS_PER_PAGE, isPageFull } from "@/components/editor/store/constants";
import { useLocale } from "@/i18n/useLocale";
import { format } from "@/i18n/locale-utils";
import { toast } from "sonner";

export default function EditToolbar() {
  const { t } = useLocale();
  const { dispatch } = useEditor();
  const { selectedId, componentList, selectedComponent, copiedComponent, isPast, isFuture, currentPage } = useGetComponentInfo();
  const isLocked = selectedComponent?.isLocked;
  const isHidden = selectedComponent?.isHidden;
  const selectedPage = selectedComponent?.page;
  const title = selectedComponent?.title ?? "";
  const length = componentList.length;
  const selectedIndex = componentList.findIndex((c) => c.feUuid === selectedId);
  const isFirst = selectedIndex <= 0;
  const isLast = selectedIndex + 1 >= length;
  const currentPageComponents = componentList.filter((c) => c.page === currentPage);
  const currentPageSelectedIndex = currentPageComponents.findIndex((c) => c.feUuid === selectedId);
  const currentPageIsFirst = currentPageSelectedIndex <= 0;
  const currentPageIsLast = currentPageSelectedIndex + 1 >= currentPageComponents.length;

  const del = () => { dispatch({ type: "PUSH_PAST" }); dispatch({ type: "REMOVE_SELECTED_COMPONENT" }); toast.success(format(t((m) => m.editor.deleted), { title })); };
  const toggleHidden = () => { dispatch({ type: "PUSH_PAST" }); dispatch({ type: "TOGGLE_COMPONENT_HIDDEN", payload: { feUuid: selectedId } }); toast.success(format(t((m) => isHidden ? m.editor.shown : m.editor.hidden), { title })); };
  const lock = () => { dispatch({ type: "PUSH_PAST" }); dispatch({ type: "TOGGLE_COMPONENT_LOCKED", payload: { feUuid: selectedId } }); toast.success(format(t((m) => isLocked ? m.editor.unlocked : m.editor.locked), { title })); };
  const copy = () => { dispatch({ type: "PUSH_PAST" }); dispatch({ type: "COPY_SELECTED_COMPONENT" }); toast.success(t((m) => m.editor.copied)); };
  // 每页最多 MAX_COMPONENTS_PER_PAGE 个组件（不区分组件类型），超限禁止粘贴
  const pageFull = isPageFull(componentList, currentPage);
  const pasteDisabled = !copiedComponent || currentPage === -1 || pageFull;
  const paste = () => {
    if (pageFull) {
      toast.error(format(t((m) => m.editor.maxComponentsPerPageReached), { max: MAX_COMPONENTS_PER_PAGE }));
      return;
    }
    dispatch({ type: "PUSH_PAST" });
    dispatch({ type: "PASTE_COPIED_COMPONENT", payload: { page: currentPage } });
    toast.success(t((m) => m.editor.pasted));
  };
  const moveUp = () => { if (isFirst) return; dispatch({ type: "PUSH_PAST" }); dispatch({ type: "MOVE_COMPONENT", payload: { oldIndex: selectedIndex, newIndex: selectedIndex - 1 } }); toast.success(t((m) => m.editor.movedUp)); };
  const moveDown = () => { if (isLast) return; dispatch({ type: "PUSH_PAST" }); dispatch({ type: "MOVE_COMPONENT", payload: { oldIndex: selectedIndex, newIndex: selectedIndex + 1 } }); toast.success(t((m) => m.editor.movedDown)); };
  const undo = () => { dispatch({ type: "UNDO" }); toast.success(t((m) => m.editor.undone)); };
  const redo = () => { dispatch({ type: "REDO" }); toast.success(t((m) => m.editor.redone)); };

  const btnDisabled = (!selectedId || currentPage === -1);
  const delDisabled = (!selectedId || currentPageComponents.length <= 1 || selectedPage !== currentPage || currentPage === -1);

  const btn = (el: React.ReactNode, tooltip: string) => (
    <Tooltip>
      <TooltipTrigger asChild>{el}</TooltipTrigger>
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  );

  return (
    <div className="flex items-center gap-1">
      {btn(<Button variant="outline" size="icon" className="cursor-pointer" disabled={delDisabled} onClick={del}><Trash2 size={16} /></Button>, t((m) => m.editor.deleteTooltip))}
      {btn(<Button variant="outline" size="icon" className="cursor-pointer" disabled={btnDisabled} onClick={toggleHidden}>{isHidden ? <EyeOff size={16} /> : <Eye size={16} />}</Button>, t((m) => isHidden ? m.editor.showTooltip : m.editor.hideTooltip))}
      {btn(<Button variant="outline" size="icon" className="cursor-pointer" disabled={btnDisabled} onClick={lock}>{isLocked ? <Lock size={16} /> : <LockOpen size={16} />}</Button>, t((m) => isLocked ? m.editor.unlockTooltip : m.editor.lockTooltip))}
      {btn(<Button variant="outline" size="icon" className="cursor-pointer" disabled={btnDisabled} onClick={copy}><Copy size={16} /></Button>, t((m) => m.editor.copyTooltip))}
      {btn(<Button variant="outline" size="icon" className="cursor-pointer" disabled={pasteDisabled} onClick={paste}><ClipboardPaste size={16} /></Button>, pageFull ? format(t((m) => m.editor.maxComponentsPerPageReached), { max: MAX_COMPONENTS_PER_PAGE }) : t((m) => m.editor.pasteTooltip))}
      {btn(<Button variant="outline" size="icon" className="cursor-pointer" disabled={!selectedId || isFirst || currentPageIsFirst || selectedPage !== currentPage || currentPage === -1} onClick={moveUp}><ArrowUp size={16} /></Button>, t((m) => m.editor.moveUpTooltip))}
      {btn(<Button variant="outline" size="icon" className="cursor-pointer" disabled={!selectedId || isLast || currentPageIsLast || selectedPage !== currentPage || currentPage === -1} onClick={moveDown}><ArrowDown size={16} /></Button>, t((m) => m.editor.moveDownTooltip))}
      {btn(<Button variant="outline" size="icon" className="cursor-pointer" disabled={!isPast} onClick={undo}><Undo2 size={16} /></Button>, t((m) => m.editor.undoTooltip))}
      {btn(<Button variant="outline" size="icon" className="cursor-pointer" disabled={!isFuture} onClick={redo}><Redo2 size={16} /></Button>, t((m) => m.editor.redoTooltip))}
    </div>
  );
}
