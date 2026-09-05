export type OptionType = { value: string; text: string; checked: boolean };
export type WorkCheckboxPropsType = {
  title?: string;
  list?: OptionType[];
  required?: boolean;
  row?: number;
};
export const WorkCheckboxDefaultProps: WorkCheckboxPropsType = {
  title: "{\"ops\":[{\"attributes\":{\"bold\":true},\"insert\":\"多选标题\"},{\"attributes\":{\"header\":3},\"insert\":\"\\n\"}]}",
  list: [
    { value: "item1", text: "选项1", checked: false },
    { value: "item2", text: "选项2", checked: false },
    { value: "item3", text: "选项3", checked: false },
  ],
  required: false,
  row: 24,
};
