"use client";

import { type FC, useEffect } from "react";
import { ClipboardList, CheckCircle } from "lucide-react";
import { useLocale } from "@/i18n/useLocale";
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  Empty,
  EmptyMedia,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { useGetComponentInfo, useEditor } from "@/components/editor/store/EditorProvider";
import { useBindCanvasKeyPress } from "@/components/editor/hooks/useBindCanvasKeyPress";
import SortableCanvasItem from "./SortableCanvasItem";

type Props = { loading: boolean };

const EditCanvas: FC<Props> = ({ loading }) => {
  const { t } = useLocale();
  const { componentList, selectedId, currentPage } = useGetComponentInfo();
  const { dispatch } = useEditor();

  useBindCanvasKeyPress();

  useEffect(() => {
    const el = document.getElementById(`component-key-${selectedId}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [currentPage, selectedId]);

  function handleClick(id: string) {
    dispatch({ type: "CHANGE_SELECTED_ID", payload: id });
    dispatch({ type: "CHANGE_EDITOR_SELECTED_ID", payload: "" });
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = componentList.findIndex((c) => c.feUuid === active.id);
    const newIndex = componentList.findIndex((c) => c.feUuid === over.id);
    dispatch({ type: "PUSH_PAST" });
    dispatch({ type: "MOVE_COMPONENT", payload: { oldIndex, newIndex } });
  }

  if (loading) return <div className="text-center py-6 text-muted-foreground">{t((m) => m.editor.loading)}</div>;

  if (currentPage === -1) {
    return (
      <div className="bg-card py-16 rounded min-h-full h-full overflow-y-auto overflow-x-hidden scrollbar-thin flex items-center justify-center">
        <Empty>
          <EmptyMedia variant="icon">
            <CheckCircle className="text-green-500" />
          </EmptyMedia>
          <EmptyHeader>
            <EmptyTitle>{t((m) => m.editor.surveyEnd)}</EmptyTitle>
            <EmptyDescription>{t((m) => m.editor.thankYou)}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    );
  }

  const pageList = componentList.filter((c) => c.page === currentPage);

  if (pageList.length === 0) {
    return (
      <div className="bg-card py-16 rounded min-h-full h-full overflow-y-auto overflow-x-hidden scrollbar-thin flex items-center justify-center">
        <Empty>
          <EmptyMedia variant="icon">
            <ClipboardList />
          </EmptyMedia>
          <EmptyHeader>
            <EmptyTitle>{t((m) => m.editor.noComponents)}</EmptyTitle>
            <EmptyDescription>{t((m) => m.editor.addComponentHint)}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    );
  }

  const pageIds = pageList.map((c) => c.feUuid);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={pageIds} strategy={verticalListSortingStrategy}>
        <div className="bg-card py-16 rounded min-h-full h-full overflow-y-auto overflow-x-hidden scrollbar-thin">
          {pageList.map((c) => (
            <SortableCanvasItem
              key={c.feUuid}
              component={c}
              isSelected={c.feUuid === selectedId}
              onClick={handleClick}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};

export default EditCanvas;
