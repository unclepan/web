export type WorkDateTimePropsType = {
  title?: string;
  mode?: "date" | "time" | "datetime";
  required?: boolean;
};
export const WorkDateTimeDefaultProps: WorkDateTimePropsType = {
  title: "{\"ops\":[{\"attributes\":{\"bold\":true},\"insert\":\"日期/时间标题\"},{\"attributes\":{\"header\":3},\"insert\":\"\\n\"}]}",
  mode: "date",
  required: false,
};
