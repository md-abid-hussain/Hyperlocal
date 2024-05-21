import { Router } from "express";
import taskController from "../controllers/taskController";
import verifyJWT from '../middlewares/verifyJWT';
import allowedRole from "../middlewares/allowedRole";

const router = Router();

router.use(verifyJWT)

const userAllowed = allowedRole("USER")
const helperAllowed = allowedRole("HELPER")

router.route('/')
    .get(taskController.getAllTask)
    .post(userAllowed,taskController.createTask)
    .patch(userAllowed,taskController.updateTask)
    .delete(userAllowed,taskController.deleteTask)

router.route('/apply') 
    .post(helperAllowed,taskController.applyForTask)
    .delete(helperAllowed,taskController.cancelApplication)

router.route('/categories')
    .get(taskController.getAllTaskCategories)

export default router;