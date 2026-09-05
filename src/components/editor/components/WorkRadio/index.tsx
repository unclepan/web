import WorkRadioComponent from "./Component";
import WorkRadioPropComponent from "./PropComponent";
import { WorkRadioDefaultProps } from "./interface";
import { CircleDot } from "lucide-react";
export * from "./interface";

export default {
  title: "单选", 
  type: "workRadio", 
  describe: "单选组件",
  Component: WorkRadioComponent, 
  PropComponent: WorkRadioPropComponent,
  defaultProps: WorkRadioDefaultProps, 
  Icon: () => <CircleDot size={16} />,
} as const;
