import Stripe from "stripe";
import couponModel from "../../DB/Models/coupon.model.js";



export const createCheckOutSession=async({customer_email,metadata,discounts,line_items})=>{

    const stripe=new Stripe(process.env.stripe_key)

    const paymentDate = await stripe.checkout.sessions.create({
        payment_method_types:['card'],
        mode:'payment',
        customer_email,
        metadata,
        success_url:process.env.success_url,
        cancel_url:process.env.cancel_url,
        discounts,
        line_items,
    });

    return paymentDate
}


export const createStripeCoupon=async(couponId)=>{
    const findCoupon=await couponModel.findById(couponId)
    if(!findCoupon) return {status:false,message:"coupon not found"}

    let couponObj={}
    if(findCoupon.isFixed){
        couponObj={
            name:findCoupon.couponCode,
            amount_off:findCoupon.couponAmount*100,
            currency:'EGP'
        }
    }

    if(findCoupon.isPercentage){
        couponObj={
            name:findCoupon.couponCode,
            percent_off:findCoupon.couponAmount
        }
    }
    
    const stripe=new Stripe(process.env.stripe_key)
    const stripeCoupon=await stripe.coupons.create(couponObj)

    return stripeCoupon
}

export const createPaymentMethod=async({token})=>{
    const stripe=new Stripe(process.env.stripe_key)
    const paymentMethod = await stripe.paymentMethods.create({
        type: 'card',
        card: {
          token
        },
      });
    return paymentMethod;
}

//create payment intent
export const createPaymentIntent=async({amount,currency})=>{
    const stripe=new Stripe(process.env.stripe_key)

    const paymentMethod=await createPaymentMethod({token:'tok_visa'})

    const paymentIntent = await stripe.paymentIntents.create({
    amount: amount*100,
    currency: currency,
    automatic_payment_methods:{
        enabled:true,
        allow_redirects:"never"
    },
    payment_method:paymentMethod.id
    });
    return paymentIntent
}

export const retrievePaymentIntent=async({paymentIntentId})=>{
    const stripe=new Stripe(process.env.stripe_key)
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

    return paymentIntent
}

export const confirmPaymentIntent=async({paymentIntentId})=>{
    const stripe=new Stripe(process.env.stripe_key)
    const paymentDetails=await retrievePaymentIntent({paymentIntentId})
    const paymentIntent = await stripe.paymentIntents.confirm(
        paymentIntentId,
        {
        payment_method: paymentDetails.payment_method
        }
    );
    return paymentIntent
}


export const refundPaymentIntent=async({paymentIntentId})=>{
    const stripe=new Stripe(process.env.stripe_key)
    const refund = await stripe.refunds.create({
        payment_intent:paymentIntentId
    });
    return refund
}