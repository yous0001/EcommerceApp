import { calculateSubTotal } from "./calculate-subtotal.js";
import { checkProductInCart } from "./check-product-in-cart.js";

export async function updateProductQuantity(cart,productId,quantity){
    const isProductExistsInCart= await checkProductInCart(cart,productId)
    if(!isProductExistsInCart)return null

    cart?.products.forEach(product => {
        if(product.productId.toString()===productId){
            product.quantity=quantity;
            product.finalPrice=product.basePrice*quantity
        }
    });
    
    cart.subTotal=calculateSubTotal(cart.products)
    return await cart.save()
}