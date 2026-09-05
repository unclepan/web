"use client";

/**
 * 图片选择题选项的图片上传区域（编辑端画布内使用）
 * - 无图：显示上传入口，点击选择本地图片
 * - 有图：显示图片，hover 出现"更换图片"遮罩
 * - 上传走 /work/upload-image → COS，成功后回传 CDN URL
 */
import { FC, useRef, useState } from "react";
import { ImagePlus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { workApi } from "@/lib/api/modules/work";
import { useLocale } from "@/i18n/useLocale";

type Props = {
  image?: string;
  onUploaded: (url: string) => void;
};

const ImageOptionUploader: FC<Props> = ({ image, onUploaded }) => {
  const { t } = useLocale();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handlePick = () => {
    if (uploading) return;
    inputRef.current?.click();
  };

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error(t((m) => m.editor.canvasUploadFailed));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t((m) => m.editor.canvasUploadFailed));
      return;
    }
    setUploading(true);
    try {
      const { url } = await workApi.uploadImage(file);
      onUploaded(url);
    } catch {
      toast.error(t((m) => m.editor.canvasUploadFailed));
    } finally {
      setUploading(false);
      // 清空 input，允许重复选择同一文件
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div
      className="relative aspect-square w-full overflow-hidden rounded-t-xl bg-muted cursor-pointer group/uploader"
      onClick={handlePick}
      data-no-drag="true"
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      {image ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 hidden items-center justify-center bg-black/40 group-hover/uploader:flex">
            <span className="text-xs text-white">
              {uploading ? t((m) => m.editor.canvasUploading) : t((m) => m.editor.canvasReplaceImage)}
            </span>
          </div>
        </>
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 text-muted-foreground">
          {uploading ? (
            <>
              <Loader2 className="size-6 animate-spin" />
              <span className="text-xs">{t((m) => m.editor.canvasUploading)}</span>
            </>
          ) : (
            <>
              <ImagePlus className="size-7" />
              <span className="text-xs">{t((m) => m.editor.canvasUploadImage)}</span>
            </>
          )}
        </div>
      )}
      {uploading && image && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
          <Loader2 className="size-6 animate-spin text-white" />
        </div>
      )}
    </div>
  );
};

export default ImageOptionUploader;
