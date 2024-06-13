import { Router } from "express";
import * as eventsController from "../controller/events.controller";

const router = Router();

router.get("/", eventsController.all);
router.delete("/:id", eventsController.remove);
router.post("/", eventsController.create);
router.put("/:id", eventsController.update);

export default router;
