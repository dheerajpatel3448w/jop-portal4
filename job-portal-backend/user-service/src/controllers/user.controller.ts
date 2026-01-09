import type { RequestHandler } from "express";
import { trycatch } from "../utils/trycatch.util.js";
import { type authenticatedrequest, type user } from "../middlewares/auth.middleware.js";
import { db } from "../configs/db.js";
import { allowedNodeEnvironmentFlags } from "process";
import ErrorHandler from "../utils/errorhandler.util.js";
import { getbuffer } from "../utils/buffer.util.js";
import axios from "axios";
import { error } from "console";


export const myprofile:RequestHandler = trycatch(async(req:authenticatedrequest,res,next)=>{
const user = req.user;
res.status(200).json({
    user,
    message:"user profile fetched successfully"
    
})
})

export const getprofile:RequestHandler = trycatch(async(req:authenticatedrequest,res,next)=>{
    const {userId}=req.params;
     const user = await db`select u.user_id,u.name,u.email,u.phone_number,u.role,u.bio,u.resume,u.resume_public_id,u.profile_pic,u.profile_pic_public_id,u.subscription ,Array_AGG(s.name) filter (where s.name is not null) as skills from users u left join user_skills us on u.user_id = us.user_id left join skills s on us.skill_id=s.skill_id where u.user_id=${userId} group by u.user_id;`
       
      if(user.length===0){
        res.status(400).json({message:"invalid token"});
    return  
    }
    const users = user[0] as user;
    users.skills=users.skills||[];
    res.status(200).json({
        user,
        message:"user fetch successfully"
    })
})

export const updateuserprofile:RequestHandler = trycatch(async(req:authenticatedrequest,res,next)=>{
const {name,phoneNumber,bio}=req.body;
const user = req.user;
if(!user){
    throw new ErrorHandler(400,"authenticate error")
}
const newname = name||user.name;
const newphoneNumber=phoneNumber||user.phone_number;
const newbio=bio||user.bio;
const[users]=await db`update users set name=${newname},phone_number=${newphoneNumber},bio=${newbio} where user_id=${user.user_id} returning *`;

res.status(200).json({
    users,
    message:"update user successfully"
})



})

export const updateprofilepic:RequestHandler = trycatch(async(req:authenticatedrequest,res,next)=>{

const user = req.user;
if(!user){
    throw new ErrorHandler(400,"authenticate error")
}  
const file = req.file;
if(!file){
 new ErrorHandler(400,"not file provided");
}

const fileBuffer = getbuffer(file);
console.log("file")
if(!fileBuffer||!fileBuffer.content){
    throw new ErrorHandler(400,"failed to generate buffer");
}
const result = await axios.post(`${process.env.UTILS_SERVICE_URL}/utils/upload`,{
    fileBuffer:fileBuffer.content, 
    public_id:user.profile_pic_public_id  
})

console.log(result.data);
const [users]=await db`update users set profile_pic=${result.data.data.url},profile_pic_public_id=${result.data.data.public_id} where user_id = ${user.user_id} returning * ;` 
res.status(200).json({
    users,
    message:"update image successfully"
})
})

export const updateresume:RequestHandler = trycatch(async(req:authenticatedrequest,res,next)=>{

const user = req.user;
if(!user){
    throw new ErrorHandler(400,"authenticate error")
}  
const file = req.file;
if(!file){
 new ErrorHandler(400,"not file provided");
}

const fileBuffer = getbuffer(file);
if(!fileBuffer||!fileBuffer.content){
    throw new ErrorHandler(400,"failed to generate buffer");
}
const result = await axios.post(`${process.env.UTILS_SERVICE_URL}/utils/upload`,{
    fileBuffer:fileBuffer.content, 
    public_id:user.resume_public_id  
})
console.log(result.data);
const [users]=await db`update users set resume=${result.data.data.url},resume_public_id=${result.data.data.public_id} where user_id = ${user.user_id} returning * ;` 
res.status(200).json({
    users,
    message:"update resume successfully"
})
})


