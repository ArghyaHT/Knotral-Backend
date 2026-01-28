import mongoose from "mongoose";
import dotenv from 'dotenv';

dotenv.config();


const connectDB = async() =>{
    try{
        const conn = await mongoose.connect(process.env.MONGODB_URI)

        // const conn = await mongoose.connect("mongodb+srv://KnotralTrainingDemo:EvZtK9cRf77Ybvmh@knotraltrainingdemo.clxzhxw.mongodb.net/")

        console.log(`MongoDB is successfully connected: ${conn.connection.host}`)
    }
    catch(error){
        console.log(error)
    }
}
export default connectDB;