import { DateTime } from "luxon"
import couponUsersModel from "../../../DB/Models/coupon-users.model.js"
import couponModel from "../../../DB/Models/coupon.model.js"
import userModel from "../../../DB/Models/user.model.js"
import { couponValidation } from "../../utils/coupon.validation.js"
import { APIFeatures } from "../../utils/api-features.js"


export const addCoupon=async(req,res,next)=>{
    const {couponCode,couponAmount,isFixed,isPercentage,fromDate,toDate,Users}=req.body
    const {_id:addedBy}=req.authUser

    const isCouponExists=await couponModel.findOne({couponCode})
    if(isCouponExists)return next(new Error("coupon is already exists",{cause:409}))
    if(isFixed===isPercentage)return next(new Error("coupon can be either fixed or percentage",{cause:400}))

    if(isPercentage&&couponAmount>100)return next(new Error("coupon can't be more than 100%",{cause:400}))
    if(couponAmount<=0)return next(new Error("coupon amount can't be less than or equal 0",{cause:400}))
    const couponobj={
        couponCode,
        couponAmount,
        isFixed,
        isPercentage,
        fromDate,
        toDate,
        addedBy
    }
    const coupon=await couponModel.create(couponobj)

    const userIds=[]
    for( const user of Users){
        userIds.push(user.userId)
    }
    const isUserExists=await userModel.find({_id:{$in:userIds}})
    if(isUserExists.length!==Users.length){
        return next(new Error("User not found",{cause:404}))
    }

    const couponUsers=await couponUsersModel.create(Users.map((user)=>{
        return {...user,couponId:coupon._id}
    }))
    res.status(201).json({success:true,message:"coupon has sucessfully added",coupon,couponUsers})
}


export const validateCouponApi=async(req,res,next)=>{
    const {couponCode}=req.body
    const {_id:userId}=req.authUser

    const isCouponValid=await couponValidation(couponCode,userId)
    if(isCouponValid.status){
        return next(new Error(isCouponValid.message,{cause:couponCode.status}))
    }
    res.status(200).json({message:"coupon is valid",coupon:isCouponValid})
}



export const enableDisableCoupon=async(req,res,next)=>{
    const {couponCode} =req.body
    const {_id:userId,role}=req.authUser
    //i was able to add one more status(enable,disable) but i prefer to modify coupon status to be valid/expired/disable
    //that will help us to reduce storage and know if coupon has disable by someone or expried because of date

    if(!couponCode)return next(new Error("please send couponcode"),{cause:404}) 

    const coupon=await couponModel.findOne({couponCode})
    
    if(!coupon)return next(new Error("couponcode not found"),{cause:404})
    if(role=="admin"&&coupon.addedBy.toString()!=userId.toString())return next(new Error("you are not authorized"),{cause:401})
    
    if(coupon.couponStatus=="expired"||
    DateTime.fromISO(coupon.toDate) < DateTime.now())return next(new Error("coupon is expired you should update date first"),{cause:400})

    if(coupon.couponStatus=="disabled"){
        coupon.couponStatus="valid"
        coupon.enableBy=userId
        coupon.enableAt=DateTime.now().toFormat('yyyy-MM-dd HH:mm:ss')
        await coupon.save()
        return res.status(200).json({message:"coupon has been enabled",coupon})
    }
    coupon.couponStatus="disabled"
    coupon.disabledBy=userId
    coupon.disabledAt=DateTime.now().toFormat('yyyy-MM-dd HH:mm:ss')
    await coupon.save()
    return res.status(200).json({message:"coupon has been disabled",coupon})
}

export const getEnabledCoupons=async(req,res,next)=>{
    const coupons=await couponModel.find({couponStatus:"valid"})
    res.status(200).json({message:"done",coupons})
}

export const getDisabledCoupons=async(req,res,next)=>{
    const coupons=await couponModel.find({couponStatus:"disabled"})
    res.status(200).json({message:"done",coupons})
}

export const getCouponById=async(req,res,next)=>{
    const {couponId}=req.params
    
    const coupon=await couponModel.findById(couponId)
    if(!coupon)return next(new Error("coupon not found"),{cause:404})

    res.status(200).json({message:"done",coupon})
}

export const getCoupons=async(req,res,next)=>{
    const {page,size,sort,...search}=req.query

    const features=new APIFeatures(req.query,couponModel.find()).search(search)
    .sort(sort).pagination({page,size})

    const coupons=await features.mongooseQuery

    res.status(200).json({message:"done",coupons})
}

export const updateCoupon=async(req,res,next)=>{
    const {newCouponCode,couponAmount,fromDate,toDate,isFixed,isPercentage}=req.body
    const {couponId}=req.params
    const {_id:userId,role}=req.authUser

    const coupon=await couponModel.findById(couponId)
    if(!coupon)return next(new Error("coupon not found",{cause:404}))
    if(role=="admin"&&coupon.addedBy.toString()!=userId.toString())return next(new Error("you are not authorized"),{cause:401})

    if(newCouponCode){
        const isCouponExists=await couponModel.findOne({newCouponCode})
        if(isCouponExists)return next(new Error("new couponname is already exists",{cause:409}))
        coupon.couponCode=newCouponCode
    }
    if(isFixed===isPercentage)return next(new Error("coupon can be either fixed or percentage",{cause:400}))
    if(isFixed){
        coupon.isFixed=true
        coupon.isPercentage=false
        if(couponAmount){
            if(couponAmount<=0)return next(new Error("coupon amount can't be less than or equal 0",{cause:400}))
            coupon.couponAmount=couponAmount
        }
    }
    if(isPercentage){
        coupon.isFixed=false
        coupon.isPercentage=true
        if(couponAmount){
            if(couponAmount>100)return next(new Error("coupon can't be more than 100%",{cause:400}))
            if(couponAmount<=0)return next(new Error("coupon amount can't be less than or equal 0",{cause:400}))
            coupon.couponAmount=couponAmount
        }
        else if(coupon.couponAmount>100)return next(new Error("coupon can't be more than 100%",{cause:400}))
    }
    
    if(fromDate)coupon.fromDate=fromDate
    if(toDate)coupon.toDate

    coupon.updatedBy=userId
    await coupon.save()

    res.status(200).json({message:"updated done successfully",coupon})
}