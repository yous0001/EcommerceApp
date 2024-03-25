import cartModel from "../../../../DB/Models/cart.model.js"

export const createCart=async(userId,product,quantity)=>{ 
    const cartObj={
        userId,
        products:[
            {
                productId:product._id,
                quantity,
                basePrice:product.appliedPrice,
                finalPrice:product.appliedPrice*quantity,
                title:product.title
            }
        ],
        subTotal:product.appliedPrice*quantity
    }
    const newCart=await cartModel.create(cartObj)
    return newCart
}