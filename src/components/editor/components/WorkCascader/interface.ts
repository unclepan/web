export type CascaderLevel = { name: string; options: string[] };
export type WorkCascaderPropsType = {
  title?: string;
  levels?: CascaderLevel[];
  required?: boolean;
};
export const WorkCascaderDefaultProps: WorkCascaderPropsType = {
  title: "{\"ops\":[{\"attributes\":{\"bold\":true},\"insert\":\"请选择所在地区\"},{\"attributes\":{\"header\":3},\"insert\":\"\\n\"}]}",
  levels: [
    { name: "省份", options: ["广东省", "北京市", "上海市"] },
    { name: "城市", options: ["深圳市", "广州市", "珠海市"] },
    { name: "区县", options: ["南山区", "福田区", "罗湖区"] },
  ],
  required: false,
};
