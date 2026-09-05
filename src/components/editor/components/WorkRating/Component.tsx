"use client";
import { FC } from "react";
import { Star, Heart } from "lucide-react";
import { useEditor } from "@/components/editor/store/EditorProvider";
import WorkReactQuill from "../WorkReactQuill";
import { WorkRatingPropsType, WorkRatingDefaultProps } from "./interface";

const Component: FC<WorkRatingPropsType & { feUuid?: string }> = (props) => {
  const { dispatch } = useEditor();
  const { title = "", max = 5, iconType = "star", feUuid = "" } = { ...WorkRatingDefaultProps, ...props };

  const updateProps = (newProps: Partial<WorkRatingPropsType>) => {
    if (!feUuid) return;
    dispatch({ type: "PUSH_PAST" });
    dispatch({ type: "CHANGE_COMPONENT_PROPS", payload: { feUuid, newProps } });
  };
  const handleTitle = (editorProp: string, delta: string) => {
    updateProps({ title: delta });
  };

  const renderIcon = (filled: boolean) => {
    if (iconType === "star") {
      return <Star className={`size-7 ${filled ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`} />;
    }
    if (iconType === "heart") {
      return <Heart className={`size-7 ${filled ? "fill-red-400 text-red-400" : "text-muted-foreground"}`} />;
    }
    return <span className="text-2xl">{filled ? "⭐" : "☆"}</span>;
  };

  return (
    <div>
      <WorkReactQuill value={title} editorProp="title" feUuid={feUuid} onChange={handleTitle} showVideo={false} />
      <div className="mt-4 flex justify-start gap-1.5">
        {Array.from({ length: max }, (_, i) => (
          <div key={i} className="cursor-pointer hover:scale-110 transition-transform">
            {renderIcon(false)}
          </div>
        ))}
      </div>
    </div>
  );
};
export default Component;
