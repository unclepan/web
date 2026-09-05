import WorkRankingComponent from "./Component";
import WorkRankingPropComponent from "./PropComponent";
import { WorkRankingDefaultProps } from "./interface";
import { ArrowUpDown } from "lucide-react";
export * from "./interface";

export default {
  title: "排序",
  type: "workRanking",
  describe: "排序题组件",
  Component: WorkRankingComponent,
  PropComponent: WorkRankingPropComponent,
  defaultProps: WorkRankingDefaultProps,
  Icon: () => <ArrowUpDown size={16} />,
} as const;
