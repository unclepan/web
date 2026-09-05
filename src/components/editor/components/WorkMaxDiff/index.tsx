import WorkMaxDiffComponent from "./Component";
import WorkMaxDiffPropComponent from "./PropComponent";
import { WorkMaxDiffDefaultProps } from "./interface";
import { GitCompareArrows } from "lucide-react";
export * from "./interface";

export default {
  title: "MaxDiff",
  type: "workMaxDiff",
  describe: "MaxDiff最大差异组件",
  Component: WorkMaxDiffComponent,
  PropComponent: WorkMaxDiffPropComponent,
  defaultProps: WorkMaxDiffDefaultProps,
  Icon: () => <GitCompareArrows size={16} />,
} as const;
