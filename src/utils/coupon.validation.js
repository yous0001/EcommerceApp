import { DateTime } from "luxon";
import couponModel from "../../DB/Models/coupon.model.js";
import couponUsersModel from "../../DB/Models/coupon-users.model.js";

export async function couponValidation(couponCode,userId){
    const coupon=await couponModel.findOne({couponCode})
    //check is coupon exists
    if(!coupon)return {message:"couponCode isn't valid",status:400}
    //check expiration
    if(coupon.couponStatus=="expired"||
    DateTime.fromISO(coupon.toDate) < DateTime.now()||coupon.couponStatus=="disabled") return {message:"coupon is expired or disabled",status:400}
    //check start date
    if(DateTime.fromISO(coupon.fromDate) > DateTime.now())return {message:"coupon hasn't start",status:400}
    //check user coupon
    const isUserAssigned=await couponUsersModel.findOne({couponId:coupon._id,userId})
    if(!isUserAssigned)return {message:"coupon not assigned for you",status:400}
    if(isUserAssigned.maxUsage<=isUserAssigned.usageCount)return {message:"you use this coupon more than usage limit",status:400}
    return coupon
}