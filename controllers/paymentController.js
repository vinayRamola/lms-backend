// import User from "../models/userModel.js"
// import { razorpay } from "../server.js";
// import AppError from "../utils/error.util.js";


// export const getRazorpayApiKey = async(req,res,next)=>{
//     res.status(200).json({
//         success: true,
//         message: "Razorpay API key",
//         key: process.env.RAZORPAY_KEY_ID
//     })
// }

// export const buySubscription = async(req,res,next)=>{
//     const { id } = req.user;

//     const user = await User.findById(id);

//     if(!user){
//         return next(
//             new AppError('Unauthorised, please login', 500)
//         )
//     }

//     if(user.role === 'ADMIN'){
//         return next(
//             new AppError('ADMIN cannot purchase a subscription', 400)
//         )
//     }

//     const subscription = await razorpay.subscriptions.create({
//         plan_id: process.env.RAZORPAY_PLAN_ID,
//         customer_notify: 1
//     });

//     user.subscription.id = subscription.id;
//     user.subscription.status = subscription.status;

//     await user.save();

//     res.status(200).json({
//         success: true,
//         message: 'Subscribed successfully',
//         subscription_id: subscription.id
//     })
// }

// export const verifySubscription = async(req,res,next)=>{
    
// }

// export const cancelSubscription = async(req,res,next)=>{
    
// }

// export const allPayment = async(req,res,next)=>{
    
// }