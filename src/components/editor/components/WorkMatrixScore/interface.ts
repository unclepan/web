export type OptionType = { value: string; text: string };
export type WorkMatrixScorePropsType = {
  title?: string;
  rows?: OptionType[];
  max?: number;
  iconType?: "star" | "number";
  required?: boolean;
};
export const WorkMatrixScoreDefaultProps: WorkMatrixScorePropsType = {
  title: "{\"ops\":[{\"attributes\":{\"bold\":true},\"insert\":\"矩阵打分标题\"},{\"attributes\":{\"header\":3},\"insert\":\"\\n\"}]}",
  rows: [
    { value: "row1", text: "题目1" },
    { value: "row2", text: "题目2" },
  ],
  max: 5,
  iconType: "star",
  required: false,
};
