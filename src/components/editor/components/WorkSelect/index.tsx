import WorkSelectComponent from "./Component";
import WorkSelectPropComponent from "./PropComponent";
import { WorkSelectDefaultProps } from "./interface";
import { ChevronDownSquare } from "lucide-react";
export * from "./interface";

export default {
  title: "下拉选择",
  type: "workSelect",
  describe: "下拉选择组件",
  Component: WorkSelectComponent,
  PropComponent: WorkSelectPropComponent,
  defaultProps: WorkSelectDefaultProps,
  Icon: () => <ChevronDownSquare size={16} />,
} as const;
