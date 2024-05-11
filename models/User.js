import mongoose from 'mongoose';
import bcrypt from 'bcryptjs/dist/bcrypt.js';

const UserSchema = new mongoose.Schema(
    {
        role: {
            type: String,
            enum: ['regular', 'admin'],
            default: 'regular',
        },
        status: {
            type: String,
            enum: ['active', 'blocked', 'suspend'],
            default: 'active',
        },
        firstname: {
            type: String,
            required: [true, 'Enter your Firstname'],
        },
        lastname: {
            type: String,
            required: [true, 'Enter your Lastname'],
        },
        email: {
            type: String,
            required: [true, 'Enter your Email Address'],
            match: [
                // eslint-disable-next-line no-useless-escape
                /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i,
                'Enter a Valid Email Address',
            ],
            unique: true,
        },
        password: {
            type: String,
            required: [true, 'Enter your Password'],
            minlength: 6,
        },
        customer_reference: {
            type: String,
        },
        isEmailVerified: {
            type: Boolean,
            default: false,
        },
        isAccountVerified: {
            type: Boolean,
            default: false,
        },
        otpToken: {
            type: String,
        },
        resetPasswordToken: {
            type: String,
        },
        emailResetToken: {
            type: String,
        },
        emailResetTokenStatus: {
            type: Boolean,
        },
    },
    { timestamps: true }
);

UserSchema.methods.comparePassword = async function (userpassword) {
    const isMatched = await bcrypt.compare(userpassword, this.password);
    return isMatched;
};

const User = mongoose.model('User', UserSchema);
export default User;
