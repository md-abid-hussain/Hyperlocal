// src/routes/reviewRoutes.ts
import { Router } from "express";
import reviewController from "../controllers/reviewController";
import verifyJWT from "../middlewares/verifyJWT";

const router = Router()
router.use(verifyJWT)
router.route('/')
    .get(reviewController.getAllReviews)
    .post( reviewController.createReview)

router.route('/:reviewId')
    .get(reviewController.getReview)
    .patch( reviewController.updateReview)
    .delete( reviewController.deleteReview)

export default router;