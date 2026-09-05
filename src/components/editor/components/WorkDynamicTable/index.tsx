import WorkDynamicTableComponent from "./Component";
import WorkDynamicTablePropComponent from "./PropComponent";
import { WorkDynamicTableDefaultProps } from "./interface";
import { Sheet } from "lucide-react";
export * from "./interface";

export default {
  title: "自增表格",
  type: "workDynamicTable",
  describe: "自增表格组件",
  Component: WorkDynamicTableComponent,
  PropComponent: WorkDynamicTablePropComponent,
  defaultProps: WorkDynamicTableDefaultProps,
  Icon: () => <Sheet size={16} />,
} as const;
