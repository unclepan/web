export type WorkLocationPropsType = {
  title?: string;
  required?: boolean;
};
export const WorkLocationDefaultProps: WorkLocationPropsType = {
  title: "{\"ops\":[{\"attributes\":{\"bold\":true},\"insert\":\"请获取您的地理位置\"},{\"attributes\":{\"header\":3},\"insert\":\"\\n\"}]}",
  required: false,
};
