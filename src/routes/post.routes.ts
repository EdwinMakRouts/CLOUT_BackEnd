import { Router } from "express";
import * as postController from "../controller/post.controller";

const router = Router();

router.post("/", postController.create);

router.get("/feed/:userId", postController.getAll);

router.get("/:id", postController.getById);
router.get("/:id/:userId", postController.getById);

router.post("/:userId", postController.getPosts);
router.put("/:id", postController.update);
router.delete("/:id", postController.remove);

router.post("/:id/like", postController.like);
router.post("/:id/unlike", postController.unlike);
router.post("/:userId/likes", postController.getLikes);

router.post("/:id/comments", postController.getComments);
router.post("/:id/comment", postController.comment);
router.delete("/:id/uncomment", postController.uncomment);

export default router;
