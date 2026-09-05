/**
 * AuthorAvatar —— 在 Avatar 之上加领域语义
 *
 * 接收 docs 接口返回的 `author` 聚合对象（`{ id, username, avatar }`）。
 * 注意这里是**合表后**的形态：后端只 select 了 id / username / avatar，
 * 没有 `name` / `avatarUrl` 字段，也没有单独的作者接口，因此匿名兜底直接
 * 用调用方传入的 `fallbackName`（通常是 i18n 的 "Anonymous"）。
 */
import Avatar, { type AvatarSize } from "./Avatar";
import type { DocsAuthor } from "@/lib/api";

interface AuthorAvatarProps {
  author: DocsAuthor | null;
  /** 作者缺失或用户名为空时的兜底文本 */
  fallbackName: string;
  size?: AvatarSize;
  className?: string;
}

export default function AuthorAvatar({
  author,
  fallbackName,
  size = "sm",
  className,
}: AuthorAvatarProps) {
  return (
    <Avatar
      src={author?.avatar}
      name={author?.username?.trim() || fallbackName}
      size={size}
      className={className}
    />
  );
}
