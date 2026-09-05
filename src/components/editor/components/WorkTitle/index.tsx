import WorkTitleComponent from "./Component";
import WorkTitlePropComponent from "./PropComponent";
import { WorkTitleDefaultProps } from "./interface";
import { Type } from "lucide-react";
export * from "./interface";

export default {
  title: "副标题", 
  type: "workTitle", 
  describe: "副标题组件",
  Component: WorkTitleComponent, 
  PropComponent: WorkTitlePropComponent,
  defaultProps: WorkTitleDefaultProps, 
  Icon: () => <Type size={16} />,
} as const;
