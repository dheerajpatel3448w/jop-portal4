import {  application, type RequestHandler } from "express";
import { trycatch } from "../utils/trycatch.util.js";
import type { authenticatedrequest } from "../middlewares/auth.middleware.js";
import ErrorHandler from "../utils/errorhandler.util.js";
import { db } from "../configs/db.js";
import { getbuffer } from "../utils/buffer.util.js";
import axios from "axios";
import { getApplicationStatusEmail } from "../utils/template.util.js";
import { publishTopic } from "../service/producer.service.js";



export const createcompany:RequestHandler = trycatch(async(req:authenticatedrequest,res,next)=>{
const user = req.user;
if(!user){
    throw new ErrorHandler(400,"authentcation required");
}
if(user.role!=="recruiter"){
    throw new ErrorHandler(400,"only for recuiter");
}
const {name ,description,website}=req.body;
if(!name||!description||!website){
    throw new ErrorHandler(400,"all field are requried");
}
const existing = await db`select company_id from companies where name = ${name} ;`
if(existing.length>0){
throw new ErrorHandler(400,"company with this name already register pleae choose another name");

}
const file = req.file;
if(!file){
    throw new ErrorHandler(400,"company logo is required");
}
const buffer = getbuffer(file);
if(!buffer||!buffer.content){
    throw new ErrorHandler(500,"failed to create buffer ");
}
console.log("l;")
const result = await axios.post(`${process.env.UTILS_SERVICE_URL}/utils/upload`,{
    fileBuffer:buffer.content,   
})
console.log(result.data);
const [newcomapany ]= await db`insert into companies (name, description,website,logo,logo_public_id,recruiter_id) values (${name},${description},${website},${result.data.data.url},${result.data.data.public_id},${user.user_id}) returning *`
res.status(200).json({
    company:newcomapany,
    message:"company created successfully"
})
})

export const deletecompany :RequestHandler=trycatch(async(req:authenticatedrequest,res,next)=>{
    const user = req.user;
    if(!user){
        throw new ErrorHandler(400,"authentcation required");
    }
    
    const {company_id}=req.params;
    if(!company_id){
        throw new ErrorHandler(400,"company id is required");
    }
    const existing = await db`select * from companies where company_id = ${company_id} and recruiter_id = ${user.user_id} ;`
if(existing.length==0){
    throw new ErrorHandler(400,"your company not exist")
    }
   await db`delete from companies where company_id = ${company_id}`

   res.status(200).json({
    message:"company deleted successfully and associated jobs are also deleted"
   })
    

})
export const createjob:RequestHandler = trycatch(async(req:authenticatedrequest,res,next)=>{
    const user = req.user;
if(!user){
    throw new ErrorHandler(400,"authentcation required");
}
if(user.role!=="recruiter"){
    throw new ErrorHandler(400,"only for recuiter");
}
console.log(user);
const{title,description,salary,location,role,job_type,work_location,company_id,openings}=req.body;
if(!title||!description||!salary||!location||!role||!job_type||!work_location||!company_id||!openings){
    throw new ErrorHandler(400,"all field are requried");
}
    const existing = await db`select * from companies where company_id = ${company_id} and recruiter_id = ${user.user_id} ;`
if(existing.length==0){
    throw new ErrorHandler(400,"your company not exist")
    }
    console.log(existing);

const [newjob]=await db` 
insert into jobs (title,description,salary,location,role,job_type,work_location,company_id,openings,posted_by_recuriter_id) values (${title},${description},${salary},${location},${role},${job_type},${work_location},${company_id},${openings},${user.user_id}) returning * ;
`
console.log(newjob)
res.status(200).json({
    job:newjob,
    message:"job created successfully"
})



})

export const updatejob:RequestHandler =trycatch(async(req:authenticatedrequest,res,next)=>{
        const user = req.user;
        
if(!user){
    throw new ErrorHandler(400,"authentcation required");
}
if(user.role!=="recruiter"){
    throw new ErrorHandler(400,"only for recuiter");
}
console.log(user);
const{title,description,salary,location,role,job_type,work_location,openings,is_active}=req.body;
const [exist] = await db`select * from jobs where job_id = ${req.params.job_id} and posted_by_recuriter_id = ${user.user_id};`
if(!exist){
    throw new ErrorHandler(400,"your job not exist")
}
if(exist.posted_by_recuriter_id!==user.user_id){
    throw new ErrorHandler(400,"your job not exist")

}
const [updatejob] = await db`update jobs set title = ${title},description = ${description},salary = ${salary},location = ${location},role = ${role},job_type = ${job_type},work_location = ${work_location},openings = ${openings},is_active = ${is_active} where job_id = ${req.params.job_id} returning * ;`
if(!updatejob){
    throw new ErrorHandler(400,"failed to update job")
}
res.status(200).json({
    job:updatejob,
    message:"job updated successfully"
})
})


