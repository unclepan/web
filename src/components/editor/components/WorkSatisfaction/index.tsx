import WorkSatisfactionComponent from "./Component";
import WorkSatisfactionPropComponent from "./PropComponent";
import { WorkSatisfactionDefaultProps } from "./interface";
import { Smile } from "lucide-react";
export * from "./interface";

export default {
  title: "满意度",
  type: "workSatisfaction",
  describe: "满意度评价组件",
  Component: WorkSatisfactionComponent,
  PropComponent: WorkSatisfactionPropComponent,
  defaultProps: WorkSatisfactionDefaultProps,
  Icon: () => <Smile size={16} />,
} as const;
