
export const rollbackSavedDocuments=async (req,res,next)=>{
    console.log("savedDocument",req.savedDocument);
    if(req.savedDocument){
        const {model,_id}=req.savedDocument
        await model.findByIdAndDelete(_id)
    }
}       