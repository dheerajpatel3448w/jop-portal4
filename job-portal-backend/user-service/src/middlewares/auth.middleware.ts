import { error } from "console"
import type {Request,Response, NextFunction } from "express"
import  jwt, { type JwtPayload }  from "jsonwebtoken"
import { db } from "../configs/db.js"
export interface user {
    user_id:number
    name:string
    email:string
    phone_number:string
    role:'job_seeker'|'recruiter'
    bio:string|null
    resume:string|null
    resume_public_id:string|null
     profile_pic:string|null
     profile_pic_public_id:string
     skills:string[],
     subscription:string|null
}
export interface authenticatedrequest extends Request {
    user?:user
}

export const isauth = async(req:authenticatedrequest,res:Response,next:NextFunction):Promise<void> => {
  try {
  const token = req.cookies.authtoken || req.headers.authorization?.split(" ")[1];
  if(!token){
    res.status(400).json({
        message:"token expired"
    })
    return
  }
  const decoded = jwt.verify(token,process.env.JWT_SECRET as string)as JwtPayload;
  if(!decoded){
    res.status(400).json({message:"token is expired"})
    return
  } 
  const user = await db`select u.user_id,u.name,u.email,u.phone_number,u.role,u.bio,u.resume,u.resume_public_id,u.profile_pic,u.profile_pic_public_id,u.subscription ,Array_AGG(s.name) filter (where s.name is not null) AS skills from users u left join user_skills us on u.user_id = us.user_id left join skills s on us.skill_id=s.skill_id where u.user_id=${decoded.userId} group by u.user_id;`
   
  if(user.length===0){
    res.status(400).json({message:"invalid token"});
return  
}
const users = user[0] as user;
users.skills=users.skills||[];
req.user=users;
next();

  } catch (error) {
    console.log(error)
    res.status(500).json({
        message:error
    })
  }
}

