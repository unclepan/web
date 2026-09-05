export type WorkSignaturePropsType = {
  title?: string;
  width?: number;
  height?: number;
  required?: boolean;
};
export const WorkSignatureDefaultProps: WorkSignaturePropsType = {
  title: "{\"ops\":[{\"attributes\":{\"bold\":true},\"insert\":\"请在此处签名\"},{\"attributes\":{\"header\":3},\"insert\":\"\\n\"}]}",
  width: 400,
  height: 200,
  required: false,
};
