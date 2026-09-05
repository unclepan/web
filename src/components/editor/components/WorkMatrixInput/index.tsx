import WorkMatrixInputComponent from "./Component";
import WorkMatrixInputPropComponent from "./PropComponent";
import { WorkMatrixInputDefaultProps } from "./interface";
import { TableCellsSplit } from "lucide-react";
export * from "./interface";

export default {
  title: "矩阵填空",
  type: "workMatrixInput",
  describe: "矩阵填空组件",
  Component: WorkMatrixInputComponent,
  PropComponent: WorkMatrixInputPropComponent,
  defaultProps: WorkMatrixInputDefaultProps,
  Icon: () => <TableCellsSplit size={16} />,
} as const;
