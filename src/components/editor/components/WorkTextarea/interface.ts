export type WorkTextareaPropsType = {
  title?: string;
  placeholder?: string;
  required?: boolean;
  rule?: string;
};
export const WorkTextareaDefaultProps: WorkTextareaPropsType = {
  title: "{\"ops\":[{\"attributes\":{\"bold\":true},\"insert\":\"多行输入\"},{\"attributes\":{\"header\":3},\"insert\":\"\\n\"}]}",
  placeholder: "请输入...",
  required: false,
  rule: "null",
};
