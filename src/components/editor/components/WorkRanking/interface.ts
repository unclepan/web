export type OptionType = { value: string; text: string };
export type WorkRankingPropsType = {
  title?: string;
  options?: OptionType[];
  required?: boolean;
};
export const WorkRankingDefaultProps: WorkRankingPropsType = {
  title: "{\"ops\":[{\"attributes\":{\"bold\":true},\"insert\":\"请按重要性对以下选项排序\"},{\"attributes\":{\"header\":3},\"insert\":\"\\n\"}]}",
  options: [
    { value: "item1", text: "选项1" },
    { value: "item2", text: "选项2" },
    { value: "item3", text: "选项3" },
  ],
  required: false,
};
