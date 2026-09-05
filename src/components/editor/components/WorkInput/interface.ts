export type WorkInputPropsType = {
  title?: string;
  placeholder?: string;
  required?: boolean;
  rule?: string;
};
export const WorkInputDefaultProps: WorkInputPropsType = {
  title: "{\"ops\":[{\"attributes\":{\"bold\":true},\"insert\":\"单行输入\"},{\"attributes\":{\"header\":3},\"insert\":\"\\n\"}]}", 
  placeholder: "请输入...", 
  required: false, 
  rule: "null",
};
