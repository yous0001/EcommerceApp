import Stripe from "stripe";
import orderModel from "../DB/Models/order.model.js"
import userModel from "../DB/Models/user.model.js"
import db_connection from "../DB/connection.js"
import { globalResponse } from "./middlewares/global-response.middleware.js"
import { rollbackSavedDocuments } from "./middlewares/rollback-saved.middleware.js"
import { rollbackMiddleware } from "./middlewares/rollback-uploads.middleware.js"


import * as  routers from './modules/index.routes.js'
import { cronToCancelOrder, cronToChangeExpiredCoupons} from "./utils/crons.js"



export const initiateApp = (app, express) => {

    const port = process.env.PORT

    app.use(express.json())

    db_connection()
    app.use('/auth', routers.authRouter)
    app.use('/user', routers.userRouter)
    app.use('/category', routers.categoryRouter)
    app.use('/subcategory', routers.subCategoryRouter)
    app.use('/brand', routers.brandRouter)
    app.use('/product', routers.productRouter)
    app.use('/cart', routers.cartRouter)
    app.use('/coupon', routers.couponRouter)
    app.use('/order',routers.orderRouter)
    app.use('/review',routers.reviewRouter)
    app.use('*',(req,res,next)=>{
        res.status(404).json({message:"not found"})
    })

    app.use(globalResponse,rollbackMiddleware,rollbackSavedDocuments)

    cronToChangeExpiredCoupons()
    cronToCancelOrder()
    
    app.get('/', (req, res) => res.send('Hello World!'))
    app.listen(port, () => console.log(`Example app listening on port ${port}!`))

}