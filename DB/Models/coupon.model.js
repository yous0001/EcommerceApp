import mongoose from "mongoose"




const coupounSchema=new mongoose.Schema({
    couponCode:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        lowercase:true
    },
    couponAmount:{
        type:Number,
        required:true,
        min:1
    },
    couponStatus:{
        type:String,
        default:"valid",
        enum:["valid","expired","disabled"]
    },
    isFixed:{
        type:Boolean,
        default:false
    },
    isPercentage:{
        type:Boolean,
        default:false
    },
    fromDate:{
        type:String,
        required:true
    },
    toDate:{
        type:String,
        required:true
    },
    addedBy:{
        type:mongoose.Types.ObjectId,
        ref:'User',
        required:true
    },
    updatedBy:{
        type:mongoose.Types.ObjectId,
        ref:'User'
    },
    disableAt:String,
    disableBy:{
        type:mongoose.Types.ObjectId,
        ref:'User'
    },
    enableAt:String,
    enableBy:{
        type:mongoose.Types.ObjectId,
        ref:'User'
    }

},{timestamps:true})

export default mongoose.models.Coupoun|| mongoose.model('Coupon',coupounSchema)