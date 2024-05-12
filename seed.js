import 'dotenv/config.js';
import connectMongoDatabase from './database/farrDB.js  ';
import { products } from './utils/data/products.js';
import Product from './models/Product.js'


const importData = async () => {
    try {
        await connectMongoDatabase(process.env.MONGODBURL)
        await Product.deleteMany();
        await Product.insertMany(products);
        console.log('Data Inserted Successfully!');
        process.exit();
    } catch (error) {
        console.log('error', error);
        process.exit(1);
    }
};

importData();
