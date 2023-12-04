import { Router } from "express";
import { userRegisterValidator } from "../../../vaildator/app/auth/auth-validator.js";
import { registerUser, verifyEmail } from "../../../src/controller/app/auth/user-controller.js";
import { validate } from "../../../vaildator/validate.js";

const router=Router();

router.route("/register").post(userRegisterValidator(),validate,registerUser);
router.route("/verify-email/:verificationToken").get(verifyEmail);
export default router;