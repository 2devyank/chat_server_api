// const express=require("express")
import express  from "express";
import {createServer} from "http";
import cors from "cors";
import cookieParser from "cookie-parser";
import  authrouter from "./routes/app/auth/auth-routes.js"
import  chatrouter from "./routes/app/chat-app/chat-route.js"
import bodyParser from "body-parser";
import { Server } from "socket.io";
import { initializeSocketIO } from "./src/socket/index.js";
const app=express();

const httpServer=createServer(app);
const io=new Server(httpServer,{
    pingTimeout:60000,
    cors:{
        origin:"http://localhost:5173",
        credentials:true, 
    }
})
app.set("io",io)
// app.use(bodyParser.json())
// app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors(
    {
        origin:"http://localhost:5173",
        credentials:true, 
    }
))
// app.use(cors())

app.use(express.json({limit:"16kb"}));
app.use(express.urlencoded({extended:true,limit:"16kb"}));
app.use(express.static("public"));
app.use(cookieParser());


app.use("/chatapp",authrouter)
app.use("/chatapp",chatrouter)
app.post("/fet",(req,res)=>{
    res.send("message got")
})

initializeSocketIO(io);
export {httpServer};