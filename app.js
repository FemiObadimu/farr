import 'dotenv/config.js';
import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import listEndpoints from 'list_end_points';
import helmet from 'helmet';
import morgan from 'morgan';
import connectMongoDatabase from './database/farrDB.js';
import notFound from './errorHandlers/notFound.js';
import errorHandler from './errorHandlers/errorHandler.js';
import authRouter from './routes/authorization.js'



const app = express()
// app.enable('trust proxy');
app.set('trust proxy', 1);
// We are using this for the express-rate-limit middleware
app.use(express.json({ limit: '10mb' }));
app.use(helmet())
app.use(cors())
app.use(morgan('combined'));
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
});


// Routes
app.get('/', (req, res) => {
    res.send('Farr Server Success!');
});

app.use('/api/v1/farr/auth', authRouter);



// Routes for handling Errors
app.use(notFound);
app.use(errorHandler);

// Use express's default error handling middleware
app.use((err, req, res, next) => {
    if (res.headersSent) return next(err);
    res.status(400).json({ message: err.message });
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