import WorkImageRadioComponent from "./Component";
import WorkImageRadioPropComponent from "./PropComponent";
import { WorkImageRadioDefaultProps } from "./interface";
import { Image as ImageIcon } from "lucide-react";
export * from "./interface";

export default {
  title: "图片单选",
  type: "workImageRadio",
  describe: "图片单选组件",
  Component: WorkImageRadioComponent,
  PropComponent: WorkImageRadioPropComponent,
  defaultProps: WorkImageRadioDefaultProps,
  Icon: () => <ImageIcon size={16} />,
} as const;
