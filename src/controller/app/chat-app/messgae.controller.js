import mongoose from "mongoose";
import { Chat } from "../../../../models/app/chat-app/chat.model.js";
import { ChatMessage } from "../../../../models/app/chat-app/message.model.js";
import { ApiResponse } from "../../../../utils/apiResponse.js";
import { asyncHandler } from "../../../../utils/asyncHandler.js";
import { ChatEventEnum } from "../../../../constant.js";
import { emitSocketEvent } from "../../../socket/index.js";
import { getLocalPath, getStaticFilePath } from "../../../../utils/helper.js";




const chatMessagecommonaggregation=()=>{
    return [
        {
            $lookup:{
                from:"users",
                localField:"sender",
                foreignField:"_id",
                as:"sender",
                pipeline:[
                 {
                    $project:{
                        avatar:1,
                        username:1,
                        email:1
                    }
                 }
                ]
                
            }
        },
        {
            $addFields:{
                sender:{
                    $first:"$sender"
                }
            }
        }
    ]
} 

const getAllMessages=asyncHandler(async(req,res)=>{
    const {chatId}=req.params;

    const selectedChat=await Chat.findById(chatId);

    if(!selectedChat){
        console.log("new error found")
    }
    if(!selectedChat.participants?.includes(req.user?._id)){
        console.log("user is not part of this chat")
    }

    const messages=await ChatMessage.aggregate([
        {
            $match:{
                chat:new mongoose.Types.ObjectId(chatId),

            }
        },
        ...chatMessagecommonaggregation(),
        {
            $sort:{
                createdAt:+1,
            }
        }
    ])
    return res.status(200)
    .json(new ApiResponse(200,messages||[],"Messages Fetched succesfully"))

})

const sendMessage=asyncHandler(async(req,res)=>{
    const {chatId}=req.params;
    const {content}=req.body;
    console.log("yh rha content",content);
    if(!content && !req.files?.attachments.length){
        console.log("no message content provided");
    }

    const selectedChat=await Chat.findById(chatId);
    if(!selectedChat){
        console.log("chat does not exist")

    }
    const messageFiles=[];
    if(req.files && req.files.attachments?.length>0){
        req.files.attachments?.map((attachment)=>{
            messageFiles.push({
                url:getStaticFilePath(req,attachment.filename),
                localPath:getLocalPath(attachment.filename),
            })
        })
    }

    const message =await ChatMessage.create({
        sender:new mongoose.Types.ObjectId(req.user._id),
        content:content||"",
        chat:new mongoose.Types.ObjectId(chatId),
        attachments:messageFiles,
    })
    const chat=await Chat.findByIdAndUpdate(
        chatId,
        {
            $set:{
                lastMessage:message._id,
            }
        },
        {new:true}
    );
    const messages=await ChatMessage.aggregate([
        {
            $match:{
                _id:new mongoose.Types.ObjectId(message._id),
            }
        },
        ...chatMessagecommonaggregation(),
    ])
    const recievedMessage=messages[0];
    if(!recievedMessage){
        console.log("internal server error")
    }
    chat.participants.forEach((participantObjectId)=>{
        if(participantObjectId.toString()===req.user._id.toString()) return;
        console.log("=p=>"+participantObjectId.toString())
        console.log("c=>"+chatId);
        emitSocketEvent(
            req,
            participantObjectId.toString(),
            ChatEventEnum.MESSAGE_RECIEVED_EVENT,
            recievedMessage
        )
    })

    return res.status(201)
    .json(new ApiResponse(201,recievedMessage,"Message recieved succesfully"))

})
export {getAllMessages,sendMessage}