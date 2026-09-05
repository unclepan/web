import WorkCascaderComponent from "./Component";
import WorkCascaderPropComponent from "./PropComponent";
import { WorkCascaderDefaultProps } from "./interface";
import { ListTree } from "lucide-react";
export * from "./interface";

export default {
  title: "多级联动",
  type: "workCascader",
  describe: "多级联动选择组件",
  Component: WorkCascaderComponent,
  PropComponent: WorkCascaderPropComponent,
  defaultProps: WorkCascaderDefaultProps,
  Icon: () => <ListTree size={16} />,
} as const;
