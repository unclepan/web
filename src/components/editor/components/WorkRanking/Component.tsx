"use client";
import { FC } from "react";
import { X, CirclePlus, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEditor } from "@/components/editor/store/EditorProvider";
import { useLocale } from "@/i18n/useLocale";
import WorkReactQuill from "../WorkReactQuill";
import { WorkRankingPropsType, WorkRankingDefaultProps, OptionType } from "./interface";
import { nanoid } from "nanoid";
import { DndContext, closestCenter, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function SortableItem({
  opt,
  index,
  feUuid,
  onText,
  onRemove,
  canRemove,
}: {
  opt: OptionType;
  index: number;
  feUuid: string;
  onText: (value: string, delta: string) => void;
  onRemove: (value: string) => void;
  canRemove: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: opt.value });
  const style = {
    transform: CSS.Transform.toString(transform ? { ...transform, scaleY: 1 } : null),
    transition,
    zIndex: isDragging ? 50 : undefined,
  };
  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-2">
      <span className="flex size-6 shrink-0 items-center justify-center rounded bg-muted text-xs font-medium">
        {index + 1}
      </span>
      <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing shrink-0 text-muted-foreground hover:text-muted-foreground">
        <GripVertical size={16} />
      </button>
      <div className="flex-1 min-w-0">
        <WorkReactQuill
          value={opt.text}
          editorProp={opt.value}
          feUuid={feUuid}
          onChange={onText}
          showHeader={false}
          showVideo={false}
          showImage={false}
          showLink={false}
          showAlign={false}
        />
      </div>
      {canRemove && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onRemove(opt.value)}
          className="size-6 text-muted-foreground hover:text-red-500 shrink-0"
          data-no-drag="true"
        >
          <X size={14} />
        </Button>
      )}
    </div>
  );
}

const Component: FC<WorkRankingPropsType & { feUuid?: string }> = (props) => {
  const { dispatch } = useEditor();
  const { t } = useLocale();
  const { title = "", options = [], feUuid = "" } = { ...WorkRankingDefaultProps, ...props };

  const updateProps = (newProps: Partial<WorkRankingPropsType>) => {
    if (!feUuid) return;
    dispatch({ type: "PUSH_PAST" });
    dispatch({ type: "CHANGE_COMPONENT_PROPS", payload: { feUuid, newProps } });
  };
  const handleTitle = (editorProp: string, delta: string) => {
    updateProps({ title: delta });
  };
  const handleText = (value: string, delta: string) => {
    updateProps({ options: options.map((o) => (o.value === value ? { ...o, text: delta } : o)) });
  };
  const add = () => updateProps({ options: [...options, { text: t((m) => m.editor.canvasOption), value: nanoid(5) }] });
  const remove = (value: string) => updateProps({ options: options.filter((o) => o.value !== value) });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = options.findIndex((o) => o.value === active.id);
    const newIndex = options.findIndex((o) => o.value === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    updateProps({ options: arrayMove(options, oldIndex, newIndex) });
  };

  return (
    <div>
      <WorkReactQuill value={title} editorProp="title" feUuid={feUuid} onChange={handleTitle} showVideo={false} />
      <div className="mt-2 space-y-2">
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={options.map((o) => o.value)} strategy={verticalListSortingStrategy}>
            {options.map((opt, i) => (
              <SortableItem
                key={opt.value}
                opt={opt}
                index={i}
                feUuid={feUuid}
                onText={handleText}
                onRemove={remove}
                canRemove={options.length > 2}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>
      <div className="mt-2 border-t border-dashed border-border pt-2">
        <Button variant="outline" size="sm" onClick={add}>
          <CirclePlus />{t((m) => m.editor.canvasAddOption)}
        </Button>
      </div>
    </div>
  );
};
export default Component;
