/**
 * 文档侧边栏导航图标（直拷 docs 工程的 `icons/NavIcons.tsx`）
 *
 * 组头用的是 24×24 的立方体 SVG（四层叠色形成线框效果），
 * 按服务端 `sidebar.service.ts` 的 `ICON_MAP` 输出（doc/design/guide）映射到
 * 蓝 / 紫 / 天蓝三色；`ChevronIcon` 是子分类的展开/折叠小箭头。
 *
 * 单一用途：只在 `/docs/[uuid]` 的侧边栏里用，colocated 到详情页组件目录。
 */
import type { ReactElement } from "react";

interface IconProps {
  className?: string;
}

/** 蓝色图标 */
export function BlueIcon({ className = "" }: IconProps) {
  return (
    <svg
      className={`mr-3 shrink-0 ${className}`}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        className="fill-blue-400"
        d="M19.888 7.804a.88.88 0 0 0-.314-.328l-7.11-4.346a.889.889 0 0 0-.927 0L4.426 7.476a.88.88 0 0 0-.314.328L12 12.624l7.888-4.82Z"
      />
      <path
        className="fill-white dark:fill-slate-800"
        d="M4.112 7.804a.889.889 0 0 0-.112.43v7.892c0 .31.161.597.426.758l7.11 4.346c.14.085.3.13.464.13v-8.736l-7.888-4.82Z"
      />
      <path
        className="fill-blue-600"
        d="M19.888 7.804c.073.132.112.28.112.43v7.892c0 .31.161.597.426.758l-7.11 4.346c.14.085.3.13.464.13v-8.736l7.888-4.82Z"
      />
    </svg>
  );
}

/** 紫色图标 */
export function PurpleIcon({ className = "" }: IconProps) {
  return (
    <svg
      className={`mr-3 shrink-0 ${className}`}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        className="fill-purple-400"
        d="M19.888 7.804a.88.88 0 0 0-.314-.328l-7.11-4.346a.889.889 0 0 0-.927 0L4.426 7.476a.88.88 0 0 0-.314.328L12 12.624l7.888-4.82Z"
      />
      <path
        className="fill-white dark:fill-slate-800"
        d="M4.112 7.804a.889.889 0 0 0-.112.43v7.892c0 .31.161.597.426.758l7.11 4.346c.14.085.3.13.464.13v-8.736l-7.888-4.82Z"
      />
      <path
        className="fill-purple-600"
        d="M19.888 7.804c.073.132.112.28.112.43v7.892c0 .31.161.597.426.758l7.11 4.346c.14.085.3.13.464.13v-8.736l7.888-4.82Z"
      />
    </svg>
  );
}

/** 天蓝色图标 */
export function SkyIcon({ className = "" }: IconProps) {
  return (
    <svg
      className={`mr-3 shrink-0 ${className}`}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        className="fill-sky-400"
        d="M19.888 7.804a.88.88 0 0 0-.314-.328l-7.11-4.346a.889.889 0 0 0-.927 0L4.426 7.476a.88.88 0 0 0-.314.328L12 12.624l7.888-4.82Z"
      />
      <path
        className="fill-white dark:fill-slate-800"
        d="M4.112 7.804a.889.889 0 0 0-.112.43v7.892c0 .31.161.597.426.758l7.11 4.346c.14.085.3.13.464.13v-8.736l-7.888-4.82Z"
      />
      <path
        className="fill-sky-600"
        d="M19.888 7.804c.073.132.112.28.112.43v7.892c0 .31.161.597.426.758l-7.11 4.346c.14.085.3.13.464.13v-8.736l7.888-4.82Z"
      />
    </svg>
  );
}

/** 灰色图标（默认占位） */
export function SlateIcon({ className = "" }: IconProps) {
  return (
    <svg
      className={`mr-3 shrink-0 ${className}`}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        className="fill-slate-400"
        d="M19.888 7.804a.88.88 0 0 0-.314-.328l-7.11-4.346a.889.889 0 0 0-.927 0L4.426 7.476a.88.88 0 0 0-.314.328L12 12.624l7.888-4.82Z"
      />
      <path
        className="fill-white dark:fill-slate-800"
        d="M4.112 7.804a.889.889 0 0 0-.112.43v7.892c0 .31.161.597.426.758l7.11 4.346c.14.085.3.13.464.13v-8.736l-7.888-4.82Z"
      />
      <path
        className="fill-slate-600"
        d="M19.888 7.804c.073.132.112.28.112.43v7.892c0 .31.161.597.426.758l-7.11 4.346c.14.085.3.13.464.13v-8.736l7.888-4.82Z"
      />
    </svg>
  );
}

/** 子菜单展开/折叠箭头图标 */
export function ChevronIcon({ expanded = false }: { expanded?: boolean }) {
  return (
    <svg
      className={`fill-slate-400 shrink-0 ml-2 transition-transform ${
        expanded ? "rotate-90" : ""
      }`}
      width="8"
      height="10"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M1 2 2.414.586 6.828 5 2.414 9.414 1 8l3-3z" />
    </svg>
  );
}

/** 服务端 `icon` 标识 → 组件映射 */
const ICON_COMPONENTS: Record<string, (props: IconProps) => ReactElement> = {
  doc: BlueIcon,
  design: PurpleIcon,
  guide: SkyIcon,
};

/**
 * 渲染组头图标。
 *
 * 服务端 `ICON_MAP` 只对 文档/设计/指南/教程 这几类名出值，业务分类名（如
 * "3D可视化开发"）取不到、返回 undefined —— 线上这种分类显示的是蓝色图标，
 * 所以这里用 `BlueIcon` 作默认，而不是 docs 前端 `renderNavIcon` 的灰色占位。
 */
export function renderNavIcon(iconId: string | undefined): ReactElement {
  const Icon = (iconId && ICON_COMPONENTS[iconId]) || BlueIcon;
  return <Icon />;
}
