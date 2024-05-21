import { Router } from "express";
import helperController from "../controllers/helperController";
import verifyJWT from "../middlewares/verifyJWT";

const router = Router()

router.route('/')
    .get(helperController.getAllHelper)
    .post(helperController.createHelper)
    .patch(verifyJWT,helperController.updateHelper)
    .delete(verifyJWT,helperController.deleteHelper)

export default router;