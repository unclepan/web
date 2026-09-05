import WorkMatrixScaleComponent from "./Component";
import WorkMatrixScalePropComponent from "./PropComponent";
import { WorkMatrixScaleDefaultProps } from "./interface";
import { Grid3x3 } from "lucide-react";
export * from "./interface";

export default {
  title: "矩阵量表",
  type: "workMatrixScale",
  describe: "矩阵量表组件",
  Component: WorkMatrixScaleComponent,
  PropComponent: WorkMatrixScalePropComponent,
  defaultProps: WorkMatrixScaleDefaultProps,
  Icon: () => <Grid3x3 size={16} />,
} as const;
