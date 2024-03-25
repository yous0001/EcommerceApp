import Joi from "joi";
import { generalValidationRule } from "../../utils/general.validation.rule.js";

export const createOrderSchema={
    body:Joi.object({
        product:generalValidationRule.dbId.required(),
        quantity:Joi.number().min(1).max(10).required(),
        couponCode:Joi.string().min(4),
        paymentMethod:Joi.string().valid('cash','stripe','paymob').required(),
        phoneNumbers:Joi.array().required(),
        address:Joi.string().required(),
        country:Joi.string(),
        postalCode:Joi.string(),
        city:Joi.string()
    })

}
export const makeOrderByCartSchema={
    body:Joi.object({
        couponCode:Joi.string().min(4),
        paymentMethod:Joi.string().valid('cash','stripe','paymob').required(),
        phoneNumbers:Joi.array().required(),
        address:Joi.string().required(),
        country:Joi.string(),
        postalCode:Joi.string(),
        city:Joi.string()
    })
}