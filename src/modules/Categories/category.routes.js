import { Router } from "express"
import * as categorycontroller from './category.contoller.js'
import expressAsyncHandler from "express-async-handler"
import { multerMiddleHost } from "../../middlewares/multer.js"
import { allowedExtensions } from "../../utils/allowed-extensions.js"
import { auth } from "../../middlewares/auth.middleware.js"
import { endPointsRoles } from "./category.endpoints.js"


const router=Router()

router.post('/',auth(endPointsRoles.addcategory),multerMiddleHost({extentions:allowedExtensions.image}).single('image')
,expressAsyncHandler(categorycontroller.addcategory))

router.put('/update/:categoryId',auth(endPointsRoles.addcategory),multerMiddleHost({extentions:allowedExtensions.image}).single('image')
,expressAsyncHandler(categorycontroller.updateCategory))

router.delete('/delete/:categoryId',auth(endPointsRoles.addcategory)
,expressAsyncHandler(categorycontroller.deletecategory))

router.get('/',expressAsyncHandler(categorycontroller.getallcategories))

router.get('/getcategory/:_id',expressAsyncHandler(categorycontroller.getcategory))

export default router