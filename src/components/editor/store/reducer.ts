import { nanoid } from "nanoid";
import type {
  ComponentInfoType,
  ComponentsStateType,
  PresentType,
  InteractionStateType,
  EditorStateType
} from "./types";
import { MAX_COMPONENTS_PER_PAGE, MAX_PAGES, isPageFull } from "./constants";

// ============== 工具函数 ==============

/** 深拷贝（基于 JSON 序列化，因为 state 中只有可序列化的纯数据） */
function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/** 数组元素位移：将数组中索引 from 处的元素移动到索引 to 处，返回新数组（不修改原数组） */
function arrayMove<T>(arr: T[], from: number, to: number): T[] {
  const r = [...arr];
  const [item] = r.splice(from, 1);
  r.splice(to, 0, item);
  return r;
}

/**
 * 根据当前选中组件 id，计算「删除该组件后」应该选中的下一个组件 id
 * 规则：
 * 1. 仅在「未隐藏」的组件中查找
 * 2. 若只剩 1 个组件或找不到，返回 ""（取消选中）
 * 3. 若被删的是最后一个，则选中前一个；否则选中后一个
 */
function getNextSelectedId(feUuid: string, list: ComponentInfoType[]) {
  const visible = list.filter((c) => !c.isHidden);
  const idx = visible.findIndex((c) => c.feUuid === feUuid);
  if (idx < 0) return "";
  if (visible.length <= 1) return "";
  if (idx + 1 === visible.length) return visible[idx - 1].feUuid;
  return visible[idx + 1].feUuid;
}

// ============== 初始状态 ==============

/** 组件状态初始值：空画布、第 1 页、共 1 页，撤销重做栈均为空 */
export const INITIAL_COMPONENTS: ComponentsStateType = {
  present: { 
    componentList: [], 
    pageTotal: 1, 
    props: {},
    name: "",
    desc: "",
  },
  past: [], 
  future: [],
};

/** 交互态初始值：当前没有富文本编辑器处于激活态 */
export const INITIAL_INTERACTION: InteractionStateType = { 
  editorSelectedId: "" 
};

// ============== Action 类型定义 ==============

export type Action =
  // —— 撤销重做相关 ——
  | { type: "PUSH_PAST" }                                 // 把当前 present 压入 past 栈，并清空 future（任何会被撤销的操作前都要先调用）
  | { type: "UNDO" }                                      // 撤销：从 past 取最近一项作为 present，当前 present 进 future
  | { type: "REDO" }                                      // 重做：从 future 取最近一项作为 present，当前 present 进 past

  // —— 组件列表整体替换 ——
  | { type: "RESET_COMPONENTS"; payload: PresentType }    // 整体重置 present（如加载远端问卷数据）

  // —— 选中态 ——
  | { type: "CHANGE_SELECTED_ID"; payload: string }       // 切换当前选中的组件

  // —— 单个组件增删改 ——
  | { type: "ADD_COMPONENT"; payload: ComponentInfoType } // 新增组件，插入到当前选中之后
  | { type: "CHANGE_COMPONENT_PROPS"; payload: { feUuid: string; newProps: Record<string, unknown> } } // 修改组件 props（合并）
  | { type: "REMOVE_SELECTED_COMPONENT" }                 // 删除当前选中的组件
  | { type: "TOGGLE_COMPONENT_HIDDEN"; payload: { feUuid: string } }                  // 切换显示/隐藏
  | { type: "TOGGLE_COMPONENT_LOCKED"; payload: { feUuid: string } }                    // 切换锁定状态

  // —— 复制粘贴 ——
  | { type: "COPY_SELECTED_COMPONENT" }                   // 复制当前选中的组件到 copiedComponent
  | { type: "PASTE_COPIED_COMPONENT"; payload: { page: number } } // 粘贴：生成新 feUuid，插入到当前选中之后

  // —— 上下选择 ——
  | { type: "SELECT_PREV_COMPONENT" }                     // 选中上一个组件
  | { type: "SELECT_NEXT_COMPONENT" }                     // 选中下一个组件

  // —— 标题修改 / 排序 / 整体替换 ——
  | { type: "CHANGE_COMPONENT_TITLE"; payload: { feUuid: string; title: string } }      // 修改组件 title（图层名）
  | { type: "MOVE_COMPONENT"; payload: { oldIndex: number; newIndex: number } }         // 拖拽排序
  | { type: "REPLACE_COMPONENT"; payload: ComponentInfoType[] }                         // 整体替换 componentList

  // —— 分页 ——
  | { type: "CHANGE_CURRENT_PAGE"; payload: number }      // 切换当前编辑页码
  | { type: "CHANGE_PAGE_TOTAL"; payload: number }        // 修改总页数

  // —— 页面元信息 ——
  | { type: "CHANGE_PAGE_NAME"; payload: string }        // 仅修改问卷名称
  | { type: "CHANGE_PAGE_DESC"; payload: string }        // 仅修改问卷描述

  // —— 交互态 ——
  | { type: "CHANGE_EDITOR_SELECTED_ID"; payload: string }; // 切换当前激活的富文本编辑器 id