export const getallcompany:RequestHandler = trycatch(async(req:authenticatedrequest,res,next)=>{
    const company = await db`select * from companies where recruiter_id=${req.user?.user_id};`
    res.status(200).json({
        message:"company get successfull",
        company
    })
})

export const getcompanydetails:RequestHandler=trycatch(async(req:authenticatedrequest,res,next)=>{
    const {id}=req.params;
    if(!id){
        throw new ErrorHandler(400,"company id is required");
    }
   const [company]=await db`select c.*,coalesce((
   select json_agg(j.*) from jobs j where j.company_id = c.company_id
   ),'[]'::json
   )As jobs from companies c where c.company_id = ${id} group by c.company_id;`


   if(!company){
    res.status(200).json("company detailed not fetch")
   } 
   res.status(200).json({
    company,
    message:"company detailed fetched successfully"
})
})



export const getallactivejob:RequestHandler=trycatch(async(req,res,next)=>{
const {title,location}=req.query as {title?:string,location?:string}
let querystring =`select j.*,c.name as company_name , c.logo as company_logo , c.company_id as company_id from jobs j join companies c on j.company_id = c.company_id where j.is_active = true `
let values =[];
let paramindex =1;
if(title){
    querystring+=` and j.title ilike $${paramindex} `
    values.push(`%${title}%`)
    paramindex++;
}
if(location){
    querystring+=` and j.location ilike $${paramindex} `
    values.push(`%${location}%`)
}
querystring+=` order by j.created_at desc;`
const jobs = await db.query(querystring,values)
res.status(200).json({
    jobs,
    message:"jobs fetched successfully"

})
})

export const getsinglejob:RequestHandler= trycatch(async(req,res,next)=>{
const[job]= await db`select * from jobs where job_id=${req.params.job_id};`
if(!job){
    throw new ErrorHandler(400,"job not found")
}
res.status(200).json({
    job,
    message:"job fetched successfully"
})

})


export const getallapplication:RequestHandler =trycatch(async(req:authenticatedrequest,res,next)=>{
          const user = req.user;
if(!user){
    throw new ErrorHandler(400,"authentcation required");
}
if(user.role!=="recruiter"){
    throw new ErrorHandler(400,"only for recuiter");
}
    const {jobId}=req.params;
    const[job]= await db`select posted_by_recuriter_id from jobs where job_id=${jobId};`
    if(!job){
        throw new ErrorHandler(400,"job not found")
    }
    
    if(job.posted_by_recuriter_id!==user.user_id){
        throw new ErrorHandler(400,"you are not authorized to view this job")
    }

  const applications = await db`select * from applications where job_id=${jobId} order by subscribed desc , applied_at asc;`
if(applications.length==0){
    throw new ErrorHandler(400,"application not found")
}
res.status(200).json({
    message:"application fetched successfully",
    applications
})

})

export const updateapplication:RequestHandler =trycatch(async(req:authenticatedrequest,res,next)=>{
          const user = req.user;
if(!user){
    throw new ErrorHandler(400,"authentcation required");
}
if(user.role!=="recruiter"){
    throw new ErrorHandler(400,"only for recuiter");
}
const {id} =req.params;
const [applications]= await db`select * from applications where application_id=${id};`
if(!applications){
    throw new ErrorHandler(400,"application not found")
}
const [job]=await db`select posted_by_recuriter_id from jobs where job_id=${applications.job_id};`
if(!job){
    throw new ErrorHandler(400,"job not found")
}
if(job.posted_by_recuriter_id!==user.user_id){
    throw new ErrorHandler(400,"you are not authorized to view this job")
}
const [updateapplication]=await db`update applications set status=${req.body.status} where application_id=${id} returning *;`
if(!updateapplication){
    throw new ErrorHandler(400,"failed to update application")
}
const message = {
    to:applications.applicant_email,
    subject:"application status updated - job_portal",
    html:getApplicationStatusEmail(job.title)
}
publishTopic("send_mail",message).catch((e)=>{
    throw new ErrorHandler(500,"failed to send mail")
})
res.status(200).json({
    message:"application updated successfully",
    application:updateapplication,
    job,
})
})
