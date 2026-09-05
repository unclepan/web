import WorkTextareaComponent from "./Component";
import WorkTextareaPropComponent from "./PropComponent";
import { WorkTextareaDefaultProps } from "./interface";
import { AlignLeft } from "lucide-react";
export * from "./interface";
export default {
  title: "多行输入", 
  type: "workTextarea", 
  describe: "多行输入框",
  Component: WorkTextareaComponent,
  PropComponent: WorkTextareaPropComponent,
  defaultProps: WorkTextareaDefaultProps, 
  Icon: () => <AlignLeft size={16} />,
} as const;
