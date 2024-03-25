import orderModel from "../../../DB/Models/order.model.js"
import productModel from "../../../DB/Models/product.model.js"
import reviewModel from "../../../DB/Models/review.model.js"

export const addreview=async(req,res,next)=>{
    const userId=req.authUser._id
    const {productId}=req.query
    const {reviewRate,reviewComment}=req.body

    const isProductValidToReview=await orderModel.findOne({
        user:userId,
        'orderItems.product':productId,
        orderStatus:'delivered'
    })
    if(!isProductValidToReview)return next(new Error("you should buy product first",{cause:400}))
    const reviewObj={
        userId,
        productId,
        reviewComment,
        reviewRate
    }
    const review=await reviewModel.create(reviewObj)
    if(!review){
        return next(new Error("failed to add review",{cause:500}))
    }
    const product=await productModel.findById(productId)
    const reviews=await reviewModel.find({productId})
    let sumOfRates=0
    for(const review of reviews){
        sumOfRates+=review.reviewRate
    }
    product.rate=Number(sumOfRates/reviews.length).toFixed(2)
    await product.save()
    res.status(201).json({message:"Done",review})
}

export const getReviewsForProduct=async(req,res,next)=>{
    const {productId}=req.params
    const reviews=await reviewModel.find({productId})

    res.status(200).json({message:"done",reviews})
}

export const deletereview=async(req,res,next)=>{
    const userId=req.authUser._id
    const {productId}=req.query

    const deletedreview=await reviewModel.findOneAndDelete({userId,productId})
    if(!deletedreview)return next(new Error("deletion failed",{cause:500}))

    const product=await productModel.findById(productId)
    const reviews=await reviewModel.find({productId})
    
    let sumOfRates=0
    for(const review of reviews){
        sumOfRates+=review.reviewRate
    }
    product.rate=Number(sumOfRates/reviews.length).toFixed(2)
    await product.save()

    res.status(201).json({message:"Done"})
}