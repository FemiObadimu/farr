import mongoose from "mongoose";
const orderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        order_num: {
            type: String,
            required: false,
        },
        invoice: {
            type: Number,
            required: false,
        },
        cart: [{}],
        user_base: {
            type: Object,
            required: false,
        },
        name: {
            type: String,
            required: false,
        },
        address: {
            type: String,
            required: false,
        },
        email: {
            type: String,
            required: false,
        },
        contact: {
            type: String,
            required: false,
        },
        city: {
            type: String,
            required: false,
        },
        country: {
            type: String,
            required: false,
        },
        zipCode: {
            type: String,
            required: false,
        },
        subTotal: {
            type: Number,
            required: false,
        },
        shippingCost: {
            type: Number,
            required: false,
        },
        discount: {
            type: Number,
            required: false,
            default: 0,
        },
        total: {
            type: Number,
            required: false,
        },
        shippingOption: {
            type: String,
            required: false,
        },
        paymentMethod: {
            type: String,
            required: false,
        },
        cardInfo: {
            type: Object,
            required: false,
        },
        status: {
            type: String,
            enum: ['Pending', 'VendorAccepted', 'VendorDeclined', 'Ongoing', 'RiderAccepted', 'RiderDeclined', 'RiderArrivedAtVendors', 'Delivered', 'Cancelled', 'Completed'],
            default: 'Pending',
        },
        accepted_at: {
            type: Date,
            required: false,
        },
        prepared_at: {
            type: Date,
            required: false,
        },
        pickedup_at: {
            type: Date,
            required: false,
        },
        delivered_at: {
            type: Date,
            required: false,
        },
    },
    {
        timestamps: true,
    }
);

const Order = mongoose.model('Order', orderSchema);

export default Order;
