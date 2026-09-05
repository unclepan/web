"use client";
import { Ellipsis } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { toast } from "sonner";

export default function CanvasTool() {
  const { t } = useLocale();
  const { pageTotal, currentPage } = useGetComponentInfo();
  const { dispatch } = useEditor();
  const { getConfigList, onDel, onMoveForward, onMoveBack, onCopy, onAdd } = useChangeComponentInfo();

  const onChange = (page: number) => {
    dispatch({ type: "PUSH_PAST" });
    dispatch({ type: "CHANGE_CURRENT_PAGE", payload: page });
    dispatch({ type: "CHANGE_SELECTED_ID", payload: "" });
    dispatch({ type: "CHANGE_EDITOR_SELECTED_ID", payload: "" });
  };

  const menuItems = getConfigList(currentPage);

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
    dispatch({ type: "CHANGE_EDITOR_SELECTED_ID", payload: "" });
    if (key === "1") onDel(currentPage);
    if (key === "2") onMoveForward(currentPage);
    if (key === "3") onMoveBack(currentPage);
    if (key === "4") onCopy(currentPage);
    if (key === "5") onAdd(currentPage);
    toast.success(format(t((m) => m.editor.menuActionToast), { action: menuLabelMap[key] ?? "" }));
  };

  const cp = currentPage <= 0 ? 1 : currentPage;
  const getDisplayPages = () => {
    if (pageTotal <= 7) return Array.from({ length: pageTotal }, (_, i) => i + 1);
    const pages: (number | null)[] = [1];
    if (cp > 3) pages.push(null);
    for (let i = Math.max(2, cp - 1); i <= Math.min(pageTotal - 1, cp + 1); i++) pages.push(i);
    if (cp < pageTotal - 2) pages.push(null);
    pages.push(pageTotal);
    return pages;
  };

  return (
    <div className="flex items-center gap-2 py-2 px-4 bg-card rounded">
      {pageTotal <= 1 ? (
        <Button size="sm" variant={currentPage === 1 ? "default" : "outline"} onClick={() => onChange(1)}>1</Button>
      ) : (
        <div className="flex items-center gap-1">
          {getDisplayPages().map((p, i) =>
            p === null ? (
              <span key={`ellipsis-${i}`} className="px-1 text-sm text-muted-foreground select-none">...</span>
            ) : (
              <Button key={p} size="sm" variant={currentPage === p ? "default" : "outline"} onClick={() => onChange(p)}>{p}</Button>
            )
          )}
        </div>
      )}
      <Button size="sm" variant={currentPage === -1 ? "default" : "outline"} onClick={() => onChange(-1)}>{t((m) => m.editor.panelEndPage)}</Button>
      {currentPage !== -1 && menuItems.length > 0 && (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger className="cursor-pointer px-2 py-1 text-muted-foreground hover:text-foreground outline-none">
              <Ellipsis size={14}/>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {menuItems.map((item) => (
                <DropdownMenuItem key={item.key} onClick={() => onMenuClick(item.key)}>
                  {menuLabelMap[item.key] ?? item.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      )}
    </div>
  );
}
