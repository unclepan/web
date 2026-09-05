import { cn } from "@/lib/utils"

/**
 * 骨架占位块。
 *
 * 与其余 shadcn 组件保持同一约定：透传原生 props + `cn()` 合并 className。
 * `animate-pulse` 由这里统一提供，调用方只需给尺寸（如 `h-4 w-3/4`）。
 */
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden="true"
      className={cn("animate-pulse rounded bg-muted", className)}
      {...props}
    />
  )
}

export { Skeleton }
