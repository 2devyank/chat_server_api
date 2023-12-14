
import Mailgen from "mailgen"
import nodemailer from "nodemailer"
 const sendEmail =async(options)=>{
    const mailgenerator=new Mailgen({
        theme:'default',
        product:{
            name:'FreeApi',
            link:"https://freeapi.app"
        }
    })

    const emailBody=mailgenerator.generate(options.mail)
    const emailText=mailgenerator.generatePlaintext(options.mail)

    const transport=nodemailer.createTransport({
        host:"smtp.gmail.com",
        port:465,
        auth:{
            user:"devyanknagpal2002@gmail.com",
            pass:process.env.MAILTRAP_SMTP_PASS,
        }
    })
    const mail={
        from:"www.chat-app.com",
        to:options.email,
        subject:options.subject,
        text:emailText,
        html:emailBody,
    }
    try{
await transport.sendMail(mail);
    }catch(err){
        console.log(err);
    }

 }

 const mailgencontent=(username,link)=>{
    return{
        body:{
            name:username,
            intro:'welcome to chat app platform',
            action:{
                instructions:'To get started, click here',
                button:{
                    color:'#22BC66',
                    text:'Confirm your account ',
                    link:link,
                }
            },
            outro:'Need help or have question?just reply to this mail we would love to help'
        }
    }
 }
 export {
    sendEmail,
    mailgencontent
 }