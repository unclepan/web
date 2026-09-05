import WorkInfoComponent from "./Component";
import WorkInfoPropComponent from "./PropComponent";
import { WorkInfoDefaultProps } from "./interface";
import { Info } from "lucide-react";

export * from "./interface";

export default {
  title: "作品标题",
  type: "workInfo",
  describe: "问卷的主标题和描述",
  Component: WorkInfoComponent,
  PropComponent: WorkInfoPropComponent,
  defaultProps: WorkInfoDefaultProps,
  Icon: () => <Info size={16} />,
} as const;
