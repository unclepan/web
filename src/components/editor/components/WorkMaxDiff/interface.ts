export type OptionType = { value: string; text: string };
export type WorkMaxDiffPropsType = {
  title?: string;
  options?: OptionType[];
  required?: boolean;
};
export const WorkMaxDiffDefaultProps: WorkMaxDiffPropsType = {
  title: "{\"ops\":[{\"attributes\":{\"bold\":true},\"insert\":\"请选择最重要和最不重要的选项\"},{\"attributes\":{\"header\":3},\"insert\":\"\\n\"}]}",
  options: [
    { value: "item1", text: "选项1" },
    { value: "item2", text: "选项2" },
    { value: "item3", text: "选项3" },
  ],
  required: false,
};