export const addskills:RequestHandler = trycatch(async(req:authenticatedrequest,res,next)=>{
const userId = req.user?.user_id;
const {skillname} = req.body as {skillname:string};
if(!skillname||skillname.trim()==""){
    throw new ErrorHandler(400,"please provide a skill name");
}
let wasskilladded=false;
try {
const [skill] = await db`insert into skills (name) values (${skillname.trim()}) on conflict (name) do update set name = excluded.name returning skill_id ;` 
if(skill==undefined){
    throw error;
}
const skillid = skill.skill_id;
const insertresult = await db`insert into user_skills (user_id,skill_id) values(${userId},${skillid}) on conflict (user_id,skill_id) do nothing returning user_id ;`
if(insertresult.length>0){
wasskilladded=true;
}    
await db`commit`
} catch (error) {
    await db`rollback`
    throw error;
}
if(!wasskilladded){
    res.status(200).json({message:"user already added this skill"})
}

res.status(200).json({
    skillname,
    message:"skill are addedd successfully"
})
})

export const skilldelete:RequestHandler = trycatch(async(req:authenticatedrequest,res,next)=>{
    const user=req.user;
    if(!user){
        throw new ErrorHandler(400,"authentication is required")
    }
    const {skillname}=req.body;
    if(!skillname||skillname.trim()==""){
    throw new ErrorHandler(400,"please provide a skill name");
     }
     const result = await db`delete from user_skills where user_id=${user.user_id} and skill_id=(select skill_id from skills where name=${skillname.trim()}) returning user_id`
     if(result.length==0){
       throw new ErrorHandler(404,"skill not found")
     }
     res.status(200).json({
        message:"skill deleted successfully"
     })

})


export const applyforjob:RequestHandler = trycatch(async(req:authenticatedrequest,res,next)=>{
    const user = req.user;
    if(!user){
        throw new ErrorHandler(400,"authentication is required")
    
    }
    if(user.role!=="job_seeker"){
        throw new ErrorHandler(400,"you are not a job seeker")
    }
    const applicant_id=user.user_id;
    const resume = user.resume;
    if(!resume){
        throw new ErrorHandler(400,"please upload your resume")

    }
    const {jobId}=req.body;
  if(!jobId){
    throw new ErrorHandler(400,"please provide a job id")

  }
  const[job]= await db`select is_active from jobs where job_id=${jobId}`
  if(!job){
    throw new ErrorHandler(404,"job not found")
  }
  if(!job.is_active){
    throw new ErrorHandler(400,"job is not active")
  }
  const now = Date.now();
  const subtime = req.user?.subscription ? new Date(req.user.subscription).getTime() : 0;
  const issubscribed=subtime>now;

  let newApplication;
  try {
    [newApplication]=await db`insert into applications (applicant_id,applicant_email,job_id,resume,subscribed) values (${applicant_id},${user.email},${jobId},${resume},${issubscribed}) returning *`
  } catch (error:any) {
    if(error.code==="23505")
    throw new ErrorHandler(409,"you have already applied for this job")
    throw error;
}

res.status(200).json({
    newApplication,
    message:"application created successfully"
})


})

export const getallapplication:RequestHandler = trycatch(async(req:authenticatedrequest,res,next)=>{
    const application = await db`select a.*,j.* from applications a join jobs j on j.job_id=a.job_id where a.applicant_id=${req.user?.user_id}`;
    if(application.length===0)
        throw new ErrorHandler(404,"no application found")


    res.status(200).json({
        application,
        message:"application fetched successfully"
    })

})

export const logout:RequestHandler =trycatch(async(req:authenticatedrequest,res,next)=>{
    res.clearCookie("authtoken");
    res.status(200).json({
        message:"logout successfully"
    })
})
