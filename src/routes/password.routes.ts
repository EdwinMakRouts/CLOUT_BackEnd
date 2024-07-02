import { Router } from "express";
import * as passwordController from "../controller/password.controller";

const router = Router();

router.post("/forgot", passwordController.forgot);
router.post("/reset", passwordController.reset);

export default router;
