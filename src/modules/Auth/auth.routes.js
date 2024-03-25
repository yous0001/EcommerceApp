
import { Router } from "express";
import * as authController from './auth.controller.js';
import expressAsyncHandler from "express-async-handler";
import { auth } from "../../middlewares/auth.middleware.js";
import { validationMiddleware } from "../../middlewares/validation.middleware.js";
import * as validators from './auth.validation.js'

const router = Router();


router.post('/',validationMiddleware(validators.signupSchema), expressAsyncHandler(authController.signUp))
router.get('/verify-email', expressAsyncHandler(authController.verifyEmail))


router.get('/getuser', auth(),expressAsyncHandler(authController.getUserData))
router.post('/login',validationMiddleware(validators.signinSchema), expressAsyncHandler(authController.signIn))
router.put('/update',validationMiddleware(validators.updateProfileUserSchema),auth(),expressAsyncHandler(authController.updateProfileUser))
router.delete('/delete',auth(),expressAsyncHandler(authController.deleteProfileUser))

router.get('/forgetPassword',expressAsyncHandler(authController.forgetPassword))
router.put('/resetPassword/:email',expressAsyncHandler(authController.resetPassword))
router.put('/updatePassword',auth(),expressAsyncHandler(authController.updatePassword))
router.put('/refreshToken',auth(),expressAsyncHandler(authController.refreshToken))

export default router;