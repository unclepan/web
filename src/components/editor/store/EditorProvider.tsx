"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useRef,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { editorReducer, INITIAL_COMPONENTS, INITIAL_INTERACTION, type Action } from "./reducer";
import type { EditorStateType, PresentType } from "./types";
import { workApi } from "@/lib/api";

type SaveStatus = "idle" | "saving" | "saved" | "error";

interface EditorContextValue {
  state: EditorStateType;
  dispatch: React.Dispatch<Action>;
  workId: number | null;
  setWorkId: (id: number) => void;
  saveStatus: SaveStatus;
  saveContent: (isAuto?: boolean) => Promise<boolean>;
  isLoading: boolean;
}

const EditorContext = createContext<EditorContextValue | null>(null);

/** 将编辑器 state 序列化为可存储的 content 对象 */
function serializeState(state: EditorStateType): Record<string, unknown> {
  const { present } = state.components;
  // title/desc 已移至 Work 表最外层 name/desc，不再写入 content
  return {
    componentList: present.componentList,
    pageTotal: present.pageTotal,
    props: present.props,
  };
}

/** 从远端 content 解析出 PresentType */
function deserializeContent(
  content: Record<string, unknown>,
  name: string,
  desc: string,
): PresentType {
  const componentList = (content.componentList as PresentType["componentList"]) ?? [];
  const pageTotal = (content.pageTotal as number) ?? 1;
  const props = (content.props as PresentType["props"]) ?? {};

  return {
    componentList,
    pageTotal,
    props,
    // name/desc 来自 Work 表最外层 name/desc
    name,
    desc: desc ?? "",
  };
}

export function EditorProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(editorReducer, {
    components: INITIAL_COMPONENTS,
    interaction: INITIAL_INTERACTION,
    selectedId: "",
    copiedComponent: null,
    currentPage: 1,
  });

  const [workId, setWorkIdState] = useState<number | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [isLoading, setIsLoading] = useState(false);
  const workIdRef = useRef<number | null>(null);
  const autoSaveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastSaveRef = useRef<number>(0);

  const setWorkId = useCallback((id: number) => {
    workIdRef.current = id;
    setWorkIdState(id);
  }, []);

  /** 加载问卷数据 */
  const loadWork = useCallback(async (id: number) => {
    setIsLoading(true);
    try {
      const work = await workApi.find(id);
      if (work?.content && typeof work.content === "object") {
        const present = deserializeContent(
          work.content as Record<string, unknown>,
          work.name ?? "",
          work.desc ?? "",
        );
        dispatch({ type: "RESET_COMPONENTS", payload: present });
      }
    } catch {
      // 加载失败，保持空白编辑器
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 当 workId 变化时加载问卷
   
  useEffect(() => {
    if (workId) {
      loadWork(workId);
    }
  }, [workId, loadWork]);

  /** 保存内容到后端 */
  const saveContent = useCallback(
    async (isAuto = false): Promise<boolean> => {
      const currentId = workIdRef.current;
      if (!currentId) return false;

      setSaveStatus("saving");
      try {
        await workApi.save({
          id: currentId,
          name: state.components.present.name,
          desc: state.components.present.desc,
          content: serializeState(state),
          isAuto,
        });
        setSaveStatus("saved");
        lastSaveRef.current = Date.now();
        return true;
      } catch {
        setSaveStatus("error");
        return false;
      }
    },
    [state],
  );

  /** 自动暂存：每 90 秒触发一次 */
  useEffect(() => {
    if (!workId) return;

    autoSaveTimerRef.current = setInterval(() => {
      // 它是一个防重复保存的守卫条件。自动保存定时器每 90 秒触发一次，如果用户在定时器触发前 5 秒内刚刚手动保存过（比如 saveContent(false)），那么 Date.now() - lastSaveRef.current 会小于 85000，条件不成立，本次自动保存就会跳过，避免短时间内重复保存。
      if (Date.now() - lastSaveRef.current > 85000) {
        saveContent(true);
      }
    }, 90000);

    return () => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
      }
    };
  }, [workId, saveContent]);

  // 3 秒后清除 "saved" 状态显示
  useEffect(() => {
    if (saveStatus === "saved") {
      const t = setTimeout(() => setSaveStatus("idle"), 3000);
      return () => clearTimeout(t);
    }
  }, [saveStatus]);

  return (
    <EditorContext.Provider
      value={{ state, dispatch, workId, setWorkId, saveStatus, saveContent, isLoading }}
    >
      {children}
    </EditorContext.Provider>
  );
}

export function useEditor() {
  const ctx = useContext(EditorContext);
  if (!ctx) throw new Error("useEditor must be used within EditorProvider");
  return ctx;
}

/** Convenience hook: returns component info derived from state. */
export function useGetComponentInfo() {
  const { state } = useEditor();
  const { present } = state.components;
  const selectedComponent = present.componentList.find((c) => c.feUuid === state.selectedId);
  return {
    componentList: present.componentList,
    selectedId: state.selectedId,
    copiedComponent: state.copiedComponent,
    currentPage: state.currentPage,
    pageTotal: present.pageTotal,
    props: present.props,
    selectedComponent,
    isPast: state.components.past.length > 0,
    isFuture: state.components.future.length > 0,
  };
}

/** Convenience hook: returns page info. */
export function useGetPageInfo() {
  const { state } = useEditor();
  const { name, desc } = state.components.present;
  return { name, desc };
}

/** Convenience hook: returns interaction info. */
export function useGetInteractionInfo() {
  const { state } = useEditor();
  return state.interaction;
}
