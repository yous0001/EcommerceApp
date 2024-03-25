import mongoose, { Schema, model } from "mongoose"


const categorySchema=new Schema({
    name:{
        type:String,
        unique:true,
        reqired:true,
        trim:true
    },
    slug:{
        type:String,
        unique:true,
        reqired:true,
        trim:true
    },
    Image:{
        secure_url:{type:String,reqired:true},
        public_id:{type:String,unique:true,required:true} 
    },
    folderId:{type:String,unique:true,required:true},
    addedBy:{type:Schema.Types.ObjectId,ref:'User',required:true},
    updatedBy:{type:Schema.Types.ObjectId,ref:'User'}
    
},{
    timestamps:true,
    toJSON:{virtuals:true}
})

categorySchema.virtual('subcategories',{
    ref:'SubCategory',
    localField:'_id',
    foreignField:'categoryId'
})

export default mongoose.models.Category || model('Category',categorySchema)