import { Router } from 'express'
import { auth } from '../../middlewares/auth.middleware.js'
import { multerMiddleHost } from '../../middlewares/multer.js'
import expressAsyncHandler from 'express-async-handler'
import { allowedExtensions } from '../../utils/allowed-extensions.js'
import * as brandcontroller from './brand.controller.js'
import { endPointsRoles } from './brand.endpointsRoles.js'

const router = Router()


router.post('/',auth(endPointsRoles.add_brand),multerMiddleHost({extentions:allowedExtensions.image}).single('image')
,expressAsyncHandler(brandcontroller.addBrand))

router.get('/',expressAsyncHandler(brandcontroller.getBrands))

router.get('/brandsforcategory/:categoryId',expressAsyncHandler(brandcontroller.getBrandsForCategory))

router.get('/brandsforsubcategory/:subCategoryId',expressAsyncHandler(brandcontroller.getBrandsForSubCategory))

router.put('/:brandId',auth(endPointsRoles.add_brand),multerMiddleHost({extentions:allowedExtensions.image}).single('image'),expressAsyncHandler(brandcontroller.updateBrand))

router.delete('/:brandId',auth(endPointsRoles.add_brand),expressAsyncHandler(brandcontroller.deleteBrand))

export default router
