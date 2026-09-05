import type { Metadata } from "next";
import PoiExplorer from "./PoiExplorer";

export const metadata: Metadata = {
  title: "POI 边界数据浏览",
  description: "浏览与可视化 POI 行政边界数据集（世界国界 / 省市县 / 乡镇街道）",
};

/**
 * POI 边界数据浏览（实验页）
 *
 * 路由组 (experiment) 不参与 URL，所以地址是 /poi。
 * 页面本身只是壳，数据请求与图表渲染全在客户端组件 PoiExplorer 里
 * —— GeoJSON 动辄几 MB，放服务端渲染既拖慢首屏也没必要。
 */
export default function PoiPage() {
  return <PoiExplorer />;
}
