import cartModel from "../../../DB/Models/cart.model.js"
import productModel from "../../../DB/Models/product.model.js"
import { pushNewProductToCart } from "./utils/add-product-to-cart.js"
import { calculateSubTotal } from "./utils/calculate-subtotal.js"
import { checkProductInCart } from "./utils/check-product-in-cart.js"
import { checkProductAvaliability } from "./utils/check-product.js"
import { createCart } from "./utils/create-cart.js"
import { updateProductQuantity } from "./utils/update-product-quantity.js"

export const addProductToCart=async(req,res,next)=>{
    const {productId,quantity}=req.body
    const {_id}=req.authUser

    const product=await checkProductAvaliability(productId,quantity)
    if(!product)return next(new Error("product isn't available",{cause:400}))

    const userCart =await cartModel.findOne({userId:_id})
    //user doesn't have cart
    if(!userCart){
        const newCart=await createCart(_id,product,quantity)
        res.status(201).json({success:true,message:"product added to cart succefully",data:newCart})
    }
    //user has cart
    //if cart has this product

    const isUpdated=await updateProductQuantity(userCart,productId,quantity) 
    if(!isUpdated){
        const added=await pushNewProductToCart(userCart,product,quantity)
        if(!added)return next(new Error("product can't add to cart",{cause:400}))
    }
    
    res.status(200).json({success:true,message:"product added succefully to cart",data:userCart})

    
}

export const removeFromCart=async(req,res,next)=>{
    const {productId}=req.params
    const {_id}=req.authUser

    const userCart =await cartModel.findOne({userId:_id,'products.productId':productId})
    if(!userCart)return next(new Error("product not found in cart"))

    userCart.products=userCart.products.filter((product)=>{
        return product.productId.toString()!==productId
    })
    userCart.subTotal=calculateSubTotal(userCart.products)

    const newCart=await userCart.save()
    
    if(newCart.products.length===0){
        await cartModel.findByIdAndDelete(newCart._id)
    }
    res.status(200).json({message:"product removed successfully"})
}

