import ErrorHandler from "../utils/errorhandler.util.js";
import { trycatch } from "../utils/trycatch.util.js";
import type { RequestHandler
} from "express";
import bcrypt from "bcrypt";
import  jwt  from "jsonwebtoken";
import { client, db } from "../configs/db.js";
import { getbuffer } from "../utils/buffer.util.js";
import axios from "axios";
import { generateForgotPasswordTemplate } from "../utils/template.util.js";
import { publishTopic } from "../service/producer.service.js";

export const register:RequestHandler = trycatch(async(req,res,next)=>{
const {name,email,password,phoneNumber,role,bio} = req.body;

if(!email||!password||!name||!phoneNumber||!role){
    throw new ErrorHandler(400,"All fields are required");
}
const existingUser = await db`
select user_id from users where email=${email};
`
console.log(existingUser);
if(existingUser.length>0){
    throw new ErrorHandler(409,"User with this email already exists");

}
const password2 = await bcrypt.hash(password,10);
console.log(password2)
let newUser:any;
if(role=="recruiter" ){
const [user]= await db`
insert into users (name,email,password,phone_number,role)
values (${name},${email},${password2},${phoneNumber},${role})
returning user_id,name,email,phone_number,role,created_at;
`
newUser=user
}
else if(role=="job_seeker"){
    const file = req.file;
    console.log(role);
    if(!file){
        throw new ErrorHandler(400,"Resume file is required for job seekers");
    }
const buffer = getbuffer(file);
if(!buffer){
    throw new ErrorHandler(500,"Failed to process the resume file");
}

const result = await axios.post(`${process.env.UTILS_SERVICE_URL}/utils/upload`,{
    fileBuffer:buffer.content,   
})
console.log(result.data);
    
    const [user]= await db`
insert into users (name,email,password,phone_number,role,resume,resume_public_id,bio)
values (${name},${email},${password2},${phoneNumber},${role},${result.data.data.url},${result.data.data.public_id},${bio})
returning user_id,name,email,phone_number,role,created_at,bio,resume,resume_public_id;
`
newUser=user    ;
}

const token = jwt.sign({userId:newUser.user_id,role:newUser.role},process.env.JWT_SECRET as string,{expiresIn:"15d"});
res.cookie('authtoken',token,{
     httpOnly: true,
        secure: false,
        sameSite: "lax",
});
res.status(201).json({message: "User registered successfully"
,newUser,token
});

})

export const login:RequestHandler = trycatch(async(req,res,next)=>{
const {email,password} = req.body;
if(!email||!password){
    throw new ErrorHandler(400,"Email and password are required");
}
const user1:any= await db`
SELECT 
    u.profile_pic,
    u.subscription,
    u.user_id,
    u.name,
    u.email,
    u.password,
    u.role,
    u.bio,
    ARRAY_AGG(s.name) FILTER (WHERE s.name IS NOT NULL) AS skills
FROM users u
LEFT JOIN user_skills us ON u.user_id = us.user_id
LEFT JOIN skills s ON us.skill_id = s.skill_id
WHERE u.email = ${email}
GROUP BY u.user_id;


`

if(user1.length===0){
    throw new ErrorHandler(401,"Invalid email or password");
}
const user = user1[0];
const isPasswordValid = await bcrypt.compare(password,user.password);
if(!isPasswordValid){
    throw new ErrorHandler(401,"Invalid email or password");
}
delete user.password;
user.skills = user.skills||[];

const token = jwt.sign({userId:user.user_id,role:user.role},process.env.JWT_SECRET as string,{expiresIn:"15d"});
res.cookie('authtoken',token,{
     httpOnly: true,
        secure: false,
        sameSite: "lax",
});
res.status(200).json({message: "Login successful",user,token});
})





export const forgotPassward:RequestHandler= trycatch(async(req,res,next)=>{
const {email}=req.body;
if(!email){
    return new ErrorHandler(400,'email is requires');

}
const euser = await db`select user_id, name , email from users where email=${email}`
if(euser.length== 0){
return res.json({
    message:"if that email exist we have sent a reset link"
})

}
const eusers = euser[0] as { user_id: number, email: string ,name:string};
const resettoken = jwt.sign({
    email:eusers.email,
    type:"reset",
},
process.env.JWT_SECRET as string,
{
    expiresIn:"15m"
}

)

const resetlink = `${process.env.FRONTEND_URL}/reset/${resettoken}`
await client.set(`forget:${email}`,resettoken);
await client.expire(`forget:${email}`,900)
const userinfo = {
    userName:eusers.name,
    resetLink:resetlink,
   expiryMinute:15  
}
const message = {
    to:email,
    subject:"RESET your passsword - `hireheaven`",
    html:generateForgotPasswordTemplate(userinfo)
}
publishTopic("send_mail",message);
res.json({
    message:"if that email exist we have sent a reset link"
})
})

export const resetpassword:RequestHandler = trycatch(async(req,res,next)=>{
    const {token}=req.params as {token:string} ;
    const {password }=req.body;
    
    const decoded = jwt.verify(token,process.env.JWT_SECRET as string) as {email:string,type:string}
    if(!decoded){
        throw new ErrorHandler(400,"token is experied or wrong")
    }
    if(decoded.type!="reset")
        throw new ErrorHandler(400,"expired token");
    const st = await client.get(`forget:${decoded.email}`);
  
    if(!st || st!==token){
      throw new ErrorHandler(400,"token has been expired");
    }
    const u= await db`select user_id,email from users where email=${decoded.email}`
  if(u.length==0){
    throw new ErrorHandler(400,"user not found");

  }
  const hashpass = await bcrypt.hash(password,10);
  const user = await db`update users set password=${hashpass} where email=${decoded.email} returning *`
  await client.del(`forget:${decoded.email}`);

  return res.status(200).json({
    message:"password reset successfully"
  })
})
