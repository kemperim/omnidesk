const nodemailer = require('nodemailer');
const prisma = require('../prisma');
const aiService = require('./aiService');
const ticketService = require('./ticketService');

const createTransport = (config)=>{
    return nodemailer.createTransport({
        host:config.smtp_host,
        port:config.smtp_host,
        secure:config.smtp_host === 465,
        auth:{
            user:config.login,
            pass:config.password
        }
    });
}

exports.sendMessage = async(channel,email,text,ticketId) =>{
    const transporter = createTransport(channel.config);
    await transporter.sendMail({
        from:`"Omnidesk" ${channel.config.login}`,
        to:email,
        subject:"Напоминание об оплате",
        text
    });
  
}