// ============== Reducer ==============

/**
 * 编辑器全局 reducer，纯函数：根据 action 计算新的 state
 * 约定：所有需要进入撤销栈的「数据型」操作，调用方需先 dispatch PUSH_PAST，再 dispatch 真正的修改 action
 */
export function editorReducer(state: EditorStateType, action: Action): EditorStateType {
  const { components, interaction } = state;
  const present = components.present;

  switch (action.type) {
    // 把当前 present 压入历史栈，同时清空 future（一旦做了新操作，后续重做就失效了）
    case "PUSH_PAST":
      return { ...state, components: { ...components, past: [...components.past, deepClone(present)], future: [] } };

    // 撤销：取出 past 末尾作为 present，当前 present 入 future 头部
    case "UNDO":
      if (!components.past.length) return state;
      return { ...state, components: { present: components.past.at(-1)!, past: components.past.slice(0, -1), future: [deepClone(present), ...components.future] } };

    // 重做：取出 future 头部作为 present，当前 present 入 past 末尾
    case "REDO":
      if (!components.future.length) return state;
      return { ...state, components: { present: components.future[0], past: [...components.past, deepClone(present)], future: components.future.slice(1) } };

    // 整体重置 present（加载远端数据时使用）
    case "RESET_COMPONENTS":
      return { ...state, components: { ...components, present: action.payload } };

    // 切换选中
    case "CHANGE_SELECTED_ID":
      return { ...state, selectedId: action.payload };

    // 新增组件：插入到当前选中之后，并把选中态切换到新组件
    // 限制：每页最多 MAX_COMPONENTS_PER_PAGE 个组件（不区分组件类型），超限直接忽略
    case "ADD_COMPONENT": {
      if (isPageFull(present.componentList, action.payload.page)) return state;
      const p = deepClone(present);
      const idx = p.componentList.findIndex((x) => x.feUuid === state.selectedId);
      if (idx < 0) p.componentList.push(action.payload);
      else p.componentList.splice(idx + 1, 0, action.payload);
      return { ...state, selectedId: action.payload.feUuid, components: { ...components, present: p } };
    }

    // 修改组件 props（与原 props 合并）
    case "CHANGE_COMPONENT_PROPS": {
      const p = deepClone(present);
      const c = p.componentList.find((x) => x.feUuid === action.payload.feUuid);
      if (c) c.props = { ...c.props, ...action.payload.newProps };
      return { ...state, components: { ...components, present: p } };
    }

    // 删除当前选中的组件，并自动选中相邻的下一个/上一个
    case "REMOVE_SELECTED_COMPONENT": {
      const p = deepClone(present);
      const nextSelectedId = getNextSelectedId(state.selectedId, p.componentList);
      p.componentList = p.componentList.filter((c) => c.feUuid !== state.selectedId);
      return { ...state, selectedId: nextSelectedId, components: { ...components, present: p } };
    }

    // 切换显示/隐藏；如果切换后是隐藏且该组件正好被选中，则取消选中
    case "TOGGLE_COMPONENT_HIDDEN": {
      const p = deepClone(present);
      const c = p.componentList.find((x) => x.feUuid === action.payload.feUuid);
      if (c) {
        c.isHidden = !c.isHidden;
      }
      return { ...state, components: { ...components, present: p } };
    }

    // 切换锁定状态
    case "TOGGLE_COMPONENT_LOCKED": {
      const p = deepClone(present);
      const c = p.componentList.find((x) => x.feUuid === action.payload.feUuid);
      if (c) c.isLocked = !c.isLocked;
      return { ...state, components: { ...components, present: p } };
    }

    // 复制：把当前选中的组件深拷贝后存入 copiedComponent（剪贴板）
    case "COPY_SELECTED_COMPONENT": {
      const sel = present.componentList.find((c) => c.feUuid === state.selectedId);
      if (!sel) return state;
      return { ...state, copiedComponent: deepClone(sel) };
    }

    // 粘贴：从 copiedComponent 取出，重新生成 feUuid 并指定页码后插入
    // 限制：每页最多 MAX_COMPONENTS_PER_PAGE 个组件（不区分组件类型），超限直接忽略
    case "PASTE_COPIED_COMPONENT": {
      if (!state.copiedComponent) return state;
      if (isPageFull(present.componentList, action.payload.page)) return state;
      const p = deepClone(present);
      const c = deepClone(state.copiedComponent);
      c.feUuid = nanoid(); c.page = action.payload.page;
      const idx = p.componentList.findIndex((x) => x.feUuid === state.selectedId);
      if (idx < 0) p.componentList.push(c);
      else p.componentList.splice(idx + 1, 0, c);
      return { ...state, selectedId: c.feUuid, components: { ...components, present: p } };
    }

    // 选中上一个组件（基于 componentList 顺序）
    case "SELECT_PREV_COMPONENT": {
      const idx = present.componentList.findIndex((c) => c.feUuid === state.selectedId);
      if (idx <= 0) return state;
      return { ...state, selectedId: present.componentList[idx - 1].feUuid };
    }

    // 选中下一个组件
    case "SELECT_NEXT_COMPONENT": {
      const idx = present.componentList.findIndex((c) => c.feUuid === state.selectedId);
      if (idx < 0 || idx + 1 >= present.componentList.length) return state;
      return { ...state, selectedId: present.componentList[idx + 1].feUuid };
    }

    // 修改组件 title（即图层列表中显示的名称）
    case "CHANGE_COMPONENT_TITLE": {
      const p = deepClone(present);
      const c = p.componentList.find((x) => x.feUuid === action.payload.feUuid);
      if (c) c.title = action.payload.title;
      return { ...state, components: { ...components, present: p } };
    }

    // 拖拽排序：把 oldIndex 处的组件移动到 newIndex 处
    case "MOVE_COMPONENT": {
      const p = deepClone(present);
      p.componentList = arrayMove(p.componentList, action.payload.oldIndex, action.payload.newIndex);
      return { ...state, components: { ...components, present: p } };
    }

    // 整体替换组件列表（如外部传入排好序的新列表）
    case "REPLACE_COMPONENT":
      return { ...state, components: { ...components, present: { ...present, componentList: action.payload } } };

    // 切换当前正在编辑的页码
    case "CHANGE_CURRENT_PAGE":
      return { ...state, currentPage: action.payload };

    // 修改问卷总页数（限制在 1 ~ MAX_PAGES 之间）
    case "CHANGE_PAGE_TOTAL":
      return { ...state, components: { ...components, present: { ...present, pageTotal: Math.min(Math.max(1, action.payload), MAX_PAGES) } } };

    // 仅修改问卷名称
    case "CHANGE_PAGE_NAME":
      return { ...state, components: { ...components, present: { ...present, name: action.payload } } };

    // 仅修改问卷描述
    case "CHANGE_PAGE_DESC":
      return { ...state, components: { ...components, present: { ...present, desc: action.payload } } };

    // 切换当前激活的富文本编辑器 id（用于多个 Quill 实例之间区分焦点）
    case "CHANGE_EDITOR_SELECTED_ID":
      return { ...state, interaction: { ...interaction, editorSelectedId: action.payload } };

    default:
      return state;
  }
}

