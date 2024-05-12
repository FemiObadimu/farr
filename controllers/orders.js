import Order from '../models/Order.js'

export const getAllOrders = async (req, res) => {
    console.log('hello');
    const { contact, status, page, limit, day } = req.query;

    console.log(req.query);

    // day count
    let date = new Date();
    const today = date.toString();
    date.setDate(date.getDate() - Number(day));
    const dateTime = date.toString();

    const beforeToday = new Date();
    beforeToday.setDate(beforeToday.getDate() - 1);

    const queryObject = {};

    if (contact) {
        queryObject.contact = { $regex: `${contact}`, $options: 'i' };
    }

    if (day) {
        queryObject.createdAt = { $gte: dateTime, $lte: today };
    }

    if (status) {
        queryObject.status = { $regex: `${status}`, $options: 'i' };
    }

    const pages = Number(page) || 1;
    const limits = Number(limit) || 8;
    const skip = (pages - 1) * limits;

    try {
        // total orders count
        const totalDoc = await Order.countDocuments(queryObject);
        // today order amount

        // query for orders
        const orders = await Order.find(queryObject)
            .sort({ _id: -1 })
            .skip(skip)
            .limit(limits);

        res.status(200).json({
            message: 'Orders Fetched Successfully',
            status: true,
            data: {
                orders,
                limits,
                pages,
                totalDoc,
            }
        });

    } catch (err) {
        console.log(err.message);
        res.status(500).json({
            message: err.message,
            status: false
        });
    }
};

export const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        res.status(200).json({
            message: 'Order Fetched Successfully',
            status: true,
            data: {
                order
            }
        });

    } catch (err) {
        res.status(500).json({
            message: err.message,
            status: false
        });
    }
};