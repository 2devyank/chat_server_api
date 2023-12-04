import dotenv from "dotenv"

import connectDB from "./src/db/index.js";
import { httpServer } from "./app.js";

dotenv.config({
    path:"./.env",
})
const majorNodeVersion=+process.env.NODE_VERSION?.split(".")[0]||0;
const startServer=()=>{
    httpServer.listen(process.env.PORT||8080,()=>{
      console.log("Server listening on port",process.env.PORT)
    })
}

if(majorNodeVersion>=14){
    try{
        await connectDB();
        startServer();
    }catch(err){
        console.log("Mongo db conncet error",err);
    }
}else{
connectDB()
.then(()=>{
    startServer();
})
.catch((err)=>{
    console.log("mongodb connect err ",err);
})
}