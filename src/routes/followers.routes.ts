import { Router } from "express";
import * as followersController from "../controller/followers.controller";

const router = Router();

router.get("/", followersController.getAllUsers);
router.get("/:id", followersController.getFollowers);
router.get("/:id/following", followersController.getFollowing);
router.post("/:id/follow", followersController.follow);
router.delete("/:id/unfollow", followersController.unfollow);

router.get("/:id/:userId", followersController.isFollowing);

export default router;
