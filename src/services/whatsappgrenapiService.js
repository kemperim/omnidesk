
const prisma = require('../prisma');
const aiService = require('./aiService');
const ticketService = require('./ticketService');


exports.sendMessage = async(channel,phone,text) =>{
    const { instance_id, api_token,api_url } = channel.config;
    const baseUrl = api_url;
    const url = `${baseUrl}/waInstance${instance_id}/sendMessage/${api_token}`;
    const response = await fetch(url,{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
            chatId: `${phone}@c.us`,
            message: text
        })
    });
    const data = await response.json()
    return data;
}   

exports.handleWebhook = async (body, channel) =>{
    try{
        const {typeWebhook, messageData, senderData} = body;
        if (typeWebhook!=='incomingMessageReceived') return;
        if (!messageData?.textMessageData?.textMessage) return;

        const text = messageData.textMessageData.textMessage;
        const phone = senderData.sender.replace('@c.us', '');
        const name = senderData.senderName || 'WhatsApp пользователь';
        console.log(`Сообщение от ${phone}: ${text}`);

        let client = await prisma.client.findFirst({
            where:{whatsappId:phone, orgId:channel.orgId}
        });
        if(!client){
            client=await prisma.client.create({
                data:{
                    name,
                    email:`whatsapp_${phone}@omnidesk.kz`,
                    phone,
                    whatsappId:phone,
                    orgId:channel.orgId
                }
            });
            console.log('Новый клиент создан: ', client.name);
        }

        let aiResult = null;
            try {
                aiResult = await aiService.classifyTicket(text, text);
            } catch (error) {
                console.error('AI ошибка:', error.message);
              }
        
              
            const ticket = await ticketService.findOrCreateTicket({
                clientId: client.id,
                orgId: channel.orgId,
                channel: 'whatsapp',
                subject: text.substring(0, 100),
                message: text,
                aiResult
        });
    }catch(error){
        console.error('Ошибка обработки WhatsApp webhook:', error.message);
    }
}