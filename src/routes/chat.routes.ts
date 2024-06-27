import { Router } from "express";
import * as chatController from "../controller/chat.controller";

const router = Router();

router.get("/:id", chatController.getChatsOfUser);
router.post("/", chatController.createMessage);
router.delete("/:id", chatController.deleteMessage);
router.put("/:id/:chatId", chatController.updateLastConnection);
router.get("/:id/:chatId", chatController.isThereNewMessagesInChat);

export default router;
