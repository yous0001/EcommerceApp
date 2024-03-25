import Joi from "joi";
import { systemRoles } from "../../utils/system-roles.js";

export const signupSchema ={
    body:Joi.object({
        username:Joi.string().required().min(5).alphanum(),
        email:Joi.string().email({minDomainSegments:1}).required(),
        password:Joi.string().required().min(4),
        phoneNumbers:Joi.array().required(),
        addresses:Joi.array().required(),
        role:Joi.string().valid(systemRoles.ADMIN,systemRoles.DELIVERY,systemRoles.SUPER_ADMIN,systemRoles.USER).required(),
        age:Joi.number().min(12).max(150)
    })
}
export const signinSchema ={
    body:Joi.object({
        email:Joi.string().email({minDomainSegments:1}).required(),
        password:Joi.string().required().min(4)
    })
}
export const updateProfileUserSchema ={
    body:Joi.object({
        username:Joi.string().min(5).alphanum(),
        email:Joi.string().email({minDomainSegments:1}),
        phoneNumbers:Joi.array(),
        addresses:Joi.array(),
        role:Joi.string().valid(systemRoles.ADMIN,systemRoles.DELIVERY,systemRoles.SUPER_ADMIN,systemRoles.USER),
        age:Joi.number().min(12).max(150)
    })
}
