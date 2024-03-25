import jwt  from "jsonwebtoken"
import userModel from "../../../DB/Models/user.model.js"
import bcrypt from "bcrypt"
import sendmailservice from "../services/send-email.service.js"
import generateUniqueString from "../../utils/generate-Unique-String.js"
import { configDotenv } from "dotenv"


export const signUp=async(req,res,next)=>{
    const {username,email,password,phoneNumbers,addresses,role,age}=req.body
    const isEmailExists=await userModel.findOne({email})
    if(isEmailExists){
        return res.status(409).json({
            message:"email is already exists please try another email"
        })
    }
    const usertoken=jwt.sign({email},process.env.JWT_SECRET_VERFICATION,{expiresIn:'1d'})
    const isEmailsent=await sendmailservice({
        to:email,
        subject:"please verify your email",
        message:`<h1>please verify your email and click on thsi link</h1>
        <a href="${req.protocol}://${req.headers.host}/auth/verify-email?token=${usertoken}">Verify Email</a>
        `
    })
    if(!isEmailsent){
        return next(new Error("failed to send verification email",{cause:400 }))
    }
    const hashpassword=bcrypt.hashSync(password,+process.env.SALT_ROUNDS)
    const newUser =await userModel.create({
        username,email,password:hashpassword,phoneNumbers,addresses,role,age
    })
    return res.status(201).json({
        message:"user created succefully",
        newUser
    })

}


export const verifyEmail=async(req,res,next)=>{
    const {token}=req.query
    const decodeddata=await jwt.verify(token,process.env.JWT_SECRET_VERFICATION)
    const user =await userModel.findOneAndUpdate({email:decodeddata.email,isEmailVerified:false},{isEmailVerified:true},{new:true})
    if(!user){
        return next(new Error("user not found",{cause:404}))
    }
    res.status(200).json({
        success:true,
        message:"email verified succefully",
        data:user
    })
}


export const signIn=async(req,res,next)=>{
    const {email,password}=req.body
    const user=await userModel.findOne({email,isEmailVerified:true})
    if(!user){
        return next(new Error("invalid login",{cause:404}))
    }
    const isPasswordCorrect=bcrypt.compareSync(password,user.password)
    if(!isPasswordCorrect){
        return next(new Error("invalid login",{cause:404}))
    }
    const token=jwt.sign({email,id:user._id,isLoggedIn:true},process.env.JWT_SECRET_LOGIN,{expiresIn:"1d"})
    user.isLoggedIn=true
    await user.save()
    res.status(200).json({
        success:true,
        message:"user logged in succefully",
        data:{
            token
        }
    })
} 

export const updateProfileUser=async(req,res,next)=>{
    const {username,email,phoneNumbers,addresses,role,age}=req.body
    const {_id}=req.authUser
    const user=await userModel.findById(_id)
    //change email if user wants
    if(email){
        const isEmailExists=await userModel.findOne({email})
        if(isEmailExists){
            return res.status(409).json({
                message:"email is already exists please try another email"
            })
        }
        const usertoken=jwt.sign({email},process.env.JWT_SECRET_VERFICATION,{expiresIn:'1d'})
        const isEmailsent=await sendmailservice({
            to:email,
            subject:"please verify your email",
            message:`<h1>please verify your email and click on thsi link</h1>
            <a href="${req.protocol}://${req.headers.host}/auth/verify-email?token=${usertoken}">Verify Email</a>
            `
        })
        if(!isEmailsent){
            return next(new Error("failed to send verification email",{cause:400 }))
        }
        user.email=email;
    }
    if(username) user.username=username
    if(phoneNumbers)user.phoneNumbers=phoneNumbers
    if(addresses)user.addresses=addresses
    if(role)user.role=role
    if(age)user.age=age
    await user.save()
    return res.status(200).json({
        message:"user updated succefully",
        user
    })
}

export const deleteProfileUser=async(req,res,next)=>{
    const {_id}=req.authUser
    const deleteduser=await userModel.findByIdAndDelete(_id)
    if(!deleteduser) return res.status(400).json({message:"deleted failed"})
    res.status(200).json({message:"user deleted succefully"})
}

export const getUserData=async(req,res,next)=>{
    const {_id}=req.authUser
    const user=await userModel.findByIdAndDelete(_id)
    if(!user) return res.status(404).json({message:"user not found"})
    res.status(200).json({message:"done",user})
}


