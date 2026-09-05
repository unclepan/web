import type { ComponentInfoType } from "./types";

/**
 * 编辑器容量限制常量
 * 注意：后端 survey/libs/common/src/work-limits.ts 中有同名常量，修改时需两边同步
 */

/** 每页最多题目/组件数（不区分组件类型，标题、段落等也计入） */
export const MAX_COMPONENTS_PER_PAGE = 30;

/** 问卷最大页数 */
export const MAX_PAGES = 30;

/**
 * 校验新增一个组件后是否超出每页上限
 * @returns true 表示超出限制（不能新增）
 */
export function isPageFull(
  componentList: ComponentInfoType[],
  page: number,
  addCount = 1,
): boolean {
  return (
    componentList.filter((c) => c.page === page).length + addCount >
    MAX_COMPONENTS_PER_PAGE
  );
}
