export type WorkSatisfactionPropsType = {
  title?: string;
  levels?: number;
  style?: "emoji" | "text";
  required?: boolean;
};
export const WorkSatisfactionDefaultProps: WorkSatisfactionPropsType = {
  title: "{\"ops\":[{\"attributes\":{\"bold\":true},\"insert\":\"您对本次服务的满意度如何？\"},{\"attributes\":{\"header\":3},\"insert\":\"\\n\"}]}",
  levels: 5,
  style: "emoji",
  required: false,
};
