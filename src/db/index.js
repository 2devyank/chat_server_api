import mongoose from "mongoose";


export let dbInstance=undefined;
const connectDB=async()=>{
    try{
const connectionInstance=await mongoose.connect(
    `${process.env.MONGODB_URI}`
);
dbInstance=connectionInstance;
console.log(`Mongodb connected! Db host:${connectionInstance.connection.host}\n`)
    }catch(err){
        console.log("Mongodb connection error",err);
        process.exit(1);
    }
}
export default connectDB;