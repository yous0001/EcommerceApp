import slugify from "slugify"
import brandModel from "../../../DB/Models/brand.model.js"
import { systemRoles } from "../../utils/system-roles.js"
import cloudinaryConnection from "../../utils/cloudinary.js"
import generateUniqueString from "../../utils/generate-Unique-String.js"
import productModel from "../../../DB/Models/product.model.js"
import { APIFeatures } from "../../utils/api-features.js"


export const addProduct=async(req,res,next)=>{
    //data we need
    const {title,description,stock,basePrice,discount,specifications}=req.body
    const {brandId,categoryId,subCategoryId}=req.query
    const addedBy=req.authUser._id
    
    //check brand
    const brand=await brandModel.findById(brandId)
    if(!brand){
        return next(new Error("brand isn't exists",{cause:404}))
    }
    //chech category that in the brand
    if(brand.categoryId.toString()!==categoryId){
        return next(new Error("category isn't exists",{cause:404}))
    }
    //chech subcategory that in the brand
    if(brand.subCategoryId.toString()!==subCategoryId){
        return next(new Error("subcatogory isn't exists",{cause:404}))
    }
    //check authorization 
    //we allow super admin or admin that create the product
    if(req.authUser.role!==systemRoles.SUPER_ADMIN && brand.addedBy.toString()!==addedBy.toString()){
        return next(new Error("you aren't authorized to add product",{cause:401}))
    }

    //make slug string of the title to avoid white spacesand replce it with -
    const slug=slugify(title,{lower:true,replacement:'-'})
    //calculte the applied price by calcute the discount if it is exists 
    //if discount isn't exists we will make it zero by this part (discount || 0)
    const appliedPrice=basePrice-(basePrice*((discount||0)/100))

    //check if multer.array recive files from user
    if(!req.files?.length){
        return next(new Error("image is required ",{cause:404}))
    }
    //generate the product folder name 
    const folderId=generateUniqueString(5)
    //make array of images that user upload to put them in product.images
    let Images=[]
    //get the path of brand to insert the folder of product in it
    const folder=brand.Image.public_id.split(`${brand.folderId}/`)[0]
    //for loop on the images that multer recieve from user to upload it on cloudinary
    for(const file of req.files){
        const {secure_url,public_id}=await cloudinaryConnection().uploader.upload(file.path,{
            folder:folder+`${brand.folderId}`+`/Products/${folderId}`
        })
        Images.push({secure_url,public_id})
    }
    //put our product folder on req.folder to rollback on it when any error happens =>rollback-uploads.middleware.js
    req.folder=folder+`${brand.folderId}`+`/Products/${folderId}`

    const product={
        title,description,slug,folderId,basePrice,discount,appliedPrice,
        stock,addedBy,brandId,subCategoryId,categoryId,Images,specifications:JSON.parse(specifications)
    }
    //create our product
    const createdProduct=await productModel.create(product)
    //put our product document on req.saveddocument to rollback on it when any error happens =>rollback-saved.middleware.js
    req.saveddocument={model:productModel,_id:createdProduct._id}
    //return our responce
    res.status(201).json({success:true,message:"product created successfully",createdProduct})
}




export const updateProduct=async(req,res,next)=>{
    //data we need
    const {title,description,stock,basePrice,discount,specifications,oldPublicId}=req.body
    const {productId}=req.params
    const {_id}=req.authUser

    //check product
    const product=await productModel.findById(productId)
    if(!product)return next(new Error("product not found"),{cause:404})

    //check authorization 
    //we allow superadmin or admin that create the product
    if(req.authUser.role!==systemRoles.SUPER_ADMIN && product.addedBy.toString()!==_id.toString()){
        return next(new Error("you aren't authorized to add product",{cause:401}))
    }

    //update title of the product 
    if(title){
        product.title=title
        //update slug that come from title
        const slug=slugify(title,{lower:true,replacement:'-'})
        product.slug=slug
    }
    if(description)product.description=description
    if(stock)product.stock=stock
    if(specifications)product.specifications=JSON.parse(specifications)

    //update price
    //that means to use baseprice that have been updataed if it's exists or use the old one if it isn't exists
    //also use discount that have been updataed if it's exists or use the old one if it isn't exists
    const appliedPrice=(basePrice||product.basePrice)-((basePrice||product.basePrice)*((discount||product.discount)/100))
    //const appliedPrice=((basePrice||product.basePrice)*(1-((discount||product.discount)/100)))  // you can use this also
    product.appliedPrice=appliedPrice
    if(discount)product.discount=discount
    if(basePrice)product.basePrice=basePrice
    
    //update image
    if(oldPublicId){
        if(!req.file){
            return next(new Error("Image is required",{cause:404}))
        }
        //split the name of the image
        const newpublic_id=oldPublicId.split(`${product.folderId}/`)[1]
        //split the path of them image before its folder
        const imagepath=oldPublicId.split(`${product.folderId}/`)[0]
        const {secure_url}=await cloudinaryConnection().uploader.upload(req.file.path,{
            folder:imagepath+`${product.folderId}/`,
            public_id:newpublic_id
        })
        //map on images to select the image user want to update by oldPublicId
        product.Images.map((img)=>{
            if(img.public_id==oldPublicId)img.secure_url=secure_url
        })
    }
    const updateProduct=await product.save()
    res.status(200).json({success:true,message:"product update successfully",updateProduct})
}


export const getAllProducts=async(req,res,next)=>{
    const {page,size,sort,...search}=req.query
    //...search means any other variable in query will be in search 
    const features=new APIFeatures(req.query,productModel.find()).search(search)
    .sort(sort).pagination({page,size})
    const products =await features.mongooseQuery 
    
    

    res.status(200).json({success:true,data:products})
}

export const getProductWithReviews=async(req,res,next)=>{
    const {productId}=req.params

    const products =await productModel.findById(productId).populate([{path:'Reviews'}])
    
    

    res.status(200).json({success:true,data:products})
}

