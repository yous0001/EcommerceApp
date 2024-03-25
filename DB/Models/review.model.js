import mongoose from "mongoose";

const reviewSchema= new mongoose.Schema({
    userId:{
        type:mongoose.Types.ObjectId,
        ref:'User',
        required:true
    },
    productId:{
        type:mongoose.Types.ObjectId,
        ref:'Product',
        required:true
    },
    reviewRate:{
        type:Number,
        required:true,
        default:0,
        min:1,
        max:5,
        enum:[1,2,3,4,5]
    },
    reviewComment:String
},{
    timestamps:true
})

export default  mongoose.models.Review || mongoose.model('Review',reviewSchema)