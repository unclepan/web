export type ImageOptionType = { value: string; text: string; image: string };
export type WorkImageCheckboxPropsType = {
  title?: string;
  options?: ImageOptionType[];
  required?: boolean;
  row?: number;
};
export const WorkImageCheckboxDefaultProps: WorkImageCheckboxPropsType = {
  title: "{\"ops\":[{\"attributes\":{\"bold\":true},\"insert\":\"图片多选标题\"},{\"attributes\":{\"header\":3},\"insert\":\"\\n\"}]}",
  options: [
    { value: "item1", text: "选项1", image: "" },
    { value: "item2", text: "选项2", image: "" },
  ],
  required: false,
  row: 12,
};
