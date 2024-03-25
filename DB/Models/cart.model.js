import mongoose, { Schema, model } from "mongoose"



const cartSchema=new Schema({
    userId:{
        type:mongoose.Types.ObjectId,
        ref:'User',
        required:true
    },
    products:[
        {
            productId:{
                type:mongoose.Types.ObjectId,
                ref:'Product',
                required:true
            },
            quantity:{
                type:Number,
                required:true,
                default:1
            },
            basePrice:{
                type:Number,
                required:true,
                default:0
            },
            finalPrice:{
                type:Number,
                required:true
            },
            title:{
                type:String,
                required:true
            }
        }
    ],
    subTotal:{
        type:Number,
        required:true,
        default:0
    },


},{
    timestamps:true
})

export default mongoose.model.Cart||model('Cart',cartSchema)