export type WorkEffortPropsType = {
  title?: string;
  levels?: number;
  required?: boolean;
};
export const WorkEffortDefaultProps: WorkEffortPropsType = {
  title: "{\"ops\":[{\"attributes\":{\"bold\":true},\"insert\":\"完成此任务的费力度如何？\"},{\"attributes\":{\"header\":3},\"insert\":\"\\n\"}]}",
  levels: 5,
  required: false,
};
