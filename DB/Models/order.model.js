import mongoose from "mongoose";

const orderSchema=new mongoose.Schema({
    user:{
        type:mongoose.Types.ObjectId,
        required:true,
        ref:'User'
    },

    orderItems:[
        {
            title:{type:String,required:true},
            quantity:{type:Number,required:true},
            price:{type:Number,required:true},
            product:{type:mongoose.Types.ObjectId,required:true,ref:'Product'}
        }
    ],
    shippingAddress:{
        address:{type:String,required:true},
        country:{type:String,required:true},
        city:{type:String,required:true},
        postalCode:{type:String,required:true}
    },

    phoneNumbers:[
        {type:String,required:true}
    ],

    shippingPrice:{
        type:Number,
        required:true
    },//price subtotal
    coupon:{
        type:mongoose.Types.ObjectId,
        ref:'Coupon'
    },
    totalPrice:{
        type:Number,
        required:true
    },//final price=shippingprice -coupon (if it exists)

    paymentMethod:{
        type:String,
        enum:['cash','stripe','paymob'],
        required:true
    },
    orderStatus:{
        type:String,
        enum:['pending','paid','delivered','placed','cancelled','refunded'],
        default:'pending',
        required:true
    },

    isPaid:{
        type:Boolean,
        required:true,
        default:false
    },
    paidAt:{
        type:String
    },

    isDelivered:{
        type:Boolean,
        required:true,
        default:false
    },
    deliveredAt:{
        type:String
    },
    deliveredBy:{
        type:mongoose.Types.ObjectId,
        ref:'User'
    },

    cancelledAt:{
        type:String
    },
    cancelledBy:{
        type:mongoose.Types.ObjectId,
        ref:'User'
    },
    paymentIntent:String

},{
    timestamps:true
})


export default mongoose.models.Order||mongoose.model('Order',orderSchema)