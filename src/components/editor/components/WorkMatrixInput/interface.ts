export type OptionType = { value: string; text: string };
export type WorkMatrixInputPropsType = {
  title?: string;
  rows?: OptionType[];
  columns?: OptionType[];
  required?: boolean;
};
export const WorkMatrixInputDefaultProps: WorkMatrixInputPropsType = {
  title: "{\"ops\":[{\"attributes\":{\"bold\":true},\"insert\":\"矩阵填空标题\"},{\"attributes\":{\"header\":3},\"insert\":\"\\n\"}]}",
  rows: [
    { value: "row1", text: "题目1" },
    { value: "row2", text: "题目2" },
  ],
  columns: [
    { value: "col1", text: "列1" },
    { value: "col2", text: "列2" },
  ],
  required: false,
};
