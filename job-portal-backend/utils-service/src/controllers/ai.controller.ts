import type { RequestHandler } from "express";
import  { trycatch } from "../utils/trycatch.util.js";
import ErrorHandler from "../utils/errorhandler.util.js";
import { careerguidance2, resumeanalyser2 } from "../service/ai.service.js";

export const careerguidance:RequestHandler = trycatch(async (req, res,next) => {
    const {skill} = req.body;
    if(!skill){
        throw new ErrorHandler(400,"Skill is required");
    }
   const suggestion = await careerguidance2(skill);
   if(!suggestion){
    throw new ErrorHandler(500,"Failed to get career guidance");
   }
    return res.status(200).json({message:"Career guidance generated successfully",data:suggestion});
})

export const resumeanalyser:RequestHandler = trycatch(async (req, res,next) => {
const {pdfBase64} = req.body;
if(!pdfBase64){
    throw new ErrorHandler(400,"PDF base64 is required");
}
const analysis = await resumeanalyser2(pdfBase64);
if(!analysis){
    throw new ErrorHandler(500,"Failed to analyse resume");
}
console.log(analysis)
return res.status(200).json({message:"Resume analysed successfully",data:analysis});
})
