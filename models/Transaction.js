import mongoose from "mongoose";

const TransactionSchema = mongoose.Schema(
    {
        date: {
            type: Date,
            default: Date.now,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        reference: {
            type: String,
            required: true,
            unique: true,
        },
        status: {
            type: String,
            enum: ['pending', 'failed', 'success', 'reversed', 'queued', 'processing,  abandoned', 'ongoing'],
            default: 'pending',
        },
        paystackReturn: {
            type: Object,
            required: false,
        }
    },
    { timestamps: true }
);

const Transaction = mongoose.model('Transaction', TransactionSchema);
export default Transaction;