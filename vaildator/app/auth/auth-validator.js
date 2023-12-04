import { body } from "express-validator";
import { AvailableUserRoles } from "../../../constant.js"


const userRegisterValidator=()=>{
return [
    body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Email is invalid"),
    body("username")
    .trim()
    .notEmpty()
    .withMessage("username is required")
    .isLength({min:3})
    .withMessage("username must be of minimum 3 length"),
    body("password").trim().notEmpty().withMessage("Passwrod is required"),
    body("role")
    .optional()
    .isIn(AvailableUserRoles)
    .withMessage("Invalid user role"),
]
}
export {userRegisterValidator};