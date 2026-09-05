import WorkParagraphComponent from "./Component";
import WorkParagraphPropComponent from "./PropComponent";
import { WorkParagraphDefaultProps } from "./interface";
import { Pilcrow } from "lucide-react";
export * from "./interface";
export default {
  title: "段落", 
  type: "workParagraph", 
  describe: "段落文本",
  Component: WorkParagraphComponent, 
  PropComponent: WorkParagraphPropComponent,
  defaultProps: WorkParagraphDefaultProps, 
  Icon: () => <Pilcrow size={16} />,
} as const;
