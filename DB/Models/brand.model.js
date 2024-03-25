import mongoose, { Schema, model } from "mongoose"


const brandSchema=new Schema({
    name:{
        type:String,
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
    updatedBy:{type:Schema.Types.ObjectId,ref:'User'},
    subCategoryId:{type:Schema.Types.ObjectId,ref:'SubCategory',required:true},
    categoryId:{type:Schema.Types.ObjectId,ref:'Category',required:true}
},{
    timestamps:true
})

export default mongoose.models.Brand || model('Brand',brandSchema)