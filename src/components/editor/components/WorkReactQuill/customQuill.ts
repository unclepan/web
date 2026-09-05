/**
 * customQuill.ts —— Quill 1.3.7 自定义配置（图标 / 自定义 Blot / 工具栏 handlers）
 *
 * 【为什么需要这个文件】
 *  1. 默认的 Quill 工具栏图标比较老气，需要替换成现代风格的 SVG。
 *  2. 业务需要"插入填空线"的功能 → 自定义一个 BlanksBlot（基于 Embed 类型）。
 *  3. 业务需要自定义粘贴行为（去格式化）和图片上传行为。
 *  4. React 19 移除了 ReactDOM.findDOMNode，但 react-quill@2 仍依赖它，
 *     所以要在加载 react-quill 之前注入 polyfill。
 *
 * 【为什么所有 Quill API 都延迟到 initQuill() 中调用】
 *  Quill 在 import 时就会访问 document/window，SSR 阶段会直接报错。
 *  把 Quill.import / register 放到 initQuill 中，由 dynamic() 在客户端触发。
 */

import type QuillType from "quill";
import { Palette, Image, Link, Video, Underline, Bold, Italic, Strikethrough, Heading, Highlighter } from "lucide-react";
import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import { createElement, type ComponentType } from "react";

// ---------- types ----------

/**
 * Quill 工具栏 handler 在被调用时，this 会指向 toolbar 模块实例，
 * 该实例上挂着 quill 编辑器引用。这里给 this 显式标注类型，避免使用 any。
 */
interface QuillToolbarThis {
  quill: QuillType;
}

/** Quill 1.x 的 selection 对象结构 */
interface QuillSelection {
  index: number;
  length: number;
}

// ---------- state ----------

/**
 * 缓存 Quill 构造函数（typeof QuillType = Quill 类本身）。
 * customMatcher 在 toolbar handler 之外被调用，需要单独访问 Quill.import('delta')，
 * 所以把 Quill 构造器存到模块级变量中复用。
 */
let quillInstance: typeof QuillType | null = null;

// ---------- findDOMNode polyfill (React 19) ----------
/**
 * 【背景】
 * react-quill@2.0.0 发布于 React 18 时代，源码内部调用 ReactDOM.findDOMNode(this)
 * 来获取编辑器 DOM 节点。React 19 已彻底移除该 API，直接调用会报：
 *   TypeError: react_dom_1.default.findDOMNode is not a function
 *
 * 【为什么不能改成 ref + useImperativeHandle】
 * react-quill 是第三方库，无法直接修改源码。最稳妥的方案是 monkey-patch：
 * 在 react-quill 模块加载之前，给 react-dom 的 default 对象注入 findDOMNode。
 *
 * 【为什么注入到 .default 而不是 namespace】
 * react-quill 编译后的代码是：require("react-dom").default.findDOMNode(...)
 * 在 ESM 环境下，import("react-dom") 返回的 namespace 对象是 frozen 的（不可扩展），
 * 而 namespace.default 才是 CJS 互操作的"真正默认导出对象"，它是普通对象，可写。
 */

const findDOMNodePolyfill = (component: unknown): Node | null => {
  // 防御：null/undefined 直接返回 null
  if (!component) return null;

  // 如果传进来本身就是 DOM 节点，原样返回
  if (component instanceof Node) return component;

  const obj = component as Record<string, unknown>;

  // ★ 主路径：react-quill 调用 findDOMNode(this)，this 是 ReactQuill 类组件实例
  //   该实例挂载完毕后会有 editor 属性，editor.root 就是 Quill 的根 DOM 节点
  const editor = obj.editor as Record<string, unknown> | undefined;
  if (editor?.root instanceof Node) return editor.root;

  // ★ 兜底路径：组件还没挂载好（editor 未生成）时，从 React Fiber 拿 DOM
  //   _reactInternals 是 React 18+ 的新字段，_reactInternalInstance 是更早的字段
  const fiber = (obj._reactInternals ?? obj._reactInternalInstance) as
    | { stateNode?: unknown }
    | undefined;
  if (fiber?.stateNode instanceof Node) return fiber.stateNode;

  return null;
};

