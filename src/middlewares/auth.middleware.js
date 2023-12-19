import { User } from "../../models/app/auth/auth-model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import jwt from "jsonwebtoken"

export const verifyJWT = asyncHandler(async (req, res, next) => {
    // console.log("hello",process.env.ACCESS_TOKEN_SECRET);
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
        console.log("unauthorized access");
    }
    // console.log("token",token.exp);
    try {
        console.log("agya me")
        const decoded = jwt.decode(token);
        console.log(decoded)
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decodedToken._id);
        if (!user) {
            console.log("invalid access token")
        }
        req.user = user;
        next();
    } catch (err) {
        console.log(err, "error occured");
    }

})