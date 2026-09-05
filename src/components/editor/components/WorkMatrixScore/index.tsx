import WorkMatrixScoreComponent from "./Component";
import WorkMatrixScorePropComponent from "./PropComponent";
import { WorkMatrixScoreDefaultProps } from "./interface";
import { TableProperties } from "lucide-react";
export * from "./interface";

export default {
  title: "矩阵打分",
  type: "workMatrixScore",
  describe: "矩阵打分组件",
  Component: WorkMatrixScoreComponent,
  PropComponent: WorkMatrixScorePropComponent,
  defaultProps: WorkMatrixScoreDefaultProps,
  Icon: () => <TableProperties size={16} />,
} as const;
