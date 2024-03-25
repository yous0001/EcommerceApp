export function calculateSubTotal(products){
    let subTotal=0
        for(const product of products){
            subTotal+=product.finalPrice
        }
        return subTotal
}