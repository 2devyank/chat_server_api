// const express=require("express")
import express  from "express";
import {createServer} from "http";
import cors from "cors";
import cookieParser from "cookie-parser";
import  authrouter from "./routes/app/auth/auth-routes.js"
const app=express();

const httpServer=createServer(app);

app.use(cors(
    {
        origin:process.env.CORS_ORIGIN,
        credentials:true, 
    }
))

app.use(express.json({limit:"16kb"}));
app.use(express.urlencoded({extended:true,limit:"16kb"}));
app.use(express.static("public"));
app.use(cookieParser());


app.use("/chatapp",authrouter)
app.post("/fet",(req,res)=>{
    res.send("message got")
})

export {httpServer};