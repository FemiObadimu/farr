import express from 'express';
import authenticationMiddleware from '../middlewares/authentication.js';
import { getAllOrders, getOrderById } from '../controllers/orders.js';
const router = express.Router();
// Get all Orders
router.get('/', authenticationMiddleware, getAllOrders);

// Get Orders by ID
router.get('/:id', authenticationMiddleware, getOrderById)

export default router;
