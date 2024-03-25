import productModel from "../../../../DB/Models/product.model.js"

export const checkProductAvaliability=async(productId,quantity)=>{
    const product=await productModel.findById(productId)
    if(product.stock<quantity||!product)return null
    return product
}


