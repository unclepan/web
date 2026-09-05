export type WorkInfoPropsType = {
  title?: string;
  desc?: string;
};

export const WorkInfoDefaultProps: WorkInfoPropsType = {
  title: "{\"ops\":[{\"attributes\":{\"bold\":true},\"insert\":\"作品标题\"},{\"attributes\":{\"align\":\"center\",\"header\":1},\"insert\":\"\\n\"}]}",
  desc: "{\"ops\":[{\"insert\":\"深度贴合本次内容的核心主题，结合整体内容脉络精心整理撰写的专属作品描述文案\"},{\"attributes\":{\"align\":\"center\",\"header\":3},\"insert\":\"\\n\"}]}"
};
