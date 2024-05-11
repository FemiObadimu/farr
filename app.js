import 'dotenv/config.js';
import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import listEndpoints from 'list_end_points';
import helmet from 'helmet';
import connectMongoDatabase from './database/farrDB.js';


const app = express()
app.use(express.json())
app.use(helmet())
app.use(cors())


app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
});

app.get('/', (req, res) => {
    res.send('Farr Server Success!');
});

const PORT = process.env.PORT
listEndpoints.default(app)
const start = async () => {
    try {
        await connectMongoDatabase(process.env.MONGODBURL);
        app.listen(PORT, () => console.log(`Farr Server Listening on Port ${PORT}`));
    } catch (error) {
        console.log(error);
    }
};


start();