/** 标记位：防止重复 patch（虽然幂等，但避免无意义的 try/catch 开销） */
let findDOMNodePatched = false;

export async function patchFindDOMNode(): Promise<void> {
  // SSR 阶段直接跳过（虽然 dynamic ssr:false，但保险起见）
  if (typeof window === "undefined" || findDOMNodePatched) return;

  // 动态 import，得到的 mod 是一个对象：
  //   { default: <CJS默认导出对象>, ...其他命名导出 }
  const mod = (await import("react-dom")) as Record<string, unknown> & {
    default?: Record<string, unknown>;
  };

  // ★ 关键：注入到 default 对象上（react-quill 实际访问的就是这里）
  const defaultExport = mod.default;
  if (defaultExport && typeof defaultExport === "object" && !defaultExport.findDOMNode) {
    try {
      defaultExport.findDOMNode = findDOMNodePolyfill;
    } catch {
      // 极端情况下 default 也可能被冻结，吞掉异常即可
    }
  }

  // 兼容性补丁：有些消费者直接 import { findDOMNode } from "react-dom"
  // namespace 在 ESM 下通常是 frozen，写入会抛 TypeError，用 try/catch 兜住
  if (!mod.findDOMNode) {
    try {
      mod.findDOMNode = findDOMNodePolyfill;
    } catch {
      // ignore
    }
  }

  findDOMNodePatched = true;
}

// ---------- Quill loader ----------

/**
 * 异步加载 Quill 构造函数。
 *
 * 【为什么要 ?? mod 兜底】
 * Quill 1.3.7 是 CJS 包：require('quill') 直接得到构造函数；
 * 但被 webpack/turbopack 处理后，可能包装成 { default: Quill } 的 ESM module。
 * 两种情况都要兼容。
 */
export async function loadQuill(): Promise<typeof QuillType> {
  if (quillInstance) return quillInstance;
  const mod = await import("quill");
  quillInstance =
    (mod as { default?: typeof QuillType }).default ?? (mod as unknown as typeof QuillType);
  return quillInstance;
}

// ---------- icon renderer ----------

/**
 * 将 lucide-react 图标组件渲染为 HTML 字符串（供 Quill.import('ui/icons') 使用）。
 *
 * 【为什么用 createRoot + flushSync】
 *  Quill 的图标系统只接受 HTML 字符串，而 lucide-react 导出的是 React 组件。
 *  createRoot 是 React 18+ 的客户端渲染 API，flushSync 确保在读到 innerHTML 前
 *  DOM 已完成同步更新。
 */
function iconToHTML(Icon: ComponentType<{ size?: number; strokeWidth?: number }>): string {
  const div = document.createElement("div");
  const root = createRoot(div);
  flushSync(() => {
    root.render(createElement(Icon, { size: 18, strokeWidth: 2 }));
  });
  const html = div.innerHTML;
  root.unmount();
  return html;
}

/**
 * 将原始 SVG 子节点字符串包装为完整 SVG HTML 字符串。
 *
 * 【为什么不用 iconToHTML】
 *  lucide-react v1.22.0 没有 AlignLeft/Center/Right/Justify 组件，
 *  用内联 SVG 路径取代 React 渲染，零开销且风格与 lucide 图标一致。
 *
 * 【设计约定】
 *  viewBox="0 0 24 24" + stroke 体系 → 与 lucide-react 图标视觉统一
 *  currentColor → 继承父级文字颜色（工具栏按钮 hover/active 自动跟随）
 */
function svgIcon(children: string): string {
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" ` +
    `viewBox="0 0 24 24" fill="none" stroke="currentColor" ` +
    `stroke-width="2" stroke-linecap="round" stroke-linejoin="round">` +
    children +
    `</svg>`
  );
}

// ---------- init ----------

/** 初始化标记，确保 register 只执行一次（重复 register 会被 Quill 警告） */
let initialized = false;

/**
 * 注册自定义图标 + 自定义 Blot。
 * 必须在创建任何 ReactQuill 实例之前调用。
 */
