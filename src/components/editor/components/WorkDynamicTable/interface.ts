export type TableColumn = { key: string; label: string; type?: "text" | "number" };
export type WorkDynamicTablePropsType = {
  title?: string;
  columns?: TableColumn[];
  minRows?: number;
  required?: boolean;
};
export const WorkDynamicTableDefaultProps: WorkDynamicTablePropsType = {
  title: "{\"ops\":[{\"attributes\":{\"bold\":true},\"insert\":\"自增表格标题\"},{\"attributes\":{\"header\":3},\"insert\":\"\\n\"}]}",
  columns: [
    { key: "col1", label: "姓名", type: "text" },
    { key: "col2", label: "年龄", type: "number" },
  ],
  minRows: 1,
  required: false,
};
