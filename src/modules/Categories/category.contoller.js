import Category from '../../../DB/Models/category.model.js'
import slugify from 'slugify'
import cloudinaryConnection from '../../utils/cloudinary.js'
import generateUniqueString from '../../utils/generate-Unique-String.js'
import categoryModel from '../../../DB/Models/category.model.js'
import subCategoryModel from '../../../DB/Models/sub-category.model.js'
import brandModel from '../../../DB/Models/brand.model.js'
import { APIFeatures } from '../../utils/api-features.js'

export const addcategory=async(req,res,next)=>{
    const {name}=req.body
    const {_id}=req.authUser

    const isNameExists=await Category.findOne({name})
    if(isNameExists){
        return next(new Error("category name is already exists",{cause:409}))
    }
    const slug=slugify(name,'-')
    if(!req.file){
        return next(new Error("Image is required",{cause:404}))
    }
    const unique =generateUniqueString(5)
    const {secure_url,public_id}=await cloudinaryConnection().uploader.upload(req.file.path,{
        folder:`${process.env.main_folder}/Categories/${unique}`
    })
    req.folder=`${process.env.main_folder}/Categories/${unique}`
    const categoryobj={name,slug,Image:{secure_url,public_id},folderId:unique,addedBy:_id}
    const categoryCreated=await categoryModel.create(categoryobj)
    req.savedDocument={model:categoryModel,_id:categoryCreated._id}
    res.status(201).json({
        message:"category created",
        categoryCreated
    })
}


export const updateCategory=async(req,res,next)=>{
    const {name,oldPublicId}=req.body
    const {categoryId}=req.params
    const {_id}=req.authUser

    const category=await categoryModel.findById(categoryId)
    if(!category)return next(new Error("category not found",{cause:404}))
    if(name){
        if(name==category.name)return next(new Error("name hasn't change",{cause:404}));
        const isNameExists=await Category.findOne({name})
        if(isNameExists){
            return next(new Error("category name is already exists",{cause:409}))
        }
        category.name=name
        category.slug=slugify(name,'-')
        
    }
    if(oldPublicId){
        if(!req.file){
            return next(new Error("Image is required",{cause:404}))
        }
        const newpublic_id=oldPublicId.split(`${category.folderId}/`)[1]
        const {secure_url,public_id}=await cloudinaryConnection().uploader.upload(req.file.path,{
            folder:`${process.env.main_folder}/Categories/${category.folderId}`,
            public_id:newpublic_id
        })
        category.Image.secure_url=secure_url
    }
    category.updatedBy=_id

    await category.save()
    res.status(200).json({
        message:"category updated",
        category
    })
}

export const getallcategories=async(req,res,next)=>{
    const {page,size,sort,...search}=req.query

    const features=new APIFeatures(req.query,categoryModel.find()).search(search)
    .sort(sort).pagination({page,size})

    const categories=await features.mongooseQuery.populate(
        [
            {path:'subcategories',
            populate:[{
                path:'Brands'
            }]
        }
        ]
    )
    res.status(200).json({message:"done",categories})
}

export const deletecategory=async(req,res,next)=>{
    const {categoryId}=req.params
    const category=await Category.findByIdAndDelete(categoryId)
    if(!category)return next(new Error("category not found",{cause:404}))

    const subcategories=await subCategoryModel.deleteMany({categoryId})
    if(subcategories.deletedCount<0)
        console.log("no related subcategories");

    const brands=await brandModel.deleteMany({categoryId})
    if(brands.deletedCount<0)
        console.log("no related brands");
    
    await cloudinaryConnection().api.delete_resources_by_prefix(`${process.env.main_folder}/Categories/${category.folderId}`)
    await cloudinaryConnection().api.delete_folder(`${process.env.main_folder}/Categories/${category.folderId}`)
    
    res.status(200).json({message:"category deleted success"})
}

export const getcategory=async(req,res,next)=>{
    const {_id}=req.params
    
    const category=await categoryModel.findById(_id)
    if(!category)return next("category not found",{cause:404})
    res.status(200).json({message:"done",category})
}
