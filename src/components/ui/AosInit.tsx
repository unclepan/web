"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import AOS from "aos";
import "aos/dist/aos.css";

/**
 * Initialises the AOS (Animate On Scroll) library on the client.
 *
 * 关键修复（针对真机移动浏览器首次加载空白问题）：
 * 1. 使用较大的 offset，避免首屏元素刚好卡在阈值边缘导致不触发；
 * 2. 监听 pathname 变化，在客户端路由切换后 refreshHard，
 *    否则新页面的 [data-aos] 元素会一直保持 opacity:0；
 * 3. 在 window load / 图片加载完成后再 refresh，确保布局
 *    高度稳定后再进行位置计算；
 * 4. 兜底：设置一个超时，如果元素长时间未被激活，强制补上
 *    aos-animate 类，避免永远空白。
 */
export default function AosInit() {
  const pathname = usePathname();

  useEffect(() => {
    AOS.init({
      duration: 600,
      easing: "ease-out-cubic",
      once: true,
      offset: 50,
      // 关闭对 disabled devices 的自动禁用（AOS 默认在部分移动端会禁用）
      disable: false,
      // 使用 mutation observer，动态内容也能被检测
      startEvent: "DOMContentLoaded",
    });

    // 首屏加载完成（图片、字体）后再刷新一次，确保元素位置计算准确
    const handleLoad = () => {
      AOS.refreshHard();
    };
    if (document.readyState === "complete") {
      // 已经 load 完成，直接 refresh
      requestAnimationFrame(() => AOS.refreshHard());
    } else {
      window.addEventListener("load", handleLoad);
    }

    // 兜底：1.2s 后如果还有元素没有 aos-animate，强制显示，防止空白
    const fallbackTimer = window.setTimeout(() => {
      document
        .querySelectorAll<HTMLElement>("[data-aos]:not(.aos-animate)")
        .forEach((el) => {
          el.classList.add("aos-animate");
        });
    }, 1200);

    return () => {
      window.removeEventListener("load", handleLoad);
      window.clearTimeout(fallbackTimer);
    };
  }, []);

  // 路由切换后重新扫描并计算位置，确保新页面的元素能被激活
  useEffect(() => {
    if (typeof window === "undefined") return;
    // 等待新页面 DOM 渲染完成
    const id = window.setTimeout(() => {
      AOS.refreshHard();
    }, 50);
    return () => window.clearTimeout(id);
  }, [pathname]);

  return null;
}
