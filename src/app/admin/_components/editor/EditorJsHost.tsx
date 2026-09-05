'use client';

/**
 * Editor.js 宿主：只负责「把 Editor.js 挂上来、卸下去、暴露读写接口」
 *
 * 不放在 `src/components/`：admin 相关的东西一律不侵入其他目录。
 * 所有 Editor.js 相关的样式覆盖都在同目录的 `editorjs.module.css`。
 *
 * 三个必须这么写的点：
 *
 * 1. **动态 import** —— Editor.js 只在浏览器跑，直接顶层 import 会在 SSR 阶段炸。
 * 2. **每次 mount 自己建一个子 holder，卸载时 remove** —— React StrictMode 下
 *    useEffect 会 mount→unmount→mount，共享 DOM 会出现两份编辑器。
 * 3. **外层靠 `key` 重建** —— 数据到位后再挂载，避免初值迟到不生效
 *    （docs 里 `editorKey` 就是这个用途）。
 */

import { useEffect, useImperativeHandle, useRef, type Ref } from 'react';
// 拆成两行：`import type X, { Y }` 是非法语法（TS1363），默认导入与命名绑定不能混用
import type EditorJS from '@editorjs/editorjs';
import type { ToolConstructable } from '@editorjs/editorjs';
import styles from './editorjs.module.css';
import type { EditorJsBlock } from '../../_lib/editor/adapter';
import { uploadByFile } from '../../_lib/editor/uploader';
import ReadonlyBlock from './ReadonlyBlock';

export interface EditorJsHandle {
  /** 读取当前正文（Editor.js 原生 block 数组） */
  getBlocks: () => Promise<EditorJsBlock[]>;
  /** 用新的 block 数组整体重绘（JSON 编辑回灌用） */
  setBlocks: (blocks: EditorJsBlock[]) => Promise<void>;
}

export function EditorJsHost({
  initialBlocks,
  onChange,
  ref,
}: {
  initialBlocks: EditorJsBlock[];
  /** 内容变化回调（用于脏状态追踪）。用 ref 转发，避免闭包过期 */
  onChange?: () => void;
  ref?: Ref<EditorJsHandle>;
}) {
  const holderRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<EditorJS | null>(null);

  // onChange 每次渲染都可能变（内联箭头函数），用 ref 转发避免重建编辑器
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  });

  useEffect(() => {
    const wrapper = holderRef.current;
    if (!wrapper) return;

    // 本次 mount 专属的 holder，避免与其他实例共享 DOM
    const holder = document.createElement('div');
    wrapper.appendChild(holder);

    let cancelled = false;

    Promise.all([
      import('@editorjs/editorjs'),
      import('@editorjs/header'),
      import('@editorjs/list'),
      import('@editorjs/code'),
      import('@editorjs/table'),
      import('@editorjs/image'),
      import('@editorjs/warning'),
    ]).then(
      ([
        { default: EditorJSClass },
        { default: Header },
        { default: List },
        { default: Code },
        { default: Table },
        { default: ImageTool },
        { default: Warning },
      ]) => {
        if (cancelled) return;

        const editor = new EditorJSClass({
          holder,
          minHeight: 120,
          placeholder: '开始书写正文；用「二级标题」开启新章节。',
          onChange: () => onChangeRef.current?.(),
          tools: {
            // 声明顺序 = 工具箱里的展示顺序
            header: Header,
            list: { class: List, inlineToolbar: true },
            code: Code,
            // 借 warning 插件承载 callout：title 存 variant，message 存正文
            warning: {
              class: Warning,
              inlineToolbar: true,
              config: { titlePlaceholder: '变体', messagePlaceholder: '提示内容' },
            },
            table: {
              /**
               * @editorjs/table 是 JSDoc 声明，其构造函数把 `config` 标成了必填，
               * 而 Editor.js 的 `BlockToolConstructable` 里 config 是可选的 ——
               * 参数逆变导致类型不兼容。运行期完全正常，属上游类型缺陷，断言掉。
               */
              class: Table as unknown as ToolConstructable,
              inlineToolbar: true,
              config: { withHeadings: true },
            },
            image: {
              class: ImageTool,
              config: {
                uploader: { uploadByFile },
                types: 'image/jpeg, image/png, image/gif, image/webp, image/svg+xml',
                captionPlaceholder: '替代文本（alt）',
              },
            },
            // 无插件的 4 种 ContentBlock 的避难所
            _readonly: ReadonlyBlock,
          },
          data: { blocks: initialBlocks },
        });

        editorRef.current = editor;
      },
    );

    return () => {
      cancelled = true;
      try {
        editorRef.current?.destroy();
      } catch {
        /* destroy 在半初始化状态下可能抛，忽略即可 */
      }
      editorRef.current = null;
      holder.remove();
    };
    // 只在 mount 时初始化；换文章靠外层 key 重建
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useImperativeHandle(ref, () => ({
    getBlocks: async () => {
      const editor = editorRef.current;
      if (!editor) throw new Error('编辑器尚未就绪，请稍后再试');
      // isReady 必须等：插件异步初始化完成前 save() 会拿到空数据
      await editor.isReady;
      const output = await editor.save();
      return (output.blocks ?? []) as EditorJsBlock[];
    },

    setBlocks: async (blocks) => {
      const editor = editorRef.current;
      if (!editor) throw new Error('编辑器尚未就绪，请稍后再试');
      await editor.isReady;
      await editor.render({ blocks });
    },
  }));

  return <div ref={holderRef} className={styles.scope} />;
}
