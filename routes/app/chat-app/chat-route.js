import { Router } from "express";
import { addNewParticipantsInGroup, createOrGetOneOnOneChat, deleteOneOnOneChat, deletegroupchat, getAllchats, getgroupdetails, leavegroup, removeParticipantsInGroup, renamegroupchat, searchAllusers} from "../../../src/controller/app/chat-app/chat.controller.js";
import { verifyJWT } from "../../../src/middlewares/auth.middleware.js";


const router=Router();
router.use(verifyJWT);


router.route("/chats").get(getAllchats);
router.route("/allusers").get(searchAllusers);
router.route("/c/:receiverId").post(createOrGetOneOnOneChat)
router.route("/remove/:chatId").delete(deleteOneOnOneChat)
router.route("/group/:chatId").get(getgroupdetails).patch(renamegroupchat).delete(deletegroupchat)
router.route("/group/:chatId/:participantId").post(addNewParticipantsInGroup).delete(removeParticipantsInGroup);
router.route("/leave/group/:chatId").delete(leavegroup);




export default router;

