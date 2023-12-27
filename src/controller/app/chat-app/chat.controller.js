import mongoose from "mongoose";
import { ChatEventEnum } from "../../../../constant.js";
import { User } from "../../../../models/app/auth/auth-model.js"
import { Chat } from "../../../../models/app/chat-app/chat.model.js";
import { ChatMessage } from "../../../../models/app/chat-app/message.model.js";
import { ApiResponse } from "../../../../utils/apiResponse.js";
import { asyncHandler } from "../../../../utils/asyncHandler.js";
import { emitSocketEvent } from "../../../socket/index.js";

const chatCommonAggregation = () => {
    return [
        {
            $lookup: {
                from: "users",
                foreignField: "_id",
                localField: "participants",
                as: "participants",
                pipeline: [
                    {
                        $project: {
                            password: 0,
                            refreshToken: 0,
                            forgotPasswordToken: 0,
                            forgotPasswordExpiry: 0,
                            emailVerificationToken: 0,
                            emailVerificationExpiry: 0,
                        }
                    }
                ]
            }
        },
        {
            $lookup: {
                from: "chatmessage",
                foreignField: "_id",
                localField: "lastMessage",
                as: "lastMessage",
                pipeline: [
                    {

                        $lookup: {
                            from: "users",
                            foreignField: "_id",
                            localField: "sender",
                            as: "sender",
                            pipeline: [
                                {
                                    $project: {
                                        username: 1,
                                        avatar: 1,
                                        email: 1,
                                    }
                                }
                            ]
                        }
                    },
                    {

                        $addFields: {
                            sender: { $first: "$sender" },
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                lastMessage: { $first: "$lastMessage" },
            }
        }
    ]
}
const deleteCascadchatMessage=async(chatId)=>{
    
    const messages=ChatMessage.find({
        chat:new mongoose.Types.ObjectId(chatId),
    })
    
    let attachments=[];

    await ChatMessage.deleteMany({
        chat:new mongoose.Types.ObjectId(chatId), 
    })

}
const searchAllusers = asyncHandler(async (req, res) => {
    console.log("hello", process.env.ACCESS_TOKEN_SECRET);
    const users = await User.aggregate([
        {
            $match: {
                _id: {
                    $ne: req.user._id,
                },
            },
        },
        {
            $project: {
                avatar: 1,
                username: 1,
                email: 1,
            },
        },
    ])
    return res
        .status(200)
        .json(new ApiResponse(200, users, "Users fetched successfully"));
})
const createOrGetOneOnOneChat = asyncHandler(async (req, res) => {
    const { receiverId } = req.params;
    console.log("id received",receiverId)
    const receiver = await User.findById(receiverId);
    console.log("banda",receiver._id);
    if (!receiver) {
        console.log("no user exist with given id");
    }
console.log("string conversion",receiver._id.toString())
    if (receiver._id.toString() == req.user._id.toString()) {
        console.log("user can not chat with himself");
    }

    const chat = await Chat.aggregate([
        {
            $match: {
                isGroupChat: false,

                $and: [
                    {
                        participants: { $elemMatch: { $eq: req.user._id } },
                    },
                    {
                        participants: {
                            $elemMatch: { $eq: new mongoose.Types.ObjectId(receiverId) },
                        }
                    }

                ]
            }
        },
        ...chatCommonAggregation(),
    ])

    if (chat.length) {
        return res
            .status(200)
            .json(new ApiResponse(200, chat[0], "chat recieved succesfully"))
    }

    const newChatInstance = await Chat.create({
        name: "One on one chat",
        participants: [req.user._id, new mongoose.Types.ObjectId(receiverId)],
        admin: req.user._id,
    });
    const createdChat = await Chat.aggregate([
        {
            $match: {
                _id: newChatInstance._id,
            },
        },
        ...chatCommonAggregation(),
    ])
    const payload = createdChat[0];
    if (!payload) {
        console.log("internal server error");
    }
    payload?.participants?.forEach((participants) => {
        if (participants._id.toString() === req.user._id.toString()) return;
        emitSocketEvent(
            req,
            participants._id.toString(),
            ChatEventEnum.NEW_CHAT_EVENT,
            payload
        )
})
return res.status(201)
.json(new ApiResponse(201,payload,"chat recieved succesfully"))

})
const deleteOneOnOneChat=asyncHandler(async(req,res)=>{
    const {chatId}=req.params;
    const chat=await Chat.aggregate([
        {
            $match:{
                _id:new mongoose.Types.ObjectId(chatId),
            }
        },
        ...chatCommonAggregation(),
    ])
    const payload=chat[0];
    if(!payload){
        console.log("chat does not exist");
    }
    await Chat.findByIdAndDelete(chatId);
    await deleteCascadchatMessage(chatId);
    const otherparticipants=payload?.participants?.find(
        (participant)=>participant?._id.toString()!==req.user._id.toString()
    )
    emitSocketEvent(
        res,
        otherparticipants._id.toString(),
        ChatEventEnum.LEAVE_CHAT_EVENT,
        payload
    )
    return res.
    status(200)
    .json(new ApiResponse(200,{},"Chat deleted Succesfully"))
})
const getAllchats=asyncHandler(async(req,res)=>{
const chats=await Chat.aggregate([
    {
        $match:{
            participants:{
                $elemMatch:{$eq:req.user._id}
            }
        }
    },
    {
        $sort:{
            updatedAt:-1,
        }
    },
    ...chatCommonAggregation(),
])
return res.status(200)
.json(new ApiResponse(200,chats||[],"User chats fetched"))
}
)

export { searchAllusers,createOrGetOneOnOneChat,deleteOneOnOneChat,getAllchats };