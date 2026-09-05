export type WorkFileUploadPropsType = {
  title?: string;
  maxFiles?: number;
  accept?: string;
  maxSize?: number;
  required?: boolean;
};
export const WorkFileUploadDefaultProps: WorkFileUploadPropsType = {
  title: "{\"ops\":[{\"attributes\":{\"bold\":true},\"insert\":\"请上传文件\"},{\"attributes\":{\"header\":3},\"insert\":\"\\n\"}]}",
  maxFiles: 1,
  accept: "image/*",
  maxSize: 10,
  required: false,
};
