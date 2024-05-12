import crypto from 'crypto';
import request from 'request';
import User from '../models/User.js';
import { paystackApi } from '../controllers/payStack.js';
import { generateOTP } from '../utils/helpers/help.js'
import Transaction from '../models/Transaction.js';
import Order from '../models/Order.js';
const secret = process.env.PAYSTACK_SECRET_KEY;


const initializePaymentWithCard = paystackApi(request).initializePaymentWithCard;
const listBanks = paystackApi(request).listBanks;


// Start Payment with Card
export const startPaymentCard = async (req, res) => {
    try {
        const {
            user: { id },
        } = req;

        const { cart, charge } = req.body;
        if (!cart || !charge) {
            return res.status(400).json({
                status: false,
                msg: 'Please provide cart items and charge amount',
            });
        }

        const random = generateOTP();
        const ref = `farr-${random}-${id}`;
        const transaction = await Transaction.create({
            createdBy: id,
            reference: ref,
        });

        await transaction.save();

        const user = await User.findById({ _id: id });
        const email = user.email.toLowerCase();
        const amount = charge * 100;
        const data = {
            email,
            amount,
            reference: `${ref}`,
            metadata: { cart },
            channels: ['card'],
        };

        initializePaymentWithCard(data, (error, body) => {
            if (error) {
                return res
                    .status(400)
                    .json({ msg: `${error.message}`, status: false });
            }
            const response = JSON.parse(body.body);
            return res.status(200).json({
                msg: 'Initialization Successful',
                status: true,
                data: response,
            });
        });

    } catch (err) {
        res.status(500).json({
            status: false,
            msg: 'Server Error',
            error: err.message,

        });
    }
};


// Get List of Banks
export const getListOfBanks = async (req, res) => {
    try {
        const response = await listBanks();
        return res.status(200).json({
            status: true,
            data: response,
        });
    } catch (error) {
        return res.status(400).json({
            status: false,
            msg: 'Error fetching banks',
            error: error.message,
        });
    }
}

// Verify Payment
export const verifyPayment = async (req, res) => {
    // Validate event
    const hash = crypto.createHmac('sha512', secret).update(JSON.stringify(req.body)).digest('hex');
    if (hash !== req.headers['x-paystack-signature']) {
        return res.status(400).json({ message: 'Invalid signature', status: false });
    }

    // Retrieve the request's body
    const event = req.body;

    console.log(event);

    if (event && event.event === 'charge.success') {
        const user = await User.findOne({ email: event.data.customer.email });
        if (!user) {
            return res.status(400).json({ message: 'User not found, Something went wrong', status: false });
        }

        const transaction = await Transaction.findOne({ reference: event.data.reference });
        if (!transaction) {
            return res.status(400).json({ message: 'Transaction not found', status: false });
        }
        transaction.status = event.data.status;
        transaction.paystackReturn = event.data;
        await transaction.save();




        const orderRef = `#${generateOTP()}`;
        const order = await Order.create({
            order_num: orderRef,
            user: user._id,
            cart: event.data.metadata.cart.items,
            user_base: user,
            paymentMethod: 'card',
            cardinfo: event.data.authorization,
        });

        await order.save();

        console.log(event);


        console.log("Transfer successful, orders processed.");
        return res.status(200).json({ message: 'Transfer successful, orders processed.' });
    } else {
        return res.status(400).json({ message: 'Event type is not charge.success', status: false });
    }
};