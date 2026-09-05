"use client";

import { GripVertical, EyeOff, Lock } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { getComponentConfByType } from "../components";
import type { ComponentInfoType } from "@/components/editor/store/types";

function genComponent(info: ComponentInfoType) {
  const conf = getComponentConfByType(info.type);
  if (!conf) return null;
  return <conf.Component {...(info.props as Record<string, unknown>)} feUuid={info.feUuid} />;
}

type Props = {
  component: ComponentInfoType;
  isSelected: boolean;
  onClick: (id: string) => void;
};

/**
 * dnd-kit 可排序画布项
 *
 * @dnd-kit 核心概念：
 *   SortableContext（父级提供）+ useSortable（子级消费）组成可拖拽排序列表。
 *   - id:      拖拽项的唯一标识，用 feUuid 而非数组索引，避免多页/筛选场景下索引错位
 *   - disabled: true 时该项不可拖拽（locked 的组件设为 true）
 *
 * @useSortable 返回值：
 *   - setNodeRef:     挂载到需要被 dnd-kit 控制的 DOM 节点（外层 wrapper）
 *   - transform:      dnd-kit 计算出的 CSS transform（位移 + 可能的 scale），用于动画
 *   - transition:     拖拽结束后的回落过渡时间
 *   - attributes:     ARIA 属性（role、tabIndex 等），必须绑在拖拽手柄上以支持无障碍
 *   - listeners:      鼠标/触摸/键盘事件监听器，同样绑在手柄上，避免与子组件交互冲突
 *   - isDragging:     当前项是否正在被拖拽
 *
 * @双层结构设计：
 *   外层 div（ref={setNodeRef}）: 承载 dnd-kit 的 transform/zIndex，无视觉样式
 *   内层 div（children）:       所有视觉样式（边框、hover、选中态等），保持原始尺寸
 *   这样 transform 只位移外层，内层不受 scale 影响，不会变形
 */
export default function SortableCanvasItem({ component, isSelected, onClick }: Props) {
  const { isLocked, isHidden, feUuid } = component;
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: feUuid, disabled: isLocked });

  // dnd-kit 会在非拖拽元素上施加 scaleY 来填充拖拽产生的空隙，
  // 这会导致元素纵向缩放变形。用展开运算符创建新对象，强制 scaleY=1
  const style = {
    transform: CSS.Transform.toString(transform ? { ...transform, scaleY: 1 } : null),
    transition,
    // 拖拽中的元素提升 z-index，避免被其他元素遮挡
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    // 外层：仅承载 dnd-kit 的 transform 和 zIndex
    <div ref={setNodeRef} style={style} id={`component-key-${feUuid}`}>
      {/* 内层：所有视觉样式，click 选中而非拖拽事件 */}
      <div
        onClick={(e) => {
          e.stopPropagation();
          onClick(feUuid);
        }}
        className={`py-3 pl-8 pr-12 border-2 transition-colors flex items-center gap-2 group ${
          isSelected ? "border-blue-400" : "border-transparent"
        } ${
          // locked: 降低透明度 + 禁止点击 → 不可交互
          isLocked
            ? "opacity-60 cursor-not-allowed"
            // hidden: 仅降低透明度 → 仍可被选中/操作
            : isHidden
              ? "opacity-50"
              : "cursor-pointer hover:bg-muted"
        } ${
          // 拖拽中的视觉反馈：半透明 + 阴影 + 白底 + 圆角，让用户感知"正在拖"
          isDragging ? "opacity-80 shadow-lg bg-card rounded" : ""
        }`}
      >
        {/* 左侧图标：hidden 显示 EyeOff、locked 显示 Lock、正常显示拖拽手柄 GripVertical */}
        {isHidden ? (
          <EyeOff className="w-4 h-4 text-muted-foreground shrink-0" />
        ) : isLocked ? (
          <Lock className="w-4 h-4 text-muted-foreground shrink-0" />
        ) : (
          // attributes + listeners 只绑在 GripVertical 上 = 只有拖手柄才能触发拖拽
          <GripVertical
            {...attributes}
            {...listeners}
            className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition shrink-0 cursor-grab active:cursor-grabbing"
          />
        )}
        <div
          className={`flex-1 ${isLocked ? "pointer-events-none select-none" : ""}`}
          data-no-drag="true"
        >
          {genComponent(component)}
        </div>
      </div>
    </div>
  );
}
