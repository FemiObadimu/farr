import Product from '../models/Product.js'

// List all products
export const getAllProducts = async (req, res) => {
    const { title, category, price, page, limit } = req.query;

    const queryObject = {};

    let sortPrice;

    if (title) {
        queryObject.$or = [{ title: { $regex: `${title}`, $options: 'i' } }];
    }

    if (price === 'Low') {
        sortPrice = 1;
    } else {
        sortPrice = -1;
    }

    if (category) {
        // queryObject.category = { $regex: category, $options: 'i' };
        queryObject.parent = { $regex: category, $options: 'i' };
    }

    const pages = Number(page);
    const limits = Number(limit);
    const skip = (pages - 1) * limits;

    try {
        const totalDoc = await Product.countDocuments(queryObject);
        const products = await Product.find(queryObject)
            .sort(price ? { price: sortPrice } : { _id: -1 })
            .skip(skip)
            .limit(limits);

        res.status(200).json({
            message: 'Products Fetched Successfully',
            status: true,
            data: {
                products,
                totalDoc,
                limits,
                pages,
            }

        });
    } catch (err) {
        res.status(500).json({
            message: err.message,
            status: false
        });
    }
};

export const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        res.status(200).json({
            message: 'Product Fetched Successfully',
            status: true,
            data: product
        });

    } catch (err) {
        res.status(500).send({
            message: err.message,
            status: false,
        });
    }
};