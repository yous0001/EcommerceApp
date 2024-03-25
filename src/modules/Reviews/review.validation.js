import Joi from "joi";


export const addReviewSchema={
    body:Joi.object({
        reviewRate:Joi.number().min(1).max(5).required(),
        reviewComment:Joi.string().max(250).optional()
    })
}