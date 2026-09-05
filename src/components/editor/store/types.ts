/**
 * 编辑器组件列表中存储的单个组件信息
 * 画布上的每一个题目/组件都对应一条 ComponentInfoType
 */
export type ComponentInfoType = {
  /** 组件唯一标识（前端生成，用于 React key、选中态、定位等） */
  feUuid: string;
  /** 组件类型，例如 "questionInput"、"questionRadio"、"questionTitle" 等，用于决定渲染哪个组件 */
  type: string;
  /** 组件标题（在左侧组件库 / 图层列表中展示的名称） */
  title: string;
  /** 该组件所属页码（多页问卷中区分组件归属于第几页） */
  page: number;
  /** 是否隐藏：隐藏后画布上不渲染，但数据仍保留 */
  isHidden?: boolean;
  /** 是否锁定：锁定后不能拖动 / 编辑，防止误操作 */
  isLocked?: boolean;
  /** 组件自定义属性（不同 type 的组件结构不同，例如标题文案、占位符、选项列表等） */
  props: Record<string, unknown>;
};

/**
 * 「当前快照」——表示编辑器在当前时刻可见的全部状态
 * 配合 past / future 实现撤销重做（undo/redo）
 */
export type PresentType = {
  /** 当前画布上的所有组件列表 */
  componentList: ComponentInfoType[];
  /** 总页数 */
  pageTotal: number;
  /** 问卷级别的属性（例如全局主题、字体等，区别于单个组件的 props） */
  props: Record<string, unknown>;
  /** 问卷名称 */
  name: string;
  /** 问卷描述（可选） */
  desc: string;
};

/**
 * 包含撤销重做历史的完整组件状态
 * present 为当前状态，past 为历史栈，future 为重做栈
 */
export type ComponentsStateType = {
  /** 当前状态快照 */
  present: PresentType;
  /** 历史状态栈（撤销 undo 时从这里取） */
  past: PresentType[];
  /** 未来状态栈（重做 redo 时从这里取） */
  future: PresentType[];
};

/**
 * 编辑器交互态
 * 与组件数据无关，仅描述用户在编辑器界面中的交互状态
 */
export type InteractionStateType = {
  /** 当前正在被富文本编辑的元素 id（用于区分哪个 Quill 实例处于激活态） */
  editorSelectedId: string;
};

/**
 * 编辑器全局根状态
 * 由三大块组成：组件数据、页面元信息、交互状态
 */
export type EditorStateType = {
  /** 组件相关状态（含撤销重做） */
  components: ComponentsStateType;
  /** 交互态 */
  interaction: InteractionStateType;
  /** 当前被选中的组件 feUuid（用于高亮、显示右侧属性面板等） */
  selectedId: string;
  /** 被复制的组件（用于粘贴功能），未复制时为 null */
  copiedComponent: ComponentInfoType | null;
  /** 当前正在编辑的页码 */
  currentPage: number;
};
