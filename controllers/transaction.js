import Transaction from '../models/Transaction.js'


// Get all transactions
export const getAllTransactions = async (req, res) => {
    try {
        // Pagination parameters
        let { page, limit, status } = req.query;
        page = page ? parseInt(page, 10) : 1; // default page number is 1
        limit = limit ? parseInt(limit, 10) : 10; // default limit is 10
        const skip = (page - 1) * limit; // calculate the number of documents to skip

        // Build the query based on the status filter
        let query = { 'createdBy': req.user.id };

        if (status) {
            query.status = { $in: status.split(',') }; // assuming status can be a comma-separated list for multiple statuses
        }

        // Get total count for pagination
        const totalCount = await Transaction.countDocuments(query);

        // Execute query with pagination
        const transactions = await Transaction.find(query).skip(skip).limit(limit);

        if (!transactions.length) {
            return res.status(200).json({
                message: 'No Transaction Found',
                status: true,
                data: []
            });
        }

        // Send paginated results
        res.status(200).json({
            message: 'Transactions fetched successfully',
            status: true,
            data: {
                pagination: {
                    total: totalCount,
                    page: page,
                    limit: limit,
                    totalPages: Math.ceil(totalCount / limit)
                },
                transactions,
            },
        });

    } catch (err) {
        console.log(err);
        return res.status(500).json({
            msg: 'Server Error',
            status: false,
        });
    }
};



// Get transaction by ID
export const getTransactionById = async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id);
        if (!transaction) {
            return res.status(200).json({
                message: 'No Transaction Found',
                status: true,
                data: []
            });
        }

        res.status(200).json({
            message: 'Transaction fetched successfully',
            status: true,
            data: {
                transaction
            }
        });
    } catch (err) {
        res.status(500).json({
            message: err.message,
            status: false,
        });
    }
};