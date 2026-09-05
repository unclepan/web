import WorkLocationComponent from "./Component";
import WorkLocationPropComponent from "./PropComponent";
import { WorkLocationDefaultProps } from "./interface";
import { MapPin } from "lucide-react";
export * from "./interface";

export default {
  title: "地理位置",
  type: "workLocation",
  describe: "地理位置获取组件",
  Component: WorkLocationComponent,
  PropComponent: WorkLocationPropComponent,
  defaultProps: WorkLocationDefaultProps,
  Icon: () => <MapPin size={16} />,
} as const;
