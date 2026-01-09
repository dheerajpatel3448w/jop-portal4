import DataUriParser from "datauri/parser.js";
import path from "path";


export const getbuffer = (file:any) => {
    const parser = new DataUriParser();
    const ext = path.extname(file.originalname).toString();
  return parser.format(ext, file.buffer);
}
