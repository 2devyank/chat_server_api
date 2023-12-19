import { User } from "../../../../models/app/auth/auth-model.js"
import { ApiResponse } from "../../../../utils/apiResponse.js";
import { asyncHandler } from "../../../../utils/asyncHandler.js";

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
            $addFields:{
                lastMessage:{$first:"$lastMessage"},
            }
        }
    ]
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

export { searchAllusers };