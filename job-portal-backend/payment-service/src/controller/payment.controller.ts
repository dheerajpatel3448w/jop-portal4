import type { RequestHandler } from "express";
import { trycatch } from "../utils/trycatch.util.js";
import type { authenticatedrequest } from "../middlewares/auth.middleware.js";
import ErrorHandler from "../utils/errorhandler.util.js";
import { db } from "../configs/db.js";
import { instance } from "../service/payment.service.js";
import crypto from "crypto"

export const checkout:RequestHandler = trycatch(async(req:authenticatedrequest,res,next)=>{
if(!req.user){
    throw new ErrorHandler(401,"no valid user");
}
const userId = req.user.user_id;
const [user]= await db`select * from users where user_id=${userId}`;
if(!user){
    throw new ErrorHandler(401,"user not found");
}
const subtime  = user.subscription ? new Date(user.subscription).getTime():0
const now = Date.now();
console.log(subtime)
const issubscribed = subtime > now;
if(issubscribed){
    throw new ErrorHandler(400,"you already have a subsritption");
}

const options = {
    amount:Number(119*100),
    currency :"INR",
    notes :{
        user_id:userId.toString()
    }
}
const order = await instance.orders.create(options);
res.status(201).json({
    order,
})
})


export const paymentVerification:RequestHandler = trycatch(async(req:authenticatedrequest,res,next)=>{
const user = req.user 
const {razorpay_order_id,razorpay_payment_id,razorpay_signature} = req.body;
const b = razorpay_order_id + "|"+ razorpay_payment_id
const es = crypto.createHmac("sha256",process.env.TEST_API_SECRET as string).update(b).digest("hex")
const isAuthentic = es===razorpay_signature
if(isAuthentic){
    const now = new Date()
    const td = 30*24*60*60*1000;
    const ed = new Date(now.getTime() + td)
    const [updateUser] = await db`update users set subscription = ${ed} where user_id  = ${user?.user_id} returning *`
    res.json({
        message:"subscription purchased successfully",
        updateUser
    })
}
else{
    return res.status(400).json({
        message:"payment failed"
    })
}
})
