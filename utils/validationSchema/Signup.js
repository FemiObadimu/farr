import Joi from "joi";
const registerSchema = Joi.object({
    firstname: Joi.string().required().min(3).max(25),
    lastname: Joi.string().required().min(3).max(25),
    email: Joi.string().trim().email({ tlds: false }).required(),
    password: Joi.string().min(6).required(),
});

export default registerSchema;