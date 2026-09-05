export type OptionType = { value: string; text: string };
export type WorkMatrixScalePropsType = {
  title?: string;
  rows?: OptionType[];
  min?: number;
  max?: number;
  minLabel?: string;
  maxLabel?: string;
  required?: boolean;
};
export const WorkMatrixScaleDefaultProps: WorkMatrixScalePropsType = {
  title: "{\"ops\":[{\"attributes\":{\"bold\":true},\"insert\":\"矩阵量表标题\"},{\"attributes\":{\"header\":3},\"insert\":\"\\n\"}]}",
  rows: [
    { value: "row1", text: "题目1" },
    { value: "row2", text: "题目2" },
  ],
  min: 1,
  max: 5,
  minLabel: "不满意",
  maxLabel: "满意",
  required: false,
};
