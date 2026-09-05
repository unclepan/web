import { TextCursorInput } from "lucide-react";
import WorkInputComponent from "./Component";
import WorkInputPropComponent from "./PropComponent";
import { WorkInputDefaultProps } from "./interface";
export * from "./interface";

export default {
  title: "单行输入", 
  type: "workInput", 
  describe: "单行输入框",
  Component: WorkInputComponent, 
  PropComponent: WorkInputPropComponent,
  defaultProps: WorkInputDefaultProps, 
  Icon: () => <TextCursorInput size={16} />,
} as const;
