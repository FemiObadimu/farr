
import express from 'express';
import authenticationMiddleware from '../middlewares/authentication.js';
import { verifyPayment, startPaymentCard, getListOfBanks } from '../controllers/payment.js';


const router = express.Router();

// get list of banks
router.get(
    '/all/banks',
    authenticationMiddleware,
    getListOfBanks
);

//initialize Payment with card
router.post('/initialize', authenticationMiddleware, startPaymentCard);

//Verify Payment
router.post('/webhook/verify', verifyPayment);

export default router;
