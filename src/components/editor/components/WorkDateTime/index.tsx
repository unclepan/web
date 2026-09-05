import WorkDateTimeComponent from "./Component";
import WorkDateTimePropComponent from "./PropComponent";
import { WorkDateTimeDefaultProps } from "./interface";
import { Calendar } from "lucide-react";
export * from "./interface";

export default {
  title: "日期/时间",
  type: "workDateTime",
  describe: "日期时间选择组件",
  Component: WorkDateTimeComponent,
  PropComponent: WorkDateTimePropComponent,
  defaultProps: WorkDateTimeDefaultProps,
  Icon: () => <Calendar size={16} />,
} as const;
