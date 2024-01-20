import { Router } from "express";
import { getAllMessages, sendMessage } from "../../../src/controller/app/chat-app/messgae.controller.js";
import { verifyJWT } from "../../../src/middlewares/auth.middleware.js";
import { upload } from "../../../src/middlewares/multer.middleware.js";

const router=Router()
router.use(verifyJWT);

router.route("/messages/:chatId").get(getAllMessages)
.post(
    upload.fields([{name:"attachments",maxCount:5}]),
    sendMessage);
export default router;