import WorkMatrixRadioComponent from "./Component";
import WorkMatrixRadioPropComponent from "./PropComponent";
import { WorkMatrixRadioDefaultProps } from "./interface";
import { Table } from "lucide-react";
export * from "./interface";

export default {
  title: "矩阵单选",
  type: "workMatrixRadio",
  describe: "矩阵单选组件",
  Component: WorkMatrixRadioComponent,
  PropComponent: WorkMatrixRadioPropComponent,
  defaultProps: WorkMatrixRadioDefaultProps,
  Icon: () => <Table size={16} />,
} as const;
