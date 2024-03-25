import slugify from 'slugify'
import categoryModel from '../../../DB/Models/category.model.js'
import subCategoryModel from '../../../DB/Models/sub-category.model.js'
import generateUniqueString from '../../utils/generate-Unique-String.js'
import cloudinaryConnection from '../../utils/cloudinary.js'
import brandModel from '../../../DB/Models/brand.model.js'
import { APIFeatures } from '../../utils/api-features.js'


export const addSubCategory=async(req,res,next)=>{
    const {name}=req.body
    const {_id}=req.authUser
    const {categoryId}=req.params

    const isNameExists=await subCategoryModel.findOne({name})
    if(isNameExists){
        return next(new Error("SubCategory name is already exists",{cause:409}))
    }
    const category =await categoryModel.findById(categoryId)
    if(!category)return next(new Error("category not found",{cause:404}))

    const slug=slugify(name,'-')
    if(!req.file){
        return next(new Error("Image is required",{cause:404}))
    }
    const unique =generateUniqueString(5)
    const {secure_url,public_id}=await cloudinaryConnection().uploader.upload(req.file.path,{
        folder:`${process.env.main_folder}/Categories/${category.folderId}/SubCategories/${unique}`
    })
    const subcategoryobj={name,slug,Image:{secure_url,public_id},folderId:unique,addedBy:_id,categoryId}

    const SubcategoryCreated=await subCategoryModel.create(subcategoryobj)
    res.status(201).json({
        message:"SubCategory created",
        SubcategoryCreated
    })
}


export const updatesubCategory=async(req,res,next)=>{
    const {name,oldPublicId}=req.body
    const {_id}=req.authUser
    const {subCategoryId}=req.params

    const subCategory = await subCategoryModel.findById(subCategoryId)
    if(!subCategory)return next(new Error("SubCategory not found",{cause:404}))
    if(subCategory.addedBy!=_id)return next(new Error("only user creator can update subcategory",{cause:401}))//extra feature
    if(name){
    const isNameExists=await subCategoryModel.findOne({name})
    if(isNameExists){
        return next(new Error("SubCategory name is already exists",{cause:409}))
    }
    subCategory.name=name
    subCategory.slug=slugify(name,'-')
    }

    if(oldPublicId){
        if(!req.file){
            return next(new Error("Image is required",{cause:404}))
        }
        const category =await categoryModel.findById(subCategory.categoryId)
        const newpublic_id=oldPublicId.split(`${subCategory.folderId}/`)[1]
        const {secure_url,public_id}=await cloudinaryConnection().uploader.upload(req.file.path,{
            folder:`${process.env.main_folder}/Categories/${category.folderId}/SubCategories/${subCategory.folderId}`,
            public_id:newpublic_id
        })
        subCategory.Image.secure_url=secure_url
    }
    subCategory.updatedBy=_id

    await subCategory.save()
    res.status(200).json({
        message:"subCategory updated",
        subCategory
    })
}


export const deletesubCategory=async(req,res,next)=>{
    const {_id}=req.authUser
    const {subCategoryId}=req.params

    const subCategory = await subCategoryModel.findById(subCategoryId).populate('categoryId','folderId')
    if(!subCategory)return next(new Error("SubCategory not found",{cause:404}))
    if(subCategory.addedBy!=_id)return next(new Error("only user creator can remove subcategory",{cause:401}))//extra feature

    const brands=await brandModel.deleteMany({subCategoryId})
    if(brands.deletedCount<0)
        console.log("no related brands");

    await cloudinaryConnection().api.delete_resources_by_prefix(`${process.env.main_folder}/Categories/${subCategory.categoryId.folderId}/SubCategories/${subCategory.folderId}`)
    await cloudinaryConnection().api.delete_folder(`${process.env.main_folder}/Categories/${subCategory.categoryId.folderId}/SubCategories/${subCategory.folderId}`)

    const deletedSubcategory = await subCategoryModel.findByIdAndDelete(subCategoryId)
    if(!deletedSubcategory)return next(new Error("deletion failed",{cause:400}))
    res.status(200).json({message:"deleted success"})

}

export const getallsubcategories=async(req,res,next)=>{
    const {page,size,sort,...search}=req.query

    const features=new APIFeatures(req.query,subCategoryModel.find()).search(search)
    .sort(sort).pagination({page,size})
    const subcategories=await features.mongooseQuery
    
    res.status(200).json({success:true,subcategories})
}

export const getsubcategoriesForCategory=async(req,res,next)=>{
    const {categoryId}=req.params
    const subcategories=await subCategoryModel.find({categoryId})
    res.status(200).json({message:"done",subcategories})
}

export const getsubcategory=async(req,res,next)=>{
    const {_id}=req.params
    const subcategory=await subCategoryModel.findById(_id)
    res.status(200).json({message:"done",subcategory})
}