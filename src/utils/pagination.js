export const paginationFunc=({page=1,size=5})=>{
    if(page<1)page=1
    if(size<1)size=2

    const limit= +size
    const skip = (+page-1)*limit//the point i will start with

    return {limit,skip}
}