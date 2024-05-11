import mongoose from "mongoose";

const connectMongoDatabase = async (url) => {
    try {
        await mongoose.connect(url);
        console.log('Farr MongoDB Connected');
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};
export default connectMongoDatabase;