"use client";

import { useEditor } from "../store/EditorProvider";
import { useGetComponentInfo } from "../store/EditorProvider";
import { MAX_PAGES } from "../store/constants";
import { useLocale } from "@/i18n/useLocale";
import { format } from "@/i18n/locale-utils";
import { toast } from "sonner";
import { nanoid } from "nanoid";

export function useChangeComponentInfo() {
  const { t } = useLocale();
  const { dispatch } = useEditor();
  const { componentList, pageTotal } = useGetComponentInfo();

  const itemsConfig = [
    { key: "1", label: t((m) => m.editor.deleteMenuItem) },
    { key: "2", label: t((m) => m.editor.moveForwardMenuItem) },
    { key: "3", label: t((m) => m.editor.moveBackMenuItem) },
    { key: "4", label: t((m) => m.editor.copyMenuItem) },
    { key: "5", label: t((m) => m.editor.addMenuItem) },
  ];

  const getConfigList = (currentPage: number) => {
    let items = [...itemsConfig];
    if (pageTotal <= 1 || currentPage === -1) items = items.filter((i) => i.key !== "1");
    if (currentPage === 1 || currentPage === -1) items = items.filter((i) => i.key !== "2");
    if (currentPage === pageTotal || currentPage === -1) items = items.filter((i) => i.key !== "3");
    if (currentPage === -1) items = items.filter((i) => i.key !== "4" && i.key !== "5");
    // 页数达到 MAX_PAGES 上限后，隐藏「复制页」「新增页」入口
    if (pageTotal >= MAX_PAGES) items = items.filter((i) => i.key !== "4" && i.key !== "5");
    return items;
  };

  const onDel = (currentPage: number) => {
    if (pageTotal <= 1 || currentPage === -1) return;
    let newComponents = componentList.filter((item) => item.page !== currentPage);
    newComponents = newComponents.map((item) =>
      item.page > currentPage ? { ...item, page: item.page - 1 } : item,
    );
    dispatch({ type: "REPLACE_COMPONENT", payload: newComponents });
    dispatch({ type: "CHANGE_PAGE_TOTAL", payload: pageTotal - 1 });
    if (currentPage !== 1) dispatch({ type: "CHANGE_CURRENT_PAGE", payload: currentPage - 1 });
  };

  const onMoveForward = (currentPage: number) => {
    if (currentPage === 1 || currentPage === -1) return;
    const newComponents = componentList.map((item) => {
      if (item.page === currentPage) return { ...item, page: item.page - 1 };
      if (item.page === currentPage - 1) return { ...item, page: currentPage };
      return item;
    });
    dispatch({ type: "REPLACE_COMPONENT", payload: newComponents });
    if (currentPage !== 1) dispatch({ type: "CHANGE_CURRENT_PAGE", payload: currentPage - 1 });
  };

  const onMoveBack = (currentPage: number) => {
    if (currentPage === pageTotal || currentPage === -1) return;
    const newComponents = componentList.map((item) => {
      if (item.page === currentPage) return { ...item, page: item.page + 1 };
      if (item.page === currentPage + 1) return { ...item, page: currentPage };
      return item;
    });
    dispatch({ type: "REPLACE_COMPONENT", payload: newComponents });
    if (currentPage !== pageTotal) dispatch({ type: "CHANGE_CURRENT_PAGE", payload: currentPage + 1 });
  };

  const onCopy = (currentPage: number) => {
    // 页数上限保护：达到 MAX_PAGES 后不允许复制整页
    if (pageTotal >= MAX_PAGES) {
      toast.error(format(t((m) => m.editor.maxPagesReached), { max: MAX_PAGES }));
      return;
    }
    let currentComponents = componentList.filter((item) => item.page === currentPage);
    currentComponents = currentComponents.map((item) => ({ ...item, feUuid: nanoid(), page: currentPage + 1 }));
    const currentIndex = componentList.findIndex((item) => item.page === currentPage + 1);
    const newComponents = componentList.map((item) =>
      item.page > currentPage ? { ...item, page: item.page + 1 } : item,
    );
    if (currentIndex >= 0) newComponents.splice(currentIndex, 0, ...currentComponents);
    else newComponents.push(...currentComponents);
    dispatch({ type: "REPLACE_COMPONENT", payload: newComponents });
    dispatch({ type: "CHANGE_PAGE_TOTAL", payload: pageTotal + 1 });
    dispatch({ type: "CHANGE_CURRENT_PAGE", payload: currentPage + 1 });
  };

  const onAdd = (currentPage: number) => {
    // 页数上限保护：达到 MAX_PAGES 后不允许新增页
    if (pageTotal >= MAX_PAGES) {
      toast.error(format(t((m) => m.editor.maxPagesReached), { max: MAX_PAGES }));
      return;
    }
    const newComp = {
      feUuid: nanoid(), type: "workInput", title: t((m) => m.editor.ctWorkInput), page: currentPage + 1,
      isHidden: false, isLocked: false,
      props: {
        // i18n-missing: 输入框标题 (default input question title)
        title: "输入框标题",
        placeholder: t((m) => m.editor.canvasPleaseInput),
      },
    };
    const currentIndex = componentList.findIndex((item) => item.page === currentPage + 1);
    const newComponents = componentList.map((item) =>
      item.page > currentPage ? { ...item, page: item.page + 1 } : item,
    );
    if (currentIndex >= 0) newComponents.splice(currentIndex, 0, newComp);
    else newComponents.push(newComp);
    dispatch({ type: "REPLACE_COMPONENT", payload: newComponents });
    dispatch({ type: "CHANGE_PAGE_TOTAL", payload: pageTotal + 1 });
    dispatch({ type: "CHANGE_CURRENT_PAGE", payload: currentPage + 1 });
  };

  return { onDel, onMoveForward, onMoveBack, onCopy, onAdd, getConfigList };
}
