import WorkRatingComponent from "./Component";
import WorkRatingPropComponent from "./PropComponent";
import { WorkRatingDefaultProps } from "./interface";
import { Star } from "lucide-react";
export * from "./interface";

export default {
  title: "评价/打分",
  type: "workRating",
  describe: "评价打分组件",
  Component: WorkRatingComponent,
  PropComponent: WorkRatingPropComponent,
  defaultProps: WorkRatingDefaultProps,
  Icon: () => <Star size={16} />,
} as const;
