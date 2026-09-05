export type OptionType = { value: string; text: string };
export type WorkSelectPropsType = {
  title?: string;
  options?: OptionType[];
  placeholder?: string;
  required?: boolean;
};
export const WorkSelectDefaultProps: WorkSelectPropsType = {
  title: "{\"ops\":[{\"attributes\":{\"bold\":true},\"insert\":\"下拉选择标题\"},{\"attributes\":{\"header\":3},\"insert\":\"\\n\"}]}",
  options: [
    { value: "item1", text: "选项1" },
    { value: "item2", text: "选项2" },
    { value: "item3", text: "选项3" },
  ],
  placeholder: "请选择",
  required: false,
};
