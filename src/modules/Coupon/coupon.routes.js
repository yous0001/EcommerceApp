import { Router } from "express";
import { auth } from "../../middlewares/auth.middleware.js";
import * as couponController from './coupon.controller.js'
import { endPointsRoles } from "./coupon.endpoints.js";
import expressAsyncHandler from "express-async-handler";
import { validationMiddleware } from "../../middlewares/validation.middleware.js";
import * as validators from "./coupon.validationSchemas.js";

const router=Router()

router.post('/add',validationMiddleware(validators.addCouponSchema),auth(endPointsRoles.addCoupon),expressAsyncHandler(couponController.addCoupon))

router.put('/update/:couponId',validationMiddleware(validators.updateCouponSchema),auth(endPointsRoles.addCoupon),expressAsyncHandler(couponController.updateCoupon))


router.post('/validate',auth(),expressAsyncHandler(couponController.validateCouponApi))

router.put('/enableOrDisable',auth(endPointsRoles.addCoupon),expressAsyncHandler(couponController.enableDisableCoupon))
router.get('/validCoupons',expressAsyncHandler(couponController.getEnabledCoupons))
router.get('/disabledCoupons',expressAsyncHandler(couponController.getDisabledCoupons))

router.get('/couponById/:couponId',expressAsyncHandler(couponController.getCouponById))

router.get('/',expressAsyncHandler(couponController.getCoupons))

export default router