import { Router } from "express";
import { createOrGetOneOnOneChat, deleteOneOnOneChat, getAllchats, searchAllusers} from "../../../src/controller/app/chat-app/chat.controller.js";
import { verifyJWT } from "../../../src/middlewares/auth.middleware.js";


const router=Router();
router.use(verifyJWT);


router.route("/chats").get(getAllchats);
router.route("/allusers").get(searchAllusers);
router.route("/c/:receiverId").post(createOrGetOneOnOneChat)
router.route("/remove/:chatId").delete(deleteOneOnOneChat)
export default router;