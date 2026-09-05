export type WorkScalePropsType = {
  title?: string;
  min?: number;
  max?: number;
  minLabel?: string;
  maxLabel?: string;
  required?: boolean;
};
export const WorkScaleDefaultProps: WorkScalePropsType = {
  title: "{\"ops\":[{\"attributes\":{\"bold\":true},\"insert\":\"量表题标题\"},{\"attributes\":{\"header\":3},\"insert\":\"\\n\"}]}",
  min: 1,
  max: 5,
  minLabel: "不满意",
  maxLabel: "满意",
  required: false,
};
