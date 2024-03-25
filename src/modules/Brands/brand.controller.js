import slugify from "slugify"
import brandModel from "../../../DB/Models/brand.model.js"
import subCategoryModel from "../../../DB/Models/sub-category.model.js"
import cloudinaryConnection from "../../utils/cloudinary.js"
import generateUniqueString from "../../utils/generate-Unique-String.js"
import { APIFeatures } from '../../utils/api-features.js'

export const addBrand=async(req,res,next)=>{
    const {name}=req.body
    const {subCategoryId,categoryId}=req.query
    const {_id}=req.authUser

    const SubCategory=await subCategoryModel.findById(subCategoryId).populate('categoryId','folderId')
    if(!SubCategory)return next(new Error("subcategory not found",{cause:404}))
    
    const isBrandexists=await brandModel.findOne({name,subCategoryId})
    if(isBrandexists)return next(new Error("name is already exists",{cause:409}))

    if(categoryId!=SubCategory.categoryId._id)return next(new Error("category not found",{cause:404}))
    
    const slug=slugify(name,'-')
    if(!name)return next(new Error("name is reqired",{cause:404}))
    //upload image
    
    if(!req.file)return next(new Error("image is reqired",{cause:404}))
    const folderId =generateUniqueString(5)
    const {secure_url,public_id}=await cloudinaryConnection().uploader.upload(req.file.path,{
        folder:`${process.env.main_folder}/Categories/${SubCategory.categoryId.folderId}/SubCategories/${SubCategory.folderId}/Brands/${folderId}`
    })
    const brandobj={name,slug,subCategoryId,categoryId,addedBy:_id,Image:{secure_url,public_id},folderId}
    const brandcreated=await brandModel.create(brandobj)
    if(!brandcreated)return next(new Error("creation failed",{cause:400}))
    res.status(201).json({message:"brand created succefully",brandcreated})
}

export const updateBrand=async(req,res,next)=>{
    const {name,oldPublicId}=req.body
    const {_id}=req.authUser
    const {brandId}=req.params

    const Brand = await brandModel.findById(brandId).populate([{path:'categoryId'},{path:'subCategoryId'}])
    if(!Brand)return next(new Error("Brand not found",{cause:404}))
    if(Brand.addedBy!=_id)return next(new Error("only user creator can update Brand",{cause:401}))
    if(name){
        const isNameExists=await brandModel.findOne({name})
        if(isNameExists){
            return next(new Error("brand name is already exists",{cause:409}))
        }
        Brand.name=name
        Brand.slug=slugify(name,'-')
    }

    if(oldPublicId){
        if(!req.file){
            return next(new Error("Image is required",{cause:404}))
        }
        const newpublic_id=oldPublicId.split(`${Brand.folderId}/`)[1]
        const {secure_url,public_id}=await cloudinaryConnection().uploader.upload(req.file.path,{
            folder:`${process.env.main_folder}/Categories/${Brand.categoryId.folderId}/SubCategories/${Brand.subCategoryId.folderId}/Brands/${Brand.folderId}`,
            public_id:newpublic_id
        })
        Brand.Image.secure_url=secure_url
    }
    Brand.updatedBy=_id

    await Brand.save()
    res.status(200).json({
        message:"subCategory updated",
        Brand
    })
}

export const deleteBrand=async(req,res,next)=>{
    const {_id}=req.authUser
    const {brandId}=req.params

    const Brand = await brandModel.findById(brandId).populate([{path:'categoryId'},{path:'subCategoryId'}])
    if(!Brand)return next(new Error("Brand not found",{cause:404}))

    await cloudinaryConnection().api.delete_resources_by_prefix(`${process.env.main_folder}/Categories/${Brand.categoryId.folderId}/SubCategories/${Brand.subCategoryId.folderId}/Brands/${Brand.folderId}`)
    await cloudinaryConnection().api.delete_folder(`${process.env.main_folder}/Categories/${Brand.categoryId.folderId}/SubCategories/${Brand.subCategoryId.folderId}/Brands/${Brand.folderId}`)
    
    const deletedBrand = await brandModel.findByIdAndDelete(brandId)
    res.status(200).json({message:"deleted success"})
}

export const getBrands=async(req,res,next)=>{
    const {page,size,sort,...search}=req.query

    const features=new APIFeatures(req.query,brandModel.find()).search(search)
    .sort(sort).pagination({page,size})

    const brands=await features.mongooseQuery
    
    res.status(200).json({message:"done",brands})
    
}

export const getBrandsForCategory=async(req,res,next)=>{
    const {categoryId}=req.params

    const brands=await brandModel.find({categoryId})

    res.status(200).json({success:true,brands})
}


export const getBrandsForSubCategory=async(req,res,next)=>{
    const {subCategoryId}=req.params

    const brands=await brandModel.find({subCategoryId})

    res.status(200).json({success:true,brands})
}