import express from 'express';
import authenticationMiddleware from '../middlewares/authentication.js';
import { getAllTransactions, getTransactionById } from '../controllers/transaction.js';

const router = express.Router();


// Get all transactions
router.get('/', authenticationMiddleware, getAllTransactions);

// Get transaction by ID
router.get('/:id', authenticationMiddleware, getTransactionById);

export default router;
