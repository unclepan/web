import WorkFileUploadComponent from "./Component";
import WorkFileUploadPropComponent from "./PropComponent";
import { WorkFileUploadDefaultProps } from "./interface";
import { Upload } from "lucide-react";
export * from "./interface";

export default {
  title: "图片/文件",
  type: "workFileUpload",
  describe: "图片文件上传组件",
  Component: WorkFileUploadComponent,
  PropComponent: WorkFileUploadPropComponent,
  defaultProps: WorkFileUploadDefaultProps,
  Icon: () => <Upload size={16} />,
} as const;
