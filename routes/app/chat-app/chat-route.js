import { Router } from "express";
import { searchAllusers} from "../../../src/controller/app/chat-app/chat.controller.js";
import { verifyJWT } from "../../../src/middlewares/auth.middleware.js";


const router=Router();
router.use(verifyJWT);

router.route("/allusers").get(searchAllusers);

export default router;