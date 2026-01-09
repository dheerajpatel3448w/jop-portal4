import {v2 as cloudinary} from "cloudinary";
import fs from "fs";
import streamifier from "streamifier";
import dotenv from "dotenv";
dotenv.config();

cloudinary.config({ 
    cloud_name: `${process.env.N}`, 
    api_key: `${process.env.K}`, 
    api_secret: `${process.env.S}` // Click 'View API Keys' above to copy your API secret
});



export const uploadoncloudinary = async (fileBuffer:any,public_id:any) => {
  try {
    if (!fileBuffer) throw "No file buffer provided";
if(public_id)
  await cloudinary.uploader.destroy(public_id);
console.log("processing...")
const cloud = await cloudinary.uploader.upload(fileBuffer);
console.log(cloud);
    return {url: cloud.secure_url, public_id: cloud.public_id};

  } catch (error) {
    console.log(error);
    return null;
  }
};

 
