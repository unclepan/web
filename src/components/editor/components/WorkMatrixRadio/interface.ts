export type OptionType = { value: string; text: string };
export type WorkMatrixRadioPropsType = {
  title?: string;
  rows?: OptionType[];
  columns?: OptionType[];
  required?: boolean;
};
export const WorkMatrixRadioDefaultProps: WorkMatrixRadioPropsType = {
  title: "{\"ops\":[{\"attributes\":{\"bold\":true},\"insert\":\"矩阵单选标题\"},{\"attributes\":{\"header\":3},\"insert\":\"\\n\"}]}",
  rows: [
    { value: "row1", text: "题目1" },
    { value: "row2", text: "题目2" },
  ],
  columns: [
    { value: "col1", text: "选项A" },
    { value: "col2", text: "选项B" },
    { value: "col3", text: "选项C" },
  ],
  required: false,
};
