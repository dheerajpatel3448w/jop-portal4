import Razorpay from "razorpay";


export const instance = new Razorpay({
    key_id:process.env.TEST_API_KEY as string,
    key_secret:process.env.TEST_API_SECRET as string
})