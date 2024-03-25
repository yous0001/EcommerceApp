import { scheduleJob } from "node-schedule";
import couponModel from "../../DB/Models/coupon.model.js";
import {DateTime} from "luxon";
import orderModel from "../../DB/Models/order.model.js";

export function cronToChangeExpiredCoupons(){
    scheduleJob('0 0 0 * * *',async () =>{
        console.log("cronToChangeExpiredCoupons");
        const coupons= await couponModel.find({couponStatus:"valid"})
        for(const coupon of coupons){
            if(DateTime.fromISO(coupon.toDate) < DateTime.now()){
                coupon.couponStatus='expired'
                await coupon.save()
                console.log(coupon);
            }
        }
    })
}

export function cronToCancelOrder(){
    scheduleJob('0 0 0 * * *',async () =>{
        const orders= await orderModel.find({orderStatus:'pending'})
        for(const order of orders){
            if(DateTime.fromJSDate(order.createdAt).plus({days: 1}) < DateTime.now()){
                console.log(order._id);
                await orderModel.findByIdAndDelete(order._id)
            }
        }
    })
}