import type { RequestHandler } from "express";
import  { trycatch } from "../utils/trycatch.util.js";
import { uploadoncloudinary } from "../utils/cloudinary.js";
export const upload:RequestHandler = trycatch(async (req, res,next) => {

 const {fileBuffer,public_id} = req.body;
 console.log(public_id)
 if(!fileBuffer){
    throw new Error("File buffer is required");
 }
    const uploadResult = await uploadoncloudinary(fileBuffer,public_id||null);
return res.status(200).json({message:"File uploaded successfully",data:uploadResult});
})