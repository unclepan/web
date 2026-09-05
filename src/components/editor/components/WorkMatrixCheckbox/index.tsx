import WorkMatrixCheckboxComponent from "./Component";
import WorkMatrixCheckboxPropComponent from "./PropComponent";
import { WorkMatrixCheckboxDefaultProps } from "./interface";
import { TableCellsMerge } from "lucide-react";
export * from "./interface";

export default {
  title: "矩阵多选",
  type: "workMatrixCheckbox",
  describe: "矩阵多选组件",
  Component: WorkMatrixCheckboxComponent,
  PropComponent: WorkMatrixCheckboxPropComponent,
  defaultProps: WorkMatrixCheckboxDefaultProps,
  Icon: () => <TableCellsMerge size={16} />,
} as const;
