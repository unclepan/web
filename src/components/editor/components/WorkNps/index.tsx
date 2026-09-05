import WorkNpsComponent from "./Component";
import WorkNpsPropComponent from "./PropComponent";
import { WorkNpsDefaultProps } from "./interface";
import { TrendingUp } from "lucide-react";
export * from "./interface";

export default {
  title: "NPS",
  type: "workNps",
  describe: "NPS净推荐值组件",
  Component: WorkNpsComponent,
  PropComponent: WorkNpsPropComponent,
  defaultProps: WorkNpsDefaultProps,
  Icon: () => <TrendingUp size={16} />,
} as const;
