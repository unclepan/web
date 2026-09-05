"use client";
import { FC } from "react";
import { useEditor } from "@/components/editor/store/EditorProvider";
import { useLocale } from "@/i18n/useLocale";
import WorkReactQuill from "../WorkReactQuill";
import { WorkSatisfactionPropsType, WorkSatisfactionDefaultProps } from "./interface";

const emojiSets: Record<number, string[]> = {
  3: ["😞", "😐", "😄"],
  5: ["😞", "😕", "😐", "🙂", "😄"],
  7: ["😞", "😕", "🙁", "😐", "🙂", "😊", "😄"],
};

const Component: FC<WorkSatisfactionPropsType & { feUuid?: string }> = (props) => {
  const { dispatch } = useEditor();
  const { t } = useLocale();
  const { title = "", levels = 5, style = "emoji", feUuid = "" } = { ...WorkSatisfactionDefaultProps, ...props };

  const updateProps = (newProps: Partial<WorkSatisfactionPropsType>) => {
    if (!feUuid) return;
    dispatch({ type: "PUSH_PAST" });
    dispatch({ type: "CHANGE_COMPONENT_PROPS", payload: { feUuid, newProps } });
  };
  const handleTitle = (editorProp: string, delta: string) => {
    updateProps({ title: delta });
  };

  const textSets: Record<number, string[]> = {
    3: [t((m) => m.editor.satDissatisfied), t((m) => m.editor.satNeutral), t((m) => m.editor.satSatisfied)],
    5: [t((m) => m.editor.satVeryDissatisfied), t((m) => m.editor.satDissatisfied), t((m) => m.editor.satNeutral), t((m) => m.editor.satSatisfied), t((m) => m.editor.satVerySatisfied)],
    7: [t((m) => m.editor.satVeryDissatisfied), t((m) => m.editor.satDissatisfied), t((m) => m.editor.satSomewhatDissatisfied), t((m) => m.editor.satNeutral), t((m) => m.editor.satSomewhatSatisfied), t((m) => m.editor.satSatisfied), t((m) => m.editor.satVerySatisfied)],
  };

  const items = style === "emoji" ? (emojiSets[levels] || emojiSets[5]) : (textSets[levels] || textSets[5]);

  return (
    <div>
      <WorkReactQuill value={title} editorProp="title" feUuid={feUuid} onChange={handleTitle} showVideo={false} />
      <div className="mt-4 flex justify-center gap-3">
        {items.map((item, i) => (
          <div
            key={i}
            className="flex flex-col items-center gap-1 cursor-pointer"
          >
            <div className={`flex size-12 items-center justify-center rounded-lg border border-input bg-background hover:border-primary hover:bg-primary/5 ${style === "emoji" ? "text-2xl" : "text-xs font-medium px-3"}`}>
              {item}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default Component;
