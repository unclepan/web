import WorkSignatureComponent from "./Component";
import WorkSignaturePropComponent from "./PropComponent";
import { WorkSignatureDefaultProps } from "./interface";
import { PenTool } from "lucide-react";
export * from "./interface";

export default {
  title: "手写签名",
  type: "workSignature",
  describe: "手写签名组件",
  Component: WorkSignatureComponent,
  PropComponent: WorkSignaturePropComponent,
  defaultProps: WorkSignatureDefaultProps,
  Icon: () => <PenTool size={16} />,
} as const;
