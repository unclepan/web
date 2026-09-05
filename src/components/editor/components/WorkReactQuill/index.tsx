/**
 * WorkReactQuill —— 富文本编辑器组件（基于 react-quill@2 + Quill 1.3.7）
 *
 * 【设计要点】
 *  1. 双模式渲染：
 *     - 选中态 → 渲染完整 ReactQuill 编辑器（带工具栏）
 *     - 非选中态 → 渲染只读 HTML（用 quillGetHTML 把 Delta 转成 HTML）
 *     这样可以避免页面上同时存在多个 Quill 实例（性能 + 工具栏冲突）。
 *
 *  2. 客户端动态加载：
 *     Quill / react-quill 都需要 document/window，必须 ssr:false 动态加载。
 *
 *  3. React 19 兼容：
 *     react-quill@2 依赖已被移除的 ReactDOM.findDOMNode，
 *     在 dynamic loader 里先 await patchFindDOMNode() 注入 polyfill。
 */

"use client";

import React, { FC, useState, MouseEvent, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import type ReactQuillType from "react-quill";
import { cn } from "@/lib/utils";
import {
  initQuill,
  loadQuill,
  patchFindDOMNode,
  blanksHandler,
  customMatcher,
  imageHandler,
} from "./customQuill";
import { quillGetHTML } from "@/components/editor/utils/quill";
import { useGetInteractionInfo, useEditor } from "@/components/editor/store/EditorProvider";
import "quill/dist/quill.snow.css"; // Quill 自带的 snow 主题样式
import styles from "./index.module.css";

/**
 * 动态加载 ReactQuill。
 *
 * 【为什么要在 dynamic 内部串行执行三步】
 *  patchFindDOMNode → loadQuill → initQuill → import("react-quill")
 *
 *  执行顺序非常关键：
 *  ① patch 必须在 react-quill 模块代码执行前完成（否则报 findDOMNode is not a function）
 *  ② loadQuill 拿到 Quill 构造器，传给 initQuill 做图标 / Blot 注册
 *  ③ initQuill 必须在 ReactQuill 实例化前完成（否则 toolbar 找不到 'blanks' 格式）
 *  ④ 最后 return 的 import("react-quill") 才是 next/dynamic 真正要加载的模块
 *
 * 【为什么用 as React.FC<{...}> 强转】
 *  next/dynamic 返回的类型在新版 Next 中不再保留 ref 属性的支持，
 *  这里手动声明组件 props 类型（含 ref），让 TS 能正确校验 <ReactQuill ref=... />
 */
const ReactQuill = dynamic(
  async () => {
    await patchFindDOMNode();
    const Q = await loadQuill();
    initQuill(Q);
    return import("react-quill");
  },
  { ssr: false, loading: () => null },
) as React.FC<{
  ref?: React.Ref<ReactQuillType>;
  defaultValue?: ReactQuillType.Value;
  theme?: string;
  onChange?: (
    value: string,
    delta: unknown,
    source: unknown,
    editor: ReactQuillType.UnprivilegedEditor,
  ) => void;
  modules?: Record<string, unknown>;
  formats?: string[];
}>;

// ---------- props ----------

export type WorkReactQuillPropsType = {
  /** 初始内容：JSON 序列化的 Delta，或纯字符串 */
  value: string;
  /** 当前编辑的字段名（一个组件可能有多个文本字段，比如 title/desc） */
  editorProp: string;
  /** 当前组件的唯一 ID（用于 redux/dispatch 标记选中） */
  feUuid: string;
  /** 内容变化回调，参数是字段名和新的 JSON 字符串 */
  onChange?: (editorProp: string, delta: string) => void;
  /** 是否显示「插入填空线」按钮（默认 true） */
  showBlanks?: boolean;
  /** 是否显示标题按钮（默认 true） */
  showHeader?: boolean;
  /** 是否显示对齐按钮（默认 true） */
  showAlign?: boolean;
  /** 是否显示链接按钮（默认 true） */
  showLink?: boolean;
  /** 是否显示图片按钮（默认 true） */
  showImage?: boolean;
  /** 是否显示视频按钮（默认 true） */
  showVideo?: boolean;
};

// ---------- component ----------

const WorkReactQuill: FC<WorkReactQuillPropsType> = (props) => {
  const {
    editorProp,
    feUuid,
    onChange,
    showBlanks = false,
    showHeader = true,
    showAlign = true,
    showLink = true,
    showImage = true,
    showVideo = true,
  } = props;

  // 编辑器唯一 ID = 组件 ID + 字段名
  // 用来在 redux 中标记"当前选中的是哪个字段的编辑器"
  const editorId = `${feUuid}-${editorProp}`;

  const { dispatch } = useEditor();
  const { editorSelectedId } = useGetInteractionInfo();

  // 保存 ReactQuill 实例引用（用于 useEffect 中操作底层 Quill API）
  const [reactQuillRef, setReactQuillRef] = useState<ReactQuillType | null>(null);

  // 跟踪编辑器 DOM 是否已挂载 → 首次动态加载时 static 不能提前隐藏
  const [editorMounted, setEditorMounted] = useState(false);

  /**
   * 编辑器挂载后的副作用：
   *  1. 自动聚焦
   *  2. 修改链接/视频 tooltip 输入框的 placeholder（默认是英文）
   */
  useEffect(() => {
    if (!reactQuillRef?.editor) return;

    const { editor } = reactQuillRef;
    editor.focus();

    // editor.theme.tooltip 是 Snow 主题的链接面板对象（Quill 内部 API，无类型定义）
    // 双重 unknown 断言：先洗掉原类型，再断言成可索引对象
    const theme = (editor as unknown as Record<string, unknown>).theme as
      | Record<string, unknown>
      | undefined;
    const tooltip = theme?.tooltip as { root: HTMLElement } | undefined;

    if (tooltip) {
      // tooltip.root 是浮层 DOM，里面有 link/video 两个隐藏的 input
      const inputLink = tooltip.root.querySelector<HTMLInputElement>("input[data-link]");
      if (inputLink) inputLink.dataset.link = "www.link.com";

      const inputVideo = tooltip.root.querySelector<HTMLInputElement>("input[data-video]");
      if (inputVideo) inputVideo.dataset.video = "www.video.com";
    }
  }, [reactQuillRef]);

  // ============================================================
  // 工具栏 / 格式 配置
  // ============================================================

  /**
   * formats 白名单：只有列在这里的格式才会被保留
   * - 不在白名单内的格式（比如 'bold'、'italic'）会被 Quill 自动剥离
   * - alt/width/height/style/id 是给 image Blot 使用的额外属性
   */
  const formats = [
    "bold",
    "italic",
    "underline",
    "strike",
    "header",
    "background",
    "color",
    "align",
    "link",
    "image",
    "video",
    "blanks",
    "alt",
    "width",
    "height",
    "style",
    "id",
  ];

  /**
   * toolbar.container：声明工具栏按钮的布局。
   *
   * 【关键规则】每个顶级元素必须是数组 — Quill 内部 addControls 会对其调 .forEach()
   *  - 字符串数组：同一组按钮，如 ["bold","italic"]
   *  - 对象数组：带选项的控件，如 [{ color:[] }, { background:[] }]
   */
  const container: unknown[] = [];
  if (showHeader) container.push([{ header: [1, 2, 3, false] }]);
  container.push(["bold"]);
  container.push([{ color: [] }]);
  if (showLink) container.push(["link"]);
  if (showImage) container.push(["image"]);
  if (showVideo) container.push(["video"]);
  if (showAlign) container.push([{ align: ["", "right", "center"] }]);
  if (showBlanks) container.push(["blanks"]);

  /**
   * Quill modules 配置：
   * - clipboard.matchers: 自定义粘贴行为（去格式化）
   * - toolbar.container:  按钮布局（见上）
   * - toolbar.handlers:   覆盖默认 handler（blanks 是自定义按钮，image 是覆盖默认行为）
   */
  const modules: Record<string, unknown> = {
    clipboard: {
      matchers: [[Node.ELEMENT_NODE, customMatcher]],
    },
    toolbar: {
      container: [...container],
      handlers: {
        blanks: blanksHandler,
        image: imageHandler,
      },
    },
  };

  /**
   * 内容变化回调
   *
   * react-quill 的 onChange 签名是：
   *   (value: string, delta, source, editor) => void
   *
   * 我们不用 value（它是 HTML 字符串），而是从 editor.getContents() 拿 Delta，
   * 这是因为 Delta 是结构化数据，存数据库 / 来回转换都更可靠。
   */
  function handleChange(
    _value: string,
    _delta: unknown,
    _source: unknown,
    editor: ReactQuillType.UnprivilegedEditor,
  ) {
    const e = editor.getContents();
    // 把 Delta 序列化成 JSON 字符串往上传
    onChange?.(editorProp, JSON.stringify(e));
  }

  /**
   * 点击编辑器：通知 EditorProvider 当前选中了哪个组件 + 哪个字段
   *
   * stopPropagation 是为了阻止冒泡到外层 EditCanvas，
   * 否则会触发画布的"取消选中"逻辑。
   */
  const handleClick = useCallback(
    (event: MouseEvent) => {
      if (!feUuid) return;
      event.stopPropagation();
      dispatch({ type: "CHANGE_SELECTED_ID", payload: feUuid });
      dispatch({ type: "CHANGE_EDITOR_SELECTED_ID", payload: editorId });
    },
    [dispatch, feUuid, editorId],
  );

  /**
   * 解析 props.value：
   *  - 历史数据可能是 Delta JSON 字符串 → JSON.parse 成 Delta 对象
   *  - 也可能是裸字符串 → 直接当 plain text
   */
  let defaultValue: unknown;
  try {
    defaultValue = JSON.parse(props.value);
  } catch {
    defaultValue = props.value;
  }

  // ============================================================
  // 双模式渲染（稳定容器，避免 DOM 重建抖动）
  // ------------------------------------------------------------
  // static 层始终保留在 DOM 中（仅隐藏），编辑器层叠加在上方。
  // 这样从 static → editor 切换时不会销毁旧 DOM，消除闪烁/抖动。
  // ============================================================

  const isSelected = editorSelectedId === editorId && !!feUuid;
  const staticText = quillGetHTML(defaultValue as { ops: never[] } | string);

  return (
    <div
      className={cn(styles.editor)}
      onClick={(e) => handleClick(e)}
    >
      {/* static 层：始终存在，编辑器挂载完成后才隐藏 */}
      <div
        className={cn("ql-editor", styles.static, isSelected && editorMounted && styles.staticHidden)}
        dangerouslySetInnerHTML={{ __html: staticText }}
      />

      {/* editor 层：仅选中时挂载 */}
      {isSelected && (
        <ReactQuill
          ref={(el) => {
            setReactQuillRef(el);
            setEditorMounted(!!el);
          }}
          defaultValue={defaultValue as ReactQuillType.Value}
          theme="snow"
          onChange={handleChange}
          modules={modules}
          formats={formats}
        />
      )}
    </div>
  );
}
export default WorkReactQuill;
