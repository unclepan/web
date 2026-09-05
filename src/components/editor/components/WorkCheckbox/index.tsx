import WorkCheckboxComponent from "./Component";
import WorkCheckboxPropComponent from "./PropComponent";
import { WorkCheckboxDefaultProps } from "./interface";
import { CheckSquare } from "lucide-react";
export * from "./interface";

export default {
  title: "多选",
  type: "workCheckbox",
  describe: "多选组件",
  Component: WorkCheckboxComponent,
  PropComponent: WorkCheckboxPropComponent,
  defaultProps: WorkCheckboxDefaultProps,
  Icon: () => <CheckSquare size={16} />,
} as const;
