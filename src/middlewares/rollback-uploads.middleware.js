import cloudinaryConnection from "../utils/cloudinary.js";


export const rollbackMiddleware=async(req,res,next)=>{
    if(req.folder){
        console.log("rollback uploads");
        await cloudinaryConnection().api.delete_resources_by_prefix(req.folder)
        await cloudinaryConnection().api.delete_folder(req.folder)
    }
    next()
}