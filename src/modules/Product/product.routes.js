import { Router } from "express";
import { multerMiddleHost } from "../../middlewares/multer.js";
import { allowedExtensions } from "../../utils/allowed-extensions.js";
import expressAsyncHandler from "express-async-handler";
import * as productController from "./product.controller.js"
import { auth } from "../../middlewares/auth.middleware.js";
import { endPointsRoles } from "./product.endpoints.js";

const router=Router()

router.post('/',
    auth(endPointsRoles.ADD_PRODUCT),
    multerMiddleHost({extensions:allowedExtensions.image}).array('images',5),
    expressAsyncHandler(productController.addProduct)
    )
router.put('/:productId',
    auth(endPointsRoles.ADD_PRODUCT),
    multerMiddleHost({extensions:allowedExtensions.image}).single('image'),
    expressAsyncHandler(productController.updateProduct)
    )
router.get('/',
    expressAsyncHandler(productController.getAllProducts))

router.get('/getProduct/:productId',
    expressAsyncHandler(productController.getProductWithReviews))

    

export default router