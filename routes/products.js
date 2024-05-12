
import express from 'express';
import authenticationMiddleware from '../middlewares/authentication.js';
import { getAllProducts, getProductById } from '../controllers/product.js';


const router = express.Router();

// get all products
router.get(
    '/all',
    authenticationMiddleware,
    getAllProducts
);


// get products by id
router.get(
    '/:id',
    authenticationMiddleware,
    getProductById
)

export default router;