export const forgetPassword=async(req,res,next)=>{
    const {email} = req.body
    const code =generateUniqueString(6)
    await userModel.updateOne({email},{code})

    const isEmailsent=await sendmailservice({
        to:email,
        subject:"forget password",
        message:`<h1>don't send this code to any one </h1>
            <h2 style="color:red;text-align:center">${code}</h2>
        `
    })
    if(!isEmailsent){
        return next(new Error("failed to send verification email",{cause:400 }))
    }

    return res.status(200).json({message:"done"})
}

export const resetPassword=async(req,res,next)=>{
    const {code,newPassword}=req.body
    const {email}=req.params

    const isUserExists=await userModel.findOne({email,code})
    
    if(!isUserExists)return next(new Error("User not found or invalid code",{cause:404}))

    const hashedPassword=bcrypt.hashSync(newPassword,+process.env.SALT_ROUNDS)
    
    await userModel.updateOne({email},{password:hashedPassword},{new:true})

    return res.status(200).json({message:"password updated successfully"})
}


//that is what in video but i prefer to use my api put i learn that and i will use it in funture
export const forgetPasswordBylinkCode=async(req,res,next)=>{
    const {email}=req.body
    const user =await userModel.findOne({email})
    if(!user)return next(new Error("invalid email"),{cause:404})//404 because we can't find user with that email(user not found)
    
    const code =generateUniqueString(6)
    const hashedCode=bcrypt.hashSync(code,+process.env.SALT_ROUNDS)
    
    const token=jwt.sign({email,code:hashedCode},process.env.JWT_SECRET_LOGIN,{expiresIn:"1d"})
    
    const resetPasswordLink=`${req.protocol}://${req.headers.host}/auth/reset/${token}`
    const isEmailsent=sendmailservice({
        to:email,
        subject:"reset password",
        //sorry i don't know about emailtemplete
        message:`<h1>please verify your email and click on thsi link</h1>
        <a href=${resetPasswordLink}>Verify Email</a>
        `
    })
    if(!isEmailsent){
        return next(new Error("fail to send reset password email",{cause:400}))
    }

    const userUpdated=await userModel.updateOne({email},{code},{new:true})
    res.status(200).json({message:"Done",userUpdated})

}
export const resetPasswordBylinkCode=async(req,res,next)=>{
    const {token}=req.params
    const {newPassword}=req.body
    const decodedData = jwt.verify(token, process.env.JWT_SECRET_LOGIN)

    if (!decodedData || !decodedData.email) return next(new Error('invalid token payload', { cause: 400 }))


    const user =await userModel.findOne({email:decodedData.email,code:decodedData.code})
    if(!user)return next(new Error("invalid email"),{cause:404})//404 because we can't find user with that email(user not found)

    const hashedPassword=bcrypt.hashSync(newPassword,+process.env.SALT_ROUNDS)
    user.password=hashedPassword
    user.code=null
    const resetedPassword=await user.save()
    res.status(200).json({message:"Done",resetedPassword})

}


export const updatePassword=async(req,res,next)=>{
    const {_id}=req.authUser
    const {currentPassword,newPassword}=req.body
    //check user exists
    const isUserExists=await userModel.findById(_id)
    if(!isUserExists)return next(new Error("user not found",{cause:404}))
    //check password
    const isPasswordCorrect=bcrypt.compareSync(currentPassword,isUserExists.password)
    if(!isPasswordCorrect)return next(new Error("invalid password",{cause:400}))
    //hash new password to insert it
    const hashedPassword=bcrypt.hashSync(newPassword,+process.env.SALT_ROUNDS)
    await userModel.updateOne({_id},{password:hashedPassword,code:null},{new:true}) 
    return res.status(200).json({message:"password updated successfully"})
}

export const refreshToken=async(req,res,next)=>{
    //this is arest api that frontend can use manually to refresh token before expiration but if token has expired he should log in 
    const {_id}=req.authUser
    const user =await userModel.findById(_id)
    const newToken=jwt.sign({email:user.email,id:_id,isLoggedIn:true},process.env.JWT_SECRET_LOGIN,{expiresIn:"1d"})
    
    res.status(200).json({message:"new token has been created",newToken})
}