import User from "../models/userModel.js"
import AppError from "../utils/error.util.js";
import { razorpay } from '../server.js';



export const getRazorpayApiKey = async(req,res,next)=>{
    try {
        res.status(200).json({
            success: true,
            message: "Razorpay API key",
            key: process.env.RAZORPAY_KEY_ID
        })
    } catch (error) {
        return next(
            new AppError(e.message, 500)
        )
    }
}

export const buySubscription = async(req,res,next)=>{
    try {
        const { id } = req.user;

        const user = await User.findById(id);

        if(!user){
            return next(
                new AppError('Unauthorised, please login', 500)
            )
        }

        if(user.role === 'ADMIN'){
            return next(
                new AppError('ADMIN cannot purchase a subscription', 400)
            )
        }

        const subscription = await razorpay.subscriptions.create({
            plan_id: process.env.RAZORPAY_PLAN_ID,
            customer_notify: 1,
            total_count: 12
        });

        user.subscription.id = subscription.id;
        user.subscription.status = subscription.status;

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Subscribed successfully',
            subscription_id: subscription.id
        })
    } 
    catch (error) {
        return next(
            new AppError(error.message, 500)
        )}
}

export const verifySubscription = async(req,res,next)=>{
    try {
        const { id } = req.user;
        const { razorpay_payment_id, razorpay_signature, razorpay_subscription_id } = req.body;

        const user = await User.findById(id);
        if(!user){
            return next(
                new AppError('Unauthorised, please login', 500)
            )
        }

        const subscriptionId = user.subscription.id;
   
   
        // This is how you verify that your payment is successfully
        const generatedSignature = crypto
            .createHmac('sha256', process.abort.env.RAZORPAY_SECRET)
            .update(`${razorpay_payment_id}|${subscriptionId}`)
            .digest('hex');

        if(generatedSignature !== razorpay_signature){
            return next(
                new AppError('Payment not verified try again', 500)
            )
        }

        await Payment.create({
            razorpay_payment_id,
            razorpay_subscription_id,
            razorpay_signature,
            
        });

        user.subscription.status = 'active';
        await user.save();

        res.status(200).json({
            success: true,
            message: "Payment verfied successfully"
        })
    } 
    catch (error) {
        return next(
        new AppError(error.message, 500)
    )}
}

export const cancelSubscription = async(req,res,next)=>{
    try {
        const { id } = req.user;

    const user = await User.findById(id);

    if(!user){
        return next(
            new AppError('Unauthorised, please login', 500)
        )
    }

    if(user.role === 'ADMIN'){
        return next(
            new AppError('ADMIN cannot purchase a subscription', 400)
        )
    }

    const subscriptionId = user.subscription.id;

    const  subscription = await razorpay.subscriptions.cancel(
        subscriptionId
    )

    user.subscription.status = subscription.status;

    await user.save();
    } catch (error) {
        return next(
            new AppError(e.message, 500)
        )
    }

}

export const allPayment = async(req,res,next)=>{
    try {
        const { count } = req.query;

    const subscriptions = await razorpay.subscriptions.all({
        count: count || 11,
    });
    
    res.status(200).json({
        success: true,
        message: 'All Payments',
        subscriptions
    })
    
    } catch (error) {
        return next(
            new AppError(e.message, 500)
        )
    }
}