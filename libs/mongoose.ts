import mongoose from 'mongoose';

let isConnected = false; // Variable to track connection status; set to false

export const connectToDB = async () => {
    mongoose.set('strictQuery', true);

    if (!process.env.MONGODB_URI) return 'MONGODB_URI is not set';

    if (isConnected) return console.log('=> Using existing db connection')

    try {
        await mongoose.connect(process.env.MONGODB_URI)
        isConnected = true
        console.log('MongoDB connection established')
    } catch (error) {
        console.log('error connecting to MongoDB', error)
    }
}