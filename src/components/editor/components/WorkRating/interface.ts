export type WorkRatingPropsType = {
  title?: string;
  max?: number;
  iconType?: "star" | "heart" | "emoji";
  required?: boolean;
};
export const WorkRatingDefaultProps: WorkRatingPropsType = {
  title: "{\"ops\":[{\"attributes\":{\"bold\":true},\"insert\":\"请为我们的服务打分\"},{\"attributes\":{\"header\":3},\"insert\":\"\\n\"}]}",
  max: 5,
  iconType: "star",
  required: false,
};
