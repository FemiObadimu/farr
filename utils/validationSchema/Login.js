import Joi from "joi";

const loginSchema = Joi.object({
    email: Joi.string().trim().email({ tlds: false }).required(),
    password: Joi.string().min(6).required(),
});

export default loginSchema;