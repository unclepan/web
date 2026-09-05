import WorkBlanksComponent from "./Component";
import WorkBlanksPropComponent from "./PropComponent";
import { WorkBlanksDefaultProps } from "./interface";
import { TextCursorInput } from "lucide-react";
export * from "./interface";

export default {
  title: "多项填空",
  type: "workBlanks",
  describe: "多项填空组件",
  Component: WorkBlanksComponent,
  PropComponent: WorkBlanksPropComponent,
  defaultProps: WorkBlanksDefaultProps,
  Icon: () => <TextCursorInput size={16} />,
} as const;
