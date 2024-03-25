import { Router } from "express";
import * as orderController from './order.controller.js'
import { systemRoles } from "../../utils/system-roles.js";
import expressAsyncHandler from "express-async-handler";
import { auth } from "../../middlewares/auth.middleware.js";
import { validationMiddleware } from "../../middlewares/validation.middleware.js";
import * as validators from './order.validationSchemas.js'
const router=Router()

router.post(
    '/',
    validationMiddleware(validators.createOrderSchema),
    auth([systemRoles.USER]),
    expressAsyncHandler(orderController.createOrder)
)
router.post(
    '/cartToOrder',
    validationMiddleware(validators.makeOrderByCartSchema),
    auth([systemRoles.USER]),
    expressAsyncHandler(orderController.makeOrderByCart)
)

router.put('/deliver/:orderId',auth([systemRoles.DELIVERY]),expressAsyncHandler(orderController.deliverorder));

router.post('/stripePay/:orderId',auth([systemRoles.USER]),expressAsyncHandler(orderController.paymentWithStripe));

router.post('/webhook',expressAsyncHandler(orderController.stripeWebHookLocal));

router.post('/refund/:orderId',auth([systemRoles.SUPER_ADMIN,systemRoles.ADMIN]),expressAsyncHandler(orderController.refundOrder));



export default router