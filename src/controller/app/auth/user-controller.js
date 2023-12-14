import { User } from "../../../../models/app/auth/auth-model.js";
import { ApiResponse } from "../../../../utils/apiResponse.js";
import { asyncHandler } from "../../../../utils/asyncHandler.js";
import crypto from "crypto";
import {mailgencontent, sendEmail} from "../../../../utils/mail.js"

const generateAccessAndRefreshTokens=async(userId)=>{
    try{
        const user=await User.findById(userId);
        const accessToken=user.generateAccessToken();
        const refreshToken=user.generateRefreshToken();
        
        user.refreshToken=refreshToken;
        await user.save({validateBeforeSave:false});
        return {accessToken,refreshToken};
    }catch(err){
        console.log("error occures",err)
    }
}
const registerUser=asyncHandler(async(req,res)=>{
    const {username,email,password,role}=req.body;
    const existeduser=await User.findOne({email}) 
    if(existeduser){
        console.log("user already existed");
    }
    const user=await User.create({
        username,email,
        password,
        isEmailVerified:false,
        role:"USER"
   })
    
   const{unhashedToken,hashedToken,tokenExpiry}=user.generateTempToken();

   user.emailVerificationToken=hashedToken;
   user.emailVerificationExpiry=tokenExpiry;
   await user.save({validateBeforeSave:false});

   await sendEmail({
    email:user?.email,
    subject:"Please verify your email",
    mail:mailgencontent(
        user.username,
        `${req.protocol}://${req.get("host")}/chatapp/verify-email/${unhashedToken}`
    )
   })
   const createdUser=await User.findById(user._id);
   if(!createdUser){
    console.log("some error occured");

   }
   return res.status(201)
   .json(
    new ApiResponse(
        201,
        {user:createdUser},
        "user created succesfully cheers"
    )
   )
})
const verifyEmail=asyncHandler(async(req,res)=>{
    const {verificationToken}=req.params;
    if(!verificationToken){
        console.log("token is missing");
    }
    let hashedtoken=crypto
    .createHash("sha256")
    .update(verificationToken)
    .digest("hex")

    const user=await User.findOne({
        emailVerificationToken:hashedtoken,
        emailVerificationExpiry:{$gt:Date.now()},
    })
    if(!user){
        console.log("token is invalid");
    }
    user.emailVerificationToken=undefined;
    user.emailVerificationExpiry=undefined;
    user.isEmailVerified=true;
    await user.save({validateBeforeSave:false});

    return res
    .status(200)
    .json(new ApiResponse(200,{isEmailVerified:true},"email verified"));
})
const loginUser=asyncHandler(async(req,res)=>{
    const {email,username,password}=req.body;

    if(!email&&!username){
        console.log("email and username are necesarry")
    }
    const user =await User.findOne({
        $or:[{username},{email}],
    });
    if(!user){
        console.log("user does not exist")
    }
    const pass=user.isPasswordCorrect(password);
    if(!pass){
        console.log("password not valid")
    }
    const {accessToken,refreshToken}=await generateAccessAndRefreshTokens(user._id);
    const loggedInUser=await User.findById(user._id);

    const options={
        httpOnly:true,
        secure:process.env.NODE_ENV==="production",
    }
    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshTOken",refreshToken,options)
    .json(
        new ApiResponse(
            200,{user:loggedInUser,accessToken,refreshToken},
            "User Logged in successfully"
        )
    )

});
const logoutUser=asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken:undefined,
                }
        },
        {
            new:true
        }
    )
    const options={
        httpOnly:true,
        secure:process.env.NODE_ENV==="production"
    }
    return res.status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new 
        ApiResponse(200,{},"USer Logged out"))
})
export{
    registerUser,
    verifyEmail,
    loginUser,
    logoutUser
}