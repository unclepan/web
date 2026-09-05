import WorkEffortComponent from "./Component";
import WorkEffortPropComponent from "./PropComponent";
import { WorkEffortDefaultProps } from "./interface";
import { Gauge } from "lucide-react";
export * from "./interface";

export default {
  title: "费力度",
  type: "workEffort",
  describe: "费力度评价组件",
  Component: WorkEffortComponent,
  PropComponent: WorkEffortPropComponent,
  defaultProps: WorkEffortDefaultProps,
  Icon: () => <Gauge size={16} />,
} as const;
