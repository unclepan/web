import WorkScaleComponent from "./Component";
import WorkScalePropComponent from "./PropComponent";
import { WorkScaleDefaultProps } from "./interface";
import { Scaling } from "lucide-react";
export * from "./interface";

export default {
  title: "量表",
  type: "workScale",
  describe: "量表题组件",
  Component: WorkScaleComponent,
  PropComponent: WorkScalePropComponent,
  defaultProps: WorkScaleDefaultProps,
  Icon: () => <Scaling size={16} />,
} as const;
