import { calculateSubTotal } from "./calculate-subtotal.js"

export async function pushNewProductToCart(cart,product,quantity){
        cart?.products.push({
            productId:product._id,
            quantity,
            basePrice:product.appliedPrice,
            finalPrice:product.appliedPrice*quantity,
            title:product.title
        }) 
        cart.subTotal=calculateSubTotal(cart.products)
        return await cart.save()
}