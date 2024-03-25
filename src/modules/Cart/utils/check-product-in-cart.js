
export const checkProductInCart=async(userCart,productId)=>{
    return userCart.products.some(
        (product) => product.productId.toString()=== productId
    )
}

