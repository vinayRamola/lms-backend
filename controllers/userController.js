import AppError from "../utils/error.util.js";
import User from "../models/userModel.js"
import cloudinary from 'cloudinary' 
import fs from 'fs/promises'
import sendEmail from "../utils/sendEmail.js";
import crypto from 'crypto'

const cookieOption = {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7days
    httpOnly: true,
    secure: true 
}

const register = async(req,res,next)=>{
    const { fullName , email, password } = req.body;

    if(!fullName || !email || !password){
        return next(new AppError('All Field are required', 400));
    }

    const userExist =await User.findOne({email})

    if(userExist){
        return next(new AppError('Email alreay registered', 400));
    }

    const user = await User.create({
        fullName,
        email,
        password,
        avatar: {
            public_id: email,
            secure_url: "https://img.freepik.com/premium-vector/young-smiling-man-avatar-man-with-brown-beard-mustache-hair-wearing-yellow-sweater-sweatshirt-3d-vector-people-character-illustration-cartoon-minimal-style_365941-860.jpg?w=2000"
        }
    })

    

    if(!user){
        return next(new AppError('User registration failed, Try Again', 400));
    }

    // File upload
    if(req.file){
        try {
            const result = await cloudinary.v2.uploader.upload(req.file.path,{
                folder: 'lms',
                height: 250,
                width: 250,
                gravity: 'faces',
                crop: 'fill'
            })      
            
            if(result){
                user.avatar.public_id = result.public_id;
                user.avatar.secure_url = result.secure_url;

                //remove file from server
                fs.rm(`uploads/${req.file.filename}`)
            }
        } catch (error) {
            return next( new AppError(error || 'File not upload, try again' , 500));
        }
    }

    await user.save();

    user.password = undefined;

    const token = await user.generateJWTToken();

    res.cookie('token', token, cookieOption);

    res.status(201).json({
        success: true,
        message: 'User registered successfully',
        user,
    })

};

const login =async (req,res,next)=>{

    try {
    const { email , password } = req.body;

    if(!email || !password){
        return next(new AppError("All field are required", 400));
    }

    const user = await User.findOne({
        email
    }).select('+password');   // we are asking for password explicitly beacuse we have made is fasle previously

    if(!user || !user.comparePassword(password)){
        return next(new AppError("Email and password do not match", 400));
    }

    const token = await user.generateJWTToken();
    user.password = undefined;

    res.cookie('token', token, cookieOption);

    res.status(200).json({
        success: true,
        message: "User logged in Successfully",
        user
    })

    } catch (error) {
        return next(new AppError(error.message, 500));
    }
    
};

const logout = (req,res)=>{
    res.cookie('token', null,{
        secure: true,
        maxAge: 0,
        httpOnly: true
    });

    res.status(200).json({
        success: true,
        message: "User Logged out successfully"
    })
};

const getProfile =async (req,res,next)=>{

    try {
        const userId = req.user.id;
        const user = await User.findById(userId);
        
        res.status(200).json({
            success: true,
            message: "User details",
            user
        });
    } catch (error) {
        
        return next(new AppError(error.message, 500));        
    }

    
};

const forgotPassword =async (req,res,next)=>{
    const { email } = req.body;

    if(!email){
        return next(new AppError('Email is required', 400));
    }

    const user = await User.findOne({email});
    if(!user){
        return next(new AppError('Email not registered', 400));
    }

    const resetToken  = await user.generatePasswordResetToken();

    console.log("reset token : " + resetToken)

    await user.save();

    const resetPasswordURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    const subject = 'Reset Password';
    const message = `You can reset your password by clicking on --> <a href=${resetPasswordURL} target="_blank">Reset Your Password </a>`

    try {
        await sendEmail(email, subject, message);

        res.status(200).json({
            success: true,
            message: `Reset password token has benn sent to ${email} successfully`,
        })
    } catch (error) {
        user.forgotPasswordExpiry = undefined;
        user.forgotPasswordToken = undefined;

        await user.save();
        return next(new AppError(error.message, 500));
    }

};

const resetPassword =async (req,res,next)=>{
    const { resetToken } = req.params;

    const { password } = req.body;

    const forgotPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    console.log("forget pass token" +forgotPasswordToken)

    const user = await User.findOne({
        forgotPasswordToken,
        forgotPasswordExpiry: { $gt: Date.now() }
    });
    
    if(!user){
        return next(
            new AppError('Token is invalid or expired, please try again!',400)
        )
    }

    user.password = password;
    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpiry = undefined;

    user.save();

    res.status(200).json({
        success: true,
        message: 'Password changed successfully'
    })
};

export {
    register,
    login,
    logout,
    getProfile,
    forgotPassword,
    resetPassword
};

