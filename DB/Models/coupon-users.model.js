import mongoose from "mongoose";

const coupounUsersSchema=new mongoose.Schema({
    couponId:{
        type:mongoose.Types.ObjectId,
        ref:'Coupon',
        required:true
    },
    userId:{
        type:mongoose.Types.ObjectId,
        ref:'User',
        required:true
    },
    maxUsage:{
        type:Number,
        min:1,
        required:true
    },
    usageCount:{
        type:Number,
        default:0
    },

},{ 
    timestamps:true
})

export default mongoose.models.CouponUsers||mongoose.model('CouponUsers',coupounUsersSchema)