export function initQuill(Quill: typeof QuillType): void {
  if (initialized) return;
  initialized = true;

  // ============================================================
  // 1. 覆盖工具栏图标
  // ------------------------------------------------------------
  // Quill.import('ui/icons') 返回的是一个 { [格式名]: HTML字符串 } 的对象，
  // 直接修改它即可覆盖默认图标。Quill 渲染工具栏时会读取这个对象。
  // ============================================================
  const icons = Quill.import("ui/icons") as Record<string, string | Record<string, string>>;
  // 使用 iconToHTML 将 lucide-react 组件转为 HTML 字符串，确保图标风格统一
  icons["bold"] = iconToHTML(Bold);
  icons["italic"] = iconToHTML(Italic);
  icons["underline"] = iconToHTML(Underline);
  icons["strike"] = iconToHTML(Strikethrough);
  icons["header"] = iconToHTML(Heading);
  icons["color"] = iconToHTML(Palette);
  icons["background"] = iconToHTML(Highlighter);
  icons["image"] = iconToHTML(Image);
  icons["link"] = iconToHTML(Link);
  icons["video"] = iconToHTML(Video);
  icons["blanks"] = svgIcon(
    `<line x1="3" y1="12" x2="9" y2="12"/>` +
    `<line x1="15" y1="12" x2="21" y2="12"/>`,
  );

  // align 图标：lucide-react v1.22.0 无 AlignLeft/Center/Right/Justify，用内联 SVG 代替
  icons["align"] = {
    "": svgIcon(
      `<line x1="21" x2="3" y1="6" y2="6"/>` +
      `<line x1="15" x2="3" y1="12" y2="12"/>` +
      `<line x1="17" x2="3" y1="18" y2="18"/>`,
    ),
    center: svgIcon(
      `<line x1="21" x2="3" y1="6" y2="6"/>` +
      `<line x1="17" x2="7" y1="12" y2="12"/>` +
      `<line x1="19" x2="5" y1="18" y2="18"/>`,
    ),
    right: svgIcon(
      `<line x1="21" x2="3" y1="6" y2="6"/>` +
      `<line x1="21" x2="9" y1="12" y2="12"/>` +
      `<line x1="21" x2="7" y1="18" y2="18"/>`,
    ),
    // justify: svgIcon(
    //   `<line x1="3" x2="21" y1="6" y2="6"/>` +
    //   `<line x1="3" x2="21" y1="12" y2="12"/>` +
    //   `<line x1="3" x2="21" y1="18" y2="18"/>`,
    // ),
  };

  // ============================================================
  // 2. 注册自定义 BlanksBlot（"插入填空线" 功能）
  // ------------------------------------------------------------
  // 【Blot 是什么】
  //  Quill 把所有内容抽象为 Blot（一种 DOM 包装单元）。
  //  Embed 类型的 Blot 表示"不可拆分的嵌入元素"（类似图片、视频）。
  //
  // 【为什么必须用 super.create()，不能用 EmbedBlot.create()】
  //  Parchment（Quill 的底层）在 create() 内部读 this.tagName 来创建 DOM。
  //  - super.create() → this 指向 BlanksBlot → 能读到 tagName='i' ✅
  //  - EmbedBlot.create() → this 指向父类 → 父类没 tagName → 抛错 ❌
  //
  // 【类型断言为什么这样写】
  //  Quill.import 返回 unknown 类型，需要手动断言。
  //  - 构造签名 new (...): object —— 不能用 unknown，否则 TS 报 2509
  //  - create 用普通方法签名 —— 才能让子类 super.create() 调用合法
  // ============================================================
  const EmbedBlot = Quill.import("blots/embed") as {
    new (...args: unknown[]): object;
    create(value?: unknown): HTMLElement;
  };

  class BlanksBlot extends EmbedBlot {
    static blotName = "blanks"; // 在 toolbar 配置中通过此名称引用
    static tagName = "i"; // 渲染为 <i> 标签

    static create(value?: unknown): HTMLElement {
      // 调用父类逻辑创建 <i> 节点（Parchment 内部依赖 this.tagName）
      const node = super.create(value);
      // 给节点附加自定义属性 + 占位文字（一长串下划线）
      node.setAttribute("id", "canvas-blanks");
      node.setAttribute("style", "display: inline-block;");
      node.innerText = "____________";
      return node;
    }
  }

  // 注册到 Quill 的格式系统：以 "formats/blanks" 路径暴露
  // 这样在 toolbar.container 里写 'blanks' 就能找到这个 Blot
  Quill.register("formats/blanks", BlanksBlot);
}

