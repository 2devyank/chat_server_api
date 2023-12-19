import mongoose, { Schema } from "mongoose";
import { AvailableUserRoles, TOKEN_EXPIRY, UserRolesEnum } from "../../../constant.js";
import crypto from "crypto"
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"

const userSchema = new Schema(
    {
        avatar: {
            type: {
                url: String,
                localPath: String,

            },
            default: {
                url: ``,
                localPath: "",
            },
        },
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        role: {
            type: String,
            enum: AvailableUserRoles,
            defualt: UserRolesEnum.USER,
            required: true,
        },
        password: {
            type: String,
            required: [true, "Password is required"],
        },
        loginType: {
            type: String,
            default: "EMAIL_PASSWORD",
        },
        isEmailVerified: {
            type: Boolean,
            default: false,
        },
        refreshToken: {
            type: String,
        },
        forgotPasswordToken: {
            type: String,
        },
        forgotPasswordExpiry: {
            type: String,

        },
        emailVerificationToken: {
            type: String,
        },
        emailVerificationExpiry: {
            type: Date,
        },
    },
    { timestamps: true }
);

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = bcrypt.hash(this.password, 10);
    next();
})
userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
}
userSchema.methods.generateTempToken = function () {
    const unhashedToken = crypto.randomBytes(20).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(unhashedToken).digest('hex')
    const tokenExpiry = Date.now() + TOKEN_EXPIRY;

    return { unhashedToken, hashedToken, tokenExpiry };
}
userSchema.methods.generateAccessToken = ()=> {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            role: this.role,
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "2d" }
    );
};

userSchema.methods.generateRefreshToken = ()=> {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: "10d" }
    )
}
export const User = mongoose.model("User", userSchema);