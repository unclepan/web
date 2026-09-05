export type OptionType = { value: string; text: string };
export type WorkRadioPropsType = {
  title?: string;
  options?: OptionType[];
  required?: boolean;
  row?: number;
};
export const WorkRadioDefaultProps: WorkRadioPropsType = {
  title: "{\"ops\":[{\"attributes\":{\"bold\":true},\"insert\":\"单选标题\"},{\"attributes\":{\"header\":3},\"insert\":\"\\n\"}]}",
  options: [
    { value: "item1", text: "选项1" },
    { value: "item2", text: "选项2" },
    { value: "item3", text: "选项3" },
  ],
  required: false,
  row: 24,
};
