import mongoose, { Schema, model } from "mongoose"


const subCategorySchema=new Schema({
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
    updatedBy:{type:Schema.Types.ObjectId,ref:'User'},
    categoryId:{type:Schema.Types.ObjectId,ref:'Category',required:true}
},{
    timestamps:true,
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
})
subCategorySchema.virtual('Brands',{
    ref:'Brand',
    localField:"_id",
    foreignField:"subCategoryId"
})

export default mongoose.models.SubCategory || model('SubCategory',subCategorySchema)