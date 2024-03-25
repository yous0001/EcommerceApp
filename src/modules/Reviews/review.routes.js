import { Router } from "express";
import { auth } from "../../middlewares/auth.middleware.js";
import * as reviewController from './review.controller.js'
import expressAsyncHandler from "express-async-handler";
import { validationMiddleware } from "../../middlewares/validation.middleware.js";
import { reviewApisRoles } from "./review.endpoints.js";
import { addReviewSchema } from "./review.validation.js";

const router =Router()

router.post('/',auth(reviewApisRoles.addReview),validationMiddleware(addReviewSchema),expressAsyncHandler(reviewController.addreview))

router.get('/productReviews/:productId',expressAsyncHandler(reviewController.getReviewsForProduct))

router.delete('/',auth(reviewApisRoles.addReview),expressAsyncHandler(reviewController.deletereview))

export default router