export type WorkBlanksPropsType = {
  title?: string;
  required?: boolean;
};
export const WorkBlanksDefaultProps: WorkBlanksPropsType = {
  title: "{\"ops\":[{\"attributes\":{\"bold\":true},\"insert\":\"多项填空标题\"},{\"attributes\":{\"header\":3},\"insert\":\"\\n\"},{\"insert\":\"我的名字是\"},{\"insert\":{\"type\":\"blanks\"}},{\"insert\":\"，我在\"},{\"insert\":{\"type\":\"blanks\"}},{\"insert\":\"工作。\\n\"}]}",
  required: false,
};