// ---------- handlers ----------
/**
 * 工具栏 handler 是 Quill 提供的扩展点：
 * 当工具栏按钮被点击时，Quill 会以 toolbar 实例为 this 调用对应 handler。
 * 这里所有 handler 都用 `this: QuillToolbarThis` 标注，避免 any。
 */

/**
 * 「插入填空线」按钮的 handler
 * 点击后在光标位置插入一个 BlanksBlot，并把光标移到其后。
 */
export function blanksHandler(this: QuillToolbarThis): void {
  // 获取当前选区（用户没聚焦时为 null，需要兜底）
  const selection = this.quill.getSelection() as QuillSelection | null;
  if (!selection) return;

  const { index } = selection;
  // insertEmbed(位置, 格式名, 数据) —— 在 index 位置插入 blanks 嵌入
  this.quill.insertEmbed(index, "blanks", {});
  // 光标移到刚插入元素之后（length=0 表示纯光标，无选中）
  this.quill.setSelection({ index: index + 1, length: 0 });
}

/**
 * 自定义剪贴板 matcher：粘贴时只保留纯文本，去掉所有格式
 * - matcher 在 modules.clipboard.matchers 中绑定，规则是：
 *     [节点类型, matcher函数]
 * - matcher 必须返回一个 Delta 对象，Quill 用它替代默认粘贴行为
 */
export function customMatcher(node: HTMLElement): unknown {
  // 异常防御：Quill 还没加载好就被调用（理论上不会发生）
  if (!quillInstance) return { insert: node.innerText };

  // Delta 是 Quill 描述富文本变更的数据结构（OT 算法的载体）
  const Delta = quillInstance.import("delta") as new () => {
    insert: (text: string) => unknown;
  };
  const delta = new Delta();
  try {
    // node.innerText 自动剥离 HTML 标签，得到纯文本
    return delta.insert(node.innerText);
  } catch {
    return delta.insert("粘贴失败");
  }
}

/**
 * 「插入图片」按钮的 handler
 * 默认行为是弹 URL 输入框，这里改成弹本地文件选择，把图片转成 base64 嵌入。
 *
 * 【为什么用 const quill = this.quill 而不是 this 别名】
 * input.onchange 是异步回调，里面的 this 已经不是 toolbar 实例了。
 * 老写法是 `const that = this`，但会被 ESLint 的 no-this-alias 规则报错。
 * 直接闭包捕获 quill 引用更干净，类型推断也更准。
 */
export function imageHandler(this: QuillToolbarThis): void {
  // 创建隐藏的 file input 触发选择文件
  const input = document.createElement("input");
  input.setAttribute("type", "file");
  input.setAttribute("accept", "image/*");
  input.click();

  // 闭包捕获 quill 引用，回避 onchange 内的 this 漂移问题
  const quill = this.quill;
  input.onchange = () => {
    const file = input.files?.[0];
    if (!file) return;

    // FileReader 读取本地文件为 base64 dataURL（reader.result）
    const reader = new FileReader();
    reader.onload = () => {
      // 重新获取选区（用户切走再回来时 selection 可能已变）
      const selection = quill.getSelection() as QuillSelection | null;
      const cursorPosition = selection?.index ?? 0;
      // 在光标位置插入 image 格式（值为 base64 字符串）
      quill.insertEmbed(cursorPosition, "image", reader.result as string);
      quill.setSelection({ index: cursorPosition + 1, length: 0 });
    };
    reader.readAsDataURL(file);
  };
}
