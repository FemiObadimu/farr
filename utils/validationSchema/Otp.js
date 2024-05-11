import Joi from "joi";
const OtpSchema = Joi.object({
    otp: Joi.string().min(6).required(),
});

export default OtpSchema