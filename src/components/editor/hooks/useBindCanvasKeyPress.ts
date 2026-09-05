"use client";

import { useEffect } from "react";
import { useEditor } from "../store/EditorProvider";
import { useGetComponentInfo } from "../store/EditorProvider";

function isActiveElementValid() {
  const el = document.activeElement;
  if (el === document.body) return true;
  // 原生可编辑元素（input/textarea/contenteditable）不交给画布快捷键接管，保留其默认行为
  if (el?.matches("input, textarea, [contenteditable]")) return false;
  if (el?.matches('div[role="button"]')) return true;
  if (el?.getAttribute("data-no-drag") === "true") return true;
  return false;
}

export function useBindCanvasKeyPress() {
  const { dispatch } = useEditor();
  const { currentPage } = useGetComponentInfo();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!isActiveElementValid()) return;
      const ctrl = e.ctrlKey || e.metaKey;

      // Delete
      if (e.key === "Backspace" || e.key === "Delete") {
        e.preventDefault();
        dispatch({ type: "PUSH_PAST" });
        dispatch({ type: "REMOVE_SELECTED_COMPONENT" });
      }
      // Copy
      else if (ctrl && e.key === "c" && !e.shiftKey) {
        e.preventDefault();
        dispatch({ type: "PUSH_PAST" });
        dispatch({ type: "COPY_SELECTED_COMPONENT" });
      }
      // Paste
      else if (ctrl && e.key === "v" && !e.shiftKey) {
        e.preventDefault();
        dispatch({ type: "PUSH_PAST" });
        dispatch({ type: "PASTE_COPIED_COMPONENT", payload: { page: currentPage } });
      }
      // Up arrow - select prev
      else if (e.key === "ArrowUp" && !ctrl) {
        e.preventDefault();
        dispatch({ type: "SELECT_PREV_COMPONENT" });
      }
      // Down arrow - select next
      else if (e.key === "ArrowDown" && !ctrl) {
        e.preventDefault();
        dispatch({ type: "SELECT_NEXT_COMPONENT" });
      }
      // Undo
      else if (ctrl && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        dispatch({ type: "UNDO" });
      }
      // Redo
      else if ((ctrl && e.shiftKey && e.key === "z") || (ctrl && e.key === "y")) {
        e.preventDefault();
        dispatch({ type: "REDO" });
      }
      // Save (prevent browser save)
      else if (ctrl && e.key === "s") {
        e.preventDefault();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [dispatch, currentPage]);
}
