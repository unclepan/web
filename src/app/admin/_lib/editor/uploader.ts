/**
 * Editor.js 图片插件的自定义上传器
 *
 * 为什么要自己写而不用插件内置的 `endpoints.byFile`：
 *
 * 1. **响应格式对不上** —— 后端 `POST /docs/upload/cos` 返回 `{ url }`，
 *    而插件要求 `{ success: 1, file: { url } }`。改后端会波及别的调用方，
 *    在这里转一道最省事。
 * 2. **鉴权** —— 上传接口要求 SYSTEM_ADMIN + Bearer token。插件内置的是裸 fetch，
 *    带不上 `Authorization` 头。走项目的 `http` 封装由 `request()` 自动注入。
 *
 * 另外补一件插件不做的事：**回填真实图片宽高**。
 * 插件不保存尺寸，docs 的做法是读回来时无脑兜 800×450，
 * 那会让 next/image 按错误比例占位、首屏抖动。上传成功后读一次 naturalWidth 即可。
 */

import { adminUploadApi } from '../api';

/** 与 @editorjs/image 的 UploadResponseFormat 同构（避免深引插件内部 dist 路径） */
export interface EditorJsUploadResponse {
  success: number;
  file: {
    url: string;
    width?: number;
    height?: number;
    [key: string]: unknown;
  };
}

/** 尺寸兜底：读不到真实尺寸时给 16:9，至少比例正常 */
const FALLBACK = { width: 800, height: 450 };

function readImageSize(url: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(FALLBACK);
      return;
    }
    const img = new window.Image();
    img.onload = () =>
      resolve({
        width: img.naturalWidth || FALLBACK.width,
        height: img.naturalHeight || FALLBACK.height,
      });
    img.onerror = () => resolve(FALLBACK);
    img.src = url;
  });
}

/**
 * Editor.js image 工具的 `config.uploader.uploadByFile`
 *
 * 抛出的错误会被插件捕获并以其内置样式提示，所以错误信息尽量人话。
 */
export async function uploadByFile(file: Blob): Promise<EditorJsUploadResponse> {
  const { url } = await adminUploadApi.image(file);
  const { width, height } = await readImageSize(url);
  return { success: 1, file: { url, width, height } };
}
