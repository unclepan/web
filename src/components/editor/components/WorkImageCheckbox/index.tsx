import WorkImageCheckboxComponent from "./Component";
import WorkImageCheckboxPropComponent from "./PropComponent";
import { WorkImageCheckboxDefaultProps } from "./interface";
import { Images } from "lucide-react";
export * from "./interface";

export default {
  title: "图片多选",
  type: "workImageCheckbox",
  describe: "图片多选组件",
  Component: WorkImageCheckboxComponent,
  PropComponent: WorkImageCheckboxPropComponent,
  defaultProps: WorkImageCheckboxDefaultProps,
  Icon: () => <Images size={16} />,
} as const;
